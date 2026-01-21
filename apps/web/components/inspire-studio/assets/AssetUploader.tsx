'use client';

import { AlertCircle, FileAudio, FileImage, FileText, FileVideo, Upload, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { optimizeImage } from '@/lib/assets/imageOptimizer';
import {
  type AssetCategory,
  formatFileSize,
  getAssetCategory,
  getSizeLimit,
  isAllowedMimeType,
  isWithinSizeLimit,
} from '@/lib/assets/mimeTypes';
import { type AssetMetadata, type UploadProgress, uploadAsset } from '@/lib/assets/storage';
import { cn } from '@/lib/utils';

// =============================================================================
// Types
// =============================================================================

interface PendingUpload {
  id: string;
  file: File;
  preview?: string;
  progress: number;
  status: 'pending' | 'uploading' | 'optimizing' | 'success' | 'error';
  error?: string;
  result?: AssetMetadata;
}

interface AssetUploaderProps {
  tenantId: string;
  userId: string;
  onUploadComplete?: (assets: AssetMetadata[]) => void;
  onUploadError?: (error: Error) => void;
  maxFiles?: number;
  acceptedTypes?: AssetCategory[];
  className?: string;
}

// =============================================================================
// Category Icons
// =============================================================================

const CategoryIcon: Record<AssetCategory, typeof FileImage> = {
  image: FileImage,
  video: FileVideo,
  audio: FileAudio,
  document: FileText,
};

// =============================================================================
// Asset Uploader Component
// =============================================================================

export function AssetUploader({
  tenantId,
  userId,
  onUploadComplete,
  onUploadError,
  maxFiles = 10,
  acceptedTypes: _acceptedTypes,
  className,
}: AssetUploaderProps) {
  // Note: acceptedTypes is available for future filtering by category
  void _acceptedTypes;
  const [uploads, setUploads] = useState<PendingUpload[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Handle file drop
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const newUploads: PendingUpload[] = [];

      for (const file of acceptedFiles.slice(0, maxFiles - uploads.length)) {
        // Validate file
        if (!isAllowedMimeType(file.type)) {
          newUploads.push({
            id: crypto.randomUUID(),
            file,
            progress: 0,
            status: 'error',
            error: `File type not allowed: ${file.type}`,
          });
          continue;
        }

        if (!isWithinSizeLimit(file.type, file.size)) {
          const limit = getSizeLimit(file.type);
          newUploads.push({
            id: crypto.randomUUID(),
            file,
            progress: 0,
            status: 'error',
            error: `File exceeds ${formatFileSize(limit)} limit`,
          });
          continue;
        }

        const category = getAssetCategory(file.type);
        const preview = category === 'image' ? URL.createObjectURL(file) : undefined;

        newUploads.push({
          id: crypto.randomUUID(),
          file,
          preview,
          progress: 0,
          status: 'pending',
        });
      }

      setUploads((prev) => [...prev, ...newUploads]);
    },
    [maxFiles, uploads.length],
  );

  // Configure dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: maxFiles - uploads.length,
    disabled: isProcessing || uploads.length >= maxFiles,
  });

  // Remove upload from list
  const removeUpload = useCallback((id: string) => {
    setUploads((prev) => {
      const upload = prev.find((u) => u.id === id);
      if (upload?.preview) {
        URL.revokeObjectURL(upload.preview);
      }
      return prev.filter((u) => u.id !== id);
    });
  }, []);

  // Process all uploads
  const processUploads = useCallback(async () => {
    setIsProcessing(true);
    const completedAssets: AssetMetadata[] = [];

    try {
      for (let i = 0; i < uploads.length; i++) {
        const upload = uploads[i];
        if (upload.status !== 'pending') continue;

        // Update status to uploading
        setUploads((prev) =>
          prev.map((u) => (u.id === upload.id ? { ...u, status: 'optimizing' as const } : u)),
        );

        let fileToUpload: File | Blob = upload.file;
        let width: number | undefined;
        let height: number | undefined;

        // Optimize images before upload
        const category = getAssetCategory(upload.file.type);
        if (category === 'image' && upload.file.type !== 'image/svg+xml') {
          try {
            const optimized = await optimizeImage(upload.file, {
              maxWidth: 2048,
              maxHeight: 2048,
              quality: 0.85,
            });
            fileToUpload = optimized.blob;
            width = optimized.width;
            height = optimized.height;
          } catch {
            // Fall back to original if optimization fails
          }
        }

        // Update status to uploading
        setUploads((prev) =>
          prev.map((u) => (u.id === upload.id ? { ...u, status: 'uploading' as const } : u)),
        );

        try {
          const result = await uploadAsset(fileToUpload, tenantId, userId, upload.file.name, {
            width,
            height,
            onProgress: (progress: UploadProgress) => {
              setUploads((prev) =>
                prev.map((u) => (u.id === upload.id ? { ...u, progress: progress.progress } : u)),
              );
            },
          });

          completedAssets.push(result.asset);

          setUploads((prev) =>
            prev.map((u) =>
              u.id === upload.id
                ? { ...u, status: 'success' as const, progress: 100, result: result.asset }
                : u,
            ),
          );
        } catch (error) {
          setUploads((prev) =>
            prev.map((u) =>
              u.id === upload.id
                ? {
                    ...u,
                    status: 'error' as const,
                    error: error instanceof Error ? error.message : 'Upload failed',
                  }
                : u,
            ),
          );
        }
      }

      if (completedAssets.length > 0) {
        onUploadComplete?.(completedAssets);
      }
    } catch (error) {
      onUploadError?.(error instanceof Error ? error : new Error('Upload failed'));
    } finally {
      setIsProcessing(false);
    }
  }, [uploads, tenantId, userId, onUploadComplete, onUploadError]);

  // Clear completed uploads
  const clearCompleted = useCallback(() => {
    setUploads((prev) => {
      for (const upload of prev) {
        if (upload.preview && upload.status === 'success') {
          URL.revokeObjectURL(upload.preview);
        }
      }
      return prev.filter((u) => u.status !== 'success');
    });
  }, []);

  const pendingCount = uploads.filter((u) => u.status === 'pending').length;
  const hasCompleted = uploads.some((u) => u.status === 'success');

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          'relative flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed rounded-lg transition-colors cursor-pointer',
          isDragActive
            ? 'border-lxd-cyan bg-lxd-cyan/10'
            : 'border-lxd-dark-border hover:border-lxd-cyan/50 bg-lxd-dark-surface',
          (isProcessing || uploads.length >= maxFiles) && 'opacity-50 cursor-not-allowed',
        )}
      >
        <input {...getInputProps()} />
        <div
          className={cn(
            'w-12 h-12 rounded-full flex items-center justify-center',
            isDragActive ? 'bg-lxd-cyan/20' : 'bg-lxd-dark-bg',
          )}
        >
          <Upload className={cn('w-6 h-6', isDragActive ? 'text-lxd-cyan' : 'text-white/60')} />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-white">
            {isDragActive ? 'Drop files here' : 'Drag & drop files'}
          </p>
          <p className="text-xs text-white/50 mt-1">
            or click to browse ({maxFiles - uploads.length} remaining)
          </p>
        </div>
      </div>

      {/* Upload List */}
      {uploads.length > 0 && (
        <div className="space-y-2">
          {uploads.map((upload) => {
            const category = getAssetCategory(upload.file.type);
            const Icon = category ? CategoryIcon[category] : FileText;

            return (
              <div
                key={upload.id}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg bg-lxd-dark-surface border',
                  upload.status === 'error'
                    ? 'border-red-500/30'
                    : upload.status === 'success'
                      ? 'border-green-500/30'
                      : 'border-lxd-dark-border',
                )}
              >
                {/* Preview/Icon */}
                <div className="flex-shrink-0 w-10 h-10 rounded bg-lxd-dark-bg flex items-center justify-center overflow-hidden">
                  {upload.preview ? (
                    <img
                      src={upload.preview}
                      alt={upload.file.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Icon className="w-5 h-5 text-white/40" />
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{upload.file.name}</p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-white/50">{formatFileSize(upload.file.size)}</span>
                    {upload.status === 'error' && (
                      <span className="flex items-center gap-1 text-red-400">
                        <AlertCircle className="w-3 h-3" />
                        {upload.error}
                      </span>
                    )}
                    {upload.status === 'optimizing' && (
                      <span className="text-lxd-cyan">Optimizing...</span>
                    )}
                    {upload.status === 'uploading' && (
                      <span className="text-lxd-cyan">
                        Uploading {Math.round(upload.progress)}%
                      </span>
                    )}
                    {upload.status === 'success' && (
                      <span className="text-green-400">Complete</span>
                    )}
                  </div>
                  {upload.status === 'uploading' && (
                    <Progress value={upload.progress} className="h-1 mt-1" />
                  )}
                </div>

                {/* Remove Button */}
                {(upload.status === 'pending' || upload.status === 'error') && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="flex-shrink-0 h-8 w-8"
                    onClick={() => removeUpload(upload.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Actions */}
      {uploads.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {hasCompleted && (
              <Button type="button" variant="outline" size="sm" onClick={clearCompleted}>
                Clear Completed
              </Button>
            )}
          </div>
          {pendingCount > 0 && (
            <Button
              type="button"
              size="sm"
              onClick={processUploads}
              disabled={isProcessing}
              className="bg-lxd-cyan hover:bg-lxd-cyan/80"
            >
              {isProcessing
                ? 'Uploading...'
                : `Upload ${pendingCount} File${pendingCount > 1 ? 's' : ''}`}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default AssetUploader;
