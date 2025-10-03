import { fetchActiveListings } from '@blockydevs/arns-marketplace-data';
import {
  ActiveListingTable,
  Card,
  type Domain,
  Pagination,
  useCursorPagination,
} from '@blockydevs/arns-marketplace-ui';
import { useGlobalState } from '@src/state';
import {
  BLOCKYDEVS_ACTIVITY_PROCESS_ID,
  getCurrentListingArioPrice,
  marketplaceQueryKeys,
} from '@src/utils/marketplace';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

const PAGE_SIZE = 20;

const ActiveListingsTab = () => {
  const navigate = useNavigate();
  const [{ aoClient }] = useGlobalState();
  const pagination = useCursorPagination(PAGE_SIZE);

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
        activityProcessId: BLOCKYDEVS_ACTIVITY_PROCESS_ID,
        limit: pagination.pageSize,
        cursor: pagination.cursor,
      });
    },
    select: (data) => {
      pagination.storeNextCursor(data.nextCursor, !!data.hasMore);

      return {
        ...data,
        items: data.items.map((item): Domain => {
          const currentPrice = getCurrentListingArioPrice(item);

          return {
            name: item.name,
            endDate: item.expiresAt ?? undefined,
            ownershipType: item.ownershipType,
            price: {
              type: item.type === 'english' ? 'bid' : 'buyout',
              symbol: 'ARIO',
              value: Number(currentPrice),
            },
            type: {
              value: item.type,
            },
            action: () => {
              navigate(`/listings/${item.orderId}`);
            },
          };
        }),
      };
    },
  });

  const { totalItems } = queryActiveListings.data ?? {};
  const totalPages = pagination.getTotalPages(totalItems);

  return (
    <Card className="flex flex-col gap-8">
      <ActiveListingTable
        data={queryActiveListings.data?.items ?? []}
        isPending={queryActiveListings.isPending}
        error={queryActiveListings.error?.message}
      />
      {!queryActiveListings.isPending && (
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
