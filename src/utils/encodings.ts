import { Tag } from 'arweave/node/lib/transaction';
import { Buffer } from 'buffer';

export function fromB64Url(input: string): string {
  const decodedBuffer = Buffer.from(input, 'base64');
  return decodedBuffer.toString();
}

export function tagsToObject(tags: Tag[]): {
  [x: string]: string;
} {
  return tags.reduce((decodedTags: { [x: string]: string }, tag) => {
    const key = tag.get('name', { decode: true, string: true });
    const value = tag.get('value', { decode: true, string: true });
    decodedTags[key] = value;
    return decodedTags;
  }, {});
}
