import { useGlobalState, useWalletState } from '@src/state';
import { useQuery } from '@tanstack/react-query';

export function useArIOLiquidBalance(address?: string) {
  const [{ arioContract, arioProcessId }] = useGlobalState();
  const [{ walletAddress }] = useWalletState();

  const userAddress = address ?? walletAddress?.toString();

  return useQuery({
    queryKey: ['ario-liquid-balance', userAddress, arioProcessId.toString()],
    queryFn: async () => {
      if (!userAddress) throw new Error('No address provided to fetch balance');
      const arioBalance = await arioContract.getBalance({
        address: userAddress,
      });
      return arioBalance;
    },
    enabled: !!userAddress,
    staleTime: 1000 * 60 * 5,
  });
}

export function useArIOStakedAndVaultedBalance(address?: string) {
  const [{ arioContract, arioProcessId }] = useGlobalState();
  const [{ walletAddress }] = useWalletState();

  const userAddress = address ?? walletAddress?.toString();

  return useQuery({
    queryKey: ['ario-delegated-stake', userAddress, arioProcessId.toString()],
    queryFn: async () => {
      if (!userAddress) throw new Error('No address provided to fetch balance');
      let cursor = undefined;
      let hasNextPage = true;
      let totalDelegatedStake = 0;
      let totalVaultedStake = 0;
      while (hasNextPage) {
        const res = await arioContract.getDelegations({
          address: userAddress,
          limit: 1000,
          cursor,
        });
        res.items.forEach((stake) => {
          if (stake.type === 'stake') {
            totalDelegatedStake += stake.balance;
          } else if (stake.type === 'vault') {
            totalVaultedStake += stake.balance;
          }
        });
        cursor = res.nextCursor;
        hasNextPage = res.hasMore;
      }

      return { totalDelegatedStake, totalVaultedStake };
    },
    enabled: !!userAddress,
    staleTime: 1000 * 60 * 60,
  });
}
