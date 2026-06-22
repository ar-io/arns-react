import { ANTState, ARIORead, ArNSNameData } from '@ar.io/sdk/web';
import { captureException } from '@sentry/react';
import { AoAddress, ArNSWalletConnector } from '@src/types';
import { computeAclDrift } from '@src/utils/aclSync';
import { queryClient } from '@src/utils/network';
import { buildAntRead, buildArioRead } from '@src/utils/sdk-init';
import { Dispatch } from 'react';

import { ANTProcessData } from '../contexts';
import { ArNSAction } from '../reducers/ArNSReducer';

/**
 * Refresh the ArNS state slice for the connected wallet — Solana-only.
 *
 * Legacy AO params (`arioProcessId`, `antRegistryProcessId`, `aoNetworkSettings`,
 * `hyperbeamUrl`) are accepted but ignored to soften the cross-phase landing
 * while call sites are updated.
 */
export async function dispatchArNSUpdate({
  dispatch,
  walletAddress,
  arioContract: providedArio,
}: {
  dispatch: Dispatch<ArNSAction>;
  walletAddress: AoAddress;
  /** Connected Solana wallet, when available (accepted for call-site
   * compatibility; the bulk ANT read is wallet-agnostic). */
  wallet?: ArNSWalletConnector;
  /**
   * Optional pre-built ARIO instance. When provided we use it directly; the
   * `WalletState` Solana setup pushes the wallet-aware client here.
   */
  arioContract?: ARIORead;
  // Legacy AO args — accepted but ignored.
  arioProcessId?: string;
  antRegistryProcessId?: string;
  aoNetworkSettings?: unknown;
  hyperbeamUrl?: string;
}) {
  try {
    // Reset every cache that fans into the manage / register / list views.
    //
    // `domainInfo`        — `useDomainInfo` (the manage page header)
    // `ant` / `ant-info`  — `buildAntStateQuery` and friends, both keyed
    //                       with `staleTime: Infinity`, so without a
    //                       reset a freshly-bought name renders against
    //                       the previous-render's empty result forever
    // `arns-records`      — `buildArNSRecordsQuery` (the upstream cache
    //                       `useDomainInfo` reads through). 4h staleTime
    //                       — without resetting it the manage page for
    //                       a just-bought name shows "N/A" because the
    //                       record list returned the pre-buy snapshot.
    //
    // We deliberately do NOT reset `ario-liquid-balance` /
    // `ario-delegated-stake` here — those are wallet-scoped (not
    // ArNS-scoped) and have active subscribers in the navbar that
    // would each fire a refetch. On wallet-connect this fan-out can
    // saturate the localnet RPC. The buy-specific paths
    // (`Checkout.tsx`) reset those caches themselves where it matters.
    queryClient.resetQueries({ queryKey: ['domainInfo'] });
    queryClient.resetQueries({ queryKey: ['ant'] });
    queryClient.resetQueries({ queryKey: ['ant-info'] });
    queryClient.resetQueries({ queryKey: ['arns-records'] });

    dispatch({ type: 'reset' });
    dispatch({ type: 'setLoading', payload: true });

    // Prefer the wallet-aware ARIO instance built by the caller (e.g. the
    // global state's `arioContract` after `WalletState` set it up). Falling
    // back to a fresh local read-only instance keeps the unauthenticated
    // path working until the global one is hydrated.
    const arioContract: ARIORead = providedArio ?? buildArioRead();

    const userDomains: Record<string, ArNSNameData> = {};
    let cursor: string | undefined = undefined;
    let hasMore = true;
    while (hasMore) {
      const res = await arioContract.getArNSRecordsForAddress({
        address: walletAddress.toString(),
        limit: 1000,
        cursor,
      });
      res.items.forEach((record) => {
        userDomains[record.name] = record;
      });
      cursor = res.nextCursor;
      hasMore = res.hasMore;
    }

    // Detect ANTs the wallet owns on-chain (per MPL Core) but that are missing
    // from its ACL — e.g. acquired via a raw Metaplex Core transfer. These are
    // absent from `getArNSRecordsForAddress` (it walks the ACL), so we merge
    // their records in and flag the backing mints so the manage table surfaces
    // them and the Sync Ownership flow can reconcile them via `syncAcl`.
    // Best-effort: never let drift detection block the core refresh.
    const driftMints = new Set<string>();
    try {
      const driftRecords = await computeAclDrift({
        owner: walletAddress.toString(),
        ario: arioContract,
      });
      driftRecords.forEach((record) => {
        userDomains[record.name] = record;
        if (record.processId) driftMints.add(record.processId);
      });
    } catch (error) {
      captureException(error, {
        tags: { walletAddress: walletAddress.toString(), phase: 'aclDrift' },
      });
      console.error(error);
    }

    // ONLY QUERY FOR ANTS THAT WE ARE INTERESTED IN, EG REGISTERED ANTS
    const registeredUserAnts = Array.from(
      new Set(Object.values(userDomains).map((record) => record.processId)),
    );

    // Solana ANTs aren't on Arweave's GraphQL — there's no Module/CU/Scheduler
    // tag layer to read. Use an empty `antMetas` map so the downstream code
    // paths still see a defined object.
    const antMetas: Record<string, null> = {};

    dispatch({ type: 'setDomains', payload: userDomains });

    // we set the default states to null so that they can match up in the tables
    dispatch({
      type: 'setAnts',
      payload: registeredUserAnts.reduce(
        (acc: Record<string, ANTProcessData>, id: string) => {
          acc[id] = {
            state: null,
            version: 0,
            processMeta: antMetas?.[id] ?? null,
            needsOwnerSync: driftMints.has(id),
          };
          return acc;
        },
        {},
      ),
    });

    // Bulk-load every registered ANT's full state in a handful of RPC calls:
    // `getANTStates` batches AntConfig + AntControllers via getMultipleAccounts
    // and pulls ALL undername records in one program-wide getProgramAccounts
    // scan grouped by mint — replacing the old per-ANT `getState` fan-out
    // (~4 RPC × N, the dominant source of the wallet-connect request storm).
    if (registeredUserAnts.length > 0) {
      try {
        // `getANTStates` is mint-agnostic (uses the client's rpc + program), so
        // any registered mint seeds the reader; it loads them all in bulk.
        const antReader = await buildAntRead({
          processId: registeredUserAnts[0],
        });
        const states = (await (
          antReader as unknown as {
            getANTStates: (
              mints: string[],
            ) => Promise<Record<string, ANTState>>;
          }
        ).getANTStates(registeredUserAnts)) as Record<string, ANTState>;

        for (const id of registeredUserAnts) {
          const state = states[id] ?? null;
          // Drop ANTs the wallet neither owns nor controls — EXCEPT drifted
          // ones. A drifted ANT's `state.Owner` is the stale pre-transfer
          // `last_known_owner` (the wallet won't match until `syncAcl` runs
          // `reconcile`), but we verified live MPL Core ownership during drift
          // detection, so keep it and let the Sync Ownership flow fix it.
          const needsOwnerSync = driftMints.has(id);
          if (
            !needsOwnerSync &&
            state &&
            state.Owner !== walletAddress.toString() &&
            !state.Controllers.includes(walletAddress.toString())
          ) {
            dispatch({ type: 'removeAnts', payload: [id] });
          } else {
            dispatch({
              type: 'addAnts',
              payload: {
                [id]: {
                  state,
                  version: 0,
                  processMeta: antMetas[id] ?? null,
                  errors: [],
                  needsOwnerSync,
                },
              },
            });
          }
          dispatch({ type: 'incrementAntCount' });
        }
        dispatch({
          type: 'setPercentLoaded',
          payload: registeredUserAnts.length,
        });
      } catch (error: any) {
        captureException(error, {
          tags: { walletAddress: walletAddress.toString() },
        });
        console.error(error);
      }
    }
  } catch (error) {
    captureException(error);
  } finally {
    dispatch({ type: 'setLoading', payload: false });
    dispatch({ type: 'setPercentLoaded', payload: undefined });
  }
}
