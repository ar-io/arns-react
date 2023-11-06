import Arweave from 'arweave';

import { ArweaveTransactionID } from '../services/arweave/ArweaveTransactionID';
import { PDNSContractJSON, PDNTContractJSON } from '../types';

export const PDNS_SERVICE_API =
  process.env.VITE_ARNS_SERVICE_API ?? 'https://dev.arns.app';
export const ARWEAVE_HOST = process.env.VITE_ARWEAVE_HOST ?? 'ar-io.dev';

export const DEFAULT_ARWEAVE = new Arweave({
  host: ARWEAVE_HOST,
  protocol: 'https',
});

// note: lookahead/lookbehind regex's are not compatible with iOS browsers

export const MAX_ARNS_NAME_LENGTH = 51;
export const MAX_UNDERNAME_LENGTH = 61;
export const PDNS_NAME_REGEX = new RegExp(
  `^([a-zA-Z0-9][a-zA-Z0-9-]{0,${
    MAX_ARNS_NAME_LENGTH - 2
  }}[a-zA-Z0-9]|[a-zA-Z0-9]{1})$`,
);
export const PDNS_NAME_REGEX_PARTIAL = new RegExp(
  `^[a-zA-Z0-9-]{0,${MAX_ARNS_NAME_LENGTH}}$`,
);
export const UNDERNAME_REGEX = new RegExp(
  `^([a-zA-Z0-9][a-zA-Z0-9-]{0,${
    MAX_UNDERNAME_LENGTH - 2
  }}[a-zA-Z0-9]|[a-zA-Z0-9]{1})$`,
);

export const APPROVED_CHARACTERS_REGEX = new RegExp(`^[a-zA-Z0-9-]{0,61}$`);
export const ALPHA_NUMERIC_REGEX = new RegExp('^[a-zA-Z0-9]$');
export const PDNS_TX_ID_REGEX = new RegExp('^[a-zA-Z0-9-_s+]{43}$');
export const PDNS_TX_ID_ENTRY_REGEX = new RegExp('^[a-zA-Z0-9-_s+]{1,43}$');
export const EMAIL_REGEX = new RegExp(
  "([!#-'*+/-9=?A-Z^-~-]+(.[!#-'*+/-9=?A-Z^-~-]+)*|\"([]!#-[^-~ \t]|(\\[\t -~]))+\")@([!#-'*+/-9=?A-Z^-~-]+(.[!#-'*+/-9=?A-Z^-~-]+)*|[[\t -Z^-~]*])", // eslint-disable-line
);
export const TTL_SECONDS_REGEX = new RegExp('^[0-9]{3,7}$');
export const TTL_SECONDS_ENTRY_REGEX = new RegExp('^[0-9]{1,7}$');
export const ARNS_REGISTRY_ADDRESS = new ArweaveTransactionID(
  process.env.VITE_ARNS_REGISTRY_ADDRESS ??
    '3aX8Ck5_IRLA3L9o4BJLOWxJDrmLLIPoUGZxqOfmHDI',
);
export const STUB_PDNT_ID = '6dUiTQKJCVD7c9icQhbbzfI-Le_hC4sXRDx1OQQ6jMI';
export const STUB_ARWEAVE_TXID = '2yHmORN-N12hM1B2f9-JPMpOfa59qhpsExFCzImrD30'; // pdns spec pdf
export const DEFAULT_PDNT_SOURCE_CODE_TX =
  'H2uxnw_oVIEzXeBeYmxDgJuxPqwBCGPO4OmQzdWQu3U';
export const RECOMMENDED_TRANSACTION_CONFIRMATIONS = 50;
export const DEFAULT_TTL_SECONDS = 3600;
export const DEFAULT_MAX_UNDERNAMES = 10;
export const MAX_UNDERNAME_COUNT = 50_000;
export const PDNT_CONTRACT_STATE_KEYS = [
  'balances',
  'evolve',
  'name',
  'owner',
  'records',
  'ticker',
];

// seconds / milliseconds in 365 days (not leap year aware)
export const YEAR_IN_MILLISECONDS = 31536000000;
export const YEAR_IN_SECONDS = 31536000;
export const AVERAGE_BLOCK_TIME = 120_000;

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

export const NAME_PRICE_INFO =
  'Registration fees are determined by the character length of the domain, and what lease duration you choose.';
export const MAX_TTL_SECONDS = 2_592_000;
export const MIN_TTL_SECONDS = 900;
export const MIN_SAFE_EDIT_CONFIRMATIONS = 15;
export const MAX_LEASE_DURATION = 5;
export const MIN_LEASE_DURATION = 1;
export const RESERVED_NAME_LENGTH = 4; // names must be greater than 4 characters, in contract this is MINIMUM_ALLOWED_NAME_LENGTH = 5
export const SECONDS_IN_GRACE_PERIOD = 1814400;
export const ANNUAL_PERCENTAGE_FEE = 0.1;
export const UNDERNAME_REGISTRATION_IO_FEE = 1;
export const PERMABUY_LEASE_FEE_LENGTH = 10;

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
export const transactionByOwnerQuery = (address: ArweaveTransactionID) => {
  const queryObject = {
    query: `
  { 
    transactions (
      owners:["${address.toString()}"]
      sort: HEIGHT_DESC,
      first: 1,
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
export const SMARTWEAVE_MAX_INPUT_SIZE = 1700;

export const DEFAULT_PDNT_CONTRACT_STATE: PDNTContractJSON = {
  balances: {},
  evolve: undefined,
  name: '',
  ticker: '',
  owner: '',
  controllers: [],
  records: {
    '@': {
      transactionId: '',
      ttlSeconds: DEFAULT_TTL_SECONDS,
      maxUndernames: DEFAULT_MAX_UNDERNAMES,
    },
  },
};
export const DEFAULT_PDNS_REGISTRY_STATE: PDNSContractJSON = {
  records: {},
  fees: {},
  balances: { '': 0 },
  controllers: [],
  evolve: undefined,
  reserved: {},
  settings: {
    auctions: {
      current: '',
      history: [],
    },
  },
  name: '',
  owner: undefined,
  ticker: '',
  approvedANTSourceCodeTxs: [],
};

export const WARP_CONTRACT_BASE_URL = 'https://sonar.warp.cc/#/app/contract/';
export const WARP_INTERACTION_BASE_URL =
  'https://sonar.warp.cc/#/app/interaction/';

export const ATOMIC_FLAG = 'atomic' as const;

export const ATOMIC_REGISTRATION_INPUT = {
  function: 'buyRecord',
  name: '',
  contractTxId: ATOMIC_FLAG,
  qty: 0,
};

export const RESERVED_BREADCRUMB_TITLES = new Set([
  'Manage Assets',
  'Increase Undernames',
  'Extend Lease',
  'Manage Undernames',
]);

export const ARIO_DISCORD_LINK = 'https://discord.gg/7dBaqcE8';
export const APPROXIMATE_BLOCKS_PER_DAY = 720;
