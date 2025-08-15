import { AoArNSNameData } from '@ar.io/sdk/web';
import { useGlobalState } from '@src/state';
import { useQueries, useQueryClient } from '@tanstack/react-query';

import { populateIndividualRecordQueries } from './arns-cache-utils';
import { arnsQueryKeys } from './arns-query-keys';

/**
 * Unified hook for managing ArNS data efficiently across different query types
 * This hook coordinates multiple data sources and ensures efficient caching
 */
export function useArNSData({
  address,
  recordName,
  filters,
}: {
  address?: string;
  recordName?: string;
  filters?: Partial<
    Record<
      keyof AoArNSNameData,
      string | number | boolean | string[] | number[] | boolean[]
    >
  >;
} = {}) {
  const [{ arioContract }] = useGlobalState();
  const queryClient = useQueryClient();
  const processId = arioContract.process.processId;

  const queries = useQueries({
    queries: [
      // Query for user's records (if address provided)
      {
        queryKey: arnsQueryKeys.recordsForAddress(processId, address || ''),
        queryFn: async () => {
          if (!address) return [];

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
          populateIndividualRecordQueries(queryClient, processId, userDomains);
          return records;
        },
        enabled: !!address,
        staleTime: 4 * 60 * 60 * 1000, // 4 hours
      },

      // Query for specific record (if recordName provided)
      {
        queryKey: arnsQueryKeys.record(processId, recordName || ''),
        queryFn: async () => {
          if (!recordName) return null;

          const record = await arioContract.getArNSRecord({ name: recordName });
          return record ?? null;
        },
        enabled: !!recordName,
        staleTime: 4 * 60 * 60 * 1000, // 4 hours
      },

      // Query for filtered records (if filters provided)
      {
        queryKey: arnsQueryKeys.recordsWithFilters(processId, filters),
        queryFn: async () => {
          if (!filters || Object.keys(filters).length === 0) return [];

          let hasMore = true;
          let cursor = undefined;
          const records = [];

          while (hasMore) {
            const {
              items,
              hasMore: more,
              nextCursor,
            } = await arioContract.getArNSRecords({
              filters,
              cursor,
              limit: 1000,
            });
            hasMore = more;
            cursor = nextCursor;
            records.push(...items);
          }

          populateIndividualRecordQueries(queryClient, processId, records);
          return records;
        },
        enabled: !!filters && Object.keys(filters).length > 0,
        staleTime: 4 * 60 * 60 * 1000, // 4 hours
      },
    ],
  });

  return {
    // User's records
    userRecords: queries[0],

    // Specific record
    record: queries[1],

    // Filtered records
    filteredRecords: queries[2],

    // Utility functions
    utils: {
      invalidateUserRecords: () => {
        if (address) {
          queryClient.invalidateQueries({
            queryKey: arnsQueryKeys.recordsForAddress(processId, address),
          });
        }
      },

      invalidateRecord: (name: string) => {
        queryClient.invalidateQueries({
          queryKey: arnsQueryKeys.record(processId, name),
        });
      },

      invalidateFilteredRecords: () => {
        queryClient.invalidateQueries({
          queryKey: arnsQueryKeys.recordsWithFilters(processId, filters),
        });
      },

      invalidateAll: () => {
        queryClient.invalidateQueries({
          queryKey: arnsQueryKeys.records(),
          predicate: (query) => query.queryKey.includes(processId),
        });
      },
    },
  };
}
