import { Buffer } from 'buffer';

import {
  AntInteractionTypeName,
  ArNSRecordEntry,
  CONTRACT_TYPES,
  INTERACTION_TYPES,
  InteractionTypeName,
  RegistryInteractionTypeName,
  TRANSACTION_DATA_KEYS,
  TransactionTag,
  antInteractionTypeNames,
  registryInteractionTypeNames,
} from '../types';
import { ARNS_NAME_REGEX, ARNS_TX_ID_REGEX } from './constants';
import { fromB64Url } from './encodings';

export function calculateArNSNamePrice({
  domain,
  years,
  selectedTier,
  fees,
}: {
  domain?: string;
  years: number;
  selectedTier: number;
  fees: { [x: number]: number };
}) {
  if (years < 1) {
    throw Error('Minimum duration must be at least one year');
  }
  if (selectedTier < 1) {
    throw Error('Minimum selectedTier is 1');
  }
  if (selectedTier > 3) {
    throw Error('Maximum selectedTier is 3');
  }
  if (!domain) {
    throw Error('Domain is undefined');
  }
  if (!isArNSDomainNameValid({ name: domain })) {
    throw Error('Domain name is invalid');
  }
  const nameLength = Math.min(domain.length, Object.keys(fees).length);
  const namePrice = fees[nameLength];
  const price = namePrice * years * selectedTier;
  return price;
}

export function isArNSDomainNameValid({ name }: { name?: string }): boolean {
  if (!name || !ARNS_NAME_REGEX.test(name) || name === 'www') {
    return false;
  }
  return true;
}

export function isArNSDomainNameAvailable({
  name,
  records,
}: {
  name?: string;
  records: { [x: string]: ArNSRecordEntry };
}): boolean {
  //if registered return false
  if (!name || records[name]) {
    return false;
  }
  return true;
}

export function isArweaveTransactionID(id: string) {
  if (!id) {
    return false;
  }
  if (!ARNS_TX_ID_REGEX.test(id)) {
    return false;
  }
  return true;
}

export function isAntInteraction(x: any): x is AntInteractionTypeName {
  return antInteractionTypeNames.includes(x);
}

export function isRegistryInteraction(
  x: any,
): x is RegistryInteractionTypeName {
  return registryInteractionTypeNames.includes(x);
}

export function isContractType(x: any): x is CONTRACT_TYPES {
  return Object.values(CONTRACT_TYPES).includes(x);
}

export function isInteractionCompatible({
  contractType,
  interactionType,
  functionName,
}: {
  contractType: CONTRACT_TYPES;
  interactionType: InteractionTypeName;
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
      const interactionAsAnt = interactionType as AntInteractionTypeName;
      if (
        TRANSACTION_DATA_KEYS[contractType][interactionAsAnt].functionName !==
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
  contractType: CONTRACT_TYPES,
  interactionType: InteractionTypeName,
  data: string | string[],
) {
  try {
    const payload: { [x: string]: any } = {};
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

export function tagsToObject(tags: TransactionTag[]): {
  [x: string]: string;
} {
  return tags.reduce(
    (newTags, tag) => ({
      ...newTags,
      [fromB64Url(tag.name)]: fromB64Url(tag.value),
    }),
    {},
  );
}

export function byteSize(data: string): number {
  return Buffer.byteLength(data);
}

export function getSearchParam<T extends { [K in keyof T]: T[K] }>(
  searchParams: URLSearchParams,
  name: ValidSearchParams,
): T {
  const value = searchParams.get(name) ?? undefined;
  switch (name) {
    case 'contractType': {
      const maybeEnumValue = getEnumValue(CONTRACT_TYPES, value);
      const enumKey = (maybeEnumValue ??
        INTERACTION_TYPES.UNKNOWN) as T[keyof T];
      return CONTRACT_TYPES[enumKey];
    }
    case 'interactionType': {
      const maybeEnumValue = getEnumValue(INTERACTION_TYPES, value);
      const enumValue = (maybeEnumValue ??
        INTERACTION_TYPES.UNKNOWN) as T[keyof T];
      return enumValue;
    }
    default: {
      throw new Error(`Invalid search param name: ${name}`);
    }
  }
}

export type ValidSearchParams = 'contractType' | 'interactionType';

// Utility type to extract only the keys of an enum with string values
type EnumValue<T> = {
  [K in keyof T]: T[K] extends string ? K : never;
}[keyof T];

// Generic function to map string value to a specific enum
function getEnumValue<T extends { [K in keyof T]: T[K] }>(
  enumType: T,
  value?: string,
): EnumValue<T> | null {
  const enumKeys = Object.keys(enumType).filter((key) =>
    isNaN(Number(key)),
  ) as EnumValue<T>[];

  for (const key of enumKeys) {
    const valueInEnum = enumType[key];
    if (valueInEnum === value) {
      return valueInEnum;
    }
  }

  return null;
}
