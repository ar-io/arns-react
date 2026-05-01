// Solana addresses are base58-encoded ed25519 public keys: 32–44 base58
// chars. Used for wallet addresses, ANT mint pubkeys (Metaplex Core asset
// addresses), program ids, and any other on-chain account address.
//
// Mirrors the shape of `ArweaveTransactionID` so call sites can be swapped
// 1:1 without changing the consumer (display components only call
// `.toString()`). The class exists primarily so the type system can tell
// us when an Arweave tx id is being passed where a Solana address is
// expected, and vice versa — see `AoAddress` in `src/types.ts`.

import { Equatable } from '../arweave/ArweaveTransactionID';

// Base58 alphabet excludes 0, O, I, l. We don't enforce that here (a
// stricter check would require pulling in `@solana/kit`'s `isAddress`
// which is async-friendly only); length is enough to catch wrong-type
// values without false positives.
const SOLANA_ADDRESS_REGEX = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export class SolanaAddress implements Equatable<SolanaAddress> {
  constructor(private readonly address?: string) {
    if (!address || !SOLANA_ADDRESS_REGEX.test(address)) {
      throw new Error(
        'Solana address should be a 32-44 character base58 string.',
      );
    }
  }

  [Symbol.toPrimitive](hint?: string): string {
    if (hint === 'number') {
      throw new Error('Solana addresses cannot be interpreted as a number!');
    }
    return this.toString();
  }

  toString(): string {
    return this.address ?? '';
  }

  equals(other: SolanaAddress): boolean {
    return this.address === other.address;
  }
}
