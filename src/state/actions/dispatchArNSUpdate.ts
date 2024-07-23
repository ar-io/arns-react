import { ArNSEventEmitter } from '@ar.io/sdk';
import { captureException } from '@sentry/react';
import { ArweaveTransactionID } from '@src/services/arweave/ArweaveTransactionID';
import eventEmitter from '@src/utils/events';
import { Dispatch } from 'react';

import { ArNSAction } from '../reducers/ArNSReducer';

export function dispatchArNSUpdate({
  emitter,
  dispatch,
  walletAddress,
  registryId,
}: {
  emitter: ArNSEventEmitter;
  dispatch: Dispatch<ArNSAction>;
  walletAddress: ArweaveTransactionID;
  registryId: ArweaveTransactionID;
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
      // Behaviour note: this will only stop the loading UI, it will still display the
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
          registryId: registryId.toString(),
        },
      });
    } else if (!e.includes('does not support provided action.')) {
      eventEmitter.emit('error', new Error(e));
    }
  };
  // error listnener handles timeout
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
      errorHandler('Error getting processes owned by wallet: ' + e.message),
    );
}
