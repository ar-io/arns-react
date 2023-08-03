import emojiRegex from 'emoji-regex';
import { asciiToUnicode, unicodeToAscii } from 'puny-coder';

import {
  Auction,
  AuctionSettings,
  PDNSRecordEntry,
  TRANSACTION_TYPES,
  Tier,
} from '../../types';
import {
  ANNUAL_PERCENTAGE_FEE,
  MAX_LEASE_DURATION,
  MIN_LEASE_DURATION,
  PDNS_NAME_REGEX,
  PDNS_NAME_REGEX_PARTIAL,
  PERMABUY_LEASE_FEE_LENGTH,
  RESERVED_NAME_LENGTH,
  YEAR_IN_MILLISECONDS,
} from '../constants';
import { isDomainAuctionable } from '../transactionUtils/transactionUtils';

export function calculateFloorPrice({
  domain,
  registrationType,
  tiers,
  tier,
  years,
  auctionSettings,
  fees,
}: {
  domain: string;
  registrationType: TRANSACTION_TYPES;
  tiers: Tier[];
  tier: string;
  years: number;
  auctionSettings: { current: string; history: AuctionSettings[] };
  fees: { [x: number]: number };
}) {
  const currentTier = tiers.find((t) => t.id === tier);
  const currentAuctionSettings = auctionSettings.history.find(
    (a) => a.id === auctionSettings.current,
  );
  if (!currentTier || !currentAuctionSettings) {
    throw new Error(`Could not get fee data`);
  }

  const { floorPriceMultiplier } = currentAuctionSettings;

  const basePrice =
    registrationType === TRANSACTION_TYPES.LEASE
      ? calculateTotalRegistrationFee(domain, fees, currentTier, years)
      : calculatePermabuyFee(domain, fees, currentTier);

  return basePrice * floorPriceMultiplier;
}

export function calculateMinimumAuctionBid({
  startHeight,
  initialPrice,
  floorPrice,
  currentBlockHeight,
  decayInterval,
  decayRate,
}: {
  startHeight: number;
  initialPrice: number;
  floorPrice: number;
  currentBlockHeight: number;
  decayInterval: number;
  decayRate: number;
}): number {
  const blockIntervalsPassed = Math.floor(
    (currentBlockHeight - startHeight) / decayInterval,
  );
  const dutchAuctionBid =
    initialPrice * Math.pow(1 - decayRate, blockIntervalsPassed);

  const minimumBid = Math.max(floorPrice, dutchAuctionBid);
  return minimumBid;
}

export function calculatePermabuyFee(
  domain: string,
  fees: { [x: number]: number },
  tier: Tier,
) {
  // not sure this pricing is correct, it winds up being lower than leasing sometimes
  const permabuyLeasePrice = calculateAnnualRenewalFee(
    domain,
    fees,
    tier,
    PERMABUY_LEASE_FEE_LENGTH,
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
  tier: Tier,
  years: number,
) {
  // instant lease price
  const initialNamePurchaseFee = fees[domain.length];
  return (
    initialNamePurchaseFee +
    calculateAnnualRenewalFee(domain, fees, tier, years)
  );
}

export function calculateAnnualRenewalFee(
  domain: string,
  fees: { [x: number]: number },
  tier: Tier,
  years: number,
) {
  const name = encodeDomainToASCII(domain);
  const tierAnnualFee = tier.fee;
  if (!tierAnnualFee) {
    throw new Error(`Could not find fee for ${tier}`);
  }
  const initialNamePurchaseFee = fees[name.length];
  const nameAnnualRegistrationFee =
    initialNamePurchaseFee * ANNUAL_PERCENTAGE_FEE;
  const price = (nameAnnualRegistrationFee + tierAnnualFee) * years;

  return price;
}
export function calculatePDNSNamePrice({
  domain,
  years,
  tier,
  fees,
  tiers,
  type,
  reservedList,
  currentBlockHeight,
  auctionSettings,
  auction,
}: {
  domain: string;
  years: number;
  tier: string;
  tiers: Tier[];
  fees: { [x: number]: number };
  type: TRANSACTION_TYPES;
  reservedList: string[];
  currentBlockHeight: number;
  auctionSettings?: { current: string; history: AuctionSettings[] };
  auction?: Auction;
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
  const selectedTier = tiers.find((t) => t.id === tier) ?? tiers[0];

  const registrationFee =
    type === TRANSACTION_TYPES.LEASE
      ? calculateTotalRegistrationFee(name, fees, selectedTier, years)
      : calculatePermabuyFee(name, fees, selectedTier);

  if (
    isDomainAuctionable({
      domain: name,
      registrationType: type,
      reservedList,
    })
  ) {
    const currentAuctionSettings = auctionSettings?.history.find(
      (a) =>
        a.id ===
        (auction ? auction.auctionSettingsId : auctionSettings.current),
    );

    if (!currentAuctionSettings) {
      throw new Error(
        `Auction settings not found for the current auction: ${
          { auction } ?? { current: auctionSettings?.current }
        }.`,
      );
    }

    const { floorPriceMultiplier, startPriceMultiplier } =
      currentAuctionSettings;

    return calculateMinimumAuctionBid({
      startHeight: auction ? auction.startHeight : currentBlockHeight,
      initialPrice: auction
        ? auction.startPrice
        : registrationFee * startPriceMultiplier,
      floorPrice: auction
        ? auction.floorPrice
        : registrationFee * floorPriceMultiplier,
      currentBlockHeight,
      decayInterval: currentAuctionSettings.decayInterval,
      decayRate: currentAuctionSettings.decayRate,
    });
  }

  return registrationFee;
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
  if (!name || records[name]) {
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
  const years = Math.max(1, differenceInYears);

  return years;
}

export function isDomainReservedLength(domain: string): boolean {
  if (encodeDomainToASCII(domain).length <= RESERVED_NAME_LENGTH) {
    return true;
  }
  return false;
}
