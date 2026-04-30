/**
 * Bridges a `@solana/wallet-adapter-react` wallet adapter (`signTransaction`
 * over `@solana/web3.js` `VersionedTransaction`) into a `@solana/kit`
 * `TransactionPartialSigner` so the AR.IO SDK's Solana writeable instances
 * can drive browser wallets like Phantom, Solflare, and Backpack.
 *
 * Why a *partial* signer (not a *modifying* signer)?
 * - Wallet adapters do not modify our transactions — they just sign and
 *   return them. `TransactionPartialSigner` is the correct kit-side shape
 *   and lets kit run multiple signers in parallel.
 * - Multi-sig flows (e.g. `spawnSolanaANT` which also signs with a fresh
 *   mint keypair) keep working: kit collects partial signatures from each
 *   signer independently, then merges them.
 *
 * Implementation note:
 * - We always set the wallet as the fee payer in the SDK, so its signature
 *   lives at slot 0 of `VersionedTransaction.signatures` after signing.
 *   That's what we lift back into the kit `SignatureDictionary`.
 * - For multi-sig spawn-style flows, kit reconstructs the final transaction
 *   from each partial signer's contribution, so the mint keypair signature
 *   produced by kit's own pipeline is preserved.
 */
import {
  type Address,
  type Transaction as KitTransaction,
  type SignatureBytes,
  type TransactionPartialSigner,
  address,
} from '@solana/kit';
import { VersionedMessage, VersionedTransaction } from '@solana/web3.js';

export interface WalletAdapterLike {
  publicKey: { toBase58(): string } | null;
  signTransaction?: <T extends VersionedTransaction>(tx: T) => Promise<T>;
}

export class WalletAdapterSignerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WalletAdapterSignerError';
  }
}

/**
 * Wrap a connected wallet-adapter wallet into a kit `TransactionPartialSigner`
 * that the SDK can drop into `setTransactionMessageFeePayerSigner`.
 *
 * Throws synchronously if the wallet is not currently connected or doesn't
 * expose `signTransaction` — the resulting signer is only safe to use once
 * the user has approved a connection.
 */
export function makeWalletAdapterSigner(
  wallet: WalletAdapterLike,
): TransactionPartialSigner {
  if (!wallet.publicKey) {
    throw new WalletAdapterSignerError(
      'Solana wallet is not connected (publicKey is null).',
    );
  }
  if (typeof wallet.signTransaction !== 'function') {
    throw new WalletAdapterSignerError(
      'Connected Solana wallet does not support signTransaction.',
    );
  }

  const walletAddress = address(wallet.publicKey.toBase58()) as Address;
  const signTransaction = wallet.signTransaction.bind(wallet);

  return {
    address: walletAddress,
    async signTransactions(transactions: readonly KitTransaction[]) {
      return Promise.all(
        transactions.map(async (tx) => {
          // kit's Transaction stores the *compiled* message bytes (the exact
          // payload that will go on the wire). We rebuild a web3.js
          // VersionedTransaction off those bytes, hand it to the wallet, and
          // lift the wallet's signature back into a kit SignatureDictionary.
          //
          // kit v6 brands `messageBytes` as a `ReadonlyUint8Array` with a
          // nominal type, so the `Uint8Array` constructor overloads don't
          // accept it directly. The runtime value is a real Uint8Array.
          const messageBytes = new Uint8Array(
            tx.messageBytes as unknown as Uint8Array,
          );
          const message = VersionedMessage.deserialize(messageBytes);
          const v3tx = new VersionedTransaction(message);

          // Preserve any signatures kit may have already attached (e.g.
          // when a paired keypair signer signed in parallel). Wallets
          // typically only modify their own slot, but copying first
          // protects against adapters that re-serialize from scratch.
          const staticAccountKeys = message.staticAccountKeys;
          const numRequired = message.header.numRequiredSignatures;
          for (let i = 0; i < numRequired; i++) {
            const accountAddress = staticAccountKeys[i].toBase58() as string;
            const existingSig = (
              tx.signatures as Record<string, Uint8Array | null>
            )[accountAddress];
            if (existingSig) {
              v3tx.signatures[i] = existingSig;
            }
          }

          // DIAGNOSTIC: check whether web3.js's reserialize round-trips
          // kit's canonical messageBytes. Most v0 messages do, but compact-
          // u16 / account ordering edge cases can cause divergence — when
          // they do, the wallet signs `Y = web3.serialize(web3.deserialize(X))`
          // while the validator verifies against kit's `X`, producing
          // "Transaction did not pass signature verification". Logging both
          // makes that immediately visible.
          const reserialized = v3tx.message.serialize();
          const matchesKit =
            reserialized.length === messageBytes.length &&
            reserialized.every((b, i) => b === messageBytes[i]);
          if (!matchesKit) {
            console.warn(
              '[wallet-bridge] web3.js reserialize ≠ kit messageBytes — wallet sig will not verify on the wire.',
              {
                kitBytes: bufToHex(messageBytes),
                web3Bytes: bufToHex(reserialized),
                kitLen: messageBytes.length,
                web3Len: reserialized.length,
              },
            );
          }

          const signed = await signTransaction(v3tx);

          // DIAGNOSTIC: did the wallet modify the transaction (e.g. Phantom
          // injecting a priority-fee instruction)? If so the message bytes
          // we sent and what the wallet signed-against will differ, and
          // kit's mint signer's sig (over the *original* bytes) will fail
          // even if ours doesn't.
          const signedMessageBytes = signed.message.serialize();
          const walletKeptMessage =
            signedMessageBytes.length === messageBytes.length &&
            signedMessageBytes.every((b, i) => b === messageBytes[i]);
          if (!walletKeptMessage) {
            console.warn(
              "[wallet-bridge] wallet returned a modified transaction (likely auto-priority-fee or extra ix). Mint signer's signature will not verify against the new message.",
              {
                originalLen: messageBytes.length,
                signedLen: signedMessageBytes.length,
                originalBytes: bufToHex(messageBytes),
                signedBytes: bufToHex(signedMessageBytes),
              },
            );
          }

          // The wallet adapter signs on behalf of `wallet.publicKey`, which
          // we've ensured is the fee payer (slot 0). Pull just our
          // signature out and let kit merge it with whatever the other
          // signers produced.
          const sig = signed.signatures[0];
          if (!sig || sig.every((b) => b === 0)) {
            throw new WalletAdapterSignerError(
              'Wallet adapter returned an unsigned transaction (signature slot 0 is empty).',
            );
          }
          return {
            [walletAddress]: sig as SignatureBytes,
          } as Record<Address, SignatureBytes>;
        }),
      );
    },
  };
}

function bufToHex(buf: Uint8Array): string {
  return Array.from(buf, (b) => b.toString(16).padStart(2, '0')).join('');
}
