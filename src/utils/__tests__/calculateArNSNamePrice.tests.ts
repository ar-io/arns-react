import { calculateArNSNamePrice } from '../searchUtils';

describe('calculateArNSNamePrice', () => {
  const fees = {
    1: 100,
  };

  test('should throw an error if years is less than one', () => {
    expect(() => {
      calculateArNSNamePrice({
        domain: 'a',
        years: 0,
        selectedTier: 1,
        fees,
      });
    }).toThrow();
  });

  test('should throw an error if selectedTier is less than one', () => {
    expect(() => {
      calculateArNSNamePrice({
        domain: 'a',
        years: 1,
        selectedTier: 0,
        fees,
      });
    }).toThrow();
  });

  test('should throw an error if selectedTier is greater than 3', () => {
    expect(() => {
      calculateArNSNamePrice({
        domain: 'a',
        years: 1,
        selectedTier: 4,
        fees,
      });
    }).toThrow();
  });

  test('should throw on an invalid name', () => {
    expect(() => {
      calculateArNSNamePrice({
        domain: 'www',
        years: 1,
        selectedTier: 1,
        fees,
      });
    }).toThrow();
  });

  test('should return the proper price based on years, tier and feeds', () => {
    const details = {
      domain: 'a',
      years: 1,
      selectedTier: 1,
      fees,
    };
    const expectedPrice = details.years * details.selectedTier * fees[1];
    expect(calculateArNSNamePrice(details)).toEqual(expectedPrice);
  });
});
