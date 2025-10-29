import { createAoSigner } from '@ar.io/sdk';
import { bidListing } from '@blockydevs/arns-marketplace-data';
import { useGlobalState, useWalletState } from '@src/state';
import { BLOCKYDEVS_MARKETPLACE_PROCESS_ID } from '@src/utils/marketplace';
import { useMutation } from '@tanstack/react-query';

export const useBidListing = (
  antProcessId: string | null,
  listingId: string | undefined,
) => {
  const [{ wallet, walletAddress }] = useWalletState();
  const [{ antAoClient, arioProcessId }] = useGlobalState();

  return useMutation({
    mutationFn: async ({ price }: { price: string }) => {
      if (!wallet || !walletAddress) {
        throw new Error('No wallet connected');
      }

      if (!wallet.contractSigner) {
        throw new Error('No wallet signer available');
      }

      if (!antProcessId) {
        throw new Error('antProcessId is missing');
      }

      if (!listingId) {
        throw new Error('listingId is missing');
      }

      return await bidListing({
        ao: antAoClient,
        orderId: listingId,
        bidPrice: price,
        marketplaceProcessId: BLOCKYDEVS_MARKETPLACE_PROCESS_ID,
        arioProcessId,
        antTokenId: antProcessId,
        walletAddress: walletAddress.toString(),
        signer: createAoSigner(wallet.contractSigner),
      });
    },
  });
};
