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
  getWalletAddress(): Promise<string>;
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
  tier: number;
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

export type RegistrationState = {
  domain: string;
  leaseDuration: number;
  chosenTier: number;
  nickname?: string;
  ticker?: string;
  controllers: Array<ArweaveTransactionId>;
  ttl: number;
  antID?: ArweaveTransactionId;
  targetID?: ArweaveTransactionId;
  fee: { ar: number; io: number };
  isRegistering: boolean;
  isRegistered: boolean;
  stage: number;
  isFirstStage: boolean;
  isLastStage: boolean;
  errors?: Array<Error>;
};

export type RegistrationAction =
  | { type: 'setDomainName'; payload: string }
  | { type: 'setLeaseDuration'; payload: number }
  | { type: 'setChosenTier'; payload: number }
  | { type: 'setNickname'; payload: string }
  | { type: 'setTicker'; payload: string }
  | { type: 'setControllers'; payload: Array<ArweaveTransactionId> }
  | { type: 'setTTL'; payload: number }
  | { type: 'setAntID'; payload: ArweaveTransactionId }
  | { type: 'setTargetID'; payload: ArweaveTransactionId }
  | { type: 'setFee'; payload: { ar: number; io: number } }
  | { type: 'setIsRegistering'; payload: boolean }
  | { type: 'setIsRegistered'; payload: boolean }
  | { type: 'setStage'; payload: number }
  | { type: 'setIsFirstStage'; payload: boolean }
  | { type: 'setIsLastStage'; payload: boolean }
  | { type: 'setErrors'; payload: Array<Error> };

export type RegistrationStateProviderProps = {
  reducer: React.Reducer<RegistrationState, RegistrationAction>;
  children: React.ReactNode;
  firstStage: any;
  lastStage: any;
};

export type WorkflowProps = {
  stages: { [x: number]: { component: any; proceedCondition: () => boolean } };
};
