'use client';

import { CloudUpload, Info } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  detectMediaType,
  formatFileSize,
  isValidFileType,
  MAX_FILE_SIZE,
  type SourceTabProps,
  type UploadState,
} from '../types';

export function UploadTab({ onSelect }: SourceTabProps) {
  const [uploadState, setUploadState] = useState<UploadState>({
    file: null,
    preview: null,
    progress: 0,
    error: null,
    isUploading: false,
  });
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      // Validate file type
      if (!isValidFileType(file.name)) {
        setUploadState((prev) => ({
          ...prev,
          error: 'Invalid file type. Allowed: JPG, PNG, WebP, GIF, MP4, WebM',
        }));
        return;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        setUploadState((prev) => ({
          ...prev,
          error: `File too large. Maximum size is ${formatFileSize(MAX_FILE_SIZE)}`,
        }));
        return;
      }

      // Clear any previous error
      setUploadState((prev) => ({
        ...prev,
        error: null,
        isUploading: true,
        progress: 0,
      }));

      // Create preview using FileReader
      const reader = new FileReader();
      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadState((prev) => ({ ...prev, progress }));
        }
      };
      reader.onload = (e) => {
        const preview = e.target?.result as string;
        setUploadState({
          file,
          preview,
          progress: 100,
          error: null,
          isUploading: false,
        });

        // Call onSelect with the data URL and metadata
        onSelect(preview, {
          sourceType: 'upload',
          fileName: file.name,
          fileSize: file.size,
          type: detectMediaType(file.name),
        });
      };
      reader.onerror = () => {
        setUploadState((prev) => ({
          ...prev,
          error: 'Failed to read file',
          isUploading: false,
        }));
      };
      reader.readAsDataURL(file);
    },
    [onSelect],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile],
  );

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className="space-y-4">
      {/* Info tooltip */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Upload a file from your computer</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <button type="button" className="inline-flex">
              <Info className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-xs p-3">
            <p className="font-semibold mb-1">Best Practices</p>
            <ul className="text-xs space-y-1">
              <li>• Max file size: 10MB</li>
              <li>• Recommended: 1920×1080 or larger</li>
              <li>• Formats: JPG, PNG, WebP, GIF, MP4, WebM</li>
              <li>• Use high contrast for text readability</li>
            </ul>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Drag and drop zone */}
      <button
        type="button"
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative flex flex-col items-center justify-center gap-4 p-8 w-full
          border-2 border-dashed rounded-lg cursor-pointer
          transition-colors duration-200
          ${
            isDragOver
              ? 'border-primary bg-primary/10'
              : 'border-border hover:border-primary/50 hover:bg-muted/50'
          }
          ${uploadState.error ? 'border-destructive' : ''}
        `}
      >
        <CloudUpload
          className={`h-12 w-12 ${isDragOver ? 'text-primary' : 'text-muted-foreground'}`}
        />
        <div className="text-center">
          <p className="text-sm font-medium">
            {isDragOver ? 'Drop file here' : 'Drag & drop a file here'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/mp4,video/webm"
          onChange={handleFileInput}
          className="hidden"
        />
      </button>

      {/* Upload progress */}
      {uploadState.isUploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Uploading...</span>
            <span className="text-muted-foreground">{uploadState.progress}%</span>
          </div>
          <Progress value={uploadState.progress} />
        </div>
      )}

      {/* Error message */}
      {uploadState.error && <p className="text-sm text-destructive">{uploadState.error}</p>}

      {/* Selected file info */}
      {uploadState.file && !uploadState.isUploading && !uploadState.error && (
        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{uploadState.file.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(uploadState.file.size)} • {detectMediaType(uploadState.file.name)}
            </p>
          </div>
          <div className="text-xs text-green-500 font-medium">Selected</div>
        </div>
      )}
    </div>
  );
}
