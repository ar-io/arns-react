import { StepProps } from 'antd';

import { PDNTContract } from '../../services/arweave/PDNTContract';
import {
  ArweaveTransactionID,
  BuyRecordPayload,
  CONTRACT_TYPES,
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
  TransactionData,
  TransactionDataConfig,
  TransactionDataPayload,
  TransferPDNTPayload,
  ValidInteractionType,
} from '../../types';
import {
  MAX_TTL_SECONDS,
  MIN_TTL_SECONDS,
  PDNS_TX_ID_REGEX,
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
    { title: 'Confirm Registration', status: 'process' },
    { title: 'Deploy Registration', status: 'wait' },
    { title: 'Complete', status: 'wait' },
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
    { title: 'Confirm PDNT Name', status: 'process' },
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
      title: 'Set PDNT Details',
      status: 'finish',
    },
    {
      title: 'Confirm PDNT',
      status: 'process',
    },
    {
      title: 'Deploy PDNT',
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
      return {
        domain: transactionData.name,
        id: new ArweaveTransactionID(transactionData.contractTxId),
        overrides: {
          tier: transactionData.tierNumber,
          maxSubdomains: 100, // TODO get subdomain count from contract
          leaseDuration: transactionData.years,
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
        id: new ArweaveTransactionID(transactionData.assetId),
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
        id: new ArweaveTransactionID(transactionData.assetId),
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
        id: new ArweaveTransactionID(transactionData.assetId),
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
        id: new ArweaveTransactionID(transactionData.assetId),
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
        id: new ArweaveTransactionID(transactionData.assetId),
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
        id: new ArweaveTransactionID(transactionData.assetId),
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
        id: new ArweaveTransactionID(transactionData.assetId),
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
        id: new ArweaveTransactionID(transactionData.assetId),
        overrides: {
          'New Owner': transactionData.target,
        },
      };
    }
  }
}

export const FieldToInteractionMap: {
  [x: string]: ValidInteractionType;
} = {
  name: INTERACTION_TYPES.SET_NAME,
  ticker: INTERACTION_TYPES.SET_TICKER,
  targetID: INTERACTION_TYPES.SET_TARGET_ID,
  ttlSeconds: INTERACTION_TYPES.SET_TTL_SECONDS,
  controller: INTERACTION_TYPES.SET_CONTROLLER,
  owner: INTERACTION_TYPES.TRANSFER,
  // TODO: add other interactions
};

export function getInteractionTypeFromField(field: string) {
  // TODO: add contract specification and more interaction fields
  return FieldToInteractionMap[field];
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
    return transactionData.contractTxId.toString() ?? '';
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
export function validateTTLSeconds(ttl: number) {
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
}
