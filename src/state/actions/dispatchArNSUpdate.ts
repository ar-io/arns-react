import {
  ANTRegistry,
  ANT_REGISTRY_ID,
  AOProcess,
  ARIO,
  AoARIORead,
  AoArNSNameData,
} from '@ar.io/sdk/web';
import { connect } from '@permaweb/aoconnect';
import { captureException } from '@sentry/react';
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
}: {
  dispatch: Dispatch<ArNSAction>;
  walletAddress: AoAddress;
  arioProcessId: string;
  aoNetworkSettings: typeof NETWORK_DEFAULTS.AO;
}) {
  try {
    const ao = connect(aoNetworkSettings.ARIO);
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
    const arioContract = ARIO.init({
      process: new AOProcess({ processId: arioProcessId, ao }),
    }) as AoARIORead;
    const antRegistry = ANTRegistry.init({
      process: new AOProcess({
        processId: ANT_REGISTRY_ID,
        ao: connect(aoNetworkSettings.ANT),
      }),
    });
    const userAnts = await antRegistry.accessControlList({
      address: walletAddress.toString(),
    });

    const flatAntIds = new Set([...userAnts.Controlled, ...userAnts.Owned]);
    // batch these to avoid tag limits on dry runs
    const antIdsBatches = Array.from(flatAntIds).reduce((acc, id, index) => {
      const batchIndex = Math.floor(index / 50);
      if (!acc[batchIndex]) {
        acc[batchIndex] = [];
      }
      acc[batchIndex].push(id);
      return acc;
    }, [] as string[][]);

    const arnsRecords = await Promise.all(
      antIdsBatches.map((batch) => {
        return arioContract
          .getArNSRecords({
            filters: {
              processId: batch,
            },
          })
          .then((res) => res.items);
      }),
    );

    const userDomains = arnsRecords.flat().reduce((acc, record) => {
      if (flatAntIds.has(record.processId)) {
        acc[record.name] = record;
      }
      return acc;
    }, {} as Record<string, AoArNSNameData>);

    // ONLY QUERY FOR ANTS THAT WE ARE INTERESTED IN, EG REGISTERED ANTS
    const registeredUserAnts = Array.from(
      new Set(Object.values(userDomains).map((record) => record.processId)),
    );

    // Fetch ANT Process meta from graphql
    const antMetas = (await queryClient
      .fetchQuery<TransactionEdge['node'][] | null>(
        buildAllGraphQLTransactionsQuery(
          walletAddress.toString(),
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
