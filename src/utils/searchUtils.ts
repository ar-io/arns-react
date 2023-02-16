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
  records: Record<string, any>;
}): boolean {
  //if registered return false
  if (!name || Object.keys(records).includes(name)) {
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

export function tagsToObject(tags: { name: string; value: string }[]): {
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
