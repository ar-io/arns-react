import { ANTRegistry, ANT_REGISTRY_ID, AOProcess, AoClient } from '@ar.io/sdk';
import { useGlobalState, useWalletState } from '@src/state';
import { useQuery } from '@tanstack/react-query';

export function buildANTRegistryQuery(
  { address }: { address?: string },
  { aoClient }: { aoClient: AoClient },
): Parameters<
  typeof useQuery<{
    Owned: string[];
    Controlled: string[];
  }>
>[0] {
  return {
    enabled: !!address,
    queryKey: ['ant-registry', address, aoClient],
    queryFn: async () => {
      if (!address) throw new Error('User address required to query for ACL');
      const antRegistry = ANTRegistry.init({
        process: new AOProcess({
          processId: ANT_REGISTRY_ID,
          ao: aoClient,
        }),
      });
      const acl = await antRegistry.accessControlList({
        address,
      });

      return acl;
    },
    staleTime: 1000 * 60 * 5,
  };
}

export function useANTRegistry({ address }: { address?: string } = {}) {
  const [{ aoClient }] = useGlobalState();
  const [{ walletAddress }] = useWalletState();

  return useQuery(
    buildANTRegistryQuery(
      { address: address ?? walletAddress?.toString() },
      { aoClient },
    ),
  );
}
