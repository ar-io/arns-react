import { useEffect } from 'react';

import { useWalletAddress } from '../../hooks';
import { useGlobalState } from '../../state/contexts/GlobalState';

export default function useConnectWalletModal() {
  const [{ showConnectWallet }, dispatch] = useGlobalState();
  const { walletAddress } = useWalletAddress();

  useEffect(() => {
    if (walletAddress) {
      dispatch({
        type: 'setShowConnectWallet',
        payload: false,
      });
    }
  }, [showConnectWallet, walletAddress]);

  return {
    showConnectModal: showConnectWallet,
  };
}
