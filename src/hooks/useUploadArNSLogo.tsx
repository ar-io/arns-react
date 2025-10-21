import {
  ArconnectSigner,
  TurboAuthenticatedClient,
  TurboFactory,
} from '@ardrive/turbo-sdk/web';
import { useWalletState } from '@src/state';
import { WALLET_TYPES } from '@src/types';
import { NETWORK_DEFAULTS } from '@src/utils/constants';
import { ethers } from 'ethers';
import { useCallback } from 'react';

const turboAuthenticatedDefaults = {
  paymentServiceConfig: {
    url: NETWORK_DEFAULTS.TURBO.PAYMENT_URL,
  },
  uploadServiceConfig: {
    url: NETWORK_DEFAULTS.TURBO.UPLOAD_URL,
  },
};

export function useUploadArNSLogo(image: File | null) {
  const [{ walletAddress }] = useWalletState();
  const walletType = window.localStorage.getItem('walletType');

  const handleTurboAuthenticatedInitialization = useCallback(
    async (
      walletType: WALLET_TYPES,
    ): Promise<TurboAuthenticatedClient | undefined> => {
      switch (walletType) {
        case WALLET_TYPES.WANDER:
        case WALLET_TYPES.ARWEAVE_APP: {
          const signer = new ArconnectSigner(window.arweaveWallet);
          return TurboFactory.authenticated({
            signer: signer,
            ...turboAuthenticatedDefaults,
          });
        }

        case WALLET_TYPES.ETHEREUM: {
          const ethersProvider = new ethers.BrowserProvider(window.ethereum);
          const ethersSigner = await ethersProvider.getSigner();
          return TurboFactory.authenticated({
            token: 'ethereum',
            walletAdapter: { getSigner: () => ethersSigner as any },
            ...turboAuthenticatedDefaults,
          });
        }

        //TO DO: add beacon
      }
    },
    [walletType, walletAddress],
  );

  const handleUploadArNSLogo = async () => {
    if (!image) return;
    try {
      const turbo = await handleTurboAuthenticatedInitialization(
        walletType as WALLET_TYPES,
      );

      if (!turbo) return;
      const uploadResult = await turbo.uploadFile({
        fileStreamFactory: () => image.stream() as any,
        fileSizeFactory: () => image.size,
        dataItemOpts: {
          tags: [
            {
              name: 'Image-Name',
              value: image.name,
            },
          ],
        },
      });
      return uploadResult.id;
    } catch (error) {
      throw new Error(`Failed to upload logo: ${error}`);
    }
  };

  return { handleUploadArNSLogo };
}
