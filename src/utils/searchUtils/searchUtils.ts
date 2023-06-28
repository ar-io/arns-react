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
  PERMABUY_LEASE_FEE_LENGTH,
  RESERVED_NAME_LENGTH,
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
    if (domain.length > RESERVED_NAME_LENGTH) {
      return 1;
    }
    if (domain.length <= RESERVED_NAME_LENGTH) {
      const shortNameMultiplier = 1 + ((10 - domain.length) * 10) / 100;
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
  const tierAnnualFee = tier.fee;
  if (!tierAnnualFee) {
    throw new Error(`Could not find fee for ${tier}`);
  }
  const initialNamePurchaseFee = fees[domain.length];
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
  if (!domain || !isPDNSDomainNameValid({ name: domain })) {
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
      ? calculateTotalRegistrationFee(domain, fees, selectedTier, years)
      : calculatePermabuyFee(domain, fees, selectedTier);
  console.log({
    registrationFee,
    selectedTier,
    type,
    auction,
  });
  if (
    isDomainAuctionable({
      domain,
      registrationType: type,
      reservedList,
    })
  ) {
    console.log(' domain is auctionable,', {
      registrationFee,
      selectedTier,
      type,
      auction,
    });

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
  if (!name || !PDNS_NAME_REGEX.test(name) || name === 'www') {
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
