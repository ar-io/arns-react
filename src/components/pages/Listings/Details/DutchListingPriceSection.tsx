import { ListingDutchDetails } from '@blockydevs/arns-marketplace-data';
import { Button } from '@blockydevs/arns-marketplace-ui';
import { useWalletState } from '@src/state';
import { getCurrentListingArioPrice } from '@src/utils/marketplace';
import { useNavigate } from 'react-router-dom';

interface Props {
  listing: ListingDutchDetails;
}

const DutchListingPriceSection = ({ listing }: Props) => {
  const navigate = useNavigate();
  const [{ walletAddress }] = useWalletState();

  const navigateToConfirmPurchase = () => {
    const orderId = listing.orderId;
    const name = listing.name;
    const antProcessId = listing.antProcessId;
    const currentPrice = getCurrentListingArioPrice(listing);

    navigate(
      `/listings/${orderId}/confirm-purchase?price=${currentPrice}&type=dutch&name=${name}&antProcessId=${antProcessId}`,
    );
  };

  return (
    <>
      {listing.status === 'active' && (
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
      )}
    </>
  );
};

export default DutchListingPriceSection;
