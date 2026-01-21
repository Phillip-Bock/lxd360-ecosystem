'use client';

import { z } from 'zod';

// =============================================================================
// INSPIRE Studio xAPI Types
// =============================================================================
// Types and schemas for tracking content authoring activities in INSPIRE Studio.
// =============================================================================

/**
 * Studio-specific xAPI extension IRIs
 * Namespace: https://inspire.lxd360.com/xapi/extensions/studio/
 */
export const STUDIO_EXTENSIONS = {
  // -------------------------------------------------------------------------
  // Authoring Context
  // -------------------------------------------------------------------------

  /** Current INSPIRE phase: encoding, synthesization, assimilation, audit */
  PHASE: 'https://inspire.lxd360.com/xapi/extensions/studio/phase',

  /** Step within the phase (e.g., "1.1", "2.3") */
  STEP: 'https://inspire.lxd360.com/xapi/extensions/studio/step',

  /** Block type being edited */
  BLOCK_TYPE: 'https://inspire.lxd360.com/xapi/extensions/studio/block-type',

  /** Block ID within the canvas */
  BLOCK_ID: 'https://inspire.lxd360.com/xapi/extensions/studio/block-id',

  // -------------------------------------------------------------------------
  // Content Quality Metrics
  // -------------------------------------------------------------------------

  /** Current cognitive load meter value (0-100) */
  COGNITIVE_LOAD_METER: 'https://inspire.lxd360.com/xapi/extensions/studio/cognitive-load-meter',

  /** Estimated duration in minutes */
  ESTIMATED_DURATION: 'https://inspire.lxd360.com/xapi/extensions/studio/estimated-duration',

  /** Block count on canvas */
  BLOCK_COUNT: 'https://inspire.lxd360.com/xapi/extensions/studio/block-count',

  /** WCAG compliance level achieved */
  A11Y_COMPLIANCE: 'https://inspire.lxd360.com/xapi/extensions/studio/a11y-compliance',

  // -------------------------------------------------------------------------
  // AI Assistance
  // -------------------------------------------------------------------------

  /** AI-generated content used */
  AI_GENERATED: 'https://inspire.lxd360.com/xapi/extensions/studio/ai-generated',

  /** AI suggestion accepted/rejected */
  AI_SUGGESTION_OUTCOME: 'https://inspire.lxd360.com/xapi/extensions/studio/ai-suggestion-outcome',

  /** Designer agent version */
  DESIGNER_AGENT_VERSION:
    'https://inspire.lxd360.com/xapi/extensions/studio/designer-agent-version',

  // -------------------------------------------------------------------------
  // Export & Publishing
  // -------------------------------------------------------------------------

  /** Export format (SCORM, xAPI, HTML5) */
  EXPORT_FORMAT: 'https://inspire.lxd360.com/xapi/extensions/studio/export-format',

  /** LMS target platform */
  TARGET_LMS: 'https://inspire.lxd360.com/xapi/extensions/studio/target-lms',

  /** Package version */
  PACKAGE_VERSION: 'https://inspire.lxd360.com/xapi/extensions/studio/package-version',
} as const;

export type StudioExtensionKey = keyof typeof STUDIO_EXTENSIONS;
export type StudioExtensionIRI = (typeof STUDIO_EXTENSIONS)[StudioExtensionKey];

// =============================================================================
// Zod Schemas
// =============================================================================

export const InspirePhaseSchema = z.enum(['encoding', 'synthesization', 'assimilation', 'audit']);
export type InspirePhase = z.infer<typeof InspirePhaseSchema>;

export const AuthoringVerbSchema = z.enum([
  'created',
  'edited',
  'deleted',
  'duplicated',
  'moved',
  'resized',
  'published',
  'exported',
  'previewed',
  'validated',
  'configured',
  'imported',
  'generated', // AI-generated content
  'approved',
  'rejected',
  'commented',
  'shared',
]);
export type AuthoringVerb = z.infer<typeof AuthoringVerbSchema>;

export const AISuggestionOutcomeSchema = z.enum(['accepted', 'rejected', 'modified', 'ignored']);
export type AISuggestionOutcome = z.infer<typeof AISuggestionOutcomeSchema>;

export const ExportFormatSchema = z.enum([
  'scorm-1.2',
  'scorm-2004',
  'xapi',
  'cmi5',
  'html5',
  'pdf',
  'inspire-package',
]);
export type ExportFormat = z.infer<typeof ExportFormatSchema>;

export const A11yComplianceSchema = z.enum([
  'none',
  'wcag-a',
  'wcag-aa',
  'wcag-aaa',
  'section-508',
]);
export type A11yCompliance = z.infer<typeof A11yComplianceSchema>;

// =============================================================================
// Studio Activity Types
// =============================================================================

export const STUDIO_ACTIVITY_TYPES = {
  /** The INSPIRE Studio application itself */
  STUDIO: 'https://inspire.lxd360.com/xapi/activities/studio',

  /** A mission/project in the studio */
  MISSION: 'https://inspire.lxd360.com/xapi/activities/mission',

  /** A phase within the INSPIRE methodology */
  PHASE: 'https://inspire.lxd360.com/xapi/activities/phase',

  /** A step within a phase */
  STEP: 'https://inspire.lxd360.com/xapi/activities/step',

  /** The course canvas */
  CANVAS: 'https://inspire.lxd360.com/xapi/activities/canvas',

  /** A content block on the canvas */
  BLOCK: 'https://inspire.lxd360.com/xapi/activities/block',

  /** AI-generated content */
  AI_CONTENT: 'https://inspire.lxd360.com/xapi/activities/ai-content',

  /** Exported package */
  EXPORT_PACKAGE: 'https://inspire.lxd360.com/xapi/activities/export-package',

  /** QA audit report */
  AUDIT_REPORT: 'https://inspire.lxd360.com/xapi/activities/audit-report',
} as const;

export type StudioActivityType = (typeof STUDIO_ACTIVITY_TYPES)[keyof typeof STUDIO_ACTIVITY_TYPES];

// =============================================================================
// Studio Verbs
// =============================================================================

export const STUDIO_VERBS = {
  // Content Creation
  CREATED: {
    id: 'http://activitystrea.ms/schema/1.0/create',
    display: { 'en-US': 'created' },
  },
  EDITED: {
    id: 'http://activitystrea.ms/schema/1.0/update',
    display: { 'en-US': 'edited' },
  },
  DELETED: {
    id: 'http://activitystrea.ms/schema/1.0/delete',
    display: { 'en-US': 'deleted' },
  },
  DUPLICATED: {
    id: 'https://inspire.lxd360.com/xapi/verbs/duplicated',
    display: { 'en-US': 'duplicated' },
  },

  // Canvas Operations
  MOVED: {
    id: 'https://inspire.lxd360.com/xapi/verbs/moved',
    display: { 'en-US': 'moved' },
  },
  RESIZED: {
    id: 'https://inspire.lxd360.com/xapi/verbs/resized',
    display: { 'en-US': 'resized' },
  },

  // Publishing
  PUBLISHED: {
    id: 'http://activitystrea.ms/schema/1.0/publish',
    display: { 'en-US': 'published' },
  },
  EXPORTED: {
    id: 'https://inspire.lxd360.com/xapi/verbs/exported',
    display: { 'en-US': 'exported' },
  },

  // Preview & Validation
  PREVIEWED: {
    id: 'https://inspire.lxd360.com/xapi/verbs/previewed',
    display: { 'en-US': 'previewed' },
  },
  VALIDATED: {
    id: 'https://inspire.lxd360.com/xapi/verbs/validated',
    display: { 'en-US': 'validated' },
  },

  // Configuration
  CONFIGURED: {
    id: 'https://inspire.lxd360.com/xapi/verbs/configured',
    display: { 'en-US': 'configured' },
  },

  // AI Interactions
  GENERATED: {
    id: 'https://inspire.lxd360.com/xapi/verbs/generated',
    display: { 'en-US': 'generated' },
  },
  APPROVED: {
    id: 'http://activitystrea.ms/schema/1.0/approve',
    display: { 'en-US': 'approved' },
  },
  REJECTED: {
    id: 'http://activitystrea.ms/schema/1.0/reject',
    display: { 'en-US': 'rejected' },
  },

  // Collaboration
  COMMENTED: {
    id: 'http://adlnet.gov/expapi/verbs/commented',
    display: { 'en-US': 'commented' },
  },
  SHARED: {
    id: 'http://activitystrea.ms/schema/1.0/share',
    display: { 'en-US': 'shared' },
  },

  // Import
  IMPORTED: {
    id: 'http://activitystrea.ms/schema/1.0/import',
    display: { 'en-US': 'imported' },
  },
} as const;

// =============================================================================
// Statement Options Types
// =============================================================================

export interface StudioStatementOptions {
  /** Mission ID */
  missionId: string;

  /** Current phase */
  phase?: InspirePhase;

  /** Current step (e.g., "1.1", "2.3") */
  step?: string;

  /** Block type (for block-related actions) */
  blockType?: string;

  /** Block ID (for block-related actions) */
  blockId?: string;

  /** Cognitive load meter value (0-100) */
  cognitiveLoadMeter?: number;

  /** Estimated duration in minutes */
  estimatedDuration?: number;

  /** Block count on canvas */
  blockCount?: number;

  /** AI-related metadata */
  ai?: {
    generated?: boolean;
    suggestionOutcome?: AISuggestionOutcome;
    agentVersion?: string;
  };

  /** Export-related metadata */
  export?: {
    format?: ExportFormat;
    targetLms?: string;
    packageVersion?: string;
  };

  /** Accessibility compliance level */
  a11yCompliance?: A11yCompliance;

  /** Additional context extensions */
  additionalExtensions?: Record<string, unknown>;
}

export interface BlockActionOptions {
  blockId: string;
  blockType: string;
  missionId: string;
  phase?: InspirePhase;

  /** Previous position (for move) */
  previousPosition?: { x: number; y: number };

  /** New position */
  newPosition?: { x: number; y: number };

  /** Previous size (for resize) */
  previousSize?: { width: number; height: number };

  /** New size */
  newSize?: { width: number; height: number };

  /** Content changes */
  contentChanges?: Record<string, unknown>;

  /** Config changes */
  configChanges?: Record<string, unknown>;
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Build studio context extensions
 */
export function buildStudioContextExtensions(
  options: StudioStatementOptions,
): Record<string, unknown> {
  const extensions: Record<string, unknown> = {};

  if (options.phase) {
    extensions[STUDIO_EXTENSIONS.PHASE] = options.phase;
  }
  if (options.step) {
    extensions[STUDIO_EXTENSIONS.STEP] = options.step;
  }
  if (options.blockType) {
    extensions[STUDIO_EXTENSIONS.BLOCK_TYPE] = options.blockType;
  }
  if (options.blockId) {
    extensions[STUDIO_EXTENSIONS.BLOCK_ID] = options.blockId;
  }
  if (options.cognitiveLoadMeter !== undefined) {
    extensions[STUDIO_EXTENSIONS.COGNITIVE_LOAD_METER] = options.cognitiveLoadMeter;
  }
  if (options.estimatedDuration !== undefined) {
    extensions[STUDIO_EXTENSIONS.ESTIMATED_DURATION] = options.estimatedDuration;
  }
  if (options.blockCount !== undefined) {
    extensions[STUDIO_EXTENSIONS.BLOCK_COUNT] = options.blockCount;
  }
  if (options.a11yCompliance) {
    extensions[STUDIO_EXTENSIONS.A11Y_COMPLIANCE] = options.a11yCompliance;
  }

  // AI extensions
  if (options.ai?.generated !== undefined) {
    extensions[STUDIO_EXTENSIONS.AI_GENERATED] = options.ai.generated;
  }
  if (options.ai?.suggestionOutcome) {
    extensions[STUDIO_EXTENSIONS.AI_SUGGESTION_OUTCOME] = options.ai.suggestionOutcome;
  }
  if (options.ai?.agentVersion) {
    extensions[STUDIO_EXTENSIONS.DESIGNER_AGENT_VERSION] = options.ai.agentVersion;
  }

  // Export extensions
  if (options.export?.format) {
    extensions[STUDIO_EXTENSIONS.EXPORT_FORMAT] = options.export.format;
  }
  if (options.export?.targetLms) {
    extensions[STUDIO_EXTENSIONS.TARGET_LMS] = options.export.targetLms;
  }
  if (options.export?.packageVersion) {
    extensions[STUDIO_EXTENSIONS.PACKAGE_VERSION] = options.export.packageVersion;
  }

  // Merge additional extensions
  if (options.additionalExtensions) {
    Object.assign(extensions, options.additionalExtensions);
  }

  return extensions;
}

/**
 * Get the appropriate verb for an authoring action
 */
export function getStudioVerb(action: AuthoringVerb) {
  switch (action) {
    case 'created':
      return STUDIO_VERBS.CREATED;
    case 'edited':
      return STUDIO_VERBS.EDITED;
    case 'deleted':
      return STUDIO_VERBS.DELETED;
    case 'duplicated':
      return STUDIO_VERBS.DUPLICATED;
    case 'moved':
      return STUDIO_VERBS.MOVED;
    case 'resized':
      return STUDIO_VERBS.RESIZED;
    case 'published':
      return STUDIO_VERBS.PUBLISHED;
    case 'exported':
      return STUDIO_VERBS.EXPORTED;
    case 'previewed':
      return STUDIO_VERBS.PREVIEWED;
    case 'validated':
      return STUDIO_VERBS.VALIDATED;
    case 'configured':
      return STUDIO_VERBS.CONFIGURED;
    case 'imported':
      return STUDIO_VERBS.IMPORTED;
    case 'generated':
      return STUDIO_VERBS.GENERATED;
    case 'approved':
      return STUDIO_VERBS.APPROVED;
    case 'rejected':
      return STUDIO_VERBS.REJECTED;
    case 'commented':
      return STUDIO_VERBS.COMMENTED;
    case 'shared':
      return STUDIO_VERBS.SHARED;
    default:
      return STUDIO_VERBS.EDITED;
  }
}
