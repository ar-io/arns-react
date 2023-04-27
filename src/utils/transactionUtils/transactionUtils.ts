import { ANTContract } from '../../services/arweave/AntContract';
import {
  ANT_INTERACTION_TYPES,
  AntInteraction,
  ArNSMapping,
  ArweaveTransactionID,
  BuyRecordPayload,
  CONTRACT_TYPES,
  ContractType,
  CreateAntPayload,
  REGISTRY_INTERACTION_TYPES,
  RegistryInteraction,
  SetNamePayload,
  SetRecordPayload,
  SetTickerPayload,
  TRANSACTION_DATA_KEYS,
  TransactionData,
  TransactionDataPayload,
} from '../../types';
import { ARNS_TX_ID_REGEX } from '../constants';

export function isArweaveTransactionID(id: string) {
  if (!id) {
    return false;
  }
  if (!ARNS_TX_ID_REGEX.test(id)) {
    return false;
  }
  return true;
}

export function isAntInteraction(x: any): x is AntInteraction {
  return Object.values(ANT_INTERACTION_TYPES).includes(x);
}

export function isRegistryInteraction(x: any): x is RegistryInteraction {
  return Object.values(REGISTRY_INTERACTION_TYPES).includes(x);
}

export function isContractType(x: any): x is ContractType {
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

export function isInteractionCompatible({
  contractType,
  interactionType,
  functionName,
}: {
  contractType: ContractType;
  interactionType: AntInteraction | RegistryInteraction;
  functionName: string;
}) {
  try {
    if (
      (contractType === CONTRACT_TYPES.ANT &&
        !isAntInteraction(interactionType)) ||
      (contractType === CONTRACT_TYPES.REGISTRY &&
        !isRegistryInteraction(interactionType))
    ) {
      throw new Error(
        `contract type of ${contractType} and interaction type of ${interactionType} are not compatible`,
      );
    }
    if (
      contractType === CONTRACT_TYPES.ANT &&
      isAntInteraction(interactionType)
    ) {
      if (
        TRANSACTION_DATA_KEYS[contractType][interactionType].functionName !==
        functionName
      ) {
        throw new Error(
          `function name of ${functionName} is not compatible with contract type ${contractType} and interaction type ${interactionType}`,
        );
      }
    }
    if (
      contractType === CONTRACT_TYPES.REGISTRY &&
      isRegistryInteraction(interactionType)
    ) {
      if (
        TRANSACTION_DATA_KEYS[contractType][interactionType].functionName !==
        functionName
      ) {
        throw new Error(
          `function name of ${functionName} is not compatible with contract type ${contractType} and interaction type ${interactionType}`,
        );
      }
    }
    return true;
  } catch (error) {
    return false;
  }
}

export function getArNSMappingByInteractionType(
  // can be used to generate AntCard props: <AntCard {...props = getArNSMappingByInteractionType()} />
  {
    contractType,
    interactionType,
    transactionData,
  }: {
    contractType: ContractType;
    interactionType: AntInteraction | RegistryInteraction;
    transactionData: TransactionData;
  },
): ArNSMapping | undefined {
  switch (contractType) {
    case CONTRACT_TYPES.REGISTRY:
      {
        switch (interactionType) {
          case REGISTRY_INTERACTION_TYPES.BUY_RECORD: {
            if (
              !isObjectOfTransactionPayloadType<BuyRecordPayload>(
                transactionData,
                TRANSACTION_DATA_KEYS[CONTRACT_TYPES.REGISTRY][
                  REGISTRY_INTERACTION_TYPES.BUY_RECORD
                ].keys,
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
        }
      }
      break;
    case CONTRACT_TYPES.ANT: {
      switch (interactionType) {
        case ANT_INTERACTION_TYPES.CREATE: {
          if (
            !isObjectOfTransactionPayloadType<CreateAntPayload>(
              transactionData,
              TRANSACTION_DATA_KEYS[CONTRACT_TYPES.ANT][
                ANT_INTERACTION_TYPES.CREATE
              ].keys,
            )
          ) {
            throw new Error(
              'transaction data not of correct payload type <CreateAntPayload>',
            );
          }
          const ant = new ANTContract(transactionData.initialState);
          return {
            domain: '',
            showTier: false,
            compact: false,
            state: ant.state,
            overrides: {
              targetId: ant.getRecord('@').transactionId,
              ttlSeconds: ant.getRecord('@').ttlSeconds,
            },
            disabledKeys: [
              'tier',
              'evolve',
              'maxSubdomains',
              'id',
              'domain',
              'leaseDuration',
            ],
          };
        }
        case ANT_INTERACTION_TYPES.SET_NAME: {
          if (
            !isObjectOfTransactionPayloadType<SetNamePayload>(
              transactionData,
              TRANSACTION_DATA_KEYS[CONTRACT_TYPES.ANT][
                ANT_INTERACTION_TYPES.SET_NAME
              ].keys,
            )
          ) {
            throw new Error(
              'transaction data not of correct payload type <SetNamePayload>',
            );
          }
          return {
            domain: '',
            showTier: false,
            compact: false,
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
        case ANT_INTERACTION_TYPES.SET_TICKER: {
          if (
            !isObjectOfTransactionPayloadType<SetTickerPayload>(
              transactionData,
              TRANSACTION_DATA_KEYS[CONTRACT_TYPES.ANT][
                ANT_INTERACTION_TYPES.SET_TICKER
              ].keys,
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
            showTier: false,
            compact: false,
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
        case ANT_INTERACTION_TYPES.SET_TARGET_ID: {
          if (
            !isObjectOfTransactionPayloadType<SetRecordPayload>(
              transactionData,
              TRANSACTION_DATA_KEYS[CONTRACT_TYPES.ANT][
                ANT_INTERACTION_TYPES.SET_TARGET_ID
              ].keys,
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
            showTier: false,
            compact: false,
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
      }
    }
  }
}

export const FieldToInteractionMap: {
  [x: string]: AntInteraction;
} = {
  name: ANT_INTERACTION_TYPES.SET_NAME,
  ticker: ANT_INTERACTION_TYPES.SET_TICKER,
  targetID: ANT_INTERACTION_TYPES.SET_TARGET_ID,
  // TODO: add other interactions
};

export function getInteractionTypeFromField(field: string) {
  // TODO: add contract specification and more interaction fields
  return FieldToInteractionMap[field];
}

export function mapTransactionDataKeyToPayload(
  contractType: ContractType,
  interactionType: AntInteraction | RegistryInteraction,
  data: string | number | Array<string | number>,
): TransactionData | undefined {
  const txData = typeof data === 'object' ? [...data] : [data];
  const payload: any = {};
  // TODO refactor this util and types to be more generic... currently we are implementing dependent on each type, change to not have to do that. Check Mati's types.
  if (!data) {
    throw new Error('No data provided, data is required to build the payload');
  }
  if (isRegistryInteraction(interactionType)) {
    if (
      !isInteractionCompatible({
        contractType,
        interactionType,
        functionName:
          TRANSACTION_DATA_KEYS[CONTRACT_TYPES.REGISTRY][interactionType]
            .functionName,
      })
    ) {
      throw new Error(`Interaction is not compatible`);
    }
    payload.functionName =
      TRANSACTION_DATA_KEYS[CONTRACT_TYPES.REGISTRY][
        interactionType
      ].functionName;
    TRANSACTION_DATA_KEYS[CONTRACT_TYPES.REGISTRY][
      interactionType
    ].keys.forEach((key, index) => {
      if (!txData[index]) {
        // if missing transaction data from the url, throw an error
        throw new Error(
          `Missing key (${key}) from transaction data in the url. This may be due to the order of the data, the current order is [${txData}], the correct order is [${
            TRANSACTION_DATA_KEYS[CONTRACT_TYPES.REGISTRY][interactionType].keys
          }]`,
        );
      }
      payload[key] = txData[index];
    });
    return payload;
  }
  if (isAntInteraction(interactionType)) {
    if (
      !isInteractionCompatible({
        contractType,
        interactionType,
        functionName:
          TRANSACTION_DATA_KEYS[CONTRACT_TYPES.ANT][interactionType]
            .functionName,
      })
    ) {
      throw new Error(`Interaction is not compatible`);
    }
    payload.functionName =
      TRANSACTION_DATA_KEYS[CONTRACT_TYPES.ANT][interactionType].functionName;
    TRANSACTION_DATA_KEYS[CONTRACT_TYPES.ANT][interactionType].keys.forEach(
      (key, index) => {
        if (!txData[index]) {
          // if missing transaction data from the url, throw an error
          throw new Error(
            `Missing key (${key}) from transaction data in the url. This may be due to the order of the data, the current order is [${txData}], the correct order is [${
              TRANSACTION_DATA_KEYS[CONTRACT_TYPES.ANT][interactionType].keys
            }]`,
          );
        }
        payload[key] = txData[index];
      },
    );
    return payload;
  }
}
