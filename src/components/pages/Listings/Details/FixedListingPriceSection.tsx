import { ListingFixedDetails } from '@blockydevs/arns-marketplace-data';
import { Button } from '@blockydevs/arns-marketplace-ui';
import { useWalletState } from '@src/state';
import { getCurrentListingArioPrice } from '@src/utils/marketplace';
import { useNavigate } from 'react-router-dom';

interface Props {
  listing: ListingFixedDetails;
}

const FixedListingPriceSection = ({ listing }: Props) => {
  const navigate = useNavigate();
  const [{ walletAddress }] = useWalletState();

  const navigateToConfirmPurchase = () => {
    const orderId = listing.orderId;
    const name = listing.name;
    const antProcessId = listing.antProcessId;
    const currentPrice = getCurrentListingArioPrice(listing);

    const params = new URLSearchParams({
      price: String(currentPrice),
      type: 'fixed',
      name,
      antProcessId,
    }).toString();
    navigate(`/listings/${orderId}/confirm-purchase?${params}`);
  };

  return (
    <Button
      variant="primary"
      className="w-full"
      disabled={!walletAddress}
      onClick={() => {
        navigateToConfirmPurchase();
      }}
    >
      {!walletAddress ? 'No wallet' : 'Buy now'}
    </Button>
  );
};

export default FixedListingPriceSection;
