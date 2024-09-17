import { Buffer } from 'buffer';

export function fromB64Url(input: string): string {
  const decodedBuffer = Buffer.from(input, 'base64');
  return decodedBuffer.toString();
}
