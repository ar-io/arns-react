import { fetchActiveListings } from '@blockydevs/arns-marketplace-data';
import {
  ActiveListingTable,
  Card,
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

const ActiveListingsTab = () => {
  const [{ aoClient }] = useGlobalState();
  const pagination = useCursorPagination(PAGE_SIZE);
  const queryAntsMetadata = useAntsMetadata();
  const queryActiveListings = useQuery({
    refetchInterval: 15 * 1000,
    structuralSharing: false,
    queryKey: marketplaceQueryKeys.listings.list('active', {
      page: pagination.page,
      pageSize: pagination.pageSize,
      cursor: pagination.cursor,
    }),
    queryFn: () => {
      return fetchActiveListings({
        ao: aoClient,
        marketplaceProcessId: BLOCKYDEVS_MARKETPLACE_PROCESS_ID,
        limit: pagination.pageSize,
        cursor: pagination.cursor,
      });
    },
  });

  const preparedItems = usePrepareListings(queryActiveListings.data);
  const { totalItems } = queryActiveListings.data ?? {};
  const totalPages = pagination.getTotalPages(totalItems);
  const isPending =
    queryActiveListings.isPending || queryAntsMetadata.isPending;

  useEffect(() => {
    if (!queryActiveListings.data) return;

    const { nextCursor, hasMore } = queryActiveListings.data;
    pagination.storeNextCursor(nextCursor, !!hasMore);
  }, [queryActiveListings.data, pagination.storeNextCursor]);

  return (
    <Card className="flex flex-col gap-8">
      <ActiveListingTable
        data={preparedItems}
        isPending={isPending}
        error={queryActiveListings.error?.message}
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

export default ActiveListingsTab;
