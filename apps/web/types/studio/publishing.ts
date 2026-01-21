// =============================================================================
// EXPORT FORMAT TYPES
// =============================================================================

/**
 * Supported export formats for lesson publishing.
 */
export type ExportFormat =
  | 'scorm_12'
  | 'scorm_2004_3rd'
  | 'scorm_2004_4th'
  | 'xapi'
  | 'cmi5'
  | 'html5'
  | 'pdf'
  | 'video';

/**
 * SCORM version variants.
 */
export type ScormVersion = '1.2' | '2004_3rd' | '2004_4th';

/**
 * Display name mapping for export formats.
 */
export const EXPORT_FORMAT_NAMES: Record<ExportFormat, string> = {
  scorm_12: 'SCORM 1.2',
  scorm_2004_3rd: 'SCORM 2004 3rd Edition',
  scorm_2004_4th: 'SCORM 2004 4th Edition',
  xapi: 'xAPI (Tin Can)',
  cmi5: 'cmi5',
  html5: 'HTML5 Standalone',
  pdf: 'PDF Document',
  video: 'Video Export',
};

// =============================================================================
// EXPORT CONFIGURATION TYPES
// =============================================================================

/**
 * Base export configuration shared by all formats.
 */
export interface BaseExportConfig {
  /** Unique identifier for this export */
  id: string;
  /** Export format type */
  format: ExportFormat;
  /** Lesson ID to export */
  lessonId: string;
  /** Version string for the export */
  version: string;
  /** Optional description for this export */
  description?: string;
  /** Timestamp when export was initiated */
  createdAt: string;
  /** User who initiated the export */
  createdBy: string;
}

/**
 * SCORM-specific export configuration.
 */
export interface ScormExportConfig extends BaseExportConfig {
  format: 'scorm_12' | 'scorm_2004_3rd' | 'scorm_2004_4th';

  /** Manifest configuration */
  manifest: {
    /** Course identifier in the manifest */
    identifier: string;
    /** Course title */
    title: string;
    /** Course description */
    description?: string;
    /** Organization name */
    organization?: string;
    /** SCO identifier */
    scoIdentifier: string;
    /** Mastery score (0-100) */
    masteryScore?: number;
    /** Maximum time allowed (ISO 8601 duration) */
    maxTimeAllowed?: string;
    /** Time limit action */
    timeLimitAction?:
      | 'exit,message'
      | 'exit,no message'
      | 'continue,message'
      | 'continue,no message';
    /** Launch data */
    launchData?: string;
    /** Prerequisites (for sequencing) */
    prerequisites?: string;
  };

  /** Player settings embedded in the package */
  playerSettings: {
    /** Auto-advance through slides */
    autoAdvance: boolean;
    /** Allow backward navigation */
    allowBackNavigation: boolean;
    /** Show navigation controls */
    showNavigation: boolean;
    /** Show progress indicator */
    showProgress: boolean;
    /** Enable keyboard navigation */
    enableKeyboardNav: boolean;
    /** Completion criteria */
    completionCriteria: 'allSlides' | 'passingScore' | 'either' | 'both';
    /** Passing score percentage (0-100) */
    passingScore: number;
  };

  /** Optimization settings */
  optimization: {
    /** Compress images */
    compressImages: boolean;
    /** Image quality (1-100) */
    imageQuality: number;
    /** Minify JavaScript */
    minifyJs: boolean;
    /** Minify CSS */
    minifyCss: boolean;
    /** Include source maps */
    includeSourceMaps: boolean;
  };
}

/**
 * xAPI-specific export configuration.
 */
export interface XAPIExportConfig extends BaseExportConfig {
  format: 'xapi';

  /** LRS configuration for the exported package */
  lrs: {
    /** LRS endpoint URL (can be left empty for runtime configuration) */
    endpoint?: string;
    /** Authentication (can be left empty for runtime configuration) */
    auth?: string;
    /** Whether to prompt user for LRS config at launch */
    promptForConfig: boolean;
    /** Activity ID base URL */
    activityIdBase: string;
  };

  /** Statement configuration */
  statements: {
    /** Include extended verbs */
    includeExtendedVerbs: boolean;
    /** Include slide-level statements */
    trackSlides: boolean;
    /** Include interaction-level statements */
    trackInteractions: boolean;
    /** Include media events */
    trackMedia: boolean;
    /** Statement batch size */
    batchSize: number;
  };

  /** Player settings */
  playerSettings: ScormExportConfig['playerSettings'];

  /** Optimization settings */
  optimization: ScormExportConfig['optimization'];
}

/**
 * cmi5-specific export configuration.
 */
export interface CMI5ExportConfig extends BaseExportConfig {
  format: 'cmi5';

  /** Course structure configuration */
  courseStructure: {
    /** Course ID (IRI) */
    id: string;
    /** Course title */
    title: Record<string, string>;
    /** Course description */
    description?: Record<string, string>;
    /** Publisher information */
    publisher?: {
      id: string;
      name: string;
    };
  };

  /** AU (Assignable Unit) configuration */
  au: {
    /** AU ID */
    id: string;
    /** AU title */
    title: Record<string, string>;
    /** AU description */
    description?: Record<string, string>;
    /** Move on criteria */
    moveOn: 'Passed' | 'Completed' | 'CompletedAndPassed' | 'CompletedOrPassed' | 'NotApplicable';
    /** Mastery score (0-1) */
    masteryScore?: number;
    /** Launch method */
    launchMethod: 'OwnWindow' | 'AnyWindow';
    /** Activity type */
    activityType?: string;
  };

  /** Player settings */
  playerSettings: ScormExportConfig['playerSettings'];

  /** Optimization settings */
  optimization: ScormExportConfig['optimization'];
}

/**
 * HTML5 standalone export configuration.
 */
export interface HTML5ExportConfig extends BaseExportConfig {
  format: 'html5';

  /** Hosting configuration */
  hosting: {
    /** Base URL where the content will be hosted */
    baseUrl?: string;
    /** Whether to use relative paths */
    relativePaths: boolean;
    /** Include offline support (service worker) */
    offlineSupport: boolean;
  };

  /** Tracking configuration (optional) */
  tracking?: {
    /** Enable xAPI tracking */
    enableXAPI: boolean;
    /** LRS endpoint */
    lrsEndpoint?: string;
    /** LRS auth */
    lrsAuth?: string;
    /** Mirror to LXP360 */
    mirrorToLXP360: boolean;
    /** LXP360 API key */
    lxp360ApiKey?: string;
  };

  /** Player settings */
  playerSettings: ScormExportConfig['playerSettings'];

  /** Optimization settings */
  optimization: ScormExportConfig['optimization'];
}

/**
 * PDF export configuration.
 */
export interface PDFExportConfig extends BaseExportConfig {
  format: 'pdf';

  /** PDF settings */
  settings: {
    /** Page size */
    pageSize: 'A4' | 'Letter' | 'Legal' | 'Custom';
    /** Custom page dimensions (if pageSize is Custom) */
    customSize?: { width: number; height: number; unit: 'mm' | 'in' };
    /** Orientation */
    orientation: 'portrait' | 'landscape';
    /** Margin size */
    margins: 'none' | 'small' | 'normal' | 'large';
    /** Include slide notes */
    includeNotes: boolean;
    /** Slides per page */
    slidesPerPage: 1 | 2 | 4 | 6 | 9;
    /** Include cover page */
    includeCoverPage: boolean;
    /** Include table of contents */
    includeTableOfContents: boolean;
    /** Image quality */
    imageQuality: 'low' | 'medium' | 'high' | 'maximum';
  };
}

/**
 * Video export configuration.
 */
export interface VideoExportConfig extends BaseExportConfig {
  format: 'video';

  /** Video settings */
  settings: {
    /** Output resolution */
    resolution: '720p' | '1080p' | '4k';
    /** Frame rate */
    frameRate: 24 | 30 | 60;
    /** Output format */
    outputFormat: 'mp4' | 'webm' | 'mov';
    /** Video codec */
    codec: 'h264' | 'h265' | 'vp9';
    /** Quality preset */
    quality: 'low' | 'medium' | 'high' | 'maximum';
    /** Include audio */
    includeAudio: boolean;
    /** Time per slide (seconds) for static slides */
    defaultSlideDuration: number;
    /** Include transitions */
    includeTransitions: boolean;
    /** Include captions */
    includeCaptions: boolean;
  };
}

/**
 * Union type for all export configurations.
 */
export type ExportConfig =
  | ScormExportConfig
  | XAPIExportConfig
  | CMI5ExportConfig
  | HTML5ExportConfig
  | PDFExportConfig
  | VideoExportConfig;

// =============================================================================
// PUBLISHING STATUS TYPES
// =============================================================================

/**
 * Status of a publishing job.
 */
export type PublishingStatus =
  | 'pending'
  | 'validating'
  | 'generating'
  | 'optimizing'
  | 'packaging'
  | 'uploading'
  | 'completed'
  | 'failed'
  | 'cancelled';

/**
 * Publishing job record.
 */
export interface PublishingJob {
  /** Unique job ID */
  id: string;
  /** Export configuration */
  config: ExportConfig;
  /** Current status */
  status: PublishingStatus;
  /** Progress percentage (0-100) */
  progress: number;
  /** Current step description */
  currentStep: string;
  /** Start timestamp */
  startedAt: string;
  /** Completion timestamp */
  completedAt?: string;
  /** Error message if failed */
  error?: string;
  /** Warning messages */
  warnings: string[];
  /** Output file URL (if completed) */
  outputUrl?: string;
  /** Output file size in bytes */
  outputSize?: number;
  /** Download count */
  downloadCount: number;
  /** Expiration timestamp for the download */
  expiresAt?: string;
}

/**
 * Published package record (stored in database).
 */
export interface PublishedPackage {
  /** Unique package ID */
  id: string;
  /** Lesson ID */
  lessonId: string;
  /** Lesson version at time of publish */
  lessonVersion: string;
  /** Export format */
  format: ExportFormat;
  /** Export configuration used */
  config: ExportConfig;
  /** Package file URL */
  fileUrl: string;
  /** Package file size in bytes */
  fileSize: number;
  /** Package checksum (SHA-256) */
  checksum: string;
  /** Creation timestamp */
  createdAt: string;
  /** User who created the package */
  createdBy: string;
  /** Organization ID */
  organizationId: string;
  /** Download count */
  downloadCount: number;
  /** Whether package is currently active */
  isActive: boolean;
  /** Notes or changelog */
  notes?: string;
  /** Validation results */
  validationResults?: ValidationResult;
}

// =============================================================================
// VALIDATION TYPES
// =============================================================================

/**
 * Validation issue severity levels.
 */
export type ValidationSeverity = 'error' | 'warning' | 'info';

/**
 * Individual validation issue.
 */
export interface ValidationIssue {
  /** Issue severity */
  severity: ValidationSeverity;
  /** Issue code for categorization */
  code: string;
  /** Human-readable message */
  message: string;
  /** Path to the affected element (e.g., "slides[0].blocks[2]") */
  path?: string;
  /** Suggested fix */
  suggestion?: string;
}

/**
 * Validation result summary.
 */
export interface ValidationResult {
  /** Whether validation passed (no errors) */
  isValid: boolean;
  /** All validation issues found */
  issues: ValidationIssue[];
  /** Count of errors */
  errorCount: number;
  /** Count of warnings */
  warningCount: number;
  /** Count of info messages */
  infoCount: number;
  /** Timestamp of validation */
  validatedAt: string;
  /** Format that was validated */
  format: ExportFormat;
}

// =============================================================================
// PACKAGE GENERATOR TYPES
// =============================================================================

/**
 * Generated file entry for a package.
 */
export interface GeneratedFile {
  /** File path within the package */
  path: string;
  /** File content (string for text, Buffer for binary) */
  content: string | ArrayBuffer;
  /** MIME type */
  mimeType: string;
  /** Whether file is binary */
  isBinary: boolean;
}

/**
 * Package generation result.
 */
export interface PackageGenerationResult {
  /** Whether generation was successful */
  success: boolean;
  /** Generated files */
  files: GeneratedFile[];
  /** Package manifest/metadata */
  manifest?: Record<string, unknown>;
  /** Any warnings during generation */
  warnings: string[];
  /** Error message if failed */
  error?: string;
  /** Generation statistics */
  stats: {
    /** Total files generated */
    totalFiles: number;
    /** Total size before optimization */
    totalSizeBeforeOptimization: number;
    /** Total size after optimization */
    totalSizeAfterOptimization: number;
    /** Generation duration in milliseconds */
    generationDurationMs: number;
  };
}

// =============================================================================
// LMS CONFIGURATION TYPES
// =============================================================================

/**
 * LMS preset configurations for common platforms.
 */
export interface LMSPreset {
  /** Preset ID */
  id: string;
  /** Display name */
  name: string;
  /** LMS platform name */
  platform: string;
  /** Recommended export format */
  recommendedFormat: ExportFormat;
  /** Format-specific settings */
  settings: Partial<ExportConfig>;
  /** Notes about this LMS */
  notes?: string;
}

/**
 * Common LMS presets.
 */
export const LMS_PRESETS: LMSPreset[] = [
  {
    id: 'moodle',
    name: 'Moodle',
    platform: 'Moodle',
    recommendedFormat: 'scorm_12',
    settings: {
      format: 'scorm_12',
    },
    notes: 'SCORM 1.2 is most reliable for Moodle',
  },
  {
    id: 'canvas',
    name: 'Canvas LMS',
    platform: 'Canvas',
    recommendedFormat: 'scorm_2004_3rd',
    settings: {
      format: 'scorm_2004_3rd',
    },
  },
  {
    id: 'blackboard',
    name: 'Blackboard Learn',
    platform: 'Blackboard',
    recommendedFormat: 'scorm_2004_4th',
    settings: {
      format: 'scorm_2004_4th',
    },
  },
  {
    id: 'brightspace',
    name: 'D2L Brightspace',
    platform: 'Brightspace',
    recommendedFormat: 'scorm_2004_3rd',
    settings: {
      format: 'scorm_2004_3rd',
    },
  },
  {
    id: 'cornerstone',
    name: 'Cornerstone OnDemand',
    platform: 'Cornerstone',
    recommendedFormat: 'scorm_12',
    settings: {
      format: 'scorm_12',
    },
  },
  {
    id: 'sap-successfactors',
    name: 'SAP SuccessFactors',
    platform: 'SuccessFactors',
    recommendedFormat: 'scorm_2004_4th',
    settings: {
      format: 'scorm_2004_4th',
    },
  },
  {
    id: 'workday-learning',
    name: 'Workday Learning',
    platform: 'Workday',
    recommendedFormat: 'xapi',
    settings: {
      format: 'xapi',
    },
  },
  {
    id: 'docebo',
    name: 'Docebo',
    platform: 'Docebo',
    recommendedFormat: 'xapi',
    settings: {
      format: 'xapi',
    },
  },
  {
    id: 'litmos',
    name: 'SAP Litmos',
    platform: 'Litmos',
    recommendedFormat: 'scorm_12',
    settings: {
      format: 'scorm_12',
    },
  },
  {
    id: 'absorb',
    name: 'Absorb LMS',
    platform: 'Absorb',
    recommendedFormat: 'scorm_2004_3rd',
    settings: {
      format: 'scorm_2004_3rd',
    },
  },
];

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Check if export format is SCORM.
 */
export function isScormFormat(
  format: ExportFormat,
): format is 'scorm_12' | 'scorm_2004_3rd' | 'scorm_2004_4th' {
  return format.startsWith('scorm_');
}

/**
 * Check if export format supports tracking.
 */
export function supportsTracking(format: ExportFormat): boolean {
  return ['scorm_12', 'scorm_2004_3rd', 'scorm_2004_4th', 'xapi', 'cmi5'].includes(format);
}

/**
 * Get file extension for export format.
 */
export function getExportFileExtension(format: ExportFormat): string {
  switch (format) {
    case 'scorm_12':
    case 'scorm_2004_3rd':
    case 'scorm_2004_4th':
    case 'xapi':
    case 'cmi5':
    case 'html5':
      return 'zip';
    case 'pdf':
      return 'pdf';
    case 'video':
      return 'mp4';
    default:
      return 'zip';
  }
}

/**
 * Get MIME type for export format.
 */
export function getExportMimeType(format: ExportFormat): string {
  switch (format) {
    case 'pdf':
      return 'application/pdf';
    case 'video':
      return 'video/mp4';
    default:
      return 'application/zip';
  }
}

// =============================================================================
// DEFAULT CONFIGURATIONS
// =============================================================================

/**
 * Default SCORM export configuration.
 */
export const DEFAULT_SCORM_CONFIG: Omit<
  ScormExportConfig,
  'id' | 'lessonId' | 'createdAt' | 'createdBy'
> = {
  format: 'scorm_2004_3rd',
  version: '1.0.0',
  manifest: {
    identifier: '',
    title: '',
    scoIdentifier: 'SCO001',
    masteryScore: 80,
  },
  playerSettings: {
    autoAdvance: false,
    allowBackNavigation: true,
    showNavigation: true,
    showProgress: true,
    enableKeyboardNav: true,
    completionCriteria: 'allSlides',
    passingScore: 80,
  },
  optimization: {
    compressImages: true,
    imageQuality: 85,
    minifyJs: true,
    minifyCss: true,
    includeSourceMaps: false,
  },
};

/**
 * Default xAPI export configuration.
 */
export const DEFAULT_XAPI_CONFIG: Omit<
  XAPIExportConfig,
  'id' | 'lessonId' | 'createdAt' | 'createdBy'
> = {
  format: 'xapi',
  version: '1.0.0',
  lrs: {
    promptForConfig: true,
    activityIdBase: 'https://inspire.lxd360.com/activities',
  },
  statements: {
    includeExtendedVerbs: true,
    trackSlides: true,
    trackInteractions: true,
    trackMedia: true,
    batchSize: 10,
  },
  playerSettings: DEFAULT_SCORM_CONFIG.playerSettings,
  optimization: DEFAULT_SCORM_CONFIG.optimization,
};

/**
 * Default HTML5 export configuration.
 */
export const DEFAULT_HTML5_CONFIG: Omit<
  HTML5ExportConfig,
  'id' | 'lessonId' | 'createdAt' | 'createdBy'
> = {
  format: 'html5',
  version: '1.0.0',
  hosting: {
    relativePaths: true,
    offlineSupport: true,
  },
  playerSettings: DEFAULT_SCORM_CONFIG.playerSettings,
  optimization: DEFAULT_SCORM_CONFIG.optimization,
};
