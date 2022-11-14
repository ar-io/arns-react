export const ARNS_NAME_REGEX = new RegExp('^(?!-)[a-zA-Z0-9-s+]{1,32}(?<!-)$');

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

export function NAME_PRICE_CALC({
  domain,
  years,
  tier,
  fees,
}: {
  domain: string | undefined;
  years: number;
  tier: number;
  fees: { [x: number]: number };
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
    if (!domain) {
      throw Error('Domain is undefined');
    }
    if (ARNS_NAME_REGEX.test(domain) && domain) {
      let nameLength = domain.length;
      if (nameLength > Object.keys(fees).length) {
        nameLength = Object.keys(fees).length;
      }
      const namePrice = fees[nameLength];
      const price = namePrice * years * tier;

      return price;
    } else {
      throw Error('invalid name, failed name regex');
    }
  } catch (error) {
    return 0;
  }
}
