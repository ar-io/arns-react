import { MAX_UNDERNAME_LENGTH } from '../constants';
import {
  isARNSDomainNameValid,
  isUndernameValid,
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

  it.each([
    'arns',
    'arn-s',
    'arn_s',
    'arn-_s',
    'arns1-1',
    ''.padEnd(MAX_UNDERNAME_LENGTH, 'a'),
    '1-'.padEnd(MAX_UNDERNAME_LENGTH, 'a'),
    '1_'.padEnd(MAX_UNDERNAME_LENGTH, 'a'),
  ])('should return true if undername is valid', (name) => {
    expect(isUndernameValid(name)).toBe(true);
  });

  it.each([
    'arns-',
    'arn-s-',
    'arn_s_',
    'arn-_s-_',
    'arns1-1-',
    '-leadingdash',
    '_leadingunderscore',
    '_leading-underscore',
    '-leading-dash',
    ''.padEnd(MAX_UNDERNAME_LENGTH, '_'),
    '1-'.padEnd(MAX_UNDERNAME_LENGTH, '-'),
    '1_'.padEnd(MAX_UNDERNAME_LENGTH, '_'),
    ''.padEnd(62, 'a'),
    'specialcharacter$',
    'specialcharact_er%',
    'specialcharact-er^',
  ])('should return false if undername is invalid', (name) => {
    expect(isUndernameValid(name)).toBe(false);
  });
});
