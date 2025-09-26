import { fetchMyANTs, marioToArio } from '@blockydevs/arns-marketplace-data';
import {
  Card,
  Header,
  MyANTsTable,
  OwnedDomain,
  Spinner,
  calculateCurrentDutchListingPrice,
} from '@blockydevs/arns-marketplace-ui';
import { useGlobalState, useWalletState } from '@src/state';
import {
  BLOCKYDEVS_ACTIVITY_PROCESS_ID,
  marketplaceQueryKeys,
} from '@src/utils/marketplace';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

const MyANTs = () => {
  const navigate = useNavigate();
  const [{ aoClient, aoNetwork, arioProcessId }] = useGlobalState();
  const [{ walletAddress }] = useWalletState();
  const queryMyANTs = useQuery({
    enabled: !!walletAddress,
    refetchInterval: 15 * 1000,
    queryKey: marketplaceQueryKeys.myANTs.list(walletAddress?.toString()),
    queryFn: () => {
      if (!walletAddress) throw new Error('No wallet address');

      return fetchMyANTs({
        walletAddress: walletAddress.toString(),
        ao: aoClient,
        networkProcessId: arioProcessId,
        activityProcessId: BLOCKYDEVS_ACTIVITY_PROCESS_ID,
        graphqlUrl: aoNetwork.ANT.GRAPHQL_URL,
      });
    },
    select: (data) => {
      return Object.values(data).map((domain): OwnedDomain => {
        return {
          name: domain.name,
          action: () => {
            if (domain.listing) {
              navigate(`/listings/${domain.listing.orderId}`);
            } else {
              navigate(
                `/my-ants/new-listing/${domain.processId}?name=${domain.name}`,
              );
            }
          },
          endDate: domain.listing
            ? domain.listing?.expiresAt ?? undefined
            : undefined,
          price: domain.listing
            ? {
                type: domain.listing.type === 'english' ? 'bid' : 'buyout',
                symbol: 'ARIO',
                value: (() => {
                  const item = domain.listing;
                  const marioPrice =
                    item.type === 'english'
                      ? item.highestBid ?? item.startingPrice
                      : item.type === 'dutch'
                      ? calculateCurrentDutchListingPrice({
                          startingPrice: item.startingPrice,
                          minimumPrice: item.minimumPrice,
                          decreaseInterval: item.decreaseInterval,
                          decreaseStep: item.decreaseStep,
                          createdAt: new Date(item.createdAt).getTime(),
                          endedAt: item.expiresAt
                            ? new Date(item.expiresAt).getTime()
                            : undefined,
                        })
                      : item.price;
                  return Number(marioToArio(marioPrice));
                })(),
              }
            : undefined,
          type: domain.listing
            ? {
                value: domain.listing?.type,
              }
            : undefined,
          ownershipType: domain.type,
          status: domain.listing ? 'listed' : 'idle',
        };
      });
    },
  });

  return (
    <div className="w-full px-8">
      <div className="flex gap-4 items-center">
        <Header size="h1" className="my-12">
          My ANTs
        </Header>
        {queryMyANTs.isRefetching && <Spinner className="size-8 text-white" />}
      </div>
      <Card>
        <MyANTsTable
          data={queryMyANTs.data ?? []}
          isPending={queryMyANTs.isPending}
          error={queryMyANTs.error?.message}
        />
      </Card>
    </div>
  );
};

export default MyANTs;
