/// <reference types="vite/client" />

// useful for intellisense to auto detect available env vars
interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly VITE_SENTRY_DSN_PUBLIC_KEY: string;
  readonly VITE_SENTRY_DSN_PROJECT_URI: string;
  readonly VITE_SENTRY_DSN_PROJECT_ID: string;
  readonly VITE_NODE_ENV: string;
  readonly VITE_GITHUB_HASH: string;
  readonly VITE_ARWEAVE_HOST: string;
  readonly VITE_ARNS_SERVICE_API: string;
  readonly VITE_ARNS_REGISTRY_ADDRESS: string;
  readonly VITE_ARIO_PROCESS_ID: string;
  readonly VITE_AO_CU_URL: string;
  // Solana backend (Surfpool / devnet / mainnet)
  readonly VITE_SOLANA_RPC_URL?: string;
  readonly VITE_SOLANA_RPC_WS_URL?: string;
  readonly VITE_SOLANA_NETWORK?:
    | 'mainnet-beta'
    | 'devnet'
    | 'testnet'
    | 'localnet';
  readonly VITE_ARIO_CORE_PROGRAM_ID?: string;
  readonly VITE_ARIO_GAR_PROGRAM_ID?: string;
  readonly VITE_ARIO_ARNS_PROGRAM_ID?: string;
  readonly VITE_ARIO_ANT_PROGRAM_ID?: string;
  // ARIO SPL mint address. Surfpool dev tools (faucet) reach for this to
  // build the ATA target when minting test ARIO into a connected wallet.
  readonly VITE_ARIO_MINT_ADDRESS?: string;
  // Optional override for the Ethereum mainnet RPC used by wagmi. Defaults
  // to https://cloudflare-eth.com so that RainbowKit's automatic ENS lookups
  // don't slam viem's rate-limited public RPC pool.
  readonly VITE_ETH_MAINNET_RPC_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
