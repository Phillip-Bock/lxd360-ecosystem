// ============================================================================
// BUCKET DEFINITIONS
// ============================================================================

/**
 * Platform storage bucket names
 */
export const PLATFORM_BUCKETS = {
  AVATARS: 'avatars',
  COURSE_MEDIA: 'course-media',
  DOCUMENTS: 'documents',
  EXPORTS: 'exports',
} as const;

export type PlatformBucket = (typeof PLATFORM_BUCKETS)[keyof typeof PLATFORM_BUCKETS];

/**
 * All available storage buckets (platform + media library)
 */
export const ALL_BUCKETS = {
  // Platform buckets
  ...PLATFORM_BUCKETS,
  // Media library buckets
  MEDIA_IMAGES: 'media-images',
  MEDIA_VIDEOS: 'media-videos',
  MEDIA_AUDIO: 'media-audio',
  MEDIA_3D: 'media-3d',
  MEDIA_ICONS: 'media-icons',
  MEDIA_AI_CHARACTERS: 'media-ai-characters',
  MEDIA_DOCUMENTS: 'media-documents',
  MEDIA_THUMBNAILS: 'media-thumbnails',
  MEDIA_PROCESSING: 'media-processing',
} as const;

export type StorageBucket = (typeof ALL_BUCKETS)[keyof typeof ALL_BUCKETS];

// ============================================================================
// BUCKET CONFIGURATIONS
// ============================================================================

/**
 * Storage bucket configuration
 */
export interface BucketConfig {
  name: string;
  isPublic: boolean;
  maxFileSize: number; // in bytes
  allowedMimeTypes: string[];
  cacheDuration?: number; // CDN cache duration in seconds
  description: string;
}

/**
 * Bucket configurations for all platform buckets
 */
export const BUCKET_CONFIGS: Record<PlatformBucket, BucketConfig> = {
  [PLATFORM_BUCKETS.AVATARS]: {
    name: 'avatars',
    isPublic: true,
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'],
    cacheDuration: 86400, // 24 hours
    description: 'User profile pictures and avatars',
  },
  [PLATFORM_BUCKETS.COURSE_MEDIA]: {
    name: 'course-media',
    isPublic: true,
    maxFileSize: 50 * 1024 * 1024, // 50MB
    allowedMimeTypes: [
      // Images
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'image/avif',
      // Videos
      'video/mp4',
      'video/webm',
      'video/quicktime',
    ],
    cacheDuration: 3600, // 1 hour
    description: 'Course thumbnails, banners, and promotional media',
  },
  [PLATFORM_BUCKETS.DOCUMENTS]: {
    name: 'documents',
    isPublic: false,
    maxFileSize: 100 * 1024 * 1024, // 100MB
    allowedMimeTypes: [
      // PDFs
      'application/pdf',
      // Microsoft Office
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      // Text files
      'text/plain',
      'text/markdown',
      'text/csv',
      'text/rtf',
      // OpenDocument
      'application/vnd.oasis.opendocument.text',
      'application/vnd.oasis.opendocument.spreadsheet',
      'application/vnd.oasis.opendocument.presentation',
      // Archives
      'application/zip',
      'application/x-zip-compressed',
    ],
    description: 'General document storage (course materials, resources)',
  },
  [PLATFORM_BUCKETS.EXPORTS]: {
    name: 'exports',
    isPublic: false,
    maxFileSize: 500 * 1024 * 1024, // 500MB
    allowedMimeTypes: [
      // Data exports
      'text/csv',
      'application/json',
      'application/xml',
      'text/xml',
      // Spreadsheets
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      // PDFs
      'application/pdf',
      // Archives
      'application/zip',
      'application/x-zip-compressed',
      'application/gzip',
      'application/x-tar',
    ],
    description: 'System-generated exports (reports, analytics, SCORM packages)',
  },
};

// ============================================================================
// UPLOAD TYPES
// ============================================================================

/**
 * Base upload options
 */
export interface UploadOptions {
  bucket: StorageBucket;
  path: string;
  file: File | Blob;
  cacheControl?: string;
  contentType?: string;
  upsert?: boolean;
}

/**
 * Avatar upload options
 */
export interface AvatarUploadOptions {
  userId: string;
  file: File;
  upsert?: boolean;
}

/**
 * Course media upload options
 */
export interface CourseMediaUploadOptions {
  tenantId: string;
  courseId: string;
  file: File;
  filename?: string;
  upsert?: boolean;
}

/**
 * Document upload options
 */
export interface DocumentUploadOptions {
  tenantId: string;
  folder: string;
  file: File;
  filename?: string;
  upsert?: boolean;
}

/**
 * Export upload options
 */
export interface ExportUploadOptions {
  userId: string;
  exportType: 'reports' | 'analytics' | 'scorm' | 'backup' | 'data';
  file: File;
  filename?: string;
  upsert?: boolean;
}

// ============================================================================
// DOWNLOAD TYPES
// ============================================================================

/**
 * Download options
 */
export interface DownloadOptions {
  bucket: StorageBucket;
  path: string;
  download?: boolean; // Force download vs. display in browser
  transform?: {
    width?: number;
    height?: number;
    quality?: number;
  };
}

/**
 * Signed URL options
 */
export interface SignedUrlOptions {
  bucket: StorageBucket;
  path: string;
  expiresIn?: number; // Seconds until expiration (default: 3600)
}

// ============================================================================
// RESPONSE TYPES
// ============================================================================

/**
 * Upload result
 */
export interface UploadResult {
  success: boolean;
  path?: string;
  publicUrl?: string;
  error?: string;
}

/**
 * Download result
 */
export interface DownloadResult {
  success: boolean;
  data?: Blob;
  error?: string;
}

/**
 * Signed URL result
 */
export interface SignedUrlResult {
  success: boolean;
  signedUrl?: string;
  expiresAt?: Date;
  error?: string;
}

/**
 * Delete result
 */
export interface DeleteResult {
  success: boolean;
  error?: string;
}

/**
 * List files result
 */
export interface ListFilesResult {
  success: boolean;
  files?: StorageFile[];
  error?: string;
}

/**
 * Storage file metadata
 */
export interface StorageFile {
  name: string;
  id: string;
  updated_at: string;
  created_at: string;
  last_accessed_at: string;
  metadata: {
    eTag: string;
    size: number;
    mimetype: string;
    cacheControl: string;
    lastModified: string;
    contentLength: number;
    httpStatusCode: number;
  };
  buckets: {
    id: string;
    name: string;
    owner: string;
    created_at: string;
    updated_at: string;
    public: boolean;
  };
}

// ============================================================================
// VALIDATION TYPES
// ============================================================================

/**
 * File validation result
 */
export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validation error types
 */
export enum ValidationError {
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  INVALID_MIME_TYPE = 'INVALID_MIME_TYPE',
  INVALID_FILENAME = 'INVALID_FILENAME',
  MISSING_FILE = 'MISSING_FILE',
}

// ============================================================================
// PATH HELPERS
// ============================================================================

/**
 * Storage path components for avatars
 */
export interface AvatarPath {
  userId: string;
  filename: string;
}

/**
 * Storage path components for course media
 */
export interface CourseMediaPath {
  tenantId: string;
  courseId: string;
  filename: string;
}

/**
 * Storage path components for documents
 */
export interface DocumentPath {
  tenantId: string;
  folder: string;
  filename: string;
}

/**
 * Storage path components for exports
 */
export interface ExportPath {
  userId: string;
  exportType: string;
  filename: string;
}

// ============================================================================
// CDN TYPES
// ============================================================================

/**
 * CDN cache control options
 */
export interface CdnCacheControl {
  maxAge?: number; // seconds
  sMaxAge?: number; // seconds (CDN edge cache)
  staleWhileRevalidate?: number; // seconds
  staleIfError?: number; // seconds
  public?: boolean;
  private?: boolean;
  noCache?: boolean;
  noStore?: boolean;
  mustRevalidate?: boolean;
}

/**
 * CDN transform options for images
 */
export interface CdnTransformOptions {
  width?: number;
  height?: number;
  quality?: number; // 1-100
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
  resize?: 'cover' | 'contain' | 'fill';
}
