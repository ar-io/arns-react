import { DEFAULT_ARWEAVE } from '@src/utils/constants';
import { useQuery } from '@tanstack/react-query';
import Transaction from 'arweave/web/lib/transaction';

export function useArweaveTransaction(id: string) {
  return useQuery({
    queryKey: [id],
    queryFn: async () => {
      const tx = await DEFAULT_ARWEAVE.transactions.get(id);
      // decoding tags because seems like they dont like being serialized for query storage
      const decodedTags = tx.tags.map((tag) => ({
        name: tag.get('name', { decode: true, string: true }),
        value: tag.get('value', { decode: true, string: true }),
      }));

      return { ...tx, tags: decodedTags } as Transaction;
    },

    staleTime: Infinity,
  });
}
