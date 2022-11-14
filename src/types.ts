export type ArNSDomains = { [x: string]: ArweaveTransactionId };

export type ArNSContractState = {
  records: ArNSDomains;
};

export type ArNSMapping = {
  domain: string;
  id: ArweaveTransactionId;
};

export type ArNSMetaData = {
  image?: string;
  expiry?: string;
};

export type ArNSDomain = ArNSMapping & ArNSMetaData;

// TODO: match this to a regex
export type ArweaveTransactionId = string;

export interface SmartweaveContractSource {
  getContractState(
    contractId: ArweaveTransactionId,
  ): Promise<ArNSContractState | undefined>;
}

export type SearchBarProps = {
  successPredicate: (value: string | undefined) => boolean;
  validationPredicate: (value: string | undefined) => boolean;
  placeholderText: string;
  headerElement: JSX.Element;
  footerElement: JSX.Element;
  values: { [x: string]: string };
};

export type SearchBarHeaderProps = {
  defaultText: string;
  isAvailable?: boolean;
  isDefault?: boolean;
  text?: string;
};

export type SearchBarFooterProps = {
  defaultText: string;
  searchResult?: ArNSDomain;
  isSearchValid?: boolean;
  isAvailable?: Boolean;
};

export type ConnectWalletModalProps = {
  setShowModal: any;
};
