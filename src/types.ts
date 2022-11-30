import type { JWKInterface } from 'arweave/node/lib/wallet';
import type { Dispatch, SetStateAction } from 'react';
import React from 'react';

export type ArNSDomains = { [x: string]: ArweaveTransactionId };

export type ArNSContractState = {
  records: ArNSDomains;
  fees: { [x: number]: number };
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

export interface WalletUploadSource {
  getWallet(e: any): JWKInterface | void;
}
export type JsonWalletProvider = {
  key: any;
};

export interface SmartweaveContractSource {
  getContractState(
    contractId: ArweaveTransactionId,
  ): Promise<ArNSContractState | undefined>;
}

export interface ArweaveWalletConnector {
  connect(): Promise<JWKInterface>;
}

export type SearchBarProps = {
  successPredicate: (value: string | undefined) => boolean;
  validationPredicate: (value: string | undefined) => boolean;
  setIsSearching?: Dispatch<SetStateAction<boolean>>;
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
  tier: number;
  setTier: Dispatch<SetStateAction<number>>;
  selectedTier: number;
};

export type DropdownProps = {
  options: Array<string>;
  optionsFilter?: () => Array<string>; // optional filter to sort passed array of options
  showSelected: boolean;
  showChevron: boolean;
  selected: number;
  setSelected: Dispatch<SetStateAction<number>>;
  headerElement?: JSX.Element;
  footerElement?: JSX.Element;
};

export type StateProviderProps = {
  reducer: React.Reducer<
    { [x: number | string]: any },
    { type: string; payload: any }
  >;
  children: React.ReactNode;
};

export type WorkflowProps = {
  stages: { [x: number]: { component: any } };
};
