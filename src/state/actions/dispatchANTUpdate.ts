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
  hyperbeamUrl,
  antRegistryProcessId,
}: {
  queryClient: QueryClient;
  domain?: string;
  processId: string;
  walletAddress: AoAddress;
  antRegistryProcessId: string;
  dispatch: Dispatch<ArNSAction>;
  aoNetwork: typeof NETWORK_DEFAULTS.AO;
  hyperbeamUrl?: string;
}) {
  try {
    dispatch({
      type: 'setLoading',
      payload: true,
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
          hyperbeamUrl,
          antRegistryProcessId,
        }),
      )
      .catch((e) => console.error(e));
    if (!domainInfo) throw new Error('Unable to fetch domain info');
    dispatch({
      type: 'addAnts',
      payload: {
        [processId]: {
          state: domainInfo.state ?? null,
          version: domainInfo.version,
          errors: domainInfo.errors ?? [],
          processMeta: domainInfo.processMeta ?? null,
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
