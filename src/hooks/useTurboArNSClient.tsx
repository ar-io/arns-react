import { TurboArNSClient } from '@src/services/arweave/TurboArNSClient';
import { useWalletState } from '@src/state';
import { useMemo } from 'react';

export function useTurboArNSClient() {
  const [{ wallet, walletAddress }] = useWalletState();
  return useMemo(() => {
    if (!wallet?.contractSigner || !walletAddress) return null;
    return new TurboArNSClient({
      signer: wallet?.contractSigner,
      walletAddress: walletAddress.toString(),
    });
  }, [walletAddress, wallet]);
}
