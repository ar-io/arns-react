import {
  AOProcess,
  ARIO,
  AoArNSNameData,
  ArNSMarketplaceRead,
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

import { buildMarketplaceUserAssetsQuery } from '@src/hooks/useMarketplaceUserAssets';
import { ANTProcessData } from '../contexts';
import { ArNSAction } from '../reducers/ArNSReducer';

export async function dispatchArNSUpdate({
  dispatch,
  walletAddress,
  arioProcessId,
  marketplaceProcessId,
  antRegistryProcessId,
  aoNetworkSettings,
  hyperbeamUrl,
}: {
  dispatch: Dispatch<ArNSAction>;
  walletAddress: AoAddress;
  arioProcessId: string;
  marketplaceProcessId: string;
  antRegistryProcessId: string;
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
    queryClient.resetQueries({
      queryKey: ['marketplace-user-assets'],
    });

    dispatch({ type: 'reset' });
    dispatch({
      type: 'setLoading',
      payload: true,
    });

    // TODO: move all of these async calls to unique hooks and remove the need for the dispatchArNSUpdate action
    const arioContract = ARIO.init({
      process: new AOProcess({ processId: arioProcessId, ao }),
    });

    const marketplaceContract = new ArNSMarketplaceRead({
      process: new AOProcess({ processId: marketplaceProcessId, ao }),
    });

    console.log('marketplaceContract', marketplaceContract);

    const marketplaceUserAssets = await queryClient.fetchQuery(
      buildMarketplaceUserAssetsQuery({
        address: walletAddress.toString(),
        marketplaceContract,
        marketplaceProcessId,
        arioProcessId,
        aoNetwork: aoNetworkSettings,
      }),
    );
    console.log('marketplaceUserAssets', marketplaceUserAssets);
    const userDomains: Record<string, AoArNSNameData> = {};

    // get owned domains
    let cursor: string | undefined = undefined;
    let hasMore = true;
    while (hasMore) {
      const res = await arioContract.getArNSRecordsForAddress({
        address: walletAddress.toString(),
        limit: 1000,
        cursor,
        antRegistryProcessId,
      });
      res.items.forEach((record) => {
        userDomains[record.name] = record;
      });
      cursor = res.nextCursor;
      hasMore = res.hasMore;
    }
    console.log('userDomains', userDomains);

    // get marketplace domains
    // TODO: remove once ant's don't remove the controllers on transfer (should still show up in the ant registry as controller)
    // Need to do this seperately since the current api in the sdk above for user domains doesn't support the marketplace escrowed assets
    let marketplaceCursor: string | undefined = undefined;
    let marketplaceHasMore = true;
    while (marketplaceHasMore) {
      const marketplaceRes = await arioContract.getArNSRecords({
        limit: 1000,
        cursor: marketplaceCursor,
        filters: {
          processId: marketplaceUserAssets.antIds,
        },
      });
      marketplaceRes.items.forEach((record) => {
        userDomains[record.name] = record;
      });
      marketplaceCursor = marketplaceRes.nextCursor;
      marketplaceHasMore = marketplaceRes.hasMore;
    }
    console.log('marketplaceUserDomains', userDomains);

    // ONLY QUERY FOR ANTS THAT WE ARE INTERESTED IN, EG REGISTERED ANTS
    const registeredUserAnts = Array.from(
      new Set(
        Object.values(userDomains)
          .map((record) => record.processId)
          .concat(marketplaceUserAssets.antIds),
      ),
    );
    console.log('registeredUserAnts', registeredUserAnts);

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
            antRegistryProcessId,
          }),
        );
        // if the user is not associated with the ant, do not load it
        if (
          domainInfo.state &&
          domainInfo.state.Owner !== walletAddress.toString() &&
          domainInfo.state.Owner !== marketplaceProcessId && // if the owner is the marketplace process id, do not remove it since we still want to show it
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
