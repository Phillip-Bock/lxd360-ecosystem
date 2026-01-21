'use client';

import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getAcceptString,
  getAssetTypeFromMimeType,
  isFileTypeSupported,
  type MediaAssetType,
  validateFileForType,
} from '@/lib/media/types';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

export interface MediaDropzoneProps {
  children: React.ReactNode;
  onDrop: (files: File[]) => void;
  onDropRejected?: (files: File[], reasons: string[]) => void;
  accept?: MediaAssetType | MediaAssetType[];
  maxFiles?: number;
  disabled?: boolean;
  className?: string;
  activeClassName?: string;
  rejectClassName?: string;
  noClick?: boolean;
  noDrag?: boolean;
  noPaste?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function MediaDropzone({
  children,
  onDrop,
  onDropRejected,
  accept,
  maxFiles,
  disabled = false,
  className,
  activeClassName = 'ring-2 ring-primary ring-offset-2 bg-primary/5',
  rejectClassName = 'ring-2 ring-destructive ring-offset-2 bg-destructive/5',
  noClick = false,
  noDrag = false,
  noPaste = false,
}: MediaDropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [isDragRejected, setIsDragRejected] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  /**
   * Validate files against accept criteria
   */
  const validateFiles = useCallback(
    (files: File[]): { accepted: File[]; rejected: { file: File; reason: string }[] } => {
      const accepted: File[] = [];
      const rejected: { file: File; reason: string }[] = [];

      for (const file of files) {
        // Check if file type is supported
        if (!isFileTypeSupported(file.type, file.name.split('.').pop())) {
          rejected.push({ file, reason: 'Unsupported file type' });
          continue;
        }

        // If specific types are required, validate against them
        if (accept) {
          const types = Array.isArray(accept) ? accept : [accept];
          const assetType = getAssetTypeFromMimeType(file.type);

          if (!assetType || !types.includes(assetType)) {
            rejected.push({
              file,
              reason: `File type not accepted. Expected: ${types.join(', ')}`,
            });
            continue;
          }

          const validation = validateFileForType(
            { size: file.size, type: file.type, name: file.name },
            assetType,
          );
          if (!validation.valid) {
            rejected.push({ file, reason: validation.error || 'Validation failed' });
            continue;
          }
        }

        accepted.push(file);
      }

      // Apply maxFiles limit
      if (maxFiles && accepted.length > maxFiles) {
        const excess = accepted.splice(maxFiles);
        excess.forEach((file) => {
          rejected.push({ file, reason: `Maximum ${maxFiles} files allowed` });
        });
      }

      return { accepted, rejected };
    },
    [accept, maxFiles],
  );

  /**
   * Handle files from various sources
   */
  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;

      const files = Array.from(fileList);
      const { accepted, rejected } = validateFiles(files);

      if (accepted.length > 0) {
        onDrop(accepted);
      }

      if (rejected.length > 0 && onDropRejected) {
        onDropRejected(
          rejected.map((r) => r.file),
          rejected.map((r) => r.reason),
        );
      }
    },
    [validateFiles, onDrop, onDropRejected],
  );

  /**
   * Handle drag enter
   */
  const handleDragEnter = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (disabled || noDrag) return;

      dragCounter.current++;

      if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
        setIsDragActive(true);

        // Check if unknown files would be rejected
        const items = Array.from(e.dataTransfer.items);
        const hasInvalidType = items.some((item) => {
          if (item.kind !== 'file') return true;
          if (!isFileTypeSupported(item.type)) return true;
          return false;
        });

        setIsDragRejected(hasInvalidType);
      }
    },
    [disabled, noDrag],
  );

  /**
   * Handle drag leave
   */
  const handleDragLeave = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (disabled || noDrag) return;

      dragCounter.current--;

      if (dragCounter.current === 0) {
        setIsDragActive(false);
        setIsDragRejected(false);
      }
    },
    [disabled, noDrag],
  );

  /**
   * Handle drag over
   */
  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (disabled || noDrag) return;

      e.dataTransfer.dropEffect = 'copy';
    },
    [disabled, noDrag],
  );

  /**
   * Handle drop
   */
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (disabled || noDrag) return;

      dragCounter.current = 0;
      setIsDragActive(false);
      setIsDragRejected(false);

      handleFiles(e.dataTransfer.files);
    },
    [disabled, noDrag, handleFiles],
  );

  /**
   * Handle click to open file dialog
   */
  const handleClick = useCallback(() => {
    if (disabled || noClick) return;
    inputRef.current?.click();
  }, [disabled, noClick]);

  /**
   * Handle file input change
   */
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files);
      // Reset input value to allow selecting the same file again
      e.target.value = '';
    },
    [handleFiles],
  );

  /**
   * Handle paste
   */
  useEffect(() => {
    if (disabled || noPaste) return;

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const files: File[] = [];
      for (const item of Array.from(items)) {
        if (item.kind === 'file') {
          const file = item.getAsFile();
          if (file) files.push(file);
        }
      }

      if (files.length > 0) {
        const dataTransfer = new DataTransfer();
        for (const file of files) {
          dataTransfer.items.add(file);
        }
        handleFiles(dataTransfer.files);
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [disabled, noPaste, handleFiles]);

  const acceptString = getAcceptString(accept);

  return (
    <div
      className={cn(
        'relative transition-all duration-200',
        className,
        isDragActive && !isDragRejected && activeClassName,
        isDragRejected && rejectClassName,
        disabled && 'opacity-50 cursor-not-allowed',
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
      role={noClick ? undefined : 'button'}
      tabIndex={noClick || disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <input
        ref={inputRef}
        type="file"
        multiple={maxFiles !== 1}
        accept={acceptString}
        onChange={handleInputChange}
        disabled={disabled}
        className="sr-only"
        tabIndex={-1}
      />
      {children}
    </div>
  );
}

export default MediaDropzone;
