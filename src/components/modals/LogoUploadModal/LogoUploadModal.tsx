import { CheckmarkIcon, CloseIcon, UploadIcon } from '@src/components/icons';
import ValidationInput from '@src/components/inputs/text/ValidationInput/ValidationInput';
import DialogModal from '@src/components/modals/DialogModal/DialogModal';
import { useUploadArNSLogo } from '@src/hooks/useUploadArNSLogo';
import { useGlobalState, useWalletState } from '@src/state';
import { VALIDATION_INPUT_TYPES } from '@src/types';
import { isArweaveTransactionID } from '@src/utils';
import { ARNS_TX_ID_ENTRY_REGEX, WRITE_OPTIONS } from '@src/utils/constants';
import eventEmitter from '@src/utils/events';
import {
  ALLOWED_IMAGE_TYPES,
  MAX_LOGO_SIZE,
  compressImage,
  createPreviewUrl,
  formatFileSize,
  getImageDimensionWarnings,
  getImageDimensions,
  validateImageFile,
} from '@src/utils/imageUtils';
import { Progress } from 'antd';
import { AlertCircleIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import './styles.css';

/**
 * Props for the LogoUploadModal component
 */
interface LogoUploadModalProps {
  /** Whether the modal is visible */
  show: boolean;
  /** Callback when modal is closed */
  onClose: () => void;
  /** Callback when logo is updated (via upload or txId), receives the transaction ID */
  onUpdateSuccess: (txId: string) => Promise<void>;
  /** Current logo transaction ID (if any) */
  currentLogoTxId?: string;
}

/**
 * Status of the upload process
 */
type UploadStatus =
  | 'idle'
  | 'validating'
  | 'compressing'
  | 'uploading'
  | 'confirming'
  | 'success'
  | 'error';

/**
 * Modal component for uploading ArNS logo images
 *
 * This component provides a drag-and-drop interface for uploading logo images to Arweave
 * using the Turbo upload service. It handles image validation, compression, and provides
 * real-time progress feedback.
 *
 * @param props - Component props
 * @returns The LogoUploadModal component
 */
function LogoUploadModal({
  show,
  onClose,
  onUpdateSuccess,
}: LogoUploadModalProps) {
  const [{ wallet }] = useWalletState();
  const [{ arweaveDataProvider }] = useGlobalState();
  const { uploadLogo } = useUploadArNSLogo();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [txId, setTxId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [manualTxId, setManualTxId] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  // Reset all modal state
  const resetModal = () => {
    setSelectedFile(null);
    setOriginalFile(null);
    setPreview(null);
    setUploadProgress(0);
    setUploadStatus('idle');
    setErrorMessage(null);
    setTxId(null);
    setIsDragging(false);
    setWarnings([]);
    setDimensions(null);
    setManualTxId('');
  };

  useEffect(() => {
    // Reset modal when it's closed
    if (!show) {
      resetModal();
    }
  }, [show]);

  useEffect(() => {
    // Cleanup preview URL on unmount
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleFileSelect = async (file: File) => {
    setErrorMessage(null);
    setWarnings([]);
    setUploadStatus('validating');
    setOriginalFile(file);
    setManualTxId(''); // Clear manual txId if file is selected

    try {
      // Validate file
      const validation = validateImageFile(file);
      if (!validation.valid) {
        setErrorMessage(validation.error || 'Invalid file');
        setUploadStatus('error');
        return;
      }

      const fileWarnings = validation.warnings || [];

      // Get dimensions
      try {
        const dims = await getImageDimensions(file);
        setDimensions(dims);
        const dimWarnings = getImageDimensionWarnings(dims);
        fileWarnings.push(...dimWarnings);
      } catch (error) {
        // Non-critical error, continue
        console.warn('Could not get image dimensions:', error);
      }

      // Check if compression is needed
      let finalFile = file;
      if (file.size > MAX_LOGO_SIZE) {
        setUploadStatus('compressing');
        try {
          finalFile = await compressImage(file, MAX_LOGO_SIZE);
          // Compression info will be shown in file details, not as a warning
        } catch (error) {
          setErrorMessage(
            error instanceof Error ? error.message : 'Failed to compress image',
          );
          setUploadStatus('error');
          return;
        }
      }

      setSelectedFile(finalFile);
      setWarnings(fileWarnings);
      setPreview(createPreviewUrl(finalFile));
      setUploadStatus('idle');
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to process image',
      );
      setUploadStatus('error');
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setOriginalFile(null);
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    setWarnings([]);
    setDimensions(null);
    setUploadStatus('idle');
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleManualTxIdSubmit = async () => {
    if (!manualTxId.trim()) {
      setErrorMessage('Please enter a transaction ID');
      return;
    }

    if (!isArweaveTransactionID(manualTxId)) {
      setErrorMessage('Logo must be a valid Arweave transaction ID');
      return;
    }

    setErrorMessage(null);
    setUploadStatus('confirming');
    try {
      await onUpdateSuccess(manualTxId);
      // Success - modal will be closed by parent component
    } catch (error) {
      setUploadStatus('error');
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Failed to confirm logo update',
      );
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setErrorMessage('No file selected');
      return;
    }

    if (!wallet) {
      setErrorMessage('Wallet not connected');
      return;
    }

    setUploadStatus('uploading');
    setUploadProgress(0);
    setErrorMessage(null);

    try {
      // Prepare tags
      const tags = [
        ...WRITE_OPTIONS.tags,
        { name: 'Content-Type', value: selectedFile.type },
        { name: 'ArNS-Logo', value: 'true' },
      ];

      // Upload using the hook
      const transactionId = await uploadLogo({
        file: selectedFile,
        tags,
        onProgress: ({ totalBytes, processedBytes }) => {
          const progress = Math.round((processedBytes / totalBytes) * 100);
          setUploadProgress(progress);
        },
        onError: (error) => {
          console.error('Upload error:', error);
          // Error propagation is handled by uploadLogo
        },
        onSuccess: () => {
          console.log('Upload success!');
        },
      });

      setTxId(transactionId);
      setUploadStatus('confirming');

      // Auto-save: trigger SET_LOGO interaction
      try {
        await onUpdateSuccess(transactionId);
        setUploadStatus('success');
        // Success - modal will be closed by parent component
      } catch (confirmError) {
        console.error('Confirmation failed:', confirmError);
        setUploadStatus('error');
        setErrorMessage(
          confirmError instanceof Error
            ? confirmError.message
            : 'Failed to confirm logo on-chain',
        );
        // Global error emission is handled by parent component
      }
    } catch (error) {
      console.error('Upload failed:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Upload failed');
      setUploadStatus('error');
      eventEmitter.emit('error', error);
    }
  };

  const handleClose = () => {
    if (uploadStatus === 'uploading' || uploadStatus === 'confirming') {
      const action = uploadStatus === 'uploading' ? 'Upload' : 'Confirmation';
      if (
        window.confirm(`${action} in progress. Are you sure you want to close?`)
      ) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  if (!show) return null;

  // Success state modal
  if (uploadStatus === 'success' && txId) {
    return (
      <div className="modal-container">
        <DialogModal
          title={<h2 className="white text-xl">Update Logo</h2>}
          body={
            <div className="flex flex-col gap-3 p-4 rounded bg-card-bg border border-primary">
              <div className="flex items-center gap-2 text-primary">
                <CheckmarkIcon
                  width="20px"
                  height="20px"
                  fill="var(--primary)"
                />
                <span className="font-medium">Upload Successful!</span>
              </div>
              <div className="flex flex-col gap-1 text-sm">
                <span className="text-grey">Transaction ID:</span>
                <span className="text-white font-mono text-xs break-all">
                  {txId}
                </span>
              </div>
              <div className="text-sm text-grey">
                Logo has been set for your ANT.
              </div>
            </div>
          }
          onClose={onClose}
          onNext={onClose}
          nextText="Done"
          showFooterBorder={true}
        />
      </div>
    );
  }

  // Upload flow modal
  return (
    <div className="modal-container">
      <DialogModal
        title={<h2 className="white text-xl">Update Logo</h2>}
        body={
          <div className="flex flex-col gap-4" style={{ maxWidth: '40rem' }}>
            {/* Error State */}
            {uploadStatus === 'error' && errorMessage && (
              <div className="flex items-start gap-2 p-4 rounded bg-error-thin border border-error text-error">
                <AlertCircleIcon className="size-5 flex-shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <span className="font-medium">Error</span>
                  <span className="text-sm">{errorMessage}</span>
                </div>
              </div>
            )}

            {/* Drag and Drop Zone */}
            {!selectedFile && (
              <div
                className={`logo-upload-dropzone ${
                  isDragging ? 'dragging' : ''
                }`}
                role="button"
                tabIndex={0}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
              >
                <UploadIcon
                  width="40px"
                  height="40px"
                  fill="var(--text-grey)"
                  className="mb-3"
                />
                <span className="text-white font-medium mb-2">
                  Drop image here or click to browse
                </span>
                <span className="text-grey text-sm mb-3">
                  Supported: PNG, JPEG, GIF, SVG, WebP
                </span>
                <span className="text-grey text-sm">
                  Max size: 100 KiB (free)
                </span>
                <span className="text-grey text-xs mt-1">
                  Recommended: Square, &lt; 1000px
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ALLOWED_IMAGE_TYPES.join(',')}
                  onChange={handleInputChange}
                  style={{ display: 'none' }}
                  aria-label="Upload logo image file"
                />
              </div>
            )}

            {/* File Preview */}
            {selectedFile && (
              <div className="flex flex-col gap-3">
                <div className="flex gap-4 p-4 rounded bg-card-bg border border-dark-grey">
                  {/* Preview Image */}
                  {preview && (
                    <div className="flex-shrink-0">
                      <img
                        src={preview}
                        alt="Logo preview"
                        className="w-20 h-20 object-contain rounded border border-dark-grey bg-background"
                      />
                    </div>
                  )}

                  {/* File Info */}
                  <div className="flex flex-col gap-1 flex-grow">
                    <span className="text-white font-medium text-sm truncate">
                      {selectedFile.name}
                    </span>
                    <span className="text-grey text-xs">
                      {formatFileSize(originalFile?.size || selectedFile.size)}
                    </span>
                    {dimensions && dimensions.width > 0 && (
                      <span className="text-grey text-xs">
                        {dimensions.width} × {dimensions.height}
                      </span>
                    )}
                    {originalFile &&
                      originalFile.size !== selectedFile.size && (
                        <span className="text-primary text-xs">
                          Compressed from {formatFileSize(originalFile.size)} to{' '}
                          {formatFileSize(selectedFile.size)}
                        </span>
                      )}
                  </div>

                  {/* Remove Button */}
                  {uploadStatus === 'idle' && (
                    <button
                      onClick={handleRemoveFile}
                      className="flex-shrink-0 self-start p-1 rounded hover:bg-background transition-colors"
                    >
                      <CloseIcon
                        width="16px"
                        height="16px"
                        fill="var(--text-grey)"
                      />
                    </button>
                  )}
                </div>

                {/* Warnings */}
                {warnings.length > 0 && (
                  <div className="flex flex-col gap-2 p-3 rounded bg-card-bg border border-dark-grey">
                    {warnings.map((warning, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-2 text-xs text-grey"
                      >
                        <AlertCircleIcon className="size-4 flex-shrink-0 mt-0.5" />
                        <span>{warning}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* OR Divider - only show when no file is selected and not uploading */}
            {!selectedFile && uploadStatus === 'idle' && (
              <div className="flex items-center gap-4 my-4">
                <div className="flex-1 border-t border-dark-grey"></div>
                <span className="text-grey text-sm">OR</span>
                <div className="flex-1 border-t border-dark-grey"></div>
              </div>
            )}

            {/* Manual Transaction ID Input - only show when no file is selected and not uploading */}
            {!selectedFile && uploadStatus === 'idle' && (
              <div className="flex flex-col gap-2">
                <span className="text-sm text-grey">
                  Use existing Arweave transaction:
                </span>
                <div className="flex items-center gap-2">
                  <ValidationInput
                    customPattern={ARNS_TX_ID_ENTRY_REGEX}
                    catchInvalidInput={true}
                    showValidationIcon={true}
                    onPressEnter={handleManualTxIdSubmit}
                    wrapperClassName="flex w-full"
                    inputClassName="flex w-full"
                    inputCustomStyle={{
                      background: 'var(--card-bg)',
                      borderRadius: 'var(--corner-radius)',
                      border: '1px solid var(--text-faded)',
                      padding: '8px',
                      color: 'var(--text-white)',
                    }}
                    placeholder="Enter transaction ID"
                    value={manualTxId}
                    setValue={(e) => setManualTxId(e)}
                    validationPredicates={{
                      [VALIDATION_INPUT_TYPES.ARWEAVE_ID]: {
                        fn: (id: string) =>
                          arweaveDataProvider.validateArweaveId(id),
                      },
                    }}
                    maxCharLength={(str) => str.length <= 43}
                  />
                </div>
              </div>
            )}

            {/* Upload Progress */}
            {uploadStatus === 'uploading' && (
              <div className="flex flex-col gap-2">
                <Progress
                  percent={uploadProgress}
                  strokeColor="var(--primary)"
                  trailColor="var(--card-bg)"
                  showInfo={false}
                />
                <span className="text-sm text-grey text-center">
                  Uploading... {uploadProgress}%
                </span>
              </div>
            )}

            {/* Processing States */}
            {(uploadStatus === 'validating' ||
              uploadStatus === 'compressing' ||
              uploadStatus === 'confirming') && (
              <div className="flex items-center justify-center gap-2 p-4 text-grey">
                <div className="animate-spin">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
                </div>
                <span>
                  {uploadStatus === 'validating' && 'Validating image...'}
                  {uploadStatus === 'compressing' && 'Compressing image...'}
                  {uploadStatus === 'confirming' &&
                    'Confirming logo on-chain...'}
                </span>
              </div>
            )}
          </div>
        }
        onClose={
          uploadStatus === 'uploading' || uploadStatus === 'confirming'
            ? undefined
            : handleClose
        }
        onCancel={
          uploadStatus === 'uploading' || uploadStatus === 'confirming'
            ? undefined
            : handleClose
        }
        onNext={
          uploadStatus === 'idle'
            ? selectedFile
              ? handleUpload
              : manualTxId && isArweaveTransactionID(manualTxId)
                ? handleManualTxIdSubmit
                : undefined
            : undefined
        }
        cancelText="Cancel"
        nextText={selectedFile ? 'Upload' : 'Set Logo'}
        showFooterBorder={true}
      />
    </div>
  );
}

export default LogoUploadModal;
