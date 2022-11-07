export function isArNSDomainNameAvailaible({
  name,
  records,
}: {
  name: string;
  records: {};
}): Boolean | undefined {
  // if name is not in the legal character range or chars, dnt run
  const namePattern = new RegExp('^[a-zA-Z0-9_-]{1,32}$');
  if (!namePattern.test(name) && name !== '') {
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
