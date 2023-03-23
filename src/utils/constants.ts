import { ANTContractJSON, ArweaveTransactionID } from '../types';

export const ARNS_REGISTRY_ID = 'bLAgYxAdX2Ry-nt6aH2ixgvJXbpsEYm28NgJgyqfs-U';
// note: lookahead/lookbehind regex's are not compatible with iOS browsers
export const ARNS_NAME_REGEX = new RegExp(
  '^([a-zA-Z0-9][a-zA-Z0-9-]{0,30}[a-zA-Z0-9]|[a-zA-Z0-9]{1})$',
);
export const ARNS_TX_ID_REGEX = new RegExp('^[a-zA-Z0-9-_s+]{43}$');
export const ARNS_TX_ID_ENTRY_REGEX = new RegExp('^[a-zA-Z0-9-_s+]{1,43}$');
export const STUB_ARWEAVE_TXID = '2yHmORN-N12hM1B2f9-JPMpOfa59qhpsExFCzImrD30'; // arns spec pdf
export const DEFAULT_ANT_SOURCE_CODE_TX =
  'PEI1efYrsX08HUwvc6y-h6TSpsNlo2r6_fWL2_GdwhY';
export const RECOMMENDED_TRANSACTION_CONFIRMATIONS = 50;
export const ANT_CONTRACT_STATE_KEYS = [
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

export const DEFAULT_ANT_CONTRACT_STATE: ANTContractJSON = {
  balances: {},
  evolve: undefined,
  name: '',
  ticker: '',
  owner: '',
  controller: '',
  records: {
    '@': {
      transactionId: '',
      ttlSeconds: 1800,
      maxSubdomains: 100,
    },
  },
};

export const WARP_CONTRACT_BASE_URL = 'https://sonar.warp.cc/#/app/contract/';
export const WARP_INTERACTION_BASE_URL =
  'https://sonar.warp.cc/#/app/interaction/';

export const SMARTWEAVE_INTERACTION_TAGS = [
  {
    name: 'App-Name',
    value: 'SmartWeaveAction',
  },
  {
    name: 'Contract',
    value: ARNS_REGISTRY_ID, // arns registry by default
  },
  {
    name: 'Input',
    value: '',
  },
];

export const ATOMIC_REGISTRATION_INPUT = {
  function: 'buyRecord',
  name: 'domain',
  contractTxId: 'atomic',
  years: 1,
  tierNumber: 1,
};
