import { useGlobalState, useWalletState } from '@src/state';
import { useQuery } from '@tanstack/react-query';

export function usePrimaryName() {
  const [{ walletAddress }] = useWalletState();
  const [{ arioContract }] = useGlobalState();
  return useQuery({
    queryKey: ['primary-name', walletAddress?.toString(), arioContract],
    queryFn: async () => {
      if (!walletAddress)
        throw new Error('Must be connected to retrieve primary name');
      const primaryNameData = await arioContract
        .getPrimaryName({
          address: walletAddress?.toString(),
        })
        .catch((e) => {
          console.error(e);
          return null;
        });

      return primaryNameData;
    },
    staleTime: 5 * 60 * 60 * 1000, // 6 minutes
  });
}