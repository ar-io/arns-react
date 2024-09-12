import { ArNSEventEmitter } from '@ar.io/sdk/web';
import { captureException } from '@sentry/react';
import { ArweaveTransactionID } from '@src/services/arweave/ArweaveTransactionID';
import eventEmitter from '@src/utils/events';
import { Dispatch } from 'react';

import { ArNSAction } from '../reducers/ArNSReducer';

export function dispatchArNSUpdate({
  emitter,
  dispatch,
  walletAddress,
  ioProcessId,
}: {
  emitter: ArNSEventEmitter;
  dispatch: Dispatch<ArNSAction>;
  walletAddress: ArweaveTransactionID;
  ioProcessId: string;
}) {
  dispatch({ type: 'setDomains', payload: {} });
  dispatch({ type: 'setAnts', payload: {} });
  dispatch({ type: 'setPercentLoaded', payload: 0 });
  dispatch({ type: 'setAntCount', payload: 0 });
  dispatch({
    type: 'setLoading',
    payload: true,
  });
  emitter.on('process', (id, process) => {
    dispatch({
      type: 'addDomains',
      payload: process.names,
    });
    dispatch({
      type: 'addAnts',
      payload: { [id]: process.state },
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
      // capture and report the exception, but do not emit error notification
      captureException(new Error(e), {
        tags: {
          walletAddress: walletAddress.toString(),
          ioProcessId: ioProcessId,
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
