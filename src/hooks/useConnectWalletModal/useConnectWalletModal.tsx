import { useEffect } from 'react';

import { useGlobalState } from '../../state/contexts/GlobalState';

export default function useConnectWalletModal() {
  // eslint-disable-next-line
  const [{ connectWallet }] = useGlobalState();

  useEffect(() => {}, [connectWallet]); // eslint-disable-line

  return {
    showConnectModal: connectWallet,
  };
}
