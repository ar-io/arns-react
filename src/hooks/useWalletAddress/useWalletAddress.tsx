import { useEffect, useState } from 'react';

import { useGlobalState } from '../../state/contexts/GlobalState';

export default function useWalletAddress(): string | undefined {
  const [{ wallet }] = useGlobalState();
  const [walletAddress, setWalletAddress] = useState<string>();

  useEffect(() => {
    wallet?.getWalletAddress().then((address: string) => {
      setWalletAddress(address);
    });
  }, [wallet]);

  return walletAddress;
}
