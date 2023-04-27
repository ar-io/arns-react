import { PDNSRecordEntry } from '../../types';
import { PDNS_NAME_REGEX } from '../constants';

export function calculatePDNSNamePrice({
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
  if (!isPDNSDomainNameValid({ name: domain })) {
    throw Error('Domain name is invalid');
  }
  const nameLength = Math.min(domain.length, Object.keys(fees).length);
  const namePrice = fees[nameLength];
  const price = namePrice * years * selectedTier;
  return price;
}

export function isPDNSDomainNameValid({ name }: { name?: string }): boolean {
  if (!name || !PDNS_NAME_REGEX.test(name) || name === 'www') {
    return false;
  }
  return true;
}

export function isPDNSDomainNameAvailable({
  name,
  records,
}: {
  name?: string;
  records: { [x: string]: PDNSRecordEntry };
}): boolean {
  //if registered return false
  if (!name || records[name]) {
    return false;
  }
  return true;
}
