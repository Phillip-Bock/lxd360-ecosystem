import {
  BUCKET_CONFIGS,
  type CdnCacheControl,
  type FileValidationResult,
  type PlatformBucket,
  type StorageBucket,
} from './types';

// ============================================================================
// FILE VALIDATION
// ============================================================================

/**
 * Validate a file against bucket configuration
 */
export function validateFile(file: File, bucket: PlatformBucket): FileValidationResult {
  const config = BUCKET_CONFIGS[bucket];

  if (!file) {
    return {
      valid: false,
      error: 'No file provided',
    };
  }

  // Check file size
  if (file.size > config.maxFileSize) {
    return {
      valid: false,
      error: `File size (${formatFileSize(file.size)}) exceeds maximum allowed size (${formatFileSize(config.maxFileSize)})`,
    };
  }

  // Check MIME type
  if (!config.allowedMimeTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type "${file.type}" is not allowed for this bucket. Allowed types: ${config.allowedMimeTypes.join(', ')}`,
    };
  }

  // Validate filename
  const filenameValidation = validateFilename(file.name);
  if (!filenameValidation.valid) {
    return filenameValidation;
  }

  return { valid: true };
}

/**
 * Validate filename for security
 */
export function validateFilename(filename: string): FileValidationResult {
  // Check for null or empty
  if (!filename || filename.trim() === '') {
    return {
      valid: false,
      error: 'Filename cannot be empty',
    };
  }

  // Check for path traversal attempts
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return {
      valid: false,
      error: 'Filename contains invalid characters',
    };
  }

  // Check length
  if (filename.length > 255) {
    return {
      valid: false,
      error: 'Filename is too long (max 255 characters)',
    };
  }

  // Check for potentially dangerous characters
  const dangerousChars = /[<>:"|?*\x00-\x1f]/g;
  if (dangerousChars.test(filename)) {
    return {
      valid: false,
      error: 'Filename contains invalid characters',
    };
  }

  return { valid: true };
}

/**
 * Sanitize a filename for safe storage
 */
export function sanitizeFilename(filename: string): string {
  // Remove path components
  let sanitized = filename.replace(/^.*[\\/]/, '');

  // Replace spaces with hyphens
  sanitized = sanitized.replace(/\s+/g, '-');

  // Remove unknown non-alphanumeric characters except dots, hyphens, and underscores
  sanitized = sanitized.replace(/[^a-zA-Z0-9.-_]/g, '');

  // Remove multiple consecutive dots
  sanitized = sanitized.replace(/\.{2,}/g, '.');

  // Ensure it doesn't start with a dot
  sanitized = sanitized.replace(/^\.+/, '');

  // Truncate to 255 characters
  if (sanitized.length > 255) {
    const ext = getFileExtension(sanitized);
    const nameWithoutExt = sanitized.slice(0, sanitized.lastIndexOf('.'));
    sanitized = `${nameWithoutExt.slice(0, 255 - ext.length - 1)}.${ext}`;
  }

  return sanitized || 'unnamed-file';
}

// ============================================================================
// PATH GENERATION
// ============================================================================

/**
 * Generate storage path for avatar
 */
export function getAvatarPath(userId: string, filename: string): string {
  const sanitized = sanitizeFilename(filename);
  return `${userId}/${sanitized}`;
}

/**
 * Generate storage path for course media
 */
export function getCourseMediaPath(tenantId: string, courseId: string, filename: string): string {
  const sanitized = sanitizeFilename(filename);
  return `${tenantId}/${courseId}/${sanitized}`;
}

/**
 * Generate storage path for documents
 */
export function getDocumentPath(tenantId: string, folder: string, filename: string): string {
  const sanitized = sanitizeFilename(filename);
  const sanitizedFolder = folder.replace(/[^a-zA-Z0-9-_]/g, '-');
  return `${tenantId}/${sanitizedFolder}/${sanitized}`;
}

/**
 * Generate storage path for exports
 */
export function getExportPath(userId: string, exportType: string, filename: string): string {
  const sanitized = sanitizeFilename(filename);
  const sanitizedType = exportType.replace(/[^a-zA-Z0-9-_]/g, '-');
  return `${userId}/${sanitizedType}/${sanitized}`;
}

/**
 * Generate a unique filename with timestamp
 */
export function generateUniqueFilename(originalFilename: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const ext = getFileExtension(originalFilename);
  const nameWithoutExt = originalFilename.slice(0, originalFilename.lastIndexOf('.'));
  const sanitizedName = sanitizeFilename(nameWithoutExt);
  return `${sanitizedName}-${timestamp}-${random}.${ext}`;
}

// ============================================================================
// CDN & CACHING
// ============================================================================

/**
 * Generate Cache-Control header for a bucket
 */
export function getCacheControlHeader(bucket: PlatformBucket): string {
  const config = BUCKET_CONFIGS[bucket];

  if (!config.isPublic || !config.cacheDuration) {
    return 'private, no-cache, no-store, must-revalidate';
  }

  return `public, max-age=${config.cacheDuration}, s-maxage=${config.cacheDuration}, stale-while-revalidate=86400`;
}

/**
 * Build Cache-Control header from options
 */
export function buildCacheControlHeader(options: CdnCacheControl): string {
  const parts: string[] = [];

  if (options.public) parts.push('public');
  if (options.private) parts.push('private');
  if (options.noCache) parts.push('no-cache');
  if (options.noStore) parts.push('no-store');
  if (options.mustRevalidate) parts.push('must-revalidate');

  if (options.maxAge !== undefined) {
    parts.push(`max-age=${options.maxAge}`);
  }

  if (options.sMaxAge !== undefined) {
    parts.push(`s-maxage=${options.sMaxAge}`);
  }

  if (options.staleWhileRevalidate !== undefined) {
    parts.push(`stale-while-revalidate=${options.staleWhileRevalidate}`);
  }

  if (options.staleIfError !== undefined) {
    parts.push(`stale-if-error=${options.staleIfError}`);
  }

  return parts.join(', ');
}

/**
 * Get recommended cache duration for a file type
 */
export function getRecommendedCacheDuration(mimeType: string): number {
  // Images - 24 hours
  if (mimeType.startsWith('image/')) {
    return 86400;
  }

  // Videos - 1 hour
  if (mimeType.startsWith('video/')) {
    return 3600;
  }

  // Documents - no cache (private data)
  if (
    mimeType === 'application/pdf' ||
    mimeType.includes('document') ||
    mimeType.includes('spreadsheet')
  ) {
    return 0;
  }

  // Default - 1 hour
  return 3600;
}

// ============================================================================
// FILE HELPERS
// ============================================================================

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

/**
 * Get MIME type from file extension
 */
export function getMimeTypeFromExtension(extension: string): string {
  const mimeTypes: Record<string, string> = {
    // Images
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    avif: 'image/avif',
    // Videos
    mp4: 'video/mp4',
    webm: 'video/webm',
    mov: 'video/quicktime',
    // Documents
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    // Text
    txt: 'text/plain',
    md: 'text/markdown',
    csv: 'text/csv',
    // Archives
    zip: 'application/zip',
    tar: 'application/x-tar',
    gz: 'application/gzip',
  };

  return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
}

/**
 * Check if file is an image
 */
export function isImageFile(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

/**
 * Check if file is a video
 */
export function isVideoFile(mimeType: string): boolean {
  return mimeType.startsWith('video/');
}

/**
 * Check if file is a document
 */
export function isDocumentFile(mimeType: string): boolean {
  return (
    mimeType === 'application/pdf' ||
    mimeType.includes('document') ||
    mimeType.includes('spreadsheet') ||
    mimeType.includes('presentation') ||
    mimeType.startsWith('text/')
  );
}

// ============================================================================
// URL HELPERS
// ============================================================================

/**
 * Build storage URL for public bucket (legacy pattern)
 * @deprecated Use Cloud Storage URLs instead
 */
export function getPublicUrl(storageUrl: string, bucket: StorageBucket, path: string): string {
  return `${storageUrl}/storage/v1/object/public/${bucket}/${path}`;
}

/**
 * Build transform URL for image
 */
export function getTransformUrl(
  publicUrl: string,
  width?: number,
  height?: number,
  quality?: number,
): string {
  const url = new URL(publicUrl);
  const params = new URLSearchParams();

  if (width) params.append('width', width.toString());
  if (height) params.append('height', height.toString());
  if (quality) params.append('quality', quality.toString());

  if (params.toString()) {
    url.pathname = url.pathname.replace('/public/', '/render/image/public/');
    url.search = params.toString();
  }

  return url.toString();
}

// ============================================================================
// BUCKET HELPERS
// ============================================================================

/**
 * Get bucket configuration
 */
export function getBucketConfig(bucket: PlatformBucket) {
  return BUCKET_CONFIGS[bucket];
}

/**
 * Check if bucket is public
 */
export function isBucketPublic(bucket: PlatformBucket): boolean {
  return BUCKET_CONFIGS[bucket].isPublic;
}

/**
 * Get max file size for bucket
 */
export function getMaxFileSize(bucket: PlatformBucket): number {
  return BUCKET_CONFIGS[bucket].maxFileSize;
}

/**
 * Get allowed MIME types for bucket
 */
export function getAllowedMimeTypes(bucket: PlatformBucket): string[] {
  return BUCKET_CONFIGS[bucket].allowedMimeTypes;
}
