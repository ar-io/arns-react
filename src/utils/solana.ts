/**
 * Solana backend configuration for arns-react.
 *
 * Reads `VITE_SOLANA_*` env vars and produces RPC + subscriptions client pairs
 * plus optional program-id overrides. Used by the wallet layer
 * (`SolanaWalletConnector`, `WalletState`) to construct `ARIO`/`ANT` Solana
 * instances via `@ar.io/sdk/web`.
 *
 * The active config is runtime-switchable via `setSolanaConfig()` — the
 * Settings UI exposes presets for localnet / devnet / mainnet and allows
 * manual overrides. Changing the config invalidates the memoised RPC clients
 * so subsequent `getSolanaRpc()` / `getSolanaRpcSubscriptions()` calls return
 * fresh instances pointed at the new endpoint.
 */
import {
  type Address,
  type Commitment,
  address,
  createDefaultRpcTransport,
  createSolanaRpcFromTransport,
  createSolanaRpcSubscriptions,
} from '@solana/kit';

export type SolanaNetwork = 'mainnet-beta' | 'devnet' | 'testnet' | 'localnet';

export type SolanaProgramIds = {
  coreProgramId?: Address;
  garProgramId?: Address;
  arnsProgramId?: Address;
  antProgramId?: Address;
};

export type SolanaNetworkConfig = {
  network: SolanaNetwork;
  rpcUrl: string;
  rpcWsUrl: string;
  programIds: SolanaProgramIds;
  mintAddress?: string;
};

const DEFAULT_RPC: Record<SolanaNetwork, { http: string; ws: string }> = {
  'mainnet-beta': {
    http: 'https://api.mainnet-beta.solana.com',
    ws: 'wss://api.mainnet-beta.solana.com',
  },
  devnet: {
    http: 'https://api.devnet.solana.com',
    ws: 'wss://api.devnet.solana.com',
  },
  testnet: {
    http: 'https://api.testnet.solana.com',
    ws: 'wss://api.testnet.solana.com',
  },
  localnet: {
    http: 'http://127.0.0.1:8899',
    ws: 'ws://127.0.0.1:8900',
  },
};

export { DEFAULT_RPC as SOLANA_DEFAULT_RPC };

/**
 * Per-network preset defaults. Program IDs and mint are blank for localnet
 * (must be supplied via env or manually) and for mainnet/devnet (SDK bakes in
 * its own defaults when omitted).
 */
export const SOLANA_NETWORK_PRESETS: Record<
  SolanaNetwork,
  SolanaNetworkConfig
> = {
  localnet: {
    network: 'localnet',
    rpcUrl: DEFAULT_RPC.localnet.http,
    rpcWsUrl: DEFAULT_RPC.localnet.ws,
    programIds: {},
  },
  devnet: {
    network: 'devnet',
    rpcUrl: DEFAULT_RPC.devnet.http,
    rpcWsUrl: DEFAULT_RPC.devnet.ws,
    programIds: {},
  },
  'mainnet-beta': {
    network: 'mainnet-beta',
    rpcUrl: DEFAULT_RPC['mainnet-beta'].http,
    rpcWsUrl: DEFAULT_RPC['mainnet-beta'].ws,
    programIds: {},
  },
  testnet: {
    network: 'testnet',
    rpcUrl: DEFAULT_RPC.testnet.http,
    rpcWsUrl: DEFAULT_RPC.testnet.ws,
    programIds: {},
  },
};

const optAddress = (raw: string | undefined): Address | undefined =>
  raw && raw.length > 0 ? address(raw) : undefined;

const SOLANA_SETTINGS_KEY = 'arns-solana-settings';

function loadSolanaSettingsFromStorage(): SolanaNetworkConfig | null {
  try {
    const raw = localStorage.getItem(SOLANA_SETTINGS_KEY);
    if (raw) return JSON.parse(raw) as SolanaNetworkConfig;
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
  if (env === 'production' || env === 'develop') return 'devnet';

  return 'localnet';
}

function buildInitialConfig(): SolanaNetworkConfig {
  const saved = loadSolanaSettingsFromStorage();
  if (saved) return saved;

  const envNetwork = deriveDefaultNetwork();

  return {
    network: envNetwork,
    rpcUrl: import.meta.env.VITE_SOLANA_RPC_URL ?? DEFAULT_RPC[envNetwork].http,
    rpcWsUrl:
      import.meta.env.VITE_SOLANA_RPC_WS_URL ?? DEFAULT_RPC[envNetwork].ws,
    programIds: {
      coreProgramId: optAddress(import.meta.env.VITE_ARIO_CORE_PROGRAM_ID),
      garProgramId: optAddress(import.meta.env.VITE_ARIO_GAR_PROGRAM_ID),
      arnsProgramId: optAddress(import.meta.env.VITE_ARIO_ARNS_PROGRAM_ID),
      antProgramId: optAddress(import.meta.env.VITE_ARIO_ANT_PROGRAM_ID),
    },
    mintAddress: import.meta.env.VITE_ARIO_MINT_ADDRESS || undefined,
  };
}

const _initialConfig = buildInitialConfig();

// Mutable active config — updated via `setSolanaConfig()`.
let _activeConfig: SolanaNetworkConfig = { ..._initialConfig };

// Backwards-compat re-exports (read from the active config).
export const SOLANA_NETWORK: SolanaNetwork = _initialConfig.network;
export const SOLANA_RPC_URL: string = _initialConfig.rpcUrl;
export const SOLANA_RPC_WS_URL: string = _initialConfig.rpcWsUrl;
export const SOLANA_COMMITMENT: Commitment = 'confirmed';
export const SOLANA_PROGRAM_IDS: SolanaProgramIds = _initialConfig.programIds;
export const ARIO_MINT_ADDRESS: Address | undefined = optAddress(
  _initialConfig.mintAddress,
);

export const IS_LOCALNET: boolean = _initialConfig.network === 'localnet';

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

let _rpc: ReturnType<typeof createSolanaRpcFromTransport> | undefined;
let _rpcSubscriptions:
  | ReturnType<typeof createSolanaRpcSubscriptions>
  | undefined;

/**
 * Wrap kit's default HTTP transport to defend against Surfpool's non-conformant
 * JSON-RPC error shape.
 *
 * For preflight failures (`code === -32002`) Surfpool sometimes returns
 * `{ error: { code, message } }` with **no `data` field**. Kit's
 * `getSolanaErrorFromJsonRpcError` unconditionally destructures
 * `const { err, ...rest } = data` for that code, which throws
 * `TypeError: Cannot destructure property 'err' of 'data' as it is undefined.`
 * — masking the real transaction failure.
 *
 * We inject a stub `data` so kit's destructure succeeds and surfaces a proper
 * `SolanaError` with the server message. This is a no-op for any response that
 * already includes `error.data`, so mainnet/devnet behaviour is unaffected.
 */
function createSurfpoolFriendlyTransport(url: string) {
  const inner = createDefaultRpcTransport({ url });
  return async function transport<TResponse>(
    config: Parameters<typeof inner>[0],
  ): Promise<TResponse> {
    const response = (await inner(config)) as
      | { result: unknown }
      | { error: { code: number; message: string; data?: unknown } };

    if (
      typeof response === 'object' &&
      response !== null &&
      'error' in response &&
      response.error &&
      typeof response.error === 'object' &&
      (response.error.data === undefined || response.error.data === null)
    ) {
      console.warn(
        '[solana-rpc] patching JSON-RPC error response with missing `data` (likely Surfpool):',
        response.error,
      );
      response.error.data = {
        err: null,
        logs: null,
        accounts: null,
        unitsConsumed: null,
        returnData: null,
      };
    }

    return response as TResponse;
  };
}

/** Memoised kit RPC client — rebuilt after `setSolanaConfig()`. */
export function getSolanaRpc() {
  if (!_rpc) {
    _rpc = createSolanaRpcFromTransport(
      createSurfpoolFriendlyTransport(_activeConfig.rpcUrl),
    );
  }
  return _rpc;
}

/** Memoised kit RPC subscriptions client — rebuilt after `setSolanaConfig()`. */
export function getSolanaRpcSubscriptions() {
  if (!_rpcSubscriptions) {
    _rpcSubscriptions = createSolanaRpcSubscriptions(_activeConfig.rpcWsUrl);
  }
  return _rpcSubscriptions;
}
