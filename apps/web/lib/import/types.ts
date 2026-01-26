/**
 * Content Format Types for Course Import
 *
 * Defines the supported content package formats and metadata structures
 * for importing courses into the LXD360 platform.
 */

import type { Timestamp } from 'firebase-admin/firestore';

/**
 * Supported content package formats
 */
export type ContentFormat =
  | 'scorm_1.2'
  | 'scorm_2004'
  | 'xapi'
  | 'cmi5'
  | 'aicc'
  | 'html5'
  | 'pdf'
  | 'unknown';

/**
 * Compliance types for categorization
 */
export type ComplianceType =
  | 'safety'
  | 'security'
  | 'harassment'
  | 'diversity'
  | 'professional'
  | 'wellness'
  | null;

/**
 * SCORM version for more specific identification
 */
export type ScormVersion =
  | '1.2'
  | '2004 2nd Edition'
  | '2004 3rd Edition'
  | '2004 4th Edition'
  | 'unknown';

/**
 * Course metadata extracted from manifest files
 */
export interface CourseMetadata {
  title: string;
  description: string;
  entryPoint: string;
  version?: string;
  duration?: number;
  language?: string;
  objectives?: string[];
  prerequisites?: string[];
  organization?: OrganizationStructure;
  activityId?: string; // For xAPI/cmi5
  launchUrl?: string; // For xAPI/cmi5
}

/**
 * Organization structure from SCORM manifest
 */
export interface OrganizationStructure {
  identifier: string;
  title: string;
  items: OrganizationItem[];
}

/**
 * Individual item in SCORM organization
 */
export interface OrganizationItem {
  identifier: string;
  identifierRef?: string;
  title: string;
  items?: OrganizationItem[];
}

/**
 * Resource entry from SCORM manifest
 */
export interface ManifestResource {
  identifier: string;
  type: string;
  href?: string;
  scormType?: string;
  files?: string[];
}

/**
 * Upload result from storage uploader
 */
export interface UploadResult {
  storagePath: string;
  storageUrl: string;
  fileSize: number;
}

/**
 * Detection result from format detector
 */
export interface FormatDetectionResult {
  format: ContentFormat;
  version?: ScormVersion;
  manifestPath?: string;
  entryPoint?: string;
}

/**
 * Course document for Firestore
 */
export interface CourseDocument {
  id: string;
  tenantId: string;
  title: string;
  description: string;
  format: ContentFormat;
  entryPoint: string;
  storagePath: string;
  storageUrl: string;
  enrollmentSettings: {
    selfEnrollment: boolean;
    approvalRequired: boolean;
  };
  complianceType: ComplianceType;
  isRequired: boolean;
  status: 'published';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  // Optional metadata
  version?: string;
  duration?: number;
  language?: string;
  activityId?: string;
  originalFilename?: string;
}

/**
 * Import result for a single course
 */
export interface ImportResult {
  success: boolean;
  filename: string;
  courseId?: string;
  format?: ContentFormat;
  title?: string;
  error?: string;
}

/**
 * Batch import summary
 */
export interface ImportSummary {
  total: number;
  successful: number;
  failed: number;
  byFormat: Record<ContentFormat, number>;
  results: ImportResult[];
}

/**
 * Category rules for automatic categorization
 */
export interface CategoryRule {
  category: ComplianceType;
  patterns: string[];
  isRequired: boolean;
  approvalRequired: boolean;
}

/**
 * Default category rules based on course content
 */
export const CATEGORY_RULES: CategoryRule[] = [
  {
    category: 'safety',
    patterns: ['construction-safety', 'weather', 'safety'],
    isRequired: true,
    approvalRequired: false,
  },
  {
    category: 'security',
    patterns: ['protect-your-data', 'phishing', 'security', 'social-engineering'],
    isRequired: true,
    approvalRequired: false,
  },
  {
    category: 'harassment',
    patterns: ['sexual-harassment', 'harassment'],
    isRequired: true,
    approvalRequired: false,
  },
  {
    category: 'diversity',
    patterns: ['diversity', 'inclusiveness', 'bias', 'ally', 'deib'],
    isRequired: false,
    approvalRequired: true,
  },
  {
    category: 'professional',
    patterns: ['project-management', 'gossip', 'conflict', 'management'],
    isRequired: false,
    approvalRequired: true,
  },
  {
    category: 'wellness',
    patterns: ['naps', 'wellness', 'health', 'stress'],
    isRequired: false,
    approvalRequired: false,
  },
];

/**
 * Files to exclude for manual upload testing
 */
export const MANUAL_UPLOAD_FILES = [
  'how-to-protect-your-data-scorm12-CSROxLaE.zip',
  'diversity-basics-foundations-xapi-b63XOx1k.zip',
  'how-to-avoid-bias-in-talent-recruiting-and-retention-dmGMVGv0.pdf',
  'how-to-avoid-bias-in-talent-recruiting-and-retention-raw-obl5AB90.zip',
];
