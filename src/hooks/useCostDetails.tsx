import { AoGetCostDetailsParams } from '@ar.io/sdk';
import { useGlobalState } from '@src/state';
import { useQuery } from '@tanstack/react-query';

export function useCostDetails(params: AoGetCostDetailsParams) {
  const [{ arioProcessId, arioContract }] = useGlobalState();
  // we are verbose here to enable predictable keys. Passing in the entire params as a single object can have unpredictable side effects
  return useQuery({
    queryKey: ['getCostDetails', params, arioProcessId.toString()],
    queryFn: async () => {
      return await arioContract.getCostDetails(params);
    },
    staleTime: 1000 * 60 * 5,
  });
}
