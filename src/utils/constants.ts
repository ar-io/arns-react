export const ARNS_NAME_REGEX = new RegExp('^(?!-)[a-z0-9-s+]{1,32}(?<!-)$');

// TODO: pull these from external source, ideally arns contract
export const FEATURED_DOMAINS = [
  'arcode',
  'ardrive',
  'arns',
  'blog',
  'connect',
  'permapages',
  'permaweb',
  'pst',
  'sam',
  'search',
  'wallet',
];

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
