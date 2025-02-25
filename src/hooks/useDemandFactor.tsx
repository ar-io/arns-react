import { useGlobalState } from '@src/state';
import { useQuery } from '@tanstack/react-query';

export function useDemandFactor() {
  const [{ arioProcessId, arioContract }] = useGlobalState();
  return useQuery({
    queryKey: ['demand-factor', arioProcessId],
    queryFn: async () => {
      const demandFactor = await arioContract.getDemandFactor();

      return demandFactor;
    },
    enabled: !!arioProcessId && !!arioContract?.getDemandFactor,
    staleTime: 1000 * 60 * 3,
  });
}
