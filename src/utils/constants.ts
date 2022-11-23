// note: lookahead/lookbehind regex's are not compatible with iOS browsers
export const ARNS_NAME_REGEX = new RegExp(
  '^([a-zA-Z0-9][a-zA-Z0-9-]{0,30}[a-zA-Z0-9]|[a-zA-Z0-9]{1})$',
);
export const ARNS_TXID_REGEX = new RegExp('^[a-z0-9-s+]{43}$');

// TODO: don't use
export const DEFAULT_EXPIRATION = new Date('12/31/2023');
// TODO: pull from contract
export const FEATURED_DOMAINS = [
  'arcode',
  'ardrive',
  'arns',
  'blog',
  'connect',
  'permapages',
  'pst',
  'sam',
  'search',
  'wallet',
];

// TODO: pull from contract
export const TIER_DATA: { [x: number]: string[] } = {
  1: [
    'Up to 100 Subdomains',
    'Available via all ArNS-enabled gateways',
    'Permanently stored on Arweave',
  ],
  2: [
    'Up to 1,000 Subdomains',
    'Available via all ArNS-enabled gateways',
    'Permanently stored on Arweave',
  ],
  3: [
    'Up to 10,000 Subdomains',
    'Available via all ArNS-enabled gateways',
    'Permanently stored on Arweave',
  ],
};
export const NAME_PRICE_INFO =
  'Registration fees are determined by the character length of the domain, lease duration, and what tier you choose.';

export const MAX_LEASE_DURATION = 200;
export const MIN_LEASE_DURATION = 1;
