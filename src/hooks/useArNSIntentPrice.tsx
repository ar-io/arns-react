import { TurboArNSIntentPriceParams } from '@src/services/turbo/TurboArNSClient';
import { useWalletState } from '@src/state';
import { useQuery } from '@tanstack/react-query';

import { useTurboArNSClient } from './useTurboArNSClient';

export function useArNSIntentPrice({
  address,
  name,
  intent,
  increaseQty,
  type,
  years,
  promoCode,
}: Omit<TurboArNSIntentPriceParams, 'address' | 'currency'> & {
  address?: string;
}) {
  const turbo = useTurboArNSClient();
  const [{ walletAddress }] = useWalletState();

  const userAddress = address ?? walletAddress;

  return useQuery({
    queryKey: [
      'turbo-arns-intent-price',
      userAddress?.toString(),
      name,
      intent,
      increaseQty,
      type,
      years,
      promoCode,
    ],
    queryFn: async () => {
      if (!turbo) {
        throw new Error('Turbo client or address is not available');
      }
      return turbo.getPriceForArNSIntent({
        address: userAddress?.toString(),
        name,
        intent,
        increaseQty,
        type,
        years,
        promoCode,
      });
    },
    enabled: !!turbo,
    staleTime: 1000 * 60 * 5,
  });
}
