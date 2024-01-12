import { ArConnectWalletConnector } from '@src/services/wallets';
import { useEffect, useState } from 'react';

import { ArweaveTransactionID } from '../../services/arweave/ArweaveTransactionID';
import { dispatchNewGateway } from '../../state/actions';
import { useGlobalState } from '../../state/contexts/GlobalState';
import { useWalletState } from '../../state/contexts/WalletState';

function useArconnectEvents() {
  const [, dispatchGlobalState] = useGlobalState();
  const [{ wallet }, dispatchWalletState] = useWalletState();
  const [eventEmitter, setEventEmitter] = useState<any>();

  useEffect(() => {
    const arweaveWalletLoadedListener = () => {
      const unknownApi = window.arweaveWallet as unknown as any; // TODO: when arconnect types are updated, remove this
      if (unknownApi?.events) {
        setEventEmitter(unknownApi.events);
      }
    };

    window.addEventListener('arweaveWalletLoaded', arweaveWalletLoadedListener);

    const gatewayListener = (e: {
      host: string;
      port: number;
      protocol: string;
    }) => {
      dispatchNewGateway(
        e?.host,
        wallet ?? new ArConnectWalletConnector(),
        dispatchGlobalState,
      );
    };

    const addressListener = () => {
      wallet?.getWalletAddress().then((address: ArweaveTransactionID) => {
        dispatchWalletState({
          type: 'setWalletAddress',
          payload: address,
        });
      });
    };

    if (eventEmitter) {
      eventEmitter.on('gateway', gatewayListener);
      eventEmitter.on('activeAddress', addressListener);
    }

    return () => {
      if (eventEmitter) {
        eventEmitter.off('gateway', gatewayListener);
        eventEmitter.off('activeAddress', addressListener);
      }

      window.removeEventListener(
        'arweaveWalletLoaded',
        arweaveWalletLoadedListener,
      );
    };
  }, [dispatchGlobalState, dispatchWalletState, eventEmitter, wallet]);

  return eventEmitter;
}

export default useArconnectEvents;
