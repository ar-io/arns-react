export type ArNSContractState = {
  records: Map<string, ArweaveTransactionId>;
};

// TODO: match this to a regex
export type ArweaveTransactionId = string;

export interface SmartweaveContractSource {
  getContractState(
    contractId: ArweaveTransactionId,
  ): Promise<ArNSContractState | undefined>;
}

export type searchBar = {
  searchButtonAction: any;
};
