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

    // Reconcile the ACL-derived list against ground-truth MPL Core ownership.
    //
    // Receiver side: ANTs the wallet owns on-chain but that are missing from
    // its ACL (e.g. acquired via a raw Metaplex Core transfer) are absent from
    // `getArNSRecordsForAddress`, so we merge their records in and flag the
    // backing mints for the Sync Ownership flow (`needsOwnerSync`).
    //
    // Sender side: `ownedMints` is the authoritative set of assets the wallet
    // currently owns. We use it below to drop ANTs the wallet has transferred
    // away — the ACL and `AntConfig.last_known_owner` both lag a raw transfer,
    // so without this they'd linger in the list.
    //
    // Best-effort: if the owner-scan is unavailable we leave `ownedMints` null
    // and fall back to the legacy `last_known_owner` check rather than risk
    // dropping every owned ANT.
    const driftMints = new Set<string>();
    let ownedMints: Set<string> | null = null;
    try {
      const drift = await computeAclDrift({
        owner: walletAddress.toString(),
        ario: arioContract,
      });
      ownedMints = drift.ownedMints;
      drift.driftRecords.forEach((record) => {
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

        const address = walletAddress.toString();
        for (const id of registeredUserAnts) {
          const state = states[id] ?? null;
          const needsOwnerSync = driftMints.has(id);
          const controls = state?.Controllers.includes(address) ?? false;

          // Decide whether the wallet still has a relationship to this ANT.
          //
          // When the MPL owner-scan succeeded (`ownedMints` set), it's the
          // ground truth for ownership: keep the ANT only if the wallet owns
          // its asset OR currently controls it. This drops ANTs the wallet
          // transferred away even when the ACL / `last_known_owner` still
          // point at it (the sender side of an out-of-band transfer). A null
          // `state` can't confirm controllership, so we keep it to avoid
          // over-dropping on incomplete data.
          //
          // When the scan was unavailable (`ownedMints` null), fall back to the
          // legacy check against the possibly-stale `last_known_owner`.
          const drop =
            ownedMints !== null
              ? state !== null && !ownedMints.has(id) && !controls
              : state !== null && state.Owner !== address && !controls;

          if (drop) {
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
