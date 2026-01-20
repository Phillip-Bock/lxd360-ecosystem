// Media Library Types
// ====================

export type MediaAssetType = 'image' | 'video' | 'audio' | 'document' | '3d' | 'other';

export type MediaAssetStatus = 'ready' | 'processing' | 'error' | 'uploading';

export interface MediaAsset {
  id: string;
  filename: string;
  title: string;
  description?: string;
  altText?: string;
  type: MediaAssetType;
  mimeType: string;
  size: number; // bytes
  url: string;
  thumbnailUrl?: string;
  blurhash?: string;
  width?: number;
  height?: number;
  duration?: number; // seconds for video/audio
  status: MediaAssetStatus;
  tags: string[];
  folderId?: string;
  collectionIds: string[];
  uploadedBy: string;
  uploadedAt: Date;
  updatedAt: Date;
  usageCount: number;
  metadata?: Record<string, unknown>;
}

export interface MediaFolder {
  id: string;
  name: string;
  parentId?: string;
  path: string;
  assetCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MediaCollection {
  id: string;
  name: string;
  description?: string;
  color?: string;
  assetCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MediaUsage {
  id: string;
  assetId: string;
  entityType: 'course' | 'lesson' | 'module' | 'page' | 'project';
  entityId: string;
  entityTitle: string;
  usedAt: Date;
}

export type MediaViewMode = 'grid' | 'list';

export type MediaSortField = 'name' | 'type' | 'size' | 'date' | 'dimensions';
export type MediaSortDirection = 'asc' | 'desc';

export interface MediaSort {
  field: MediaSortField;
  direction: MediaSortDirection;
}

export interface MediaFiltersState {
  types: MediaAssetType[];
  status: MediaAssetStatus[];
  dateRange?: {
    from: Date;
    to: Date;
  };
  sizeRange?: {
    min: number;
    max: number;
  };
  tags: string[];
  folderId?: string;
  collectionId?: string;
}

export interface MediaSelection {
  selectedIds: Set<string>;
  lastSelectedId?: string;
}

export interface MediaLibraryState {
  assets: MediaAsset[];
  folders: MediaFolder[];
  collections: MediaCollection[];
  viewMode: MediaViewMode;
  sort: MediaSort;
  filters: MediaFiltersState;
  selection: MediaSelection;
  searchQuery: string;
  currentFolderId?: string;
  isLoading: boolean;
  error?: string;
}

// Mock data generator helpers
export const ASSET_TYPE_ICONS: Record<MediaAssetType, string> = {
  image: 'Image',
  video: 'Video',
  audio: 'Music',
  document: 'FileText',
  '3d': 'Box',
  other: 'File',
};

export const ASSET_TYPE_COLORS: Record<MediaAssetType, string> = {
  image: 'bg-blue-500',
  video: 'bg-purple-500',
  audio: 'bg-green-500',
  document: 'bg-orange-500',
  '3d': 'bg-pink-500',
  other: 'bg-gray-500',
};

export const FILE_TYPE_MAP: Record<string, MediaAssetType> = {
  // Images
  'image/jpeg': 'image',
  'image/png': 'image',
  'image/gif': 'image',
  'image/webp': 'image',
  'image/svg+xml': 'image',
  // Videos
  'video/mp4': 'video',
  'video/webm': 'video',
  'video/quicktime': 'video',
  // Audio
  'audio/mpeg': 'audio',
  'audio/wav': 'audio',
  'audio/ogg': 'audio',
  // Documents
  'application/pdf': 'document',
  'application/msword': 'document',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'document',
  // 3D
  'model/gltf-binary': '3d',
  'model/gltf+json': '3d',
};

// Utility functions
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export function formatDimensions(width?: number, height?: number): string {
  if (!width || !height) return '';
  return `${width} × ${height}`;
}

export function getAssetTypeFromMime(mimeType: string): MediaAssetType {
  return FILE_TYPE_MAP[mimeType] || 'other';
}
