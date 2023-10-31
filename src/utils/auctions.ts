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

/** Estimates the date of a targetBlockHeight based on the currentBlockHeight.
 * Assumes passed-in currentBlockHeight is equal to Date.now() and uses average block time of 2 minutes (120000 ms) to
 * calculate the date of the targetBlockHeight.
 */
export const estimateDateFromBlockHeight = (
  targetBlockHeight: number,
  currentBlockHeight: number,
): Date => {
  const blockDiff = targetBlockHeight - currentBlockHeight;
  return new Date(Date.now() + AVERAGE_BLOCK_TIME * blockDiff);
};

export const formattedEstimatedDateFromBlockHeight = (
  targetBlockHeight: number,
  currentBlockHeight: number,
): string => {
  const dateTime = estimateDateFromBlockHeight(
    targetBlockHeight,
    currentBlockHeight,
  );
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateTime);
};
