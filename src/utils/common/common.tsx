import { Buffer } from 'buffer';
import { CSSProperties } from 'react';

import { ChevronLeftIcon, ChevronRightIcon } from '../../components/icons';
import { TransactionTag } from '../../types';
import { fromB64Url } from '../encodings';

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
 * Splits a string into two segments, each containing a specified number of characters, and separates them with an ellipsis ('...'). If the `charCount` parameter is not provided or if the string length is less than `charCount`, the original string is returned.
 *
 * @param {string} str - The string to be split.
 * @param {number} [charCount] - The maximum number of characters for the split segments. If provided, the function will split the string into two segments, each containing approximately half of the specified `charCount`, separated by an ellipsis ('...').
 * @returns {string} - The split string with an ellipsis ('...') inserted in the middle, or the original string if `charCount` is not provided or if the string length is less than `charCount`.
 *
 * @example
 * // Returns 'He...lo'
 * formatForMaxCharCount('Hello', 4);
 *
 * @example
 * // Returns 'Hello World'
 * formatForMaxCharCount('Hello World');
 */
export function formatForMaxCharCount(str: string, charCount?: number): string {
  if (charCount && str.length > charCount) {
    const shownCount = Math.round(charCount / 2);
    return `${str.slice(0, shownCount)}...${str.slice(
      str.length - shownCount,
      str.length,
    )}`;
  }

  return str;
}
