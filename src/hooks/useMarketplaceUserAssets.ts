import { ArNSMarketplaceRead, ArNSMarketplaceWrite } from '@ar.io/sdk';
import { useGlobalState, useWalletState } from '@src/state';
import { NETWORK_DEFAULTS } from '@src/utils/constants';
import { queryOptions, useQuery } from '@tanstack/react-query';

export function buildMarketplaceUserAssetsQuery({
  address,
  marketplaceContract,
  marketplaceProcessId,
  arioProcessId,
  aoNetwork,
}: {
  address?: string;
  marketplaceContract: ArNSMarketplaceRead | ArNSMarketplaceWrite;
  marketplaceProcessId: string;
  arioProcessId: string;
  aoNetwork: typeof NETWORK_DEFAULTS.AO;
}) {
  return queryOptions({
    queryKey: [
      'marketplace-user-assets',
      address,
      marketplaceProcessId,
      aoNetwork.ARIO,
    ],
    queryFn: () => {
      if (!address) throw new Error('No address provided to fetch assets');
      return marketplaceContract
        .getUserAssets({ address, arioProcessId })
        .catch((error) => {
          console.error('Error fetching marketplace user assets', error);
          throw error;
        });
    },
    enabled:
      !!marketplaceContract &&
      !!marketplaceProcessId &&
      !!address &&
      !!aoNetwork.ARIO,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
}

export function useMarketplaceUserAssets({ address }: { address?: string }) {
  const [
    { marketplaceContract, marketplaceProcessId, arioProcessId, aoNetwork },
  ] = useGlobalState();
  const [{ walletAddress }] = useWalletState();
  const userAddress = address ?? walletAddress?.toString();
  return useQuery(
    buildMarketplaceUserAssetsQuery({
      address: userAddress,
      marketplaceContract,
      marketplaceProcessId,
      arioProcessId,
      aoNetwork,
    }),
  );
}
