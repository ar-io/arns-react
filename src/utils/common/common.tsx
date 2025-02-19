import { Tooltip } from '@src/components/data-display';
import { CSSProperties } from 'react';

import { ChevronLeftIcon, ChevronRightIcon } from '../../components/icons';
import { TransactionTag } from '../../types';
import {
  MILLISECONDS_IN_GRACE_PERIOD,
  PERMANENT_DOMAIN_MESSAGE,
} from '../constants';
import { fromB64Url } from '../encodings';

export function formatDate(epochMs: number): string {
  return new Date(epochMs).toISOString().split('T')[0];
}

/**
 *
 * @param timestamp
 * @example "Friday, August 22, 2025 at 9:22:20 AM CST"
 */
export function formatVerboseDate(timestamp: number | string): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      timeZoneName: 'short',
    }).format(new Date(timestamp));
  } catch (error) {
    return '';
  }
}

/**
 *
 * @param timestamp
 * @example "May 13, 2024"
 */
export function formatDateMDY(timestamp: number | string): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(timestamp));
  } catch (error) {
    return '';
  }
}

export function tagsToObject(tags: TransactionTag[]): {
  [x: string]: string;
} {
  return tags.reduce(
    (newTags, tag) => ({
      ...newTags,
      [fromB64Url(tag.name)]: fromB64Url(tag.value),
    }),
    {},
  );
}

export function getCustomPaginationButtons({
  page,
  type,
  originalElement,
  currentPage,
  prevStyle,
  pageStyle,
  nextStyle,
}: {
  page: number;
  type: 'page' | 'prev' | 'next' | 'jump-prev' | 'jump-next'; // rc pagination types
  originalElement: any;
  currentPage: number;
  prevStyle?: CSSProperties;
  pageStyle?: CSSProperties;
  nextStyle?: CSSProperties;
}) {
  if (type === 'prev') {
    return (
      <span className="flex flex-center" style={prevStyle}>
        <ChevronLeftIcon className="fill-grey size-4" />
      </span>
    );
  }
  if (type === 'next') {
    return (
      <span className="flex flex-center" style={nextStyle}>
        <ChevronRightIcon className="fill-grey size-4" />
      </span>
    );
  }
  if (type === 'page') {
    return (
      <span
        className="flex flex-row hover center text-sm font-sans"
        style={
          pageStyle ?? {
            color: currentPage == page ? 'white' : 'var(--text-grey)',
            width: '32px',
            borderRadius: 'var(--corner-radius)',
            backgroundColor:
              currentPage == page ? 'var(--text-faded)' : 'var(--bg-color)',
          }
        }
      >
        {page}
      </span>
    );
  }
  return originalElement;
}

/**
 * Splits a string into two segments, each containing a specified number of characters, and separates them with an ellipsis ('...'). If the `maxCharCount` parameter is not provided or if the string length is less than `maxCharCount`, the original string is returned.
 *
 * @param {string} str - The string to be split.
 * @param {number} [maxCharCount] - The maximum number of characters for the split segments. If provided, the function will split the string into two segments, each containing approximately half of the specified `maxCharCount`, separated by an ellipsis ('...').
 * @returns {string} - The split string with an ellipsis ('...') inserted in the middle, or the original string if `maxCharCount` is not provided or if the string length is less than `maxCharCount`.
 *
 * @example
 * // Returns 'He...lo'
 * formatForMaxCharCount('Hello', 4);
 *
 * @example
 * // Returns 'Hello World'
 * formatForMaxCharCount('Hello World');
 */
export function formatForMaxCharCount(
  str: string,
  maxCharCount?: number,
): string {
  if (!str?.length) return '';
  if (maxCharCount && str.length > maxCharCount) {
    const shownCount = Math.round(maxCharCount / 2);
    return `${str.slice(0, shownCount)}...${str.slice(
      str.length - shownCount,
      str.length,
    )}`;
  }

  return str;
}

export function jsonSerialize(obj: any) {
  try {
    return JSON.parse(obj);
  } catch (error) {
    return undefined;
  }
}

export const executeWithTimeout = async (fn: () => any, ms: number) => {
  return await Promise.race([
    fn(),
    new Promise((resolve) => setTimeout(() => resolve('timeout'), ms)),
  ]);
};

/**
 * Formats a unix timestamp into a human-readable date string.
 * @param endTimestamp unix timestamp in seconds
 * @returns {@type JSX.Element} formatted date string
 */
export function formatExpiryDate(endTimestamp?: number) {
  if (!endTimestamp) {
    return PERMANENT_DOMAIN_MESSAGE;
  }
  const isGracePeriod =
    Date.now() > endTimestamp &&
    Date.now() < endTimestamp + MILLISECONDS_IN_GRACE_PERIOD;
  const isExpired = endTimestamp < Date.now();

  return (
    <Tooltip
      message={
        isGracePeriod
          ? 'Name is in Grace Period'
          : isExpired
          ? 'Name is Expired'
          : 'Enters grace period on approximately ' +
            formatVerboseDate(endTimestamp)
      }
      icon={
        <span
          style={{
            color:
              endTimestamp > Date.now()
                ? 'var(--success-green)'
                : isGracePeriod
                ? 'var(--accent)'
                : 'var(--error-red)',
          }}
        >
          {formatDate(endTimestamp)}
        </span>
      }
    />
  );
}

export const formatARIO = (ario: number) => {
  return Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 2,
    compactDisplay: 'short',
  }).format(ario);
};

export function formatARIOWithCommas(ario: number) {
  return ario.toLocaleString('en-US', {
    maximumFractionDigits: 3,
  });
}

export function shuffleArray(array: any[]) {
  const arrayCopy = [...array];
  let currentIndex = arrayCopy.length,
    randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex !== 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [arrayCopy[currentIndex], arrayCopy[randomIndex]] = [
      arrayCopy[randomIndex],
      arrayCopy[currentIndex],
    ];
  }

  return arrayCopy;
}
