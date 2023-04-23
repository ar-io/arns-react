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

export function getTransactionPayloadByInteractionType(
  contractType: ContractType,
  interactionType: AntInteraction | RegistryInteraction,
  data: string | string[],
): TransactionData | undefined {
  try {
    const payload: any = {};
    const txData = typeof data === 'string' ? [data] : [...data];

    if (
      contractType == CONTRACT_TYPES.ANT &&
      isAntInteraction(interactionType)
    ) {
      if (
        !isInteractionCompatible({
          contractType,
          interactionType,
          functionName:
            TRANSACTION_DATA_KEYS[contractType][interactionType].functionName,
        })
      ) {
        throw new Error(`Interaction is not compatible`);
      }
      payload.functionName =
        TRANSACTION_DATA_KEYS[contractType][interactionType].functionName;
      switch (interactionType) {
        case ANT_INTERACTION_TYPES.SET_NAME: {
          TRANSACTION_DATA_KEYS[contractType][interactionType].keys.forEach(
            (key: string, index) => {
              if (!txData[index]) {
                throw new Error(
                  `Missing key (${key}) from transaction data in the url. This may be due to the order of the data, the current order is [${txData}], the correct order is [${TRANSACTION_DATA_KEYS[contractType][interactionType].keys}]`,
                );
              }
              payload[key] = txData[index];
            },
          );
        }
      }
    }

    if (
      contractType == CONTRACT_TYPES.REGISTRY &&
      isRegistryInteraction(interactionType)
    ) {
      if (
        !isInteractionCompatible({
          contractType,
          interactionType,
          functionName:
            TRANSACTION_DATA_KEYS[contractType][interactionType].functionName,
        })
      ) {
        throw new Error(`Interaction is not compatible`);
      }
      payload.functionName =
        TRANSACTION_DATA_KEYS[contractType][interactionType].functionName;
      TRANSACTION_DATA_KEYS[contractType][interactionType].keys.forEach(
        (key, index) => {
          if (!txData[index]) {
            // if missing transaction data from the url, throw an error
            throw new Error(
              `Missing key (${key}) from transaction data in the url. This may be due to the order of the data, the current order is [${txData}], the correct order is [${TRANSACTION_DATA_KEYS[contractType][interactionType].keys}]`,
            );
          }
          payload[key] = txData[index];
        },
      );
    }

    return payload;
  } catch (error) {
    console.error(error);
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
): ArNSMapping {
  let mapping: ArNSMapping = { domain: '' };

  switch (contractType) {
    case CONTRACT_TYPES.REGISTRY:
      {
        switch (interactionType) {
          case REGISTRY_INTERACTION_TYPES.BUY_RECORD: {
            const data = transactionData as BuyRecordPayload;
            mapping = {
              domain: data.name,
              id: new ArweaveTransactionID(data.contractTxId),
              overrides: {
                tier: data.tierNumber,
                maxSubdomains: 100, // TODO get subdomain count from contract
                leaseDuration: data.years,
              },
            };
            break;
          }
        }
      }
      break;
    case CONTRACT_TYPES.ANT: {
      switch (interactionType) {
        case ANT_INTERACTION_TYPES.CREATE:
          {
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
            mapping = {
              domain: '',
              showTier: false,
              compact: false,
              state: transactionData.initialState,
              overrides: {
                targetId:
                  transactionData.initialState.records['@'].transactionId,
                ttlSeconds:
                  transactionData.initialState.records['@'].ttlSeconds,
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
          break;
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
          mapping = {
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
      }
    }
  }
  return mapping;
}

export const FieldToInteractionMap: {
  [x: string]: AntInteraction;
} = {
  name: ANT_INTERACTION_TYPES.SET_NAME,
  // TODO: add other interactions
};

export function getInteractionTypeFromField(field: string) {
  // TODO: add contract specification and more interaction fields
  return FieldToInteractionMap[field];
}
