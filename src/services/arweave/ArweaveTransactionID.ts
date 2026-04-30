// Accepts both Arweave TX IDs (always 43 base64url chars) and Solana base58
// pubkeys (32–44 chars). The class is named `ArweaveTransactionID` for
// historical reasons but is also used to wrap process / ANT identifiers in the
// Solana backend, where the value is a base58 pubkey instead of an Arweave
// TX ID. Downstream consumers only call `toString()`, so the wrapper is just
// shape sugar — relaxing the validator avoids spurious throws on Solana
// values without changing the underlying contract.
//
// The previous regex (`^[a-zA-Z0-9-_s+]{43}$`) also had a stray `s+` that was
// almost certainly a typo for `\s` (which would never appear in a real TX
// ID anyway); we drop it here.
const PROCESS_ID_REGEX = /^[a-zA-Z0-9_-]{32,64}$/;

export interface Equatable<T> {
  equals(other: T): boolean;
}

export class ArweaveTransactionID implements Equatable<ArweaveTransactionID> {
  constructor(private readonly transactionId?: string) {
    if (!transactionId || !PROCESS_ID_REGEX.test(transactionId)) {
      throw new Error(
        'Transaction ID should be a 32-64 character, alphanumeric string potentially including "-" and "_" characters.',
      );
    }
  }

  [Symbol.toPrimitive](hint?: string): string {
    if (hint === 'number') {
      throw new Error('Transaction IDs cannot be interpreted as a number!');
    }

    return this.toString();
  }

  toString(): string {
    return this.transactionId ?? '';
  }

  equals(entityId: ArweaveTransactionID): boolean {
    return this.transactionId === entityId.transactionId;
  }
}
