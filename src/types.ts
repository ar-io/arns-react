import type { Dispatch, SetStateAction } from 'react';

export type ArNSDomains = { [x: string]: any };

export type ArNSContractState = {
  records: ArNSDomains;
  fees: { [x: number]: number };
  balances: { [x: ArweaveTransactionId]: number };
  controller: ArweaveTransactionId;
  evolve: boolean | undefined;
  name: string;
  owner: ArweaveTransactionId;
  ticker: string;
  approvedANTSourceCodeTxs: ArweaveTransactionId[];
};

export type ANTContractState = {
  balances: { [x: ArweaveTransactionId]: number };
  controller: ArweaveTransactionId;
  evolve: boolean | undefined;
  name: string;
  owner: ArweaveTransactionId;
  records: { '@': ArweaveTransactionId; [x: string]: ArweaveTransactionId };
  ticker: string;
};

export type ArNSMapping = {
  domain: string;
  id: ArweaveTransactionId;
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
  getContractState(
    contractId: ArweaveTransactionId,
  ): Promise<ArNSContractState | ANTContractState | undefined>;
  writeTransaction(
    payload: any,
    dryWrite?: boolean,
  ): Promise<ArweaveTransactionId | undefined>;
  connect(): void;
}
// add writeTransaction: returns txid
// add getTransactionStatus: returns confirmations, blockheight
//
//

export interface ArweaveWalletConnector {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  getWalletAddress(): Promise<string>;
  getWalletBalanceAR(): Promise<string>;
}

export type SearchBarProps = {
  successPredicate: (value: string | undefined) => boolean;
  validationPredicate: (value: string | undefined) => boolean;
  setIsSearching?: Dispatch<SetStateAction<boolean>>;
  isSearching?: boolean;
  placeholderText?: string;
  headerElement?: JSX.Element;
  footerElement?: JSX.Element;
  values?: { [x: string]: string };
  height?: number;
  nextStage?: Dispatch<void>;
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
  isAvailable?: boolean;
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
  stages: {
    [x: number]: {
      component: JSX.Element;
      nextCondition: boolean;
      backCondition: boolean;
      onNext: (id: string) => boolean;
    };
  };
};
