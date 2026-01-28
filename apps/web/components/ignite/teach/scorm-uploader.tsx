'use client';

import { ref, uploadBytesResumable } from 'firebase/storage';
import JSZip from 'jszip';
import {
  AlertCircle,
  CheckCircle2,
  FileArchive,
  FolderOpen,
  Loader2,
  Package,
  Upload,
  X,
} from 'lucide-react';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { requireStorage } from '@/lib/firebase/client';
import { cn } from '@/lib/utils';

export interface ScormUploadResult {
  /** Base URL for the extracted SCORM content */
  baseUrl: string;
  /** Launch URL (entry point from manifest) */
  launchUrl: string;
  /** Original package file name */
  fileName: string;
  /** Original package file size */
  fileSize: number;
  /** Storage base path */
  storagePath: string;
  /** Number of files extracted and uploaded */
  filesCount: number;
  /** SCORM version detected from manifest */
  scormVersion: string;
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

type UploadState = 'idle' | 'processing' | 'uploading' | 'success' | 'error';

interface ManifestData {
  launchFile: string;
  scormVersion: string;
  title?: string;
}

/** LXD360 Primary Blue - Uses CSS variable for consistency */
const LXD_PRIMARY = 'var(--color-lxd-primary)';

/**
 * ScormUploader - Smart SCORM Engine
 *
 * Extracts SCORM packages in-browser using JSZip, validates the manifest,
 * and uploads individual files to Cloud Storage maintaining folder structure.
 * The bucket receives a fully extracted, playable web directory.
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
  const [processingStep, setProcessingStep] = useState<string>('');
  const [filesTotal, setFilesTotal] = useState(0);
  const [filesUploaded, setFilesUploaded] = useState(0);

  const generateCourseId = useCallback(() => {
    return `course_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const validateFile = (file: File): string | null => {
    if (!file.name.toLowerCase().endsWith('.zip')) {
      return 'Only .zip files are allowed for SCORM packages';
    }
    const maxSize = 500 * 1024 * 1024;
    if (file.size > maxSize) {
      return 'File size exceeds 500MB limit';
    }
    return null;
  };

  /**
   * Parse imsmanifest.xml to extract launch file and SCORM version
   */
  const parseManifest = (manifestContent: string): ManifestData => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(manifestContent, 'text/xml');

    // Check for parsing errors
    const parseError = doc.querySelector('parsererror');
    if (parseError) {
      throw new Error('Invalid manifest XML format');
    }

    // Detect SCORM version from namespace or schema
    let scormVersion = 'SCORM 1.2';
    const manifestElement = doc.documentElement;
    const xmlns = manifestElement.getAttribute('xmlns') || '';
    const schemaversion = doc.querySelector('schemaversion')?.textContent || '';

    if (xmlns.includes('2004') || schemaversion.includes('2004') || schemaversion.includes('CAM')) {
      scormVersion = 'SCORM 2004';
    }

    // Find the launch file (resource href)
    // Look for the first resource with adlcp:scormtype="sco" or just the first resource
    const resources = doc.querySelectorAll('resource');
    let launchFile = 'index.html';

    for (const resource of resources) {
      const scormType =
        resource.getAttribute('adlcp:scormType') || resource.getAttribute('adlcp:scormtype');
      const href = resource.getAttribute('href');

      if (href) {
        // Prefer SCO type resources
        if (scormType?.toLowerCase() === 'sco') {
          launchFile = href;
          break;
        }
        // Fallback to first resource with href
        if (launchFile === 'index.html') {
          launchFile = href;
        }
      }
    }

    // Get course title
    const title =
      doc.querySelector('organization > title')?.textContent ||
      doc.querySelector('title')?.textContent ||
      undefined;

    return { launchFile, scormVersion, title };
  };

  /**
   * Get MIME type based on file extension
   */
  const getMimeType = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    const mimeTypes: Record<string, string> = {
      html: 'text/html',
      htm: 'text/html',
      css: 'text/css',
      js: 'application/javascript',
      json: 'application/json',
      xml: 'application/xml',
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      gif: 'image/gif',
      svg: 'image/svg+xml',
      webp: 'image/webp',
      mp3: 'audio/mpeg',
      mp4: 'video/mp4',
      webm: 'video/webm',
      ogg: 'audio/ogg',
      wav: 'audio/wav',
      woff: 'font/woff',
      woff2: 'font/woff2',
      ttf: 'font/ttf',
      eot: 'application/vnd.ms-fontobject',
      pdf: 'application/pdf',
      swf: 'application/x-shockwave-flash',
    };
    return mimeTypes[ext] || 'application/octet-stream';
  };

  /**
   * Upload a single file to Cloud Storage
   */
  const uploadSingleFile = async (
    storage: ReturnType<typeof requireStorage>,
    basePath: string,
    filePath: string,
    blob: Blob,
  ): Promise<void> => {
    const fullPath = `${basePath}/${filePath}`;
    const storageRef = ref(storage, fullPath);
    const mimeType = getMimeType(filePath);

    await new Promise<void>((resolve, reject) => {
      const uploadTask = uploadBytesResumable(storageRef, blob, {
        contentType: mimeType,
        cacheControl: 'public, max-age=31536000',
      });

      uploadTask.on(
        'state_changed',
        undefined,
        (error) => reject(error),
        () => resolve(),
      );
    });
  };

  /**
   * Process and upload the SCORM package
   */
  const processAndUpload = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setErrorMessage(validationError);
      setUploadState('error');
      onUploadError?.(new Error(validationError));
      return;
    }

    setUploadState('processing');
    setFileName(file.name);
    setFileSize(file.size);
    setProgress(0);
    setErrorMessage(null);
    setProcessingStep('Reading package...');

    try {
      // Load the ZIP file
      setProcessingStep('Extracting package...');
      const zip = await JSZip.loadAsync(file);

      // Validate manifest exists at root
      const manifestFile = zip.file('imsmanifest.xml');
      if (!manifestFile) {
        throw new Error('Invalid SCORM: imsmanifest.xml not found at package root');
      }

      // Parse manifest
      setProcessingStep('Parsing manifest...');
      const manifestContent = await manifestFile.async('string');
      const manifestData = parseManifest(manifestContent);

      // Collect all files (excluding directories)
      const files: { path: string; file: JSZip.JSZipObject }[] = [];
      zip.forEach((relativePath, zipEntry) => {
        if (!zipEntry.dir) {
          files.push({ path: relativePath, file: zipEntry });
        }
      });

      if (files.length === 0) {
        throw new Error('SCORM package is empty');
      }

      setFilesTotal(files.length);
      setFilesUploaded(0);
      setProcessingStep(`Preparing ${files.length} files...`);

      // Setup storage paths
      const effectiveCourseId = courseId ?? generateCourseId();
      const basePath = `tenants/${tenantId}/scorm/${effectiveCourseId}`;
      const storage = requireStorage();

      // Switch to uploading state
      setUploadState('uploading');
      setProcessingStep('Uploading files...');

      // Upload files in parallel batches for speed
      const BATCH_SIZE = 5;
      let uploadedCount = 0;

      for (let i = 0; i < files.length; i += BATCH_SIZE) {
        const batch = files.slice(i, i + BATCH_SIZE);

        await Promise.all(
          batch.map(async ({ path, file: zipEntry }) => {
            const blob = await zipEntry.async('blob');
            await uploadSingleFile(storage, basePath, path, blob);
            uploadedCount++;
            setFilesUploaded(uploadedCount);
            setProgress(Math.round((uploadedCount / files.length) * 100));
          }),
        );
      }

      // Success
      setUploadState('success');

      // Construct the base URL for serving content
      // Note: In production, this would be your CDN URL or Cloud Storage public URL
      const baseUrl = `https://storage.googleapis.com/${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}/${basePath}`;
      const launchUrl = `${basePath}/${manifestData.launchFile}`;

      onUploadComplete({
        baseUrl,
        launchUrl,
        fileName: file.name,
        fileSize: file.size,
        storagePath: basePath,
        filesCount: files.length,
        scormVersion: manifestData.scormVersion,
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Processing failed');
      setErrorMessage(err.message);
      setUploadState('error');
      onUploadError?.(err);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processAndUpload(file);
    }
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
      processAndUpload(file);
    }
  };

  const handleReset = () => {
    setUploadState('idle');
    setProgress(0);
    setFileName(null);
    setFileSize(0);
    setErrorMessage(null);
    setProcessingStep('');
    setFilesTotal(0);
    setFilesUploaded(0);
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
            'border-border bg-muted/20 hover:border-primary/50',
          isDragging && 'border-primary bg-primary/5',
          uploadState === 'success' && 'border-emerald-500/50 bg-emerald-500/5',
          uploadState === 'error' && 'border-red-500/50 bg-red-500/5',
          (uploadState === 'processing' || uploadState === 'uploading') &&
            'border-primary/50 bg-primary/5',
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

        {uploadState === 'processing' && (
          <div className="flex flex-col items-center justify-center gap-4 p-8">
            <div className="flex items-center gap-3">
              <Package className="h-6 w-6 text-primary animate-pulse" />
              <FolderOpen className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="w-full max-w-xs space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="truncate max-w-[180px]">{fileName}</span>
                <span className="text-muted-foreground text-xs">{formatFileSize(fileSize)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm text-primary">{processingStep}</span>
              </div>
            </div>
          </div>
        )}

        {uploadState === 'uploading' && (
          <div className="flex flex-col items-center justify-center gap-4 p-8">
            <div className="flex items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <FileArchive className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="w-full max-w-xs space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="truncate max-w-[180px]">{fileName}</span>
                <span className="text-muted-foreground">{progress}%</span>
              </div>
              {/* Custom progress bar with LXD360 branding */}
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-300 ease-out rounded-full"
                  style={{
                    width: `${progress}%`,
                    backgroundColor: LXD_PRIMARY,
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Uploading {filesUploaded} of {filesTotal} files...
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
              <p className="text-sm font-medium text-emerald-500">Package Ready</p>
              <p className="text-xs text-muted-foreground mt-1 truncate max-w-[250px]">
                {fileName} ({formatFileSize(fileSize)})
              </p>
              <p className="text-xs text-emerald-600 mt-1">
                {filesTotal} files extracted & uploaded
              </p>
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={handleReset}>
              Upload Different Package
            </Button>
          </div>
        )}

        {uploadState === 'error' && (
          <div className="flex flex-col items-center justify-center gap-4 p-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
              <AlertCircle className="h-7 w-7 text-red-500" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-red-500">Processing Failed</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-[250px]">
                {errorMessage ?? 'An error occurred during processing'}
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
        <p className="font-medium">Smart SCORM Engine:</p>
        <ul className="list-disc list-inside space-y-0.5 pl-2">
          <li>Extracts packages in-browser for instant playback</li>
          <li>Validates imsmanifest.xml before upload</li>
          <li>Supports SCORM 1.2 & 2004 (all editions)</li>
        </ul>
      </div>
    </div>
  );
}
