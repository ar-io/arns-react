// Solana transaction signatures are base58-encoded 64-byte ed25519
// signatures: 64–88 base58 chars in practice (88 is most common).
//
// Distinct from `SolanaAddress` because signatures are never valid as
// account addresses and vice versa — keeping them separate gives us
// type-system feedback when call sites mix them up (e.g. passing a
// signature where an address is expected for a Solana explorer link).

import { Equatable } from '../arweave/ArweaveTransactionID';

const SOLANA_SIGNATURE_REGEX = /^[1-9A-HJ-NP-Za-km-z]{64,88}$/;

export class SolanaSignature implements Equatable<SolanaSignature> {
  constructor(private readonly signature?: string) {
    if (!signature || !SOLANA_SIGNATURE_REGEX.test(signature)) {
      throw new Error(
        'Solana signature should be a 64-88 character base58 string.',
      );
    }
  }

  [Symbol.toPrimitive](hint?: string): string {
    if (hint === 'number') {
      throw new Error('Solana signatures cannot be interpreted as a number!');
    }
    return this.toString();
  }

  toString(): string {
    return this.signature ?? '';
  }

  equals(other: SolanaSignature): boolean {
    return this.signature === other.signature;
  }
}
