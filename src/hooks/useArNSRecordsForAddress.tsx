import { AoArNSNameData } from '@ar.io/sdk/web';
import { useGlobalState } from '@src/state';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { populateIndividualRecordQueries } from './arns-cache-utils';
import { arnsQueryKeys } from './arns-query-keys';

/**
 * Hook for fetching ArNS records owned by a specific address
 * This coordinates with the dispatch action to avoid duplicate fetching
 */
export function useArNSRecordsForAddress({
  address,
}: {
  address: string | undefined;
}) {
  const [{ arioContract }] = useGlobalState();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: arnsQueryKeys.recordsForAddress(
      arioContract.process.processId,
      address || '',
    ),
    queryFn: async () => {
      if (!address) {
        throw new Error('Address is required');
      }

      const userDomains: Record<string, AoArNSNameData> = {};
      let cursor: string | undefined = undefined;
      let hasMore = true;

      while (hasMore) {
        const res = await arioContract.getArNSRecordsForAddress({
          address,
          limit: 1000,
          cursor,
        });

        Object.entries(res.items).forEach(([name, record]) => {
          userDomains[name] = record;
        });

        cursor = res.nextCursor;
        hasMore = res.hasMore;
      }

      const records = Object.values(userDomains);

      // Populate individual record queries from this collection
      populateIndividualRecordQueries(
        queryClient,
        arioContract.process.processId,
        userDomains,
      );

      return records;
    },
    enabled: !!address,
    staleTime: 4 * 60 * 60 * 1000, // 4 hours
  });
}
