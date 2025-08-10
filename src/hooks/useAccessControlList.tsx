import { ANTRegistry, ANT_REGISTRY_ID, AOProcess } from '@ar.io/sdk';
import { useGlobalState, useWalletState } from '@src/state';
import { useQuery } from '@tanstack/react-query';

export function useAccessControlList() {
  const [{ antAoClient }] = useGlobalState();
  const [{ walletAddress }] = useWalletState();

  return useQuery({
    queryKey: ['accessControlList', walletAddress?.toString()],
    queryFn: async () => {
      if (!walletAddress) {
        throw new Error('Wallet address is required');
      }

      // TODO: put this in the global state
      const antRegistry = ANTRegistry.init({
        process: new AOProcess({
          processId: ANT_REGISTRY_ID,
          ao: antAoClient,
        }),
      });

      const accessControlList = await antRegistry.accessControlList({
        address: walletAddress.toString(),
      });

      return accessControlList;
    },
    enabled: !!walletAddress,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}
