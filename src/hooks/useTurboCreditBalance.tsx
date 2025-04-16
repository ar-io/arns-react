import { useGlobalState, useWalletState } from '@src/state';
import { useQuery } from '@tanstack/react-query';

import { useTurboArNSClient } from './useTurboArNSClient';

export function useTurboCreditBalance(address?: string) {
  const [{ walletAddress }] = useWalletState();
  const [{ turboNetwork }] = useGlobalState();
  const userAddress = address ?? walletAddress?.toString();
  const turboArNSClient = useTurboArNSClient();

  return useQuery({
    queryKey: ['turbo-credit-balance', userAddress, turboNetwork],
    queryFn: async () => {
      if (!userAddress) throw new Error('No wallet address found');
      return await turboArNSClient?.turboUploader.getBalance(
        userAddress.toString(),
      );
    },
    staleTime: 1000 * 60 * 2,
    enabled: !!turboArNSClient && !!userAddress,
  });
}
