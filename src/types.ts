export type ArNSContractState = {
  records: { [x: string]: ArweaveTransactionId } | undefined;
};

// TODO: match this to a regex
export type ArweaveTransactionId = string;

export interface SmartweaveContractSource {
  getContractState(
    contractId: ArweaveTransactionId,
  ): Promise<ArNSContractState | undefined>;
}

export type SearchBarProps = {
  buttonAction: () => void;
  placeholderText: string;
  headerText: string;
  footerText: string;
};
