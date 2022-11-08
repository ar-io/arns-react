import { ARNS_NAME_REGEX } from '../../types/constants';

export function isArNSDomainNameAvailaible({
  name,
  records,
}: {
  name: string;
  records: {};
}): Boolean | undefined {
  // if name is not in the legal character range or chars, return undefined
  if (!ARNS_NAME_REGEX.test(name) && name !== '') {
    return;
  } else {
    //if not registered return true
    if (!Object.keys(records).includes(name) && name !== '') {
      return true;
    }
    //if registered return false
    if (Object.keys(records).includes(name) && name !== '') {
      return false;
    }
  }
}
