import { ArweaveTransactionID } from '@src/services/arweave/ArweaveTransactionID';
import { WanderWalletConnector } from '@src/services/wallets';
import { useEffect } from 'react';

import { useWalletState } from '../../state/contexts/WalletState';

function useWanderEvents() {
  const [{ wallet }, dispatchWalletState] = useWalletState();

  useEffect(() => {
    const addressListener = (e: CustomEvent) => {
      if (wallet instanceof WanderWalletConnector) {
        dispatchWalletState({
          type: 'setWalletAddress',
          payload: new ArweaveTransactionID(e.detail.address),
        });
      }
    };
    window.addEventListener('walletSwitch', addressListener);
    return () => {
      window.removeEventListener('walletSwitch', addressListener);
    };
  }, [dispatchWalletState, wallet]);
}

export default useWanderEvents;
