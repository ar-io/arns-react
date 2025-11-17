/**
 * TypeScript type definitions for Turbo SDK web upload
 * These types provide type safety for the Turbo upload operations in web environments
 *
 * Note: The Turbo SDK doesn't export these types for the web-specific uploadFile method,
 * so we define them here based on the SDK's expected interface.
 */
import type { TurboUploadDataItemResponse } from '@ardrive/turbo-sdk/web';

/**
 * Progress information for file upload
 */
export interface TurboUploadProgress {
  /** Total size of the file in bytes */
  totalBytes: number;
  /** Number of bytes processed so far */
  processedBytes: number;
}

/**
 * Event handlers for Turbo upload operations (web-specific)
 */
export interface TurboUploadEvents {
  /** Called periodically during upload with progress information */
  onUploadProgress?: (progress: TurboUploadProgress) => void;
  /** Called if an error occurs during upload */
  onUploadError?: (error: Error) => void;
  /** Called when upload completes successfully */
  onUploadSuccess?: () => void;
}

/**
 * Tag for Arweave data items
 */
export interface ArweaveTag {
  /** Tag name */
  name: string;
  /** Tag value */
  value: string;
}

/**
 * Options for data item creation during upload
 */
export interface TurboDataItemOptions {
  /** Tags to attach to the uploaded data */
  tags?: ArweaveTag[];
}

/**
 * Parameters for uploading a file via Turbo (web environment)
 */
export interface TurboWebUploadFileParams {
  /** File to upload */
  file: File;
  /** Options for the data item */
  dataItemOpts?: TurboDataItemOptions;
  /** Event handlers for upload lifecycle */
  events?: TurboUploadEvents;
}

/**
 * Turbo authenticated client interface with web-specific uploadFile method
 * Note: This is a structural type that represents the runtime shape of TurboAuthenticatedClient
 * in web environments, which differs from the Node.js signature in the type definitions
 */
export interface TurboWebAuthenticatedClient {
  /** Upload a file to Arweave via Turbo (web-specific signature) */
  uploadFile: (
    params: TurboWebUploadFileParams,
  ) => Promise<TurboUploadDataItemResponse>;
}
