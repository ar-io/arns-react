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
  getActiveSolanaConfig,
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
  const { programIds } = getActiveSolanaConfig();
  const ids: Record<string, any> = {};
  if (programIds.coreProgramId) ids.coreProgramId = programIds.coreProgramId;
  if (programIds.garProgramId) ids.garProgramId = programIds.garProgramId;
  if (programIds.arnsProgramId) ids.arnsProgramId = programIds.arnsProgramId;
  if (programIds.antProgramId) ids.antProgramId = programIds.antProgramId;

  if (isSolanaWallet(wallet)) {
    return ARIO.init({
      backend: 'solana',
      rpc: getSolanaRpc(),
      rpcSubscriptions: getSolanaRpcSubscriptions(),
      signer: wallet.solanaSigner,
      ...ids,
    });
  }
  return ARIO.init({
    backend: 'solana',
    rpc: getSolanaRpc(),
    ...ids,
  });
}

/** Read-only ARIO — Solana, no wallet required. */
export function buildArioRead(_opts: Record<string, unknown> = {}): AoARIORead {
  const { programIds } = getActiveSolanaConfig();
  const ids: Record<string, any> = {};
  if (programIds.coreProgramId) ids.coreProgramId = programIds.coreProgramId;
  if (programIds.garProgramId) ids.garProgramId = programIds.garProgramId;
  if (programIds.arnsProgramId) ids.arnsProgramId = programIds.arnsProgramId;
  if (programIds.antProgramId) ids.antProgramId = programIds.antProgramId;

  return ARIO.init({
    backend: 'solana',
    rpc: getSolanaRpc(),
    ...ids,
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
  [k: string]: unknown;
}): Promise<AoANTRead | AoANTWrite> {
  const { programIds } = getActiveSolanaConfig();
  if (isSolanaWallet(wallet)) {
    return await ANT.init({
      backend: 'solana',
      processId,
      rpc: getSolanaRpc(),
      rpcSubscriptions: getSolanaRpcSubscriptions(),
      signer: wallet.solanaSigner,
      antProgramId: programIds.antProgramId,
    });
  }
  return await ANT.init({
    backend: 'solana',
    processId,
    rpc: getSolanaRpc(),
    antProgramId: programIds.antProgramId,
  });
}

/** Read-only ANT for a Solana mint pubkey. */
export async function buildAntRead({
  processId,
}: {
  processId: string;
  [k: string]: unknown;
}): Promise<AoANTRead> {
  const { programIds } = getActiveSolanaConfig();
  return await ANT.init({
    backend: 'solana',
    processId,
    rpc: getSolanaRpc(),
    antProgramId: programIds.antProgramId,
  });
}
