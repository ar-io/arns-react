import { DEFAULT_ARWEAVE } from '@src/utils/constants';
import { useQuery } from '@tanstack/react-query';

export function useArweaveTransaction(id: string) {
  return useQuery({
    queryKey: [id],
    queryFn: async () => {
      return await DEFAULT_ARWEAVE.transactions.get(id);
    },
    staleTime: Infinity,
  });
}
