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

export type ANTContractState = {
  balances: { [x: ArweaveTransactionId]: number };
  evolve: boolean | undefined;
  name: string;
  owner: ArweaveTransactionId;
  records: ArNSMapping;
  ticker: string;
};

export interface ArweaveWallet {
  getType(): string;
  getAddress(): string;
  getArBalance(): number;
  getIOBalance(): number;
  getANTS(): ArweaveTransactionId[];
  getArNSNames(): ArNSDomains;
}

export type ArweaveWalletState = {
  type: string; // JWK or signer
  jwk?: string; // jwk file
  address: string; // public address of the wallet
  balances: {
    // respective balances of tokens
    ar?: number;
    io?: number;
    ants?: ArweaveTransactionId[]; // array of ant contract addresses owned by wallet
    arnsNames?: ArNSDomains; // records object of name:id values for owned names
  };
};

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
};

export type ConnectWalletModalProps = {
  setShowModal: any;
};
