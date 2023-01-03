import { isArNSDomainNameAvailable } from '../searchUtils';

describe('isArNSDomainNameAvailable', () => {
  const records = {
    'domain-0': 'fake-tx-id-0',
    'domain-1': 'fake-tx-id-1',
    'domain-2': 'fake-tx-id-2',
  };

  test('it should return false if name is in records', () => {
    expect(isArNSDomainNameAvailable({ name: 'domain-0', records })).toEqual(
      false,
    );
  });

  test('it should return true if name is not in records', () => {
    expect(isArNSDomainNameAvailable({ name: 'available', records })).toEqual(
      true,
    );
  });

  test('it should return false if name is undefined', () => {
    expect(isArNSDomainNameAvailable({ name: undefined, records })).toEqual(
      false,
    );
  });
});
