import { AoPrimaryName } from '@ar.io/sdk/web';
import { useGlobalState, useWalletState } from '@src/state';
import { queryKeys } from '@src/utils/queryKeys';
import { useQuery } from '@tanstack/react-query';

export function usePrimaryName() {
  const [{ walletAddress }] = useWalletState();
  const [{ arioContract, arioProcessId }] = useGlobalState();
  return useQuery<AoPrimaryName | null>({
    queryKey: queryKeys.primaryName(
      walletAddress?.toString(),
      arioProcessId?.toString(),
    ),
    queryFn: async () => {
      if (!walletAddress)
        throw new Error('Must be connected to retrieve primary name');
      const primaryNameData = await arioContract!
        .getPrimaryName({ address: walletAddress })
        .catch(() => {
          // no name returned, return null
          return null;
        });

      return primaryNameData;
    },
    staleTime: 1 * 60 * 60 * 1000, // 1 hour
    enabled: walletAddress !== undefined && arioContract !== undefined,
  });
}
