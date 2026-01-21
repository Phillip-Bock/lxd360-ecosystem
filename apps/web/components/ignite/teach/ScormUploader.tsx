'use client';

import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { AlertCircle, CheckCircle2, FileArchive, Loader2, Upload, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { storage } from '@/lib/firebase/client';
import { cn } from '@/lib/utils';

export interface ScormUploadResult {
  packageUrl: string;
  fileName: string;
  fileSize: number;
  storagePath: string;
}

export interface ScormUploaderProps {
  /** Tenant ID for storage path */
  tenantId: string;
  /** Course ID for storage path (auto-generated if not provided) */
  courseId?: string;
  /** Callback when upload completes successfully */
  onUploadComplete: (result: ScormUploadResult) => void;
  /** Callback when upload fails */
  onUploadError?: (error: Error) => void;
  /** Whether the uploader is disabled */
  disabled?: boolean;
  /** Additional class names */
  className?: string;
}

type UploadState = 'idle' | 'uploading' | 'success' | 'error';

/**
 * ScormUploader - Upload SCORM packages to Firebase Storage
 *
 * Handles .zip file uploads to tenants/{tenantId}/scorm/{courseId}/{filename}
 * with progress tracking and validation.
 */
export function ScormUploader({
  tenantId,
  courseId,
  onUploadComplete,
  onUploadError,
  disabled = false,
  className,
}: ScormUploaderProps) {
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const generateCourseId = useCallback(() => {
    return `course_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!file.name.toLowerCase().endsWith('.zip')) {
      return 'Only .zip files are allowed for SCORM packages';
    }

    // Check file size (max 500MB)
    const maxSize = 500 * 1024 * 1024;
    if (file.size > maxSize) {
      return 'File size exceeds 500MB limit';
    }

    return null;
  };

  const uploadFile = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setErrorMessage(validationError);
      setUploadState('error');
      onUploadError?.(new Error(validationError));
      return;
    }

    setUploadState('uploading');
    setFileName(file.name);
    setFileSize(file.size);
    setProgress(0);
    setErrorMessage(null);

    try {
      const effectiveCourseId = courseId ?? generateCourseId();
      const timestamp = Date.now();
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storagePath = `tenants/${tenantId}/scorm/${effectiveCourseId}/${timestamp}_${sanitizedFileName}`;

      const storageRef = ref(storage, storagePath);

      const uploadTask = uploadBytesResumable(storageRef, file, {
        contentType: 'application/zip',
        customMetadata: {
          tenantId,
          courseId: effectiveCourseId,
          originalFileName: file.name,
          uploadedAt: new Date().toISOString(),
        },
      });

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progressPercent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(Math.round(progressPercent));
        },
        (error) => {
          setErrorMessage(error.message);
          setUploadState('error');
          onUploadError?.(error);
        },
        async () => {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          setUploadState('success');

          onUploadComplete({
            packageUrl: downloadUrl,
            fileName: file.name,
            fileSize: file.size,
            storagePath,
          });
        },
      );
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Upload failed');
      setErrorMessage(err.message);
      setUploadState('error');
      onUploadError?.(err);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
    // Reset input to allow re-uploading same file
    event.target.value = '';
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    const file = event.dataTransfer.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  const handleReset = () => {
    setUploadState('idle');
    setProgress(0);
    setFileName(null);
    setFileSize(0);
    setErrorMessage(null);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload Zone */}
      <section
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        aria-label="SCORM package upload zone"
        className={cn(
          'relative rounded-lg border-2 border-dashed transition-all duration-200',
          uploadState === 'idle' &&
            !isDragging &&
            'border-border bg-muted/20 hover:border-lxd-primary/50',
          isDragging && 'border-lxd-primary bg-lxd-primary/5',
          uploadState === 'success' && 'border-emerald-500/50 bg-emerald-500/5',
          uploadState === 'error' && 'border-red-500/50 bg-red-500/5',
          uploadState === 'uploading' && 'border-lxd-primary/50 bg-lxd-primary/5',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
      >
        {uploadState === 'idle' && (
          <label
            className={cn(
              'flex flex-col items-center justify-center gap-3 p-8 cursor-pointer',
              disabled && 'cursor-not-allowed',
            )}
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted/50">
              <Upload className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">
                {isDragging ? 'Drop your SCORM package here' : 'Upload SCORM Package'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Drag & drop or click to browse (.zip, max 500MB)
              </p>
            </div>
            <input
              type="file"
              accept=".zip"
              onChange={handleFileChange}
              disabled={disabled}
              className="hidden"
            />
          </label>
        )}

        {uploadState === 'uploading' && (
          <div className="flex flex-col items-center justify-center gap-4 p-8">
            <div className="flex items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-lxd-primary" />
              <FileArchive className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="w-full max-w-xs space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="truncate max-w-[180px]">{fileName}</span>
                <span className="text-muted-foreground">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">
                Uploading {formatFileSize(fileSize)}...
              </p>
            </div>
          </div>
        )}

        {uploadState === 'success' && (
          <div className="flex flex-col items-center justify-center gap-4 p-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10">
              <CheckCircle2 className="h-7 w-7 text-emerald-500" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-emerald-500">Upload Complete</p>
              <p className="text-xs text-muted-foreground mt-1 truncate max-w-[250px]">
                {fileName} ({formatFileSize(fileSize)})
              </p>
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={handleReset}>
              Upload Different File
            </Button>
          </div>
        )}

        {uploadState === 'error' && (
          <div className="flex flex-col items-center justify-center gap-4 p-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
              <AlertCircle className="h-7 w-7 text-red-500" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-red-500">Upload Failed</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-[250px]">
                {errorMessage ?? 'An error occurred during upload'}
              </p>
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={handleReset}>
              <X className="h-4 w-4 mr-1" />
              Try Again
            </Button>
          </div>
        )}
      </section>

      {/* SCORM Info */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p className="font-medium">Supported SCORM Versions:</p>
        <ul className="list-disc list-inside space-y-0.5 pl-2">
          <li>SCORM 1.2</li>
          <li>SCORM 2004 (all editions)</li>
        </ul>
      </div>
    </div>
  );
}
