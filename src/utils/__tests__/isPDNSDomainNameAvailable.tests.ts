import { isPDNSDomainNameAvailable } from '../searchUtils/searchUtils';

describe('isPDNSDomainNameAvailable', () => {
  const records = {
    'domain-0': {
      contractTxId: 'fake-tx-id-0',
      tier: 'a27dbfe4-6992-4276-91fb-5b97ae8c3ffa',
      endTimestamp: 0,
    },
    'domain-1': {
      contractTxId: 'fake-tx-id-0',
      tier: 'a27dbfe4-6992-4276-91fb-5b97ae8c3ffa',
      endTimestamp: 0,
    },
    'domain-2': {
      contractTxId: 'fake-tx-id-0',
      tier: 'a27dbfe4-6992-4276-91fb-5b97ae8c3ffa',
      endTimestamp: 0,
    },
  };

  test('it should return false if name is in records', () => {
    expect(isPDNSDomainNameAvailable({ name: 'domain-0', records })).toEqual(
      false,
    );
  });

  test('it should return true if name is not in records', () => {
    expect(isPDNSDomainNameAvailable({ name: 'available', records })).toEqual(
      true,
    );
  });

  test('it should return false if name is undefined', () => {
    expect(isPDNSDomainNameAvailable({ name: undefined, records })).toEqual(
      false,
    );
  });
});