import type { Dispatch, SetStateAction } from 'react';

export type ArNSDomains = { [x: string]: any };

export type ArNSContractState = {
  records: ArNSDomains;
  fees: { [x: number]: number };
  balances: { [x: ArweaveTransactionId]: number };
  controllers: ArweaveTransactionId[];
  evolve: boolean | undefined;
  name: string;
  owner: ArweaveTransactionId;
  ticker: string;
  approvedANTSourceCodeTxs: ArweaveTransactionId[];
};

export type ANTContractDomainRecord = {
  ttlSeconds: number;
  maxSubdomains: number;
  transactionId: ArweaveTransactionId;
};

export type ANTContractRecordMapping = ANTContractDomainRecord;

export type ANTContractState = {
  balances: { [x: ArweaveTransactionId]: number };
  evolve: boolean | undefined;
  name: string;
  owner: ArweaveTransactionId;
  controllers: ArweaveTransactionId[];
  records: {
    '@': ANTContractRecordMapping;
    [x: string]: ANTContractRecordMapping;
  };
  ticker: string;
};

export type ArNSMapping = {
  domain: string;
  id: ArweaveTransactionId;
  overrides?: any; // TODO;
  compact?: boolean;
  enableActions?: boolean;
  hover?: boolean;
};

export type ArNSMetaData = {
  image?: string;
  expiration?: Date;
};

export type ArNSDomain = ArNSMapping & ArNSMetaData;

// TODO: match this to a regex
export type ArweaveTransactionId = string;

export type JsonWalletProvider = {
  key: any;
};

export interface SmartweaveContractSource {
  getContractState(contractId: ArweaveTransactionId): Promise<any>;
  writeTransaction(
    contractId: ArweaveTransactionId,
    payload: {
      [x: string]: any;
      contractTransactionId: ArweaveTransactionId;
    },
    dryWrite?: boolean,
  ): Promise<ArweaveTransactionId | undefined>;
  getContractBalanceForWallet(
    contractId: ArweaveTransactionId,
    wallet: ArweaveTransactionId,
  ): Promise<number>;
  getContractConfirmations(id: ArweaveTransactionId): Promise<number>;
}

export interface ArweaveWalletConnector {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  getWalletAddress(): Promise<string>;
  getWalletBalanceAR(): Promise<string>;
}

export interface ArweaveGraphQLAPI {
  getWalletANTs(
    approvedSourceCodeTransactions: string[],
    address: string,
    cursor?: string,
  ): Promise<{ ids: string[]; cursor?: string }>;
}

export type SearchBarProps = {
  successPredicate: (value: string | undefined) => boolean;
  validationPredicate: (value: string | undefined) => boolean;
  onSuccess: (value: string, result?: string) => void;
  onFailure: (value: string, result?: string) => void;
  onChange: () => void;
  onSubmit: (next?: boolean) => void;
  placeholderText?: string;
  headerElement?: JSX.Element;
  footerElement?: JSX.Element;
  values?: { [x: string]: string };
  value?: string;
  height?: number;
};

export type SearchBarHeaderProps = {
  defaultText: string;
  isAvailable?: boolean;
  isDefault?: boolean;
  text?: string;
};

export type SearchBarFooterProps = {
  defaultText: string;
  isSearchValid?: boolean;
  isAvailable?: boolean;
  searchTerm?: string;
  searchResult?: string;
};

export type ConnectWalletModalProps = {
  setShowModal: Dispatch<SetStateAction<boolean>>;
};

export type TierCardProps = {
  tierNumber: number;
};

export type DropdownProps = {
  options: { [x: string]: any };
  optionsFilter?: () => Array<string>; // optional filter to sort passed array of options
  showSelected: boolean;
  showChevron: boolean;
  selected: any;
  setSelected: Dispatch<SetStateAction<any>>;
  headerElement?: JSX.Element;
  footerElement?: JSX.Element;
};

export type WorkflowProps = {
  stage: number;
  onNext: () => void;
  onBack: () => void;
  stages: {
    [x: number]: {
      component: JSX.Element;
      showNext: boolean;
      showBack: boolean;
      disableNext: boolean;
      requiresWallet: boolean;
    };
  };
};

export enum TABLE_TYPES {
  ANT = 'ant_table',
  NAME = 'name_table',
}
