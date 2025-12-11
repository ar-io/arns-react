import {
  ANT_LUA_ID,
  ANT_REGISTRY_ID,
  ARIO_TESTNET_PROCESS_ID,
  DEFAULT_SCHEDULER_ID,
} from '@ar.io/sdk/web';
import { TokenType } from '@ardrive/turbo-sdk';
import Arweave from 'arweave';
import { ArweaveWebWallet } from 'arweave-wallet-connector';

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

// This is the minimum version all workflows are currently compatible with (including reassign, release, etc)
export const MIN_ANT_VERSION = 16;
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
export const HYPERBEAM_URL = import.meta.env.VITE_HYPERBEAM_URL;
export const WALLETCONNECT_PROJECT_ID = '692e2917daed8533f0f59cd604c3751a';
export const DEFAULT_ARWEAVE = new Arweave({
  host: ARWEAVE_HOST,
  protocol: 'https',
  port: 443,
});

export const TRAILING_DASH_UNDERSCORE_REGEX = new RegExp('^[-_]|[-_]$');

// note: lookahead/lookbehind regex's are not compatible with iOS browsers

export const MAX_ARNS_NAME_LENGTH = 51;
export const MAX_FULL_ARNS_NAME_LENGTH = 61;
export const MAX_UNDERNAME_LENGTH = MAX_FULL_ARNS_NAME_LENGTH - 2; // a_ is the shortest base name with _
export const ARNS_NAME_REGEX = new RegExp(
  `^(([a-zA-Z0-9][a-zA-Z0-9-]{0,40}[a-zA-Z0-9])|([a-zA-Z0-9][a-zA-Z0-9-]{42,${
    MAX_ARNS_NAME_LENGTH - 2
  }}[a-zA-Z0-9])|[a-zA-Z0-9]{1})$`,
);
export const ARNS_NAME_REGEX_PARTIAL = new RegExp(
  `^[a-zA-Z0-9-]{0,${MAX_ARNS_NAME_LENGTH}}$`,
);
export const UNDERNAME_REGEX = new RegExp(
  // one alphanumeric character, any amount of alphanumeric or underscores or dashes, and then one alphanumeric character
  `^[A-Za-z0-9](?:[A-Za-z0-9_\\-]{0,${MAX_UNDERNAME_LENGTH - 2}}[A-Za-z0-9])?$`,
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
  import.meta.env.VITE_ARIO_PROCESS_ID || ARIO_TESTNET_PROCESS_ID;

// TODO: export this from the sdk
export const ANT_REGISTRY_TESTNET_PROCESS_ID =
  'RR0vheYqtsKuJCWh6xj0beE35tjaEug5cejMw9n2aa8';
export const ANT_REGISTRY_PROCESS_ID =
  import.meta.env.VITE_NODE_ENV === 'production'
    ? ANT_REGISTRY_ID
    : ANT_REGISTRY_TESTNET_PROCESS_ID;

export const DEFAULT_ANT_LUA_ID = ANT_LUA_ID;

export const DEFAULT_ANT_LOGO = 'Sie_26dvgyok0PZD_-iQAFOhOd5YxDTkczOLoqTTL_A';
export const ARIO_AO_CU_URL =
  import.meta.env.VITE_ARIO_AO_CU_URL || 'https://cu.ardrive.io';

export const ANT_AO_CU_URL =
  import.meta.env.VITE_ANT_AO_CU_URL || 'https://cu.ardrive.io';

export const devPaymentServiceFqdn = 'payment.ardrive.dev';
export const prodPaymentServiceFqdn = 'payment.ardrive.io';

export const PAYMENT_SERVICE_FQDN =
  import.meta.env.VITE_NODE_ENV === 'production'
    ? prodPaymentServiceFqdn
    : devPaymentServiceFqdn;

// PUBLISHABLE KEYS
export const devStripePublishableKey =
  'pk_test_51JUAtwC8apPOWkDLh2FPZkQkiKZEkTo6wqgLCtQoClL6S4l2jlbbc5MgOdwOUdU9Tn93NNvqAGbu115lkJChMikG00XUfTmo2z';

export const prodStripePublishableKey =
  'pk_live_51JUAtwC8apPOWkDLMQqNF9sPpfneNSPnwX8YZ8y1FNDl6v94hZIwzgFSYl27bWE4Oos8CLquunUswKrKcaDhDO6m002Yj9AeKj';

export const STRIPE_PUBLISHABLE_KEY =
  import.meta.env.VITE_NODE_ENV === 'production'
    ? prodStripePublishableKey
    : devStripePublishableKey;

export const NETWORK_DEFAULTS = {
  AO: {
    ARIO: {
      CU_URL: ARIO_AO_CU_URL, // ao public cu: https://cu.ao-testnet.xyz
      MU_URL: 'https://mu.ao-testnet.xyz',
      SCHEDULER: DEFAULT_SCHEDULER_ID,
      HYPERBEAM_URL: HYPERBEAM_URL,
      MODE: 'legacy' as const,
    },
    ANT: {
      CU_URL: ANT_AO_CU_URL,
      MU_URL: 'https://mu.ao-testnet.xyz',
      SCHEDULER: DEFAULT_SCHEDULER_ID,
      GRAPHQL_URL: ARWEAVE_GRAPHQL_URL,
      HYPERBEAM_URL: HYPERBEAM_URL,
      MODE: 'legacy' as const,
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
  // TODO: pull from the ARIO contract
  arlink: { imageUrl: ARLINK_IMAGE },
  metalinks: { imageUrl: METALINKS_IMAGE },
  ardrive: { imageUrl: ARDRIVE_IMAGE },
  arwiki: { imageUrl: ARWIKI_IMAGE },
  permaswap: { imageUrl: PERMASWAP_IMAGE },
  'ar-fees': { imageUrl: AR_FEES_IMAGE },
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

export const KiB = 1024;
export const MiB = 1024 * KiB;
export const GiB = 1024 * MiB;

// Logo/Image Upload Constants
/**
 * Maximum allowed logo file size in bytes (100 KiB)
 * Files larger than this will be automatically compressed
 */
export const MAX_LOGO_SIZE = 100 * KiB;

/**
 * Recommended maximum logo file size in bytes (50 KiB)
 * Files larger than this but under MAX_LOGO_SIZE will show a warning
 */
export const RECOMMENDED_MAX_SIZE = 50 * KiB;

/**
 * Recommended maximum image dimension in pixels
 * Images larger than this will show a warning
 */
export const RECOMMENDED_MAX_DIMENSION = 1000;

/**
 * List of allowed MIME types for logo images
 */
export const ALLOWED_IMAGE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/gif',
  'image/svg+xml',
  'image/webp',
];

export const currencyLabels: Partial<Record<TokenType, string>> = {
  arweave: 'AR',
  ethereum: 'ETH',
  solana: 'SOL',
  kyve: 'KYVE',
  matic: 'MATIC',
  pol: 'POL',
  ario: 'ARIO',
  'base-eth': 'ETH on Base',
  'base-usdc': 'USDC on Base',
  'base-ario': 'ARIO on Base',
  usdc: 'USDC',
  'polygon-usdc': 'USDC on Polygon',
};

// Supported tokens for crypto top-ups by wallet type
export type SupportedCryptoToken = TokenType;

export const ARWEAVE_WALLET_TOKENS: SupportedCryptoToken[] = [
  'arweave',
  'ario',
];
export const ETHEREUM_WALLET_TOKENS: SupportedCryptoToken[] = [
  'ethereum',
  'base-eth',
  'usdc',
  'base-usdc',
  'pol',
  'polygon-usdc',
  'ario',
  'base-ario',
];

// Preset amounts for crypto top-ups by token type
export const CRYPTO_PRESETS: Partial<Record<TokenType, number[]>> = {
  arweave: [0.5, 1, 5, 10],
  ario: [50, 100, 500, 1000],
  'base-ario': [50, 100, 500, 1000],
  ethereum: [0.01, 0.05, 0.1, 0.25],
  'base-eth': [0.01, 0.05, 0.1, 0.25],
  usdc: [5, 25, 50, 100],
  'base-usdc': [5, 25, 50, 100],
  pol: [5, 25, 50, 100],
  'polygon-usdc': [5, 25, 50, 100],
};

// Token display names for the selection grid
export const TOKEN_DISPLAY_INFO: Partial<
  Record<TokenType, { name: string; network?: string }>
> = {
  arweave: { name: 'AR', network: 'Arweave' },
  ario: { name: 'ARIO', network: 'AO' },
  'base-ario': { name: 'ARIO', network: 'Base' },
  ethereum: { name: 'ETH', network: 'Ethereum' },
  'base-eth': { name: 'ETH', network: 'Base' },
  usdc: { name: 'USDC', network: 'Ethereum' },
  'base-usdc': { name: 'USDC', network: 'Base' },
  pol: { name: 'POL', network: 'Polygon' },
  'polygon-usdc': { name: 'USDC', network: 'Polygon' },
};

export const LINK_HOW_ARE_CONVERSIONS_DETERMINED =
  'https://docs.ar.io/build/upload/turbo-credits#pricing--fees';

// Network Chain IDs
export const ETH_MAINNET_CHAIN_ID = 1;
export const BASE_MAINNET_CHAIN_ID = 8453;
export const BASE_SEPOLIA_CHAIN_ID = 84532;
export const POLYGON_MAINNET_CHAIN_ID = 137;

// Token Contract Addresses
export const ETH_USDC_CONTRACT =
  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' as const;
export const BASE_USDC_CONTRACT =
  '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as const;
export const BASE_ARIO_CONTRACT =
  '0x138746adfA52909E5920def027f5a8dc1C7EfFb6' as const;
export const POLYGON_USDC_CONTRACT =
  '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359' as const;

// Top-up buffer multiplier (2% buffer for price fluctuations)
export const TOP_UP_BUFFER_MULTIPLIER = 1.02;

// Base token types for ArNS purchases
export type BaseTokenType = 'base-eth' | 'base-usdc' | 'base-ario';
export type CryptoPaymentToken = 'ario' | BaseTokenType;

// Base token configuration
export const BASE_TOKEN_CONFIG: Record<
  BaseTokenType,
  {
    label: string;
    decimals: number;
    chainId: number;
    symbol: string;
    networkName: string;
  }
> = {
  'base-eth': {
    label: 'ETH on Base',
    decimals: 18,
    chainId: BASE_MAINNET_CHAIN_ID,
    symbol: 'ETH',
    networkName: 'Base',
  },
  'base-usdc': {
    label: 'USDC on Base',
    decimals: 6,
    chainId: BASE_MAINNET_CHAIN_ID,
    symbol: 'USDC',
    networkName: 'Base',
  },
  'base-ario': {
    label: 'ARIO on Base',
    decimals: 6,
    chainId: BASE_MAINNET_CHAIN_ID,
    symbol: 'ARIO',
    networkName: 'Base',
  },
};

// Check if a token is a Base token
export function isBaseToken(token: string): token is BaseTokenType {
  return token === 'base-eth' || token === 'base-usdc' || token === 'base-ario';
}

// ArNS Name Base Fees by character length (in ARIO)
// Used to calculate name pricing with demand factor
const minFees = new Array(MAX_ARNS_NAME_LENGTH - 12).fill(true).reduce(
  (acc, _, index) => {
    acc[index + 13] = 200;
    return acc;
  },
  {} as Record<number, number>,
);

export const BASE_NAME_FEES: Record<number, number> = {
  1: 1_000_000,
  2: 200_000,
  3: 20_000,
  4: 10_000,
  5: 2_500,
  6: 1_500,
  7: 800,
  8: 500,
  9: 400,
  10: 350,
  11: 300,
  12: 250,
  ...minFees,
};

// Pricing multipliers
export const LEASE_MULTIPLIER = 1.2; // ARF + (ARF * 0.2 * 1) = ARF * 1.2
export const PERMABUY_MULTIPLIER = 21; // ARF + (ARF * 0.2 * 20) = ARF * 21
