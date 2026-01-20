'use client';

import {
  Box,
  CloudUpload,
  File,
  FileText,
  Image as ImageIcon,
  Music,
  Sparkles,
  Upload,
  Video,
} from 'lucide-react';
import type React from 'react';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useMediaUpload } from '@/lib/hooks/use-media-upload';
import {
  FILE_SIZE_LIMITS,
  formatFileSize,
  type MediaAsset,
  MediaAssetType,
  SUPPORTED_FORMATS,
  type UploadOptions,
} from '@/lib/media/types';
import { cn } from '@/lib/utils';
import { MediaDropzone } from './media-dropzone';
import { MediaUploadProgress } from './media-upload-progress';

// ============================================================================
// TYPES
// ============================================================================

export interface MediaUploaderProps {
  onUploadComplete?: (assets: MediaAsset[]) => void;
  onUploadError?: (error: Error, filename: string) => void;
  accept?: MediaAssetType | MediaAssetType[];
  maxFiles?: number;
  uploadOptions?: UploadOptions;
  disabled?: boolean;
  compact?: boolean;
  showTypeHints?: boolean;
  className?: string;
}

// ============================================================================
// HELPERS
// ============================================================================

function getTypeIcon(type: MediaAssetType): React.ReactNode {
  switch (type) {
    case 'image':
      return <ImageIcon className="h-5 w-5" />;
    case 'video':
      return <Video className="h-5 w-5" />;
    case 'audio':
      return <Music className="h-5 w-5" />;
    case 'document':
      return <FileText className="h-5 w-5" />;
    case '3d_model':
      return <Box className="h-5 w-5" />;
    case 'ai_character':
      return <Sparkles className="h-5 w-5" />;
    case 'icon':
      return <ImageIcon className="h-5 w-5" />;
    default:
      return <File className="h-5 w-5" />;
  }
}

function getTypeLabel(type: MediaAssetType): string {
  switch (type) {
    case 'image':
      return 'Images';
    case 'video':
      return 'Video';
    case 'audio':
      return 'Audio';
    case 'document':
      return 'Documents';
    case '3d_model':
      return '3D Models';
    case 'ai_character':
      return 'AI Characters';
    case 'icon':
      return 'Icons';
    default:
      return 'Files';
  }
}

function getAcceptedFormats(type: MediaAssetType): string {
  const formats = SUPPORTED_FORMATS[type];
  return formats.extensions.map((e) => e.replace('.', '').toUpperCase()).join(', ');
}

function getMaxSize(type: MediaAssetType): string {
  return formatFileSize(FILE_SIZE_LIMITS[type]);
}

// ============================================================================
// COMPONENT
// ============================================================================

export function MediaUploader({
  onUploadComplete,
  onUploadError,
  accept,
  maxFiles,
  uploadOptions,
  disabled = false,
  compact = false,
  showTypeHints = true,
  className,
}: MediaUploaderProps) {
  const [rejectedFiles, setRejectedFiles] = useState<Array<{ name: string; reason: string }>>([]);

  const handleSuccess = useCallback(
    (asset: MediaAsset) => {
      onUploadComplete?.([asset]);
    },
    [onUploadComplete],
  );

  const handleError = useCallback(
    (error: Error, filename: string) => {
      onUploadError?.(error, filename);
    },
    [onUploadError],
  );

  const { upload, uploadMultiple, progress, isUploading, cancelUpload, cancelAll } = useMediaUpload(
    {
      onSuccess: handleSuccess,
      onError: handleError,
    },
  );

  const handleDrop = useCallback(
    async (files: File[]) => {
      setRejectedFiles([]);

      if (files.length === 1) {
        await upload(files[0], uploadOptions);
      } else {
        await uploadMultiple(files, uploadOptions);
      }
    },
    [upload, uploadMultiple, uploadOptions],
  );

  const handleDropRejected = useCallback((files: File[], reasons: string[]) => {
    setRejectedFiles(
      files.map((file, idx) => ({
        name: file.name,
        reason: reasons[idx] || 'Invalid file',
      })),
    );
  }, []);

  const handleRemoveProgress = useCallback(() => {
    // Progress entries are automatically cleaned up
  }, []);

  const acceptedTypes = accept
    ? Array.isArray(accept)
      ? accept
      : [accept]
    : Object.values(MediaAssetType);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Dropzone */}
      <MediaDropzone
        onDrop={handleDrop}
        onDropRejected={handleDropRejected}
        accept={accept}
        maxFiles={maxFiles}
        disabled={disabled || isUploading}
        className={cn(
          'rounded-lg border-2 border-dashed transition-colors cursor-pointer',
          'hover:border-primary hover:bg-primary/5',
          disabled && 'opacity-50 cursor-not-allowed hover:border-border hover:bg-transparent',
        )}
        activeClassName="border-primary bg-primary/10"
        rejectClassName="border-destructive bg-destructive/10"
      >
        <div
          className={cn(
            'flex flex-col items-center justify-center text-center',
            compact ? 'p-6' : 'p-10',
          )}
        >
          <div className={cn('rounded-full bg-primary/10 p-4 mb-4', compact && 'p-3 mb-3')}>
            <CloudUpload className={cn('text-primary', compact ? 'h-6 w-6' : 'h-8 w-8')} />
          </div>

          <h3 className={cn('font-semibold text-foreground', compact ? 'text-base' : 'text-lg')}>
            Drop files here or click to browse
          </h3>

          <p className="text-sm text-muted-foreground mt-1">
            {maxFiles === 1
              ? 'Upload a file'
              : maxFiles
                ? `Upload up to ${maxFiles} files`
                : 'Upload multiple files'}
          </p>

          {/* Type hints */}
          {showTypeHints && !compact && (
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {acceptedTypes.slice(0, 4).map((type) => (
                <div
                  key={type}
                  className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full"
                >
                  {getTypeIcon(type)}
                  <span>{getTypeLabel(type)}</span>
                  <span className="text-muted-foreground/60">({getMaxSize(type)})</span>
                </div>
              ))}
            </div>
          )}

          {/* Browse button */}
          <Button
            variant="outline"
            size={compact ? 'sm' : 'default'}
            className="mt-4"
            disabled={disabled || isUploading}
          >
            <Upload className="h-4 w-4 mr-2" />
            Browse Files
          </Button>
        </div>
      </MediaDropzone>

      {/* Rejected files warning */}
      {rejectedFiles.length > 0 && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-sm font-medium text-destructive mb-2">
            Some files could not be uploaded:
          </p>
          <ul className="text-sm text-destructive/80 space-y-1">
            {rejectedFiles.map((file, i) => (
              <li key={i}>
                {file.name}: {file.reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Upload progress */}
      {progress.size > 0 && (
        <MediaUploadProgress
          progress={progress}
          onCancel={cancelUpload}
          onCancelAll={cancelAll}
          onRemove={handleRemoveProgress}
        />
      )}

      {/* Format hints */}
      {showTypeHints && !compact && acceptedTypes.length === 1 && (
        <div className="text-xs text-muted-foreground">
          <p>
            <strong>Accepted formats:</strong> {getAcceptedFormats(acceptedTypes[0])}
          </p>
          <p>
            <strong>Maximum size:</strong> {getMaxSize(acceptedTypes[0])}
          </p>
        </div>
      )}
    </div>
  );
}

export default MediaUploader;
