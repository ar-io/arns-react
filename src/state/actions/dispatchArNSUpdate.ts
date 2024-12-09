import { ANT, AoANTState, ArNSEventEmitter } from '@ar.io/sdk/web';
import { captureException } from '@sentry/react';
import { AoAddress } from '@src/types';
import eventEmitter from '@src/utils/events';
import { queryClient } from '@src/utils/network';
import { Dispatch } from 'react';

import { ArNSAction } from '../reducers/ArNSReducer';

export function dispatchArNSUpdate({
  emitter,
  dispatch,
  walletAddress,
  arioProcessId,
}: {
  emitter: ArNSEventEmitter;
  dispatch: Dispatch<ArNSAction>;
  walletAddress: AoAddress;
  arioProcessId: string;
}) {
  dispatch({ type: 'setDomains', payload: {} });
  dispatch({ type: 'setAnts', payload: {} });
  dispatch({ type: 'setPercentLoaded', payload: 0 });
  dispatch({ type: 'setAntCount', payload: 0 });
  dispatch({
    type: 'setLoading',
    payload: true,
  });
  emitter.on('process', async (id, process) => {
    const handlers = await queryClient.fetchQuery({
      queryKey: ['handlers', id],
      queryFn: async () => {
        return await ANT.init({
          processId: id,
        })
          .getHandlers()
          .catch(console.error);
      },
      staleTime: Infinity,
    });

    dispatch({
      type: 'addDomains',
      payload: process.names,
    });
    dispatch({
      type: 'addAnts',
      payload: {
        [id]: { state: process.state as AoANTState, handlers: handlers ?? [] },
      },
    });
  });
  emitter.on('progress', (itemIndex, totalIds) => {
    dispatch({
      type: 'incrementAntCount',
    });
    dispatch({
      type: 'setPercentLoaded',
      payload: totalIds,
    });
  });
  const errorHandler = (e: string) => {
    if (e.startsWith('Error getting ArNS records')) {
      eventEmitter.emit('network:ao:congested', true);
      eventEmitter.emit(
        'error',
        new Error('Unable to load ArNS records. Please refresh to try again.'),
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
      eventEmitter.emit('error', new Error(e));
    }
  };
  // error listener handles timeout
  emitter.on('error', errorHandler);
  // arns:error listener handles errors from graphql communications
  emitter.on('arns:error', errorHandler);
  emitter.on('end', () => {
    dispatch({
      type: 'setLoading',
      payload: false,
    });
    dispatch({
      type: 'setPercentLoaded',
      payload: undefined,
    });
  });

  emitter
    .fetchProcessesOwnedByWallet({ address: walletAddress.toString() })
    .catch((e) =>
      errorHandler('Error getting assets owned by wallet: ' + e.message),
    );
}
