import { AOProcess, ARIO } from '@ar.io/sdk/web';
import { WanderWalletConnector } from '@src/services/wallets';
import { AoAddress } from '@src/types';
import { useEffect, useState } from 'react';

import { dispatchNewGateway } from '../../state/actions';
import { useGlobalState } from '../../state/contexts/GlobalState';
import { useWalletState } from '../../state/contexts/WalletState';

function useWanderEvents() {
  const [{ arioProcessId, aoClient, turboNetwork }, dispatchGlobalState] =
    useGlobalState();
  const [{ wallet }, dispatchWalletState] = useWalletState();
  const [eventEmitter, setEventEmitter] = useState<any>();

  useEffect(() => {
    const arweaveWalletLoadedListener = () => {
      const unknownApi = window.arweaveWallet as unknown as any; // TODO: when wander types are updated, remove this
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
      const newWallet = wallet ?? new WanderWalletConnector();
      const contract = ARIO.init({
        paymentUrl: turboNetwork.PAYMENT_URL,
        process: new AOProcess({
          processId: arioProcessId,
          ao: aoClient,
        }),
        signer: newWallet.turboSigner!,
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

export default useWanderEvents;
