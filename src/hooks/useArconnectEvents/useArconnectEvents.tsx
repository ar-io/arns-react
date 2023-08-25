import { useEffect, useState } from 'react';

function useArconnectEvents() {
  const [eventEmitter, setEventEmitter] = useState<any>();

  useEffect(() => {
    window.addEventListener('arweaveWalletLoaded', (e) => {
      const unknownApi = window.arweaveWallet as unknown as any; // TODO: when arconnect types are updated, remove this
      if (unknownApi?.events) {
        setEventEmitter(unknownApi.events);
      }
    });
  }, []);

  return eventEmitter;
}

export default useArconnectEvents;
