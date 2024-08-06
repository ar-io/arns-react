import { StepProps } from 'antd';

import { ArweaveTransactionID } from '../../services/arweave/ArweaveTransactionID';
import {
  ARNSMapping,
  ARNS_INTERACTION_TYPES,
  BuyRecordPayload,
  CONTRACT_TYPES,
  ContractTypes,
  ExcludedValidInteractionType,
  ExtendLeasePayload,
  INTERACTION_TYPES,
  IncreaseUndernamesPayload,
  InteractionTypes,
  RemoveRecordPayload,
  SetControllerPayload,
  SetNamePayload,
  SetRecordPayload,
  SetTickerPayload,
  TRANSACTION_TYPES,
  TransactionData,
  TransactionDataConfig,
  TransactionDataPayload,
  TransferANTPayload,
  TransferIOPayload,
  ValidInteractionType,
} from '../../types';
import {
  ARNS_TX_ID_REGEX,
  DEFAULT_ANT_CONTRACT_STATE,
  DEFAULT_MAX_UNDERNAMES,
  MAX_TTL_SECONDS,
  MIN_TTL_SECONDS,
  TTL_SECONDS_REGEX,
  YEAR_IN_MILLISECONDS,
} from '../constants';
import eventEmitter from '../events';

export function isArweaveTransactionID(id?: string) {
  if (!id) {
    return false;
  }
  if (!ARNS_TX_ID_REGEX.test(id)) {
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
  [INTERACTION_TYPES.INCREASE_UNDERNAMES]: [],
  [INTERACTION_TYPES.EXTEND_LEASE]: [],
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
  [INTERACTION_TYPES.REMOVE_CONTROLLER]: [
    { title: 'Confirm Remove Controller', status: 'process' },
    { title: 'Deploy Remove Controller', status: 'wait' },
    { title: 'Removal Complete', status: 'wait' },
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
  [INTERACTION_TYPES.EDIT_RECORD]: [
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
  [INTERACTION_TYPES.TRANSFER_ANT]: [
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
};

export const TRANSACTION_DATA_KEYS: Record<
  ValidInteractionType,
  TransactionDataConfig
> = {
  [INTERACTION_TYPES.BUY_RECORD]: {
    functionName: 'buyRecord',
    keys: ['name', 'processId', 'type'],
  },
  [INTERACTION_TYPES.INCREASE_UNDERNAMES]: {
    functionName: 'increaseUndernames',
    keys: ['name', 'qty'],
  },
  [INTERACTION_TYPES.EXTEND_LEASE]: {
    functionName: 'extendLease',
    keys: ['name', 'years'],
  },
  [INTERACTION_TYPES.TRANSFER]: {
    functionName: 'transfer',
    keys: ['target', 'qty'],
  },
  [INTERACTION_TYPES.TRANSFER_ANT]: {
    functionName: 'transfer',
    keys: ['target'],
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
  [INTERACTION_TYPES.REMOVE_CONTROLLER]: {
    functionName: 'removeController',
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
  [INTERACTION_TYPES.EDIT_RECORD]: {
    functionName: 'setRecord',
    keys: ['subDomain', 'transactionId', 'ttlSeconds'],
  },
  [INTERACTION_TYPES.REMOVE_RECORD]: {
    functionName: 'removeRecord',
    keys: ['subDomain'],
  },
};

export const getWorkflowStepsForInteraction = (
  interaction?: ExcludedValidInteractionType,
): StepProps[] | undefined => {
  if (!interaction) return undefined;
  return structuredClone(WorkflowStepsForInteractions[interaction]);
};

export function getARNSMappingByInteractionType(
  // can be used to generate ANTCard props: <ANTCard {...props = getARNSMappingByInteractionType()} />
  {
    interactionType,
    transactionData,
  }: {
    interactionType: ValidInteractionType;
    transactionData: TransactionData;
  },
): ARNSMapping | undefined {
  switch (interactionType) {
    case ARNS_INTERACTION_TYPES.BUY_RECORD: {
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

      const years =
        transactionData.type === TRANSACTION_TYPES.LEASE &&
        transactionData.years
          ? Date.now() + YEAR_IN_MILLISECONDS * transactionData.years
          : 'Indefinite';

      const processId =
        transactionData.processId === 'atomic'
          ? 'atomic'
          : new ArweaveTransactionID(transactionData.processId);

      return {
        domain: transactionData.name,
        processId: processId,
        deployedTransactionId: transactionData.deployedTransactionId,
        overrides: {
          maxUndernames: `Up to ${DEFAULT_MAX_UNDERNAMES}`,
          leaseDuration: years,
        },
        primaryDefaultKeys: [
          'domain',
          'leaseDuration',
          'maxUndernames',
          'owner',
        ],
      };
    }

    case ARNS_INTERACTION_TYPES.INCREASE_UNDERNAMES: {
      if (
        !isObjectOfTransactionPayloadType<IncreaseUndernamesPayload>(
          transactionData,
          TRANSACTION_DATA_KEYS[INTERACTION_TYPES.INCREASE_UNDERNAMES].keys,
        )
      ) {
        throw new Error(
          'transaction data not of correct payload type <IncreaseUndernamesPayload>',
        );
      }

      return {
        domain: transactionData.name,
        processId: new ArweaveTransactionID(transactionData.processId),
        deployedTransactionId: transactionData.deployedTransactionId,
        overrides: {
          maxUndernames: transactionData.deployedTransactionId ? (
            <span className="white">
              Up to{' '}
              <span style={{ color: 'var(--success-green)' }}>
                {transactionData.qty + transactionData.oldQty!}
              </span>
            </span>
          ) : (
            <span className="add-box center">
              {transactionData.qty + transactionData.oldQty!}
            </span>
          ),
        },
        primaryDefaultKeys: [
          'domain',
          'leaseDuration',
          'maxUndernames',
          'owner',
        ],
      };
    }
    case ARNS_INTERACTION_TYPES.EXTEND_LEASE: {
      if (
        !isObjectOfTransactionPayloadType<ExtendLeasePayload>(
          transactionData,
          TRANSACTION_DATA_KEYS[INTERACTION_TYPES.EXTEND_LEASE].keys,
        )
      ) {
        throw new Error(
          'transaction data not of correct payload type <ExtendLeasePayload>',
        );
      }

      return {
        domain: transactionData.name,
        processId: transactionData.processId,
        deployedTransactionId: transactionData.deployedTransactionId,
        record: transactionData.arnsRecord,
        overrides: {
          leaseDuration: transactionData.deployedTransactionId ? (
            <span className="white">
              <span style={{ color: 'var(--success-green)' }}>
                {transactionData.years} year
                {transactionData.years > 1 ? 's' : ''}
              </span>
            </span>
          ) : (
            <span className="add-box center">
              {transactionData.years} year{transactionData.years > 1 ? 's' : ''}
            </span>
          ),
        },
        primaryDefaultKeys: [
          'domain',
          'leaseDuration',
          'maxUndernames',
          'owner',
        ],
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
        processId: new ArweaveTransactionID(transactionData.assetId),
        deployedTransactionId: transactionData.deployedTransactionId,
        overrides: {
          name: transactionData.name,
        },
        disabledKeys: [
          'evolve',
          'maxSubdomains',
          'maxUndernames',
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
        processId: new ArweaveTransactionID(transactionData.assetId),
        deployedTransactionId: transactionData.deployedTransactionId,
        overrides: {
          ticker: transactionData.ticker,
        },
        disabledKeys: [
          'evolve',
          'maxSubdomains',
          'maxUndernames',
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
        processId: new ArweaveTransactionID(transactionData.assetId),
        deployedTransactionId: transactionData.deployedTransactionId,
        overrides: {
          undername: transactionData.subDomain,
        },
        disabledKeys: [
          'evolve',
          'maxSubdomains',
          'maxUndernames',
          'domain',
          'leaseDuration',
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
        processId: new ArweaveTransactionID(transactionData.assetId),
        deployedTransactionId: transactionData.deployedTransactionId,
        overrides: {
          undername: transactionData.subDomain,
          targetId: transactionData.transactionId,
          ttlSeconds: transactionData.ttlSeconds,
        },
        disabledKeys: [
          'evolve',
          'maxSubdomains',
          'maxUndernames',
          'domain',
          'leaseDuration',
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
        processId: new ArweaveTransactionID(transactionData.assetId),
        deployedTransactionId: transactionData.deployedTransactionId,
        overrides: {
          targetId: transactionData.transactionId,
        },
        disabledKeys: [
          'evolve',
          'maxSubdomains',
          'maxUndernames',
          'domain',
          'leaseDuration',
          'ttlSeconds',
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
        processId: new ArweaveTransactionID(transactionData.assetId),
        deployedTransactionId: transactionData.deployedTransactionId,
        overrides: {
          ttlSeconds: transactionData.ttlSeconds,
        },
        disabledKeys: [
          'evolve',
          'maxSubdomains',
          'maxUndernames',
          'domain',
          'leaseDuration',
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
        processId: new ArweaveTransactionID(transactionData.assetId),
        deployedTransactionId: transactionData.deployedTransactionId,
        overrides: {
          controllers: <span>{transactionData.target}</span>,
        },
        disabledKeys: [
          'evolve',
          'maxSubdomains',
          'maxUndernames',
          'domain',
          'leaseDuration',
        ],
      };
    }
    case INTERACTION_TYPES.TRANSFER: {
      if (
        !isObjectOfTransactionPayloadType<TransferIOPayload>(
          transactionData,
          TRANSACTION_DATA_KEYS[INTERACTION_TYPES.TRANSFER].keys,
        )
      ) {
        throw new Error(
          `transaction data not of correct payload type <TransferANTPayload> keys: ${Object.keys(
            transactionData,
          )}`,
        );
      }
      return {
        domain: '',
        processId: new ArweaveTransactionID(transactionData.assetId),
        deployedTransactionId: transactionData.deployedTransactionId,
        overrides: {
          'New Owner': transactionData.target,
        },
        compact: false,
        disabledKeys: ['maxUndernames', 'owner', 'controller', 'ttlSeconds'],
      };
    }
    case INTERACTION_TYPES.TRANSFER_ANT: {
      if (
        !isObjectOfTransactionPayloadType<TransferANTPayload>(
          transactionData,
          TRANSACTION_DATA_KEYS[INTERACTION_TYPES.TRANSFER_ANT].keys,
        )
      ) {
        throw new Error(
          `transaction data not of correct payload type <TransferANTPayload> keys: ${Object.keys(
            transactionData,
          )}`,
        );
      }
      return {
        domain: '',
        processId: new ArweaveTransactionID(transactionData.assetId),
        deployedTransactionId: transactionData.deployedTransactionId,
        overrides: {
          'New Owner': transactionData.target,
        },
        compact: false,
        disabledKeys: ['maxUndernames', 'owner', 'controller', 'ttlSeconds'],
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
  data: string | number | Array<string | number>,
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
  const isBuyRecord = interactionType === ARNS_INTERACTION_TYPES.BUY_RECORD;

  const isExtendLease = interactionType === ARNS_INTERACTION_TYPES.EXTEND_LEASE;

  const isIncreaseUndernames =
    interactionType === ARNS_INTERACTION_TYPES.INCREASE_UNDERNAMES;

  if (isBuyRecord || isExtendLease || isIncreaseUndernames) {
    if (!(transactionData as any).processId) {
      throw new Error('No processId found');
    }
    return (transactionData as any).name?.toString();
  }

  return transactionData.assetId.toString();
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

export function generateAtomicState(
  domain: string,
  walletAddress: ArweaveTransactionID,
  targetId?: ArweaveTransactionID,
) {
  const records = { ...DEFAULT_ANT_CONTRACT_STATE.records };

  if (targetId) {
    records['@'].transactionId = targetId.toString();
  }

  return {
    ...DEFAULT_ANT_CONTRACT_STATE,
    name: domain,
    ticker: `ANT-${domain.toUpperCase()}`,
    owner: walletAddress.toString(),
    controllers: [walletAddress.toString()],
    balances: { [walletAddress.toString()]: 1 },
    records,
  };
}

export async function withExponentialBackoff<T>({
  fn,
  shouldRetry,
  maxTries,
  initialDelay,
}: {
  fn: () => Promise<T>;
  shouldRetry: (error: any, attempt: number, nextAttemptMs: number) => boolean;
  maxTries: number;
  initialDelay: number;
}): Promise<T> {
  let delay = initialDelay;

  for (let tries = 0; tries < maxTries; tries++) {
    try {
      const result = await fn();
      if (shouldRetry(result, tries, delay * 2)) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2; // Double the delay for the next attempt
      } else {
        return result;
      }
    } catch (error) {
      eventEmitter.emit('error', error);
    }
  }
  throw new Error('Maximum retry attempts reached');
}

export function pruneExtraDataFromTransactionPayload(
  interactionType: InteractionTypes,
  payload: TransactionDataPayload,
): TransactionDataPayload {
  const requiredKeys = TRANSACTION_DATA_KEYS[interactionType].keys;
  const cleanPayload = Object.entries(payload).reduce<TransactionDataPayload>(
    (accum: TransactionDataPayload, [k, v]: [any, any]) => {
      if (requiredKeys.includes(k)) {
        accum[k as keyof TransactionDataPayload] = v as keyof typeof accum;
      }
      return accum;
    },
    {} as TransactionDataPayload,
  );
  return cleanPayload;
}

/**
 * Checks if a user has sufficient balance for a given set of costs.
 * This function iterates over each cost item, verifying if the user's balance for that item
 * is equal to or greater than the cost. If the balance is insufficient for any item,
 * it throws an Error with a specific message indicating the shortfall in a case-sensitive manner.
 *
 * @param {Object} params - The parameters object.
 * @param {T} params.balances - An object representing the user's current balances,
 * where the keys are the item names (case-sensitive) and values are their corresponding balances.
 * @param {T} params.costs - An object representing the costs,
 * structured similarly to the balances object, with keys as item names and values as the required amounts.
 * @throws {Error} - Throws an error with a message indicating the specific item for which the balance is insufficient,
 * including the current balance and the additional amount required.
 * @return {boolean} - Returns true if the user has a sufficient balance for all costs.
 * @template T - A generic type extending a Record of string keys to number values,
 * used for both the 'balances' and 'costs' parameters.
 */
export function userHasSufficientBalance<T extends Record<string, number>>({
  balances,
  costs,
}: {
  balances: T;
  costs: T;
}): Error[] {
  // TODO: emit multiple errors if multiple balances are insufficient
  return Object.entries(costs).reduce((acc: Error[], [key, value]) => {
    if (!(balances[key] >= value)) {
      acc.push(
        new Error(
          `Insufficient balance of ${key}, user has ${
            balances[key]
          } and needs ${
            value - balances[key]
          } more ${key} to pay for this transaction.`,
        ),
      );
    }
    return acc;
  }, []);
}

export function mioToIo(mio: number): number {
  return mio / 1_000_000;
}
