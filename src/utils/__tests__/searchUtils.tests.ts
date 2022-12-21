import { isArNSDomainNameValid } from '../searchUtils';

describe('isArNSDomainNameValid', () => {
  const invalidNames = [
    '_',
    '.',
    'www',
    '_leadingunderscore',
    'trailingunderscore_',
    'namewithcharacter.init',
    'name with space',
  ];

  test.each(invalidNames)(
    'should return false on invalid name: %p',
    (name: string) => {
      expect(isArNSDomainNameValid({ name })).toEqual(false);
    },
  );
});
