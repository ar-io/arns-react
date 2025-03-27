import {
  AoARIORead,
  AoARIOWrite,
  AoGetCostDetailsParams,
  CostDetailsResult,
} from '@ar.io/sdk';
import { useGlobalState } from '@src/state';
import { useQuery } from '@tanstack/react-query';

export const COST_DETAIL_STALE_TIME = 1000 * 60 * 5;

export function buildCostDetailsQuery(
  params: AoGetCostDetailsParams,
  {
    arioProcessId,
    arioContract,
  }: { arioProcessId: string; arioContract: AoARIORead | AoARIOWrite },
): Parameters<typeof useQuery<CostDetailsResult>>[0] {
  return {
    // we are verbose here to enable predictable keys. Passing in the entire params as a single object can have unpredictable side effects
    queryKey: ['getCostDetails', params, arioProcessId.toString()],
    queryFn: async () => {
      return await arioContract.getCostDetails(params);
    },
    staleTime: COST_DETAIL_STALE_TIME,
    enabled: params?.name?.length > 0,
  };
}

export function useCostDetails(params: AoGetCostDetailsParams) {
  const [{ arioProcessId, arioContract }] = useGlobalState();

  return useQuery<CostDetailsResult>(
    buildCostDetailsQuery(params, { arioProcessId, arioContract }),
  );
}
