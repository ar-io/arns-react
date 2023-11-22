import { TRANSACTION_TYPES } from '../../types';
import {
  isARNSDomainNameAvailable,
  isARNSDomainNameValid,
  validateMaxASCIILength,
  validateMinASCIILength,
  validateNoLeadingOrTrailingDashes,
  validateNoSpecialCharacters,
} from '../searchUtils/searchUtils';

describe('Validation Utils', () => {
  describe('validateMinASCIILength', () => {
    it('should resolve if the query meets the minimum length requirement', async () => {
      await expect(validateMinASCIILength('Hello', 3)).resolves.toBeUndefined();
    });

    it('should reject if the query does not meet the minimum length requirement', async () => {
      await expect(validateMinASCIILength('Hi', 5)).rejects.toThrow();
    });
  });

  describe('validateMaxASCIILength', () => {
    it('should resolve if the query does not exceed the maximum length', async () => {
      await expect(
        validateMaxASCIILength('Hello', 10),
      ).resolves.toBeUndefined();
    });

    it('should reject if the query exceeds the maximum length', async () => {
      await expect(
        validateMaxASCIILength('Hello, World!', 5),
      ).rejects.toThrow();
    });
  });

  describe('validateNoSpecialCharacters', () => {
    it('should resolve if the query does not contain special characters', async () => {
      await expect(
        validateNoSpecialCharacters('Hello123'),
      ).resolves.toBeUndefined();
    });

    it('should reject if the query contains special characters', async () => {
      await expect(validateNoSpecialCharacters('Hello@123')).rejects.toThrow();
    });
  });

  describe('validateNoLeadingOrTrailingDashes', () => {
    it('should resolve if the query does not have leading or trailing dashes', async () => {
      await expect(
        validateNoLeadingOrTrailingDashes('Hello'),
      ).resolves.toBeUndefined();
    });

    it('should reject if the query has leading or trailing dashes', async () => {
      await expect(
        validateNoLeadingOrTrailingDashes('-Hello-'),
      ).rejects.toThrow();
    });

    it('should reject if no query is provided', async () => {
      await expect(validateNoLeadingOrTrailingDashes()).rejects.toThrow();
    });
  });
});

describe('isARNSDomainNameAvailable', () => {
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
    expect(isARNSDomainNameAvailable({ name: 'domain-0', records })).toEqual(
      false,
    );
  });

  test('it should return true if name is not in records', () => {
    expect(isARNSDomainNameAvailable({ name: 'available', records })).toEqual(
      true,
    );
  });

  test('it should return false if name is undefined', () => {
    expect(isARNSDomainNameAvailable({ name: undefined, records })).toEqual(
      false,
    );
  });
});

describe('isARNSDomainNameValid', () => {
  const invalidNames = [
    '_',
    '.',
    'www',
    ' ',
    '_leadingunderscore',
    'trailingunderscore_',
    '-leadingdash',
    'trailingdash-',
    'namewithcharacter.init',
    'name with space',
    'namelongerthanthirtytwocharactersddddddddddddddddddddddddddddddddd',
  ];

  test.each(invalidNames)(
    'should return false on invalid name: %p',
    (name: string) => {
      expect(isARNSDomainNameValid({ name })).toEqual(false);
    },
  );

  test('should return true if name is valid', () => {
    expect(isARNSDomainNameValid({ name: 'arns' })).toBe(true);
  });
});
