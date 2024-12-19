import { AoARIORead } from '@ar.io/sdk';
import { useGlobalState } from '@src/state';
import { useQuery } from '@tanstack/react-query';

export function useCostDetails(
  params: Parameters<AoARIORead['getCostDetails']>[0],
) {
  const [{ arioProcessId, arioContract }] = useGlobalState();
  return useQuery({
    queryKey: [params, arioProcessId.toString()],
    queryFn: async () => {
      return await arioContract.getCostDetails(params);
    },
    staleTime: 1000 * 60 * 5,
  });
}
