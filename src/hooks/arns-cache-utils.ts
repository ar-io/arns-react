import { AoArNSNameData } from '@ar.io/sdk/web';
import { QueryClient } from '@tanstack/react-query';

import { arnsQueryKeys } from './arns-query-keys';

/**
 * Utility functions for normalizing ArNS record data across different query types
 * This allows efficient sharing of data between collection and individual record queries
 */

/**
 * Populates individual record queries from a collection of records
 * This is useful when you fetch multiple records and want to cache each one individually
 */
export function populateIndividualRecordQueries(
  queryClient: QueryClient,
  processId: string,
  records: Record<string, AoArNSNameData> | AoArNSNameData[],
) {
  // Handle both array and object formats
  const recordEntries = Array.isArray(records)
    ? records.map(
        (record, index) =>
          [`record_${index}`, record] as [string, AoArNSNameData],
      )
    : Object.entries(records);

  recordEntries.forEach(([name, record]) => {
    const queryKey = arnsQueryKeys.record(processId, name);

    // Only set if the query doesn't already exist or is stale
    const existingQuery = queryClient.getQueryState(queryKey);
    if (
      !existingQuery ||
      Date.now() - (existingQuery.dataUpdatedAt || 0) > 4 * 60 * 60 * 1000
    ) {
      queryClient.setQueryData(queryKey, record, {
        updatedAt: Date.now(),
      });
    }
  });
}

/**
 * Extracts a single record from a records collection query
 * This allows individual record queries to be satisfied from collection data
 */
export function extractRecordFromCollection(
  queryClient: QueryClient,
  processId: string,
  recordName: string,
): AoArNSNameData | undefined {
  // Try to find the record in any existing collection queries
  const queries = queryClient.getQueriesData({
    predicate: (query) => {
      const key = query.queryKey;
      return (
        key.includes('arns') &&
        key.includes('records') &&
        key.includes(processId) &&
        !key.includes('single') // Exclude individual record queries
      );
    },
  });

  for (const [, data] of queries) {
    // Handle both array and object formats
    if (Array.isArray(data)) {
      // For array format, we need to search through all records
      // This would only work if records have name properties, which they might not
      continue;
    } else if (data && typeof data === 'object' && recordName in data) {
      // For object format where keys are record names
      return (data as Record<string, AoArNSNameData>)[recordName];
    }
  }

  return undefined;
}

/**
 * Updates collection queries when an individual record is updated
 * This ensures consistency across all related queries
 * @param recordName - Required to identify which record to update in collections
 */
export function updateCollectionQueries(
  queryClient: QueryClient,
  processId: string,
  updatedRecord: AoArNSNameData,
  recordName: string,
) {
  // Update all collection queries that might contain this record
  queryClient.setQueriesData(
    {
      predicate: (query) => {
        const key = query.queryKey;
        return (
          key.includes('arns') &&
          key.includes('records') &&
          key.includes(processId) &&
          !key.includes('single')
        );
      },
    },
    (oldData: unknown) => {
      // Handle both array and object formats
      if (Array.isArray(oldData)) {
        // For array format, find and update the record by processId match
        return oldData.map((record) =>
          record.processId === updatedRecord.processId ? updatedRecord : record,
        );
      } else if (oldData && typeof oldData === 'object') {
        // For object format where keys are record names
        const recordsObj = oldData as Record<string, AoArNSNameData>;
        if (recordName in recordsObj) {
          return {
            ...recordsObj,
            [recordName]: updatedRecord,
          };
        }
      }

      return oldData;
    },
  );
}

/**
 * Invalidates related queries when records are modified
 * This is useful for ensuring fresh data after mutations
 */
export function invalidateRelatedQueries(
  queryClient: QueryClient,
  processId: string,
  recordName?: string,
) {
  if (recordName) {
    // Invalidate specific record and collections that might contain it
    queryClient.invalidateQueries({
      predicate: (query) => {
        const key = query.queryKey;
        return (
          key.includes('arns') &&
          key.includes('records') &&
          key.includes(processId) &&
          (key.includes(recordName) || !key.includes('single'))
        );
      },
    });
  } else {
    // Invalidate all ArNS queries for this process
    queryClient.invalidateQueries({
      queryKey: arnsQueryKeys.records(),
      predicate: (query) => query.queryKey.includes(processId),
    });
  }
}
