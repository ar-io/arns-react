import { useEffect } from 'react';

import { useGlobalState } from '../../state/contexts/GlobalState';
import useWalletAddress from '../useWalletAddress/useWalletAddress.js';

export default function useConnectWalletModal() {
  // eslint-disable-next-line
  const [{ showConnectWallet, wallet }, dispatch] = useGlobalState();
  const walletAddress = useWalletAddress();

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
