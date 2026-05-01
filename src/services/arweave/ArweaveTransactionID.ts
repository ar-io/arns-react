// Arweave transaction IDs are exactly 43 base64url characters. Solana
// addresses and signatures must be wrapped in their own type — never pass
// them through this class.
//
// The previous regex (`^[a-zA-Z0-9-_s+]{43}$`) also had a stray `s+` that
// was almost certainly a typo for `\s` (which would never appear in a real
// TX ID anyway); we drop it here.
const ARWEAVE_TX_ID_REGEX = /^[a-zA-Z0-9_-]{43}$/;

export interface Equatable<T> {
  equals(other: T): boolean;
}

export class ArweaveTransactionID implements Equatable<ArweaveTransactionID> {
  constructor(private readonly transactionId?: string) {
    if (!transactionId || !ARWEAVE_TX_ID_REGEX.test(transactionId)) {
      throw new Error(
        'Transaction ID should be a 43-character base64url string (alphanumeric plus "-" and "_").',
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
