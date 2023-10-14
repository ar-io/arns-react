import { AVERAGE_BLOCK_TIME } from './constants';

// TODO: write a unit test for this function
export function getNextPriceChangeTimestamp({
  currentBlockHeight,
  prices,
}: {
  currentBlockHeight: number;
  prices: Record<string, number>;
}): number {
  const firstBlockInAuction = Object.keys(prices)[0];
  const lastBlockInAuction =
    +Object.keys(prices)[Object.keys(prices).length - 1];

  if (currentBlockHeight >= lastBlockInAuction) {
    // If auction has already ended, return the end time of the auction
    return lastBlockInAuction * AVERAGE_BLOCK_TIME;
  }
  // find the next interval period based on the current block, and calculate the difference between the current block and that block height
  const nextPriceChangeHeight =
    Object.keys(prices).find(
      (priceChangeHeight) => +priceChangeHeight >= currentBlockHeight,
    ) ?? firstBlockInAuction;
  const blocksRemainingUntilPriceChange =
    +nextPriceChangeHeight - currentBlockHeight;
  const nextPriceChangeTimestamp =
    Date.now() + AVERAGE_BLOCK_TIME * blocksRemainingUntilPriceChange;

  return nextPriceChangeTimestamp;
}
