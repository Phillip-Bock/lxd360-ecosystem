'use client';

import { useCallback, useRef, useState } from 'react';
import {
  type BatchUploadResult,
  getAssetTypeFromMimeType,
  LARGE_FILE_THRESHOLD,
  type MediaAsset,
  type UploadOptions,
  type UploadProgress,
  type UploadResult,
  validateFileForType,
} from '@/lib/media/types';

// ============================================================================
// TYPES
// ============================================================================

export interface UseMediaUploadOptions {
  onSuccess?: (asset: MediaAsset) => void;
  onError?: (error: Error, filename: string) => void;
  onProgress?: (progress: UploadProgress) => void;
  maxConcurrent?: number;
}

export interface UseMediaUploadReturn {
  upload: (file: File, options?: UploadOptions) => Promise<UploadResult>;
  uploadMultiple: (files: File[], options?: UploadOptions) => Promise<BatchUploadResult>;
  progress: Map<string, UploadProgress>;
  isUploading: boolean;
  error: Error | null;
  cancelUpload: (fileId: string) => void;
  cancelAll: () => void;
}

// ============================================================================
// HELPERS
// ============================================================================

function generateFileId(): string {
  return `upload_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

// ============================================================================
// HOOK
// ============================================================================

export function useMediaUpload(options: UseMediaUploadOptions = {}): UseMediaUploadReturn {
  const { onSuccess, onError, onProgress, maxConcurrent = 3 } = options;

  const [progress, setProgress] = useState<Map<string, UploadProgress>>(new Map());
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const abortControllers = useRef<Map<string, AbortController>>(new Map());
  const uploadQueue = useRef<Array<() => Promise<void>>>([]);
  const activeUploads = useRef(0);

  /**
   * Update progress for a file
   */
  const updateProgress = useCallback(
    (fileId: string, update: Partial<UploadProgress>) => {
      setProgress((prev) => {
        const next = new Map(prev);
        const current = next.get(fileId) || {
          fileId,
          filename: '',
          progress: 0,
          status: 'pending' as const,
        };
        const updated = { ...current, ...update };
        next.set(fileId, updated);
        onProgress?.(updated);
        return next;
      });
    },
    [onProgress],
  );

  /**
   * Remove progress entry
   */
  const removeProgress = useCallback((fileId: string) => {
    setProgress((prev) => {
      const next = new Map(prev);
      next.delete(fileId);
      return next;
    });
  }, []);

  /**
   * Process upload queue
   */
  const processQueue = useCallback(() => {
    while (activeUploads.current < maxConcurrent && uploadQueue.current.length > 0) {
      const task = uploadQueue.current.shift();
      if (task) {
        activeUploads.current++;
        task().finally(() => {
          activeUploads.current--;
          processQueue();
        });
      }
    }

    // Update isUploading state
    if (activeUploads.current === 0 && uploadQueue.current.length === 0) {
      setIsUploading(false);
    }
  }, [maxConcurrent]);

  /**
   * Upload a single file via direct upload
   */
  const uploadDirect = useCallback(
    async (file: File, fileId: string, options?: UploadOptions): Promise<UploadResult> => {
      const abortController = new AbortController();
      abortControllers.current.set(fileId, abortController);

      try {
        updateProgress(fileId, {
          filename: file.name,
          progress: 0,
          status: 'uploading',
        });

        const formData = new FormData();
        formData.append('file', file);

        if (options) {
          formData.append('options', JSON.stringify(options));
        }

        const response = await fetch('/api/media/upload', {
          method: 'POST',
          body: formData,
          signal: abortController.signal,
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Upload failed');
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Upload failed');
        }

        const asset: MediaAsset = {
          id: data.data.id,
          tenant_id: '',
          folder_id: null,
          uploaded_by: '',
          filename: data.data.filename,
          original_filename: data.data.originalFilename,
          file_size: data.data.fileSize,
          mime_type: data.data.mimeType,
          asset_type: data.data.assetType,
          status: data.data.status,
          storage_path: '',
          public_url: data.data.publicUrl,
          thumbnail_url: data.data.thumbnailUrl,
          metadata: data.data.metadata,
          blurhash: data.data.blurhash,
          alt_text: null,
          description: null,
          tags: [],
          collections: [],
          usage_count: 0,
          last_used_at: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        updateProgress(fileId, {
          progress: 100,
          status: 'complete',
          asset,
        });

        onSuccess?.(asset);
        return { success: true, asset };
      } catch (err) {
        if ((err as Error).name === 'AbortError') {
          removeProgress(fileId);
          return { success: false, error: 'Upload cancelled' };
        }

        const error = err instanceof Error ? err : new Error('Upload failed');
        updateProgress(fileId, {
          status: 'error',
          error: error.message,
        });
        onError?.(error, file.name);
        return { success: false, error: error.message };
      } finally {
        abortControllers.current.delete(fileId);
      }
    },
    [updateProgress, removeProgress, onSuccess, onError],
  );

  /**
   * Upload a large file via signed URL
   */
  const uploadWithSignedUrl = useCallback(
    async (file: File, fileId: string, options?: UploadOptions): Promise<UploadResult> => {
      const abortController = new AbortController();
      abortControllers.current.set(fileId, abortController);

      try {
        updateProgress(fileId, {
          filename: file.name,
          progress: 0,
          status: 'uploading',
        });

        // Step 1: Get signed URL
        const signedUrlResponse = await fetch('/api/media/upload-url', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            filename: file.name,
            mimeType: file.type,
            fileSize: file.size,
            options,
          }),
          signal: abortController.signal,
        });

        if (!signedUrlResponse.ok) {
          const data = await signedUrlResponse.json();
          throw new Error(data.error || 'Failed to get upload URL');
        }

        const signedUrlData = await signedUrlResponse.json();

        if (!signedUrlData.success) {
          throw new Error(signedUrlData.error || 'Failed to get upload URL');
        }

        const { uploadUrl, assetId } = signedUrlData.data;

        // Step 2: Upload directly to storage
        updateProgress(fileId, { progress: 10 });

        const uploadResponse = await fetch(uploadUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type,
          },
          signal: abortController.signal,
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload file to storage');
        }

        updateProgress(fileId, { progress: 80, status: 'processing' });

        // Step 3: Complete processing
        const processResponse = await fetch('/api/media/process', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ assetId }),
          signal: abortController.signal,
        });

        if (!processResponse.ok) {
          const data = await processResponse.json();
          throw new Error(data.error || 'Failed to process upload');
        }

        const processData = await processResponse.json();

        if (!processData.success) {
          throw new Error(processData.error || 'Failed to process upload');
        }

        const asset: MediaAsset = {
          id: processData.data.id,
          tenant_id: '',
          folder_id: null,
          uploaded_by: '',
          filename: file.name,
          original_filename: file.name,
          file_size: file.size,
          mime_type: file.type,
          asset_type: getAssetTypeFromMimeType(file.type) || 'document',
          status: processData.data.status,
          storage_path: '',
          public_url: processData.data.publicUrl,
          thumbnail_url: processData.data.thumbnailUrl,
          metadata: processData.data.metadata,
          blurhash: processData.data.blurhash,
          alt_text: null,
          description: null,
          tags: [],
          collections: [],
          usage_count: 0,
          last_used_at: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        updateProgress(fileId, {
          progress: 100,
          status: 'complete',
          asset,
        });

        onSuccess?.(asset);
        return { success: true, asset };
      } catch (err) {
        if ((err as Error).name === 'AbortError') {
          removeProgress(fileId);
          return { success: false, error: 'Upload cancelled' };
        }

        const error = err instanceof Error ? err : new Error('Upload failed');
        updateProgress(fileId, {
          status: 'error',
          error: error.message,
        });
        onError?.(error, file.name);
        return { success: false, error: error.message };
      } finally {
        abortControllers.current.delete(fileId);
      }
    },
    [updateProgress, removeProgress, onSuccess, onError],
  );

  /**
   * Upload a single file
   */
  const upload = useCallback(
    async (file: File, uploadOptions?: UploadOptions): Promise<UploadResult> => {
      const fileId = generateFileId();

      // Validate file
      const assetType = getAssetTypeFromMimeType(file.type);
      if (assetType) {
        const validation = validateFileForType(
          { size: file.size, type: file.type, name: file.name },
          assetType,
        );
        if (!validation.valid) {
          const error = new Error(validation.error || 'Invalid file');
          onError?.(error, file.name);
          return { success: false, error: validation.error };
        }
      }

      setIsUploading(true);
      setError(null);

      // Choose upload method based on file size
      if (file.size > LARGE_FILE_THRESHOLD) {
        return uploadWithSignedUrl(file, fileId, uploadOptions);
      } else {
        return uploadDirect(file, fileId, uploadOptions);
      }
    },
    [uploadDirect, uploadWithSignedUrl, onError],
  );

  /**
   * Upload multiple files
   */
  const uploadMultiple = useCallback(
    async (files: File[], uploadOptions?: UploadOptions): Promise<BatchUploadResult> => {
      const successful: MediaAsset[] = [];
      const failed: Array<{ filename: string; error: string }> = [];

      setIsUploading(true);
      setError(null);

      // Create upload tasks
      const tasks = files.map((file) => {
        return async () => {
          const result = await upload(file, uploadOptions);
          if (result.success && result.asset) {
            successful.push(result.asset);
          } else {
            failed.push({ filename: file.name, error: result.error || 'Upload failed' });
          }
        };
      });

      // Add to queue and process
      uploadQueue.current.push(...tasks);
      processQueue();

      // Wait for all to complete
      await Promise.all(
        tasks.map(
          (task) =>
            new Promise<void>((resolve) => {
              const interval = setInterval(() => {
                if (!uploadQueue.current.includes(task)) {
                  clearInterval(interval);
                  resolve();
                }
              }, 100);
            }),
        ),
      );

      // Wait for active uploads to finish
      await new Promise<void>((resolve) => {
        const checkComplete = () => {
          if (activeUploads.current === 0) {
            resolve();
          } else {
            setTimeout(checkComplete, 100);
          }
        };
        checkComplete();
      });

      return { successful, failed };
    },
    [upload, processQueue],
  );

  /**
   * Cancel a specific upload
   */
  const cancelUpload = useCallback((fileId: string) => {
    const controller = abortControllers.current.get(fileId);
    if (controller) {
      controller.abort();
    }
  }, []);

  /**
   * Cancel all uploads
   */
  const cancelAll = useCallback(() => {
    for (const controller of abortControllers.current.values()) {
      controller.abort();
    }
    abortControllers.current.clear();
    uploadQueue.current = [];
    setProgress(new Map());
    setIsUploading(false);
  }, []);

  return {
    upload,
    uploadMultiple,
    progress,
    isUploading,
    error,
    cancelUpload,
    cancelAll,
  };
}
