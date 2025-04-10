import { USD } from '@ardrive/turbo-sdk';
import { getWincForFiat } from '@src/services/turbo/paymentService';
import { useWalletState } from '@src/state';
import { useQuery } from '@tanstack/react-query';

export function useEstimatedCreditsForUSD({
  paymentAmount,
  promoCode,
  userAddress,
}: {
  paymentAmount?: number;
  promoCode?: string;
  userAddress?: string;
}) {
  const [{ walletAddress }] = useWalletState();
  const address = userAddress ?? walletAddress?.toString();
  return useQuery({
    queryKey: ['estimatedCredits', paymentAmount, promoCode, address],
    queryFn: async () => {
      if (!paymentAmount) {
        throw new Error('Payment amount is required');
      }
      const response = await getWincForFiat({
        amount: USD(paymentAmount / 100),
        promoCode: promoCode,
        destinationAddress: address?.toString(),
      });
      return response;
    },
    enabled: !!paymentAmount,
    staleTime: 5 * 60 * 1000,
  });
}
