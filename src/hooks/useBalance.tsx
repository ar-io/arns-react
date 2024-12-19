import { useGlobalState, useWalletState } from '@src/state';
import { useQuery } from '@tanstack/react-query';

export function useBalance(address?: string) {
  const [{ arioContract }] = useGlobalState();
  const [{ walletAddress }] = useWalletState();

  return useQuery({
    queryKey: [walletAddress?.toString(), arioContract],
    queryFn: async () => {
      if (!address && !walletAddress)
        throw new Error('No address provided to fetch balance');
      const arioBalance = await arioContract.getBalance({
        address: (address ?? walletAddress?.toString()) as string,
      });
      return arioBalance;
    },
  });
}
