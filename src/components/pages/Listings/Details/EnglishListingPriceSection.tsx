import { ListingEnglishDetails } from '@blockydevs/arns-marketplace-data';
import { Button, Input } from '@blockydevs/arns-marketplace-ui';
import { useAntsMetadata } from '@src/hooks/listings/useAntsMetadata';
import { useWalletState } from '@src/state';
import { getCurrentListingArioPrice } from '@src/utils/marketplace';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Props {
  listing: ListingEnglishDetails;
}

const EnglishListingPriceSection = ({ listing }: Props) => {
  const [bidPrice, setBidPrice] = useState<string>('');
  const navigate = useNavigate();
  const [{ walletAddress }] = useWalletState();
  const queryAntsMetadata = useAntsMetadata();

  const antMeta = queryAntsMetadata.data?.[listing.antProcessId];
  const currentPrice = getCurrentListingArioPrice(listing);
  const minBid = listing.highestBid
    ? Number(currentPrice) + 1
    : Number(currentPrice);
  const isBidPriceValid = Number(bidPrice) >= minBid;

  const navigateToConfirmPurchase = () => {
    const orderId = listing.orderId;
    const name = antMeta.name;
    const antProcessId = listing.antProcessId;

    navigate(
      `/listings/${orderId}/confirm-purchase?price=${bidPrice}&type=english&name=${name}&antProcessId=${antProcessId}`,
    );
  };

  useEffect(() => {
    if (antMeta) return;

    queryAntsMetadata.refetch();
  }, [antMeta, queryAntsMetadata]);

  return (
    <>
      <Input
        type="number"
        value={bidPrice}
        onChange={(e) => {
          setBidPrice(e.target.value);
        }}
        placeholder={`${minBid} and up`}
        label="Name your price"
        suffix="ARIO"
      />
      <Button
        variant="primary"
        className="w-full"
        disabled={
          !walletAddress ||
          !antMeta ||
          bidPrice === undefined ||
          // if highest bid exists, bid must be strictly greater than it
          // if no bids yet, bid must be at least equal to starting price
          !isBidPriceValid
        }
        onClick={() => {
          navigateToConfirmPurchase();
        }}
      >
        {!walletAddress
          ? 'No wallet'
          : isBidPriceValid
          ? 'Place bid'
          : 'Too small bid'}
      </Button>
    </>
  );
};

export default EnglishListingPriceSection;
