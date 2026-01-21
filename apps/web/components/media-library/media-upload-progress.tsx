'use client';

import {
  AlertCircle,
  Box,
  Check,
  File,
  FileText,
  Image as ImageIcon,
  Loader2,
  Music,
  Video,
  X,
} from 'lucide-react';
import type React from 'react';
import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type { UploadProgress } from '@/lib/media/types';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

export interface MediaUploadProgressProps {
  progress: Map<string, UploadProgress>;
  onCancel?: (fileId: string) => void;
  onCancelAll?: () => void;
  onRemove?: (fileId: string) => void;
  showCancelAll?: boolean;
  className?: string;
}

export interface UploadProgressItemProps {
  item: UploadProgress;
  onCancel?: () => void;
  onRemove?: () => void;
}

// ============================================================================
// HELPERS
// ============================================================================

function getFileIcon(filename: string): React.ReactNode {
  const ext = filename.split('.').pop()?.toLowerCase() || '';

  // Images
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif'].includes(ext)) {
    return <ImageIcon className="h-4 w-4" />;
  }

  // Videos
  if (['mp4', 'webm', 'mov', 'avi'].includes(ext)) {
    return <Video className="h-4 w-4" />;
  }

  // Audio
  if (['mp3', 'wav', 'ogg', 'm4a', 'flac'].includes(ext)) {
    return <Music className="h-4 w-4" />;
  }

  // 3D models
  if (['glb', 'gltf', 'fbx', 'obj', 'usdz', 'vrm'].includes(ext)) {
    return <Box className="h-4 w-4" />;
  }

  // Documents
  if (['pdf', 'docx', 'pptx', 'xlsx'].includes(ext)) {
    return <FileText className="h-4 w-4" />;
  }

  return <File className="h-4 w-4" />;
}

function getStatusIcon(status: UploadProgress['status']): React.ReactNode {
  switch (status) {
    case 'complete':
      return <Check className="h-4 w-4 text-brand-success" />;
    case 'error':
      return <AlertCircle className="h-4 w-4 text-destructive" />;
    case 'uploading':
    case 'processing':
      return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
    default:
      return null;
  }
}

function getStatusText(status: UploadProgress['status']): string {
  switch (status) {
    case 'pending':
      return 'Waiting...';
    case 'uploading':
      return 'Uploading...';
    case 'processing':
      return 'Processing...';
    case 'complete':
      return 'Complete';
    case 'error':
      return 'Failed';
    default:
      return '';
  }
}

// ============================================================================
// UPLOAD PROGRESS ITEM
// ============================================================================

export function UploadProgressItem({ item, onCancel, onRemove }: UploadProgressItemProps) {
  const isActive = item.status === 'uploading' || item.status === 'processing';
  const isComplete = item.status === 'complete';
  const isError = item.status === 'error';

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg border bg-card',
        isError && 'border-destructive/50 bg-destructive/5',
        isComplete && 'border-brand-success/50 bg-brand-success/5',
      )}
    >
      {/* File icon */}
      <div className="shrink-0 text-muted-foreground">{getFileIcon(item.filename)}</div>

      {/* File info and progress */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium truncate">{item.filename}</p>
          <span className="shrink-0 text-xs text-muted-foreground">
            {getStatusText(item.status)}
          </span>
        </div>

        {/* Progress bar */}
        {isActive && (
          <div className="mt-2">
            <Progress value={item.progress} className="h-1.5" />
            <p className="mt-1 text-xs text-muted-foreground">{item.progress}%</p>
          </div>
        )}

        {/* Error message */}
        {isError && item.error && <p className="mt-1 text-xs text-destructive">{item.error}</p>}
      </div>

      {/* Status icon or actions */}
      <div className="shrink-0 flex items-center gap-1">
        {getStatusIcon(item.status)}

        {/* Cancel button for active uploads */}
        {isActive && onCancel && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              onCancel();
            }}
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Cancel upload</span>
          </Button>
        )}

        {/* Remove button for completed/failed uploads */}
        {(isComplete || isError) && onRemove && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Remove</span>
          </Button>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function MediaUploadProgress({
  progress,
  onCancel,
  onCancelAll,
  onRemove,
  showCancelAll = true,
  className,
}: MediaUploadProgressProps) {
  const items = useMemo(() => Array.from(progress.values()), [progress]);

  const stats = useMemo(() => {
    const total = items.length;
    const completed = items.filter((i) => i.status === 'complete').length;
    const failed = items.filter((i) => i.status === 'error').length;
    const active = items.filter(
      (i) => i.status === 'uploading' || i.status === 'processing',
    ).length;
    const pending = items.filter((i) => i.status === 'pending').length;

    const overallProgress =
      total > 0 ? Math.round(items.reduce((sum, i) => sum + i.progress, 0) / total) : 0;

    return { total, completed, failed, active, pending, overallProgress };
  }, [items]);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Overall progress header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-sm font-medium">
            Uploading {stats.active + stats.pending} of {stats.total} files
          </div>
          {stats.completed > 0 && (
            <span className="text-xs text-green-600">{stats.completed} complete</span>
          )}
          {stats.failed > 0 && (
            <span className="text-xs text-destructive">{stats.failed} failed</span>
          )}
        </div>

        {showCancelAll && stats.active > 0 && onCancelAll && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancelAll}
            className="text-destructive hover:text-destructive"
          >
            Cancel All
          </Button>
        )}
      </div>

      {/* Overall progress bar */}
      {stats.active > 0 && <Progress value={stats.overallProgress} className="h-2" />}

      {/* Individual file progress */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {items.map((item) => (
          <UploadProgressItem
            key={item.fileId}
            item={item}
            onCancel={onCancel ? () => onCancel(item.fileId) : undefined}
            onRemove={onRemove ? () => onRemove(item.fileId) : undefined}
          />
        ))}
      </div>
    </div>
  );
}

export default MediaUploadProgress;
