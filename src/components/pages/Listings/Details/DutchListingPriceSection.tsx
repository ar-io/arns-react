import { ListingDutchDetails } from '@blockydevs/arns-marketplace-data';
import { Button } from '@blockydevs/arns-marketplace-ui';
import { useAntsMetadata } from '@src/hooks/listings/useAntsMetadata';
import { useWalletState } from '@src/state';
import { getCurrentListingArioPrice } from '@src/utils/marketplace';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Props {
  listing: ListingDutchDetails;
}

const DutchListingPriceSection = ({ listing }: Props) => {
  const navigate = useNavigate();
  const [{ walletAddress }] = useWalletState();
  const queryAntsMetadata = useAntsMetadata();

  const antMeta = queryAntsMetadata.data?.[listing.antProcessId];

  const getLabel = () => {
    if (!walletAddress) return 'No wallet';
    if (!antMeta) return 'No metadata';
    return antMeta.ownershipType === 'lease' ? 'Lease now' : 'Buy now';
  };

  const navigateToConfirmPurchase = () => {
    if (!antMeta) return;

    const orderId = listing.orderId;
    const name = antMeta.name;
    const antProcessId = listing.antProcessId;
    const currentPrice = getCurrentListingArioPrice(listing);

    const params = new URLSearchParams({
      price: String(currentPrice),
      type: 'dutch',
      name,
      antProcessId,
    }).toString();
    navigate(`/listings/${orderId}/confirm-purchase?${params}`);
  };

  useEffect(() => {
    if (antMeta) return;

    queryAntsMetadata.refetch();
  }, [antMeta, queryAntsMetadata]);

  return (
    <>
      {listing.status === 'active' && (
        <Button
          variant="primary"
          className="w-full"
          disabled={!walletAddress || !antMeta}
          onClick={() => {
            navigateToConfirmPurchase();
          }}
        >
          {getLabel()}
        </Button>
      )}
    </>
  );
};

export default DutchListingPriceSection;
