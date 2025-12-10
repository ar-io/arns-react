import { ArNSMarketplaceRead, ArNSMarketplaceWrite } from '@ar.io/sdk/web';
import { useGlobalState } from '@src/state';
import { NETWORK_DEFAULTS } from '@src/utils/constants';
import { queryOptions, useQuery } from '@tanstack/react-query';

export function buildMarketplaceOrderQuery({
  antId,
  marketplaceContract,
  marketplaceProcessId,
  aoNetwork,
}: {
  antId?: string;
  marketplaceContract: ArNSMarketplaceRead | ArNSMarketplaceWrite;
  marketplaceProcessId: string;
  aoNetwork: typeof NETWORK_DEFAULTS.AO;
}) {
  return queryOptions({
    queryKey: [
      'marketplace-order',
      antId,
      marketplaceProcessId,
      aoNetwork.ARIO,
    ],
    queryFn: () => {
      if (!antId) throw new Error('No ANT ID provided to fetch order');
      return marketplaceContract.getOrderByANTId({ antId }).catch((error) => {
        console.error('Error fetching marketplace order', error);
        throw error;
      });
    },
    enabled:
      !!marketplaceContract &&
      !!marketplaceProcessId &&
      !!antId &&
      !!aoNetwork.ARIO,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useMarketplaceOrder({ antId }: { antId?: string }) {
  const [{ marketplaceContract, marketplaceProcessId, aoNetwork }] =
    useGlobalState();

  return useQuery(
    buildMarketplaceOrderQuery({
      antId,
      marketplaceContract,
      marketplaceProcessId,
      aoNetwork,
    }),
  );
}
