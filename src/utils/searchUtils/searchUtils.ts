import emojiRegex from 'emoji-regex';
import { asciiToUnicode, unicodeToAscii } from 'puny-coder';

import {
  ArweaveTransactionID,
  AuctionParameters,
  AuctionSettings,
  PDNSRecordEntry,
  TRANSACTION_TYPES,
} from '../../types';
import {
  ANNUAL_PERCENTAGE_FEE,
  DEFAULT_MAX_UNDERNAMES,
  MAX_LEASE_DURATION,
  MIN_LEASE_DURATION,
  PDNS_NAME_REGEX,
  PDNS_NAME_REGEX_PARTIAL,
  PERMABUY_LEASE_FEE_LENGTH,
  RESERVED_NAME_LENGTH,
  UNDERNAME_REGISTRATION_IO_FEE,
  YEAR_IN_MILLISECONDS,
  YEAR_IN_SECONDS,
} from '../constants';

export function generateAuction({
  domain,
  registrationType,
  years,
  auctionSettings,
  fees,
  currentBlockHeight,
  walletAddress,
}: {
  domain: string;
  registrationType: TRANSACTION_TYPES;
  years: number;
  auctionSettings: { current: string; history: AuctionSettings[] };
  fees: { [x: number]: number };
  currentBlockHeight: number;
  walletAddress: ArweaveTransactionID;
}): [AuctionParameters, AuctionSettings] {
  const currentAuctionSettings = auctionSettings.history.find(
    (a) => a.id === auctionSettings.current,
  );
  if (!currentAuctionSettings) {
    throw new Error(`Could not get fee data`);
  }

  const { floorPriceMultiplier, startPriceMultiplier } = currentAuctionSettings;

  const basePrice =
    registrationType === TRANSACTION_TYPES.LEASE
      ? calculateTotalRegistrationFee(domain, fees, years)
      : calculatePermabuyFee(domain, fees);

  const startPrice = basePrice * startPriceMultiplier;
  const floorPrice = basePrice * floorPriceMultiplier;

  return [
    {
      startHeight: currentBlockHeight,
      startPrice,
      floorPrice,
      auctionSettingsId: auctionSettings.current,
      type: registrationType,
      initiator: walletAddress?.toString(),
      contractTxId: 'atomic',
    },
    currentAuctionSettings,
  ];
}

export function calculateFloorPrice({
  domain,
  registrationType,
  years,
  auctionSettings,
  fees,
}: {
  domain: string;
  registrationType: TRANSACTION_TYPES;
  years: number;
  auctionSettings: { current: string; history: AuctionSettings[] };
  fees: { [x: number]: number };
}) {
  const currentAuctionSettings = auctionSettings.history.find(
    (a) => a.id === auctionSettings.current,
  );
  if (!currentAuctionSettings) {
    throw new Error(`Could not get fee data`);
  }

  const { floorPriceMultiplier } = currentAuctionSettings;

  const basePrice =
    registrationType === TRANSACTION_TYPES.LEASE
      ? calculateTotalRegistrationFee(domain, fees, years)
      : calculatePermabuyFee(domain, fees);

  return basePrice * floorPriceMultiplier;
}

export function calculateMinimumAuctionBid({
  startHeight,
  startPrice,
  floorPrice,
  currentBlockHeight,
  decayInterval,
  decayRate,
}: AuctionParameters &
  AuctionSettings & { currentBlockHeight: number }): number {
  const blockIntervalsPassed = Math.max(
    0,
    Math.floor((currentBlockHeight - startHeight) / decayInterval),
  );

  const dutchAuctionBid =
    startPrice * Math.pow(1 - decayRate, blockIntervalsPassed);

  const minimumBid = Math.max(floorPrice, dutchAuctionBid);
  return minimumBid;
}

export function calculatePermabuyFee(
  domain: string,
  fees: { [x: number]: number },
) {
  // not sure this pricing is correct, it winds up being lower than leasing sometimes
  const permabuyLeasePrice = calculateAnnualRenewalFee(
    domain,
    fees,
    PERMABUY_LEASE_FEE_LENGTH,
    DEFAULT_MAX_UNDERNAMES,
    Date.now() / 1000 + PERMABUY_LEASE_FEE_LENGTH * YEAR_IN_SECONDS,
  );

  const getMultiplier = () => {
    const name = encodeDomainToASCII(domain);
    if (name.length > RESERVED_NAME_LENGTH) {
      return 1;
    }
    if (isDomainReservedLength(name)) {
      const shortNameMultiplier = 1 + ((10 - name.length) * 10) / 100;
      return shortNameMultiplier;
    }
    throw new Error('Unable to compute name multiplier.');
  };
  const rarityMultiplier = getMultiplier();
  const permabuyFee = permabuyLeasePrice * rarityMultiplier;

  return permabuyFee;
}

export function calculateTotalRegistrationFee(
  domain: string,
  fees: { [x: number]: number },
  years: number,
) {
  // instant lease price
  const initialNamePurchaseFee = fees[domain.length];
  return (
    initialNamePurchaseFee +
    calculateAnnualRenewalFee(
      domain,
      fees,
      years,
      DEFAULT_MAX_UNDERNAMES,
      Date.now() / 1000 + years * YEAR_IN_SECONDS,
    )
  );
}

export function calculateAnnualRenewalFee(
  name: string,
  fees: Record<string, number>,
  years: number,
  undernames: number,
  endTimestamp: number,
): number {
  // Determine annual registration price of name
  const initialNamePurchaseFee = fees['13'];

  // Annual fee is specific % of initial purchase cost
  const nameAnnualRegistrationFee =
    initialNamePurchaseFee * ANNUAL_PERCENTAGE_FEE;

  const totalAnnualRenewalCost = nameAnnualRegistrationFee * years;

  const extensionEndTimestamp = endTimestamp + years * YEAR_IN_SECONDS;
  // Do not charge for undernames if there are less or equal than the default

  const hasAdditionalUndernames = undernames > DEFAULT_MAX_UNDERNAMES;

  const totalCost = !hasAdditionalUndernames
    ? totalAnnualRenewalCost
    : totalAnnualRenewalCost +
      calculateProRatedUndernameCost(
        undernames - DEFAULT_MAX_UNDERNAMES,
        endTimestamp,
        'lease',
        extensionEndTimestamp,
      );

  return totalCost;
}

// TODO: update after dynamic pricing?
export function calculateProRatedUndernameCost(
  qty: number,
  currentTimestamp: number,
  type: 'lease' | 'permabuy',
  endTimestamp?: number,
): number {
  const fullCost =
    type === 'lease'
      ? UNDERNAME_REGISTRATION_IO_FEE * qty
      : PERMABUY_LEASE_FEE_LENGTH * qty;
  const proRatedCost =
    type === 'lease' && endTimestamp
      ? (fullCost / YEAR_IN_SECONDS) * (endTimestamp - currentTimestamp)
      : fullCost;
  return proRatedCost;
}

export function getNextPriceUpdate({
  currentBlockHeight,
  startHeight,
  decayInterval,
}: {
  currentBlockHeight: number;
  startHeight: number;
  decayInterval: number;
}): number {
  const blocksSinceStart = currentBlockHeight - startHeight;
  const blocksUntilNextDecay =
    decayInterval - (blocksSinceStart % decayInterval);
  return blocksUntilNextDecay;
}

export function calculatePDNSNamePrice({
  domain,
  years,
  fees,
  type,
}: {
  domain: string;
  years: number;
  fees: { [x: number]: number };
  type: TRANSACTION_TYPES;
  currentBlockHeight: number;
}) {
  const name = encodeDomainToASCII(domain);
  if (!domain || !isPDNSDomainNameValid({ name })) {
    throw Error('Domain name is invalid');
  }

  if (type === TRANSACTION_TYPES.LEASE) {
    if (years < MIN_LEASE_DURATION) {
      throw Error(
        `Minimum duration must be at least ${MIN_LEASE_DURATION} year`,
      );
    }
    if (years > MAX_LEASE_DURATION) {
      throw Error(
        `Maximum duration must be at most ${MAX_LEASE_DURATION} year`,
      );
    }
  }

  const registrationFee =
    type === TRANSACTION_TYPES.LEASE
      ? calculateTotalRegistrationFee(domain, fees, years)
      : calculatePermabuyFee(domain, fees);

  return registrationFee;
}

export function updatePrices(props: AuctionParameters & AuctionSettings): {
  [X: string]: number;
} {
  const { startHeight, floorPrice, decayInterval, auctionDuration } = props;

  const expiredHieght = startHeight + auctionDuration;
  let currentHeight = startHeight;
  const newPrices: { [X: string]: number } = {};
  while (currentHeight < expiredHieght) {
    const blockPrice = calculateMinimumAuctionBid({
      ...props,
      currentBlockHeight: currentHeight,
    });
    if (blockPrice <= floorPrice) {
      break;
    }
    newPrices[currentHeight] = blockPrice;
    currentHeight = currentHeight + decayInterval;
  }

  newPrices[expiredHieght] = floorPrice;
  return newPrices;
}

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
      !PDNS_NAME_REGEX_PARTIAL.test(encodeDomainToASCII(query.trim())))
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
