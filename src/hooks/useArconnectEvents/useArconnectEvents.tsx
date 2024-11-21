import { AOProcess, IO } from '@ar.io/sdk/web';
import { ArConnectWalletConnector } from '@src/services/wallets';
import { AoAddress } from '@src/types';
import { useEffect, useState } from 'react';

import { dispatchNewGateway } from '../../state/actions';
import { useGlobalState } from '../../state/contexts/GlobalState';
import { useWalletState } from '../../state/contexts/WalletState';

function useArconnectEvents() {
  const [{ ioProcessId, aoClient }, dispatchGlobalState] = useGlobalState();
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
      const newWallet = wallet ?? new ArConnectWalletConnector();
      const contract = IO.init({
        process: new AOProcess({
          processId: ioProcessId,
          ao: aoClient,
        }),
        signer: newWallet.contractSigner!,
      });
      dispatchNewGateway(e?.host, contract, dispatchGlobalState);
    };

    const addressListener = () => {
      wallet?.getWalletAddress().then((address: AoAddress) => {
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
