/**
 * SDK initialisers — Solana-only after the de-AO refactor.
 *
 * `ARIO.init({ backend: 'solana', ... })` and `ANT.init({ backend: 'solana',
 * ... })` are the only paths now. The legacy AO `AOProcess`-backed branches
 * are gone — see `docs/MIGRATION_PLAN.md` and the de-AO PR.
 *
 * Read paths still work without a wallet (they return a read-only client
 * that uses the configured Solana RPC) so unauthenticated browsing keeps
 * working.
 */
import { ANT, ARIO } from '@ar.io/sdk/web';
import type {
  AoANTRead,
  AoANTWrite,
  AoARIORead,
  AoARIOWrite,
} from '@ar.io/sdk/web';

import { ArNSWalletConnector } from '../types';
import {
  SOLANA_PROGRAM_IDS,
  getSolanaRpc,
  getSolanaRpcSubscriptions,
} from './solana';

/**
 * True when the wallet is a Solana wallet AND has a usable signer attached.
 * (Phantom attaches `signTransaction` a tick after `connected` flips, so the
 * signer can be undefined briefly — write helpers must fall back to read-only.)
 */
export function isSolanaWallet(
  wallet?: ArNSWalletConnector,
): wallet is ArNSWalletConnector & {
  solanaSigner: NonNullable<ArNSWalletConnector['solanaSigner']>;
} {
  return wallet?.tokenType === 'solana' && !!wallet.solanaSigner;
}

/**
 * Stable cache key for an ARIO contract instance. Solana is the only backend
 * now; this returns `'solana'` when a contract exists and `'none'` otherwise.
 * Kept as a function (not a constant) so existing call sites that pass the
 * contract through don't need to change.
 */
export function arioContractCacheKey(
  arioContract: unknown | undefined,
): string {
  return arioContract ? 'solana' : 'none';
}

/**
 * Build an `ARIO` SDK instance. When a Solana wallet with a signer is
 * connected, returns a writeable instance; otherwise returns a read-only
 * Solana client.
 */
export function buildArio({
  wallet,
}: {
  wallet?: ArNSWalletConnector;
} = {}): AoARIORead | AoARIOWrite {
  if (isSolanaWallet(wallet)) {
    return ARIO.init({
      backend: 'solana',
      rpc: getSolanaRpc(),
      rpcSubscriptions: getSolanaRpcSubscriptions(),
      signer: wallet.solanaSigner,
      ...SOLANA_PROGRAM_IDS,
    });
  }
  return ARIO.init({
    backend: 'solana',
    rpc: getSolanaRpc(),
    ...SOLANA_PROGRAM_IDS,
  });
}

/** Read-only ARIO — Solana, no wallet required. */
export function buildArioRead(_opts: Record<string, unknown> = {}): AoARIORead {
  // The opts arg is ignored after de-AO; kept so existing call sites that
  // pass `{ solana: true, processId, ao, hyperbeamUrl }` don't have to be
  // updated in lockstep with this file. Phase 4/5 strips the call sites.
  return ARIO.init({
    backend: 'solana',
    rpc: getSolanaRpc(),
    ...SOLANA_PROGRAM_IDS,
  });
}

/**
 * ANT instance for a specific Solana mint pubkey (`processId` retained as
 * the field name for cross-backend continuity — on Solana this is the
 * Metaplex Core NFT mint pubkey).
 */
export async function buildAnt({
  wallet,
  processId,
}: {
  wallet?: ArNSWalletConnector;
  processId: string;
  // Legacy AO `signer`/`ao`/`hyperbeamUrl` args are accepted but ignored —
  // Phase 4/5 strips the call sites. Permissive to avoid a tsc regression
  // while the dispatchers/hooks still pass them.
  [k: string]: unknown;
}): Promise<AoANTRead | AoANTWrite> {
  if (isSolanaWallet(wallet)) {
    return await ANT.init({
      backend: 'solana',
      processId,
      rpc: getSolanaRpc(),
      rpcSubscriptions: getSolanaRpcSubscriptions(),
      signer: wallet.solanaSigner,
      antProgramId: SOLANA_PROGRAM_IDS.antProgramId,
    });
  }
  return await ANT.init({
    backend: 'solana',
    processId,
    rpc: getSolanaRpc(),
    antProgramId: SOLANA_PROGRAM_IDS.antProgramId,
  });
}

/** Read-only ANT for a Solana mint pubkey. */
export async function buildAntRead({
  processId,
}: {
  processId: string;
  // Legacy positional args (`solana`, `ao`, `hyperbeamUrl`) are accepted but
  // ignored — Phase 4/5 strips the call sites.
  [k: string]: unknown;
}): Promise<AoANTRead> {
  return await ANT.init({
    backend: 'solana',
    processId,
    rpc: getSolanaRpc(),
    antProgramId: SOLANA_PROGRAM_IDS.antProgramId,
  });
}
