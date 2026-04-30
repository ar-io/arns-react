/**
 * `PrivateKeySolanaWalletConnector` — dev-only `ArNSWalletConnector` backed
 * by a raw Solana keypair instead of a browser wallet adapter.
 *
 * This is the connector the Settings → Dev Tools "Sign in with private key"
 * panel hands to the global wallet state. It mirrors the interface contract
 * of `SolanaWalletConnector` so every downstream call site (SDK init, ANT
 * spawn, ArNS purchase, faucet panel, …) treats it identically — the only
 * difference is that the kit `TransactionSigner` comes from
 * `createKeyPairSignerFromBytes` rather than the wallet-adapter bridge.
 *
 * Intentionally NOT exported from `services/wallets/index.ts`: this is meant
 * to be imported directly by the dev-tool panel (which itself only renders
 * when `VITE_SOLANA_NETWORK=localnet`), so it can't be reached from
 * production wallet flows.
 */
import type { TokenType } from '@ardrive/turbo-sdk';
import type { KeyPairSigner } from '@solana/kit';

import { AoAddress, ArNSWalletConnector, WALLET_TYPES } from '../../types';

export class PrivateKeySolanaWalletConnector implements ArNSWalletConnector {
  tokenType: TokenType = 'solana';

  // AO-only fields — irrelevant on Solana.
  contractSigner = undefined;
  turboSigner = undefined;

  readonly solanaSigner: KeyPairSigner;
  private readonly addressBase58: string;

  constructor(signer: KeyPairSigner) {
    this.solanaSigner = signer;
    // `KeyPairSigner.address` is a kit `Address` brand on top of a base58
    // string; `toString()` gives us the raw value the rest of the app expects.
    this.addressBase58 = signer.address.toString();
  }

  async connect(): Promise<void> {
    // We tag localStorage the same way as the wallet-adapter path so the
    // app's "remember Solana selection" logic still sees a connected wallet
    // on reload. Note: the keypair itself is NOT persisted — reload requires
    // re-pasting the private key.
    localStorage.setItem('walletType', WALLET_TYPES.SOLANA);
  }

  async disconnect(): Promise<void> {
    localStorage.removeItem('walletType');
  }

  async getWalletAddress(): Promise<AoAddress> {
    return this.addressBase58 as unknown as AoAddress;
  }
}
