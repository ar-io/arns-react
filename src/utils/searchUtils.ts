import { ARNS_NAME_REGEX } from '../../types/constants';

export function isArNSDomainNameValid({ name }: { name?: string }): boolean {
  // if name is not in the legal character range or chars, return undefined
  if (!name || !ARNS_NAME_REGEX.test(name)) {
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

export function calculateArNSNamePrice({
  domain,
  years,
  selectedTier,
  fees,
}: {
  domain?: string;
  years: number;
  selectedTier: number | string;
  fees: { [x: number]: number };
}) {
  const thisTier = new Number(selectedTier).valueOf();
  try {
    if (years < 1) {
      throw Error('Minimum duration must be at least one year');
    }
    if (thisTier < 1) {
      throw Error('Minimum tier is 1');
    }
    if (thisTier > 3) {
      throw Error('Maximum tier is 3');
    }
    if (!domain) {
      throw Error('Domain is undefined');
    }
    if (!isArNSDomainNameValid({ name: domain })) {
      throw Error('invalid name, failed name regex');
    }
    if (isArNSDomainNameValid({ name: domain }) && domain) {
      let nameLength = domain.length;
      if (nameLength > Object.keys(fees).length) {
        nameLength = Object.keys(fees).length;
      }
      const namePrice = fees[nameLength];
      const price = namePrice * years * thisTier;

      return price;
    }
  } catch (error) {
    console.error(error);
    return 0;
  }
}
