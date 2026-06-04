/**
 * Custom hook for uploading ArNS logo images to Arweave via Turbo
 *
 * This hook provides functionality to upload logo images for ArNS domains using the Turbo upload service.
 * It handles wallet authentication and provides progress tracking through event callbacks.
 * Solana-only after the de-AO refactor — uses the Solana Wallet Adapter via TurboFactory.
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
import {
  TurboFactory,
  type TurboUploadDataItemResponse,
  type TurboUploadEventsAndPayloads,
} from '@ardrive/turbo-sdk/web';
import { useGlobalState, useWalletState } from '@src/state';

/**
 * Tag for Arweave data items
 * Note: Using inline type from DataItemCreateOptions since Tag type is not exported by SDK
 */
type Tag = { name: string; value: string };

/**
 * Progress information for file upload
 */
type UploadProgress = TurboUploadEventsAndPayloads['upload-progress'];

/**
 * Turbo authenticated client interface with web-specific uploadFile method
 * Note: This type is needed because the runtime signature differs from the SDK's Node.js types
 */
interface TurboWebAuthenticatedClient {
  uploadFile: (params: {
    file: File;
    dataItemOpts?: { tags?: Tag[] };
    events?: {
      onUploadProgress?: (progress: UploadProgress) => void;
      onUploadError?: (error: Error) => void;
      onUploadSuccess?: () => void;
    };
  }) => Promise<TurboUploadDataItemResponse>;
}

/**
 * Parameters for uploading a logo
 */
export interface UploadLogoParams {
  /** File to upload */
  file: File;
  /** Tags to attach to the upload */
  tags: Tag[];
  /** Progress callback */
  onProgress?: (progress: UploadProgress) => void;
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

    // Create authenticated Turbo client with proper configuration based on wallet type
    // Cast to TurboWebAuthenticatedClient to access web-specific uploadFile method
    let turbo: TurboWebAuthenticatedClient;

    if (wallet.tokenType !== 'solana') {
      throw new Error(
        `Logo uploads are only supported for Solana wallets (received '${wallet.tokenType}')`,
      );
    }

    const solanaWalletAdapter =
      (window as any).solana ?? (wallet as any).solanaWallet ?? undefined;
    if (!solanaWalletAdapter) {
      throw new Error(
        'Solana wallet adapter not available on window.solana — connect a Phantom/Solflare-class wallet first.',
      );
    }

    turbo = TurboFactory.authenticated({
      walletAdapter: solanaWalletAdapter,
      token: 'solana',
      uploadServiceConfig: {
        url: turboNetwork.UPLOAD_URL,
      },
      paymentServiceConfig: {
        url: turboNetwork.PAYMENT_URL,
      },
      gatewayUrl: turboNetwork.GATEWAY_URL,
    } as any) as unknown as TurboWebAuthenticatedClient;

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
