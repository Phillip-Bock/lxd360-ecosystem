/**
 * INSPIRE Asset Library - MIME Type Validation
 *
 * Defines allowed file types and validation utilities.
 *
 * @module lib/assets/mimeTypes
 */

// =============================================================================
// Allowed MIME Types
// =============================================================================

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/avif',
] as const;

export const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime',
] as const;

export const ALLOWED_AUDIO_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/ogg',
  'audio/webm',
  'audio/aac',
] as const;

export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
] as const;

export const ALL_ALLOWED_TYPES = [
  ...ALLOWED_IMAGE_TYPES,
  ...ALLOWED_VIDEO_TYPES,
  ...ALLOWED_AUDIO_TYPES,
  ...ALLOWED_DOCUMENT_TYPES,
] as const;

export type AllowedMimeType = (typeof ALL_ALLOWED_TYPES)[number];

// =============================================================================
// File Extensions
// =============================================================================

export const MIME_TO_EXTENSION: Record<AllowedMimeType, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
  'image/svg+xml': '.svg',
  'image/avif': '.avif',
  'video/mp4': '.mp4',
  'video/webm': '.webm',
  'video/ogg': '.ogv',
  'video/quicktime': '.mov',
  'audio/mpeg': '.mp3',
  'audio/mp3': '.mp3',
  'audio/wav': '.wav',
  'audio/ogg': '.ogg',
  'audio/webm': '.weba',
  'audio/aac': '.aac',
  'application/pdf': '.pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
};

// =============================================================================
// Asset Categories
// =============================================================================

export type AssetCategory = 'image' | 'video' | 'audio' | 'document';

export function getAssetCategory(mimeType: string): AssetCategory | null {
  if (ALLOWED_IMAGE_TYPES.includes(mimeType as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    return 'image';
  }
  if (ALLOWED_VIDEO_TYPES.includes(mimeType as (typeof ALLOWED_VIDEO_TYPES)[number])) {
    return 'video';
  }
  if (ALLOWED_AUDIO_TYPES.includes(mimeType as (typeof ALLOWED_AUDIO_TYPES)[number])) {
    return 'audio';
  }
  if (ALLOWED_DOCUMENT_TYPES.includes(mimeType as (typeof ALLOWED_DOCUMENT_TYPES)[number])) {
    return 'document';
  }
  return null;
}

// =============================================================================
// Validation Functions
// =============================================================================

/**
 * Check if a MIME type is allowed
 */
export function isAllowedMimeType(mimeType: string): mimeType is AllowedMimeType {
  return ALL_ALLOWED_TYPES.includes(mimeType as AllowedMimeType);
}

/**
 * Check if a file is an image
 */
export function isImageMimeType(mimeType: string): boolean {
  return ALLOWED_IMAGE_TYPES.includes(mimeType as (typeof ALLOWED_IMAGE_TYPES)[number]);
}

/**
 * Check if a file is a video
 */
export function isVideoMimeType(mimeType: string): boolean {
  return ALLOWED_VIDEO_TYPES.includes(mimeType as (typeof ALLOWED_VIDEO_TYPES)[number]);
}

/**
 * Check if a file is audio
 */
export function isAudioMimeType(mimeType: string): boolean {
  return ALLOWED_AUDIO_TYPES.includes(mimeType as (typeof ALLOWED_AUDIO_TYPES)[number]);
}

/**
 * Get file extension from MIME type
 */
export function getExtensionFromMime(mimeType: string): string | null {
  return MIME_TO_EXTENSION[mimeType as AllowedMimeType] ?? null;
}

// =============================================================================
// Size Limits
// =============================================================================

export const FILE_SIZE_LIMITS = {
  image: 10 * 1024 * 1024, // 10MB
  video: 500 * 1024 * 1024, // 500MB
  audio: 50 * 1024 * 1024, // 50MB
  document: 25 * 1024 * 1024, // 25MB
} as const;

/**
 * Get size limit for a given MIME type
 */
export function getSizeLimit(mimeType: string): number {
  const category = getAssetCategory(mimeType);
  if (!category) return 0;
  return FILE_SIZE_LIMITS[category];
}

/**
 * Check if file size is within limits
 */
export function isWithinSizeLimit(mimeType: string, sizeInBytes: number): boolean {
  const limit = getSizeLimit(mimeType);
  return sizeInBytes <= limit;
}

/**
 * Format bytes to human-readable string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
}
