import { useState } from 'react';

import { useGlobalState } from '../../state/contexts/GlobalState';
import { useWalletState } from '../../state/contexts/WalletState';
import { ArweaveTransactionID } from '../../types';

function useArconnectEvents() {
  const [, dispatchGlobalState] = useGlobalState();
  const [{ wallet }, dispatchWalletState] = useWalletState();
  const [eventEmitter, setEventEmitter] = useState<any>();

  window.addEventListener('arweaveWalletLoaded', () => {
    const unknownApi = window.arweaveWallet as unknown as any; // TODO: when arconnect types are updated, remove this
    if (unknownApi?.events) {
      setEventEmitter(unknownApi.events);
    }
  });

  if (eventEmitter) {
    eventEmitter.on('gateway', (e: any) => {
      dispatchGlobalState({
        type: 'setGateway',
        payload: e.host,
      });
    });

    eventEmitter.on('activeAddress', () => {
      wallet?.getWalletAddress().then((address: ArweaveTransactionID) => {
        dispatchWalletState({
          type: 'setWalletAddress',
          payload: address,
        });
      });
    });
  }

  return eventEmitter;
}

export default useArconnectEvents;
