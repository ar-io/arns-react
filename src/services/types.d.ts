type ArNSContractState = {
  records: Map<string, string>;
};

const transactionIdRegex = /^\/?([a-zA-Z0-9-_]{43})\/?$|^\/?([a-zA-Z0-9-_]{43})\/(.*)$/i
type ArweaveTransactionId = transactionIdRegex;

export interface SmartweaveContractSource {
  getContractState(txId: ArweaveTransactionId): Promise<ArNSContractState | undefined>;
}
