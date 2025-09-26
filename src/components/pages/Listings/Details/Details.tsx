import { fetchListingDetails } from '@blockydevs/arns-marketplace-data';
import { DetailsCard, Spinner } from '@blockydevs/arns-marketplace-ui';
import EnglishListingBidsSection from '@src/components/pages/Listings/Details/EnglishListingBidsSection';
import ListingBuyerSection from '@src/components/pages/Listings/Details/ListingBuyerSection';
import ListingExpiredSection from '@src/components/pages/Listings/Details/ListingExpiredSection';
import ListingMetadata from '@src/components/pages/Listings/Details/ListingMetadata';
import ListingPriceSection from '@src/components/pages/Listings/Details/ListingPriceSection';
import { useGlobalState, useWalletState } from '@src/state';
import {
  BLOCKYDEVS_ACTIVITY_PROCESS_ID,
  getCurrentListingArioPrice,
  getStatusVariantFromListing,
  marketplaceQueryKeys,
} from '@src/utils/marketplace';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';

const Details = () => {
  const { id } = useParams();
  const [{ aoClient }] = useGlobalState();
  const [{ walletAddress }] = useWalletState();
  const queryDetails = useQuery({
    enabled: !!id,
    refetchInterval: 15 * 1000,
    queryKey: marketplaceQueryKeys.listings.item(id),
    queryFn: () => {
      if (!id) throw new Error('guard: no id provided');

      return fetchListingDetails({
        ao: aoClient,
        activityProcessId: BLOCKYDEVS_ACTIVITY_PROCESS_ID,
        orderId: id,
      });
    },
  });

  if (queryDetails.isPending) {
    return (
      <div className="flex justify-center grow items-center">
        <Spinner className="text-primary size-8" />
      </div>
    );
  }

  if (queryDetails.error) {
    return (
      <p className="text-error text-center">
        Failed to load listing details: {queryDetails.error.message}
      </p>
    );
  }

  const listing = queryDetails.data;
  const currentPrice = getCurrentListingArioPrice(listing);
  const status = getStatusVariantFromListing(listing);

  return (
    <div className="max-w-6xl w-full px-6 mx-auto grid lg:grid-cols-5 gap-6 py-12">
      <ListingMetadata listing={listing} />
      <div className="lg:col-span-2 flex flex-col gap-4">
        <DetailsCard
          price={`${currentPrice} ARIO`}
          status={status}
          startDate={listing.createdAt}
          endDate={'endedAt' in listing ? listing.endedAt : listing.expiresAt}
          variant={listing.type}
        >
          <ListingPriceSection listing={listing} />
        </DetailsCard>
        {listing.type === 'english' &&
          listing.status === 'ready-for-settlement' &&
          listing.highestBidder !== walletAddress?.toString() && (
            <ListingBuyerSection buyerAddress={listing.highestBidder} />
          )}
        {listing.status === 'settled' && (
          <ListingBuyerSection buyerAddress={listing.receiver} />
        )}
        {listing.status === 'expired' && (
          <ListingExpiredSection listing={listing} />
        )}
        {listing.type === 'english' && (
          <EnglishListingBidsSection listing={listing} />
        )}
      </div>
    </div>
  );
};

export default Details;
