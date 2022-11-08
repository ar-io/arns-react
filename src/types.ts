export type ArNSContractState = {
  records: { [x: string]: ArweaveTransactionId };
};

// TODO: match this to a regex
export type ArweaveTransactionId = string;

export interface SmartweaveContractSource {
  getContractState(
    contractId: ArweaveTransactionId,
  ): Promise<ArNSContractState | undefined>;
}

export type SearchBarProps = {
  predicate: (value: string) => boolean;
  placeholderText: string;
  headerElement: JSX.Element;
  footerElement: JSX.Element;
  values: string[] | object;
};

export type SearchBarHeaderProps = {
  defaultText: string;
  isValid?: boolean;
  isDefault?:boolean;
  text?: string;
};

export type SearchBarFooterProps = {
  defaultText: string;
  isValid?: boolean;
};
