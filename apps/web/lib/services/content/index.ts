/**
 * Content Service — Firebase Storage URL Handling
 *
 * @description Handles Firebase Storage operations including:
 * - Signed URL generation for private content (server-side)
 * - Public URL generation for shared content
 * - Content upload functionality (client-side)
 *
 * @version 1.0.0
 */

import { logger } from '@/lib/logger';

const log = logger.scope('ContentService');

// =============================================================================
// Types
// =============================================================================

/**
 * Supported bucket paths for content organization
 */
export type BucketPath = 'avatars' | 'course-assets' | 'uploads' | 'certificates' | 'media';

/**
 * Upload result containing the storage path and download URL
 */
export interface UploadResult {
  path: string;
  downloadUrl: string;
}

/**
 * Content service error
 */
export interface ContentError {
  code: 'UPLOAD_FAILED' | 'URL_GENERATION_FAILED' | 'INVALID_PATH' | 'STORAGE_NOT_INITIALIZED';
  message: string;
  cause?: unknown;
}

/**
 * Result type for content operations
 */
export interface ContentResult<T> {
  data: T | null;
  error: ContentError | null;
}

// =============================================================================
// Configuration
// =============================================================================

const STORAGE_BUCKET = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

/** Default signed URL expiration: 1 hour in milliseconds */
const DEFAULT_EXPIRATION_MS = 60 * 60 * 1000;

/** Maximum signed URL expiration: 7 days in milliseconds */
const MAX_EXPIRATION_MS = 7 * 24 * 60 * 60 * 1000;

// =============================================================================
// Path Utilities
// =============================================================================

/**
 * Validate and normalize a storage path
 *
 * @param path - The storage path to validate
 * @returns Normalized path or null if invalid
 */
function normalizePath(path: string): string | null {
  if (!path || typeof path !== 'string') {
    return null;
  }

  // Remove leading/trailing slashes and normalize
  const normalized = path.replace(/^\/+|\/+$/g, '').replace(/\/+/g, '/');

  // Validate path doesn't contain dangerous patterns
  if (normalized.includes('..') || normalized.includes('\0')) {
    return null;
  }

  return normalized;
}

/**
 * Build a full storage path with bucket prefix
 *
 * @param bucketPath - The bucket path category
 * @param fileName - The file name or relative path
 * @param tenantId - Optional tenant ID for multi-tenant isolation
 * @returns Full storage path
 */
export function buildStoragePath(
  bucketPath: BucketPath,
  fileName: string,
  tenantId?: string,
): string {
  const normalizedFileName = normalizePath(fileName);
  if (!normalizedFileName) {
    throw new Error('Invalid file name');
  }

  if (tenantId) {
    return `tenants/${tenantId}/${bucketPath}/${normalizedFileName}`;
  }

  return `${bucketPath}/${normalizedFileName}`;
}

// =============================================================================
// Public URL Generation (Client/Server)
// =============================================================================

/**
 * Generate a public URL for shared content
 *
 * @description Creates a Firebase Storage public URL for content that doesn't
 * require authentication. Use this for publicly accessible assets like
 * marketing images or shared course thumbnails.
 *
 * @param path - The storage path (e.g., "avatars/user123.jpg")
 * @returns The public download URL
 *
 * @example
 * ```typescript
 * const url = getPublicUrl('course-assets/thumbnail.jpg');
 * // Returns: https://firebasestorage.googleapis.com/v0/b/bucket/o/course-assets%2Fthumbnail.jpg?alt=media
 * ```
 */
export function getPublicUrl(path: string): string {
  const normalizedPath = normalizePath(path);
  if (!normalizedPath) {
    log.warn('Invalid path provided to getPublicUrl', { path });
    return '';
  }

  if (!STORAGE_BUCKET) {
    log.error('Storage bucket not configured');
    return '';
  }

  // Firebase Storage URL format
  const encodedPath = encodeURIComponent(normalizedPath);
  return `https://firebasestorage.googleapis.com/v0/b/${STORAGE_BUCKET}/o/${encodedPath}?alt=media`;
}

/**
 * Generate a Google Cloud Storage public URL
 *
 * @description Alternative URL format using the GCS direct URL.
 * Useful when content is served through Cloud CDN.
 *
 * @param path - The storage path
 * @returns The GCS public URL
 */
export function getGcsPublicUrl(path: string): string {
  const normalizedPath = normalizePath(path);
  if (!normalizedPath) {
    log.warn('Invalid path provided to getGcsPublicUrl', { path });
    return '';
  }

  if (!STORAGE_BUCKET) {
    log.error('Storage bucket not configured');
    return '';
  }

  return `https://storage.googleapis.com/${STORAGE_BUCKET}/${normalizedPath}`;
}

// =============================================================================
// Signed URL Generation (Server-Side Only)
// =============================================================================

/**
 * Generate a signed URL for private content
 *
 * @description Creates a time-limited signed URL for accessing private content.
 * This function must be called from server-side code (API routes, Server Actions,
 * or Server Components) as it requires Firebase Admin SDK.
 *
 * @param path - The storage path (e.g., "uploads/private-doc.pdf")
 * @param expiresIn - URL validity duration in milliseconds (default: 1 hour, max: 7 days)
 * @returns Promise resolving to the signed URL
 *
 * @example
 * ```typescript
 * // In a Server Action or API Route
 * const url = await getSignedUrl('uploads/private-doc.pdf');
 *
 * // With custom expiration (15 minutes)
 * const url = await getSignedUrl('uploads/private-doc.pdf', 15 * 60 * 1000);
 * ```
 */
export async function getSignedUrl(
  path: string,
  expiresIn: number = DEFAULT_EXPIRATION_MS,
): Promise<string> {
  const normalizedPath = normalizePath(path);
  if (!normalizedPath) {
    log.error('Invalid path provided to getSignedUrl', { path });
    throw new Error('Invalid storage path');
  }

  // Clamp expiration to valid range
  const validExpiration = Math.min(Math.max(expiresIn, 1000), MAX_EXPIRATION_MS);

  try {
    // Dynamic import to ensure this only runs server-side
    const { adminStorage } = await import('@/lib/firebase/admin');

    const bucket = adminStorage.bucket();
    const file = bucket.file(normalizedPath);

    const [signedUrl] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + validExpiration,
    });

    log.debug('Generated signed URL', {
      path: normalizedPath,
      expiresIn: validExpiration,
    });

    return signedUrl;
  } catch (error) {
    log.error('Failed to generate signed URL', error, { path: normalizedPath });
    throw new Error('Failed to generate signed URL');
  }
}

/**
 * Generate a signed URL for uploading content (server-side)
 *
 * @description Creates a time-limited signed URL that allows uploading
 * content directly to Firebase Storage. Useful for resumable uploads
 * from the client without exposing admin credentials.
 *
 * @param path - The destination storage path
 * @param contentType - The MIME type of the content to upload
 * @param expiresIn - URL validity duration in milliseconds (default: 15 minutes)
 * @returns Promise resolving to the signed upload URL
 */
export async function getSignedUploadUrl(
  path: string,
  contentType: string,
  expiresIn: number = 15 * 60 * 1000,
): Promise<string> {
  const normalizedPath = normalizePath(path);
  if (!normalizedPath) {
    log.error('Invalid path provided to getSignedUploadUrl', { path });
    throw new Error('Invalid storage path');
  }

  const validExpiration = Math.min(Math.max(expiresIn, 1000), MAX_EXPIRATION_MS);

  try {
    const { adminStorage } = await import('@/lib/firebase/admin');

    const bucket = adminStorage.bucket();
    const file = bucket.file(normalizedPath);

    const [signedUrl] = await file.getSignedUrl({
      action: 'write',
      expires: Date.now() + validExpiration,
      contentType,
    });

    log.debug('Generated signed upload URL', {
      path: normalizedPath,
      contentType,
      expiresIn: validExpiration,
    });

    return signedUrl;
  } catch (error) {
    log.error('Failed to generate signed upload URL', error, { path: normalizedPath });
    throw new Error('Failed to generate signed upload URL');
  }
}

// =============================================================================
// Client-Side Upload (Browser Only)
// =============================================================================

/**
 * Upload content to Firebase Storage (client-side)
 *
 * @description Uploads a file to Firebase Storage from the browser.
 * Requires the user to be authenticated with appropriate permissions.
 *
 * @param file - The File object to upload
 * @param path - The destination storage path
 * @returns Promise resolving to the upload result with path and download URL
 *
 * @example
 * ```typescript
 * // In a React component
 * const handleUpload = async (file: File) => {
 *   const result = await uploadContent(file, 'avatars/user123.jpg');
 *   if (result.data) {
 *     console.log('Uploaded to:', result.data.downloadUrl);
 *   }
 * };
 * ```
 */
export async function uploadContent(
  file: File,
  path: string,
): Promise<ContentResult<UploadResult>> {
  const normalizedPath = normalizePath(path);
  if (!normalizedPath) {
    return {
      data: null,
      error: {
        code: 'INVALID_PATH',
        message: 'Invalid storage path provided',
      },
    };
  }

  try {
    // Dynamic imports for client-side Firebase
    const { requireStorage } = await import('@/lib/firebase/client');
    const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');

    const storage = requireStorage();
    const storageRef = ref(storage, normalizedPath);

    // Upload the file
    const snapshot = await uploadBytes(storageRef, file, {
      contentType: file.type,
      customMetadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
      },
    });

    // Get the download URL
    const downloadUrl = await getDownloadURL(snapshot.ref);

    log.info('Content uploaded successfully', {
      path: normalizedPath,
      size: file.size,
      type: file.type,
    });

    return {
      data: {
        path: normalizedPath,
        downloadUrl,
      },
      error: null,
    };
  } catch (error) {
    log.error('Failed to upload content', error, { path: normalizedPath });
    return {
      data: null,
      error: {
        code: 'UPLOAD_FAILED',
        message: error instanceof Error ? error.message : 'Upload failed',
        cause: error,
      },
    };
  }
}

/**
 * Upload content with progress tracking (client-side)
 *
 * @description Uploads a file with progress callback for UI feedback.
 *
 * @param file - The File object to upload
 * @param path - The destination storage path
 * @param onProgress - Callback with upload progress (0-100)
 * @returns Promise resolving to the upload result
 */
export async function uploadContentWithProgress(
  file: File,
  path: string,
  onProgress: (progress: number) => void,
): Promise<ContentResult<UploadResult>> {
  const normalizedPath = normalizePath(path);
  if (!normalizedPath) {
    return {
      data: null,
      error: {
        code: 'INVALID_PATH',
        message: 'Invalid storage path provided',
      },
    };
  }

  try {
    const { requireStorage } = await import('@/lib/firebase/client');
    const { ref, uploadBytesResumable, getDownloadURL } = await import('firebase/storage');

    const storage = requireStorage();
    const storageRef = ref(storage, normalizedPath);

    return new Promise((resolve) => {
      const uploadTask = uploadBytesResumable(storageRef, file, {
        contentType: file.type,
        customMetadata: {
          originalName: file.name,
          uploadedAt: new Date().toISOString(),
        },
      });

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress(Math.round(progress));
        },
        (error) => {
          log.error('Upload failed during progress', error, { path: normalizedPath });
          resolve({
            data: null,
            error: {
              code: 'UPLOAD_FAILED',
              message: error.message,
              cause: error,
            },
          });
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            log.info('Content uploaded with progress tracking', {
              path: normalizedPath,
              size: file.size,
            });
            resolve({
              data: {
                path: normalizedPath,
                downloadUrl,
              },
              error: null,
            });
          } catch (error) {
            resolve({
              data: null,
              error: {
                code: 'URL_GENERATION_FAILED',
                message: 'Upload succeeded but failed to get download URL',
                cause: error,
              },
            });
          }
        },
      );
    });
  } catch (error) {
    log.error('Failed to initialize upload', error, { path: normalizedPath });
    return {
      data: null,
      error: {
        code: 'STORAGE_NOT_INITIALIZED',
        message: 'Failed to initialize storage',
        cause: error,
      },
    };
  }
}

// =============================================================================
// Content Deletion (Server-Side)
// =============================================================================

/**
 * Delete content from Firebase Storage (server-side)
 *
 * @description Removes a file from Firebase Storage. Requires server-side
 * execution with admin credentials.
 *
 * @param path - The storage path of the file to delete
 * @returns Promise resolving to success status
 */
export async function deleteContent(path: string): Promise<{ success: boolean; error?: string }> {
  const normalizedPath = normalizePath(path);
  if (!normalizedPath) {
    return { success: false, error: 'Invalid storage path' };
  }

  try {
    const { adminStorage } = await import('@/lib/firebase/admin');

    const bucket = adminStorage.bucket();
    const file = bucket.file(normalizedPath);

    await file.delete();

    log.info('Content deleted', { path: normalizedPath });
    return { success: true };
  } catch (error) {
    log.error('Failed to delete content', error, { path: normalizedPath });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed',
    };
  }
}

// =============================================================================
// Content Metadata (Server-Side)
// =============================================================================

/**
 * Get content metadata from Firebase Storage (server-side)
 *
 * @param path - The storage path
 * @returns Promise resolving to file metadata
 */
export async function getContentMetadata(path: string): Promise<
  ContentResult<{
    name: string;
    size: number;
    contentType: string;
    created: Date;
    updated: Date;
    customMetadata?: Record<string, string>;
  }>
> {
  const normalizedPath = normalizePath(path);
  if (!normalizedPath) {
    return {
      data: null,
      error: {
        code: 'INVALID_PATH',
        message: 'Invalid storage path',
      },
    };
  }

  try {
    const { adminStorage } = await import('@/lib/firebase/admin');

    const bucket = adminStorage.bucket();
    const file = bucket.file(normalizedPath);

    const [metadata] = await file.getMetadata();

    // Convert custom metadata to string-only record
    const customMetadata = metadata.metadata
      ? Object.fromEntries(
          Object.entries(metadata.metadata)
            .filter(([, v]) => typeof v === 'string')
            .map(([k, v]) => [k, String(v)]),
        )
      : undefined;

    return {
      data: {
        name: metadata.name || normalizedPath,
        size: Number(metadata.size) || 0,
        contentType: metadata.contentType || 'application/octet-stream',
        created: new Date(metadata.timeCreated || Date.now()),
        updated: new Date(metadata.updated || Date.now()),
        customMetadata,
      },
      error: null,
    };
  } catch (error) {
    log.error('Failed to get content metadata', error, { path: normalizedPath });
    return {
      data: null,
      error: {
        code: 'URL_GENERATION_FAILED',
        message: 'Failed to retrieve metadata',
        cause: error,
      },
    };
  }
}
