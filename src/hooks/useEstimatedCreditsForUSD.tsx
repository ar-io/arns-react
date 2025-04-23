import { useGlobalState, useWalletState } from '@src/state';
import { useQuery } from '@tanstack/react-query';

import { useTurboArNSClient } from './useTurboArNSClient';

export function useEstimatedCreditsForUSD({
  paymentAmount,
  promoCode,
  userAddress,
}: {
  paymentAmount?: number;
  promoCode?: string;
  userAddress?: string;
}) {
  const [{ turboNetwork }] = useGlobalState();
  const [{ walletAddress }] = useWalletState();
  const turbo = useTurboArNSClient();
  const address = userAddress ?? walletAddress?.toString();
  return useQuery({
    queryKey: [
      'estimatedCredits',
      paymentAmount,
      promoCode,
      address,
      turboNetwork,
    ],
    queryFn: async () => {
      if (!paymentAmount) {
        throw new Error('Payment amount is required');
      }
      if (!turbo) {
        throw new Error('Turbo is not initialized');
      }
      const response = await turbo.turboUploader.getWincForFiat({
        amount: { amount: paymentAmount, type: 'usd' },
        promoCodes: promoCode ? [promoCode] : undefined,
        nativeAddress: address?.toString(),
      });
      return response;
    },
    enabled: !!paymentAmount && !!turbo,
    staleTime: 5 * 60 * 1000,
  });
}
