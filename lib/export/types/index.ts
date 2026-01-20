// ============================================================================
// EXPORT FORMATS
// ============================================================================

/**
 * Supported export formats
 */
export type ExportFormat = 'scorm-1.2' | 'scorm-2004' | 'xapi' | 'cmi5' | 'html5' | 'pdf';

/**
 * SCORM version identifiers
 */
export type SCORMVersion = '1.2' | '2004-3rd' | '2004-4th';

// ============================================================================
// EXPORT OPTIONS
// ============================================================================

/**
 * Course export options
 */
export interface ExportOptions {
  /** Export format */
  format: ExportFormat;
  /** Course ID to export */
  courseId: string;
  /** Export settings */
  settings: ExportSettings;
  /** Optional metadata override */
  metadata?: CourseMetadata;
}

/**
 * Export settings configuration
 */
export interface ExportSettings {
  /** How completion is determined */
  completionCriteria: CompletionCriteria;
  /** How scores are calculated across attempts */
  scoringMethod: ScoringMethod;
  /** Whether to include detailed interaction data */
  includeInteractions: boolean;
  /** SCORM-specific settings */
  scorm?: SCORMSettings;
  /** xAPI-specific settings */
  xapi?: XAPISettings;
  /** Packaging options */
  packaging?: PackagingOptions;
}

/**
 * Completion criteria options
 */
export type CompletionCriteria =
  | 'passed' // Must achieve passing score
  | 'completed' // Must complete all content
  | 'launched'; // Just needs to be launched

/**
 * Scoring method for multiple attempts
 */
export type ScoringMethod =
  | 'highest' // Use highest score
  | 'latest' // Use most recent score
  | 'average' // Average all attempts
  | 'first'; // Use first attempt

/**
 * SCORM-specific settings
 */
export interface SCORMSettings {
  /** SCORM version */
  version: SCORMVersion;
  /** Passing score (0-100) */
  passingScore: number;
  /** Time limit in minutes (0 = unlimited) */
  timeLimit: number;
  /** Allow review after completion */
  allowReview: boolean;
  /** Credit mode */
  credit: 'credit' | 'no-credit';
  /** Launch data to pass to content */
  launchData?: string;
}

/**
 * xAPI-specific settings
 */
export interface XAPISettings {
  /** LRS endpoint URL */
  endpoint?: string;
  /** Activity ID prefix */
  activityIdPrefix: string;
  /** Include detailed verb tracking */
  verboseTracking: boolean;
  /** Custom extensions to include */
  extensions?: Record<string, unknown>;
}

/**
 * Packaging options
 */
export interface PackagingOptions {
  /** Compress the package */
  compress: boolean;
  /** Compression level (1-9) */
  compressionLevel?: number;
  /** Include source files */
  includeSource: boolean;
  /** Minify JavaScript */
  minifyJs: boolean;
  /** Minify CSS */
  minifyCss: boolean;
}

// ============================================================================
// COURSE METADATA
// ============================================================================

/**
 * Course metadata for export
 */
export interface CourseMetadata {
  /** Course identifier */
  identifier: string;
  /** Course title */
  title: string;
  /** Course description */
  description?: string;
  /** Version number */
  version: string;
  /** Keywords/tags */
  keywords?: string[];
  /** Primary language */
  language: string;
  /** Author information */
  author?: AuthorInfo;
  /** Copyright information */
  copyright?: string;
  /** Duration in ISO 8601 format */
  duration?: string;
  /** Creation date */
  createdAt?: string;
  /** Last modified date */
  modifiedAt?: string;
}

/**
 * Author information
 */
export interface AuthorInfo {
  name: string;
  email?: string;
  organization?: string;
}

// ============================================================================
// EXPORT RESULT
// ============================================================================

/**
 * Result of an export operation
 */
export interface ExportResult {
  /** Whether the export succeeded */
  success: boolean;
  /** URL to download the package (if successful) */
  packageUrl?: string;
  /** Package size in bytes */
  packageSize?: number;
  /** Package checksum */
  checksum?: string;
  /** Error message (if failed) */
  error?: string;
  /** Detailed error information */
  errorDetails?: ExportError;
  /** Export statistics */
  stats?: ExportStats;
}

/**
 * Export error details
 */
export interface ExportError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Export statistics
 */
export interface ExportStats {
  /** Total items exported */
  totalItems: number;
  /** Total file size (bytes) */
  totalSize: number;
  /** Export duration (ms) */
  duration: number;
  /** Number of warnings */
  warnings: number;
  /** Warning messages */
  warningMessages?: string[];
}

// ============================================================================
// MANIFEST TYPES
// ============================================================================

/**
 * SCORM manifest structure
 */
export interface SCORMManifest {
  /** Manifest identifier */
  identifier: string;
  /** Schema version */
  version: string;
  /** Metadata */
  metadata: ManifestMetadata;
  /** Organizations */
  organizations: Organization[];
  /** Resources */
  resources: Resource[];
}

/**
 * Manifest metadata
 */
export interface ManifestMetadata {
  schema: string;
  schemaversion: string;
  title: string;
  description?: string;
  keywords?: string[];
  language?: string;
  version?: string;
  duration?: string;
}

/**
 * Organization structure (course hierarchy)
 */
export interface Organization {
  identifier: string;
  title: string;
  items: OrganizationItem[];
}

/**
 * Organization item (SCO or asset)
 */
export interface OrganizationItem {
  identifier: string;
  identifierref?: string;
  title: string;
  items?: OrganizationItem[];
  /** SCORM sequencing rules */
  sequencing?: SequencingRules;
  /** Mastery score (SCORM 2004) */
  masteryScore?: number;
  /** Completion threshold */
  completionThreshold?: number;
}

/**
 * Resource definition
 */
export interface Resource {
  identifier: string;
  type: 'webcontent' | 'asset';
  scormType?: 'sco' | 'asset';
  href?: string;
  files: ResourceFile[];
  dependencies?: string[];
}

/**
 * Resource file
 */
export interface ResourceFile {
  href: string;
  size?: number;
  checksum?: string;
}

/**
 * Sequencing rules (SCORM 2004)
 */
export interface SequencingRules {
  /** Control mode */
  controlMode?: {
    choice: boolean;
    choiceExit: boolean;
    flow: boolean;
    forwardOnly: boolean;
  };
  /** Completion rules */
  rollupRules?: RollupRule[];
  /** Objectives */
  objectives?: Objective[];
}

/**
 * Rollup rule for completion/mastery
 */
export interface RollupRule {
  childActivitySet: 'all' | 'unknown' | 'none' | 'atLeastCount' | 'atLeastPercent';
  minimumCount?: number;
  minimumPercent?: number;
  action: 'satisfied' | 'notSatisfied' | 'completed' | 'incomplete';
}

/**
 * Learning objective
 */
export interface Objective {
  objectiveID: string;
  satisfiedByMeasure: boolean;
  minNormalizedMeasure?: number;
}

// ============================================================================
// CONTENT TYPES
// ============================================================================

/**
 * Content item for export
 */
export interface ContentItem {
  id: string;
  type: ContentItemType;
  title: string;
  description?: string;
  duration?: string;
  order: number;
  parentId?: string;
  resources: ContentResource[];
  /** xAPI activity definition */
  activityDefinition?: ActivityDefinition;
  /** Assessment settings */
  assessmentSettings?: AssessmentSettings;
}

/**
 * Content item types
 */
export type ContentItemType =
  | 'module'
  | 'lesson'
  | 'page'
  | 'video'
  | 'audio'
  | 'document'
  | 'quiz'
  | 'assessment'
  | 'interactive'
  | 'scenario';

/**
 * Content resource
 */
export interface ContentResource {
  id: string;
  type: 'html' | 'video' | 'audio' | 'image' | 'document' | 'data';
  url: string;
  mimeType: string;
  size?: number;
}

/**
 * xAPI activity definition
 */
export interface ActivityDefinition {
  type: string;
  name: Record<string, string>;
  description?: Record<string, string>;
  interactionType?: string;
  correctResponsesPattern?: string[];
  choices?: Array<{ id: string; description: Record<string, string> }>;
}

/**
 * Assessment settings
 */
export interface AssessmentSettings {
  passingScore: number;
  maxAttempts: number;
  shuffleQuestions: boolean;
  shuffleAnswers: boolean;
  showFeedback: boolean;
  timeLimit?: number;
}

// ============================================================================
// HELPER TYPE GUARDS
// ============================================================================

/**
 * Check if format is SCORM
 */
export function isSCORMFormat(format: ExportFormat): format is 'scorm-1.2' | 'scorm-2004' {
  return format === 'scorm-1.2' || format === 'scorm-2004';
}

/**
 * Check if format is xAPI-based
 */
export function isXAPIFormat(format: ExportFormat): format is 'xapi' | 'cmi5' {
  return format === 'xapi' || format === 'cmi5';
}

/**
 * Get default settings for a format
 */
export function getDefaultSettings(format: ExportFormat): ExportSettings {
  const baseSettings: ExportSettings = {
    completionCriteria: 'completed',
    scoringMethod: 'highest',
    includeInteractions: true,
    packaging: {
      compress: true,
      compressionLevel: 6,
      includeSource: false,
      minifyJs: true,
      minifyCss: true,
    },
  };

  if (format === 'scorm-1.2') {
    return {
      ...baseSettings,
      scorm: {
        version: '1.2',
        passingScore: 80,
        timeLimit: 0,
        allowReview: true,
        credit: 'credit',
      },
    };
  }

  if (format === 'scorm-2004') {
    return {
      ...baseSettings,
      scorm: {
        version: '2004-4th',
        passingScore: 80,
        timeLimit: 0,
        allowReview: true,
        credit: 'credit',
      },
    };
  }

  if (format === 'xapi' || format === 'cmi5') {
    return {
      ...baseSettings,
      xapi: {
        activityIdPrefix: 'https://lxp360.com/xapi/activities',
        verboseTracking: true,
      },
    };
  }

  return baseSettings;
}
