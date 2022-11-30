import { useRegistrationState } from '../state/contexts/RegistrationState';
import { ARNS_NAME_REGEX, ARNS_TXID_REGEX } from './constants';

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
  selectedTier: number;
  fees: { [x: number]: number };
}) {
  try {
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
  } catch (error) {
    console.error(error);
    return 0;
  }
}
