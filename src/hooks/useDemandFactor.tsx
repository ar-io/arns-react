import { useGlobalState } from '@src/state';
import { arioContractCacheKey } from '@src/utils/sdk-init';
import { useQuery } from '@tanstack/react-query';

export function useDemandFactor() {
  const [{ arioContract }] = useGlobalState();
  return useQuery({
    queryKey: ['demand-factor', arioContractCacheKey(arioContract)],
    queryFn: async () => arioContract.getDemandFactor(),
    enabled: !!arioContract?.getDemandFactor,
    staleTime: 1000 * 60 * 3,
  });
}
