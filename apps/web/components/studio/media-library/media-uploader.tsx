'use client';

import { cn } from '@lxd360/ui';
import { AlertCircle, CheckCircle2, Loader2, Upload, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  getAcceptString,
  isFileTypeSupported,
  type MediaAssetType,
  type UploadProgress,
} from '@/lib/media/types';

// =============================================================================
// Types
// =============================================================================

export interface MediaUploaderProps {
  onUpload: (files: File[]) => void;
  uploading?: Map<string, UploadProgress>;
  acceptTypes?: MediaAssetType[];
  maxFiles?: number;
  className?: string;
}

// =============================================================================
// Component
// =============================================================================

export function MediaUploader({
  onUpload,
  uploading = new Map(),
  acceptTypes,
  maxFiles = 10,
  className,
}: MediaUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const droppedFiles = Array.from(e.dataTransfer.files);
      const validFiles = droppedFiles.filter((file) => {
        const ext = file.name.split('.').pop();
        return isFileTypeSupported(file.type, ext);
      });

      if (validFiles.length > 0) {
        onUpload(validFiles.slice(0, maxFiles));
      }
    },
    [onUpload, maxFiles],
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || []);
      if (selectedFiles.length > 0) {
        onUpload(selectedFiles.slice(0, maxFiles));
      }
      // Reset input
      e.target.value = '';
    },
    [onUpload, maxFiles],
  );

  const acceptString = getAcceptString(acceptTypes);
  const uploadingItems = Array.from(uploading.values());

  return (
    <div className={cn('space-y-4', className)}>
      {/* Drop Zone */}
      <div
        role="region"
        aria-label="File drop zone"
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
          isDragOver
            ? 'border-primary bg-primary/10'
            : 'border-white/10 hover:border-white/20 bg-zinc-900/50',
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center">
          <div
            className={cn(
              'h-12 w-12 rounded-full flex items-center justify-center mb-4 transition-colors',
              isDragOver ? 'bg-primary/20' : 'bg-zinc-800',
            )}
          >
            <Upload className={cn('h-6 w-6', isDragOver ? 'text-primary' : 'text-zinc-500')} />
          </div>

          <p className="text-zinc-300 mb-1">
            {isDragOver ? 'Drop files here' : 'Drag and drop files here'}
          </p>
          <p className="text-sm text-zinc-500 mb-4">or</p>

          <label>
            <input
              type="file"
              accept={acceptString}
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
            <Button type="button" variant="outline" className="border-white/10" asChild>
              <span className="cursor-pointer">Browse Files</span>
            </Button>
          </label>

          <p className="text-xs text-zinc-600 mt-4">
            Supports images, videos, audio, documents, and 3D models
          </p>
        </div>
      </div>

      {/* Upload Progress */}
      {uploadingItems.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-zinc-400">Uploading</p>
          <div className="space-y-2">
            {uploadingItems.map((item) => (
              <UploadProgressItem key={item.fileId} progress={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Upload Progress Item
// =============================================================================

interface UploadProgressItemProps {
  progress: UploadProgress;
  onCancel?: () => void;
}

function UploadProgressItem({ progress, onCancel }: UploadProgressItemProps) {
  const { filename, progress: percent, status, error } = progress;

  return (
    <div className="flex items-center gap-3 p-3 bg-zinc-900 rounded-lg border border-white/5">
      {/* Status Icon */}
      <div className="flex-shrink-0">
        {status === 'complete' && <CheckCircle2 className="h-5 w-5 text-green-500" />}
        {status === 'error' && <AlertCircle className="h-5 w-5 text-destructive" />}
        {(status === 'uploading' || status === 'processing') && (
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        )}
        {status === 'pending' && <div className="h-5 w-5 rounded-full bg-zinc-700" />}
      </div>

      {/* File Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm truncate" title={filename}>
          {filename}
        </p>
        {error ? (
          <p className="text-xs text-destructive">{error}</p>
        ) : (
          <div className="flex items-center gap-2 mt-1">
            <Progress value={percent} className="h-1 flex-1" />
            <span className="text-xs text-zinc-500 w-10">{percent}%</span>
          </div>
        )}
      </div>

      {/* Cancel Button */}
      {onCancel && (status === 'uploading' || status === 'pending') && (
        <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={onCancel}>
          <X className="h-4 w-4" />
          <span className="sr-only">Cancel upload</span>
        </Button>
      )}
    </div>
  );
}
