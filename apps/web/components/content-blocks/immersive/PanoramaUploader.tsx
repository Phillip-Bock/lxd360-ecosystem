'use client';

import {
  AlertCircle,
  Camera,
  Check,
  FileImage,
  Image as ImageIcon,
  Info,
  RefreshCw,
  Upload,
  X,
} from 'lucide-react';
import NextImage from 'next/image';
import type React from 'react';
import { useCallback, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { logger } from '@/lib/logger';

const log = logger.scope('PanoramaUploader');

interface UploadedPanorama {
  id: string;
  name: string;
  url: string;
  thumbnail?: string;
  width: number;
  height: number;
  aspectRatio: number;
  isEquirectangular: boolean;
  fileSize: number;
  uploadedAt: Date;
}

interface PanoramaUploaderProps {
  onUpload: (panorama: UploadedPanorama) => void;
  onUploadMultiple?: (panoramas: UploadedPanorama[]) => void;
  maxFileSize?: number; // in MB
  acceptedFormats?: string[];
  uploadEndpoint?: string;
  className?: string;
}

export function PanoramaUploader({
  onUpload,
  onUploadMultiple,
  maxFileSize = 50, // 50MB default
  acceptedFormats = ['image/jpeg', 'image/png', 'image/webp'],
  className = '',
}: PanoramaUploaderProps): React.JSX.Element {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});
  const [uploadedImages, setUploadedImages] = useState<UploadedPanorama[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback(
    (file: File): { valid: boolean; error?: string } => {
      // Check file type
      if (!acceptedFormats.includes(file.type)) {
        return {
          valid: false,
          error: `Invalid format. Accepted: ${acceptedFormats.map((f) => f.split('/')[1]).join(', ')}`,
        };
      }

      // Check file size
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > maxFileSize) {
        return {
          valid: false,
          error: `File too large. Maximum size: ${maxFileSize}MB`,
        };
      }

      return { valid: true };
    },
    [acceptedFormats, maxFileSize],
  );

  const checkEquirectangular = async (
    file: File,
  ): Promise<{ width: number; height: number; isEquirectangular: boolean }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const aspectRatio = img.width / img.height;
        // Equirectangular images should have 2:1 aspect ratio
        const isEquirectangular = Math.abs(aspectRatio - 2) < 0.1;
        resolve({
          width: img.width,
          height: img.height,
          isEquirectangular,
        });
        URL.revokeObjectURL(img.src);
      };
      img.onerror = () => {
        resolve({ width: 0, height: 0, isEquirectangular: false });
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const handleDragOver = useCallback((e: React.DragEvent): void => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent): void => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFiles = useCallback(
    async (newFiles: File[]): Promise<void> => {
      const validFiles: File[] = [];
      const errors: Record<string, string> = {};

      for (const file of newFiles) {
        const validation = validateFile(file);
        if (validation.valid) {
          validFiles.push(file);
        } else {
          errors[file.name] = validation.error || 'Invalid file';
        }
      }

      setFiles((prev) => [...prev, ...validFiles]);
      setUploadErrors((prev) => ({ ...prev, ...errors }));

      // Preview first valid file
      if (validFiles.length > 0 && !previewUrl) {
        setPreviewUrl(URL.createObjectURL(validFiles[0]));
      }
    },
    [previewUrl, validateFile],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent): void => {
      e.preventDefault();
      setIsDragging(false);
      const droppedFiles = Array.from(e.dataTransfer.files);
      handleFiles(droppedFiles);
    },
    [handleFiles],
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      handleFiles(selectedFiles);
    }
  };

  const removeFile = (index: number): void => {
    setFiles((prev) => {
      const newFiles = [...prev];
      newFiles.splice(index, 1);
      return newFiles;
    });
    // Update preview if needed
    if (files.length > 1) {
      setPreviewUrl(URL.createObjectURL(files[index === 0 ? 1 : 0]));
    } else {
      setPreviewUrl(null);
    }
  };

  const uploadFile = async (file: File): Promise<UploadedPanorama | null> => {
    try {
      // Check image dimensions
      const dimensions = await checkEquirectangular(file);

      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('metadata', JSON.stringify(dimensions));

      // Simulate upload with progress (replace with actual upload logic)
      // In production, this would be an actual API call
      const id = `panorama-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Simulate progress
      for (let progress = 0; progress <= 100; progress += 10) {
        setUploadProgress((prev) => ({ ...prev, [file.name]: progress }));
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      // Create local URL for demo (in production, this would be the uploaded URL)
      const url = URL.createObjectURL(file);

      const panorama: UploadedPanorama = {
        id,
        name: file.name,
        url,
        width: dimensions.width,
        height: dimensions.height,
        aspectRatio: dimensions.width / dimensions.height,
        isEquirectangular: dimensions.isEquirectangular,
        fileSize: file.size,
        uploadedAt: new Date(),
      };

      return panorama;
    } catch (error) {
      log.error('Upload failed', error instanceof Error ? error : new Error(String(error)));
      setUploadErrors((prev) => ({
        ...prev,
        [file.name]: 'Upload failed. Please try again.',
      }));
      return null;
    }
  };

  const handleUpload = async (): Promise<void> => {
    if (files.length === 0) return;

    setUploading(true);
    const uploaded: UploadedPanorama[] = [];

    for (const file of files) {
      const result = await uploadFile(file);
      if (result) {
        uploaded.push(result);
        onUpload(result);
      }
    }

    setUploadedImages((prev) => [...prev, ...uploaded]);

    if (onUploadMultiple && uploaded.length > 0) {
      onUploadMultiple(uploaded);
    }

    setFiles([]);
    setUploadProgress({});
    setUploading(false);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Card
      className={`p-6 bg-(--lxd-blue-dark-700) border-2 border-(--lxd-blue-light) ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-brand-primary flex items-center gap-2">
          <Camera className="w-5 h-5 text-(--brand-primary)" />
          Panorama Uploader
        </h3>
        <Badge
          variant="outline"
          className="border-(--color-lxd-success) text-(--color-lxd-success)"
        >
          360° Images
        </Badge>
      </div>

      {/* Info Banner */}
      <div className="flex items-start gap-3 p-3 bg-(--lxd-blue-light)/30 rounded-lg border border-(--lxd-blue-light) mb-4">
        <Info className="w-5 h-5 text-(--brand-primary) shrink-0 mt-0.5" />
        <div className="text-sm text-brand-muted">
          <p>
            Upload <strong className="text-brand-primary">equirectangular</strong> panorama images
            (2:1 aspect ratio) for best results.
          </p>
          <p className="mt-1">
            Recommended: 4096×2048 or higher resolution for sharp 360° viewing.
          </p>
        </div>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-8 transition-all ${
          isDragging
            ? 'border-(--brand-primary) bg-(--brand-primary)/10'
            : 'border-(--lxd-blue-light) hover:border-slate-500'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFormats.join(',')}
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />

        {previewUrl ? (
          <div className="relative">
            <NextImage
              src={previewUrl}
              alt="Preview"
              width={800}
              height={192}
              className="w-full h-48 object-cover rounded-lg"
              unoptimized
            />
            <Button
              size="icon"
              variant="outline"
              onClick={(): void => {
                setPreviewUrl(null);
                setFiles([]);
              }}
              className="absolute top-2 right-2 bg-(--lxd-blue-dark-700)/80 border-(--lxd-blue-light)"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-(--lxd-blue-light) flex items-center justify-center">
              <Upload className="w-8 h-8 text-(--brand-primary)" />
            </div>
            <p className="text-brand-primary font-medium mb-2">
              Drag and drop panorama images here
            </p>
            <p className="text-brand-muted text-sm mb-4">or click to browse files</p>
            <Button
              onClick={(): void => fileInputRef.current?.click()}
              variant="outline"
              className="border-(--brand-primary) text-(--brand-primary) hover:bg-(--brand-primary)/20"
            >
              <FileImage className="w-4 h-4 mr-2" />
              Select Files
            </Button>
          </div>
        )}
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          <Label className="text-brand-secondary">Selected Files ({files.length})</Label>
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center gap-3 p-3 bg-(--lxd-blue-light)/30 rounded-lg border border-(--lxd-blue-light)"
            >
              <ImageIcon className="w-5 h-5 text-(--brand-primary)" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-brand-primary truncate">{file.name}</p>
                <p className="text-xs text-brand-muted">{formatFileSize(file.size)}</p>
                {uploadProgress[file.name] !== undefined && (
                  <Progress value={uploadProgress[file.name]} className="h-1 mt-2" />
                )}
              </div>
              {uploadErrors[file.name] ? (
                <Badge variant="destructive" className="shrink-0">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Error
                </Badge>
              ) : uploadProgress[file.name] === 100 ? (
                <Badge className="bg-(--color-lxd-success) text-brand-primary shrink-0">
                  <Check className="w-3 h-3 mr-1" />
                  Done
                </Badge>
              ) : (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={(): void => removeFile(index)}
                  className="shrink-0 text-brand-muted hover:text-brand-error"
                  disabled={uploading}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Error Messages */}
      {Object.keys(uploadErrors).length > 0 && (
        <div className="mt-4 space-y-2">
          {Object.entries(uploadErrors).map(([fileName, error]) => (
            <div
              key={fileName}
              className="flex items-start gap-2 p-3 bg-brand-error/10 border border-brand-error/50 rounded-lg"
            >
              <AlertCircle className="w-4 h-4 text-brand-error shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-brand-error">{fileName}</p>
                <p className="text-xs text-red-300">{error}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {files.length > 0 && (
        <div className="mt-4 flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={(): void => {
              setFiles([]);
              setPreviewUrl(null);
              setUploadErrors({});
            }}
            disabled={uploading}
            className="border-(--lxd-blue-light) text-brand-secondary"
          >
            Clear All
          </Button>
          <Button
            onClick={handleUpload}
            disabled={uploading}
            className="bg-(--brand-primary) hover:bg-(--brand-primary)/80"
          >
            {uploading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload {files.length} {files.length === 1 ? 'File' : 'Files'}
              </>
            )}
          </Button>
        </div>
      )}

      {/* Uploaded Images */}
      {uploadedImages.length > 0 && (
        <div className="mt-6 pt-4 border-t border-(--lxd-blue-light)">
          <Label className="text-brand-secondary mb-3 block">
            Uploaded Panoramas ({uploadedImages.length})
          </Label>
          <div className="grid grid-cols-2 gap-3">
            {uploadedImages.map((image) => (
              <Card
                key={image.id}
                className="overflow-hidden bg-(--lxd-blue-light)/30 border-(--lxd-blue-light)"
              >
                <div className="aspect-video relative">
                  <NextImage
                    src={image.url}
                    alt={image.name}
                    width={400}
                    height={225}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                  {!image.isEquirectangular && (
                    <Badge
                      variant="outline"
                      className="absolute top-2 left-2 bg-(--lxd-blue-dark-700)/80 border-(--color-lxd-warning) text-(--color-lxd-warning)"
                    >
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Non-360°
                    </Badge>
                  )}
                </div>
                <div className="p-2">
                  <p className="text-xs text-brand-primary truncate">{image.name}</p>
                  <p className="text-xs text-brand-muted">
                    {image.width}×{image.height}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Format Info */}
      <div className="mt-4 text-xs text-brand-muted text-center">
        Supported formats: JPEG, PNG, WebP • Max size: {maxFileSize}MB
      </div>
    </Card>
  );
}

export default PanoramaUploader;
