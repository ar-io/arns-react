import { ArweaveTransactionID, PDNTContractJSON } from '../types';

// note: lookahead/lookbehind regex's are not compatible with iOS browsers
export const PDNS_NAME_REGEX = new RegExp(
  '^([a-zA-Z0-9][a-zA-Z0-9-]{0,30}[a-zA-Z0-9]|[a-zA-Z0-9]{1})$',
);
export const PDNS_TX_ID_REGEX = new RegExp('^[a-zA-Z0-9-_s+]{43}$');
export const PDNS_TX_ID_ENTRY_REGEX = new RegExp('^[a-zA-Z0-9-_s+]{1,43}$');
export const PDNS_REGISTRY_ADDRESS =
  'bLAgYxAdX2Ry-nt6aH2ixgvJXbpsEYm28NgJgyqfs-U';
export const STUB_PDNT_ID = '6dUiTQKJCVD7c9icQhbbzfI-Le_hC4sXRDx1OQQ6jMI';
export const STUB_ARWEAVE_TXID = '2yHmORN-N12hM1B2f9-JPMpOfa59qhpsExFCzImrD30'; // pdns spec pdf
export const DEFAULT_PDNT_SOURCE_CODE_TX =
  'PEI1efYrsX08HUwvc6y-h6TSpsNlo2r6_fWL2_GdwhY';
export const RECOMMENDED_TRANSACTION_CONFIRMATIONS = 50;
export const DEFAULT_TTL_SECONDS = 3600;
export const DEFAULT_MAX_UNDERNAMES = 100;
export const PDNT_CONTRACT_STATE_KEYS = [
  'balances',
  'evolve',
  'name',
  'owner',
  'records',
  'ticker',
];

// TODO: don't use
export const DEFAULT_EXPIRATION = new Date('12/31/2023');
// TODO: pull from contract
export const FEATURED_DOMAINS = [
  'arcode',
  'ardrive',
  'pdns',
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
    'Up to 100 Undernames',
    'Available via all PDNS-enabled gateways',
    'Permanently stored on Arweave',
  ],
  2: [
    'Up to 1,000 Undernames',
    'Available via all PDNS-enabled gateways',
    'Permanently stored on Arweave',
  ],
  3: [
    'Up to 10,000 Undernames',
    'Available via all PDNS-enabled gateways',
    'Permanently stored on Arweave',
  ],
};
export const NAME_PRICE_INFO =
  'Registration fees are determined by the character length of the domain, lease duration, and what tier you choose.';

export const MAX_LEASE_DURATION = 200;
export const MIN_LEASE_DURATION = 1;
export const approvedContractsForWalletQuery = (
  address: ArweaveTransactionID,
  approvedSourceCodeTransactions: ArweaveTransactionID[],
  cursor?: string,
) => {
  const queryObject = {
    query: `
  { 
    transactions (
      owners:["${address.toString()}"]
      tags:[
        {
          name:"Contract-Src",
          values:${JSON.stringify(
            approvedSourceCodeTransactions.map((id) => id.toString()),
          )}
        }
      ],
      sort: HEIGHT_DESC,
      first: 100,
      ${cursor ? `after: ${cursor}` : ''}
    ) {
      pageInfo {
        hasNextPage
      }
      edges {
        cursor
        node {
          id
          block {
            height
          }
        }
      }
    }
  }`,
  };
  return queryObject;
};

export const SMARTWEAVE_TAG_SIZE = 250; // required tag size in bytes

export const SMARTWEAVE_MAX_TAG_SPACE = 2048 - SMARTWEAVE_TAG_SIZE; // minimum tag size of smartweave tags from warp is 239, rounded it for wiggle room

export const DEFAULT_PDNT_CONTRACT_STATE: PDNTContractJSON = {
  balances: {},
  evolve: undefined,
  name: '',
  ticker: '',
  owner: '',
  controller: '',
  records: {
    '@': {
      transactionId: '',
      ttlSeconds: DEFAULT_TTL_SECONDS,
      maxUndernames: DEFAULT_MAX_UNDERNAMES,
    },
  },
};

export const WARP_CONTRACT_BASE_URL = 'https://sonar.warp.cc/#/app/contract/';
export const WARP_INTERACTION_BASE_URL =
  'https://sonar.warp.cc/#/app/interaction/';