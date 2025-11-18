/**
 * Custom hook for uploading ArNS logo images to Arweave via Turbo
 *
 * This hook provides functionality to upload logo images for ArNS domains using the Turbo upload service.
 * It handles wallet authentication and provides progress tracking through event callbacks.
 *
 * @returns An object containing the upload function
 *
 * @example
 * ```typescript
 * const { uploadLogo } = useUploadArNSLogo();
 *
 * const txId = await uploadLogo({
 *   file: selectedFile,
 *   tags: [{ name: 'Content-Type', value: 'image/png' }],
 *   onProgress: (progress) => setProgress(progress),
 *   onError: (error) => handleError(error),
 *   onSuccess: () => console.log('Upload complete!')
 * });
 * ```
 */
import { ArconnectSigner, TurboFactory } from '@ardrive/turbo-sdk/web';
import { useGlobalState, useWalletState } from '@src/state';
import type {
  ArweaveTag,
  TurboUploadProgress,
  TurboWebAuthenticatedClient,
} from '@src/types/turbo';

/**
 * Parameters for uploading a logo
 */
export interface UploadLogoParams {
  /** File to upload */
  file: File;
  /** Tags to attach to the upload */
  tags: ArweaveTag[];
  /** Progress callback */
  onProgress?: (progress: TurboUploadProgress) => void;
  /** Error callback */
  onError?: (error: Error) => void;
  /** Success callback */
  onSuccess?: () => void;
}

/**
 * Return type for the useUploadArNSLogo hook
 */
export interface UseUploadArNSLogoReturn {
  /**
   * Upload a logo file to Arweave
   * @param params - Upload parameters
   * @returns Promise resolving to the transaction ID
   * @throws Error if wallet is not connected or upload fails
   */
  uploadLogo: (params: UploadLogoParams) => Promise<string>;
}

/**
 * Hook for uploading ArNS logo images
 */
export function useUploadArNSLogo(): UseUploadArNSLogoReturn {
  const [{ wallet }] = useWalletState();
  const [{ turboNetwork }] = useGlobalState();

  /**
   * Upload a logo file to Arweave via Turbo
   */
  const uploadLogo = async ({
    file,
    tags,
    onProgress,
    onError,
    onSuccess,
  }: UploadLogoParams): Promise<string> => {
    if (!wallet) {
      throw new Error('Wallet not connected');
    }

    // For Arweave wallets (Wander/ArConnect), create ArconnectSigner from Turbo SDK
    // This is the correct pattern per the Turbo gateway app
    if (!window.arweaveWallet) {
      throw new Error('Arweave wallet not available');
    }

    const signer = new ArconnectSigner(window.arweaveWallet);

    // Create authenticated Turbo client with proper configuration
    // Cast to TurboWebAuthenticatedClient to access web-specific uploadFile method
    const turbo = TurboFactory.authenticated({
      signer,
      token: wallet.tokenType,
      uploadServiceConfig: {
        url: turboNetwork.UPLOAD_URL,
      },
      paymentServiceConfig: {
        url: turboNetwork.PAYMENT_URL,
      },
      gatewayUrl: turboNetwork.GATEWAY_URL,
    }) as unknown as TurboWebAuthenticatedClient;

    // Upload file - pass File object directly (works in Turbo SDK web)
    try {
      const uploadResult = await turbo.uploadFile({
        file: file,
        dataItemOpts: {
          tags,
        },
        events: {
          onUploadProgress: onProgress
            ? ({ totalBytes, processedBytes }) => {
                onProgress({ totalBytes, processedBytes });
              }
            : undefined,
          onUploadError: onError,
          onUploadSuccess: onSuccess,
        },
      });

      return uploadResult.id;
    } catch (error) {
      // Call error callback if provided
      if (onError && error instanceof Error) {
        onError(error);
      }
      // Re-throw to allow caller to handle the error as well
      throw error;
    }
  };

  return { uploadLogo };
}
