import { useEffect } from 'react';

import { useGlobalState } from '../../state/contexts/GlobalState';
import useWalletAddress from '../useWalletAddress/useWalletAddress';

export default function useCreateAntModal() {
  const [{ showCreateAnt, showConnectWallet }, dispatch] = useGlobalState();
  const { walletAddress } = useWalletAddress();

  useEffect(() => {
    // require a wallet to be connected
    if (!walletAddress && showCreateAnt) {
      dispatch({
        type: 'setShowConnectWallet',
        payload: true,
      });
    }

    // if the user cancels out of connecting wallet, reset show create ant
    if (!walletAddress && !showConnectWallet) {
      dispatch({
        type: 'setShowCreateAnt',
        payload: false,
      });
    }
  }, [walletAddress, showCreateAnt, showConnectWallet]);

  return {
    showCreateAntModal: showCreateAnt,
  };
}
