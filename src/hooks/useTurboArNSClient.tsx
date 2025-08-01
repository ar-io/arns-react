import { connect } from '@permaweb/aoconnect';
import { TurboArNSClient } from '@src/services/turbo/TurboArNSClient';
import { useGlobalState, useWalletState } from '@src/state';
import { useStripe } from '@stripe/react-stripe-js';
import { useMemo } from 'react';

export function useTurboArNSClient() {
  const [{ turboNetwork, aoNetwork }] = useGlobalState();
  const [{ wallet, walletAddress }] = useWalletState();
  const stripe = useStripe();
  return useMemo(() => {
    if (!stripe) return null;
    return new TurboArNSClient({
      signer: wallet?.contractSigner,
      walletAddress: walletAddress?.toString(),
      paymentUrl: turboNetwork.PAYMENT_URL,
      stripe,
      ao: connect({
        CU_URL: aoNetwork.ARIO.CU_URL,
        MU_URL: aoNetwork.ARIO.MU_URL,
        MODE: 'legacy',
      }),
    });
  }, [walletAddress, wallet, turboNetwork, stripe]);
}
