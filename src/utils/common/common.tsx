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
