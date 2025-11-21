/**
 * Unit tests for image utility functions
 */
import {
  ALLOWED_IMAGE_TYPES,
  MAX_LOGO_SIZE,
  RECOMMENDED_MAX_DIMENSION,
  RECOMMENDED_MAX_SIZE,
  compressImage,
  createPreviewUrl,
  formatFileSize,
  getImageDimensionWarnings,
  getImageDimensions,
  validateImageFile,
} from './imageUtils';

describe('imageUtils', () => {
  describe('validateImageFile', () => {
    it('should accept valid PNG file', () => {
      const file = new File(['test'], 'test.png', { type: 'image/png' });
      const result = validateImageFile(file);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should accept valid JPEG file', () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const result = validateImageFile(file);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should accept valid WebP file', () => {
      const file = new File(['test'], 'test.webp', { type: 'image/webp' });
      const result = validateImageFile(file);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should accept valid SVG file', () => {
      const file = new File(['test'], 'test.svg', { type: 'image/svg+xml' });
      const result = validateImageFile(file);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject invalid file type', () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      const result = validateImageFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid file type');
    });

    it('should accept files larger than recommended size without warnings', () => {
      const largeContent = new Array(RECOMMENDED_MAX_SIZE + 1024)
        .fill('a')
        .join('');
      const file = new File([largeContent], 'large.png', { type: 'image/png' });
      const result = validateImageFile(file);
      expect(result.valid).toBe(true);
      // No warnings - file size handling is done in the upload modal
      expect(result.warnings).toBeUndefined();
    });

    it('should reject files exceeding max size', () => {
      const veryLargeContent = new Array(MAX_LOGO_SIZE + 1024)
        .fill('a')
        .join('');
      const file = new File([veryLargeContent], 'very-large.png', {
        type: 'image/png',
      });
      const result = validateImageFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('exceeds maximum allowed size');
      expect(result.error).toContain('100 KiB');
    });

    it('should not warn for small files', () => {
      const smallContent = 'small image content';
      const file = new File([smallContent], 'small.png', { type: 'image/png' });
      const result = validateImageFile(file);
      expect(result.valid).toBe(true);
      expect(result.warnings).toBeUndefined();
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 B');
      expect(formatFileSize(512)).toBe('512 B');
      expect(formatFileSize(1023)).toBe('1023 B');
    });

    it('should format kibibytes correctly', () => {
      expect(formatFileSize(1024)).toBe('1.0 KiB');
      expect(formatFileSize(1536)).toBe('1.5 KiB');
      expect(formatFileSize(102400)).toBe('100.0 KiB');
      expect(formatFileSize(MAX_LOGO_SIZE)).toBe('100.0 KiB');
    });

    it('should handle edge cases', () => {
      expect(formatFileSize(1025)).toBe('1.0 KiB');
      expect(formatFileSize(10240)).toBe('10.0 KiB');
    });
  });

  describe('getImageDimensionWarnings', () => {
    it('should return no warnings for SVG files', () => {
      const warnings = getImageDimensionWarnings({ width: 0, height: 0 });
      expect(warnings).toEqual([]);
    });

    it('should return no warnings for square images under recommended size', () => {
      const warnings = getImageDimensionWarnings({ width: 500, height: 500 });
      expect(warnings).toEqual([]);
    });

    it('should warn for large dimensions', () => {
      const warnings = getImageDimensionWarnings({
        width: RECOMMENDED_MAX_DIMENSION + 500,
        height: RECOMMENDED_MAX_DIMENSION + 500,
      });
      expect(warnings.length).toBeGreaterThan(0);
      expect(warnings.some((w) => w.includes('Large dimensions'))).toBe(true);
    });

    it('should warn for non-square aspect ratios', () => {
      const warnings = getImageDimensionWarnings({ width: 2000, height: 500 });
      expect(warnings.some((w) => w.includes('Non-square'))).toBe(true);
    });

    it('should warn for both large and non-square images', () => {
      const warnings = getImageDimensionWarnings({
        width: RECOMMENDED_MAX_DIMENSION + 500,
        height: 500,
      });
      expect(warnings.length).toBe(2);
      expect(warnings.some((w) => w.includes('Large dimensions'))).toBe(true);
      expect(warnings.some((w) => w.includes('Non-square'))).toBe(true);
    });

    it('should not warn for rectangular images within threshold', () => {
      // Aspect ratio of 1.5 should not trigger warning (threshold is 2.0 or 0.5)
      const warnings = getImageDimensionWarnings({ width: 600, height: 400 });
      expect(warnings.some((w) => w.includes('Non-square'))).toBe(false);
    });
  });

  describe('createPreviewUrl', () => {
    it('should create a valid blob URL', () => {
      const file = new File(['test content'], 'test.png', {
        type: 'image/png',
      });
      const url = createPreviewUrl(file);

      expect(url).toMatch(/^blob:/);
      expect(typeof url).toBe('string');

      // Cleanup
      URL.revokeObjectURL(url);
    });

    it('should create different URLs for different files', () => {
      const file1 = new File(['content1'], 'test1.png', { type: 'image/png' });
      const file2 = new File(['content2'], 'test2.png', { type: 'image/png' });

      const url1 = createPreviewUrl(file1);
      const url2 = createPreviewUrl(file2);

      expect(url1).not.toBe(url2);

      // Cleanup
      URL.revokeObjectURL(url1);
      URL.revokeObjectURL(url2);
    });
  });

  describe('getImageDimensions', () => {
    it('should return 0x0 for SVG files', async () => {
      const svgFile = new File(['<svg></svg>'], 'test.svg', {
        type: 'image/svg+xml',
      });
      const dimensions = await getImageDimensions(svgFile);

      expect(dimensions).toEqual({ width: 0, height: 0 });
    });

    // Note: Testing actual image loading in JSDOM is complex and requires canvas mocking
    // These would typically be tested in an integration or E2E test environment
    it.skip('should extract dimensions from actual image files', async () => {
      // This test would require a real image file and proper DOM environment
      // Skipped for unit test suite
    });
  });

  describe('compressImage', () => {
    it('should return SVG files unchanged', async () => {
      const svgFile = new File(['<svg></svg>'], 'test.svg', {
        type: 'image/svg+xml',
      });
      const result = await compressImage(svgFile);

      expect(result).toBe(svgFile);
    });

    it('should return GIF files unchanged', async () => {
      const gifFile = new File(['GIF89a'], 'test.gif', { type: 'image/gif' });
      const result = await compressImage(gifFile);

      expect(result).toBe(gifFile);
    });

    it('should return files already under size unchanged', async () => {
      const smallFile = new File(['small'], 'test.png', { type: 'image/png' });
      const result = await compressImage(smallFile, 1024);

      expect(result).toBe(smallFile);
    });

    // Note: Testing actual image compression requires canvas API and is complex in JSDOM
    // These would typically be tested in an integration or E2E test environment
    it.skip('should compress large images', async () => {
      // This test would require canvas mocking and actual image data
      // Skipped for unit test suite
    });
  });

  describe('ALLOWED_IMAGE_TYPES', () => {
    it('should include all common image types', () => {
      expect(ALLOWED_IMAGE_TYPES).toContain('image/png');
      expect(ALLOWED_IMAGE_TYPES).toContain('image/jpeg');
      expect(ALLOWED_IMAGE_TYPES).toContain('image/jpg');
      expect(ALLOWED_IMAGE_TYPES).toContain('image/gif');
      expect(ALLOWED_IMAGE_TYPES).toContain('image/svg+xml');
      expect(ALLOWED_IMAGE_TYPES).toContain('image/webp');
    });
  });

  describe('Constants', () => {
    it('should define MAX_LOGO_SIZE correctly', () => {
      expect(MAX_LOGO_SIZE).toBe(100 * 1024); // 100 KiB
    });

    it('should define RECOMMENDED_MAX_SIZE correctly', () => {
      expect(RECOMMENDED_MAX_SIZE).toBe(50 * 1024); // 50 KiB
    });

    it('should define RECOMMENDED_MAX_DIMENSION correctly', () => {
      expect(RECOMMENDED_MAX_DIMENSION).toBe(1000);
    });
  });
});
