/**
 * Bridges a `@solana/wallet-adapter-react` wallet adapter (`signTransaction`
 * over `@solana/web3.js` `VersionedTransaction`) into a `@solana/kit`
 * `TransactionModifyingSigner` so the AR.IO SDK's Solana writeable instances
 * can drive browser wallets like Phantom, Solflare, and Backpack.
 *
 * Why a *modifying* signer (not a *partial* signer)?
 * - Phantom (and others) REWRITE the transaction before signing on real
 *   origins — e.g. injecting their own priority-fee / compute-budget
 *   instructions (observed on ngrok/prod, not on localhost). A partial signer
 *   returns only a signature for kit's ORIGINAL message, so kit would send the
 *   original bytes with a signature taken over the wallet's rewritten bytes →
 *   "Transaction did not pass signature verification" (#7050012) / preflight
 *   #-32002. Pinning a non-zero fee does NOT stop the rewrite.
 * - As a modifying signer we return the wallet's *rewritten* message together
 *   with its signature, so the bytes signed == the bytes sent.
 * - Multi-sig flows (e.g. `spawnSolanaANT` + a fresh mint keypair) still work:
 *   kit runs modifying signers FIRST, so the mint-keypair partial signer signs
 *   the already-rewritten message and both signatures verify.
 *
 * Implementation note: the wallet is always the fee payer (signature slot 0).
 * We deserialize kit's compiled message, let the wallet sign (and possibly
 * rewrite) it, then rebuild a kit `Transaction` from the wallet's returned
 * message bytes + signatures.
 */
import {
  type Address,
  type Transaction as KitTransaction,
  type SignatureBytes,
  type TransactionModifyingSigner,
  type TransactionWithLifetime,
  type TransactionWithinSizeLimit,
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
): TransactionModifyingSigner {
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
    async modifyAndSignTransactions(
      transactions: readonly KitTransaction[],
    ): Promise<
      readonly (KitTransaction &
        TransactionWithinSizeLimit &
        TransactionWithLifetime)[]
    > {
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

          // DIAGNOSTIC: did the wallet rewrite the transaction (e.g. Phantom
          // injecting a priority-fee instruction or a Lighthouse guard on real
          // origins)? This is EXPECTED and handled — as a modifying signer we
          // return the wallet's rewritten message + signature below, so the
          // bytes signed == the bytes sent. Logged at debug for visibility.
          const signedMessageBytes = signed.message.serialize();
          const walletKeptMessage =
            signedMessageBytes.length === messageBytes.length &&
            signedMessageBytes.every((b, i) => b === messageBytes[i]);
          if (!walletKeptMessage) {
            console.debug(
              '[wallet-bridge] wallet rewrote the transaction (priority fee / Lighthouse guard); forwarding its rewritten message.',
              {
                originalLen: messageBytes.length,
                signedLen: signedMessageBytes.length,
              },
            );
          }

          // The wallet may have REWRITTEN the message (priority fee, extra ix)
          // and signed THAT. As a modifying signer we return the wallet's
          // resulting message bytes + signatures so kit sends exactly what was
          // signed. Slot 0 is the fee payer (this wallet); other required-
          // signer slots are left for kit's remaining partial signers (e.g.
          // the spawn mint keypair), which sign over this same rewritten
          // message.
          const sig = signed.signatures[0];
          if (!sig || sig.every((b) => b === 0)) {
            throw new WalletAdapterSignerError(
              'Wallet adapter returned an unsigned transaction (signature slot 0 is empty).',
            );
          }
          const signedKeys = signed.message.staticAccountKeys;
          const numSigners = signed.message.header.numRequiredSignatures;
          const signatures: Record<string, SignatureBytes> = {};
          for (let i = 0; i < numSigners; i++) {
            const s = signed.signatures[i];
            if (s && !s.every((b) => b === 0)) {
              signatures[signedKeys[i].toBase58()] = s as SignatureBytes;
            }
          }
          // Carry the original lifetime (blockhash + lastValidBlockHeight)
          // onto the rewritten transaction. The wallet only adds instructions;
          // it preserves the blockhash, so the original constraint still
          // applies — and kit's confirmation step requires it.
          const lifetimeConstraint = (
            tx as KitTransaction & Partial<TransactionWithLifetime>
          ).lifetimeConstraint;
          return {
            messageBytes:
              signed.message.serialize() as unknown as KitTransaction['messageBytes'],
            signatures: signatures as unknown as KitTransaction['signatures'],
            ...(lifetimeConstraint ? { lifetimeConstraint } : {}),
          } as unknown as KitTransaction &
            TransactionWithinSizeLimit &
            TransactionWithLifetime;
        }),
      );
    },
  };
}

function bufToHex(buf: Uint8Array): string {
  return Array.from(buf, (b) => b.toString(16).padStart(2, '0')).join('');
}
