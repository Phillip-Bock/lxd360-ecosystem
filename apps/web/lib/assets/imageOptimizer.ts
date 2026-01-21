/**
 * INSPIRE Asset Library - Image Optimizer
 *
 * Client-side image compression before upload.
 *
 * @module lib/assets/imageOptimizer
 */

// =============================================================================
// Types
// =============================================================================

export interface OptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1
  format?: 'jpeg' | 'png' | 'webp';
}

export interface OptimizationResult {
  blob: Blob;
  width: number;
  height: number;
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
}

// =============================================================================
// Default Settings
// =============================================================================

const DEFAULT_OPTIONS: Required<OptimizationOptions> = {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 0.85,
  format: 'webp',
};

// =============================================================================
// Main Optimizer
// =============================================================================

/**
 * Optimize an image file for upload
 */
export async function optimizeImage(
  file: File,
  options: OptimizationOptions = {},
): Promise<OptimizationResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const originalSize = file.size;

  // Load image
  const img = await loadImage(file);

  // Calculate dimensions
  const { width, height } = calculateDimensions(
    img.naturalWidth,
    img.naturalHeight,
    opts.maxWidth,
    opts.maxHeight,
  );

  // Create canvas and draw
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  // Enable image smoothing for better quality
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Draw image
  ctx.drawImage(img, 0, 0, width, height);

  // Convert to blob
  const blob = await canvasToBlob(canvas, opts.format, opts.quality);

  // If optimized is larger than original (can happen with small files), use original
  if (blob.size >= originalSize && file.type === `image/${opts.format}`) {
    return {
      blob: file,
      width: img.naturalWidth,
      height: img.naturalHeight,
      originalSize,
      optimizedSize: originalSize,
      compressionRatio: 1,
    };
  }

  return {
    blob,
    width,
    height,
    originalSize,
    optimizedSize: blob.size,
    compressionRatio: originalSize / blob.size,
  };
}

/**
 * Create a thumbnail from an image file
 */
export async function createThumbnail(file: File, size: number = 200): Promise<Blob> {
  const img = await loadImage(file);

  // Calculate square crop
  const minDim = Math.min(img.naturalWidth, img.naturalHeight);
  const sx = (img.naturalWidth - minDim) / 2;
  const sy = (img.naturalHeight - minDim) / 2;

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Draw cropped and scaled
  ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);

  return canvasToBlob(canvas, 'webp', 0.8);
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Load an image from a File object
 */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

/**
 * Calculate dimensions while maintaining aspect ratio
 */
function calculateDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number,
): { width: number; height: number } {
  let width = originalWidth;
  let height = originalHeight;

  // Scale down if needed
  if (width > maxWidth) {
    height = Math.round((height * maxWidth) / width);
    width = maxWidth;
  }

  if (height > maxHeight) {
    width = Math.round((width * maxHeight) / height);
    height = maxHeight;
  }

  return { width, height };
}

/**
 * Convert canvas to blob
 */
function canvasToBlob(
  canvas: HTMLCanvasElement,
  format: 'jpeg' | 'png' | 'webp',
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to convert canvas to blob'));
        }
      },
      `image/${format}`,
      quality,
    );
  });
}

/**
 * Get image dimensions from a File
 */
export async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  const img = await loadImage(file);
  return {
    width: img.naturalWidth,
    height: img.naturalHeight,
  };
}

/**
 * Check if browser supports WebP
 */
export function supportsWebP(): boolean {
  if (typeof document === 'undefined') return false;
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').startsWith('data:image/webp');
}
