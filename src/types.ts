import type { Dispatch, SetStateAction } from 'react';

import { PDNS_TX_ID_REGEX } from './utils/constants';

export type PdnsRecordEntry = {
  contractTxId: string;
  tier: string;
  endTimestamp: number;
};

export type PdnsDomains = { [x: string]: PdnsRecordEntry };

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

export type PdnsContractJSON = {
  records: PdnsDomains;
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
  approvedPDNTSourceCodeTxs: string[];
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

export type PdnsMapping = {
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

export type PdnsMetaData = {
  image?: string;
  expiration?: Date;
};

export type PdnsDomain = PdnsMapping & PdnsMetaData;

export type JsonWalletProvider = {
  key: any;
};

export interface SmartweaveContractCache {
  getContractState<T extends PDNTContractJSON | PdnsContractJSON>(
    id: ArweaveTransactionID,
  ): Promise<T>;
  getContractBalanceForWallet(
    id: ArweaveTransactionID,
    wallet: ArweaveTransactionID,
  ): Promise<number>;
}

export interface SmartweaveContractInteractionProvider {
  writeTransaction(
    id: ArweaveTransactionID,
    payload: {
      function: string;
      [x: string]: any;
    },
    dryWrite?: boolean,
  ): Promise<ArweaveTransactionID | undefined>;
  deployContract({
    srcCodeTransactionId,
    initialState,
    tags,
  }: {
    srcCodeTransactionId: ArweaveTransactionID;
    initialState: PDNTContractJSON;
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

export interface PdntInteractionProvider {
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
  values?: { [x: string]: PdnsRecordEntry };
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

export type ManageTable = 'pdnts' | 'names';

export const MANAGE_TABLE_NAMES: Record<ManageTable, string> = {
  names: 'Names',
  pdnts: "PDNT's",
};

export enum TRANSACTION_TYPES {
  REGISTRY = 'Pdns Registry',
  PDNT = 'Arweave Name Token',
  TRANSFER = 'Transfer',
}

export enum CONTRACT_TYPES {
  REGISTRY = 'Pdns Registry',
  PDNT = 'Arweave Name Token',
}

export enum ASSET_TYPES {
  PDNT = 'PDNT',
  NAME = 'Pdns Name',
  UNDERNAME = 'Undername',
  COIN = 'coin',
}
export enum REGISTRY_INTERACTION_TYPES {
  BUY_RECORD = 'Buy Pdns Name', //permabuy
  EXTEND_LEASE = 'Extend Lease',
  UPGRADE_TIER = 'Upgrade Tier',
  TRANSFER = 'Transfer IO Tokens',
  BALANCE = 'Balance',
}

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

export type TransferPdntPayload = {
  target: string;
};

export type CreatePdntPayload = {
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
  REMOVE_RECORD = 'Delete Record',
  TRANSFER = 'Transfer',
  BALANCE = 'Balance',
  CREATE = 'Create Arweave Name Token',
}

export type ContractType = (typeof CONTRACT_TYPES)[keyof typeof CONTRACT_TYPES];

export type PdntInteraction =
  (typeof PDNT_INTERACTION_TYPES)[keyof typeof PDNT_INTERACTION_TYPES];
export type RegistryInteraction =
  (typeof REGISTRY_INTERACTION_TYPES)[keyof typeof REGISTRY_INTERACTION_TYPES];

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
  | TransferPdntPayload
  | CreatePdntPayload;

export type TransactionData = TransactionDataBasePayload &
  TransactionDataPayload;

export type TransactionDataConfig = { functionName: string; keys: string[] };

export const TRANSACTION_DATA_KEYS: {
  // specifying interaction types to the correct contract type, to ensure clarity and to prevent crossover of interaction types
  [CONTRACT_TYPES.PDNT]: {
    [K in PdntInteraction]: TransactionDataConfig;
  };
  [CONTRACT_TYPES.REGISTRY]: {
    [K in RegistryInteraction]: TransactionDataConfig;
  };
  /**
   NOTE: benefit of this setup, is that if a new type is added to an enum like PDNT_INTERACTION_TYPES, 
   then an error will occur here, since every key of the type is required to be defined here.
   */
} = {
  [CONTRACT_TYPES.REGISTRY]: {
    [REGISTRY_INTERACTION_TYPES.BUY_RECORD]: {
      functionName: 'buyRecord',
      keys: ['name', 'contractTxId', 'years', 'tierNumber'],
    },
    [REGISTRY_INTERACTION_TYPES.EXTEND_LEASE]: {
      functionName: 'extendLease',
      keys: ['name', 'years'],
    },
    [REGISTRY_INTERACTION_TYPES.UPGRADE_TIER]: {
      functionName: 'upgradeTier',
      keys: ['name', 'tierNumber'],
    },
    [REGISTRY_INTERACTION_TYPES.TRANSFER]: {
      functionName: 'transfer',
      keys: ['target', 'qty'],
    }, // transfer io tokens
    [REGISTRY_INTERACTION_TYPES.BALANCE]: {
      functionName: 'getBalance',
      keys: ['target'],
    },
  },
  [CONTRACT_TYPES.PDNT]: {
    [PDNT_INTERACTION_TYPES.SET_TARGET_ID]: {
      functionName: 'setRecord',
      keys: ['subDomain', 'transactionId', 'ttlSeconds'],
    },
    [PDNT_INTERACTION_TYPES.SET_TICKER]: {
      functionName: 'setTicker',
      keys: ['ticker'],
    },
    [PDNT_INTERACTION_TYPES.SET_CONTROLLER]: {
      functionName: 'setController',
      keys: ['target'],
    },
    [PDNT_INTERACTION_TYPES.SET_NAME]: {
      functionName: 'setName',
      keys: ['name'],
    },
    [PDNT_INTERACTION_TYPES.SET_RECORD]: {
      functionName: 'setRecord',
      keys: ['subDomain', 'transactionId', 'ttlSeconds'],
    },
    [PDNT_INTERACTION_TYPES.REMOVE_RECORD]: {
      functionName: 'removeRecord',
      keys: ['subDomain'],
    },
    [PDNT_INTERACTION_TYPES.TRANSFER]: {
      functionName: 'transfer',
      keys: ['target'],
    },
    [PDNT_INTERACTION_TYPES.BALANCE]: {
      functionName: 'balance',
      keys: ['target'],
    },
    [PDNT_INTERACTION_TYPES.CREATE]: {
      functionName: '',
      keys: ['srcCodeTransactionId', 'initialState'],
    },
  },
};

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

export type PdnsTableRow = {
  name: string;
  role: string;
  id: string;
  tier: number | string;
  expiration: Date;
  status: number;
  key: string | number;
};

export type PdntMetadata = {
  name: string;
  id: string;
  target: string;
  role: string;
  status: number;
  state: PDNTContractJSON;
  error?: string;
  key: number;
};

export type ManagePdntRow = {
  attribute: string;
  value: string;
  editable: boolean;
  action: any;
  key: number;
  interactionType?: PdntInteraction | RegistryInteraction;
};

export enum VALIDATION_INPUT_TYPES {
  ARWEAVE_ID = 'Is valid Arweave Transaction (TX) ID',
  ARWEAVE_ADDRESS = 'Arweave Address',
  PDNS_NAME = 'Pdns Name',
  UNDERNAME = 'Undername',
  PDNT_CONTRACT_ID = 'Is a valid Arweave Name Token (PDNT)',
  // unfortunately we cannot use computed values in enums, so be careful if we ever modify this number
  TRANSACTION_CONFIRMATIONS = `Has sufficient confirmations (50+)`,
}

export type ValidationObject = {
  name: string;
  status: boolean;
  error?: string | undefined;
};
