/**
 * TypeScript type definitions for Turbo SDK web upload
 *
 * IMPORTANT: The Turbo SDK (@ardrive/turbo-sdk/web) exports most types we need.
 * This file previously contained duplicated types that are now imported directly from the SDK.
 *
 * Types available from '@ardrive/turbo-sdk/web':
 * - TurboUploadDataItemResponse: Response from upload operations
 * - TurboUploadEventsAndPayloads: Event payloads including 'upload-progress', 'upload-error', 'upload-success'
 * - TurboUploadEmitterEventArgs: Event handler callbacks (onUploadProgress, onUploadError, onUploadSuccess)
 * - DataItemOptions: Options for data item creation (extends DataItemCreateOptions from @dha-team/arbundles)
 * - TurboUploadFileParams: Parameters for uploadFile method
 *
 * Tag type ({ name: string; value: string }) is defined inline in DataItemCreateOptions but not exported.
 * Components should define it inline when needed or extract it from DataItemCreateOptions.
 *
 * See /src/hooks/useUploadArNSLogo.tsx for an example of using SDK types directly.
 */

// Re-export commonly used SDK types for convenience
export type {
  TurboUploadDataItemResponse,
  TurboUploadEventsAndPayloads,
  DataItemOptions,
} from '@ardrive/turbo-sdk/web';
