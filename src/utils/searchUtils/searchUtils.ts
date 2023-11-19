import emojiRegex from 'emoji-regex';
import { asciiToUnicode, unicodeToAscii } from 'puny-coder';

import { ArweaveTransactionID } from '../../services/arweave/ArweaveTransactionID';
import { PDNSRecordEntry, PDNTContractJSON } from '../../types';
import {
  APPROVED_CHARACTERS_REGEX,
  PDNS_NAME_REGEX,
  RESERVED_NAME_LENGTH,
  YEAR_IN_MILLISECONDS,
} from '../constants';

export function isPDNSDomainNameValid({ name }: { name?: string }): boolean {
  if (
    !name ||
    !PDNS_NAME_REGEX.test(
      emojiRegex().test(name) ? encodeDomainToASCII(name) : name,
    ) ||
    name === 'www'
  ) {
    return false;
  }
  return true;
}

export function isPDNSDomainNameAvailable({
  name,
  records,
}: {
  name?: string;
  records: { [x: string]: PDNSRecordEntry };
}): boolean {
  //if registered return false
  if (!name || records[lowerCaseDomain(name)]) {
    return false;
  }
  return true;
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
  if (!query.trim() || query.trim().length < minLength) {
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
  if (
    !query ||
    (query.trim().length &&
      encodeDomainToASCII(query.trim()).length > maxLength)
  ) {
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
  if (
    !query ||
    (query.trim().length &&
      !APPROVED_CHARACTERS_REGEX.test(encodeDomainToASCII(query.trim())))
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
  if (!query) {
    throw new Error('Query is undefined');
  } else if (
    query.trim().length &&
    (encodeDomainToASCII(query.trim()).startsWith('-') ||
      encodeDomainToASCII(query.trim()).endsWith('-'))
  ) {
    throw new Error('Query cannot have leading or trailing dashes');
  }
}

export function getLeaseDurationFromEndTimestamp(start: number, end: number) {
  const differenceInYears = Math.ceil((end - start) / YEAR_IN_MILLISECONDS);
  const years = Math.max(0, differenceInYears);

  return years;
}

export function isDomainReservedLength(domain: string): boolean {
  if (encodeDomainToASCII(domain).length <= RESERVED_NAME_LENGTH) {
    return true;
  }
  return false;
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function lowerCaseDomain(domain: string) {
  return encodeDomainToASCII(domain.trim()).toLowerCase();
}

// controller vs controllers array
export function getLegacyControllersFromState(
  state: PDNTContractJSON,
): string[] {
  if (state.controller && !state.controllers) {
    return [state.controller];
  } else if (state.controllers) {
    return state.controllers;
  }

  return [];
}

export async function fetchDREStatus(
  contractTxId: ArweaveTransactionID,
): Promise<Record<string, any> | undefined> {
  try {
    const res = await fetch(
      `https://dre-1.warp.cc/contract/?id=${contractTxId.toString()}`,
    );
    const data = await res.json();

    return data;
  } catch (error) {
    console.error(error);
  }
}
