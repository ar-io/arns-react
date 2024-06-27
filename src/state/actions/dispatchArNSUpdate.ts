import { ANT, ArNSEventEmitter } from '@ar.io/sdk';
import { ArweaveTransactionID } from '@src/services/arweave/ArweaveTransactionID';
import { QueryClient } from '@tanstack/react-query';
import { Dispatch } from 'react';

import { ArNSAction } from '../reducers/ArNSReducer';

export function dispatchArNSUpdate({
  emitter,
  dispatch,
  queryClient,
  walletAddress,
}: {
  emitter: ArNSEventEmitter;
  dispatch: Dispatch<ArNSAction>;
  queryClient: QueryClient;
  walletAddress: ArweaveTransactionID;
}) {
  dispatch({ type: 'setPercentLoaded', payload: 0 });
  dispatch({ type: 'setAntCount', payload: 0 });
  dispatch({
    type: 'setLoading',
    payload: true,
  });
  emitter.on('process', (id, process) => {
    queryClient.setQueryData(['ant', id], async () => {
      const ant = ANT.init({ processId: id });
      return await ant.getState();
    });
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
  emitter.on('end', (ids: string[]) => {
    dispatch({
      type: 'setLoading',
      payload: false,
    });
    dispatch({
      type: 'setPercentLoaded',
      payload: undefined,
    });
    queryClient.setQueryData(['ant-ids', walletAddress], () => [...ids]);
  });

  emitter.fetchProcessesOwnedByWallet({ address: walletAddress.toString() });
}
