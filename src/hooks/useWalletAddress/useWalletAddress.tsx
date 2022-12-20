import { useEffect } from 'react';

import { useGlobalState } from '../../state/contexts/GlobalState';

export default function useWalletAddress(): any {
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
