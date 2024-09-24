import { AoANTState } from '@ar.io/sdk';
import Transaction from 'arweave/node/lib/transaction';
import emojiRegex from 'emoji-regex';
import { asciiToUnicode, unicodeToAscii } from 'puny-coder';

import {
  APPROVED_CHARACTERS_REGEX,
  ARNS_NAME_REGEX,
  FQDN_REGEX,
  MAX_LEASE_DURATION,
  PERMANENT_DOMAIN_MESSAGE,
  TRAILING_DASH_UNDERSCORE_REGEX,
  UNDERNAME_REGEX,
  URL_REGEX,
  YEAR_IN_MILLISECONDS,
} from '../constants';

export function isARNSDomainNameValid({ name }: { name?: string }): boolean {
  if (
    !name ||
    !ARNS_NAME_REGEX.test(
      emojiRegex().test(name) ? encodeDomainToASCII(name) : name,
    ) ||
    name === 'www'
  ) {
    return false;
  }
  return true;
}

export function isUndernameValid(name: string): boolean {
  return (
    !!name &&
    UNDERNAME_REGEX.test(
      emojiRegex().test(name) ? encodeDomainToASCII(name) : name,
    )
  );
}

export function encodeDomainToASCII(domain: string): string {
  const decodedDomain = unicodeToAscii(domain);

  return decodedDomain;
}
export function decodeDomainToASCII(domain: string): string {
  const decodedDomain = asciiToUnicode(domain);

  return decodedDomain;
}

/**
 * Validates that the query meets the minimum length requirement.
 * @param {string} query - The query to validate.
 * @throws {Error} Throws an error if the query does not meet the minimum length requirement.
 * @returns {Promise<void>} A promise that resolves if the query meets the minimum length requirement.
 */
export async function validateMinASCIILength(
  query: string,
  minLength = 1,
): Promise<void> {
  const s = query?.trim();
  if (!s || s.length < minLength) {
    throw new Error(`Query must be at least ${minLength} characters`);
  }
}

/**
 * Validates that the query does not exceed the maximum length.
 * @param {string} query - The query to validate.
 * @throws {Error} Throws an error if the query exceeds the maximum length.
 * @returns {Promise<void>} A promise that resolves if the query does not exceed the maximum length.
 */
export async function validateMaxASCIILength(
  query: string,
  maxLength = Infinity,
): Promise<void> {
  const s = query?.trim();
  if (!s || (s.length && encodeDomainToASCII(s).length > maxLength)) {
    throw new Error(`Query cannot exceed ${maxLength} characters`);
  }
}

/**
 * Validates that the query does not contain any special characters.
 * @param {string} query - The query to validate.
 * @throws {Error} Throws an error if the query contains special characters.
 * @returns {Promise<void>} A promise that resolves if the query does not contain special characters.
 */
export async function validateNoSpecialCharacters(
  query?: string,
): Promise<void> {
  const s = query?.trim();
  if (
    !s ||
    (s.length && !APPROVED_CHARACTERS_REGEX.test(encodeDomainToASCII(s)))
  ) {
    throw new Error('Query cannot contain special characters');
  }
}

/**
 * Validates that the query does not have leading or trailing dashes.
 * @param {string} query - The query to validate.
 * @throws {Error} Throws an error if the query has leading or trailing dashes.
 * @returns {Promise<void>} A promise that resolves if the query does not have leading or trailing dashes.
 */
export async function validateNoLeadingOrTrailingDashes(
  query?: string,
): Promise<void> {
  const s = query?.trim();
  if (!s) {
    throw new Error('Query is undefined');
  } else if (TRAILING_DASH_UNDERSCORE_REGEX.test(s)) {
    throw new Error('Query cannot have leading or trailing dashes');
  }
}

export function getLeaseDurationFromEndTimestamp(start: number, end: number) {
  const differenceInYears = Math.ceil((end - start) / YEAR_IN_MILLISECONDS);
  const years = Math.max(0, differenceInYears);

  return years;
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function lowerCaseDomain(domain: string) {
  return encodeDomainToASCII(decodeURIComponent(domain.trim())).toLowerCase();
}

export function getAntsRequiringUpdate({
  ants,
  userAddress,
  luaSourceTx,
}: {
  ants: Record<string, AoANTState>;
  userAddress: string;
  luaSourceTx?: Transaction;
}): string[] {
  if (!luaSourceTx) return [];
  const acceptableIds = [
    luaSourceTx.id,
    luaSourceTx?.tags?.find((tag) => tag.name == 'Original-Tx-Id')?.value,
  ];
  console.log(
    'luaSourceTx',
    luaSourceTx.tags.map((tag) => ({ [tag.name]: tag.value })),
  );
  console.log('acceptableIds', acceptableIds);
  return Object.entries(ants)
    .map(([id, ant]) => {
      const srcId = (ant as any)?.['Source-Code-TX-ID'];
      // if user is not the owner, skip
      if (!ant.Owner || ant?.Owner !== userAddress) return;
      if (!srcId || !acceptableIds.includes(srcId)) return id;
    })
    .filter((id) => id !== undefined) as string[];
}

export function doAntsRequireUpdate({
  ants,
  userAddress,
  luaSourceTx,
}: {
  ants: Record<string, AoANTState>;
  userAddress: string;
  luaSourceTx?: Transaction;
}) {
  if (!luaSourceTx) return false;

  return getAntsRequiringUpdate({ ants, userAddress, luaSourceTx }).length > 0;
}

export function camelToReadable(camel: string) {
  const words = camel.replace(/([A-Z])/g, ' $1').toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export function getOwnershipStatus(
  owner: string,
  controllers: string[],
  walletAddress?: string,
): 'controller' | 'owner' | undefined {
  return owner === walletAddress
    ? 'owner'
    : walletAddress && controllers?.includes(walletAddress)
    ? 'controller'
    : undefined;
}

export function isValidGateway(gateway: string) {
  return gateway ? FQDN_REGEX.test(gateway) : false;
}

export function isValidURL(url: string) {
  return url ? URL_REGEX.test(url) : false;
}

export function isMaxLeaseDuration(duration: number | string) {
  return (
    (duration &&
      typeof duration === 'number' &&
      duration >= MAX_LEASE_DURATION) ||
    duration === PERMANENT_DOMAIN_MESSAGE
  );
}
