import { TurboBalanceResponse } from '@ardrive/turbo-sdk';
import { TurboArNSClient } from '@src/services/turbo/TurboArNSClient';
import { useGlobalState, useWalletState } from '@src/state';
import { NETWORK_DEFAULTS } from '@src/utils/constants';
import { queryOptions, useQuery } from '@tanstack/react-query';

import { useTurboArNSClient } from './useTurboArNSClient';

export function buildTurboCreditBalanceQuery({
  userAddress,
  turboArNSClient,
  turboNetwork,
}: {
  userAddress?: string;
  turboArNSClient: TurboArNSClient | null;
  turboNetwork: typeof NETWORK_DEFAULTS.TURBO;
}) {
  return queryOptions<TurboBalanceResponse>({
    queryKey: ['turbo-credit-balance', userAddress, turboNetwork],
    queryFn: async () => {
      if (!userAddress) throw new Error('No wallet address found');
      const res = await turboArNSClient?.turboUploader.getBalance(
        userAddress.toString(),
      );
      if (!res) throw new Error('No balance found');
      return res;
    },
    staleTime: 1000 * 60 * 2,
    enabled: !!turboArNSClient && !!userAddress,
  });
}

export function useTurboCreditBalance(address?: string) {
  const [{ walletAddress }] = useWalletState();
  const [{ turboNetwork }] = useGlobalState();
  const userAddress = address ?? walletAddress?.toString();
  const turboArNSClient = useTurboArNSClient();

  return useQuery({
    ...buildTurboCreditBalanceQuery({
      userAddress,
      turboArNSClient,
      turboNetwork,
    }),
  });
}
