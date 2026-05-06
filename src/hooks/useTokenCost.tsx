import { AoARIORead } from '@ar.io/sdk';
import { useGlobalState } from '@src/state';
import { arioContractCacheKey } from '@src/utils/sdk-init';
import { useQuery } from '@tanstack/react-query';

export function useTokenCost({
  name,
  quantity,
  intent,
  type,
  years,
}: Parameters<AoARIORead['getTokenCost']>[0]) {
  const [{ arioContract }] = useGlobalState();
  return useQuery({
    queryKey: [
      intent,
      quantity,
      arioContractCacheKey(arioContract),
      years,
      name,
      type,
    ],
    queryFn: async () => {
      return await arioContract.getTokenCost({
        intent,
        quantity,
        name,
        type,
        years,
      });
    },
    staleTime: 1000 * 60 * 5,
  });
}
