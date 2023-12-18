import emojiRegex from 'emoji-regex';
import { asciiToUnicode, unicodeToAscii } from 'puny-coder';

import { ANTContractJSON } from '../../types';
import {
  APPROVED_CHARACTERS_REGEX,
  ARNS_NAME_REGEX,
  RESERVED_NAME_LENGTH,
  TRAILING_DASH_UNDERSCORE_REGEX,
  UNDERNAME_REGEX,
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
  state: ANTContractJSON,
): string[] {
  if (state.controller && !state.controllers) {
    return [state.controller];
  } else if (state.controllers) {
    return state.controllers;
  }

  return [];
}
