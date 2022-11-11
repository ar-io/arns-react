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
