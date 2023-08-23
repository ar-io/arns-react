import { isPDNSDomainNameValid } from '../searchUtils/searchUtils';

describe('isPDNSDomainNameValid', () => {
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
      expect(isPDNSDomainNameValid({ name })).toEqual(false);
    },
  );

  test('should return true if name is valid', () => {
    expect(isPDNSDomainNameValid({ name: 'pdns' })).toBe(true);
  });
});
