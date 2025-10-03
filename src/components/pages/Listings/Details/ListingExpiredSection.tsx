import { createAoSigner } from '@ar.io/sdk';
import {
  ListingDetails,
  cancelListing,
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
  listing: Extract<ListingDetails, { status: 'expired' }>;
}

const ListingExpiredSection = ({ listing }: Props) => {
  const [{ aoClient }] = useGlobalState();
  const [{ wallet, walletAddress }] = useWalletState();
  const queryClient = useQueryClient();

  const mutationCancelListing = useMutation({
    mutationFn: async ({ listingId }: { listingId: string }) => {
      if (!wallet || !walletAddress) {
        throw new Error('No wallet connected');
      }

      if (!wallet.contractSigner) {
        throw new Error('No wallet signer available');
      }

      return await cancelListing({
        ao: aoClient,
        orderId: listingId,
        marketplaceProcessId: BLOCKYDEVS_MARKETPLACE_PROCESS_ID,
        signer: createAoSigner(wallet.contractSigner),
      });
    },
  });

  // FIXME: order may be already cancelled
  if (listing.sender !== walletAddress?.toString()) {
    return null;
  }

  return (
    <Button
      variant="primary"
      className="px-0"
      disabled={
        mutationCancelListing.isPending || mutationCancelListing.isSuccess
      }
      onClick={() => {
        mutationCancelListing.mutate(
          {
            listingId: listing.orderId,
          },
          {
            onError: (error) => {
              eventEmitter.emit('error', {
                name: 'Failed to cancel listing',
                message: error.message,
              });
            },
            onSuccess: async (data) => {
              console.log(`cancel success`, { data });
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
      {mutationCancelListing.isPending
        ? 'Processing...'
        : mutationCancelListing.isSuccess
        ? 'Return submitted'
        : 'Get your ANT back'}
    </Button>
  );
};

export default ListingExpiredSection;
