'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, FileArchive, Loader2, Upload, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { type ScormManifest, useScormUpload } from '@/lib/hooks/use-scorm-upload';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

interface ScormUploadProps {
  tenantId: string;
  courseId: string;
  onSuccess?: (manifest: ScormManifest) => void;
  onError?: (error: Error) => void;
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ScormUpload({
  tenantId,
  courseId,
  onSuccess,
  onError,
  className,
}: ScormUploadProps) {
  const { upload, progress, reset } = useScormUpload();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/zip': ['.zip'],
      'application/x-zip-compressed': ['.zip'],
    },
    maxFiles: 1,
    disabled: progress.phase === 'uploading' || progress.phase === 'extracting',
  });

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      const manifest = await upload(selectedFile, tenantId, courseId);
      onSuccess?.(manifest);
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error('Upload failed'));
    }
  };

  const handleReset = () => {
    reset();
    setSelectedFile(null);
  };

  const isProcessing =
    progress.phase === 'extracting' ||
    progress.phase === 'validating' ||
    progress.phase === 'uploading';

  return (
    <div className={cn('w-full max-w-2xl mx-auto', className)}>
      <AnimatePresence mode="wait">
        {progress.phase === 'complete' ? (
          // Success State
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="rounded-xl border-2 border-[var(--color-lxd-success)]/50 bg-[var(--color-lxd-success)]/5 p-8 text-center"
          >
            <CheckCircle2 className="h-12 w-12 mx-auto text-[var(--color-lxd-success)] mb-4" />
            <h3 className="text-lg font-semibold text-foreground">Package Uploaded Successfully</h3>
            <p className="text-sm text-muted-foreground mt-2">
              {progress.uploadedFiles} files extracted and uploaded
            </p>
            <Button type="button" variant="outline" className="mt-4" onClick={handleReset}>
              Upload Another Package
            </Button>
          </motion.div>
        ) : progress.phase === 'error' ? (
          // Error State
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="rounded-xl border-2 border-[var(--color-lxd-error)]/50 bg-[var(--color-lxd-error)]/5 p-8 text-center"
          >
            <AlertCircle className="h-12 w-12 mx-auto text-[var(--color-lxd-error)] mb-4" />
            <h3 className="text-lg font-semibold text-foreground">Upload Failed</h3>
            <p className="text-sm text-muted-foreground mt-2">{progress.error}</p>
            <Button type="button" variant="outline" className="mt-4" onClick={handleReset}>
              Try Again
            </Button>
          </motion.div>
        ) : (
          // Upload State
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Dropzone */}
            <div
              {...getRootProps()}
              className={cn(
                'rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-200',
                isDragActive
                  ? 'border-[var(--color-lxd-primary)] bg-[var(--color-lxd-primary)]/5'
                  : 'border-border hover:border-[var(--color-lxd-primary)]/50',
                isProcessing && 'cursor-not-allowed opacity-50',
              )}
            >
              <input {...getInputProps()} />

              {selectedFile ? (
                <div className="flex items-center justify-center gap-3">
                  <FileArchive className="h-8 w-8 text-[var(--color-lxd-primary)]" />
                  <div className="text-left">
                    <p className="font-medium text-foreground">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                  {!isProcessing && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="ml-auto"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <p className="font-medium text-foreground">
                    {isDragActive
                      ? 'Drop your SCORM/xAPI package here'
                      : 'Drag & drop your package'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Supports SCORM 1.2, SCORM 2004, xAPI, and cmi5 packages (.zip)
                  </p>
                </>
              )}
            </div>

            {/* Progress */}
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 space-y-3"
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {progress.phase === 'extracting' && 'Extracting package...'}
                    {progress.phase === 'validating' && 'Validating structure...'}
                    {progress.phase === 'uploading' &&
                      `Uploading ${progress.uploadedFiles}/${progress.totalFiles} files...`}
                  </span>
                  <span className="tabular-nums font-medium">{progress.progress}%</span>
                </div>
                <Progress value={progress.progress} className="h-2" />
                {progress.currentFile && (
                  <p className="text-xs text-muted-foreground truncate">{progress.currentFile}</p>
                )}
              </motion.div>
            )}

            {/* Upload Button */}
            {selectedFile && !isProcessing && (
              <Button
                type="button"
                className="mt-4 w-full bg-[var(--color-lxd-primary)] hover:bg-[var(--color-lxd-primary)]/90"
                onClick={handleUpload}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload & Extract Package
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ScormUpload;
