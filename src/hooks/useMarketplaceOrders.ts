import { ArNSMarketplaceRead, ArNSMarketplaceWrite } from '@ar.io/sdk/web';
import { useGlobalState } from '@src/state';
import { NETWORK_DEFAULTS } from '@src/utils/constants';
import { queryOptions, useQuery } from '@tanstack/react-query';

export interface MarketplaceOrdersFilters {
  limit?: number;
  cursor?: string;
  sortBy?: 'price' | 'createdAt' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export function buildMarketplaceOrdersQuery({
  marketplaceContract,
  marketplaceProcessId,
  aoNetwork,
  filters,
}: {
  marketplaceContract: ArNSMarketplaceRead | ArNSMarketplaceWrite;
  marketplaceProcessId: string;
  aoNetwork: typeof NETWORK_DEFAULTS.AO;
  filters?: MarketplaceOrdersFilters;
}) {
  return queryOptions({
    queryKey: [
      'marketplace-orders',
      marketplaceProcessId,
      aoNetwork.ARIO,
      filters,
    ],
    queryFn: async () => {
      try {
        // Check if the marketplace contract has a getOrders method
        if (typeof (marketplaceContract as any).getOrders === 'function') {
          // Fetch all orders with pagination support
          let hasMore = true;
          let cursor = filters?.cursor;
          const allOrders: any[] = [];
          const limit = filters?.limit || 100;

          while (
            hasMore &&
            (!filters?.limit || allOrders.length < filters.limit)
          ) {
            const result: any = await (marketplaceContract as any).getOrders({
              cursor,
              limit: Math.min(
                limit,
                (filters?.limit || limit) - allOrders.length,
              ),
              sortBy: filters?.sortBy,
              sortOrder: filters?.sortOrder,
            });

            if (result.items) {
              allOrders.push(...result.items);
            }

            hasMore = result.hasMore || false;
            cursor = result.nextCursor;

            // If we have a specific limit and we've reached it, break
            if (filters?.limit && allOrders.length >= filters.limit) {
              break;
            }
          }

          return {
            items: allOrders,
            hasMore,
            nextCursor: cursor,
            totalCount: allOrders.length,
          };
        } else {
          // Fallback: return empty result if method doesn't exist
          console.warn(
            'getOrders method not available on marketplace contract',
          );
          return {
            items: [],
            hasMore: false,
            nextCursor: undefined,
            totalCount: 0,
          };
        }
      } catch (error) {
        console.error('Error fetching marketplace orders', error);
        throw error;
      }
    },
    enabled:
      !!marketplaceContract && !!marketplaceProcessId && !!aoNetwork.ARIO,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useMarketplaceOrders(filters?: MarketplaceOrdersFilters) {
  const [{ marketplaceContract, marketplaceProcessId, aoNetwork }] =
    useGlobalState();

  return useQuery(
    buildMarketplaceOrdersQuery({
      marketplaceContract,
      marketplaceProcessId,
      aoNetwork,
      filters,
    }),
  );
}
