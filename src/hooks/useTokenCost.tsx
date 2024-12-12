import { AoARIORead } from '@ar.io/sdk';
import { useGlobalState } from '@src/state';
import { useQuery } from '@tanstack/react-query';

export function useTokenCost({
  name,
  quantity,
  intent,
  type,
  years,
}: Parameters<AoARIORead['getTokenCost']>[0]) {
  const [{ arioProcessId, arioContract }] = useGlobalState();
  return useQuery({
    queryKey: [intent, quantity, arioProcessId.toString(), years, name, type],
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
