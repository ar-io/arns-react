import { fetchCompletedListings } from '@blockydevs/arns-marketplace-data';
import {
  Card,
  CompletedListingTable,
  Pagination,
  useCursorPagination,
} from '@blockydevs/arns-marketplace-ui';
import { useAntsMetadata } from '@src/hooks/listings/useAntsMetadata';
import { usePrepareListings } from '@src/hooks/listings/usePrepareListings';
import { useGlobalState } from '@src/state';
import {
  BLOCKYDEVS_MARKETPLACE_PROCESS_ID,
  marketplaceQueryKeys,
} from '@src/utils/marketplace';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

const PAGE_SIZE = 20;

const CompletedListingsTab = () => {
  const [{ aoClient }] = useGlobalState();
  const pagination = useCursorPagination(PAGE_SIZE);
  const queryAntsMetadata = useAntsMetadata();
  const queryCompletedListings = useQuery({
    refetchInterval: 15 * 1000,
    enabled: Boolean(aoClient),
    queryKey: marketplaceQueryKeys.listings.list('completed', {
      page: pagination.page,
      pageSize: pagination.pageSize,
      cursor: pagination.cursor,
    }),
    queryFn: () => {
      return fetchCompletedListings({
        ao: aoClient,
        marketplaceProcessId: BLOCKYDEVS_MARKETPLACE_PROCESS_ID,
        limit: pagination.pageSize,
        cursor: pagination.cursor,
      });
    },
  });

  const preparedItems = usePrepareListings(queryCompletedListings.data);
  const { totalItems } = queryCompletedListings.data ?? {};
  const totalPages = pagination.getTotalPages(totalItems);
  const isPending =
    queryCompletedListings.isPending || queryAntsMetadata.isPending;

  useEffect(() => {
    if (!queryCompletedListings.data) return;

    const { nextCursor, hasMore } = queryCompletedListings.data;
    pagination.storeNextCursor(nextCursor, !!hasMore);
  }, [queryCompletedListings.data, pagination.storeNextCursor]);

  return (
    <Card className="flex flex-col gap-8">
      <CompletedListingTable
        data={preparedItems}
        isPending={isPending}
        error={queryCompletedListings.error?.message}
      />
      {!isPending && (
        <Pagination
          totalPages={totalPages}
          activeIndex={pagination.page}
          onPageChange={pagination.setPage}
        />
      )}
    </Card>
  );
};

export default CompletedListingsTab;
