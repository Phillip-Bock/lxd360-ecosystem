import type { MediaSourceType, StockProvider } from '@/types/outline';

/** Media item for library/stock grids */
export interface MediaItem {
  id: string;
  url: string;
  thumbnailUrl: string;
  name: string;
  type: 'image' | 'gif' | 'video';
  size?: number;
  width?: number;
  height?: number;
  attribution?: string;
  provider?: StockProvider;
}

/** Upload state for file handling */
export interface UploadState {
  file: File | null;
  preview: string | null;
  progress: number;
  error: string | null;
  isUploading: boolean;
}

/** Tab value for source selection */
export type TabValue = 'library' | 'upload' | 'url' | 'stock';

/** Stock tab sub-provider selection */
export type StockTabProvider = 'unsplash' | 'pexels' | 'pixabay';

/** Props for source tab components */
export interface SourceTabProps {
  onSelect: (url: string, metadata?: MediaMetadata) => void;
}

/** Metadata returned when selecting media */
export interface MediaMetadata {
  sourceType: MediaSourceType;
  fileName?: string;
  fileSize?: number;
  type: 'image' | 'gif' | 'video' | 'none';
  stockProvider?: StockProvider;
  stockAttribution?: string;
  stockId?: string;
}

/** Allowed file extensions */
export const ALLOWED_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
  '.mp4',
  '.webm',
] as const;

/** Max file size in bytes (10MB) */
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

/** Detect media type from filename or URL */
export function detectMediaType(urlOrFilename: string): 'image' | 'gif' | 'video' | 'none' {
  const ext = urlOrFilename.split('.').pop()?.toLowerCase() || '';

  if (ext === 'gif') return 'gif';
  if (['mp4', 'webm', 'mov', 'ogg'].includes(ext)) return 'video';
  if (['jpg', 'jpeg', 'png', 'webp', 'svg', 'avif'].includes(ext)) return 'image';

  // Check for common patterns in URLs
  if (urlOrFilename.includes('giphy.com') || urlOrFilename.includes('.gif')) return 'gif';
  if (urlOrFilename.includes('youtube.com') || urlOrFilename.includes('vimeo.com')) return 'video';

  return 'none';
}

/** Validate file type */
export function isValidFileType(filename: string): boolean {
  const ext = filename.toLowerCase().match(/\.[^.]+$/)?.[0];
  return ext ? ALLOWED_EXTENSIONS.includes(ext as (typeof ALLOWED_EXTENSIONS)[number]) : false;
}

/** Format file size for display */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
