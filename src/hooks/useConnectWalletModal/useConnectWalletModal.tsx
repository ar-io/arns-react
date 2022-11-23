import { useEffect } from 'react';

import { useStateValue } from '../../state/state';

export default function useConnectWalletModal() {
  // eslint-disable-next-line
  const [{ connectWallet }] = useStateValue();

  useEffect(() => {}, [connectWallet]); // eslint-disable-line

  return {
    showConnectModal: connectWallet,
  };
}
