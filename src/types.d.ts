type ArNSContractState = {
  records: Map<string, string>;
};

const transactionIdRegex = /([a-zA-Z0-9-_]{43})/;
type ArweaveTransactionId = transactionIdRegex;

export interface SmartweaveContractSource {
  getContractState(
    contractId: ArweaveTransactionId,
  ): Promise<ArNSContractState | undefined>;
}

export type searchBar = {
  searchButtonAction: any;
};

