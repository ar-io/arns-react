import { createAoSigner } from '@ar.io/sdk';
import {
  ListingEnglishDetails,
  settleListing,
} from '@blockydevs/arns-marketplace-data';
import { Button } from '@blockydevs/arns-marketplace-ui';
import { useGlobalState, useWalletState } from '@src/state';
import eventEmitter from '@src/utils/events';
import {
  BLOCKYDEVS_MARKETPLACE_PROCESS_ID,
  marketplaceQueryKeys,
} from '@src/utils/marketplace';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface Props {
  listing: ListingEnglishDetails;
}

const EnglishListingSettlementSection = ({ listing }: Props) => {
  const queryClient = useQueryClient();
  const [{ aoClient }] = useGlobalState();
  const [{ wallet, walletAddress }] = useWalletState();

  const mutationSettleListing = useMutation({
    mutationFn: async ({ listingId }: { listingId: string }) => {
      if (!wallet || !walletAddress) {
        throw new Error('No wallet connected');
      }

      if (!wallet.contractSigner) {
        throw new Error('No wallet signer available');
      }

      return await settleListing({
        ao: aoClient,
        orderId: listingId,
        marketplaceProcessId: BLOCKYDEVS_MARKETPLACE_PROCESS_ID,
        signer: createAoSigner(wallet.contractSigner),
      });
    },
  });

  if (!walletAddress || listing.highestBidder !== walletAddress.toString()) {
    return null;
  }

  return (
    <Button
      variant="primary"
      className="w-full"
      disabled={
        mutationSettleListing.isPending || mutationSettleListing.isSuccess
      }
      onClick={() => {
        mutationSettleListing.mutate(
          {
            listingId: listing.orderId,
          },
          {
            onError: (error) => {
              eventEmitter.emit('error', {
                name: 'Failed to settle listing',
                message: error.message,
              });
            },
            onSuccess: async (data) => {
              console.log(`settlement success`, { data });
              void Promise.allSettled([
                queryClient.refetchQueries({
                  queryKey: [marketplaceQueryKeys.listings.all],
                }),
                queryClient.refetchQueries({
                  queryKey: [marketplaceQueryKeys.myANTs.all],
                }),
              ]);
            },
          },
        );
      }}
    >
      {mutationSettleListing.isPending
        ? 'Settling...'
        : mutationSettleListing.isSuccess
        ? 'Settled successfully'
        : 'Settle now (You won)'}
    </Button>
  );
};

export default EnglishListingSettlementSection;
