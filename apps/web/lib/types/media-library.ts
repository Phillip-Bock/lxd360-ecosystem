/**
 * Media Library Types
 *
 * Types covered:
 * - MediaAsset: Core media asset entity
 * - MediaFolder: Folder organization
 * - MediaCollection: Curated/smart collections
 * - MediaAssetVersion: Version history
 * - MediaUsageTracking: Usage tracking
 * - Upload/Filter types for API operations
 */

// ============================================================================
// ENUMS
// ============================================================================

/**
 * Media asset types supported by the library
 */
export type MediaAssetType =
  | 'image'
  | 'video'
  | 'audio'
  | '3d_model'
  | 'icon'
  | 'ai_character'
  | 'document';

/**
 * Enum-like object for MediaAssetType values
 */
export const MediaAssetTypes = {
  IMAGE: 'image',
  VIDEO: 'video',
  AUDIO: 'audio',
  THREE_D_MODEL: '3d_model',
  ICON: 'icon',
  AI_CHARACTER: 'ai_character',
  DOCUMENT: 'document',
} as const;

/**
 * Media asset processing status
 */
export type MediaAssetStatus = 'processing' | 'ready' | 'error' | 'archived';

/**
 * Enum-like object for MediaAssetStatus values
 */
export const MediaAssetStatuses = {
  PROCESSING: 'processing',
  READY: 'ready',
  ERROR: 'error',
  ARCHIVED: 'archived',
} as const;

/**
 * Types of entities that can use media assets
 */
export type MediaUsageType = 'course' | 'lesson' | 'content_block' | 'scenario';

/**
 * Enum-like object for MediaUsageType values
 */
export const MediaUsageTypes = {
  COURSE: 'course',
  LESSON: 'lesson',
  CONTENT_BLOCK: 'content_block',
  SCENARIO: 'scenario',
} as const;

// ============================================================================
// STORAGE BUCKET CONSTANTS
// ============================================================================

/**
 * Storage bucket names for each asset type
 */
export const MediaStorageBuckets = {
  IMAGES: 'media-images',
  VIDEOS: 'media-videos',
  AUDIO: 'media-audio',
  THREE_D: 'media-3d',
  ICONS: 'media-icons',
  AI_CHARACTERS: 'media-ai-characters',
  DOCUMENTS: 'media-documents',
  THUMBNAILS: 'media-thumbnails',
  PROCESSING: 'media-processing',
} as const;

export type MediaStorageBucket = (typeof MediaStorageBuckets)[keyof typeof MediaStorageBuckets];

/**
 * Get the appropriate storage bucket for an asset type
 */
export function getStorageBucketForType(type: MediaAssetType): MediaStorageBucket {
  switch (type) {
    case 'image':
      return MediaStorageBuckets.IMAGES;
    case 'video':
      return MediaStorageBuckets.VIDEOS;
    case 'audio':
      return MediaStorageBuckets.AUDIO;
    case '3d_model':
      return MediaStorageBuckets.THREE_D;
    case 'icon':
      return MediaStorageBuckets.ICONS;
    case 'ai_character':
      return MediaStorageBuckets.AI_CHARACTERS;
    case 'document':
      return MediaStorageBuckets.DOCUMENTS;
    default:
      return MediaStorageBuckets.PROCESSING;
  }
}

// ============================================================================
// MIME TYPE MAPPINGS
// ============================================================================

/**
 * Allowed MIME types for each asset type
 */
export const AllowedMimeTypes: Record<MediaAssetType, string[]> = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/avif'],
  video: ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'],
  audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3', 'audio/webm'],
  '3d_model': ['model/gltf-binary', 'model/gltf+json', 'application/octet-stream'],
  icon: ['image/svg+xml', 'image/png', 'image/x-icon', 'image/vnd.microsoft.icon'],
  ai_character: ['image/png', 'image/webp', 'video/webm', 'video/mp4', 'application/json'],
  document: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/markdown',
    'text/csv',
  ],
};

/**
 * Detect asset type from MIME type
 */
export function detectAssetTypeFromMime(mimeType: string): MediaAssetType | null {
  for (const [type, mimes] of Object.entries(AllowedMimeTypes)) {
    if (mimes.includes(mimeType)) {
      return type as MediaAssetType;
    }
  }
  return null;
}

// ============================================================================
// CORE ENTITY TYPES
// ============================================================================

/**
 * Extended metadata type for format-specific information
 */
export interface MediaAssetMetadata {
  // Image-specific
  exif?: Record<string, unknown>;
  colorSpace?: string;
  hasAlpha?: boolean;

  // Video-specific
  codec?: string;
  bitrate?: number;
  frameRate?: number;
  aspectRatio?: string;

  // Audio-specific
  sampleRate?: number;
  channels?: number;
  audioCodec?: string;

  // 3D model-specific
  polyCount?: number;
  materials?: string[];
  animations?: string[];

  // AI Character-specific
  characterName?: string;
  voiceId?: string;
  provider?: string;

  // Document-specific
  pageCount?: number;
  author?: string;
  createdDate?: string;

  // Generic
  [key: string]: unknown;
}

/**
 * Media asset entity - core table row
 */
export interface MediaAsset {
  id: string;
  tenantId: string;
  userId: string;
  folderId: string | null;
  type: MediaAssetType;
  filename: string;
  originalFilename: string;
  mimeType: string;
  fileSize: number;
  storagePath: string;
  storageBucket: string;
  width: number | null;
  height: number | null;
  durationSeconds: number | null;
  thumbnailPath: string | null;
  blurhash: string | null;
  metadata: MediaAssetMetadata;
  tags: string[];
  altText: string | null;
  title: string | null;
  description: string | null;
  isPublic: boolean;
  status: MediaAssetStatus;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Database row format (snake_case)
 */
export interface MediaAssetRow {
  id: string;
  tenant_id: string;
  user_id: string;
  folder_id: string | null;
  type: MediaAssetType;
  filename: string;
  original_filename: string;
  mime_type: string;
  file_size: number;
  storage_path: string;
  storage_bucket: string;
  width: number | null;
  height: number | null;
  duration_seconds: number | null;
  thumbnail_path: string | null;
  blurhash: string | null;
  metadata: MediaAssetMetadata;
  tags: string[];
  alt_text: string | null;
  title: string | null;
  description: string | null;
  is_public: boolean;
  status: MediaAssetStatus;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Media asset insert type
 */
export interface MediaAssetInsert {
  tenantId: string;
  userId: string;
  folderId?: string | null;
  type: MediaAssetType;
  filename: string;
  originalFilename: string;
  mimeType: string;
  fileSize: number;
  storagePath: string;
  storageBucket: string;
  width?: number | null;
  height?: number | null;
  durationSeconds?: number | null;
  thumbnailPath?: string | null;
  blurhash?: string | null;
  metadata?: MediaAssetMetadata;
  tags?: string[];
  altText?: string | null;
  title?: string | null;
  description?: string | null;
  isPublic?: boolean;
  status?: MediaAssetStatus;
}

/**
 * Media asset update type
 */
export interface MediaAssetUpdate {
  folderId?: string | null;
  filename?: string;
  width?: number | null;
  height?: number | null;
  durationSeconds?: number | null;
  thumbnailPath?: string | null;
  blurhash?: string | null;
  metadata?: MediaAssetMetadata;
  tags?: string[];
  altText?: string | null;
  title?: string | null;
  description?: string | null;
  isPublic?: boolean;
  status?: MediaAssetStatus;
  errorMessage?: string | null;
}

/**
 * Media folder entity
 */
export interface MediaFolder {
  id: string;
  tenantId: string;
  userId: string;
  name: string;
  parentId: string | null;
  path: string;
  depth: number;
  color: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Media folder database row
 */
export interface MediaFolderRow {
  id: string;
  tenant_id: string;
  user_id: string;
  name: string;
  parent_id: string | null;
  path: string;
  depth: number;
  color: string;
  icon: string;
  created_at: string;
  updated_at: string;
}

/**
 * Media folder with asset count
 */
export interface MediaFolderWithCount extends MediaFolder {
  assetCount: number;
}

/**
 * Media folder insert type
 */
export interface MediaFolderInsert {
  tenantId: string;
  userId: string;
  name: string;
  parentId?: string | null;
  color?: string;
  icon?: string;
}

/**
 * Media folder update type
 */
export interface MediaFolderUpdate {
  name?: string;
  parentId?: string | null;
  color?: string;
  icon?: string;
}

/**
 * Smart collection filter rules
 */
export interface CollectionFilterRules {
  type?: MediaAssetType[];
  tags?: {
    includes?: string[];
    excludes?: string[];
  };
  createdAfter?: string;
  createdBefore?: string;
  folderId?: string;
  mimeTypes?: string[];
  minFileSize?: number;
  maxFileSize?: number;
  hasAltText?: boolean;
}

/**
 * Media collection entity
 */
export interface MediaCollection {
  id: string;
  tenantId: string;
  userId: string;
  name: string;
  description: string | null;
  coverAssetId: string | null;
  isSmart: boolean;
  filterRules: CollectionFilterRules;
  color: string;
  icon: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Media collection database row
 */
export interface MediaCollectionRow {
  id: string;
  tenant_id: string;
  user_id: string;
  name: string;
  description: string | null;
  cover_asset_id: string | null;
  is_smart: boolean;
  filter_rules: CollectionFilterRules;
  color: string;
  icon: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Media collection with asset count
 */
export interface MediaCollectionWithCount extends MediaCollection {
  assetCount: number;
  coverAsset?: MediaAsset | null;
}

/**
 * Media collection insert type
 */
export interface MediaCollectionInsert {
  tenantId: string;
  userId: string;
  name: string;
  description?: string | null;
  coverAssetId?: string | null;
  isSmart?: boolean;
  filterRules?: CollectionFilterRules;
  color?: string;
  icon?: string;
  isPublic?: boolean;
}

/**
 * Media collection update type
 */
export interface MediaCollectionUpdate {
  name?: string;
  description?: string | null;
  coverAssetId?: string | null;
  isSmart?: boolean;
  filterRules?: CollectionFilterRules;
  color?: string;
  icon?: string;
  isPublic?: boolean;
}

/**
 * Collection asset junction
 */
export interface MediaCollectionAsset {
  id: string;
  collectionId: string;
  assetId: string;
  sortOrder: number;
  addedAt: string;
  addedBy: string | null;
}

/**
 * Media asset version
 */
export interface MediaAssetVersion {
  id: string;
  assetId: string;
  versionNumber: number;
  storagePath: string;
  storageBucket: string;
  fileSize: number;
  changesDescription: string | null;
  metadata: MediaAssetMetadata;
  createdBy: string | null;
  createdAt: string;
}

/**
 * Media asset version database row
 */
export interface MediaAssetVersionRow {
  id: string;
  asset_id: string;
  version_number: number;
  storage_path: string;
  storage_bucket: string;
  file_size: number;
  changes_description: string | null;
  metadata: MediaAssetMetadata;
  created_by: string | null;
  created_at: string;
}

/**
 * Media usage tracking
 */
export interface MediaUsageTracking {
  id: string;
  assetId: string;
  tenantId: string;
  usedInType: MediaUsageType;
  usedInId: string;
  usedInField: string | null;
  createdAt: string;
  createdBy: string | null;
}

/**
 * Media usage tracking database row
 */
export interface MediaUsageTrackingRow {
  id: string;
  asset_id: string;
  tenant_id: string;
  used_in_type: MediaUsageType;
  used_in_id: string;
  used_in_field: string | null;
  created_at: string;
  created_by: string | null;
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

/**
 * File upload request
 */
export interface MediaUploadRequest {
  file: File;
  tenantId: string;
  userId: string;
  folderId?: string;
  type?: MediaAssetType; // Auto-detected if not provided
  title?: string;
  description?: string;
  altText?: string;
  tags?: string[];
  isPublic?: boolean;
  metadata?: MediaAssetMetadata;
}

/**
 * File upload response
 */
export interface MediaUploadResponse {
  success: boolean;
  asset?: MediaAsset;
  error?: string;
  uploadProgress?: number;
}

/**
 * Batch upload request
 */
export interface MediaBatchUploadRequest {
  files: File[];
  tenantId: string;
  userId: string;
  folderId?: string;
  isPublic?: boolean;
  tags?: string[];
}

/**
 * Batch upload response
 */
export interface MediaBatchUploadResponse {
  success: boolean;
  assets: MediaAsset[];
  errors: Array<{ filename: string; error: string }>;
  totalUploaded: number;
  totalFailed: number;
}

/**
 * Asset filter/search query parameters
 */
export interface MediaFilterQuery {
  tenantId: string;
  type?: MediaAssetType | MediaAssetType[];
  status?: MediaAssetStatus | MediaAssetStatus[];
  folderId?: string | null;
  collectionId?: string;
  search?: string;
  tags?: string[];
  tagsMatch?: 'unknown' | 'all';
  isPublic?: boolean;
  userId?: string;
  mimeType?: string | string[];
  minFileSize?: number;
  maxFileSize?: number;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  minDuration?: number;
  maxDuration?: number;
  createdAfter?: string;
  createdBefore?: string;
  updatedAfter?: string;
  updatedBefore?: string;
  sortBy?: MediaSortField;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

/**
 * Available sort fields for media assets
 */
export type MediaSortField =
  | 'created_at'
  | 'updated_at'
  | 'filename'
  | 'file_size'
  | 'type'
  | 'title';

/**
 * Paginated response wrapper
 */
export interface PaginatedMediaResponse<T> {
  data: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

/**
 * Asset with public URL
 */
export interface MediaAssetWithUrl extends MediaAsset {
  publicUrl: string;
  thumbnailUrl?: string;
}

/**
 * Search result with relevance score
 */
export interface MediaSearchResult extends MediaAsset {
  relevance: number;
}

/**
 * Folder tree node
 */
export interface MediaFolderTreeNode extends MediaFolderWithCount {
  children: MediaFolderTreeNode[];
}

/**
 * Asset usage summary
 */
export interface MediaAssetUsageSummary {
  assetId: string;
  totalUsages: number;
  usagesByType: Record<MediaUsageType, number>;
  usages: Array<{
    usedInType: MediaUsageType;
    usedInId: string;
    usedInField: string | null;
    createdAt: string;
  }>;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Transform database row to camelCase entity
 */
export type RowToEntity<T extends Record<string, unknown>> = {
  [K in keyof T as K extends string ? CamelCase<K> : never]: T[K];
};

/**
 * Snake case to camel case transformation
 */
type CamelCase<S extends string> = S extends `${infer T}_${infer U}`
  ? `${T}${Capitalize<CamelCase<U>>}`
  : S;

/**
 * Transform camelCase entity to snake_case row
 */
export type EntityToRow<T extends Record<string, unknown>> = {
  [K in keyof T as K extends string ? SnakeCase<K> : never]: T[K];
};

/**
 * Camel case to snake case transformation
 */
type SnakeCase<S extends string> = S extends `${infer T}${infer U}`
  ? T extends Capitalize<T>
    ? `_${Lowercase<T>}${SnakeCase<U>}`
    : `${T}${SnakeCase<U>}`
  : S;

// ============================================================================
// TRANSFORMER FUNCTIONS
// ============================================================================

/**
 * Transform a media asset row to entity format
 */
export function transformAssetRowToEntity(row: MediaAssetRow): MediaAsset {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    userId: row.user_id,
    folderId: row.folder_id,
    type: row.type,
    filename: row.filename,
    originalFilename: row.original_filename,
    mimeType: row.mime_type,
    fileSize: row.file_size,
    storagePath: row.storage_path,
    storageBucket: row.storage_bucket,
    width: row.width,
    height: row.height,
    durationSeconds: row.duration_seconds,
    thumbnailPath: row.thumbnail_path,
    blurhash: row.blurhash,
    metadata: row.metadata,
    tags: row.tags,
    altText: row.alt_text,
    title: row.title,
    description: row.description,
    isPublic: row.is_public,
    status: row.status,
    errorMessage: row.error_message,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Transform media asset entity to row format for insert/update
 */
export function transformAssetEntityToRow(entity: Partial<MediaAsset>): Partial<MediaAssetRow> {
  const row: Partial<MediaAssetRow> = {};

  if (entity.id !== undefined) row.id = entity.id;
  if (entity.tenantId !== undefined) row.tenant_id = entity.tenantId;
  if (entity.userId !== undefined) row.user_id = entity.userId;
  if (entity.folderId !== undefined) row.folder_id = entity.folderId;
  if (entity.type !== undefined) row.type = entity.type;
  if (entity.filename !== undefined) row.filename = entity.filename;
  if (entity.originalFilename !== undefined) row.original_filename = entity.originalFilename;
  if (entity.mimeType !== undefined) row.mime_type = entity.mimeType;
  if (entity.fileSize !== undefined) row.file_size = entity.fileSize;
  if (entity.storagePath !== undefined) row.storage_path = entity.storagePath;
  if (entity.storageBucket !== undefined) row.storage_bucket = entity.storageBucket;
  if (entity.width !== undefined) row.width = entity.width;
  if (entity.height !== undefined) row.height = entity.height;
  if (entity.durationSeconds !== undefined) row.duration_seconds = entity.durationSeconds;
  if (entity.thumbnailPath !== undefined) row.thumbnail_path = entity.thumbnailPath;
  if (entity.blurhash !== undefined) row.blurhash = entity.blurhash;
  if (entity.metadata !== undefined) row.metadata = entity.metadata;
  if (entity.tags !== undefined) row.tags = entity.tags;
  if (entity.altText !== undefined) row.alt_text = entity.altText;
  if (entity.title !== undefined) row.title = entity.title;
  if (entity.description !== undefined) row.description = entity.description;
  if (entity.isPublic !== undefined) row.is_public = entity.isPublic;
  if (entity.status !== undefined) row.status = entity.status;
  if (entity.errorMessage !== undefined) row.error_message = entity.errorMessage;

  return row;
}

/**
 * Transform a media folder row to entity format
 */
export function transformFolderRowToEntity(row: MediaFolderRow): MediaFolder {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    userId: row.user_id,
    name: row.name,
    parentId: row.parent_id,
    path: row.path,
    depth: row.depth,
    color: row.color,
    icon: row.icon,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Transform a media collection row to entity format
 */
export function transformCollectionRowToEntity(row: MediaCollectionRow): MediaCollection {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    userId: row.user_id,
    name: row.name,
    description: row.description,
    coverAssetId: row.cover_asset_id,
    isSmart: row.is_smart,
    filterRules: row.filter_rules,
    color: row.color,
    icon: row.icon,
    isPublic: row.is_public,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Check if a MIME type is valid for a given asset type
 */
export function isValidMimeTypeForAssetType(mimeType: string, assetType: MediaAssetType): boolean {
  return AllowedMimeTypes[assetType]?.includes(mimeType) ?? false;
}

/**
 * Get maximum file size for an asset type (in bytes)
 */
export function getMaxFileSizeForType(type: MediaAssetType): number {
  switch (type) {
    case 'video':
      return 500 * 1024 * 1024; // 500MB
    case 'audio':
    case '3d_model':
    case 'document':
      return 100 * 1024 * 1024; // 100MB
    case 'image':
    case 'ai_character':
      return 50 * 1024 * 1024; // 50MB
    case 'icon':
      return 5 * 1024 * 1024; // 5MB
    default:
      return 50 * 1024 * 1024; // 50MB default
  }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
}

/**
 * Format duration for display
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Get human-readable label for asset type
 */
export function getAssetTypeLabel(type: MediaAssetType): string {
  const labels: Record<MediaAssetType, string> = {
    image: 'Image',
    video: 'Video',
    audio: 'Audio',
    '3d_model': '3D Model',
    icon: 'Icon',
    ai_character: 'AI Character',
    document: 'Document',
  };
  return labels[type] ?? type;
}

/**
 * Get icon name for asset type (for use with icon libraries)
 */
export function getAssetTypeIcon(type: MediaAssetType): string {
  const icons: Record<MediaAssetType, string> = {
    image: 'image',
    video: 'video',
    audio: 'music',
    '3d_model': 'cube',
    icon: 'smile',
    ai_character: 'bot',
    document: 'file-text',
  };
  return icons[type] ?? 'file';
}
