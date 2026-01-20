// =============================================================================
// VALIDATION TYPES
// =============================================================================

/**
 * Issue severity levels
 */
export type IssueSeverity = 'error' | 'warning' | 'info' | 'suggestion';

/**
 * Issue category
 */
export type IssueCategory =
  | 'accessibility'
  | 'content'
  | 'media'
  | 'link'
  | 'spelling'
  | 'grammar'
  | 'structure'
  | 'metadata'
  | 'performance'
  | 'compliance';

/**
 * Validation issue
 */
export interface ValidationIssue {
  id: string;
  category: IssueCategory;
  severity: IssueSeverity;
  message: string;
  description?: string;
  location: IssueLocation;
  rule?: ValidationRule;
  autoFixable: boolean;
  autoFix?: () => void;
  helpUrl?: string;
}

/**
 * Location of an issue within content
 */
export interface IssueLocation {
  lessonId?: string;
  slideId?: string;
  blockId?: string;
  blockType?: string;
  elementPath?: string;
  lineNumber?: number;
  columnNumber?: number;
  snippet?: string;
}

/**
 * Validation rule definition
 */
export interface ValidationRule {
  id: string;
  name: string;
  category: IssueCategory;
  severity: IssueSeverity;
  description: string;
  enabled: boolean;
  configurable?: boolean;
  options?: Record<string, unknown>;
}

// =============================================================================
// ACCESSIBILITY TYPES
// =============================================================================

/**
 * WCAG conformance level
 */
export type WCAGLevel = 'A' | 'AA' | 'AAA';

/**
 * WCAG principle
 */
export type WCAGPrinciple = 'perceivable' | 'operable' | 'understandable' | 'robust';

/**
 * Accessibility check result
 */
export interface AccessibilityCheck {
  id: string;
  wcagCriterion: string;
  wcagLevel: WCAGLevel;
  principle: WCAGPrinciple;
  name: string;
  description: string;
  passed: boolean;
  issues: ValidationIssue[];
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
}

/**
 * Accessibility report
 */
export interface AccessibilityReport {
  timestamp: string;
  targetLevel: WCAGLevel;
  overallScore: number;
  passed: number;
  failed: number;
  warnings: number;
  checks: AccessibilityCheck[];
  summary: AccessibilitySummary;
}

/**
 * Accessibility summary by principle
 */
export interface AccessibilitySummary {
  perceivable: { passed: number; failed: number };
  operable: { passed: number; failed: number };
  understandable: { passed: number; failed: number };
  robust: { passed: number; failed: number };
}

// =============================================================================
// CONTENT VALIDATION TYPES
// =============================================================================

/**
 * Content check type
 */
export type ContentCheckType =
  | 'spelling'
  | 'grammar'
  | 'readability'
  | 'terminology'
  | 'style'
  | 'factual'
  | 'completeness';

/**
 * Spelling/grammar issue
 */
export interface SpellingGrammarIssue extends ValidationIssue {
  word?: string;
  suggestions: string[];
  context: string;
  issueType: 'spelling' | 'grammar' | 'punctuation' | 'style';
}

/**
 * Readability metrics
 */
export interface ReadabilityMetrics {
  fleschKincaidGrade: number;
  fleschReadingEase: number;
  gunningFog: number;
  smog: number;
  colemanLiau: number;
  automatedReadability: number;
  averageGradeLevel: number;
  wordCount: number;
  sentenceCount: number;
  syllableCount: number;
  averageWordsPerSentence: number;
  averageSyllablesPerWord: number;
  complexWordPercentage: number;
}

/**
 * Content validation report
 */
export interface ContentValidationReport {
  timestamp: string;
  spellingIssues: SpellingGrammarIssue[];
  grammarIssues: SpellingGrammarIssue[];
  readability: ReadabilityMetrics;
  wordFrequency: Map<string, number>;
  targetReadingLevel?: string;
  meetsReadingLevel: boolean;
}

// =============================================================================
// MEDIA VALIDATION TYPES
// =============================================================================

/**
 * Media type for validation
 */
export type MediaType = 'image' | 'video' | 'audio' | 'document' | 'embed';

/**
 * Media status
 */
export type MediaStatus = 'valid' | 'broken' | 'missing' | 'unoptimized' | 'unchecked';

/**
 * Media item validation
 */
export interface MediaValidation {
  id: string;
  type: MediaType;
  url: string;
  status: MediaStatus;
  issues: ValidationIssue[];
  metadata?: MediaMetadata;
  suggestions?: MediaSuggestion[];
}

/**
 * Media metadata
 */
export interface MediaMetadata {
  filename?: string;
  fileSize?: number;
  mimeType?: string;
  dimensions?: { width: number; height: number };
  duration?: number;
  aspectRatio?: string;
  hasAltText?: boolean;
  altText?: string;
  hasCaption?: boolean;
  hasTranscript?: boolean;
  colorDepth?: number;
  codec?: string;
  bitrate?: number;
}

/**
 * Media optimization suggestion
 */
export interface MediaSuggestion {
  type: 'compress' | 'resize' | 'format' | 'accessibility';
  message: string;
  estimatedSavings?: number;
  autoApplicable: boolean;
}

/**
 * Media validation report
 */
export interface MediaValidationReport {
  timestamp: string;
  totalMedia: number;
  validMedia: number;
  brokenMedia: number;
  missingMedia: number;
  unoptimizedMedia: number;
  totalSize: number;
  potentialSavings: number;
  items: MediaValidation[];
}

// =============================================================================
// LINK VALIDATION TYPES
// =============================================================================

/**
 * Link type
 */
export type LinkType = 'internal' | 'external' | 'anchor' | 'mailto' | 'tel' | 'download';

/**
 * Link status
 */
export type LinkStatus = 'valid' | 'broken' | 'redirect' | 'timeout' | 'unchecked';

/**
 * Link validation result
 */
export interface LinkValidation {
  id: string;
  url: string;
  type: LinkType;
  status: LinkStatus;
  statusCode?: number;
  responseTime?: number;
  redirectUrl?: string;
  location: IssueLocation;
  issues: ValidationIssue[];
}

/**
 * Link validation report
 */
export interface LinkValidationReport {
  timestamp: string;
  totalLinks: number;
  validLinks: number;
  brokenLinks: number;
  redirectedLinks: number;
  timeoutLinks: number;
  externalLinks: number;
  internalLinks: number;
  items: LinkValidation[];
}

// =============================================================================
// PREVIEW TYPES
// =============================================================================

/**
 * Device preset for preview
 */
export interface DevicePreset {
  id: string;
  name: string;
  type: 'desktop' | 'tablet' | 'mobile' | 'custom';
  width: number;
  height: number;
  pixelRatio: number;
  userAgent?: string;
  orientation: 'portrait' | 'landscape';
}

/**
 * Preview mode
 */
export type PreviewMode =
  | 'desktop'
  | 'tablet'
  | 'mobile'
  | 'responsive'
  | 'accessibility'
  | 'print';

/**
 * Preview settings
 */
export interface PreviewSettings {
  device: DevicePreset;
  mode: PreviewMode;
  showRulers: boolean;
  showGrid: boolean;
  simulateColorBlindness?: ColorBlindnessType;
  simulateReducedMotion: boolean;
  simulateDarkMode: boolean;
  simulateHighContrast: boolean;
  zoomLevel: number;
}

/**
 * Color blindness types for simulation
 */
export type ColorBlindnessType =
  | 'protanopia'
  | 'deuteranopia'
  | 'tritanopia'
  | 'achromatopsia'
  | 'protanomaly'
  | 'deuteranomaly'
  | 'tritanomaly';

// =============================================================================
// QA REPORT TYPES
// =============================================================================

/**
 * Overall QA status
 */
export type QAStatus = 'passed' | 'failed' | 'warning' | 'not-run';

/**
 * QA check configuration
 */
export interface QACheckConfig {
  accessibility: {
    enabled: boolean;
    targetLevel: WCAGLevel;
  };
  content: {
    enabled: boolean;
    spellCheck: boolean;
    grammarCheck: boolean;
    readabilityCheck: boolean;
    targetReadingLevel?: string;
  };
  media: {
    enabled: boolean;
    validateUrls: boolean;
    checkOptimization: boolean;
    maxFileSize?: number;
  };
  links: {
    enabled: boolean;
    checkExternal: boolean;
    timeout?: number;
  };
  structure: {
    enabled: boolean;
    requireMetadata: boolean;
    requireObjectives: boolean;
  };
}

/**
 * Comprehensive QA report
 */
export interface QAReport {
  id: string;
  lessonId: string;
  timestamp: string;
  duration: number;
  status: QAStatus;
  config: QACheckConfig;
  summary: QASummary;
  accessibility?: AccessibilityReport;
  content?: ContentValidationReport;
  media?: MediaValidationReport;
  links?: LinkValidationReport;
  structure?: StructureValidationReport;
  allIssues: ValidationIssue[];
}

/**
 * QA summary
 */
export interface QASummary {
  totalIssues: number;
  errors: number;
  warnings: number;
  suggestions: number;
  passedChecks: number;
  failedChecks: number;
  score: number;
  byCategory: Record<IssueCategory, number>;
}

/**
 * Structure validation report
 */
export interface StructureValidationReport {
  timestamp: string;
  hasTitle: boolean;
  hasDescription: boolean;
  hasLearningObjectives: boolean;
  hasThumbnail: boolean;
  slideCount: number;
  blockCount: number;
  emptySlides: string[];
  orphanedBlocks: string[];
  missingContent: ValidationIssue[];
}

// =============================================================================
// QA DASHBOARD TYPES
// =============================================================================

/**
 * QA history entry
 */
export interface QAHistoryEntry {
  reportId: string;
  timestamp: string;
  status: QAStatus;
  score: number;
  issueCount: number;
}

/**
 * QA trend data
 */
export interface QATrend {
  date: string;
  score: number;
  issueCount: number;
  errorCount: number;
  warningCount: number;
}

/**
 * QA dashboard data
 */
export interface QADashboard {
  currentStatus: QAStatus;
  currentScore: number;
  lastRunTimestamp?: string;
  history: QAHistoryEntry[];
  trends: QATrend[];
  topIssues: ValidationIssue[];
  quickFixes: ValidationIssue[];
}

// =============================================================================
// PRESET DEVICE CONFIGURATIONS
// =============================================================================

export const DEFAULT_DEVICE_PRESETS: DevicePreset[] = [
  {
    id: 'desktop-1920',
    name: 'Desktop (1920x1080)',
    type: 'desktop',
    width: 1920,
    height: 1080,
    pixelRatio: 1,
    orientation: 'landscape',
  },
  {
    id: 'desktop-1440',
    name: 'Desktop (1440x900)',
    type: 'desktop',
    width: 1440,
    height: 900,
    pixelRatio: 1,
    orientation: 'landscape',
  },
  {
    id: 'laptop',
    name: 'Laptop (1366x768)',
    type: 'desktop',
    width: 1366,
    height: 768,
    pixelRatio: 1,
    orientation: 'landscape',
  },
  {
    id: 'ipad-pro',
    name: 'iPad Pro',
    type: 'tablet',
    width: 1024,
    height: 1366,
    pixelRatio: 2,
    orientation: 'portrait',
  },
  {
    id: 'ipad',
    name: 'iPad',
    type: 'tablet',
    width: 768,
    height: 1024,
    pixelRatio: 2,
    orientation: 'portrait',
  },
  {
    id: 'iphone-14-pro',
    name: 'iPhone 14 Pro',
    type: 'mobile',
    width: 393,
    height: 852,
    pixelRatio: 3,
    orientation: 'portrait',
  },
  {
    id: 'iphone-se',
    name: 'iPhone SE',
    type: 'mobile',
    width: 375,
    height: 667,
    pixelRatio: 2,
    orientation: 'portrait',
  },
  {
    id: 'pixel-7',
    name: 'Pixel 7',
    type: 'mobile',
    width: 412,
    height: 915,
    pixelRatio: 2.625,
    orientation: 'portrait',
  },
];

// =============================================================================
// DEFAULT QA CONFIGURATION
// =============================================================================

export const DEFAULT_QA_CONFIG: QACheckConfig = {
  accessibility: {
    enabled: true,
    targetLevel: 'AA',
  },
  content: {
    enabled: true,
    spellCheck: true,
    grammarCheck: true,
    readabilityCheck: true,
    targetReadingLevel: '8th grade',
  },
  media: {
    enabled: true,
    validateUrls: true,
    checkOptimization: true,
    maxFileSize: 10 * 1024 * 1024, // 10MB
  },
  links: {
    enabled: true,
    checkExternal: true,
    timeout: 10000,
  },
  structure: {
    enabled: true,
    requireMetadata: true,
    requireObjectives: true,
  },
};
