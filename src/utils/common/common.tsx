import { Buffer } from 'buffer';
import { CSSProperties, ReactNode } from 'react';

import { getLeaseDurationFromEndTimestamp } from '..';
import { ChevronLeftIcon, ChevronRightIcon } from '../../components/icons';
import { TransactionTag } from '../../types';
import { SECONDS_IN_GRACE_PERIOD } from '../constants';
import { fromB64Url } from '../encodings';

export function formatDate(epochMs: number): string {
  return new Date(epochMs).toISOString().split('T')[0];
}

export function formatLeaseDurationFromEndTimestamp(
  endTimestamp?: number,
): ReactNode {
  if (!endTimestamp) {
    return 'Indefinite';
  }
  const leaseDuration = getLeaseDurationFromEndTimestamp(
    Date.now(),
    endTimestamp,
  );
  return (
    <>
      {' '}
      {leaseDuration} year
      {leaseDuration > 1 ? 's' : ''} &nbsp;
      <span style={{ color: 'var(--text-grey)' }}>
        (est. expiry {+endTimestamp ? formatDate(endTimestamp) : 'N/A'})
      </span>
    </>
  );
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

export function byteSize(data: string): number {
  return Buffer.byteLength(data);
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
        <ChevronLeftIcon
          width={'24px'}
          height={'24px'}
          fill="var(--text-grey)"
        />
      </span>
    );
  }
  if (type === 'next') {
    return (
      <span className="flex flex-center" style={nextStyle}>
        <ChevronRightIcon
          width={'24px'}
          height={'24px'}
          fill="var(--text-grey)"
        />
      </span>
    );
  }
  if (type === 'page') {
    return (
      <span
        className="flex flex-row hover center"
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

export function handleTableSort<T extends Record<string, any>>({
  key,
  isAsc,
  rows,
}: {
  key: keyof T;
  isAsc: boolean;
  rows: T[];
}) {
  if (!isAsc) {
    rows.sort((a: T, b: T) => {
      if (typeof a[key] === 'object' && typeof b[key] === 'object') {
        return JSON.stringify(a[key]).localeCompare(JSON.stringify(b[key]));
      }
      if (typeof a[key] === 'string' && typeof b[key] === 'string') {
        return a[key].localeCompare(b[key]);
      }
      if (typeof a[key] === 'number' && typeof b[key] === 'number') {
        return a[key] - b[key];
      }
    });
  } else {
    // if not ascending order sort in other direction
    rows.sort((a: T, b: T) => {
      if (typeof a[key] === 'object' && typeof b[key] === 'object') {
        return JSON.stringify(b[key]).localeCompare(JSON.stringify(a[key]));
      }
      if (typeof a[key] === 'string' && typeof b[key] === 'string') {
        return b[key].localeCompare(a[key]);
      }
      if (typeof a[key] === 'number' && typeof b[key] === 'number') {
        return b[key] - a[key];
      }
    });
  }
}

export function getRandomInteger(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
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
  if (maxCharCount && str.length > maxCharCount) {
    const shownCount = Math.round(maxCharCount / 2);
    return `${str.slice(0, shownCount)}...${str.slice(
      str.length - shownCount,
      str.length,
    )}`;
  }

  return str;
}

export function isJsonSerializable(obj: any): boolean {
  try {
    JSON.parse(obj);
    return true;
  } catch {
    return false;
  }
}

export function jsonSerialize(obj: any) {
  try {
    return JSON.parse(obj);
  } catch (error) {
    return undefined;
  }
}

export function getundernameLimit(records: Record<string, any>): number {
  return Object.keys(records).filter((key) => key !== '@').length;
}

export const executeWithTimeout = async (fn: () => any, ms: number) => {
  return await Promise.race([
    fn(),
    new Promise((resolve) => setTimeout(() => resolve('timeout'), ms)),
  ]);
};

export const fetchWithRetry = async (url: string, numRetries = 1) => {
  let lastException = undefined;
  const exceptionHandler = (e: any) => {
    lastException = e;
    return undefined;
  };

  let res = await fetch(url).catch(exceptionHandler);
  let i = 0;

  while ((!res || !res.ok) && i < numRetries) {
    res = await fetch(url).catch(exceptionHandler);
    i++;
  }
  if ((!res || !res.ok) && lastException) {
    throw lastException;
  }
  return res;
};

/**
 * Formats a unix timestamp into a human-readable date string.
 * @param endTimestamp unix timestamp in seconds
 * @returns {@type JSX.Element} formatted date string
 */
export function formatExpiryDate(endTimestamp?: number) {
  if (!endTimestamp) {
    return 'Indefinite';
  }
  return (
    <span
      style={{
        color:
          endTimestamp > Date.now()
            ? 'var(--success-green)'
            : endTimestamp + SECONDS_IN_GRACE_PERIOD * 1000 < Date.now()
            ? 'var(--accent)'
            : 'var(--error-red)',
      }}
    >
      {formatDate(endTimestamp)}
    </span>
  );
}

export const formatIO = (io: number) => {
  return Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 2,
    compactDisplay: 'short',
  }).format(io);
};

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
