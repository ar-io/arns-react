/**
 * Maximum allowed logo file size in bytes (100 KiB)
 * Files larger than this will be automatically compressed
 */
export const MAX_LOGO_SIZE = 100 * 1024; // 100 KiB

/**
 * Recommended maximum logo file size in bytes (50 KiB)
 * Files larger than this but under MAX_LOGO_SIZE will show a warning
 */
export const RECOMMENDED_MAX_SIZE = 50 * 1024; // 50 KiB

/**
 * Recommended maximum image dimension in pixels
 * Images larger than this will show a warning
 */
export const RECOMMENDED_MAX_DIMENSION = 1000;

/**
 * List of allowed MIME types for logo images
 */
export const ALLOWED_IMAGE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/gif',
  'image/svg+xml',
  'image/webp',
];

/**
 * Result of image file validation
 */
export interface ImageValidationResult {
  /** Whether the file is valid */
  valid: boolean;
  /** Error message if validation failed */
  error?: string;
  /** Warning messages for non-critical issues */
  warnings?: string[];
}

/**
 * Image dimensions in pixels
 */
export interface ImageDimensions {
  /** Image width in pixels (0 for SVG files) */
  width: number;
  /** Image height in pixels (0 for SVG files) */
  height: number;
}

/**
 * Validates an image file for type and size requirements
 *
 * Checks if the file type is supported and provides warnings for files
 * that exceed recommended size limits.
 *
 * @param file - The image file to validate
 * @returns Validation result with validity status, errors, and warnings
 *
 * @example
 * ```typescript
 * const result = validateImageFile(selectedFile);
 * if (!result.valid) {
 *   console.error(result.error);
 * } else if (result.warnings) {
 *   console.warn(result.warnings);
 * }
 * ```
 */
export function validateImageFile(file: File): ImageValidationResult {
  const warnings: string[] = [];

  // Check file type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please use PNG, JPEG, GIF, SVG, or WebP.',
    };
  }

  // Validation passed - warnings will be shown after compression if needed
  return {
    valid: true,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

/**
 * Extracts the dimensions (width and height) from an image file
 *
 * Uses the browser's Image API to load the file and extract its natural dimensions.
 * SVG files return dimensions of 0x0 since they don't have intrinsic dimensions.
 *
 * @param file - The image file to measure
 * @returns Promise resolving to the image dimensions
 * @throws Error if the image fails to load
 *
 * @example
 * ```typescript
 * try {
 *   const dims = await getImageDimensions(imageFile);
 *   console.log(`Image is ${dims.width}x${dims.height}`);
 * } catch (error) {
 *   console.error('Could not load image:', error);
 * }
 * ```
 */
export async function getImageDimensions(file: File): Promise<ImageDimensions> {
  return new Promise((resolve, reject) => {
    // SVG files don't have intrinsic dimensions, skip
    if (file.type === 'image/svg+xml') {
      resolve({ width: 0, height: 0 });
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

/**
 * Compresses an image file to fit within a target size
 *
 * Uses the Canvas API to iteratively compress images by adjusting quality and dimensions.
 * PNG images are converted to JPEG for better compression. SVG and GIF files are returned
 * unchanged as they cannot be easily compressed. The algorithm tries multiple quality levels
 * and will reduce dimensions if needed to achieve the target size.
 *
 * @param file - The image file to compress
 * @param maxSizeBytes - Maximum allowed file size in bytes (default: MAX_LOGO_SIZE)
 * @returns Promise resolving to the compressed file
 * @throws Error if compression fails or target size cannot be achieved
 *
 * @example
 * ```typescript
 * try {
 *   const compressed = await compressImage(largeFile, 100 * 1024);
 *   console.log(`Compressed from ${largeFile.size} to ${compressed.size} bytes`);
 * } catch (error) {
 *   console.error('Compression failed:', error);
 * }
 * ```
 */
export async function compressImage(
  file: File,
  maxSizeBytes: number = MAX_LOGO_SIZE,
): Promise<File> {
  // SVG and GIF can't be compressed easily, return as-is
  if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
    return file;
  }

  // If already under size, return original
  if (file.size <= maxSizeBytes) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = async () => {
      URL.revokeObjectURL(url);

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      let width = img.naturalWidth;
      let height = img.naturalHeight;

      // If image is very large, scale down dimensions first
      const maxDimension = 2000;
      if (width > maxDimension || height > maxDimension) {
        const ratio = Math.min(maxDimension / width, maxDimension / height);
        width = Math.floor(width * ratio);
        height = Math.floor(height * ratio);
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      // Try different quality levels
      let quality = 0.9;
      let blob: Blob | null = null;
      let attempts = 0;
      const maxAttempts = 10;

      while (attempts < maxAttempts) {
        blob = await new Promise<Blob | null>((res) => {
          canvas.toBlob(
            (b) => res(b),
            file.type === 'image/png' ? 'image/jpeg' : file.type,
            quality,
          );
        });

        if (!blob) {
          reject(new Error('Failed to compress image'));
          return;
        }

        // Check if we've achieved target size
        if (blob.size <= maxSizeBytes) {
          break;
        }

        // Reduce quality for next attempt
        quality -= 0.1;
        attempts++;

        // If quality gets too low, try reducing dimensions
        if (quality < 0.5 && width > 500 && height > 500) {
          width = Math.floor(width * 0.8);
          height = Math.floor(height * 0.8);
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          quality = 0.9; // Reset quality for new dimensions
        }
      }

      if (!blob || blob.size > maxSizeBytes) {
        reject(
          new Error(
            `Unable to compress image below ${
              maxSizeBytes / 1024
            } KiB. Please use a smaller image.`,
          ),
        );
        return;
      }

      // Convert blob to File
      const compressedFile = new File(
        [blob],
        file.name.replace(/\.(png|jpg|jpeg)$/i, '.jpg'),
        {
          type: blob.type,
          lastModified: Date.now(),
        },
      );

      resolve(compressedFile);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for compression'));
    };

    img.src = url;
  });
}

/**
 * Creates a temporary URL for previewing an image file
 *
 * Uses URL.createObjectURL to create a blob URL that can be used in img src attributes.
 * Remember to revoke the URL when done using URL.revokeObjectURL() to prevent memory leaks.
 *
 * @param file - The image file to create a preview URL for
 * @returns A blob URL string that can be used as an image source
 *
 * @example
 * ```typescript
 * const previewUrl = createPreviewUrl(imageFile);
 * setImageSrc(previewUrl);
 *
 * // Later, cleanup:
 * URL.revokeObjectURL(previewUrl);
 * ```
 */
export function createPreviewUrl(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * Generates warning messages for image dimensions
 *
 * Checks if the image dimensions exceed recommendations and if the aspect ratio is non-square.
 * Square logos (1:1 aspect ratio) are recommended for best display in most contexts.
 *
 * @param dimensions - The image dimensions to check
 * @returns Array of warning messages (empty if no warnings)
 *
 * @example
 * ```typescript
 * const warnings = getImageDimensionWarnings({ width: 2000, height: 1000 });
 * warnings.forEach(warning => console.warn(warning));
 * // Output: "Large dimensions (2000x1000). Consider using a smaller image."
 * //         "Non-square image. Square logos (1:1 ratio) are recommended..."
 * ```
 */
export function getImageDimensionWarnings(
  dimensions: ImageDimensions,
): string[] {
  const warnings: string[] = [];

  if (dimensions.width === 0 && dimensions.height === 0) {
    // SVG file, no warnings
    return warnings;
  }

  // Check if very large
  if (
    dimensions.width > RECOMMENDED_MAX_DIMENSION ||
    dimensions.height > RECOMMENDED_MAX_DIMENSION
  ) {
    warnings.push(
      `Large dimensions (${dimensions.width}x${dimensions.height}). Consider using a smaller image.`,
    );
  }

  // Check aspect ratio (recommend square)
  const aspectRatio = dimensions.width / dimensions.height;
  if (aspectRatio > 2 || aspectRatio < 0.5) {
    warnings.push(
      'Non-square image. Square logos (1:1 ratio) are recommended for best display.',
    );
  }

  return warnings;
}

/**
 * Formats a file size in bytes to a human-readable string
 *
 * Converts bytes to either bytes (B) or kibibytes (KiB) with one decimal place.
 *
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "1.5 KiB" or "512 B")
 *
 * @example
 * ```typescript
 * formatFileSize(1536);  // "1.5 KiB"
 * formatFileSize(512);   // "512 B"
 * formatFileSize(102400); // "100.0 KiB"
 * ```
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  return `${(bytes / 1024).toFixed(1)} KiB`;
}
