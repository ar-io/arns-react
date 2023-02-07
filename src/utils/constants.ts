import {
  ArweaveTransactionID,
  VALIDATION_INPUT_TYPES,
  ValidationObject,
} from '../types';
import { isArweaveTransactionID } from './searchUtils';

// note: lookahead/lookbehind regex's are not compatible with iOS browsers
export const ARNS_NAME_REGEX = new RegExp(
  '^([a-zA-Z0-9][a-zA-Z0-9-]{0,30}[a-zA-Z0-9]|[a-zA-Z0-9]{1})$',
);
export const ARNS_TX_ID_REGEX = new RegExp('^[a-zA-Z0-9-_s+]{43}$');
export const ARNS_TX_ID_ENTRY_REGEX = new RegExp('^[a-zA-Z0-9-_s+]{1,43}$');

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
      owners:["${address}"]
      tags:[
        {
          name:"Contract-Src",
          values:${JSON.stringify(approvedSourceCodeTransactions)}
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

export const VALIDATION_INPUT_PRESETS = {
  // [VALIDATION_INPUT_TYPES.ARWEAVE_ID]: isArweaveTransactionID,
  // todo: add these presets
  //[VALIDATION_INPUT_TYPES.ANT_CONTRACT_ID]: isValidAntId,
  //[VALIDATION_INPUT_TYPES.ARNS_NAME]: isValidArnsName,
  //[VALIDATION_INPUT_TYPES.ARWEAVE_ADDRESS]: isArweaveAddress,
  //[VALIDATION_INPUT_TYPES.UNDERNAME]: isValidUndername,
};
export const VALIDATION_OBJECT: ValidationObject = {
  name: 'N/A',
  status: false,
  error: 'N/A',
};
