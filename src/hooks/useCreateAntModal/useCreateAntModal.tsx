import { useEffect } from 'react';

import { useGlobalState } from '../../state/contexts/GlobalState';
import useWalletAddress from '../useWalletAddress/useWalletAddress';

export default function useCreateAntModal() {
  const [{ showCreateAnt, showConnectWallet }, dispatch] = useGlobalState();
  const { walletAddress } = useWalletAddress();

  useEffect(() => {
    if (!walletAddress && showCreateAnt) {
      dispatch({
        type: 'setShowConnectWallet',
        payload: true,
      });
    }
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
