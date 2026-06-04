import { buildDomainInfoQuery } from '@src/hooks/useDomainInfo';
import { AoAddress, ArNSWalletConnector } from '@src/types';
import eventEmitter from '@src/utils/events';
import { QueryClient } from '@tanstack/react-query';
import { Dispatch } from 'react';

import { ArNSAction } from '..';

/**
 * Refresh ANT state for a single processId. Solana-only after the de-AO
 * refactor — `aoNetwork`/`hyperbeamUrl`/`antRegistryProcessId` legacy params
 * are accepted but ignored to soften the cross-phase landing.
 */
export async function dispatchANTUpdate({
  queryClient,
  domain,
  processId,
  dispatch,
  wallet,
}: {
  queryClient: QueryClient;
  domain?: string;
  processId: string;
  walletAddress: AoAddress;
  dispatch: Dispatch<ArNSAction>;
  wallet?: ArNSWalletConnector;
  // Legacy AO args — accepted but ignored.
  antRegistryProcessId?: string;
  aoNetwork?: unknown;
  hyperbeamUrl?: string;
}) {
  try {
    dispatch({
      type: 'setLoading',
      payload: true,
    });

    await queryClient.refetchQueries({
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
          wallet,
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
