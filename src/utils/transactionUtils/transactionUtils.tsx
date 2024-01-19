import { StepProps } from 'antd';
import { Tag, Tags } from 'warp-contracts';

import { ArweaveTransactionID } from '../../services/arweave/ArweaveTransactionID';
import {
  ANTContractJSON,
  ARNSMapping,
  BuyRecordPayload,
  CONTRACT_TYPES,
  ContractInteraction,
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
  SmartWeaveActionInput,
  SmartWeaveActionTags,
  SubmitAuctionBidPayload,
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
  ATOMIC_FLAG,
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
  [INTERACTION_TYPES.SUBMIT_AUCTION_BID]: [
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
    keys: ['name', 'contractTxId', 'auction', 'type'],
  },
  [INTERACTION_TYPES.SUBMIT_AUCTION_BID]: {
    functionName: 'submitAuctionBid',
    keys: ['name', 'contractTxId', 'qty'],
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
  interaction: ExcludedValidInteractionType,
): StepProps[] => {
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
      const years =
        transactionData.type === TRANSACTION_TYPES.LEASE &&
        transactionData.years
          ? Date.now() + YEAR_IN_MILLISECONDS * transactionData.years
          : 'Indefinite';

      const contractTxId =
        transactionData.contractTxId === ATOMIC_FLAG
          ? transactionData.deployedTransactionId
            ? transactionData.deployedTransactionId
            : ATOMIC_FLAG
          : new ArweaveTransactionID(transactionData.contractTxId);

      return {
        domain: transactionData.name,
        contractTxId: contractTxId,
        deployedTransactionId: transactionData.deployedTransactionId,
        state: transactionData.state ?? undefined,
        overrides: {
          maxUndernames: `Up to ${DEFAULT_MAX_UNDERNAMES}`,
          leaseDuration: years,
        },
      };
    }

    case INTERACTION_TYPES.SUBMIT_AUCTION_BID: {
      if (
        !isObjectOfTransactionPayloadType<SubmitAuctionBidPayload>(
          transactionData,
          TRANSACTION_DATA_KEYS[INTERACTION_TYPES.SUBMIT_AUCTION_BID].keys,
        )
      ) {
        throw new Error(
          'transaction data not of correct payload type <SubmitAuctionBidPayload>',
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
      return {
        domain: transactionData.name,
        contractTxId:
          transactionData.contractTxId === ATOMIC_FLAG
            ? transactionData.deployedTransactionId
            : new ArweaveTransactionID(transactionData.contractTxId),
        state: transactionData.state ?? undefined,
        // TODO: set qty for the auction bid based on the auction data
        overrides: {
          maxUndernames: `Up to ${DEFAULT_MAX_UNDERNAMES}`,
        },
      };
    }

    case INTERACTION_TYPES.INCREASE_UNDERNAMES: {
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
        contractTxId: new ArweaveTransactionID(transactionData.contractTxId),
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
        compact: false,
      };
    }
    case INTERACTION_TYPES.EXTEND_LEASE: {
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
        contractTxId: transactionData.contractTxId,
        deployedTransactionId: transactionData.deployedTransactionId,
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
        compact: false,
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
        contractTxId: new ArweaveTransactionID(transactionData.assetId),
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
        contractTxId: new ArweaveTransactionID(transactionData.assetId),
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
        contractTxId: new ArweaveTransactionID(transactionData.assetId),
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
        contractTxId: new ArweaveTransactionID(transactionData.assetId),
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
        contractTxId: new ArweaveTransactionID(transactionData.assetId),
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
        contractTxId: new ArweaveTransactionID(transactionData.assetId),
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
        contractTxId: new ArweaveTransactionID(transactionData.assetId),
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
        contractTxId: new ArweaveTransactionID(transactionData.assetId),
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
  data: string | number | Array<string | number | ANTContractJSON>,
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
  const isBuyRecord =
    interactionType === INTERACTION_TYPES.BUY_RECORD &&
    isObjectOfTransactionPayloadType<BuyRecordPayload>(
      transactionData,
      TRANSACTION_DATA_KEYS[INTERACTION_TYPES.BUY_RECORD].keys,
    );

  const isExtendLease =
    interactionType === INTERACTION_TYPES.EXTEND_LEASE &&
    isObjectOfTransactionPayloadType<ExtendLeasePayload>(
      transactionData,
      TRANSACTION_DATA_KEYS[INTERACTION_TYPES.EXTEND_LEASE].keys,
    );

  const isIncreaseUndernames =
    interactionType === INTERACTION_TYPES.INCREASE_UNDERNAMES &&
    isObjectOfTransactionPayloadType<IncreaseUndernamesPayload>(
      transactionData,
      TRANSACTION_DATA_KEYS[INTERACTION_TYPES.INCREASE_UNDERNAMES].keys,
    );

  if (isBuyRecord || isExtendLease || isIncreaseUndernames) {
    return transactionData.contractTxId === ATOMIC_FLAG &&
      transactionData.deployedTransactionId
      ? transactionData.deployedTransactionId.toString()
      : transactionData.contractTxId?.toString() ?? '';
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

export function getPendingInteractionsRowsForContract(
  pendingContractInteractions: ContractInteraction[],
  existingValues: any,
): {
  attribute: string;
  value: string | number | boolean;
  id: string;
  valid: boolean | undefined;
}[] {
  // find all pending interactions for the contract, find relevant ones related to row attributes
  const pendingTxRowData: {
    attribute: string;
    value: string | number | boolean;
    id: string;
    valid: boolean | undefined;
  }[] = [];
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
): ANTContractJSON {
  return {
    ...DEFAULT_ANT_CONTRACT_STATE,
    name: `ANT-${domain.toUpperCase()}`,
    ticker: 'ANT',
    owner: walletAddress.toString(),
    controllers: [walletAddress.toString()],
    balances: { [walletAddress.toString()]: 1 },
  };
}

export function buildSmartweaveContractTags({
  contractSrc,
}: //initState, TODO: add init state support for atomic assets
{
  contractSrc: ArweaveTransactionID;
  // initState?: Record<any, any> | string;
}): Tags {
  const tags = [
    {
      name: 'Content-Type',
      value: 'application/json',
    },
    {
      name: 'App-Name',
      value: 'SmartWeaveContract',
    },
    {
      name: 'App-Version',
      value: '0.3.0',
    },
    {
      name: 'Contract-Src',
      value: contractSrc.toString(),
    },

    // ...(initState
    //   ? [
    //       {
    //         name: 'Init-State',
    //         value:
    //           typeof initState === 'string'
    //             ? initState
    //             : JSON.stringify(initState),
    //       },
    //     ]
    //   : []),
  ];
  return tags.map((t) => new Tag(t?.name, t?.value));
}

export function buildSmartweaveInteractionTags({
  contractId,
  input,
}: {
  contractId: ArweaveTransactionID;
  input: SmartWeaveActionInput;
}): Tags {
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
  return tags.map((t) => new Tag(t.name, t.value));
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

// TODO: maybe use binary search?
export const getPriceByBlockHeight = (
  prices: Record<string, number>,
  currentHeight: number,
) => {
  const heightKeys = Object.keys(prices).map((k) => +k);
  if (!heightKeys.length) {
    throw new Error(`No prices found for auction`);
  }

  if (currentHeight < heightKeys[1]) {
    return prices[heightKeys[0].toString()];
  }

  if (currentHeight >= heightKeys[heightKeys.length - 1]) {
    return prices[heightKeys[heightKeys.length - 1].toString()];
  }

  for (let i = 0; i < heightKeys.length - 1; i++) {
    if (currentHeight < heightKeys[i + 1]) {
      return prices[heightKeys[i].toString()];
    }
  }

  throw Error(`Unable to find next block interval for bid ${currentHeight}`);
};
