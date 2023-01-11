import { useEffect } from 'react';

import { useGlobalState } from '../../state/contexts/GlobalState';
import { ArweaveTransactionId } from '../../types';

export default function useWalletAddress(): {
  wallet: any;
  walletAddress: ArweaveTransactionId | undefined;
} {
  const [{ wallet, walletAddress }, dispatchGlobalState] = useGlobalState();

  useEffect(() => {
    // add a listener for wallet changes in arconnect
    window.addEventListener('walletSwitch', (e) => {
      const address = e.detail.address;
      dispatchGlobalState({
        type: 'setWalletAddress',
        payload: address,
      });
    });

    if (!wallet) {
      // remove address if wallet gets cleared
      dispatchGlobalState({
        type: 'setWalletAddress',
        payload: undefined,
      });
      return;
    }

    wallet.getWalletAddress().then((address: string) => {
      dispatchGlobalState({
        type: 'setWalletAddress',
        payload: address,
      });
    });
  }, [wallet]); // eslint-disable-line

  return {
    walletAddress,
    wallet,
  };
}
