import { z } from 'zod';

// ============================================================================
// ENUMS
// ============================================================================

/**
 * Media asset types supported by the library
 */
export const MediaAssetType = {
  IMAGE: 'image',
  VIDEO: 'video',
  AUDIO: 'audio',
  MODEL_3D: '3d_model',
  ICON: 'icon',
  AI_CHARACTER: 'ai_character',
  DOCUMENT: 'document',
} as const;

export type MediaAssetType = (typeof MediaAssetType)[keyof typeof MediaAssetType];

/**
 * Media asset processing status
 */
export const MediaAssetStatus = {
  UPLOADING: 'uploading',
  PROCESSING: 'processing',
  READY: 'ready',
  FAILED: 'failed',
  ARCHIVED: 'archived',
} as const;

export type MediaAssetStatus = (typeof MediaAssetStatus)[keyof typeof MediaAssetStatus];

// ============================================================================
// FILE SIZE LIMITS (in bytes)
// ============================================================================

export const FILE_SIZE_LIMITS: Record<MediaAssetType, number> = {
  [MediaAssetType.IMAGE]: 50 * 1024 * 1024, // 50MB
  [MediaAssetType.VIDEO]: 2 * 1024 * 1024 * 1024, // 2GB
  [MediaAssetType.AUDIO]: 500 * 1024 * 1024, // 500MB
  [MediaAssetType.MODEL_3D]: 500 * 1024 * 1024, // 500MB
  [MediaAssetType.ICON]: 5 * 1024 * 1024, // 5MB
  [MediaAssetType.AI_CHARACTER]: 100 * 1024 * 1024, // 100MB
  [MediaAssetType.DOCUMENT]: 100 * 1024 * 1024, // 100MB
};

// Large file threshold for direct-to-storage upload
export const LARGE_FILE_THRESHOLD = 10 * 1024 * 1024; // 10MB

// ============================================================================
// SUPPORTED FORMATS
// ============================================================================

export const SUPPORTED_FORMATS: Record<
  MediaAssetType,
  { mimeTypes: string[]; extensions: string[] }
> = {
  [MediaAssetType.IMAGE]: {
    mimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'image/avif',
    ],
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.avif'],
  },
  [MediaAssetType.VIDEO]: {
    mimeTypes: ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'],
    extensions: ['.mp4', '.webm', '.mov', '.avi'],
  },
  [MediaAssetType.AUDIO]: {
    mimeTypes: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/flac', 'audio/x-m4a'],
    extensions: ['.mp3', '.wav', '.ogg', '.m4a', '.flac'],
  },
  [MediaAssetType.MODEL_3D]: {
    mimeTypes: [
      'model/gltf-binary',
      'model/gltf+json',
      'application/octet-stream', // for .fbx, .obj, .usdz
    ],
    extensions: ['.glb', '.gltf', '.fbx', '.obj', '.usdz'],
  },
  [MediaAssetType.ICON]: {
    mimeTypes: ['image/svg+xml', 'image/png'],
    extensions: ['.svg', '.png'],
  },
  [MediaAssetType.AI_CHARACTER]: {
    mimeTypes: [
      'model/gltf-binary',
      'application/octet-stream', // for .vrm
      'application/json', // for Ready Player Me
    ],
    extensions: ['.glb', '.vrm', '.json'],
  },
  [MediaAssetType.DOCUMENT]: {
    mimeTypes: [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
    extensions: ['.pdf', '.docx', '.pptx', '.xlsx'],
  },
};

// ============================================================================
// STORAGE BUCKETS
// ============================================================================

export const STORAGE_BUCKETS = {
  MEDIA: 'media-assets',
  THUMBNAILS: 'media-thumbnails',
  PROCESSING: 'media-processing',
} as const;

// ============================================================================
// DATABASE TYPES
// ============================================================================

/**
 * Media asset database row
 */
export interface MediaAsset {
  id: string;
  tenant_id: string;
  folder_id: string | null;
  uploaded_by: string;

  // File info
  filename: string;
  original_filename: string;
  file_size: number;
  mime_type: string;

  // Asset type and status
  asset_type: MediaAssetType;
  status: MediaAssetStatus;

  // URLs
  storage_path: string;
  public_url: string | null;
  thumbnail_url: string | null;

  // Metadata
  metadata: MediaAssetMetadata;
  blurhash: string | null;

  // Alt text and description
  alt_text: string | null;
  description: string | null;

  // Tags and collections
  tags: string[];
  collections: string[];

  // Usage tracking
  usage_count: number;
  last_used_at: string | null;

  // Timestamps
  created_at: string;
  updated_at: string;
}

/**
 * Media asset insert type
 */
export interface MediaAssetInsert {
  tenant_id: string;
  folder_id?: string | null;
  uploaded_by: string;
  filename: string;
  original_filename: string;
  file_size: number;
  mime_type: string;
  asset_type: MediaAssetType;
  status?: MediaAssetStatus;
  storage_path: string;
  public_url?: string | null;
  thumbnail_url?: string | null;
  metadata?: MediaAssetMetadata;
  blurhash?: string | null;
  alt_text?: string | null;
  description?: string | null;
  tags?: string[];
  collections?: string[];
}

/**
 * Media asset metadata by type
 */
export interface MediaAssetMetadata {
  // Image metadata
  width?: number;
  height?: number;
  aspectRatio?: number;
  colorSpace?: string;
  hasAlpha?: boolean;

  // Video metadata
  duration?: number;
  frameRate?: number;
  codec?: string;
  hasAudio?: boolean;
  videoWidth?: number;
  videoHeight?: number;

  // Audio metadata
  sampleRate?: number;
  channels?: number;
  bitrate?: number;

  // Document metadata
  pageCount?: number;
  author?: string;
  title?: string;

  // 3D model metadata
  triangleCount?: number;
  textureCount?: number;
  animationCount?: number;

  // AI Character metadata
  characterType?: string;
  rigged?: boolean;
  morphTargetCount?: number;

  // Generic
  exif?: Record<string, unknown>;
  customFields?: Record<string, unknown>;
}

// ============================================================================
// MEDIA FOLDER
// ============================================================================

export interface MediaFolder {
  id: string;
  tenant_id: string;
  parent_id: string | null;
  name: string;
  path: string;
  asset_count: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// MEDIA COLLECTION
// ============================================================================

export interface MediaCollection {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  cover_image_id: string | null;
  asset_count: number;
  is_smart: boolean;
  smart_filters: Record<string, unknown> | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// UPLOAD TYPES
// ============================================================================

export interface UploadProgress {
  fileId: string;
  filename: string;
  progress: number;
  status: 'pending' | 'uploading' | 'processing' | 'complete' | 'error';
  error?: string;
  asset?: MediaAsset;
}

export interface UploadOptions {
  folderId?: string;
  collectionIds?: string[];
  tags?: string[];
  altText?: string;
  description?: string;
  onProgress?: (progress: UploadProgress) => void;
}

export interface UploadResult {
  success: boolean;
  asset?: MediaAsset;
  error?: string;
}

export interface BatchUploadResult {
  successful: MediaAsset[];
  failed: Array<{ filename: string; error: string }>;
}

// ============================================================================
// SIGNED URL TYPES
// ============================================================================

export interface SignedUploadUrl {
  uploadUrl: string;
  assetId: string;
  expiresAt: string;
  headers: Record<string, string>;
}

// ============================================================================
// FILTER TYPES
// ============================================================================

export interface MediaFilters {
  type?: MediaAssetType | MediaAssetType[];
  status?: MediaAssetStatus;
  folderId?: string | null;
  collectionId?: string;
  tags?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  sizeRange?: {
    min?: number;
    max?: number;
  };
  uploadedBy?: string;
}

export interface MediaSortOptions {
  field: 'created_at' | 'updated_at' | 'filename' | 'file_size' | 'usage_count';
  direction: 'asc' | 'desc';
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

export const mediaAssetTypeSchema = z.enum([
  'image',
  'video',
  'audio',
  '3d_model',
  'icon',
  'ai_character',
  'document',
]);

export const mediaAssetStatusSchema = z.enum([
  'uploading',
  'processing',
  'ready',
  'failed',
  'archived',
]);

export const uploadOptionsSchema = z.object({
  folderId: z.string().uuid().optional(),
  collectionIds: z.array(z.string().uuid()).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  altText: z.string().max(500).optional(),
  description: z.string().max(2000).optional(),
});

export const mediaFiltersSchema = z.object({
  type: z.union([mediaAssetTypeSchema, z.array(mediaAssetTypeSchema)]).optional(),
  status: mediaAssetStatusSchema.optional(),
  folderId: z.string().uuid().nullable().optional(),
  collectionId: z.string().uuid().optional(),
  tags: z.array(z.string()).optional(),
  dateRange: z
    .object({
      start: z.string().datetime(),
      end: z.string().datetime(),
    })
    .optional(),
  sizeRange: z
    .object({
      min: z.number().optional(),
      max: z.number().optional(),
    })
    .optional(),
  uploadedBy: z.string().uuid().optional(),
});

export const processWebhookSchema = z.object({
  assetId: z.string().uuid(),
  status: z.enum(['ready', 'failed']),
  metadata: z.record(z.unknown()).optional(),
  thumbnailUrl: z.string().url().optional(),
  blurhash: z.string().optional(),
  error: z.string().optional(),
});

export type UploadOptionsInput = z.infer<typeof uploadOptionsSchema>;
export type MediaFiltersInput = z.infer<typeof mediaFiltersSchema>;
export type ProcessWebhookInput = z.infer<typeof processWebhookSchema>;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get media asset type from MIME type
 */
export function getAssetTypeFromMimeType(mimeType: string): MediaAssetType | null {
  for (const [type, formats] of Object.entries(SUPPORTED_FORMATS)) {
    if (formats.mimeTypes.includes(mimeType)) {
      return type as MediaAssetType;
    }
  }
  return null;
}

/**
 * Get media asset type from file extension
 */
export function getAssetTypeFromExtension(filename: string): MediaAssetType | null {
  const ext = `.${filename.split('.').pop()?.toLowerCase()}`;

  for (const [type, formats] of Object.entries(SUPPORTED_FORMATS)) {
    if (formats.extensions.includes(ext)) {
      return type as MediaAssetType;
    }
  }
  return null;
}

/**
 * Check if file type is supported
 */
export function isFileTypeSupported(mimeType: string, extension?: string): boolean {
  // Check by MIME type first
  for (const formats of Object.values(SUPPORTED_FORMATS)) {
    if (formats.mimeTypes.includes(mimeType)) {
      return true;
    }
  }

  // Fall back to extension check
  if (extension) {
    const ext = extension.startsWith('.') ? extension : `.${extension}`;
    for (const formats of Object.values(SUPPORTED_FORMATS)) {
      if (formats.extensions.includes(ext.toLowerCase())) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Validate file against type constraints
 */
export function validateFileForType(
  file: { size: number; type: string; name: string },
  assetType: MediaAssetType,
): { valid: boolean; error?: string } {
  const formats = SUPPORTED_FORMATS[assetType];
  const sizeLimit = FILE_SIZE_LIMITS[assetType];

  // Check MIME type
  const ext = `.${file.name.split('.').pop()?.toLowerCase()}`;
  const mimeTypeValid = formats.mimeTypes.includes(file.type);
  const extensionValid = formats.extensions.includes(ext);

  if (!mimeTypeValid && !extensionValid) {
    return {
      valid: false,
      error: `File type not supported. Accepted formats: ${formats.extensions.join(', ')}`,
    };
  }

  // Check size
  if (file.size > sizeLimit) {
    const maxMB = Math.round(sizeLimit / (1024 * 1024));
    return {
      valid: false,
      error: `File too large. Maximum size: ${maxMB}MB`,
    };
  }

  return { valid: true };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

/**
 * Get accepted file types string for input element
 */
export function getAcceptString(assetType?: MediaAssetType | MediaAssetType[]): string {
  if (!assetType) {
    return Object.values(SUPPORTED_FORMATS)
      .flatMap((f) => f.mimeTypes)
      .join(',');
  }

  const types = Array.isArray(assetType) ? assetType : [assetType];
  return types.flatMap((t) => SUPPORTED_FORMATS[t].mimeTypes).join(',');
}
