import { TurboArNSClient } from '@src/services/turbo/TurboArNSClient';
import { useGlobalState, useWalletState } from '@src/state';
import { useStripe } from '@stripe/react-stripe-js';
import { useMemo } from 'react';

/**
 * Construct a `TurboArNSClient` for the connected wallet. After the de-AO
 * refactor, the legacy AO `connect()` plumbing for `executeArNSIntent` is
 * gone — the client class still exists (its Stripe-funded ArNS purchase
 * flow is gated behind a tooltip, see `TurboArNSClient.ts`), but the AO
 * runtime config it used to take is no longer threaded through.
 */
export function useTurboArNSClient() {
  const [{ turboNetwork }] = useGlobalState();
  const [{ wallet, walletAddress }] = useWalletState();
  const stripe = useStripe();
  return useMemo(() => {
    // temporarily disable turbo arns client during solana migration
    // TODO: re-enable after solana migration
    return null;
    // if (!stripe) {
    //   return null;
    // }
    // return new TurboArNSClient({
    //   walletAddress: walletAddress?.toString(),
    //   paymentUrl: turboNetwork.PAYMENT_URL,
    //   stripe,
    // });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletAddress, wallet, turboNetwork, stripe]);
}
