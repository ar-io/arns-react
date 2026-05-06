import { useGlobalState } from '@src/state';
import { arioContractCacheKey } from '@src/utils/sdk-init';
import { useQuery } from '@tanstack/react-query';

export function useIncreaseUndernameCost({
  name,
  quantity,
}: {
  name: string;
  quantity: number;
}) {
  const [{ arioContract }] = useGlobalState();
  return useQuery({
    queryKey: [
      'increaseUndernameCost',
      quantity,
      arioContractCacheKey(arioContract),
      name,
    ],
    queryFn: async () => {
      return await arioContract.getTokenCost({
        intent: 'Increase-Undername-Limit',
        quantity,
        name,
      });
    },
    staleTime: 1000 * 60 * 5,
  });
}
