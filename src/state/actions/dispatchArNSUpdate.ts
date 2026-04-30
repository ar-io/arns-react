import { AoARIORead, AoArNSNameData } from '@ar.io/sdk/web';
import { captureException } from '@sentry/react';
import { buildDomainInfoQuery } from '@src/hooks/useDomainInfo';
import { AoAddress, ArNSWalletConnector } from '@src/types';
import eventEmitter from '@src/utils/events';
import { queryClient } from '@src/utils/network';
import { buildArioRead } from '@src/utils/sdk-init';
import { pLimit } from 'plimit-lit';
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
  wallet,
  arioContract: providedArio,
}: {
  dispatch: Dispatch<ArNSAction>;
  walletAddress: AoAddress;
  /** Connected Solana wallet, when available. */
  wallet?: ArNSWalletConnector;
  /**
   * Optional pre-built ARIO instance. When provided we use it directly; the
   * `WalletState` Solana setup pushes the wallet-aware client here.
   */
  arioContract?: AoARIORead;
  // Legacy AO args — accepted but ignored.
  arioProcessId?: string;
  antRegistryProcessId?: string;
  aoNetworkSettings?: unknown;
  hyperbeamUrl?: string;
}) {
  try {
    const throttle = pLimit(20);
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
    const arioContract: AoARIORead = providedArio ?? buildArioRead();

    const userDomains: Record<string, AoArNSNameData> = {};
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
          };
          return acc;
        },
        {},
      ),
    });

    const fetchAntDetails = async (id: string) => {
      try {
        const domainInfo = await queryClient.fetchQuery(
          buildDomainInfoQuery({
            antId: id,
            wallet,
          }),
        );
        // if the user is not associated with the ant, do not load it
        if (
          domainInfo.state &&
          domainInfo.state.Owner !== walletAddress.toString() &&
          !domainInfo.state.Controllers.includes(walletAddress.toString())
        ) {
          dispatch({ type: 'removeAnts', payload: [id] });
        } else {
          dispatch({
            type: 'addAnts',
            payload: {
              [id]: {
                state: domainInfo.state ?? null,
                version: domainInfo.version,
                processMeta: antMetas[id] ?? null,
                errors: domainInfo.errors ?? [],
              },
            },
          });
        }
      } catch (error: any) {
        const errorHandler = (e: string) => {
          if (e.startsWith('Error getting ArNS records')) {
            eventEmitter.emit(
              'error',
              new Error(
                'Unable to load ArNS records. Please refresh to try again.',
              ),
            );
            dispatch({ type: 'setLoading', payload: false });
            dispatch({ type: 'setPercentLoaded', payload: undefined });
          } else if (e.includes('Timeout')) {
            captureException(new Error(e), {
              tags: {
                walletAddress: walletAddress.toString(),
              },
            });
          } else if (!e.includes('does not support provided action.')) {
            captureException(new Error(e), {
              tags: {
                walletAddress: walletAddress.toString(),
              },
            });
            console.error(new Error(e));
          }
        };
        errorHandler(error.message);
      } finally {
        dispatch({ type: 'incrementAntCount' });
        dispatch({
          type: 'setPercentLoaded',
          payload: registeredUserAnts.length,
        });
      }
    };

    await Promise.all(
      registeredUserAnts.map((id) => throttle(() => fetchAntDetails(id))),
    );
  } catch (error) {
    captureException(error);
  } finally {
    dispatch({ type: 'setLoading', payload: false });
    dispatch({ type: 'setPercentLoaded', payload: undefined });
  }
}
