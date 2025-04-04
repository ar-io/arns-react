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
  domain,
  processId,
  dispatch,
  aoNetwork,
}: {
  queryClient: QueryClient;
  domain?: string;
  processId: string;
  walletAddress: AoAddress;
  dispatch: Dispatch<ArNSAction>;
  aoNetwork: typeof NETWORK_DEFAULTS.AO;
}) {
  try {
    dispatch({
      type: 'setLoading',
      payload: true,
    });
    dispatch({
      type: 'addAnts',
      payload: {
        [processId]: {
          state: null,
          handlers: null,
          errors: [],
          processMeta: null,
        },
      },
    });

    await queryClient.resetQueries({
      predicate({ queryKey }) {
        return (
          ((queryKey.includes('ant') ||
            queryKey.includes('ant-info') ||
            queryKey.includes('domainInfo')) &&
            queryKey.includes(processId)) ||
          queryKey.includes(domain)
        );
      },
    });

    const domainInfo = await queryClient
      .fetchQuery(
        buildDomainInfoQuery({
          antId: processId,
          aoNetwork,
        }),
      )
      .catch((e) => console.error(e));
    if (!domainInfo) throw new Error('Unable to fetch domain info');
    dispatch({
      type: 'addAnts',
      payload: {
        [processId]: {
          state: domainInfo.state ?? null,
          handlers: (domainInfo.info?.Handlers ?? null) as
            | AoANTHandler[]
            | null,
          errors: domainInfo.errors ?? [],
          processMeta: domainInfo.processMeta,
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
