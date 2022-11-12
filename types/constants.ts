export const ARNS_NAME_REGEX = new RegExp('^(?!-)[a-zA-Z0-9-s+]{1,32}(?<!-)$');
export const NAME_PRICES: { [x: number]: number } = {
  1: 4218750000,
  2: 1406250000,
  3: 468750000,
  4: 156250000,
  5: 62500000,
  6: 25000000,
  7: 10000000,
  8: 5000000,
  9: 1000000,
  10: 500000,
  11: 450000,
  12: 400000,
  13: 350000,
  14: 300000,
  15: 250000,
  16: 200000,
  17: 175000,
  18: 150000,
  19: 125000,
  20: 100000,
  21: 100000,
  22: 100000,
  23: 100000,
  24: 100000,
  25: 100000,
  26: 100000,
  27: 100000,
  28: 100000,
  29: 100000,
  30: 100000,
  31: 100000,
  32: 100000,
};
export const TIER_DATA = {
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

export function NAME_PRICE_CALC({
  domain,
  years,
  tier,
}: {
  domain: string | undefined;
  years: number;
  tier: number;
}) {
  try {
    if (years < 1) {
      throw Error('must lease for atleast one year');
    }
    if (tier < 1) {
      throw Error('Minimum tier is 1');
    }
    if (tier > 3) {
      throw Error('Maximum tier is 3');
    }
    if (!domain){
      throw Error("Domain is undefined")
    }
    if (ARNS_NAME_REGEX.test(domain) && domain) {
      const nameLength = domain.length;
      const namePrice = NAME_PRICES[nameLength];
      const price = namePrice * years * tier;

      return price;
    } else {
      throw Error('invalid name, failed name regex');
    }
  } catch (error) {
    return 0;
  }
}
