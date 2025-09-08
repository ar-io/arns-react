import {
  ANT,
  AOProcess,
  AoANTState,
  AoARIORead,
  AoArNSNameDataWithName,
  AoClient,
  mARIOToken,
} from '@ar.io/sdk/web';
import { ArweaveCompositeDataProvider } from '@src/services/arweave/ArweaveCompositeDataProvider';
import { AoAddress } from '@src/types';
import { QueryClient, useQuery } from '@tanstack/react-query';
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

export function buildAntStateQuery({
  processId,
  ao,
  hyperbeamUrl,
}: {
  processId: string;
  ao: AoClient;
  hyperbeamUrl?: string;
}): Parameters<typeof useQuery<AoANTState>>[0] {
  return {
    queryKey: ['ant', processId],
    queryFn: async () => {
      if (!processId || !isArweaveTransactionID(processId))
        throw new Error('Must provide a valid process id');

      const ant = ANT.init({
        process: new AOProcess({ processId, ao }),
        hyperbeamUrl,
      });
      return await ant.getState();
    },
    staleTime: Infinity,
  };
}

export function buildAntVersionQuery({
  processId,
  ao,
  hyperbeamUrl,
  graphqlUrl,
  antRegistryId,
}: {
  processId: string;
  ao: AoClient;
  hyperbeamUrl?: string;
  graphqlUrl?: string;
  antRegistryId: string;
}): Parameters<typeof useQuery<string>>[0] {
  return {
    queryKey: ['ant-version', processId],
    queryFn: () => {
      const ant = ANT.init({
        process: new AOProcess({ processId, ao }),
        hyperbeamUrl,
      });
      return ant.getVersion({ graphqlUrl, antRegistryId });
    },
    staleTime: Infinity,
  };
}

export function buildIOBalanceQuery({
  arioContract,
  address,
  meta,
}: {
  arioContract: AoARIORead;
  address: string;
  meta?: string[];
}): Parameters<typeof useQuery<number>>[0] {
  return {
    queryKey: ['io-balance', address, ...(meta || [])],
    queryFn: async () => {
      return await arioContract
        .getBalance({
          address,
        })
        .then((balance) => {
          return new mARIOToken(balance).toARIO().valueOf();
        })
        .catch(() => 0);
    },
    staleTime: 1000 * 60 * 60, // one hour
  };
}
export function buildARBalanceQuery({
  provider,
  address,
  meta,
}: {
  provider: ArweaveCompositeDataProvider;
  address: AoAddress;
  meta?: string[];
}): {
  queryKey: ['ar-balance', string] | string[];
  queryFn: () => Promise<number>;
  staleTime: number;
} {
  return {
    queryKey: ['ar-balance', address.toString(), ...(meta || [])],
    queryFn: async () => {
      return await provider.getArBalance(address).catch(() => 0);
    },
    staleTime: 1000 * 60 * 60, // one hour
  };
}

export function buildArNSRecordsQuery({
  arioContract,
  filters,
}: {
  arioContract: AoARIORead;
  filters?: Partial<
    Record<
      keyof AoArNSNameDataWithName,
      string | number | boolean | string[] | number[] | boolean[]
    >
  >;
}): Parameters<typeof useQuery<AoArNSNameDataWithName[]>>[0] {
  return {
    queryKey: ['arns-records', arioContract.process.processId, filters],
    queryFn: async () => {
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
      return records;
    },
    staleTime: 4 * 60 * 60 * 1000, // 1 hour
  };
}
