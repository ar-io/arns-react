import { ioDevnetProcessId } from '@ar.io/sdk/web';
import Arweave from 'arweave';
import { ArweaveWebWallet } from 'arweave-wallet-connector';

import ALEX_IMAGE from '../../assets/images/featured-domains/alex.png';
import AO_IMAGE from '../../assets/images/featured-domains/ao.png';
import ARDRIVE_IMAGE from '../../assets/images/featured-domains/ardrive.png';
import ARWIKI_IMAGE from '../../assets/images/featured-domains/arwiki.png';
import COOKBOOK_IMAGE from '../../assets/images/featured-domains/cookbook.png';
import AR_FEES_IMAGE from '../../assets/images/featured-domains/fees.png';
import MFERS_IMAGE from '../../assets/images/featured-domains/mfers.png';
import PERMASWAP_IMAGE from '../../assets/images/featured-domains/permaswap.png';
import SAM_IMAGE from '../../assets/images/featured-domains/sam.png';
import { ArweaveTransactionID } from '../services/arweave/ArweaveTransactionID';

export const APP_NAME = 'AR-IO-ArNS-App';
export const APP_VERSION = '1.0.0';
export const WRITE_OPTIONS = {
  tags: [
    {
      name: 'App-Name',
      value: APP_NAME,
    },
    { name: 'App-Version', value: APP_VERSION },
  ],
};

export const ARWEAVE_APP_API = new ArweaveWebWallet(
  { name: 'ArNS' },
  { state: { url: 'arweave.app' } },
);
export const ARNS_SERVICE_API =
  process.env.VITE_ARNS_SERVICE_API ?? 'https://dev.arns.app';
export const ARWEAVE_HOST = process.env.VITE_ARWEAVE_HOST ?? 'ar-io.dev';

export const DEFAULT_ARWEAVE = new Arweave({
  host: ARWEAVE_HOST,
  protocol: 'https',
  port: 443,
});

export const TRAILING_DASH_UNDERSCORE_REGEX = new RegExp('^[-_]|[-_]$');

// note: lookahead/lookbehind regex's are not compatible with iOS browsers

export const MAX_ARNS_NAME_LENGTH = 51;
export const MAX_UNDERNAME_LENGTH = 61;
export const ARNS_NAME_REGEX = new RegExp(
  `^([a-zA-Z0-9][a-zA-Z0-9-]{0,${
    MAX_ARNS_NAME_LENGTH - 2
  }}[a-zA-Z0-9]|[a-zA-Z0-9]{1})$`,
);
export const ARNS_NAME_REGEX_PARTIAL = new RegExp(
  `^[a-zA-Z0-9-]{0,${MAX_ARNS_NAME_LENGTH}}$`,
);
export const UNDERNAME_REGEX = new RegExp(
  `^([a-zA-Z0-9][a-zA-Z0-9_-]{0,${
    MAX_UNDERNAME_LENGTH - 2
  }}[a-zA-Z0-9]|[a-zA-Z0-9]{1})$`,
);

export const APPROVED_CHARACTERS_REGEX = new RegExp(`^[a-zA-Z0-9\-_]{0,61}$`);
export const ALPHA_NUMERIC_REGEX = new RegExp('^[a-zA-Z0-9]$');
export const ARNS_TX_ID_REGEX = new RegExp('^[a-zA-Z0-9\\-_s+]{43}$');
export const ARNS_TX_ID_ENTRY_REGEX = new RegExp('^[a-zA-Z0-9\\-_s+]{1,43}$');
export const ARWEAVE_TX_LENGTH = 43;
export const EMAIL_REGEX = new RegExp(
  "([!#-'*+/-9=?A-Z^-~-]+(.[!#-'*+/-9=?A-Z^-~-]+)*|\"([]!#-[^-~ \t]|(\\[\t -~]))+\")@([!#-'*+/-9=?A-Z^-~-]+(.[!#-'*+/-9=?A-Z^-~-]+)*|[[\t -Z^-~]*])", // eslint-disable-line
);
export const TTL_SECONDS_REGEX = new RegExp('^[0-9]{3,7}$');
export const TTL_SECONDS_ENTRY_REGEX = new RegExp('^[0-9]{1,7}$');
export const ARNS_REGISTRY_ADDRESS = new ArweaveTransactionID(
  process.env.VITE_ARNS_REGISTRY_ADDRESS ??
    '_NctcA2sRy1-J4OmIQZbYFPM17piNcbdBPH2ncX2RL8',
);
export const IO_PROCESS_ID =
  process.env.VITE_IO_PROCESS_ID || ioDevnetProcessId;
export const STUB_ANT_ID = '6dUiTQKJCVD7c9icQhbbzfI-Le_hC4sXRDx1OQQ6jMI';
export const STUB_ARWEAVE_TXID = '2yHmORN-N12hM1B2f9-JPMpOfa59qhpsExFCzImrD30'; // arns spec pdf
export const DEFAULT_ANT_SOURCE_CODE_TX =
  'H2uxnw_oVIEzXeBeYmxDgJuxPqwBCGPO4OmQzdWQu3U';
export const RECOMMENDED_TRANSACTION_CONFIRMATIONS = 50;
export const DEFAULT_TTL_SECONDS = 3600;
export const DEFAULT_MAX_UNDERNAMES = 10;
export const MAX_UNDERNAME_COUNT = 10_000;

// seconds / milliseconds in 365 days (not leap year aware)
export const YEAR_IN_MILLISECONDS = 31536000000;
export const YEAR_IN_SECONDS = 31536000;
export const AVERAGE_BLOCK_TIME_MS = 120_000; // 2 mins

export const FEATURED_DOMAINS: { [x: string]: { imageUrl: string } } = {
  ao: { imageUrl: AO_IMAGE },
  ardrive: { imageUrl: ARDRIVE_IMAGE },
  arwiki: { imageUrl: ARWIKI_IMAGE },

  permaswap: { imageUrl: PERMASWAP_IMAGE },
  'ar-fees': { imageUrl: AR_FEES_IMAGE },
  alex: { imageUrl: ALEX_IMAGE },
  cookbook: { imageUrl: COOKBOOK_IMAGE },
  sam: { imageUrl: SAM_IMAGE },
  mfers: { imageUrl: MFERS_IMAGE },
};

export const NAME_PRICE_INFO =
  'Registration fees are determined by the character length of the domain, and what lease duration you choose.';
export const MAX_TTL_SECONDS = 2_592_000;
export const MIN_TTL_SECONDS = 900;
export const MIN_SAFE_EDIT_CONFIRMATIONS = 15;
export const MAX_LEASE_DURATION = 5;
export const MIN_LEASE_DURATION = 1;
export const SECONDS_IN_GRACE_PERIOD = 1814400;

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
// 4rq6KnLwQnYY_sSJskHTXPv4QdCSmHYwFJ4VvrFWWjo

// original landing
// export const LANDING_PAGE_TXID = new ArweaveTransactionID(
//   'UyC5P5qKPZaltMmmZAWdakhlDXsBF6qmyrbWYFchRTk',
// );

export const LANDING_PAGE_TXID = new ArweaveTransactionID(
  '4rq6KnLwQnYY_sSJskHTXPv4QdCSmHYwFJ4VvrFWWjo',
);

export const DEFAULT_ANT_CONTRACT_STATE = {
  balances: {},
  name: '',
  ticker: '',
  owner: '',
  controllers: [],
  records: {
    '@': {
      transactionId: LANDING_PAGE_TXID.toString(),
      ttlSeconds: DEFAULT_TTL_SECONDS,
    },
  },
};

export const RESERVED_BREADCRUMB_TITLES = new Set([
  'Manage Assets',
  'Increase Undernames',
  'Extend Lease',
  'Manage Undernames',
]);

export const ARIO_DISCORD_LINK = 'https://discord.com/invite/HGG52EtTc2';
export const APPROXIMATE_BLOCKS_PER_DAY = 720;
