import { TurboArNSClient } from '@src/services/arweave/TurboArNSClient';
import { useGlobalState, useWalletState } from '@src/state';
import { useMemo } from 'react';

export function useTurboArNSClient() {
  const [{ turboNetwork }] = useGlobalState();
  const [{ wallet, walletAddress }] = useWalletState();
  return useMemo(() => {
    if (!wallet?.contractSigner || !walletAddress) return null;
    return new TurboArNSClient({
      signer: wallet?.contractSigner,
      walletAddress: walletAddress.toString(),
      paymentUrl: turboNetwork.PAYMENT_URL,
    });
  }, [walletAddress, wallet, turboNetwork]);
}
