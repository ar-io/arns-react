import { APPROXIMATE_BLOCKS_PER_DAY, AVERAGE_BLOCK_TIME_MS } from './constants';

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
