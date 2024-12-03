import { AoIORead } from '@ar.io/sdk';
import { useGlobalState } from '@src/state';
import { useQuery } from '@tanstack/react-query';

export function useTokenCost({
  name,
  quantity,
  intent,
  type,
  years,
}: Parameters<AoIORead['getTokenCost']>[0]) {
  const [{ ioProcessId, arioContract }] = useGlobalState();
  return useQuery({
    queryKey: [intent, quantity, ioProcessId.toString()],
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
