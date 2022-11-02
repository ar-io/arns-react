type ArNSContractState = {
  records: Map<string, string>;
};

export interface SmartweaveContractSource {
  getContractState(txId: string): Promise<ArNSContractState | undefined>;
}
