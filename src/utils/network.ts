import {
  ANT,
  AoANTState,
  AoArNSNameData,
  AoIORead,
  mIOToken,
} from '@ar.io/sdk/web';
import { ArweaveCompositeDataProvider } from '@src/services/arweave/ArweaveCompositeDataProvider';
import { ArweaveTransactionID } from '@src/services/arweave/ArweaveTransactionID';
import { QueryClient } from '@tanstack/react-query';
import {
  PersistedClient,
  Persister,
} from '@tanstack/react-query-persist-client';
import { del, get, set } from 'idb-keyval';

import { lowerCaseDomain } from '.';

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
  queryFn: () => Promise<AoANTState>;
  staleTime: number;
} {
  return {
    queryKey: ['ant', processId],
    queryFn: async () => {
      const ant = ANT.init({ processId });
      return await ant.getState();
    },
    staleTime: Infinity,
  };
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
    queryKey: ['arns-record', lowerCaseDomain(domain)],
    queryFn: async () => {
      return await arioContract.getArNSRecord({
        name: lowerCaseDomain(domain),
      });
    },
    staleTime: Infinity,
  };
}

export function buildIOBalanceQuery({
  arioContract,
  address,
}: {
  arioContract: AoIORead;
  address: string;
}): {
  queryKey: ['io-balance', string];
  queryFn: () => Promise<number>;
  staleTime: number;
} {
  return {
    queryKey: ['io-balance', address],
    queryFn: async () => {
      return await arioContract
        .getBalance({
          address,
        })
        .then((balance) => {
          return new mIOToken(balance).toIO().valueOf();
        })
        .catch(() => 0);
    },
    staleTime: 1000 * 60 * 60, // one hour
  };
}
export function buildARBalanceQuery({
  provider,
  address,
}: {
  provider: ArweaveCompositeDataProvider;
  address: ArweaveTransactionID;
}): {
  queryKey: ['ar-balance', string];
  queryFn: () => Promise<number>;
  staleTime: number;
} {
  return {
    queryKey: ['ar-balance', address.toString()],
    queryFn: async () => {
      return await provider.getArBalance(address).catch(() => 0);
    },
    staleTime: 1000 * 60 * 60, // one hour
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
    await queryClient.setQueryData(
      ['arns-record', lowerCaseDomain(domain)],
      record,
    );
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
