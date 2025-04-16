import { useGlobalState, useWalletState } from '@src/state';
import { useQuery } from '@tanstack/react-query';

export function usePrimaryName() {
  const [{ walletAddress }] = useWalletState();
  const [{ arioContract, arioProcessId }] = useGlobalState();
  return useQuery({
    queryKey: [
      'primary-name',
      walletAddress?.toString(),
      arioProcessId.toString(),
    ],
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
    enabled: walletAddress !== undefined && arioContract !== undefined,
    retry: (_, error) => {
      const validErrors = ['Primary name data not found'];
      return validErrors.find((e) => error.message.includes(e)) !== undefined;
    },
  });
}
