import { useEffect } from 'react';

import { useGlobalState } from '../../state/contexts/GlobalState';

export default function useConnectWalletModal() {
  // eslint-disable-next-line
  const [{ showConnectWallet, walletAddress }, dispatch] = useGlobalState();

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
