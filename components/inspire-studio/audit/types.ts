'use client';

import { z } from 'zod';

// =============================================================================
// INSPIRE Audit Types
// =============================================================================
// Types for the INSPIRE methodology audit phase, including learning design
// validation, cognitive load assessment, and compliance checks.
// =============================================================================

// =============================================================================
// Audit Categories
// =============================================================================

export const AuditCategorySchema = z.enum([
  'learning-design', // INSPIRE methodology adherence
  'cognitive-load', // CLT compliance
  'accessibility', // WCAG compliance
  'xapi-tracking', // xAPI statement coverage
  'content-quality', // Spelling, grammar, readability
  'media-optimization', // File sizes, formats
  'compliance', // SCORM, cmi5, LMS compatibility
]);
export type AuditCategory = z.infer<typeof AuditCategorySchema>;

export const AuditSeveritySchema = z.enum(['critical', 'major', 'minor', 'info']);
export type AuditSeverity = z.infer<typeof AuditSeveritySchema>;

export const AuditStatusSchema = z.enum(['not-run', 'running', 'passed', 'failed', 'warning']);
export type AuditStatus = z.infer<typeof AuditStatusSchema>;

// =============================================================================
// Audit Issue
// =============================================================================

export interface AuditIssue {
  id: string;
  category: AuditCategory;
  severity: AuditSeverity;
  title: string;
  description: string;
  location?: {
    phase?: string;
    step?: string;
    blockId?: string;
    blockType?: string;
    field?: string;
  };
  recommendation?: string;
  autoFixable: boolean;
  wcagCriterion?: string;
  inspireRule?: string;
}

// =============================================================================
// Category-Specific Reports
// =============================================================================

export interface LearningDesignReport {
  status: AuditStatus;
  score: number; // 0-100
  issues: AuditIssue[];

  // INSPIRE Phase Coverage
  phaseCompletion: {
    encoding: { complete: boolean; percentage: number };
    synthesization: { complete: boolean; percentage: number };
    assimilation: { complete: boolean; percentage: number };
  };

  // Objective Alignment
  objectivesCovered: number;
  objectivesTotal: number;
  unmappedBlocks: string[];

  // Assessment Coverage
  assessmentCoverage: {
    formative: number;
    summative: number;
    practiceRatio: number; // Ideal is 3:1 practice:assessment
  };

  // Bloom's Taxonomy Distribution
  bloomsDistribution: {
    remember: number;
    understand: number;
    apply: number;
    analyze: number;
    evaluate: number;
    create: number;
  };
}

export interface CognitiveLoadReport {
  status: AuditStatus;
  score: number; // 0-100
  issues: AuditIssue[];

  // Overall Metrics
  averageLoad: number; // 1-10
  peakLoad: number;
  peakLocation?: {
    phase?: string;
    step?: string;
    blockId?: string;
  };

  // Load Components
  intrinsicLoad: number;
  extraneousLoad: number;
  germaneLoad: number;

  // Content Analysis
  contentDensity: {
    textPerSlide: number;
    mediaPerSlide: number;
    interactionsPerSlide: number;
  };

  // Recommendations
  recommendations: string[];
}

export interface AccessibilityReport {
  status: AuditStatus;
  score: number; // 0-100
  issues: AuditIssue[];

  // WCAG Compliance
  wcagLevel: 'A' | 'AA' | 'AAA' | 'none';
  wcagPassed: number;
  wcagFailed: number;

  // By Principle
  perceivable: { passed: number; failed: number };
  operable: { passed: number; failed: number };
  understandable: { passed: number; failed: number };
  robust: { passed: number; failed: number };

  // Quick Stats
  imagesWithAlt: number;
  imagesWithoutAlt: number;
  videosWithCaptions: number;
  videosWithoutCaptions: number;
  colorContrastPasses: number;
  colorContrastFails: number;
}

export interface XAPITrackingReport {
  status: AuditStatus;
  score: number; // 0-100
  issues: AuditIssue[];

  // Statement Coverage
  blocksTracked: number;
  blocksTotal: number;
  coveragePercentage: number;

  // Verb Usage
  verbsUsed: string[];
  missingVerbs: string[];

  // INSPIRE Extensions
  inspireExtensionsCovered: string[];
  inspireExtensionsMissing: string[];

  // Compliance
  xapiCompliant: boolean;
  cmi5Compatible: boolean;
  scorm2004Compatible: boolean;
}

export interface ContentQualityReport {
  status: AuditStatus;
  score: number; // 0-100
  issues: AuditIssue[];

  // Readability
  averageReadingLevel: number;
  targetReadingLevel: number;
  readabilityScore: number; // Flesch-Kincaid

  // Content Stats
  wordCount: number;
  sentenceCount: number;
  avgSentenceLength: number;
  avgWordLength: number;

  // Issues
  spellingErrors: number;
  grammarErrors: number;
  styleIssues: number;
}

export interface MediaOptimizationReport {
  status: AuditStatus;
  score: number; // 0-100
  issues: AuditIssue[];

  // Size Analysis
  totalMediaSize: number; // bytes
  optimizedSize: number; // potential bytes after optimization
  savingsPercentage: number;

  // Media Counts
  images: { count: number; totalSize: number; oversized: number };
  videos: { count: number; totalSize: number; notOptimized: number };
  audio: { count: number; totalSize: number; notOptimized: number };

  // Format Compliance
  webpImages: number;
  legacyImageFormats: number;
  mp4Videos: number;
  legacyVideoFormats: number;
}

export interface ComplianceReport {
  status: AuditStatus;
  score: number; // 0-100
  issues: AuditIssue[];

  // Standards
  scorm12: { compatible: boolean; issues: number };
  scorm2004: { compatible: boolean; issues: number };
  xapi: { compatible: boolean; issues: number };
  cmi5: { compatible: boolean; issues: number };

  // LMS Compatibility
  lmsCompatibility: {
    lms: string;
    compatible: boolean;
    notes?: string;
  }[];

  // Export Readiness
  exportReady: boolean;
  exportBlockers: string[];
}

// =============================================================================
// Full Audit Report
// =============================================================================

export interface InspireAuditReport {
  id: string;
  missionId: string;
  timestamp: string;
  duration: number; // ms

  // Overall
  overallStatus: AuditStatus;
  overallScore: number; // 0-100
  totalIssues: number;

  // By Severity
  issuesBySeverity: {
    critical: number;
    major: number;
    minor: number;
    info: number;
  };

  // Category Reports
  learningDesign: LearningDesignReport;
  cognitiveLoad: CognitiveLoadReport;
  accessibility: AccessibilityReport;
  xapiTracking: XAPITrackingReport;
  contentQuality: ContentQualityReport;
  mediaOptimization: MediaOptimizationReport;
  compliance: ComplianceReport;

  // Aggregated Issues
  allIssues: AuditIssue[];

  // Recommendations
  topRecommendations: string[];
  readyToPublish: boolean;
  publishBlockers: string[];
}

// =============================================================================
// Audit Configuration
// =============================================================================

export interface AuditConfig {
  categories: AuditCategory[];
  wcagLevel: 'A' | 'AA' | 'AAA';
  targetReadingLevel: number;
  exportFormat: 'scorm-12' | 'scorm-2004' | 'xapi' | 'cmi5';
  targetLMS?: string;
  strictMode: boolean;
}

export function getDefaultAuditConfig(): AuditConfig {
  return {
    categories: [
      'learning-design',
      'cognitive-load',
      'accessibility',
      'xapi-tracking',
      'content-quality',
      'media-optimization',
      'compliance',
    ],
    wcagLevel: 'AA',
    targetReadingLevel: 8,
    exportFormat: 'xapi',
    strictMode: false,
  };
}

// =============================================================================
// Helpers
// =============================================================================

export function getAuditCategoryLabel(category: AuditCategory): string {
  const labels: Record<AuditCategory, string> = {
    'learning-design': 'Learning Design',
    'cognitive-load': 'Cognitive Load',
    accessibility: 'Accessibility',
    'xapi-tracking': 'xAPI Tracking',
    'content-quality': 'Content Quality',
    'media-optimization': 'Media Optimization',
    compliance: 'Compliance',
  };
  return labels[category];
}

export function getAuditCategoryDescription(category: AuditCategory): string {
  const descriptions: Record<AuditCategory, string> = {
    'learning-design': 'INSPIRE methodology adherence and objective alignment',
    'cognitive-load': 'Cognitive Load Theory compliance and content density',
    accessibility: 'WCAG compliance and assistive technology support',
    'xapi-tracking': 'xAPI statement coverage and learning analytics',
    'content-quality': 'Spelling, grammar, and readability analysis',
    'media-optimization': 'File sizes, formats, and optimization opportunities',
    compliance: 'SCORM, cmi5, and LMS compatibility',
  };
  return descriptions[category];
}

export function getSeverityWeight(severity: AuditSeverity): number {
  const weights: Record<AuditSeverity, number> = {
    critical: 10,
    major: 5,
    minor: 2,
    info: 0,
  };
  return weights[severity];
}

export function calculateOverallScore(issues: AuditIssue[]): number {
  if (issues.length === 0) return 100;

  const totalWeight = issues.reduce((sum, issue) => sum + getSeverityWeight(issue.severity), 0);

  // Max deduction is 100, but we scale it
  const deduction = Math.min(totalWeight, 100);
  return Math.max(0, 100 - deduction);
}

export function getStatusFromScore(score: number): AuditStatus {
  if (score >= 90) return 'passed';
  if (score >= 70) return 'warning';
  return 'failed';
}
