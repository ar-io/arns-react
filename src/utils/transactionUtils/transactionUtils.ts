import { PDNTContract } from '../../services/arweave/PDNTContract';
import {
  ArweaveTransactionID,
  BuyRecordPayload,
  CONTRACT_TYPES,
  ContractType,
  CreatePDNTPayload,
  PDNSMapping,
  PDNTInteraction,
  PDNT_INTERACTION_TYPES,
  REGISTRY_INTERACTION_TYPES,
  RegistryInteraction,
  SetNamePayload,
  SetRecordPayload,
  SetTickerPayload,
  TRANSACTION_DATA_KEYS,
  TransactionData,
  TransactionDataPayload,
} from '../../types';
import { PDNS_TX_ID_REGEX } from '../constants';

export function isArweaveTransactionID(id: string) {
  if (!id) {
    return false;
  }
  if (!PDNS_TX_ID_REGEX.test(id)) {
    return false;
  }
  return true;
}

export function isPDNTInteraction(x: any): x is PDNTInteraction {
  return Object.values(PDNT_INTERACTION_TYPES).includes(x);
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
  interactionType: PDNTInteraction | RegistryInteraction;
  functionName: string;
}) {
  try {
    if (
      (contractType === CONTRACT_TYPES.PDNT &&
        !isPDNTInteraction(interactionType)) ||
      (contractType === CONTRACT_TYPES.REGISTRY &&
        !isRegistryInteraction(interactionType))
    ) {
      throw new Error(
        `contract type of ${contractType} and interaction type of ${interactionType} are not compatible`,
      );
    }
    if (
      contractType === CONTRACT_TYPES.PDNT &&
      isPDNTInteraction(interactionType)
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
  interactionType: PDNTInteraction | RegistryInteraction,
  data?: string | string[],
): TransactionData | undefined {
  try {
    if (!data) {
      throw new Error(
        'No data provided, data is required to build the payload',
      );
    }
    const txData = typeof data === 'string' ? [data] : [...data];
    const payload = mapTransactionDataKeyToPayload(
      contractType,
      interactionType,
      txData,
    );
    // overrides
    if (
      contractType == CONTRACT_TYPES.PDNT &&
      isPDNTInteraction(interactionType)
    ) {
      switch (interactionType) {
        case PDNT_INTERACTION_TYPES.SET_TARGET_ID:
          {
            payload.subDomain = '@';
          }
          break;
      }
    }

    return payload;
  } catch (error) {
    console.error(error);
  }
}

export function getPDNSMappingByInteractionType(
  // can be used to generate PDNTCard props: <PDNTCard {...props = getPDNSMappingByInteractionType()} />
  {
    contractType,
    interactionType,
    transactionData,
  }: {
    contractType: ContractType;
    interactionType: PDNTInteraction | RegistryInteraction;
    transactionData: TransactionData;
  },
): PDNSMapping | undefined {
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
    case CONTRACT_TYPES.PDNT: {
      switch (interactionType) {
        case PDNT_INTERACTION_TYPES.CREATE: {
          if (
            !isObjectOfTransactionPayloadType<CreatePDNTPayload>(
              transactionData,
              TRANSACTION_DATA_KEYS[CONTRACT_TYPES.PDNT][
                PDNT_INTERACTION_TYPES.CREATE
              ].keys,
            )
          ) {
            throw new Error(
              'transaction data not of correct payload type <CreatePDNTPayload>',
            );
          }
          const pdnt = new PDNTContract(transactionData.initialState);
          return {
            domain: '',
            showTier: false,
            compact: false,
            state: pdnt.state,
            overrides: {
              targetId: pdnt.getRecord('@').transactionId,
              ttlSeconds: pdnt.getRecord('@').ttlSeconds,
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
        case PDNT_INTERACTION_TYPES.SET_NAME:
          {
            if (
              !isObjectOfTransactionPayloadType<SetNamePayload>(
                transactionData,
                TRANSACTION_DATA_KEYS[CONTRACT_TYPES.PDNT][
                  PDNT_INTERACTION_TYPES.SET_NAME
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
              id: new ArweaveTransactionID(transactionData.assetId!),
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
          break;
        case PDNT_INTERACTION_TYPES.SET_TICKER: {
          if (
            !isObjectOfTransactionPayloadType<SetTickerPayload>(
              transactionData,
              TRANSACTION_DATA_KEYS[CONTRACT_TYPES.PDNT][
                PDNT_INTERACTION_TYPES.SET_TICKER
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
            id: new ArweaveTransactionID(transactionData.assetId!),
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
        case PDNT_INTERACTION_TYPES.SET_TARGET_ID: {
          if (
            !isObjectOfTransactionPayloadType<SetRecordPayload>(
              transactionData,
              TRANSACTION_DATA_KEYS[CONTRACT_TYPES.PDNT][
                PDNT_INTERACTION_TYPES.SET_TARGET_ID
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
            id: new ArweaveTransactionID(transactionData.assetId!),
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
  [x: string]: PDNTInteraction;
} = {
  name: PDNT_INTERACTION_TYPES.SET_NAME,
  ticker: PDNT_INTERACTION_TYPES.SET_TICKER,
  targetID: PDNT_INTERACTION_TYPES.SET_TARGET_ID,
  // TODO: add other interactions
};

export function getInteractionTypeFromField(field: string) {
  // TODO: add contract specification and more interaction fields
  return FieldToInteractionMap[field];
}

export function mapTransactionDataKeyToPayload(
  contractType: ContractType,
  interactionType: PDNTInteraction | RegistryInteraction,
  data: string[],
) {
  const payload: any = {};
  try {
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
        if (!data[index]) {
          // if missing transaction data from the url, throw an error
          throw new Error(
            `Missing key (${key}) from transaction data in the url. This may be due to the order of the data, the current order is [${data}], the correct order is [${
              TRANSACTION_DATA_KEYS[CONTRACT_TYPES.REGISTRY][interactionType]
                .keys
            }]`,
          );
        }
        payload[key] = data[index];
      });
    }
    if (isPDNTInteraction(interactionType)) {
      if (
        !isInteractionCompatible({
          contractType,
          interactionType,
          functionName:
            TRANSACTION_DATA_KEYS[CONTRACT_TYPES.PDNT][interactionType]
              .functionName,
        })
      ) {
        throw new Error(`Interaction is not compatible`);
      }
      payload.functionName =
        TRANSACTION_DATA_KEYS[CONTRACT_TYPES.PDNT][
          interactionType
        ].functionName;
      TRANSACTION_DATA_KEYS[CONTRACT_TYPES.PDNT][interactionType].keys.forEach(
        (key, index) => {
          if (!data[index]) {
            // if missing transaction data from the url, throw an error
            throw new Error(
              `Missing key (${key}) from transaction data in the url. This may be due to the order of the data, the current order is [${data}], the correct order is [${
                TRANSACTION_DATA_KEYS[CONTRACT_TYPES.PDNT][interactionType].keys
              }]`,
            );
          }
          payload[key] = data[index];
        },
      );
    }
  } catch (error) {
    console.log(error);
  } finally {
    return payload; // eslint-disable-line
  }
}
