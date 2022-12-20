import { useEffect } from 'react';

import { useGlobalState } from '../../state/contexts/GlobalState';
import { ArweaveTransactionId } from '../../types.js';

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

    wallet?.getWalletAddress().then((address: string) => {
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
