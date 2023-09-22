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
        fees,
        type: TRANSACTION_TYPES.LEASE,
        currentBlockHeight: 1,
      });
    }).toThrow();
  });

  // pricing is still somewhat in flux, can fix this later
  // TODO add this test with proper pricing

  //   test('should return the proper price based on years, and feeds', () => {
  //     const details = {
  //       domain: 'www',
  //       years: 1,
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
