import { AoClient } from '@ar.io/sdk';
import {
  FetchANTsMetadataResult,
  fetchANTsMetadata,
  fetchAllAntsFromActivity,
} from '@blockydevs/arns-marketplace-data';
import { useGlobalState } from '@src/state';
import {
  BLOCKYDEVS_MARKETPLACE_METADATA_STORAGE_KEY,
  BLOCKYDEVS_MARKETPLACE_PROCESS_ID,
  marketplaceQueryKeys,
} from '@src/utils/marketplace';
import {
  keepPreviousData,
  queryOptions,
  useQuery,
} from '@tanstack/react-query';
import { useCallback, useRef } from 'react';

const readStorage = (): FetchANTsMetadataResult | null => {
  try {
    const stored = localStorage.getItem(
      BLOCKYDEVS_MARKETPLACE_METADATA_STORAGE_KEY,
    );
    if (!stored) return null;

    const parsed = JSON.parse(stored);
    return parsed.data;
  } catch (error) {
    console.warn('Failed to parse marketplace metadata:', error);
    return null;
  }
};

const updateStorage = (data: FetchANTsMetadataResult) => {
  try {
    localStorage.setItem(
      BLOCKYDEVS_MARKETPLACE_METADATA_STORAGE_KEY,
      JSON.stringify({ timestamp: Date.now(), data }),
    );
  } catch (error) {
    console.warn('Failed to marketplace metadata:', error);
  }
};

export const antsMetadataQueryOptions = ({
  aoClient,
  arioProcessId,
}: {
  aoClient: AoClient;
  arioProcessId: string;
}) => {
  return queryOptions({
    queryKey: [marketplaceQueryKeys.metadata.all],
    initialData: () => readStorage() ?? undefined,
    queryFn: async () => {
      const antIds = await fetchAllAntsFromActivity({
        ao: aoClient,
        marketplaceProcessId: BLOCKYDEVS_MARKETPLACE_PROCESS_ID,
      });

      const result = await fetchANTsMetadata({
        ao: aoClient,
        arioProcessId,
        antIds,
      });

      updateStorage(result);

      return result;
    },
  });
};

export const useAntsMetadata = () => {
  const [{ aoClient, arioProcessId }] = useGlobalState();
  const inFlightRef = useRef(false);

  const initialData = readStorage();

  // refetching should happen only when there's no initial data or user has encountered ANT without metadata
  const query = useQuery({
    ...antsMetadataQueryOptions({ aoClient, arioProcessId }),
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: initialData ? Infinity : 0,
    placeholderData: keepPreviousData,
  });

  const deduplicatedRefetch = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    try {
      await query.refetch();
    } finally {
      inFlightRef.current = false;
    }
  }, [query]);

  return {
    data: query.data ?? {},
    isPending: query.isPending,
    refetch: deduplicatedRefetch,
  };
};
