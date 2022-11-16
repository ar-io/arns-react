import type { JWKInterface } from 'arweave/node/lib/wallet';
import type { Dispatch, SetStateAction } from 'react';

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
