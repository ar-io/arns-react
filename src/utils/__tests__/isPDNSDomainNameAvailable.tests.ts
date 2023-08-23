import { TRANSACTION_TYPES } from '../../types';
import { isPDNSDomainNameAvailable } from '../searchUtils/searchUtils';

describe('isPDNSDomainNameAvailable', () => {
  const records = {
    'domain-0': {
      contractTxId: 'fake-tx-id-0',
      startTimestamp: 0,
      endTimestamp: 0,
      type: TRANSACTION_TYPES.LEASE,
      undernames: 10,
    },
    'domain-1': {
      contractTxId: 'fake-tx-id-0',
      startTimestamp: 0,
      endTimestamp: 0,
      type: TRANSACTION_TYPES.LEASE,
      undernames: 10,
    },
    'domain-2': {
      contractTxId: 'fake-tx-id-0',
      startTimestamp: 0,
      endTimestamp: 0,
      type: TRANSACTION_TYPES.LEASE,
      undernames: 10,
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
