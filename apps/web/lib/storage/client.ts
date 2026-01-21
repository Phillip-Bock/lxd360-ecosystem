import type {
  DeleteResult,
  DownloadOptions,
  DownloadResult,
  ListFilesResult,
  SignedUrlOptions,
  SignedUrlResult,
  StorageBucket,
  UploadOptions,
  UploadResult,
} from './types';

// ============================================================================
// STORAGE CLIENT INTERFACE
// ============================================================================

/**
 * Storage client interface for file operations
 */
export interface StorageClient {
  upload(options: UploadOptions): Promise<UploadResult>;
  download(options: DownloadOptions): Promise<DownloadResult>;
  getSignedUrl(options: SignedUrlOptions): Promise<SignedUrlResult>;
  delete(bucket: StorageBucket, path: string): Promise<DeleteResult>;
  list(bucket: StorageBucket, prefix?: string): Promise<ListFilesResult>;
  getPublicUrl(bucket: StorageBucket, path: string): string;
}

// ============================================================================
// STUB IMPLEMENTATION
// ============================================================================

/**
 * Create a storage client
 * Returns stub implementations until Cloud Storage SDK is integrated
 */
export function createStorageClient(): StorageClient {
  return {
    async upload(_options: UploadOptions): Promise<UploadResult> {
      // Stub: Cloud Storage upload not yet implemented
      return {
        success: false,
        error: 'Storage upload not yet implemented',
      };
    },

    async download(_options: DownloadOptions): Promise<DownloadResult> {
      // Stub: Cloud Storage download not yet implemented
      return {
        success: false,
        error: 'Storage download not yet implemented',
      };
    },

    async getSignedUrl(_options: SignedUrlOptions): Promise<SignedUrlResult> {
      // Stub: Cloud Storage signed URLs not yet implemented
      return {
        success: false,
        error: 'Signed URL generation not yet implemented',
      };
    },

    async delete(_bucket: StorageBucket, _path: string): Promise<DeleteResult> {
      // Stub: Cloud Storage delete not yet implemented
      return {
        success: false,
        error: 'Storage delete not yet implemented',
      };
    },

    async list(_bucket: StorageBucket, _prefix?: string): Promise<ListFilesResult> {
      // Stub: Cloud Storage list not yet implemented
      return {
        success: false,
        files: [],
        error: 'Storage list not yet implemented',
      };
    },

    getPublicUrl(bucket: StorageBucket, path: string): string {
      // Returns valid GCS public URL format
      const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'lxd-saas-dev';
      return `https://storage.googleapis.com/${projectId}.appspot.com/${bucket}/${path}`;
    },
  };
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let storageClientInstance: StorageClient | null = null;

/**
 * Get the storage client instance
 */
export function getStorageClient(): StorageClient {
  if (!storageClientInstance) {
    storageClientInstance = createStorageClient();
  }
  return storageClientInstance;
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Upload a file to storage
 */
export async function uploadFile(options: UploadOptions): Promise<UploadResult> {
  return getStorageClient().upload(options);
}

/**
 * Download a file from storage
 */
export async function downloadFile(options: DownloadOptions): Promise<DownloadResult> {
  return getStorageClient().download(options);
}

/**
 * Get a signed URL for private file access
 */
export async function getSignedUrl(options: SignedUrlOptions): Promise<SignedUrlResult> {
  return getStorageClient().getSignedUrl(options);
}

/**
 * Delete a file from storage
 */
export async function deleteFile(bucket: StorageBucket, path: string): Promise<DeleteResult> {
  return getStorageClient().delete(bucket, path);
}

/**
 * List files in a bucket
 */
export async function listFiles(bucket: StorageBucket, prefix?: string): Promise<ListFilesResult> {
  return getStorageClient().list(bucket, prefix);
}

/**
 * Get public URL for a file
 */
export function getPublicUrl(bucket: StorageBucket, path: string): string {
  return getStorageClient().getPublicUrl(bucket, path);
}
