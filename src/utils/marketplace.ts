import { ListingDetails, marioToArio } from '@blockydevs/arns-marketplace-data';
import { calculateCurrentDutchListingPrice } from '@blockydevs/arns-marketplace-ui';

const oneHourMs = 60 * 60 * 1000;

export type Duration = (
  | typeof dutchDurationOptions
  | typeof englishDurationOptions
)[number]['value'];

export type DecreaseInterval =
  (typeof dutchDecreaseIntervalOptions)[number]['value'];

export const englishDurationOptions = [
  { label: '1 day', value: '1d' },
  { label: '7 days', value: '7d' },
  { label: '30 days', value: '30d' },
  { label: 'Custom date', value: 'custom' },
] as const;

export const dutchDurationOptions = [
  { label: '1 day', value: '1d' },
  { label: '5 days', value: '5d' },
  { label: '7 days', value: '7d' },
  { label: '30 days', value: '30d' },
  { label: 'Custom date', value: 'custom' },
] as const;

export const dutchDecreaseIntervalOptions = [
  { label: '4 hours', value: '4h' },
  { label: '8 hours', value: '8h' },
  { label: '12 hours', value: '12h' },
  { label: '24 hours', value: '24h' },
] as const;

export const mergeDateAndTime = (
  date: Date | undefined,
  time: string,
): Date | undefined => {
  if (!date) return undefined;

  const [hours, minutes, seconds = 0] = time.split(':').map(Number);
  const merged = new Date(date);

  merged.setHours(hours);
  merged.setMinutes(minutes);
  merged.setSeconds(seconds);

  return merged;
};

export const getMsFromInterval = (interval: DecreaseInterval | undefined) => {
  switch (interval) {
    case '4h': {
      return 4 * oneHourMs;
    }
    case '8h': {
      return 8 * oneHourMs;
    }
    case '12h': {
      return 12 * oneHourMs;
    }
    case '24h': {
      return 24 * oneHourMs;
    }
    default: {
      throw new Error(`Unsupported decrease interval: ${interval}`);
    }
  }
};

export const getMsFromDuration = (
  duration: Duration | undefined,
  date?: Date,
  time?: string,
) => {
  switch (duration) {
    case '1d': {
      return 1 * 24 * oneHourMs;
    }
    case '5d': {
      return 5 * 24 * oneHourMs;
    }
    case '7d': {
      return 7 * 24 * oneHourMs;
    }
    case '30d': {
      return 30 * 24 * oneHourMs;
    }
    case 'custom': {
      if (!date || !time) return 0;
      const customDate = mergeDateAndTime(date, time);
      if (!customDate) return 0;
      return customDate.getTime() - Date.now();
    }
    default: {
      throw new Error(`Unsupported duration: ${duration}`);
    }
  }
};

export const getStatusVariantFromListing = (listing: ListingDetails) => {
  switch (listing.status) {
    case 'processing':
      return 'processing';
    case 'ready-for-settlement':
    case 'settled':
      return 'sold';
    case 'expired':
      return 'expired';
    case 'cancelled':
      return 'cancelled';
    default:
      return;
  }
};

export const getCurrentListingArioPrice = (listing: ListingDetails) => {
  const marioPrice = (() => {
    if (listing.type === 'english') {
      return listing.highestBid ?? listing.startingPrice;
    }

    if (listing.type === 'dutch' && listing.status !== 'settled') {
      return calculateCurrentDutchListingPrice({
        startingPrice: listing.startingPrice,
        minimumPrice: listing.minimumPrice,
        decreaseInterval: listing.decreaseInterval,
        decreaseStep: listing.decreaseStep,
        createdAt: new Date(listing.createdAt).getTime(),
      });
    }

    if (listing.status === 'settled') {
      return listing.finalPrice;
    }

    return listing.price;
  })();

  return marioToArio(marioPrice);
};

export const openAoLinkExplorer = (address: string) => {
  window.open(
    `${AO_LINK_EXPLORER_URL}/${address}`,
    '_blank',
    'noopener,noreferrer',
  );
};

export const BLOCKYDEVS_MARKETPLACE_METADATA_STORAGE_KEY =
  'marketplace-ants-metadata';
export const BLOCKYDEVS_MARKETPLACE_PROCESS_ID =
  'iFLRI3mfcFMrhIAjmXAwhoF65bsKy32e47hd0MGW45M';
export const AO_LINK_EXPLORER_URL = 'https://ao.link/#/entity';
export const marketplaceQueryKeys = {
  metadata: {
    all: 'marketplace-metadata',
  },
  myANTs: {
    all: 'my-ants',
    list: (walletAddress: string | undefined) => [
      marketplaceQueryKeys.myANTs.all,
      walletAddress,
    ],
    item: (walletAddress: string | undefined, antId: string) => [
      marketplaceQueryKeys.myANTs.all,
      walletAddress,
      antId,
    ],
  },
  listings: {
    all: 'listings',
    list: (type: 'active' | 'completed', options?: Record<string, unknown>) => [
      marketplaceQueryKeys.listings.all,
      type,
      options,
    ],
    item: (id: string | undefined) => [
      marketplaceQueryKeys.listings.all,
      'details',
      id,
    ],
  },
};
