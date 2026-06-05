import {
  DEVNET_ARIO_MINT,
  DEVNET_PROGRAM_IDS,
  MAINNET_ARIO_MINT,
  MAINNET_PROGRAM_IDS as SDK_MAINNET_PROGRAM_IDS,
  createCircuitBreakerRpc,
  defaultFallbackUrl,
} from '@ar.io/sdk/web';
/**
 * Solana backend configuration for arns-react.
 *
 * Reads `VITE_SOLANA_*` env vars and produces RPC + subscriptions client pairs
 * plus optional program-id overrides. Used by the wallet layer
 * (`SolanaWalletConnector`, `WalletState`) to construct `ARIO`/`ANT` Solana
 * instances via `@ar.io/sdk/web`.
 *
 * The active config is runtime-switchable via `setSolanaConfig()` — the
 * Settings UI exposes presets for devnet / mainnet. Changing the config
 * invalidates the memoised RPC clients
 * so subsequent `getSolanaRpc()` / `getSolanaRpcSubscriptions()` calls return
 * fresh instances pointed at the new endpoint.
 */
import {
  type Address,
  type Commitment,
  address,
  createSolanaRpcSubscriptions,
} from '@solana/kit';

export type SolanaNetwork = 'mainnet-beta' | 'devnet';

export type SolanaProgramIds = {
  coreProgramId?: Address;
  garProgramId?: Address;
  arnsProgramId?: Address;
  antProgramId?: Address;
};

export type SolanaNetworkConfig = {
  network: SolanaNetwork;
  rpcUrl: string;
  programIds: SolanaProgramIds;
  mintAddress?: string;
};

const DEFAULT_RPC: Record<SolanaNetwork, { http: string }> = {
  'mainnet-beta': {
    http: 'https://autumn-snowy-liquid.solana-mainnet.quiknode.pro/564349f369b6daf36e58004dbcf4dfdf33ba852e/',
  },
  devnet: {
    http: 'https://still-stylish-diagram.solana-devnet.quiknode.pro/7bb783112e4f06d72eeb7ca7125bbce97009438f/',
  },
};

/**
 * Derive the websocket endpoint from the HTTP RPC URL. Public Solana RPCs and
 * managed providers (QuikNode, Helius, Triton, …) all expose WS on the same
 * host as HTTP — swapping the scheme is enough.
 */
function deriveWsUrl(rpcUrl: string): string {
  const scheme = rpcUrl.startsWith('http://') ? 'ws://' : 'wss://';
  return `${scheme}${rpcUrl.replace(/^https?:\/\//, '')}`;
}

export { DEFAULT_RPC as SOLANA_DEFAULT_RPC };

const MAINNET_PROGRAM_IDS_MAPPED: SolanaProgramIds = {
  coreProgramId: SDK_MAINNET_PROGRAM_IDS.core,
  garProgramId: SDK_MAINNET_PROGRAM_IDS.gar,
  arnsProgramId: SDK_MAINNET_PROGRAM_IDS.arns,
  antProgramId: SDK_MAINNET_PROGRAM_IDS.ant,
};

const DEVNET_PROGRAM_IDS_MAPPED: SolanaProgramIds = {
  coreProgramId: DEVNET_PROGRAM_IDS.core,
  garProgramId: DEVNET_PROGRAM_IDS.gar,
  arnsProgramId: DEVNET_PROGRAM_IDS.arns,
  antProgramId: DEVNET_PROGRAM_IDS.ant,
};

/**
 * Per-network preset defaults. Devnet uses real deployed program IDs from the
 * SDK; mainnet uses the SDK's baked-in defaults. Localnet IDs are typically
 * overridden via env vars (`VITE_ARIO_*_PROGRAM_ID`) since the preset is
 * env-var-only — not selectable from the Settings UI.
 */
export const SOLANA_NETWORK_PRESETS: Record<
  SolanaNetwork,
  SolanaNetworkConfig
> = {
  devnet: {
    network: 'devnet',
    rpcUrl: DEFAULT_RPC.devnet.http,
    programIds: { ...DEVNET_PROGRAM_IDS_MAPPED },
    mintAddress: DEVNET_ARIO_MINT.toString(),
  },
  'mainnet-beta': {
    network: 'mainnet-beta',
    rpcUrl: DEFAULT_RPC['mainnet-beta'].http,
    programIds: { ...MAINNET_PROGRAM_IDS_MAPPED },
    mintAddress: MAINNET_ARIO_MINT.toString(),
  },
};

const optAddress = (raw: string | undefined): Address | undefined =>
  raw && raw.length > 0 ? address(raw) : undefined;

// Bumped to `-v3` after dropping the `localnet` variant — old blobs whose
// `network` field is `"localnet"` would otherwise fail the
// `SOLANA_NETWORK_PRESETS[saved.network]` lookup on reload. Increment again
// on future incompatible shape changes.
const SOLANA_SETTINGS_KEY = 'arns-solana-settings-v3';

function loadSolanaSettingsFromStorage(): SolanaNetworkConfig | null {
  try {
    const raw = localStorage.getItem(SOLANA_SETTINGS_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw) as SolanaNetworkConfig;
    const preset = SOLANA_NETWORK_PRESETS[saved.network];
    if (preset) {
      saved.programIds = { ...preset.programIds, ...saved.programIds };
      saved.mintAddress ??= preset.mintAddress;
    }
    return saved;
  } catch {
    /* ignore corrupt storage */
  }
  return null;
}

function saveSolanaSettingsToStorage(config: SolanaNetworkConfig) {
  try {
    localStorage.setItem(SOLANA_SETTINGS_KEY, JSON.stringify(config));
  } catch {
    /* storage full / private mode — non-fatal */
  }
}

function deriveDefaultNetwork(): SolanaNetwork {
  const explicit = import.meta.env.VITE_SOLANA_NETWORK as
    | SolanaNetwork
    | undefined;
  if (explicit) return explicit;

  const env = import.meta.env.VITE_ENVIRONMENT as string | undefined;
  if (env === 'production') return 'mainnet-beta';
  if (env === 'develop') return 'devnet';

  return 'devnet';
}

function buildInitialConfig(): SolanaNetworkConfig {
  const saved = loadSolanaSettingsFromStorage();
  if (saved) return saved;

  const envNetwork = deriveDefaultNetwork();

  // `||` (not `??`) on purpose: CI injects `VITE_SOLANA_RPC_URL: ""` when the
  // corresponding GitHub Variable is undefined, and `??` would let that empty
  // string through and break `<ConnectionProvider endpoint="">`. Also guard
  // against a hostname without a scheme — `@solana/web3.js`'s `Connection`
  // ctor rejects anything that isn't `http(s)://…`.
  const envRpcUrl = import.meta.env.VITE_SOLANA_RPC_URL || '';
  const validEnvRpcUrl =
    envRpcUrl.startsWith('http://') || envRpcUrl.startsWith('https://')
      ? envRpcUrl
      : undefined;

  return {
    network: envNetwork,
    rpcUrl: validEnvRpcUrl ?? DEFAULT_RPC[envNetwork].http,
    programIds: {
      ...SOLANA_NETWORK_PRESETS[envNetwork].programIds,
      ...Object.fromEntries(
        Object.entries({
          coreProgramId: optAddress(import.meta.env.VITE_ARIO_CORE_PROGRAM_ID),
          garProgramId: optAddress(import.meta.env.VITE_ARIO_GAR_PROGRAM_ID),
          arnsProgramId: optAddress(import.meta.env.VITE_ARIO_ARNS_PROGRAM_ID),
          antProgramId: optAddress(import.meta.env.VITE_ARIO_ANT_PROGRAM_ID),
        }).filter(([, v]) => v !== undefined),
      ),
    },
    mintAddress:
      import.meta.env.VITE_ARIO_MINT_ADDRESS ||
      SOLANA_NETWORK_PRESETS[envNetwork].mintAddress,
  };
}

const _initialConfig = buildInitialConfig();

// Mutable active config — updated via `setSolanaConfig()`.
let _activeConfig: SolanaNetworkConfig = { ..._initialConfig };

// Backwards-compat re-exports (read from the active config).
export const SOLANA_NETWORK: SolanaNetwork = _initialConfig.network;
export const SOLANA_RPC_URL: string = _initialConfig.rpcUrl;
export const SOLANA_RPC_WS_URL: string = deriveWsUrl(_initialConfig.rpcUrl);
export const SOLANA_COMMITMENT: Commitment = 'confirmed';
export const SOLANA_PROGRAM_IDS: SolanaProgramIds = _initialConfig.programIds;
export const ARIO_MINT_ADDRESS: Address | undefined = optAddress(
  _initialConfig.mintAddress,
);

/** Return the live config snapshot (may have been changed at runtime). */
export function getActiveSolanaConfig(): SolanaNetworkConfig {
  return _activeConfig;
}

/** Return the initial config built from env vars (before any runtime changes). */
export function getInitialSolanaConfig(): SolanaNetworkConfig {
  return _initialConfig;
}

/**
 * Apply a new Solana config at runtime. Invalidates the memoised RPC clients
 * and persists to localStorage so the choice survives reloads.
 */
export function setSolanaConfig(config: SolanaNetworkConfig) {
  _activeConfig = { ...config };
  _rpc = undefined;
  _rpcSubscriptions = undefined;
  saveSolanaSettingsToStorage(config);
}

let _rpc: ReturnType<typeof createCircuitBreakerRpc> | undefined;
let _rpcSubscriptions:
  | ReturnType<typeof createSolanaRpcSubscriptions>
  | undefined;

/** Memoised kit RPC client with circuit breaker — rebuilt after `setSolanaConfig()`. */
export function getSolanaRpc() {
  if (!_rpc) {
    _rpc = createCircuitBreakerRpc({
      primaryUrl: _activeConfig.rpcUrl,
      fallbackUrl: defaultFallbackUrl(_activeConfig.rpcUrl),
    });
  }
  return _rpc;
}

/** Memoised kit RPC subscriptions client — rebuilt after `setSolanaConfig()`. */
export function getSolanaRpcSubscriptions() {
  if (!_rpcSubscriptions) {
    _rpcSubscriptions = createSolanaRpcSubscriptions(
      deriveWsUrl(_activeConfig.rpcUrl),
    );
  }
  return _rpcSubscriptions;
}
