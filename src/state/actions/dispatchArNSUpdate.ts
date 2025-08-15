import { AOProcess, ARIO, AoARIORead, AoArNSNameData } from '@ar.io/sdk/web';
import { connect } from '@permaweb/aoconnect';
import { captureException } from '@sentry/react';
import { populateIndividualRecordQueries } from '@src/hooks/arns-cache-utils';
import { arnsQueryKeys } from '@src/hooks/arns-query-keys';
import { buildDomainInfoQuery } from '@src/hooks/useDomainInfo';
import { buildAllGraphQLTransactionsQuery } from '@src/hooks/useGraphQL';
import { AoAddress } from '@src/types';
import { NETWORK_DEFAULTS } from '@src/utils/constants';
import eventEmitter from '@src/utils/events';
import { queryClient } from '@src/utils/network';
import { TransactionEdge } from 'arweave-graphql';
import { pLimit } from 'plimit-lit';
import { Dispatch } from 'react';

import { ANTProcessData } from '../contexts';
import { ArNSAction } from '../reducers/ArNSReducer';

export async function dispatchArNSUpdate({
  dispatch,
  walletAddress,
  arioProcessId,
  aoNetworkSettings,
  hyperbeamUrl,
}: {
  dispatch: Dispatch<ArNSAction>;
  walletAddress: AoAddress;
  arioProcessId: string;
  aoNetworkSettings: typeof NETWORK_DEFAULTS.AO;
  hyperbeamUrl?: string;
}) {
  try {
    const ao = connect({
      MODE: aoNetworkSettings.ARIO.MODE,
      CU_URL: aoNetworkSettings.ARIO.CU_URL,
      MU_URL: aoNetworkSettings.ARIO.MU_URL,
    });

    const throttle = pLimit(20);
    // reset queries
    queryClient.resetQueries({ queryKey: ['domainInfo'] });
    queryClient.resetQueries({
      queryKey: ['ant'],
    });
    queryClient.resetQueries({
      queryKey: ['ant-info'],
    });

    dispatch({ type: 'reset' });
    dispatch({
      type: 'setLoading',
      payload: true,
    });

    // TODO: move all of these async calls to unique hooks and remove the need for the dispatchArNSUpdate action
    const arioContract = ARIO.init({
      process: new AOProcess({ processId: arioProcessId, ao }),
    }) as AoARIORead;

    // Use existing query cache data if available, otherwise fetch fresh
    const recordsQueryKey = arnsQueryKeys.recordsForAddress(
      arioProcessId,
      walletAddress.toString(),
    );
    let userDomains: Record<string, AoArNSNameData>;

    try {
      // Try to use the query system for consistency
      const userRecordsArray = await queryClient.fetchQuery({
        queryKey: recordsQueryKey,
        queryFn: async () => {
          const domains: Record<string, AoArNSNameData> = {};
          let cursor: string | undefined = undefined;
          let hasMore = true;

          while (hasMore) {
            const res = await arioContract.getArNSRecordsForAddress({
              address: walletAddress.toString(),
              limit: 1000,
              cursor,
            });
            Object.entries(res.items).forEach(([name, record]) => {
              domains[name] = record;
            });
            cursor = res.nextCursor;
            hasMore = res.hasMore;
          }

          // Populate individual record queries from this collection
          populateIndividualRecordQueries(queryClient, arioProcessId, domains);

          return Object.values(domains);
        },
        staleTime: 4 * 60 * 60 * 1000, // 4 hours
      });

      // Reconstruct the domains object from the array (this is a limitation of the current approach)
      userDomains = userRecordsArray.reduce((acc, record, index) => {
        acc[`domain_${index}`] = record;
        return acc;
      }, {} as Record<string, AoArNSNameData>);
    } catch (error) {
      console.error(
        'Failed to fetch records via query system, falling back to direct fetch',
        error,
      );
      // Fallback to direct fetch if query system fails
      userDomains = {};
      let cursor: string | undefined = undefined;
      let hasMore = true;
      while (hasMore) {
        const res = await arioContract.getArNSRecordsForAddress({
          address: walletAddress.toString(),
          limit: 1000,
          cursor,
        });
        Object.entries(res.items).forEach(([name, record]) => {
          userDomains[name] = record;
        });
        cursor = res.nextCursor;
        hasMore = res.hasMore;
      }
    }

    // ONLY QUERY FOR ANTS THAT WE ARE INTERESTED IN, EG REGISTERED ANTS
    const registeredUserAnts = Array.from(
      new Set(Object.values(userDomains).map((record) => record.processId)),
    );
    // Fetch ANT Process meta from graphql
    const antMetas = (await queryClient
      .fetchQuery<TransactionEdge['node'][] | null>(
        buildAllGraphQLTransactionsQuery(
          registeredUserAnts,
          aoNetworkSettings.ANT.GRAPHQL_URL,
        ) as any,
      )
      .then((res) =>
        res?.reduce(
          (
            acc: Record<string, TransactionEdge['node']>,
            node: TransactionEdge['node'],
          ) => {
            if (!node) return acc;

            acc[node.id] = node;
            return acc;
          },
          {},
        ),
      )) as any as Record<string, TransactionEdge['node']>;

    dispatch({
      type: 'setDomains',
      payload: userDomains,
    });

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

    // Can be useDomainInfo fetch here (from ant id, not domain)
    const fetchAntDetails = async (id: string) => {
      try {
        const domainInfo = await queryClient.fetchQuery(
          buildDomainInfoQuery({
            antId: id,
            aoNetwork: aoNetworkSettings,
            hyperbeamUrl,
          }),
        );
        // if the user is not associated with the ant, do not load it
        if (
          domainInfo.state &&
          domainInfo.state.Owner !== walletAddress.toString() &&
          !domainInfo.state.Controllers.includes(walletAddress.toString())
        ) {
          dispatch({
            type: 'removeAnts',
            payload: [id],
          });
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
            eventEmitter.emit('network:ao:congested', true);
            eventEmitter.emit(
              'error',
              new Error(
                'Unable to load ArNS records. Please refresh to try again.',
              ),
            );
            dispatch({
              type: 'setLoading',
              payload: false,
            });
            dispatch({
              type: 'setPercentLoaded',
              payload: undefined,
            });
          } else if (e.includes('Timeout')) {
            eventEmitter.emit('network:ao:congested', true);
            // capture and report the exception, but do not emit error notification
            captureException(new Error(e), {
              tags: {
                walletAddress: walletAddress.toString(),
                arioProcessId: arioProcessId,
              },
            });
          } else if (!e.includes('does not support provided action.')) {
            captureException(new Error(e), {
              tags: {
                walletAddress: walletAddress.toString(),
                arioProcessId: arioProcessId,
              },
            });
            console.error(new Error(e));
          }
        };
        errorHandler(error.message);
      } finally {
        dispatch({
          type: 'incrementAntCount',
        });
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
    /// cleanup states
    dispatch({
      type: 'setLoading',
      payload: false,
    });
    dispatch({
      type: 'setPercentLoaded',
      payload: undefined,
    });
  }
}
