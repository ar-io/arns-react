import type { Dispatch, SetStateAction } from 'react';

import { ARNS_TX_ID_REGEX } from './utils/constants';

export type ArNSRecordEntry = {
  contractTxId: string;
  tier: string;
  endTimestamp: number;
};

export type ArNSDomains = { [x: string]: ArNSRecordEntry };

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

export type ArNSContractState = {
  records: ArNSDomains;
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

export type ANTContractDomainRecord = {
  ttlSeconds?: number;
  maxSubdomains?: number;
  transactionId?: ArweaveTransactionID | string;
};

export type ANTContractRecordMapping = ANTContractDomainRecord;

export type ANTContractJSON = {
  balances: { [x: string]: number };
  evolve: boolean | undefined;
  name: string;
  owner: string;
  controller: string;
  records: {
    '@': ANTContractRecordMapping;
    [x: string]: ANTContractRecordMapping;
  };
  ticker: string;
};

export type ArNSMapping = {
  domain: string;
  id?: ArweaveTransactionID;
  state?: ANTContractJSON;
  overrides?: any; // TODO;
  disabledKeys?: string[]; // TODO;
  compact?: boolean;
  enableActions?: boolean;
  hover?: boolean;
  showTier?: boolean;
};

export type ArNSMetaData = {
  image?: string;
  expiration?: Date;
};

export type ArNSDomain = ArNSMapping & ArNSMetaData;

export type JsonWalletProvider = {
  key: any;
};

export interface SmartweaveDataProvider {
  getContractState(id: ArweaveTransactionID): Promise<any>;
  handleTransactionExecution({
    contractType,
    interactionType,
    transactionData,
  }: {
    contractType: ContractType;
    interactionType: AntInteraction | RegistryInteraction;
    transactionData: any;
  }): Promise<string | undefined>;
  writeTransaction(
    id: ArweaveTransactionID,
    payload: {
      function: string;
      [x: string]: any;
    },
    dryWrite?: boolean,
  ): Promise<ArweaveTransactionID | undefined>;
  getContractBalanceForWallet(
    id: ArweaveTransactionID,
    wallet: ArweaveTransactionID,
  ): Promise<number>;
  deployContract({
    srcCodeTransactionId,
    initialState,
    tags,
  }: {
    srcCodeTransactionId: ArweaveTransactionID;
    initialState: ANTContractJSON;
    tags?: TransactionTag[];
  }): Promise<string>;
}

export interface ArweaveWalletConnector {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  getWalletAddress(): Promise<ArweaveTransactionID>;
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
  getContractsForWallet(
    approvedSourceCodeTransactions: ArweaveTransactionID[],
    address: ArweaveTransactionID,
    cursor?: string,
  ): Promise<{ ids: ArweaveTransactionID[]; cursor?: string }>;
  getWalletBalance(id: ArweaveTransactionID): Promise<number>;
  getArPrice(data: number): Promise<number>;
}

export interface AntInteractionProvider {
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
  values?: { [x: string]: ArNSRecordEntry };
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

export type ManageTable = 'ants' | 'names';

export const MANAGE_TABLE_NAMES: Record<ManageTable, string> = {
  names: 'Names',
  ants: "ANT's",
};

export enum TRANSACTION_TYPES {
  REGISTRY = 'ArNS Registry',
  ANT = 'Arweave Name Token',
  TRANSFER = 'Transfer',
}

export enum CONTRACT_TYPES {
  REGISTRY = 'ArNS Registry',
  ANT = 'Arweave Name Token',
}

export enum ASSET_TYPES {
  ANT = 'ANT',
  NAME = 'ArNS Name',
  UNDERNAME = 'Undername',
  COIN = 'coin',
}
export enum REGISTRY_INTERACTION_TYPES {
  BUY_RECORD = 'Buy ArNS Name', //permabuy
  EXTEND_LEASE = 'Extend Lease',
  UPGRADE_TIER = 'Upgrade Tier',
  TRANSFER = 'Transfer IO Tokens',
  BALANCE = 'Balance',
}

export enum ANT_INTERACTION_TYPES {
  SET_CONTROLLER = 'Edit Controller',
  SET_TICKER = 'Edit Ticker',
  SET_NAME = 'Edit Name',
  SET_RECORD = 'Edit Record',
  REMOVE_RECORD = 'Delete Record',
  TRANSFER = 'Transfer',
  BALANCE = 'Balance',
  CREATE = 'Create Arweave Name Token',
}

export type ContractType = (typeof CONTRACT_TYPES)[keyof typeof CONTRACT_TYPES];
export type AntInteraction =
  (typeof ANT_INTERACTION_TYPES)[keyof typeof ANT_INTERACTION_TYPES];
export type RegistryInteraction =
  (typeof REGISTRY_INTERACTION_TYPES)[keyof typeof REGISTRY_INTERACTION_TYPES];

// TODO: discuss bellow setup with dylan
//export const TRANSACTION_DATA_KEYS = new Map<ContractType, AntInteraction | RegistryInteraction>()

export const TRANSACTION_DATA_KEYS: {
  // specifying interaction types to the correct contract type, to ensure clarity and to prevent crossover of interaction types
  [CONTRACT_TYPES.ANT]: { [K in AntInteraction]: string[] };
  [CONTRACT_TYPES.REGISTRY]: { [K in RegistryInteraction]: string[] };
  /**
   NOTE: benefit of this setup, is that if a new type is added to an enum like ANT_INTERACTION_TYPES, 
   then an error will occur here, since every key of the type is required to be defined here.
   */
} = {
  [CONTRACT_TYPES.REGISTRY]: {
    [REGISTRY_INTERACTION_TYPES.BUY_RECORD]: [
      'name',
      'contractTxId',
      'years',
      'tierNumber',
    ],
    [REGISTRY_INTERACTION_TYPES.EXTEND_LEASE]: ['name', 'years'],
    [REGISTRY_INTERACTION_TYPES.UPGRADE_TIER]: ['name', 'tierNumber'],
    [REGISTRY_INTERACTION_TYPES.TRANSFER]: ['target', 'qty'], // transfer io tokens
    [REGISTRY_INTERACTION_TYPES.BALANCE]: ['target'],
  },
  [CONTRACT_TYPES.ANT]: {
    [ANT_INTERACTION_TYPES.SET_TICKER]: ['ticker'],
    [ANT_INTERACTION_TYPES.SET_CONTROLLER]: ['target'],
    [ANT_INTERACTION_TYPES.SET_NAME]: ['name'],
    [ANT_INTERACTION_TYPES.SET_RECORD]: [
      'subDomain',
      'transactionId',
      'ttlSeconds',
    ],
    [ANT_INTERACTION_TYPES.REMOVE_RECORD]: ['subDomain'],
    [ANT_INTERACTION_TYPES.TRANSFER]: ['target'],
    [ANT_INTERACTION_TYPES.BALANCE]: ['target'],
    [ANT_INTERACTION_TYPES.CREATE]: [
      'srcCodeTransactionId',
      'initialState',
      'tags',
    ],
  },
};

export class ArweaveTransactionID implements Equatable<ArweaveTransactionID> {
  constructor(private readonly transactionId: string) {
    if (!ARNS_TX_ID_REGEX.test(transactionId)) {
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

export type ArNSTableRow = {
  name: string;
  role: string;
  id: string;
  tier: number | string;
  expiration: Date;
  status: number;
  key: string | number;
};

export type AntMetadata = {
  name: string;
  id: string;
  target: string;
  role: string;
  status: number;
  state: ArNSContractState;
  error?: string;
  key: number;
};

export type ManageAntRow = {
  attribute: string;
  value: string;
  editable: boolean;
  action: any;
  key: number;
};

export enum VALIDATION_INPUT_TYPES {
  ARWEAVE_ID = 'Is valid Arweave Transaction (TX) ID',
  ARWEAVE_ADDRESS = 'Arweave Address',
  ARNS_NAME = 'Arns Name',
  UNDERNAME = 'Undername',
  ANT_CONTRACT_ID = 'Is a valid Arweave Name Token (ANT)',
  // unfortunately we cannot use computed values in enums, so be careful if we ever modify this number
  TRANSACTION_CONFIRMATIONS = `Has sufficient confirmations (50+)`,
}

export type ValidationObject = {
  name: string;
  status: boolean;
  error?: string | undefined;
};
