import { useEffect } from 'react';

import { useGlobalState } from '../../state/contexts/GlobalState';

export default function useCreateAntModal() {
  const [{ showCreateAnt, walletAddress }, dispatch] = useGlobalState();

  useEffect(() => {
    if (!walletAddress && showCreateAnt) {
      dispatch({
        type: 'setShowConnectWallet',
        payload: true,
      });
    }
  }, [walletAddress, showCreateAnt]);

  return {
    showCreateAntModal: showCreateAnt,
  };
}
