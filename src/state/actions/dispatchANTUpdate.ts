import { AoANTHandler } from '@ar.io/sdk';
import { buildDomainInfoQuery } from '@src/hooks/useDomainInfo';
import { AoAddress } from '@src/types';
import { NETWORK_DEFAULTS } from '@src/utils/constants';
import eventEmitter from '@src/utils/events';
import { QueryClient } from '@tanstack/react-query';
import { Dispatch } from 'react';

import { ArNSAction } from '..';

export async function dispatchANTUpdate({
  queryClient,
  processId,
  dispatch,
  aoNetwork,
}: {
  queryClient: QueryClient;
  processId: string;
  walletAddress: AoAddress;
  dispatch: Dispatch<ArNSAction>;
  aoNetwork: typeof NETWORK_DEFAULTS.AO;
}) {
  try {
    dispatch({
      type: 'addAnts',
      payload: {
        [processId]: {
          state: null,
          handlers: null,
          errors: [],
        },
      },
    });
    dispatch({
      type: 'setLoading',
      payload: true,
    });
    queryClient.resetQueries({ queryKey: ['domainInfo', processId] });
    queryClient.resetQueries({
      queryKey: ['ant', processId],
    });
    queryClient.resetQueries({
      queryKey: ['ant-info', processId],
    });

    const domainInfo = await queryClient.fetchQuery(
      buildDomainInfoQuery({
        antId: processId,
        aoNetwork,
      }),
    );
    dispatch({
      type: 'addAnts',
      payload: {
        [processId]: {
          state: domainInfo.state ?? null,
          handlers: (domainInfo.info?.Handlers ?? null) as
            | AoANTHandler[]
            | null,
          errors: domainInfo.errors ?? [],
        },
      },
    });
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
      }
    };
    errorHandler(error.message);
  } finally {
    dispatch({
      type: 'setLoading',
      payload: false,
    });
  }
}
