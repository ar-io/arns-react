import { Buffer } from 'buffer';

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
