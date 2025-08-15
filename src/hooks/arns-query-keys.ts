import { AoArNSNameData } from '@ar.io/sdk/web';

/**
 * Query key factory for ArNS records to ensure consistent caching across hooks
 * This pattern helps React Query deduplicate requests and share cached data
 */
export const arnsQueryKeys = {
  // Base key for all ArNS related queries
  all: ['arns'] as const,

  // All records queries
  records: () => [...arnsQueryKeys.all, 'records'] as const,

  // Records with specific filters
  recordsWithFilters: (
    processId: string,
    filters?: Partial<
      Record<
        keyof AoArNSNameData,
        string | number | boolean | string[] | number[] | boolean[]
      >
    >,
  ) => [...arnsQueryKeys.records(), processId, filters] as const,

  // Records for a specific address
  recordsForAddress: (processId: string, address: string) =>
    [...arnsQueryKeys.records(), processId, 'address', address] as const,

  // Individual record by name
  record: (processId: string, name: string) =>
    [...arnsQueryKeys.records(), processId, 'single', name] as const,

  // All records (unfiltered)
  allRecords: (processId: string) =>
    [...arnsQueryKeys.records(), processId, 'all'] as const,
} as const;

export type ArnsQueryKeys = typeof arnsQueryKeys;
