import { useState } from 'react';

import { useGlobalState } from '../../state/contexts/GlobalState';

function useArconnectEvents() {
  const [, dispatchGlobalState] = useGlobalState();
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
  }

  return eventEmitter;
}

export default useArconnectEvents;
