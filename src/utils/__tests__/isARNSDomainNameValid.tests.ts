import { isARNSDomainNameValid } from '../searchUtils/searchUtils';

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
