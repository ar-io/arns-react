import { fetchCompletedListings } from '@blockydevs/arns-marketplace-data';
import {
  Card,
  CompletedListingTable,
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

const CompletedListingsTab = () => {
  const navigate = useNavigate();
  const [{ aoClient }] = useGlobalState();
  const pagination = useCursorPagination(PAGE_SIZE);

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
            createdAt: item.createdAt,
            endDate: item.endedAt,
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

  const { totalItems } = queryCompletedListings.data ?? {};
  const totalPages = pagination.getTotalPages(totalItems);

  return (
    <Card className="flex flex-col gap-8">
      <CompletedListingTable
        data={queryCompletedListings.data?.items ?? []}
        isPending={queryCompletedListings.isPending}
        error={queryCompletedListings.error?.message}
      />
      {!queryCompletedListings.isPending && (
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
