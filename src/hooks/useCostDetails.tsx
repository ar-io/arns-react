import {
  ARIORead,
  ARIOWrite,
  CostDetailsResult,
  GetCostDetailsParams,
} from '@ar.io/sdk';
import { useGlobalState } from '@src/state';
import { arioContractCacheKey } from '@src/utils/sdk-init';
import { useQuery } from '@tanstack/react-query';

export const COST_DETAIL_STALE_TIME = 1000 * 60 * 5;

export function buildCostDetailsQuery(
  params: GetCostDetailsParams,
  { arioContract }: { arioContract: ARIORead | ARIOWrite },
): Parameters<typeof useQuery<CostDetailsResult>>[0] {
  return {
    queryKey: ['getCostDetails', params, arioContractCacheKey(arioContract)],
    queryFn: async () => {
      return await arioContract.getCostDetails(params);
    },
    staleTime: COST_DETAIL_STALE_TIME,
    enabled: params?.name?.length > 0,
  };
}

export function useCostDetails(params: GetCostDetailsParams) {
  const [{ arioContract }] = useGlobalState();

  return useQuery<CostDetailsResult>(
    buildCostDetailsQuery(params, { arioContract }),
  );
}
