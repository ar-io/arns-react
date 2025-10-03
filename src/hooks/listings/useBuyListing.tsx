import { createAoSigner } from '@ar.io/sdk';
import { buyListing } from '@blockydevs/arns-marketplace-data';
import { useGlobalState, useWalletState } from '@src/state';
import {
  BLOCKYDEVS_MARKETPLACE_PROCESS_ID,
  BLOCKYDEVS_SWAP_TOKEN_ID,
} from '@src/utils/marketplace';
import { useMutation } from '@tanstack/react-query';

export const useBuyListing = (
  antProcessId: string | null,
  listingId: string | undefined,
  type: string | null,
) => {
  const [{ wallet, walletAddress }] = useWalletState();
  const [{ antAoClient }] = useGlobalState();

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

      if (type !== 'fixed' && type !== 'dutch') {
        throw new Error(`invalid listing type for buy: ${type}`);
      }

      return await buyListing({
        ao: antAoClient,
        orderId: listingId,
        price,
        marketplaceProcessId: BLOCKYDEVS_MARKETPLACE_PROCESS_ID,
        antTokenId: antProcessId,
        swapTokenId: BLOCKYDEVS_SWAP_TOKEN_ID,
        walletAddress: walletAddress.toString(),
        signer: createAoSigner(wallet.contractSigner),
        orderType: type,
      });
    },
  });
};
