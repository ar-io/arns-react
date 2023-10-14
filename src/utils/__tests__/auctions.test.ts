import { getNextPriceChangeTimestamp } from '../auctions';
import { AVERAGE_BLOCK_TIME } from '../constants';

describe('getNextPriceChangeTimestamp', () => {
  const stubbedPrices = {
    100: 5000,
    200: 5000,
    300: 5000,
    400: 5000,
    500: 5000,
  };

  it('should return the proper timestamp for the next price change', () => {
    const currentBlockHeight = 236;
    const nextPriceChangeTimestamp = getNextPriceChangeTimestamp({
      currentBlockHeight,
      prices: stubbedPrices,
    });
    const expectedNextPriceChangeTimestamp =
      Date.now() + AVERAGE_BLOCK_TIME * 64;
    expect(nextPriceChangeTimestamp).toEqual(expectedNextPriceChangeTimestamp);
  });

  it('should return the proper timestamp for the next price change when the current block height is the last block in the auction', () => {
    const currentBlockHeight = 500;
    const nextPriceChangeTimestamp = getNextPriceChangeTimestamp({
      currentBlockHeight,
      prices: stubbedPrices,
    });
    const expectedNextPriceChangeTimestamp =
      currentBlockHeight * AVERAGE_BLOCK_TIME;
    expect(nextPriceChangeTimestamp).toEqual(expectedNextPriceChangeTimestamp);
  });

  it('should return the proper timestamp for the next price change when the current block height is greater than the last block in the auction', () => {
    const currentBlockHeight = 600;
    const nextPriceChangeTimestamp = getNextPriceChangeTimestamp({
      currentBlockHeight,
      prices: stubbedPrices,
    });
    // the last price
    const expectedNextPriceChangeTimestamp = 500 * AVERAGE_BLOCK_TIME;
    expect(nextPriceChangeTimestamp).toEqual(expectedNextPriceChangeTimestamp);
  });

  it('should return the proper timestamp for the next price change when the current block height is less than the first block in the auction', () => {
    const currentBlockHeight = 50;
    const nextPriceChangeTimestamp = getNextPriceChangeTimestamp({
      currentBlockHeight,
      prices: stubbedPrices,
    });
    const expectedNextPriceChangeTimestamp =
      Date.now() + 50 * AVERAGE_BLOCK_TIME;
    expect(nextPriceChangeTimestamp).toEqual(expectedNextPriceChangeTimestamp);
  });
});
