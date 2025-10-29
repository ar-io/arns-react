import { antsMetadataQueryOptions } from '@src/hooks/listings/useAntsMetadata';
import { useGlobalState } from '@src/state';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';

export const usePrefetchMarketplaceData = () => {
  const [{ aoClient, arioProcessId }] = useGlobalState();
  const queryClient = useQueryClient();

  const queryOptions = useMemo(
    () =>
      antsMetadataQueryOptions({
        aoClient,
        arioProcessId,
      }),
    [aoClient, arioProcessId],
  );

  const hasInitialData = !!queryOptions.initialData?.();

  // prefetch marketplace data on app load, but only if we don't have it already stored
  useEffect(() => {
    if (hasInitialData) return;
    void queryClient.prefetchQuery(queryOptions);
  }, [queryClient, queryOptions, hasInitialData]);
};
