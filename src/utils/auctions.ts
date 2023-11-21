import { APPROXIMATE_BLOCKS_PER_DAY, AVERAGE_BLOCK_TIME_MS } from './constants';

// TODO: write a unit test for this function
export function getNextPriceChangeTimestamp({
  lastBlockFetchTimestamp,
}: {
  lastBlockFetchTimestamp: number;
}): number {
  const lastBlockInAuction =
    +Object.keys(prices)[Object.keys(prices).length - 1];

  if (currentBlockHeight >= lastBlockInAuction) {
    // If auction has already ended, return the end time of the auction
    return lastBlockInAuction * AVERAGE_BLOCK_TIME_MS;
  }
  const nextPriceChangeTimestamp =
    lastBlockUpdateTimestamp + AVERAGE_BLOCK_TIME_MS;

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
  return new Date(Date.now() + AVERAGE_BLOCK_TIME_MS * blockDiff);
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

export const approximateDays = (blockHeightDuration: number) => {
  return Math.round(blockHeightDuration / APPROXIMATE_BLOCKS_PER_DAY);
};

export const formatIO = (io: number) => {
  return Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 2,
    compactDisplay: 'short',
  }).format(io);
};
