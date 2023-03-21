import { useEffect } from 'react';

import { useGlobalState } from '../../state/contexts/GlobalState';
import useWalletAddress from '../useWalletAddress/useWalletAddress';

export default function useCreateAntModal() {
  const [{ showCreateAnt, showConnectWallet }, dispatch] = useGlobalState();
  const { walletAddress } = useWalletAddress();

  useEffect(() => {
    if (!walletAddress && showCreateAnt) {
      console.log(1);
      dispatch({
        type: 'setShowConnectWallet',
        payload: true,
      });
    }

    if (!walletAddress && !showCreateAnt) {
      console.log(2);
      dispatch({
        type: 'setShowConnectWallet',
        payload: false,
      });
      return;
    }
  }, [walletAddress, showCreateAnt, showConnectWallet]);

  return {
    showCreateAntModal: showCreateAnt,
  };
}
