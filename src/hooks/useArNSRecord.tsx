import { useGlobalState } from '@src/state';
import { isARNSDomainNameValid } from '@src/utils';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { extractRecordFromCollection } from './arns-cache-utils';
import { arnsQueryKeys } from './arns-query-keys';

export function useArNSRecord({ name }: { name: string | undefined }) {
  const [{ arioContract }] = useGlobalState();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: arnsQueryKeys.record(arioContract.process.processId, name || ''),
    queryFn: async () => {
      if (!isARNSDomainNameValid({ name }) || name === undefined)
        throw new Error('Invalid ArNS name');

      // First try to get the record from existing collection queries
      const cachedRecord = extractRecordFromCollection(
        queryClient,
        arioContract.process.processId,
        name,
      );

      if (cachedRecord) {
        return cachedRecord;
      }

      // If not found in cache, fetch from the contract
      const record = await arioContract.getArNSRecord({ name });
      return record ?? null; // null is serializable, undefined is not
    },
    enabled: isARNSDomainNameValid({ name }),
    staleTime: 4 * 60 * 60 * 1000, // 4 hours
  });
}
