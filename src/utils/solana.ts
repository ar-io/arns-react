/**
 * Solana backend configuration for arns-react.
 *
 * Reads `VITE_SOLANA_*` env vars and produces a memoised RPC + subscriptions
 * client pair plus optional program-id overrides. Used by the wallet layer
 * (`SolanaWalletConnector`, `WalletState`) to construct `ARIO`/`ANT` Solana
 * instances via `@ar.io/sdk/web`.
 *
 * On localnet the program ids must be supplied via env (Surfpool deploys at
 * keypair-derived addresses, not the placeholder constants in
 * `sdk/src/solana/constants.ts`). Source them from
 * `migration/localnet/out/localnet.env`.
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

const optAddress = (raw: string | undefined): Address | undefined =>
  raw && raw.length > 0 ? address(raw) : undefined;

export const SOLANA_NETWORK: SolanaNetwork =
  (import.meta.env.VITE_SOLANA_NETWORK as SolanaNetwork | undefined) ??
  'localnet';

export const SOLANA_RPC_URL: string =
  import.meta.env.VITE_SOLANA_RPC_URL ?? DEFAULT_RPC[SOLANA_NETWORK].http;

export const SOLANA_RPC_WS_URL: string =
  import.meta.env.VITE_SOLANA_RPC_WS_URL ?? DEFAULT_RPC[SOLANA_NETWORK].ws;

export const SOLANA_COMMITMENT: Commitment = 'confirmed';

export const SOLANA_PROGRAM_IDS: SolanaProgramIds = {
  coreProgramId: optAddress(import.meta.env.VITE_ARIO_CORE_PROGRAM_ID),
  garProgramId: optAddress(import.meta.env.VITE_ARIO_GAR_PROGRAM_ID),
  arnsProgramId: optAddress(import.meta.env.VITE_ARIO_ARNS_PROGRAM_ID),
  antProgramId: optAddress(import.meta.env.VITE_ARIO_ANT_PROGRAM_ID),
};

/**
 * ARIO SPL mint address. Optional — only required by dev tools that mint test
 * ARIO into a connected wallet (the surfpool faucet). Read it from
 * `migration/localnet/out/localnet.env` when working against a local cluster.
 */
export const ARIO_MINT_ADDRESS: Address | undefined = optAddress(
  import.meta.env.VITE_ARIO_MINT_ADDRESS,
);

/** True when the configured Solana network is the local surfpool node. */
export const IS_LOCALNET: boolean = SOLANA_NETWORK === 'localnet';

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
 * We:
 *   1. Log the raw error to the console so you can see what surfpool *did*
 *      send (usually a stringified `TransactionError` in `message`).
 *   2. Inject a stub `data: { err: null, logs: null, accounts: null,
 *      unitsConsumed: null, returnData: null }` so kit's destructure
 *      succeeds and surfaces a proper `SolanaError` with the server message.
 *
 * This is a no-op for any response that already includes `error.data`, so
 * mainnet/devnet behaviour is unaffected.
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

/** Memoised kit RPC client. */
export function getSolanaRpc() {
  if (!_rpc) {
    _rpc = createSolanaRpcFromTransport(
      createSurfpoolFriendlyTransport(SOLANA_RPC_URL),
    );
  }
  return _rpc;
}

/** Memoised kit RPC subscriptions client (required for `sendAndConfirm`). */
export function getSolanaRpcSubscriptions() {
  if (!_rpcSubscriptions) {
    _rpcSubscriptions = createSolanaRpcSubscriptions(SOLANA_RPC_WS_URL);
  }
  return _rpcSubscriptions;
}
