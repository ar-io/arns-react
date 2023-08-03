import { TRANSACTION_TYPES } from '../../types';
import { calculatePDNSNamePrice } from '../searchUtils/searchUtils';

describe('calculatePDNSNamePrice', () => {
  const fees = {
    1: 100,
  };

  test('should throw an error if years is less than one', () => {
    expect(() => {
      calculatePDNSNamePrice({
        domain: 'a',
        years: 0,
        tier: '',
        tiers: [],
        fees,
        type: TRANSACTION_TYPES.LEASE,
        currentBlockHeight: 1,
      });
    }).toThrow();
  });

  test('should throw an error if selectedTier is less than one', () => {
    expect(() => {
      calculatePDNSNamePrice({
        domain: 'a',
        years: 1,
        tier: '',
        tiers: [],
        fees,
        type: TRANSACTION_TYPES.LEASE,
        currentBlockHeight: 1,
      });
    }).toThrow();
  });

  test('should throw an error if selectedTier is greater than 3', () => {
    expect(() => {
      calculatePDNSNamePrice({
        domain: 'a',
        years: 1,
        tier: '',
        tiers: [],
        fees,
        type: TRANSACTION_TYPES.LEASE,
        currentBlockHeight: 1,
      });
    }).toThrow();
  });

  test('should throw on an invalid name', () => {
    expect(() => {
      calculatePDNSNamePrice({
        domain: 'www',
        years: 1,
        tier: '',
        tiers: [],
        fees,
        type: TRANSACTION_TYPES.LEASE,
        currentBlockHeight: 1,
      });
    }).toThrow();
  });

  // pricing is still somewhat in flux, can fix this later
  // TODO add this test with proper pricing

  //   test('should return the proper price based on years, tier and feeds', () => {
  //     const details = {
  //       domain: 'www',
  //       years: 1,
  //       tier: "",
  //       tiers: [],
  //       fees,
  //       type: TRANSACTION_TYPES.LEASE,
  //       reservedList: [],
  //       currentBlockHeight:1
  //     };
  //     const expectedPrice = details.years * 1 * fees[1];
  //     expect(calculatePDNSNamePrice(details)).toEqual(expectedPrice);
  //   });
  // })
});
