import { ARNS_NAME_REGEX } from '../../types/constants';

export function isArNSDomainNameValid({
  name,
}: {
  name: string | undefined;
}): boolean | undefined {
  // if name is not in the legal character range or chars, return undefined
  if (!name || !ARNS_NAME_REGEX.test(name)) {
    return false;
  }
}

export function isArNSDomainNameAvailable({
  name,
  records,
}: {
  name: string;
  records: Record<string, any>;
}): boolean | undefined {
  //if registered return false
  if (Object.keys(records).includes(name) && name !== '') {
    return false;
  }
  return true;
}
