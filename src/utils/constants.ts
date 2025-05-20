import {
  ANT_LUA_ID,
  DEFAULT_SCHEDULER_ID,
  arioDevnetProcessId,
} from '@ar.io/sdk/web';
import { TokenType } from '@ardrive/turbo-sdk';
import Arweave from 'arweave';
import { ArweaveWebWallet } from 'arweave-wallet-connector';

import antChangelog from '../../assets/ant-changelog.md?raw';
import AO_IMAGE from '../../assets/images/featured-domains/ao.png';
import ARDRIVE_IMAGE from '../../assets/images/featured-domains/ardrive.png';
import ARLINK_IMAGE from '../../assets/images/featured-domains/arlink.png';
import ARWIKI_IMAGE from '../../assets/images/featured-domains/arwiki.png';
import AR_FEES_IMAGE from '../../assets/images/featured-domains/fees.png';
import METALINKS_IMAGE from '../../assets/images/featured-domains/metalinks.png';
import MFERS_IMAGE from '../../assets/images/featured-domains/mfers.png';
import PERMASWAP_IMAGE from '../../assets/images/featured-domains/permaswap.png';
import SAM_IMAGE from '../../assets/images/featured-domains/sam.png';
import { ArweaveTransactionID } from '../services/arweave/ArweaveTransactionID';

export const APP_NAME = 'AR-IO-ArNS-App';
export const APP_VERSION = __NPM_PACKAGE_VERSION__ || '1.0.0';
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

export const ARWEAVE_HOST = import.meta.env.VITE_ARWEAVE_HOST ?? 'arweave.net';
export const ARWEAVE_GRAPHQL_URL =
  import.meta.env.VITE_ARWEAVE_GRAPHQL_URL ?? 'https://arweave.net/graphql';

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

export const KEYWORD_REGEX = new RegExp('^[a-zA-Z0-9\\-_@#s+]{1,32}$');

export const APPROVED_CHARACTERS_REGEX = new RegExp(`^[a-zA-Z0-9\-_]{0,61}$`);
export const ALPHA_NUMERIC_REGEX = new RegExp('^[a-zA-Z0-9]$');
export const ARNS_TX_ID_REGEX = new RegExp('^[a-zA-Z0-9\\-_s+]{43}$');
export const ARNS_TX_ID_ENTRY_REGEX = new RegExp('^[a-zA-Z0-9\\-_s+]{1,43}$');
export const ARWEAVE_TX_LENGTH = 43;
export const EMAIL_REGEX = new RegExp(
  "([!#-'*+/-9=?A-Z^-~-]+(.[!#-'*+/-9=?A-Z^-~-]+)*|\"([]!#-[^-~ \t]|(\\[\t -~]))+\")@([!#-'*+/-9=?A-Z^-~-]+(.[!#-'*+/-9=?A-Z^-~-]+)*|[[\t -Z^-~]*])", // eslint-disable-line
);

export const FQDN_REGEX = new RegExp(
  '^(?:(?!-)[A-Za-z0-9-]{1,63}(?<!-)\\.)+[A-Za-z]{1,63}$',
);
export const URL_REGEX = new RegExp(
  '^((https?|ftp)://)?' +
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' +
    '((\\d{1,3}\\.){3}\\d{1,3}))' +
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' +
    '(\\?[;&a-z\\d%_.~+=-]*)?' +
    '(\\#[-a-z\\d_]*)?$',
  'i',
);
export const ARIO_PROCESS_ID =
  import.meta.env.VITE_ARIO_PROCESS_ID || arioDevnetProcessId;

export const DEFAULT_ANT_LUA_ID = ANT_LUA_ID;

export const DEFAULT_ANT_LOGO = 'Sie_26dvgyok0PZD_-iQAFOhOd5YxDTkczOLoqTTL_A';
export const ARIO_AO_CU_URL =
  import.meta.env.VITE_ARIO_AO_CU_URL || 'https://cu.ardrive.io';

export const ANT_AO_CU_URL =
  import.meta.env.VITE_ANT_AO_CU_URL || 'https://cu.ardrive.io';

export const devPaymentServiceFqdn = 'payment.ardrive.dev';
export const prodPaymentServiceFqdn = 'payment.ardrive.io';

export const PAYMENT_SERVICE_FQDN =
  import.meta.env.VITE_NODE_ENV == 'production'
    ? prodPaymentServiceFqdn
    : devPaymentServiceFqdn;

// PUBLISHABLE KEYS
export const devStripePublishableKey =
  'pk_test_51JUAtwC8apPOWkDLh2FPZkQkiKZEkTo6wqgLCtQoClL6S4l2jlbbc5MgOdwOUdU9Tn93NNvqAGbu115lkJChMikG00XUfTmo2z';

export const prodStripePublishableKey =
  'pk_live_51JUAtwC8apPOWkDLMQqNF9sPpfneNSPnwX8YZ8y1FNDl6v94hZIwzgFSYl27bWE4Oos8CLquunUswKrKcaDhDO6m002Yj9AeKj';

export const STRIPE_PUBLISHABLE_KEY =
  import.meta.env.VITE_NODE_ENV == 'production'
    ? prodStripePublishableKey
    : devStripePublishableKey;

export const NETWORK_DEFAULTS = {
  AO: {
    ARIO: {
      CU_URL: ARIO_AO_CU_URL, // ao public cu: https://cu.ao-testnet.xyz
      MU_URL: 'https://mu.ao-testnet.xyz',
      SCHEDULER: DEFAULT_SCHEDULER_ID,
    },

    ANT: {
      CU_URL: ANT_AO_CU_URL,
      MU_URL: 'https://mu.ao-testnet.xyz',
      SCHEDULER: DEFAULT_SCHEDULER_ID,
      GRAPHQL_URL: ARWEAVE_GRAPHQL_URL,
    },
  },
  ARWEAVE: {
    HOST: ARWEAVE_HOST,
    PORT: 443,
    PROTOCOL: 'https',
    GRAPHQL_URL: ARWEAVE_GRAPHQL_URL,
  },
  ARNS: {
    HOST: 'ar.io',
  },
  TURBO: {
    UPLOAD_URL: 'https://turbo.ardrive.io',
    PAYMENT_URL: `https://${PAYMENT_SERVICE_FQDN}`,
    GATEWAY_URL: 'https://arweave.net',
    WALLETS_URL: `https://${PAYMENT_SERVICE_FQDN}/info`,
    STRIPE_PUBLISHABLE_KEY,
  },
};

export const RECOMMENDED_TRANSACTION_CONFIRMATIONS = 50;

export const DEFAULT_MAX_UNDERNAMES = 10;
export const MAX_UNDERNAME_COUNT = 10_000;

// seconds / milliseconds in 365 days (not leap year aware)
export const YEAR_IN_MILLISECONDS = 31536000000;

export const AVERAGE_BLOCK_TIME_MS = 120_000; // 2 mins

export const FEATURED_DOMAINS: { [x: string]: { imageUrl: string } } = {
  arlink: { imageUrl: ARLINK_IMAGE },

  metalinks: { imageUrl: METALINKS_IMAGE },
  ardrive: { imageUrl: ARDRIVE_IMAGE },
  arwiki: { imageUrl: ARWIKI_IMAGE },
  permaswap: { imageUrl: PERMASWAP_IMAGE },
  'ar-fees': { imageUrl: AR_FEES_IMAGE },
  // alex: { imageUrl: ALEX_IMAGE },
  // cookbook: { imageUrl: COOKBOOK_IMAGE },
  ao: { imageUrl: AO_IMAGE },

  sam: { imageUrl: SAM_IMAGE },
  mfers: { imageUrl: MFERS_IMAGE },
};

export const DEFAULT_TTL_SECONDS = 900;
export const MAX_TTL_SECONDS = 86400;
export const MIN_TTL_SECONDS = 60;
export const MAX_LEASE_DURATION = 5;
export const MIN_LEASE_DURATION = 1;
export const SECONDS_IN_GRACE_PERIOD = 14 * 24 * 60 * 60; // 2 weeks
export const MILLISECONDS_IN_GRACE_PERIOD = SECONDS_IN_GRACE_PERIOD * 1000;

export const START_RNP_PREMIUM = 50;

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

export const LANDING_PAGE_TXID = new ArweaveTransactionID(
  'oork_YifB3-JQQZg8EgMPQJytua_QCHKNmMqt5kmnCo',
);

export const RESERVED_BREADCRUMB_TITLES = new Set([
  'Manage Assets',
  'Increase Undernames',
  'Extend Lease',
  'Manage Undernames',
]);

export const ARIO_DISCORD_LINK = 'https://discord.com/invite/HGG52EtTc2';
export const PERMANENT_DOMAIN_MESSAGE = 'Indefinite';

export const METAMASK_URL = 'https://metamask.io/';
export const ANT_CHANGELOG = antChangelog;

export const KiB = 1024;
export const MiB = 1024 * KiB;
export const GiB = 1024 * MiB;

export const currencyLabels: Partial<Record<TokenType, string>> = {
  arweave: 'AR',
  ethereum: 'ETH',
  solana: 'SOL',
  kyve: 'KYVE',
  matic: 'MATIC',
  pol: 'POL',
};

export const LINK_HOW_ARE_CONVERSIONS_DETERMINED =
  'https://help.ardrive.io/hc/en-us/articles/17043397992731';
