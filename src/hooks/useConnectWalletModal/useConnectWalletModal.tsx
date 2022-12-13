import { useEffect } from 'react';

import { useStateValue } from '../../state/state';

export default function useConnectWalletModal() {
  // eslint-disable-next-line
  const [{ showConnectWallet, walletAddress }, dispatch] = useStateValue();

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
