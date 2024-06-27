import { ArNSEventEmitter } from '@ar.io/sdk';
import { ArweaveTransactionID } from '@src/services/arweave/ArweaveTransactionID';
import { Dispatch } from 'react';

import { ArNSAction } from '../reducers/ArNSReducer';

export function dispatchArNSUpdate({
  emitter,
  dispatch,
  walletAddress,
}: {
  emitter: ArNSEventEmitter;
  dispatch: Dispatch<ArNSAction>;
  walletAddress: ArweaveTransactionID;
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

  emitter.fetchProcessesOwnedByWallet({ address: walletAddress.toString() });
}
