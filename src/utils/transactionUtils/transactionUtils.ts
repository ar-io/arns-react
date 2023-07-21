import { StepProps } from 'antd';

import { PDNTContract } from '../../services/arweave/PDNTContract';
import {
  ArweaveTransactionID,
  BuyRecordPayload,
  CONTRACT_TYPES,
  ContractInteraction,
  ContractTypes,
  CreatePDNTPayload,
  ExcludedValidInteractionType,
  INTERACTION_TYPES,
  PDNSDomains,
  PDNSMapping,
  PDNSRecordEntry,
  PDNTContractJSON,
  RemoveRecordPayload,
  SetControllerPayload,
  SetNamePayload,
  SetRecordPayload,
  SetTickerPayload,
  SmartWeaveActionInput,
  SmartWeaveActionTags,
  TransactionData,
  TransactionDataConfig,
  TransactionDataPayload,
  TransactionTag,
  TransferPDNTPayload,
  ValidInteractionType,
} from '../../types';
import {
  ATOMIC_FLAG,
  DEFAULT_PDNT_CONTRACT_STATE,
  MAX_TTL_SECONDS,
  MIN_TTL_SECONDS,
  PDNS_TX_ID_REGEX,
  TTL_SECONDS_REGEX,
  YEAR_IN_MILLISECONDS,
} from '../constants';

export function isArweaveTransactionID(id: string) {
  if (!id) {
    return false;
  }
  if (!PDNS_TX_ID_REGEX.test(id)) {
    return false;
  }
  return true;
}

export function isContractType(x: any): x is ContractTypes {
  return Object.values(CONTRACT_TYPES).includes(x);
}

export function isObjectOfTransactionPayloadType<
  T extends TransactionDataPayload,
>(x: Record<string, unknown>, requiredKeys: string[]): x is T {
  if (!requiredKeys.length) {
    throw new Error('No keys were given for validation');
  }
  return requiredKeys.every((k) => Object.keys(x).includes(k));
}

export const WorkflowStepsForInteractions: Record<
  ExcludedValidInteractionType,
  StepProps[]
> = {
  [INTERACTION_TYPES.BUY_RECORD]: [
    { title: 'Choose', description: 'Pick a name', status: 'finish' },
    {
      title: 'Configure',
      description: 'Registration Period',
      status: 'finish',
    },
    { title: 'Confirm', description: 'Review Transaction', status: 'process' },
  ],
  [INTERACTION_TYPES.EXTEND_LEASE]: [
    { title: 'Confirm Extension', status: 'process' },
    { title: 'Deploy Extension', status: 'wait' },
    { title: 'Complete', status: 'wait' },
  ],
  [INTERACTION_TYPES.UPGRADE_TIER]: [
    { title: 'Confirm Tier', status: 'process' },
    { title: 'Deploy Tier Upgrade', status: 'wait' },
    { title: 'Complete', status: 'wait' },
  ],
  [INTERACTION_TYPES.REMOVE_RECORD]: [
    { title: 'Confirm Removal', status: 'process' },
    { title: 'Deploy Removal', status: 'wait' },
    { title: 'Complete', status: 'wait' },
  ],
  [INTERACTION_TYPES.SET_CONTROLLER]: [
    { title: 'Confirm Controller', status: 'process' },
    { title: 'Deploy Controller', status: 'wait' },
    { title: 'Complete', status: 'wait' },
  ],
  [INTERACTION_TYPES.SET_NAME]: [
    { title: 'Confirm ANT Name', status: 'process' },
    { title: 'Deploy Name Change', status: 'wait' },
    { title: 'Complete', status: 'wait' },
  ],
  [INTERACTION_TYPES.SET_RECORD]: [
    { title: 'Confirm Undername Details', status: 'process' },
    { title: 'Deploy Undername', status: 'wait' },
    { title: 'Complete', status: 'wait' },
  ],
  [INTERACTION_TYPES.SET_TICKER]: [
    { title: 'Confirm Ticker', status: 'process' },
    { title: 'Deploy Ticker Change', status: 'wait' },
    { title: 'Complete', status: 'wait' },
  ],
  [INTERACTION_TYPES.TRANSFER]: [
    { title: 'Confirm Transfer', status: 'process' },
    { title: 'Deploy Transfer', status: 'wait' },
    { title: 'Complete', status: 'wait' },
  ],
  [INTERACTION_TYPES.SET_TARGET_ID]: [
    { title: 'Confirm Target ID', status: 'process' },
    { title: 'Deploy Target ID Change', status: 'wait' },
    { title: 'Complete', status: 'wait' },
  ],
  [INTERACTION_TYPES.SET_TTL_SECONDS]: [
    { title: 'Confirm TTL Seconds', status: 'process' },
    { title: 'Deploy TTL Seconds Change', status: 'wait' },
    { title: 'Complete', status: 'wait' },
  ],
  [INTERACTION_TYPES.CREATE]: [
    {
      title: 'Set ANT Details',
      status: 'finish',
    },
    {
      title: 'Confirm ANT',
      status: 'process',
    },
    {
      title: 'Deploy ANT',
      status: 'wait',
    },
    {
      title: 'Complete',
      status: 'wait',
    },
  ],
};

export const TRANSACTION_DATA_KEYS: Record<
  ValidInteractionType,
  TransactionDataConfig
> = {
  [INTERACTION_TYPES.BUY_RECORD]: {
    functionName: 'buyRecord',
    keys: ['name', 'contractTxId', 'years', 'tierNumber'],
  },
  [INTERACTION_TYPES.EXTEND_LEASE]: {
    functionName: 'extendLease',
    keys: ['name', 'years'],
  },
  [INTERACTION_TYPES.UPGRADE_TIER]: {
    functionName: 'upgradeTier',
    keys: ['name', 'tierNumber'],
  },
  [INTERACTION_TYPES.TRANSFER]: {
    functionName: 'transfer',
    keys: ['target', 'qty'],
  }, // transfer io tokens
  [INTERACTION_TYPES.BALANCE]: {
    functionName: 'getBalance',
    keys: ['target'],
  },
  [INTERACTION_TYPES.SET_TTL_SECONDS]: {
    functionName: 'setRecord',
    keys: ['subDomain', 'transactionId', 'ttlSeconds'],
  },
  [INTERACTION_TYPES.SET_TARGET_ID]: {
    functionName: 'setRecord',
    keys: ['subDomain', 'transactionId', 'ttlSeconds'],
  },
  [INTERACTION_TYPES.SET_TICKER]: {
    functionName: 'setTicker',
    keys: ['ticker'],
  },
  [INTERACTION_TYPES.SET_CONTROLLER]: {
    functionName: 'setController',
    keys: ['target'],
  },
  [INTERACTION_TYPES.SET_NAME]: {
    functionName: 'setName',
    keys: ['name'],
  },
  [INTERACTION_TYPES.SET_RECORD]: {
    functionName: 'setRecord',
    keys: ['subDomain', 'transactionId', 'ttlSeconds'],
  },
  [INTERACTION_TYPES.REMOVE_RECORD]: {
    functionName: 'removeRecord',
    keys: ['subDomain'],
  },
  [INTERACTION_TYPES.CREATE]: {
    functionName: '',
    keys: ['srcCodeTransactionId', 'initialState'],
  },
};

export const getWorkflowStepsForInteraction = (
  interaction: ExcludedValidInteractionType,
): StepProps[] => {
  return structuredClone(WorkflowStepsForInteractions[interaction]);
};

export function getPDNSMappingByInteractionType(
  // can be used to generate PDNTCard props: <PDNTCard {...props = getPDNSMappingByInteractionType()} />
  {
    interactionType,
    transactionData,
  }: {
    interactionType: ValidInteractionType;
    transactionData: TransactionData;
  },
): PDNSMapping | undefined {
  switch (interactionType) {
    case INTERACTION_TYPES.BUY_RECORD: {
      if (
        !isObjectOfTransactionPayloadType<BuyRecordPayload>(
          transactionData,
          TRANSACTION_DATA_KEYS[INTERACTION_TYPES.BUY_RECORD].keys,
        )
      ) {
        throw new Error(
          'transaction data not of correct payload type <BuyRecordPayload>',
        );
      }
      if (
        transactionData.contractTxId === ATOMIC_FLAG &&
        !transactionData.state
      ) {
        throw new Error(
          'Atomic transaction detected but no state present, add the state to continue.',
        );
      }
      const years = Date.now() + YEAR_IN_MILLISECONDS * transactionData.years;
      console.log;

      return {
        domain: transactionData.name,
        contractTxId:
          transactionData.contractTxId === ATOMIC_FLAG
            ? transactionData.deployedTransactionId
              ? transactionData.deployedTransactionId
              : ATOMIC_FLAG.toLocaleUpperCase('en-US')
            : new ArweaveTransactionID(transactionData.contractTxId),
        deployedTransactionId: transactionData.deployedTransactionId,
        state: transactionData.state ?? undefined,
        overrides: {
          maxUndernames: 'Up to 100', // TODO get subdomain count from contract
          leaseDuration: years,
        },
      };
    }

    case INTERACTION_TYPES.CREATE: {
      if (
        !isObjectOfTransactionPayloadType<CreatePDNTPayload>(
          transactionData,
          TRANSACTION_DATA_KEYS[INTERACTION_TYPES.CREATE].keys,
        )
      ) {
        throw new Error(
          'transaction data not of correct payload type <CreatePDNTPayload>',
        );
      }
      const pdnt = new PDNTContract(transactionData.initialState);
      return {
        domain: '',
        state: pdnt.state,
        disabledKeys: ['domain', 'evolve', 'id', 'tier'],
      };
    }
    case INTERACTION_TYPES.SET_NAME: {
      if (
        !isObjectOfTransactionPayloadType<SetNamePayload>(
          transactionData,
          TRANSACTION_DATA_KEYS[INTERACTION_TYPES.SET_NAME].keys,
        )
      ) {
        throw new Error(
          'transaction data not of correct payload type <SetNamePayload>',
        );
      }
      return {
        domain: '',
        contractTxId: new ArweaveTransactionID(transactionData.assetId),
        overrides: {
          nickname: transactionData.name,
        },
        disabledKeys: [
          'evolve',
          'maxSubdomains',
          'domain',
          'leaseDuration',
          'ttlSeconds',
        ],
      };
    }
    case INTERACTION_TYPES.SET_TICKER: {
      if (
        !isObjectOfTransactionPayloadType<SetTickerPayload>(
          transactionData,
          TRANSACTION_DATA_KEYS[INTERACTION_TYPES.SET_TICKER].keys,
        )
      ) {
        throw new Error(
          `transaction data not of correct payload type <SetTickerPayload> keys: ${Object.keys(
            transactionData,
          )}`,
        );
      }
      return {
        domain: '',
        contractTxId: new ArweaveTransactionID(transactionData.assetId),
        overrides: {
          ticker: transactionData.ticker,
        },
        disabledKeys: [
          'evolve',
          'maxSubdomains',
          'domain',
          'leaseDuration',
          'ttlSeconds',
        ],
      };
    }
    case INTERACTION_TYPES.REMOVE_RECORD: {
      if (
        !isObjectOfTransactionPayloadType<RemoveRecordPayload>(
          transactionData,
          TRANSACTION_DATA_KEYS[INTERACTION_TYPES.REMOVE_RECORD].keys,
        )
      ) {
        throw new Error(
          `transaction data not of correct payload type <SetRecordPayload> keys: ${Object.keys(
            transactionData,
          )}`,
        );
      }
      return {
        domain: '',
        contractTxId: new ArweaveTransactionID(transactionData.assetId),
        overrides: {
          undername: transactionData.subDomain,
        },
        disabledKeys: [
          'evolve',
          'maxSubdomains',
          'domain',
          'leaseDuration',
          'tier',
        ],
      };
    }
    case INTERACTION_TYPES.SET_RECORD: {
      if (
        !isObjectOfTransactionPayloadType<SetRecordPayload>(
          transactionData,
          TRANSACTION_DATA_KEYS[INTERACTION_TYPES.SET_TARGET_ID].keys,
        )
      ) {
        throw new Error(
          `transaction data not of correct payload type <SetRecordPayload> keys: ${Object.keys(
            transactionData,
          )}`,
        );
      }
      return {
        domain: '',
        contractTxId: new ArweaveTransactionID(transactionData.assetId),
        overrides: {
          undername: transactionData.subDomain,
          targetId: transactionData.transactionId,
          ttlSeconds: transactionData.ttlSeconds,
        },
        disabledKeys: [
          'evolve',
          'maxSubdomains',
          'domain',
          'leaseDuration',
          'tier',
        ],
      };
    }
    case INTERACTION_TYPES.SET_TARGET_ID: {
      if (
        !isObjectOfTransactionPayloadType<SetRecordPayload>(
          transactionData,
          TRANSACTION_DATA_KEYS[INTERACTION_TYPES.SET_TARGET_ID].keys,
        )
      ) {
        throw new Error(
          `transaction data not of correct payload type <SetRecordPayload> keys: ${Object.keys(
            transactionData,
          )}`,
        );
      }
      return {
        domain: '',
        contractTxId: new ArweaveTransactionID(transactionData.assetId),
        overrides: {
          targetId: transactionData.transactionId,
        },
        disabledKeys: [
          'evolve',
          'maxSubdomains',
          'domain',
          'leaseDuration',
          'ttlSeconds',
          'tier',
        ],
      };
    }
    case INTERACTION_TYPES.SET_TTL_SECONDS: {
      if (
        !isObjectOfTransactionPayloadType<SetRecordPayload>(
          transactionData,
          TRANSACTION_DATA_KEYS[INTERACTION_TYPES.SET_TTL_SECONDS].keys,
        )
      ) {
        throw new Error(
          `transaction data not of correct payload type <SetRecordPayload> keys: ${Object.keys(
            transactionData,
          )}`,
        );
      }
      return {
        domain: '',
        contractTxId: new ArweaveTransactionID(transactionData.assetId),
        overrides: {
          ttlSeconds: transactionData.ttlSeconds,
        },
        disabledKeys: [
          'evolve',
          'maxSubdomains',
          'domain',
          'leaseDuration',
          'tier',
        ],
      };
    }

    case INTERACTION_TYPES.SET_CONTROLLER: {
      if (
        !isObjectOfTransactionPayloadType<SetControllerPayload>(
          transactionData,
          TRANSACTION_DATA_KEYS[INTERACTION_TYPES.SET_CONTROLLER].keys,
        )
      ) {
        throw new Error(
          `transaction data not of correct payload type <SetControllerPayload> keys: ${Object.keys(
            transactionData,
          )}`,
        );
      }
      return {
        domain: '',
        contractTxId: new ArweaveTransactionID(transactionData.assetId),
        overrides: {
          controller: transactionData.target,
        },
        disabledKeys: [
          'evolve',
          'maxSubdomains',
          'domain',
          'leaseDuration',
          'tier',
        ],
      };
    }
    case INTERACTION_TYPES.TRANSFER: {
      if (
        !isObjectOfTransactionPayloadType<TransferPDNTPayload>(
          transactionData,
          TRANSACTION_DATA_KEYS[INTERACTION_TYPES.TRANSFER].keys,
        )
      ) {
        throw new Error(
          `transaction data not of correct payload type <TransferPDNTPayload> keys: ${Object.keys(
            transactionData,
          )}`,
        );
      }
      return {
        domain: '',
        contractTxId: new ArweaveTransactionID(transactionData.assetId),
        overrides: {
          'New Owner': transactionData.target,
        },
      };
    }
  }
}

export const FieldToInteractionMap: {
  [x: string]: {
    title: ExcludedValidInteractionType;
    function: string;
    name?: string;
  };
} = {
  name: {
    title: INTERACTION_TYPES.SET_NAME,
    function: 'setName',
  },
  ticker: {
    title: INTERACTION_TYPES.SET_TICKER,
    function: 'setTicker',
  },
  targetID: {
    title: INTERACTION_TYPES.SET_TARGET_ID,
    function: 'setRecord',
    name: 'transactionId',
  },
  ttlSeconds: {
    title: INTERACTION_TYPES.SET_TTL_SECONDS,
    function: 'setRecord',
  },
  controller: {
    title: INTERACTION_TYPES.SET_CONTROLLER,
    function: 'setController',
    name: 'target',
  },
  owner: {
    title: INTERACTION_TYPES.TRANSFER,
    function: 'transfer',
    name: 'target',
  },
  // TODO: add other interactions
};

export function getInteractionTypeFromField(field: string) {
  return FieldToInteractionMap[field]?.title;
}

export function getInteractionFunctionFromField(field: string) {
  return FieldToInteractionMap[field]?.function;
}

export function getInteractionAttributeNameFromField(field: string) {
  return FieldToInteractionMap[field]?.name ?? field;
}

export function getAttributesFromInteractionFunction(f: string) {
  const attributes: string[] = [];
  for (const key in FieldToInteractionMap) {
    if (getInteractionFunctionFromField(key) === f) {
      attributes.push(key);
    }
  }
  return attributes;
}

export function mapTransactionDataKeyToPayload(
  interactionType: ValidInteractionType,
  data: string | number | Array<string | number | PDNTContractJSON>,
): TransactionData | undefined {
  const txData = typeof data === 'object' ? data : [data];
  if (!data) {
    throw new Error('No data provided, data is required to build the payload');
  }

  const payload = TRANSACTION_DATA_KEYS[interactionType].keys.reduce(
    (accum: any, k: string, index: number) => {
      if (!txData[index]) {
        // if missing transaction data from the url, throw an error
        throw new Error(
          `Missing key (${k}) from transaction data in the url. This may be due to the order of the data, the current order is [${txData}], the correct order is [${TRANSACTION_DATA_KEYS[interactionType].keys}]`,
        );
      }
      accum[k] = txData[index];
      return accum;
    },
    {},
  );
  return {
    ...payload,
    functionName: TRANSACTION_DATA_KEYS[interactionType].functionName,
  };
}

export function getLinkId(
  interactionType: ValidInteractionType,
  transactionData: TransactionData,
): string {
  if (
    interactionType === INTERACTION_TYPES.BUY_RECORD &&
    isObjectOfTransactionPayloadType<BuyRecordPayload>(
      transactionData,
      TRANSACTION_DATA_KEYS[INTERACTION_TYPES.BUY_RECORD].keys,
    )
  ) {
    return transactionData.contractTxId === ATOMIC_FLAG &&
      transactionData.deployedTransactionId
      ? transactionData.deployedTransactionId.toString()
      : transactionData.contractTxId.toString();
  }
  if (
    interactionType === INTERACTION_TYPES.CREATE &&
    isObjectOfTransactionPayloadType<CreatePDNTPayload>(
      transactionData,
      TRANSACTION_DATA_KEYS[INTERACTION_TYPES.CREATE].keys,
    )
  ) {
    return transactionData.deployedTransactionId?.toString() ?? '';
  }
  return transactionData.assetId.toString();
}

export function getAssociatedNames(
  txId: ArweaveTransactionID,
  records: PDNSDomains,
) {
  return Object.entries(records)
    .map(([name, recordEntry]: [string, PDNSRecordEntry]) => {
      if (recordEntry.contractTxId === txId.toString()) return name;
    })
    .filter((n) => !!n);
}
export async function validateTTLSeconds(ttl: number): Promise<void> {
  if (ttl < MIN_TTL_SECONDS) {
    throw new Error(
      `${ttl} is less than the minimum ttlSeconds requirement of ${MIN_TTL_SECONDS}`,
    );
  }
  if (ttl > MAX_TTL_SECONDS) {
    throw new Error(
      `${ttl} is more than the maximum ttlSeconds requirement of ${MAX_TTL_SECONDS}`,
    );
  }
  if (!TTL_SECONDS_REGEX.test(ttl.toString())) {
    throw new Error(`${ttl} is not a valid ttlSeconds value`);
  }
}

export function getPendingInteractionsRowsForContract(
  pendingContractInteractions: ContractInteraction[],
  existingValues: any,
): {
  attribute: string;
  value: string;
  id: string;
  valid: boolean | undefined;
}[] {
  // find all pending interactions for the contract, find relevant ones related to row attributes
  const pendingTxRowData = [];
  for (const i of pendingContractInteractions) {
    const attributes = getAttributesFromInteractionFunction(i.payload.function);
    // TODO: this is not pretty, and could be avoided if we rework the ANT contract to allow `setTTL` and `setTransaction` rather than all of them
    // relying only on setRecord.
    for (const attribute of attributes) {
      // the payload value may be different then the attribute name
      const payloadAttribute = getInteractionAttributeNameFromField(attribute);
      const nonConfirmedTx = {
        attribute,
        value: i.payload[payloadAttribute],
        id: i.id,
        valid: i.valid,
      };
      if (existingValues[attribute] !== nonConfirmedTx.value) {
        pendingTxRowData.push(nonConfirmedTx);
      }
    }
  }
  return pendingTxRowData;
}
export function generateAtomicState(
  domain: string,
  walletAddress: ArweaveTransactionID,
): PDNTContractJSON {
  return {
    ...DEFAULT_PDNT_CONTRACT_STATE,
    name: `ANT-${domain.toUpperCase()}`,
    ticker: 'ANT',
    owner: walletAddress.toString(),
    controller: walletAddress.toString(),
    balances: { [walletAddress.toString()]: 1 },
  };
}

export function buildSmartweaveInteractionTags({
  contractId,
  input,
}: {
  contractId: ArweaveTransactionID;
  input: SmartWeaveActionInput;
}): TransactionTag[] {
  const tags: SmartWeaveActionTags = [
    {
      name: 'App-Name',
      value: 'SmartWeaveAction',
    },
    {
      name: 'Contract',
      value: contractId.toString(),
    },
    {
      name: 'Input',
      value: JSON.stringify(input),
    },
  ];
  return tags;
}
