import type { Dispatch, SetStateAction } from 'react';

import { PDNS_TX_ID_REGEX } from './utils/constants';

export type PDNSRecordEntry = {
  contractTxId: string;
  tier: string;
  endTimestamp: number;
};

export type PDNSDomains = { [x: string]: PDNSRecordEntry };

export type TransactionHeaders = {
  id: string;
  signature: string;
  format: number;
  last_tx: string;
  owner: string;
  target: string;
  quantity: string;
  reward: string;
  data_size: string;
  data_root: string;
  tags: TransactionTag[];
};

export type TransactionTag = {
  name: string;
  value: string;
};

export type PDNSContractJSON = {
  records: PDNSDomains;
  fees: { [x: number]: number };
  tiers: {
    current: {
      [x: number]: string;
    };
    history: {
      id: string;
      fee: number;
      settings: {
        maxUndernames: number;
      };
    }[];
  };
  balances: { [x: string]: number };
  controllers: ArweaveTransactionID[];
  evolve: boolean | undefined;
  name: string;
  owner: ArweaveTransactionID | undefined;
  ticker: string;
  approvedANTSourceCodeTxs: string[];
};

export type PDNTContractDomainRecord = {
  ttlSeconds: number;
  maxUndernames: number;
  transactionId: string;
};

export type PDNTContractJSON = {
  balances: { [x: string]: number };
  evolve: boolean | undefined;
  name: string;
  owner: string;
  controller: string;
  controllers?: string[];
  records: {
    '@': string | PDNTContractDomainRecord;
    [x: string]: string | PDNTContractDomainRecord;
  };
  ticker: string;
};

export type PDNTContractFields = keyof PDNTContractJSON;

export type PDNSMapping = {
  domain: string;
  id?: ArweaveTransactionID;
  state?: PDNTContractJSON;
  overrides?: any; // TODO;
  disabledKeys?: string[]; // TODO;
  compact?: boolean;
  enableActions?: boolean;
  hover?: boolean;
  showTier?: boolean;
};

export type PDNSMetaData = {
  image?: string;
  expiration?: Date;
};

export type PDNSDomain = PDNSMapping & PDNSMetaData;

export type JsonWalletProvider = {
  key: any;
};

export interface SmartweaveContractCache {
  getContractState<T extends PDNTContractJSON | PDNSContractJSON>(
    contractTxId: ArweaveTransactionID,
  ): Promise<T>;
  getContractBalanceForWallet(
    contractTxId: ArweaveTransactionID,
    wallet: ArweaveTransactionID,
  ): Promise<number>;
  getContractsForWallet(
    address: ArweaveTransactionID,
    type?: 'ant', // TODO: we may broaden this for other contract types
  ): Promise<{ ids: ArweaveTransactionID[] }>;
  getContractInteractions(
    contractTxId: ArweaveTransactionID,
  ): Promise<ContractInteraction[]>;
  getPendingContractInteractions(
    contractTxId: ArweaveTransactionID,
    key: string,
  ): Promise<ContractInteraction[]>;
}

export interface SmartweaveContractInteractionProvider {
  writeTransaction({
    walletAddress,
    contractTxId,
    payload,
    dryWrite,
  }: {
    walletAddress: ArweaveTransactionID;
    contractTxId: ArweaveTransactionID;
    payload: {
      function: string;
      [x: string]: any;
    };
    dryWrite?: boolean;
  }): Promise<ArweaveTransactionID | undefined>;
  deployContract({
    walletAddress,
    srcCodeTransactionId,
    initialState,
    tags,
  }: {
    walletAddress: ArweaveTransactionID;
    srcCodeTransactionId: ArweaveTransactionID;
    initialState: PDNTContractJSON;
    tags?: TransactionTag[];
  }): Promise<string>;
  registerAtomicName({
    walletAddress,
    registryId,
    srcCodeTransactionId,
    initialState,
    domain,
  }: {
    walletAddress: ArweaveTransactionID;
    registryId: ArweaveTransactionID;
    srcCodeTransactionId: ArweaveTransactionID;
    initialState: PDNTContractJSON;
    domain: string;
    file?: File;
  }): Promise<string | undefined>;
  getRecord(
    record: string,
    contractId: ArweaveTransactionID,
  ): Promise<PDNTContractJSON | undefined>;
}

export interface ArweaveWalletConnector {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  getWalletAddress(): Promise<ArweaveTransactionID>;
}

export interface TransactionCache {
  set(key: string, value: any): void;
  get(key: string): any;
  del(key: string): void;
  push(key: string, value: any): void;
}

export interface ArweaveDataProvider {
  // add isAddress method
  getTransactionStatus(id: ArweaveTransactionID): Promise<number>;
  getTransactionTags(
    id: ArweaveTransactionID,
  ): Promise<{ [x: string]: string }>;
  validateTransactionTags(params: {
    id: string;
    requiredTags?: {
      [x: string]: string[] | ArweaveTransactionID[]; // allowed values
    };
  }): Promise<void>;
  validateArweaveId(id: string): Promise<ArweaveTransactionID>;
  validateConfirmations(
    id: string,
    numberOfConfirmations?: number,
  ): Promise<void>;
  validateArweaveAddress(address: string): Promise<undefined | boolean>;
  getArBalance(wallet: ArweaveTransactionID): Promise<number>;
  getArPrice(data: number): Promise<number>;
  getCurrentBlockHeight(): Promise<number>;
}

export interface PDNTInteractionProvider {
  setOwner(id: ArweaveTransactionID): Promise<string>;
  setController(id: ArweaveTransactionID): Promise<string>;
  setTargetId(id: ArweaveTransactionID): Promise<string>;
  setUndername(name: string): Promise<string>;
  removeUndername(name: string): Promise<string>;
}

export type SearchBarProps = {
  successPredicate: (value: string | undefined) => boolean;
  validationPredicate: (value: string | undefined) => boolean;
  onSuccess: (value: string, result?: string) => void;
  onFailure: (value: string, result?: string) => void;
  onChange: () => void;
  onSubmit: (next?: boolean) => void;
  disabled?: boolean;
  placeholderText?: string;
  headerElement?: JSX.Element;
  footerElement?: JSX.Element;
  values?: { [x: string]: PDNSRecordEntry };
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
  isAvailable?: boolean;
  searchTerm?: string;
  searchResult?: ArweaveTransactionID;
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

export type ManageTable = 'pdnts' | 'names';

export const MANAGE_TABLE_NAMES: Record<ManageTable, string> = {
  names: 'Names',
  pdnts: "PDNT's",
};

export enum TRANSACTION_TYPES {
  LEASE = 'Lease',
  BUY = 'Buy',
}

export enum CONTRACT_TYPES {
  REGISTRY = 'PDNS Registry',
  PDNT = 'Arweave Name Token',
}

export enum ASSET_TYPES {
  PDNT = 'PDNT',
  NAME = 'PDNS Name',
  UNDERNAME = 'Undername',
  COIN = 'coin',
}
export enum INTERACTION_TYPES {
  // Registry interaction types
  BUY_RECORD = 'Buy PDNS Name',
  EXTEND_LEASE = 'Extend Lease',
  UPGRADE_TIER = 'Upgrade Tier',

  // ANT interaction types
  SET_CONTROLLER = 'Edit Controller',
  SET_TICKER = 'Edit Ticker',
  SET_NAME = 'Edit Name',
  SET_TTL_SECONDS = 'Edit TTL Seconds',
  SET_TARGET_ID = 'Edit Target ID',
  SET_RECORD = 'Edit Record',
  REMOVE_RECORD = 'Delete Record',
  CREATE = 'Create Permaweb Name Token',

  // Common interaction types
  TRANSFER = 'Transfer',
  BALANCE = 'Balance',
  UNKNOWN = 'Unknown',
}

export enum UNDERNAME_TABLE_ACTIONS {
  CREATE = 'Create',
  REMOVE = 'Remove',
  EDIT = 'Edit',
}
const undernameTableInteractions = [
  UNDERNAME_TABLE_ACTIONS.CREATE,
  UNDERNAME_TABLE_ACTIONS.REMOVE,
  UNDERNAME_TABLE_ACTIONS.EDIT,
] as const;
export type UndernameTableInteractionTypes =
  (typeof undernameTableInteractions)[number];

export const createOrUpdateUndernameInteractions = [
  UNDERNAME_TABLE_ACTIONS.CREATE,
  UNDERNAME_TABLE_ACTIONS.EDIT,
] as const;
export const destructiveUndernameInteractions = [
  UNDERNAME_TABLE_ACTIONS.REMOVE,
] as const;
export const allUndernameInteractions = [
  ...createOrUpdateUndernameInteractions,
  ...destructiveUndernameInteractions,
] as const;

export type CreateOrEditUndernameInteraction = Exclude<
  UndernameTableInteractionTypes,
  UNDERNAME_TABLE_ACTIONS.REMOVE
>;

const commonInteractionTypeNames = [
  INTERACTION_TYPES.TRANSFER,
  INTERACTION_TYPES.BALANCE,
] as const;
const unknownInteractionType = INTERACTION_TYPES.UNKNOWN as const;
export const pdntInteractionTypes = [
  ...commonInteractionTypeNames,
  INTERACTION_TYPES.SET_CONTROLLER,
  INTERACTION_TYPES.SET_TICKER,
  INTERACTION_TYPES.SET_NAME,
  INTERACTION_TYPES.SET_TTL_SECONDS,
  INTERACTION_TYPES.SET_TARGET_ID,
  INTERACTION_TYPES.SET_RECORD,
  INTERACTION_TYPES.REMOVE_RECORD,
  INTERACTION_TYPES.CREATE,
] as const;
export const registryInteractionTypes = [
  ...commonInteractionTypeNames,
  INTERACTION_TYPES.BUY_RECORD,
  INTERACTION_TYPES.EXTEND_LEASE,
  INTERACTION_TYPES.UPGRADE_TIER,
] as const;

export const interactionTypeNames = [
  ...pdntInteractionTypes,
  ...registryInteractionTypes,
] as const;
export const contractTypeNames = [
  CONTRACT_TYPES.REGISTRY,
  CONTRACT_TYPES.PDNT,
] as const;
export type ContractTypes = (typeof contractTypeNames)[number];
export type InteractionTypes = (typeof interactionTypeNames)[number];
export type PDNTInteractionType = (typeof pdntInteractionTypes)[number];
export type RegistryInteractionType = (typeof registryInteractionTypes)[number];
export type UnknownInteractionTypeName = typeof unknownInteractionType;
export type ValidInteractionType =
  | PDNTInteractionType
  | RegistryInteractionType;
export type InteractionTypeName =
  | ValidInteractionType
  | UnknownInteractionTypeName;
export type ExcludedValidInteractionType = Exclude<
  ValidInteractionType,
  INTERACTION_TYPES.BALANCE
>;

export type TransactionDataBasePayload = {
  assetId: string;
  functionName: string;
  deployedTransactionId?: ArweaveTransactionID;
};

// registry transaction payload types
export type BuyRecordPayload = {
  name: string;
  contractTxId: string;
  years: number;
  tierNumber: number;
  state?: PDNTContractJSON;
};

export type ExtendLeasePayload = {
  name: string;
  years: number;
};

export type UpgradeTierPayload = {
  name: string;
  tierNumber: number;
};

export type TransferIOPayload = {
  target: string;
  qty: number;
};
//end registry transaction payload types

//pdnt transaction payload types
export type SetTickerPayload = {
  ticker: string;
};

export type SetControllerPayload = {
  target: string;
};

export type SetNamePayload = {
  name: string;
};

export type SetRecordPayload = {
  subDomain: string;
  transactionId: string;
  ttlSeconds: number;
};

export type RemoveRecordPayload = {
  subDomain: string;
};

export type TransferPDNTPayload = {
  target: string;
  qty: number;
};

export type CreatePDNTPayload = {
  srcCodeTransactionId: string;
  initialState: PDNTContractJSON;
  tags?: TransactionTag[];
};
// end pdnt transaction payload types

export enum PDNT_INTERACTION_TYPES {
  SET_CONTROLLER = 'Edit Controller',
  SET_TICKER = 'Edit Ticker',
  SET_NAME = 'Edit Name',
  SET_RECORD = 'Edit Record',
  SET_TARGET_ID = 'Set Target ID',
  SET_TTL_SECONDS = 'Set TTL Seconds',
  REMOVE_RECORD = 'Delete Record',
  TRANSFER = 'Transfer',
  BALANCE = 'Balance',
  CREATE = 'Create Arweave Name Token',
}

export const ALL_TRANSACTION_DATA_KEYS = [
  'assetId',
  'functionName',
  'deployedTransactionId',
  'name',
  'contractTxId',
  'years',
  'tierNumber',
  'target',
  'qty',
  'ticker',
  'subDomain',
  'transactionId',
  'ttlSeconds',
  'srcCodeTransactionId',
  'initialState',
  'tags',
];

export type TransactionDataPayload =
  | BuyRecordPayload
  | ExtendLeasePayload
  | UpgradeTierPayload
  | TransferIOPayload
  | SetTickerPayload
  | SetControllerPayload
  | SetNamePayload
  | SetRecordPayload
  | RemoveRecordPayload
  | TransferPDNTPayload
  | CreatePDNTPayload;

export type TransactionData = TransactionDataBasePayload &
  TransactionDataPayload;

export type TransactionDataConfig = { functionName: string; keys: string[] };

export class ArweaveTransactionID implements Equatable<ArweaveTransactionID> {
  constructor(private readonly transactionId: string) {
    if (!PDNS_TX_ID_REGEX.test(transactionId)) {
      throw new Error(
        'Transaction ID should be a 43-character, alphanumeric string potentially including "-" and "_" characters.',
      );
    }
  }

  [Symbol.toPrimitive](hint?: string): string {
    if (hint === 'number') {
      throw new Error('Transaction IDs cannot be interpreted as a number!');
    }

    return this.toString();
  }

  toString(): string {
    return this.transactionId;
  }

  equals(entityId: ArweaveTransactionID): boolean {
    return this.transactionId === entityId.transactionId;
  }
}

export interface Equatable<T> {
  equals(other: T): boolean;
}

export type PDNSTableRow = {
  name: string;
  role: string;
  id: string;
  tier: number | string;
  expiration: Date;
  status: number;
  key: string | number;
};

export type PDNTMetadata = {
  name: string;
  id: string;
  targetID: string;
  role: string;
  status: number;
  state: PDNTContractJSON;
  error?: string;
  key: number;
};

export type ManagePDNTRow = {
  attribute: string;
  value: string | number;
  editable: boolean;
  key: number;
  interactionType?: ValidInteractionType;
};

export type PDNTDetails = {
  status: number;
  associatedNames: string;
  name: string;
  ticker: string;
  targetID: string;
  ttlSeconds: number;
  controller: string;
  undernames: string;
  owner: string;
};

export type UndernameMetadata = {
  name: string;
  targetID: string;
  ttlSeconds: string;
  status: number;
  error?: string;
  key: string;
};

export enum VALIDATION_INPUT_TYPES {
  ARWEAVE_ID = 'Is valid Arweave Transaction (TX) ID.',
  ARWEAVE_ADDRESS = 'Is likely an Arweave wallet address.',
  PDNS_NAME = 'PDNS Name.',
  UNDERNAME = 'Undername.',
  PDNT_CONTRACT_ID = 'Is a valid Arweave Name Token (PDNT).',
  // unfortunately we cannot use computed values in enums, so be careful if we ever modify this number
  TRANSACTION_CONFIRMATIONS = `Has sufficient confirmations (50+).`,
  VALID_TTL = `Minimum ttl allowed is 900 and Maximum ttl allowed is 2,592,000.`,
}

export type ValidationObject = {
  name: string;
  status: boolean;
  error?: string | undefined;
};

export type ContractInteraction = {
  contractTxId: string;
  id: string;
  payload: {
    function: string;
    [x: string]: string;
  };
  valid?: boolean;
  [x: string]: any;
};
