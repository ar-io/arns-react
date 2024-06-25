import { ANT, AoANTState, AoArNSNameData, AoIORead } from '@ar.io/sdk/web';
import { QueryClient } from '@tanstack/react-query';
import {
  PersistedClient,
  Persister,
} from '@tanstack/react-query-persist-client';
import { del, get, set } from 'idb-keyval';

import { isArweaveTransactionID } from '.';

/**
 * Creates an Indexed DB persister
 * @see https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
 */
export function createIDBPersister(idbValidKey: IDBValidKey = 'reactQuery') {
  return {
    persistClient: async (client: PersistedClient) => {
      await set(idbValidKey, client);
    },
    restoreClient: async () => {
      return await get<PersistedClient>(idbValidKey);
    },
    removeClient: async () => {
      await del(idbValidKey);
    },
  } as Persister;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 1 day
    },
  },
});

export function buildAntStateQuery({ processId }: { processId: string }): {
  queryKey: ['ant', string];
  queryFn: () => Promise<AoANTState | null>;
  staleTime: number;
} {
  if (isArweaveTransactionID(processId)) {
    const ant = ANT.init({ processId });
    return {
      queryKey: ['ant', processId],
      queryFn: async () => {
        return await ant.getState().catch((err: any) => null);
      },
      staleTime: Infinity,
    };
  } else {
    return {
      queryKey: ['ant', processId],
      queryFn: async () => {
        return null;
      },
      staleTime: 1,
    };
  }
}

export function buildArNSRecordQuery({
  arioContract,
  domain,
}: {
  arioContract: AoIORead;
  domain: string;
}): {
  queryKey: ['arns-record', string];
  queryFn: () => Promise<AoArNSNameData | undefined>;
  staleTime: number;
} {
  return {
    queryKey: ['arns-record', domain],
    queryFn: async () => {
      return await arioContract.getArNSRecord({ name: domain });
    },
    staleTime: Infinity,
  };
}

/**
 * Consumes a list of ARNS records and caches them in the query cache
 */
export async function cacheArNSRecords({
  queryClient,
  records,
}: {
  queryClient: QueryClient;
  records: Record<string, AoArNSNameData>;
}): Promise<void> {
  for (const [domain, record] of Object.entries(records)) {
    await queryClient.setQueryData(['arns-record', domain], record);
  }
}

export function buildArNSRecordsQuery({
  arioContract,
}: {
  arioContract: AoIORead;
}): {
  queryKey: ['arns-records'];
  queryFn: () => Promise<Record<string, AoArNSNameData>>;
  staleTime: number;
} {
  return {
    queryKey: ['arns-records'],
    queryFn: async () => {
      return await arioContract.getArNSRecords();
    },
    staleTime: Infinity,
  };
}
