import type { TokenType } from '@ardrive/turbo-sdk';
/**
 * `SolanaWalletConnector` — implements the app's `ArNSWalletConnector`
 * contract on top of `@solana/wallet-adapter-react`.
 *
 * Because wallet-adapter is already React-aware (everything flows through
 * the `useWallet()` hook), this connector is a thin shim around an adapter
 * passed in by the React layer. It does NOT call `wallet.adapter.connect()`
 * directly — that's left to the `WalletProvider` modal so the standard
 * wallet selection UX still works. Calling `connect()` here just records the
 * Solana wallet type in localStorage so we can rehydrate on reload.
 *
 * The real magic is `solanaSigner` — a kit-compatible
 * `TransactionPartialSigner` derived from the adapter's `signTransaction`
 * method. That's what gets handed to `ARIO.init({ backend: 'solana',
 * signer })` and `ANT.init({ backend: 'solana', signer })`.
 */
import type { TransactionSigner } from '@solana/kit';

import { AoAddress, ArNSWalletConnector, WALLET_TYPES } from '../../types';
import { makeWalletAdapterSigner } from './walletAdapterToKitSigner';

/** Subset of `@solana/wallet-adapter-react`'s `WalletContextState`. */
export interface SolanaWalletAdapterContext {
  publicKey: { toBase58(): string } | null;
  connected: boolean;
  connecting?: boolean;
  disconnect: () => Promise<void>;
  signTransaction?: <T>(tx: T) => Promise<T>;
}

export class SolanaWalletConnector implements ArNSWalletConnector {
  tokenType: TokenType = 'solana';

  /**
   * AO-only fields are intentionally undefined for Solana: nothing in the
   * Solana flow uses `contractSigner` (AO `ContractSigner`) or `turboSigner`.
   * They remain on the interface for the ETH/Arweave wallets only.
   */
  contractSigner = undefined;
  turboSigner = undefined;

  private adapter: SolanaWalletAdapterContext;
  private cachedSigner?: TransactionSigner;
  private cachedSignerKey?: string;

  constructor(adapter: SolanaWalletAdapterContext) {
    this.adapter = adapter;
    // Eagerly resolve the signer if everything is already in place; otherwise
    // the getter will lazily build it on first access (Phantom occasionally
    // attaches `signTransaction` a tick after flipping `connected`, so eager
    // construction at modal-detect time is racy).
    void this.solanaSigner;
  }

  /**
   * Lazily-resolved kit `TransactionSigner`. Re-binds whenever the
   * underlying adapter swaps the connected key (e.g. user switches accounts
   * inside Phantom without disconnecting). Returns `undefined` until the
   * adapter has both a public key and a `signTransaction` callback.
   */
  get solanaSigner(): TransactionSigner | undefined {
    if (
      !this.adapter.publicKey ||
      typeof this.adapter.signTransaction !== 'function'
    ) {
      return undefined;
    }
    const key = this.adapter.publicKey.toBase58();
    if (this.cachedSigner && this.cachedSignerKey === key) {
      return this.cachedSigner;
    }
    this.cachedSigner = makeWalletAdapterSigner({
      publicKey: this.adapter.publicKey,
      signTransaction: this.adapter.signTransaction as never,
    });
    this.cachedSignerKey = key;
    return this.cachedSigner;
  }

  /**
   * Replace the underlying wallet-adapter context — called by the React
   * layer when `useWallet()` re-renders with a fresh adapter ref (e.g.
   * the user switches Phantom accounts). Invalidates the cached signer.
   */
  updateAdapter(adapter: SolanaWalletAdapterContext): void {
    this.adapter = adapter;
    this.cachedSigner = undefined;
    this.cachedSignerKey = undefined;
  }

  /**
   * Persist the wallet type to localStorage so the app remembers the user
   * picked Solana on next load. Actual wallet connection is initiated by
   * the `@solana/wallet-adapter-react-ui` modal — this connector wraps an
   * already-selected adapter.
   */
  async connect(): Promise<void> {
    localStorage.setItem('walletType', WALLET_TYPES.SOLANA);
    if (!this.adapter.connected) {
      throw new Error(
        'Solana wallet must be connected through the wallet selection modal first.',
      );
    }
  }

  async disconnect(): Promise<void> {
    localStorage.removeItem('walletType');
    this.cachedSigner = undefined;
    this.cachedSignerKey = undefined;
    try {
      await this.adapter.disconnect();
    } catch {
      // wallet may already be disconnected; ignore
    }
  }

  async getWalletAddress(): Promise<AoAddress> {
    if (!this.adapter.publicKey) {
      throw new Error('Solana wallet is not connected.');
    }
    // ArNS uses `AoAddress` as a string-or-`ArweaveTransactionID` union.
    // Solana addresses are arbitrary base58 strings — return as plain string.
    return this.adapter.publicKey.toBase58() as unknown as AoAddress;
  }
}
