/**
 * Library types for the file management system
 */

export type LibraryType = 'media' | 'projects' | 'templates' | 'themes' | 'code';

export interface LibraryItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  libraryType: LibraryType;
  parentId: string | null; // null = root level
  createdAt: Date;
  updatedAt: Date;
  version: number;
  isFavorite: boolean;
  isDeleted: boolean;
  deletedAt?: Date;
  tags: string[];
  // File-specific
  fileType?: string; // e.g., "image/png", "video/mp4", "application/json"
  fileSize?: number; // in bytes
  thumbnailUrl?: string;
  // Type-specific metadata
  metadata?: LibraryItemMetadata;
}

// Type-specific metadata
export type LibraryItemMetadata =
  | MediaMetadata
  | ProjectMetadata
  | TemplateMetadata
  | ThemeMetadata
  | CodeMetadata;

export interface MediaMetadata {
  type: 'media';
  width?: number;
  height?: number;
  duration?: number; // seconds, for video/audio
  format?: string;
  altText?: string;
}

export interface ProjectMetadata {
  type: 'project';
  status: 'draft' | 'in_review' | 'published' | 'archived';
  projectType: 'course' | 'assessment' | 'survey';
  description?: string;
  author?: string;
}

export interface TemplateMetadata {
  type: 'template';
  category: string;
  compatibleWith: ('course' | 'assessment' | 'survey')[];
  description?: string;
  previewUrl?: string;
}

export interface ThemeMetadata {
  type: 'theme';
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
  description?: string;
  previewUrl?: string;
  themeData?: unknown; // Full ContentTheme data for advanced themes
}

export interface CodeMetadata {
  type: 'code';
  language: string; // e.g., "javascript", "css", "html"
  description?: string;
  isSnippet: boolean;
}

// Storage limits (in bytes)
export interface StorageLimits {
  maxFileSize: number; // Max size per individual file
  maxAccountStorage: number; // Total storage per account
}

// Per-file-type size limits (in bytes)
export interface FileTypeLimits {
  image: number;
  video: number;
  audio: number;
  document: number;
  code: number;
  default: number;
}

// Industry-standard limits
export const FILE_SIZE_LIMITS: FileTypeLimits = {
  image: 25 * 1024 * 1024, // 25MB - covers high-res images
  video: 500 * 1024 * 1024, // 500MB - ~10 min at 1080p
  audio: 100 * 1024 * 1024, // 100MB - ~1 hour at 256kbps
  document: 10 * 1024 * 1024, // 10MB - PDFs, docs
  code: 5 * 1024 * 1024, // 5MB - code files
  default: 10 * 1024 * 1024, // 10MB - fallback
};

// Account storage limits by plan tier
export const ACCOUNT_STORAGE_LIMITS = {
  free: 2 * 1024 * 1024 * 1024, // 2GB
  starter: 10 * 1024 * 1024 * 1024, // 10GB
  professional: 50 * 1024 * 1024 * 1024, // 50GB
  enterprise: 500 * 1024 * 1024 * 1024, // 500GB
} as const;

export type PlanTier = keyof typeof ACCOUNT_STORAGE_LIMITS;

// Helper to get file size limit by MIME type
export function getFileSizeLimit(mimeType: string): number {
  if (mimeType.startsWith('image/')) return FILE_SIZE_LIMITS.image;
  if (mimeType.startsWith('video/')) return FILE_SIZE_LIMITS.video;
  if (mimeType.startsWith('audio/')) return FILE_SIZE_LIMITS.audio;
  if (
    mimeType === 'application/pdf' ||
    mimeType.includes('document') ||
    mimeType.includes('text/')
  ) {
    return FILE_SIZE_LIMITS.document;
  }
  if (
    mimeType.includes('javascript') ||
    mimeType.includes('json') ||
    mimeType.includes('css') ||
    mimeType.includes('html')
  ) {
    return FILE_SIZE_LIMITS.code;
  }
  return FILE_SIZE_LIMITS.default;
}

// Helper to format bytes for display
export function formatStorageSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

// Library configuration per type
export interface LibraryConfig {
  type: LibraryType;
  label: string;
  labelPlural: string;
  icon: string; // heroicon name
  acceptedFileTypes?: string[]; // MIME types for upload
  defaultMetadata: Partial<LibraryItemMetadata>;
}

export const LIBRARY_CONFIGS: Record<LibraryType, LibraryConfig> = {
  media: {
    type: 'media',
    label: 'Media',
    labelPlural: 'Media',
    icon: 'PhotoIcon',
    acceptedFileTypes: ['image/*', 'video/*', 'audio/*', 'application/pdf'],
    defaultMetadata: { type: 'media' },
  },
  projects: {
    type: 'projects',
    label: 'Project',
    labelPlural: 'Projects',
    icon: 'FolderIcon',
    defaultMetadata: {
      type: 'project',
      status: 'draft',
      projectType: 'course',
    },
  },
  templates: {
    type: 'templates',
    label: 'Template',
    labelPlural: 'Templates',
    icon: 'DocumentTextIcon',
    defaultMetadata: {
      type: 'template',
      category: 'General',
      compatibleWith: ['course'],
    },
  },
  themes: {
    type: 'themes',
    label: 'Theme',
    labelPlural: 'Themes',
    icon: 'SwatchIcon',
    defaultMetadata: { type: 'theme' },
  },
  code: {
    type: 'code',
    label: 'Code Snippet',
    labelPlural: 'Code Snippets',
    icon: 'CodeBracketIcon',
    defaultMetadata: {
      type: 'code',
      language: 'javascript',
      isSnippet: true,
    },
  },
};

// File type to icon mapping
export const FILE_TYPE_ICONS: Record<string, string> = {
  // Images
  'image/png': 'photo',
  'image/jpeg': 'photo',
  'image/gif': 'photo',
  'image/svg+xml': 'photo',
  'image/webp': 'photo',
  // Video
  'video/mp4': 'film',
  'video/webm': 'film',
  'video/quicktime': 'film',
  // Audio
  'audio/mpeg': 'musical-note',
  'audio/wav': 'musical-note',
  'audio/ogg': 'musical-note',
  // Documents
  'application/pdf': 'document',
  'application/json': 'code-bracket',
  'text/javascript': 'code-bracket',
  'text/css': 'code-bracket',
  'text/html': 'code-bracket',
  // Default
  default: 'document',
};

// Sort options
export type SortField = 'name' | 'updatedAt' | 'createdAt' | 'fileSize';
export type SortDirection = 'asc' | 'desc';

export interface SortOption {
  field: SortField;
  direction: SortDirection;
  label: string;
}

export const SORT_OPTIONS: SortOption[] = [
  { field: 'name', direction: 'asc', label: 'Name (A-Z)' },
  { field: 'name', direction: 'desc', label: 'Name (Z-A)' },
  { field: 'updatedAt', direction: 'desc', label: 'Recently Modified' },
  { field: 'updatedAt', direction: 'asc', label: 'Oldest Modified' },
  { field: 'createdAt', direction: 'desc', label: 'Newest First' },
  { field: 'createdAt', direction: 'asc', label: 'Oldest First' },
  { field: 'fileSize', direction: 'desc', label: 'Largest First' },
  { field: 'fileSize', direction: 'asc', label: 'Smallest First' },
];
