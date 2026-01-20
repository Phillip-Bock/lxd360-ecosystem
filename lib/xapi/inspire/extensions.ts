// =============================================================================
// INSPIRE Cognitive Extensions for xAPI
// =============================================================================
// These extensions capture behavioral telemetry for adaptive learning,
// EU AI Act compliance, and Glass Box AI explanations.
// =============================================================================

import { z } from 'zod';

/**
 * INSPIRE-specific xAPI extension IRIs
 * Namespace: https://inspire.lxd360.com/xapi/extensions/
 */
export const INSPIRE_EXTENSIONS = {
  // -------------------------------------------------------------------------
  // Behavioral Telemetry (Cognitive Signature)
  // -------------------------------------------------------------------------
  
  /** Response latency in milliseconds - hesitation indicator */
  LATENCY: 'https://inspire.lxd360.com/xapi/extensions/latency',
  
  /** Engagement depth: 1=skim, 2=read, 3=study, 4=deep-dive */
  DEPTH: 'https://inspire.lxd360.com/xapi/extensions/depth',
  
  /** Content modality: video, audio, text, interactive, simulation */
  MODALITY: 'https://inspire.lxd360.com/xapi/extensions/modality',
  
  /** Accessibility features used during interaction */
  A11Y: 'https://inspire.lxd360.com/xapi/extensions/a11y',
  
  /** Time to first action after content load (reading time proxy) */
  TIME_TO_FIRST_ACTION: 'https://inspire.lxd360.com/xapi/extensions/time-to-first-action',
  
  /** Number of answer revisions before submission */
  REVISION_COUNT: 'https://inspire.lxd360.com/xapi/extensions/revision-count',
  
  /** Distractors touched before final selection (MCQ) */
  DISTRACTORS_TOUCHED: 'https://inspire.lxd360.com/xapi/extensions/distractors-touched',
  
  /** Rage click detection count */
  RAGE_CLICKS: 'https://inspire.lxd360.com/xapi/extensions/rage-clicks',
  
  /** Self-reported confidence rating 0-1 */
  CONFIDENCE_RATING: 'https://inspire.lxd360.com/xapi/extensions/confidence-rating',

  // -------------------------------------------------------------------------
  // Skill & Mastery Tracking
  // -------------------------------------------------------------------------
  
  /** Skill identifier from skill taxonomy */
  SKILL_ID: 'https://inspire.lxd360.com/xapi/extensions/skill-id',
  
  /** Current mastery estimate from BKT (0-1) */
  MASTERY_ESTIMATE: 'https://inspire.lxd360.com/xapi/extensions/mastery-estimate',
  
  /** Mastery level: novice, developing, proficient, mastered */
  MASTERY_LEVEL: 'https://inspire.lxd360.com/xapi/extensions/mastery-level',
  
  /** Prerequisites for this skill */
  PREREQUISITE_SKILLS: 'https://inspire.lxd360.com/xapi/extensions/prerequisite-skills',

  // -------------------------------------------------------------------------
  // Cognitive Load (ICL Framework)
  // -------------------------------------------------------------------------
  
  /** Intrinsic cognitive load estimate (1-10) */
  COGNITIVE_LOAD_INTRINSIC: 'https://inspire.lxd360.com/xapi/extensions/cognitive-load/intrinsic',
  
  /** Extraneous cognitive load estimate (1-10) */
  COGNITIVE_LOAD_EXTRANEOUS: 'https://inspire.lxd360.com/xapi/extensions/cognitive-load/extraneous',
  
  /** Germane cognitive load estimate (1-10) */
  COGNITIVE_LOAD_GERMANE: 'https://inspire.lxd360.com/xapi/extensions/cognitive-load/germane',
  
  /** Total cognitive load (weighted sum) */
  COGNITIVE_LOAD_TOTAL: 'https://inspire.lxd360.com/xapi/extensions/cognitive-load/total',

  // -------------------------------------------------------------------------
  // AI/ML Decisions (EU AI Act Compliance)
  // -------------------------------------------------------------------------
  
  /** Was this content AI-recommended? */
  AI_RECOMMENDED: 'https://inspire.lxd360.com/xapi/extensions/ai/recommended',
  
  /** AI model version that made the recommendation */
  AI_MODEL_VERSION: 'https://inspire.lxd360.com/xapi/extensions/ai/model-version',
  
  /** Confidence score of AI recommendation (0-1) */
  AI_CONFIDENCE: 'https://inspire.lxd360.com/xapi/extensions/ai/confidence',
  
  /** Glass Box explanation ID for this decision */
  AI_EXPLANATION_ID: 'https://inspire.lxd360.com/xapi/extensions/ai/explanation-id',
  
  /** Did learner override AI recommendation? */
  LEARNER_OVERRIDE: 'https://inspire.lxd360.com/xapi/extensions/learner-override',
  
  /** Learner's reason for override (if provided) */
  OVERRIDE_REASON: 'https://inspire.lxd360.com/xapi/extensions/override-reason',

  // -------------------------------------------------------------------------
  // Cross-Tenant Learning (Data Governance)
  // -------------------------------------------------------------------------
  
  /** Consent tier: 0=isolated, 1=receive, 2=contribute, 3=industry */
  CONSENT_TIER: 'https://inspire.lxd360.com/xapi/extensions/consent-tier',
  
  /** Data residency region (EU AI Act) */
  DATA_RESIDENCY: 'https://inspire.lxd360.com/xapi/extensions/data-residency',
  
  /** Is this data eligible for cross-tenant learning? */
  CROSS_TENANT_ELIGIBLE: 'https://inspire.lxd360.com/xapi/extensions/cross-tenant-eligible',

  // -------------------------------------------------------------------------
  // Spaced Repetition (SM-2)
  // -------------------------------------------------------------------------
  
  /** SM-2 easiness factor */
  SR_EASINESS_FACTOR: 'https://inspire.lxd360.com/xapi/extensions/sr/easiness-factor',
  
  /** Current interval in days */
  SR_INTERVAL_DAYS: 'https://inspire.lxd360.com/xapi/extensions/sr/interval-days',
  
  /** Repetition count */
  SR_REPETITIONS: 'https://inspire.lxd360.com/xapi/extensions/sr/repetitions',
  
  /** Next review due date (ISO 8601) */
  SR_NEXT_REVIEW: 'https://inspire.lxd360.com/xapi/extensions/sr/next-review',

  // -------------------------------------------------------------------------
  // Session Context
  // -------------------------------------------------------------------------
  
  /** Learning session ID */
  SESSION_ID: 'https://inspire.lxd360.com/xapi/extensions/session-id',
  
  /** Device type: desktop, tablet, mobile, vr */
  DEVICE_TYPE: 'https://inspire.lxd360.com/xapi/extensions/device-type',
  
  /** Browser/app viewport dimensions */
  VIEWPORT: 'https://inspire.lxd360.com/xapi/extensions/viewport',
  
  /** Network quality: offline, slow-2g, 2g, 3g, 4g, 5g */
  NETWORK_QUALITY: 'https://inspire.lxd360.com/xapi/extensions/network-quality',
} as const;

export type InspireExtensionKey = keyof typeof INSPIRE_EXTENSIONS;
export type InspireExtensionIRI = (typeof INSPIRE_EXTENSIONS)[InspireExtensionKey];

// =============================================================================
// Zod Schemas for Extension Values
// =============================================================================

export const ModalitySchema = z.enum([
  'video',
  'audio',
  'text',
  'interactive',
  'simulation',
  'image',
  'document',
  'mixed',
]);
export type Modality = z.infer<typeof ModalitySchema>;

export const MasteryLevelSchema = z.enum([
  'novice',
  'developing',
  'proficient',
  'mastered',
]);
export type MasteryLevel = z.infer<typeof MasteryLevelSchema>;

export const ConsentTierSchema = z.union([
  z.literal(0), // Isolated - no sharing
  z.literal(1), // Receive - can receive cross-tenant insights
  z.literal(2), // Contribute - can contribute anonymized data
  z.literal(3), // Industry - full industry benchmark participation
]);
export type ConsentTier = z.infer<typeof ConsentTierSchema>;

export const DepthLevelSchema = z.union([
  z.literal(1), // Skim
  z.literal(2), // Read
  z.literal(3), // Study
  z.literal(4), // Deep-dive
]);
export type DepthLevel = z.infer<typeof DepthLevelSchema>;

export const DeviceTypeSchema = z.enum([
  'desktop',
  'tablet',
  'mobile',
  'vr',
  'unknown',
]);
export type DeviceType = z.infer<typeof DeviceTypeSchema>;

export const NetworkQualitySchema = z.enum([
  'offline',
  'slow-2g',
  '2g',
  '3g',
  '4g',
  '5g',
]);
export type NetworkQuality = z.infer<typeof NetworkQualitySchema>;

export const A11yFeaturesSchema = z.object({
  screenReader: z.boolean().optional(),
  highContrast: z.boolean().optional(),
  reducedMotion: z.boolean().optional(),
  largeText: z.boolean().optional(),
  captions: z.boolean().optional(),
  audioDescriptions: z.boolean().optional(),
  keyboardOnly: z.boolean().optional(),
});
export type A11yFeatures = z.infer<typeof A11yFeaturesSchema>;

export const ViewportSchema = z.object({
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  orientation: z.enum(['portrait', 'landscape']).optional(),
});
export type Viewport = z.infer<typeof ViewportSchema>;

// =============================================================================
// Complete INSPIRE Extensions Schema
// =============================================================================

export const InspireExtensionsSchema = z.object({
  // Behavioral Telemetry
  [INSPIRE_EXTENSIONS.LATENCY]: z.number().int().nonnegative().optional(),
  [INSPIRE_EXTENSIONS.DEPTH]: DepthLevelSchema.optional(),
  [INSPIRE_EXTENSIONS.MODALITY]: ModalitySchema.optional(),
  [INSPIRE_EXTENSIONS.A11Y]: A11yFeaturesSchema.optional(),
  [INSPIRE_EXTENSIONS.TIME_TO_FIRST_ACTION]: z.number().int().nonnegative().optional(),
  [INSPIRE_EXTENSIONS.REVISION_COUNT]: z.number().int().nonnegative().optional(),
  [INSPIRE_EXTENSIONS.DISTRACTORS_TOUCHED]: z.array(z.string()).optional(),
  [INSPIRE_EXTENSIONS.RAGE_CLICKS]: z.number().int().nonnegative().optional(),
  [INSPIRE_EXTENSIONS.CONFIDENCE_RATING]: z.number().min(0).max(1).optional(),

  // Skill & Mastery
  [INSPIRE_EXTENSIONS.SKILL_ID]: z.string().optional(),
  [INSPIRE_EXTENSIONS.MASTERY_ESTIMATE]: z.number().min(0).max(1).optional(),
  [INSPIRE_EXTENSIONS.MASTERY_LEVEL]: MasteryLevelSchema.optional(),
  [INSPIRE_EXTENSIONS.PREREQUISITE_SKILLS]: z.array(z.string()).optional(),

  // Cognitive Load
  [INSPIRE_EXTENSIONS.COGNITIVE_LOAD_INTRINSIC]: z.number().min(1).max(10).optional(),
  [INSPIRE_EXTENSIONS.COGNITIVE_LOAD_EXTRANEOUS]: z.number().min(1).max(10).optional(),
  [INSPIRE_EXTENSIONS.COGNITIVE_LOAD_GERMANE]: z.number().min(1).max(10).optional(),
  [INSPIRE_EXTENSIONS.COGNITIVE_LOAD_TOTAL]: z.number().min(1).max(10).optional(),

  // AI/ML (EU AI Act)
  [INSPIRE_EXTENSIONS.AI_RECOMMENDED]: z.boolean().optional(),
  [INSPIRE_EXTENSIONS.AI_MODEL_VERSION]: z.string().optional(),
  [INSPIRE_EXTENSIONS.AI_CONFIDENCE]: z.number().min(0).max(1).optional(),
  [INSPIRE_EXTENSIONS.AI_EXPLANATION_ID]: z.string().uuid().optional(),
  [INSPIRE_EXTENSIONS.LEARNER_OVERRIDE]: z.boolean().optional(),
  [INSPIRE_EXTENSIONS.OVERRIDE_REASON]: z.string().optional(),

  // Cross-Tenant
  [INSPIRE_EXTENSIONS.CONSENT_TIER]: ConsentTierSchema.optional(),
  [INSPIRE_EXTENSIONS.DATA_RESIDENCY]: z.string().optional(),
  [INSPIRE_EXTENSIONS.CROSS_TENANT_ELIGIBLE]: z.boolean().optional(),

  // Spaced Repetition
  [INSPIRE_EXTENSIONS.SR_EASINESS_FACTOR]: z.number().min(1.3).optional(),
  [INSPIRE_EXTENSIONS.SR_INTERVAL_DAYS]: z.number().int().positive().optional(),
  [INSPIRE_EXTENSIONS.SR_REPETITIONS]: z.number().int().nonnegative().optional(),
  [INSPIRE_EXTENSIONS.SR_NEXT_REVIEW]: z.string().datetime().optional(),

  // Session
  [INSPIRE_EXTENSIONS.SESSION_ID]: z.string().optional(),
  [INSPIRE_EXTENSIONS.DEVICE_TYPE]: DeviceTypeSchema.optional(),
  [INSPIRE_EXTENSIONS.VIEWPORT]: ViewportSchema.optional(),
  [INSPIRE_EXTENSIONS.NETWORK_QUALITY]: NetworkQualitySchema.optional(),
}).passthrough(); // Allow additional standard xAPI extensions

export type InspireExtensions = z.infer<typeof InspireExtensionsSchema>;

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Extract INSPIRE extensions from a generic extensions object
 */
export function extractInspireExtensions(
  extensions: Record<string, unknown> | undefined
): Partial<InspireExtensions> {
  if (!extensions) return {};

  const result: Partial<InspireExtensions> = {};

  for (const [key, value] of Object.entries(extensions)) {
    if (Object.values(INSPIRE_EXTENSIONS).includes(key as InspireExtensionIRI)) {
      result[key as keyof InspireExtensions] = value as never;
    }
  }

  return result;
}

/**
 * Validate and parse INSPIRE extensions
 */
export function parseInspireExtensions(
  extensions: Record<string, unknown> | undefined
): { success: true; data: Partial<InspireExtensions> } | { success: false; errors: z.ZodError } {
  if (!extensions) {
    return { success: true, data: {} };
  }

  const result = InspireExtensionsSchema.partial().safeParse(extensions);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  return { success: false, errors: result.error };
}

/**
 * Create a context extensions object with INSPIRE data
 */
export function createInspireContextExtensions(data: {
  sessionId?: string;
  deviceType?: DeviceType;
  viewport?: Viewport;
  networkQuality?: NetworkQuality;
  consentTier?: ConsentTier;
  dataResidency?: string;
}): Record<string, unknown> {
  const extensions: Record<string, unknown> = {};

  if (data.sessionId) extensions[INSPIRE_EXTENSIONS.SESSION_ID] = data.sessionId;
  if (data.deviceType) extensions[INSPIRE_EXTENSIONS.DEVICE_TYPE] = data.deviceType;
  if (data.viewport) extensions[INSPIRE_EXTENSIONS.VIEWPORT] = data.viewport;
  if (data.networkQuality) extensions[INSPIRE_EXTENSIONS.NETWORK_QUALITY] = data.networkQuality;
  if (data.consentTier !== undefined) extensions[INSPIRE_EXTENSIONS.CONSENT_TIER] = data.consentTier;
  if (data.dataResidency) extensions[INSPIRE_EXTENSIONS.DATA_RESIDENCY] = data.dataResidency;

  return extensions;
}

/**
 * Create result extensions with behavioral telemetry
 */
export function createInspireBehavioralExtensions(data: {
  latency?: number;
  depth?: DepthLevel;
  modality?: Modality;
  a11y?: A11yFeatures;
  timeToFirstAction?: number;
  revisionCount?: number;
  distractorsTouched?: string[];
  rageClicks?: number;
  confidenceRating?: number;
}): Record<string, unknown> {
  const extensions: Record<string, unknown> = {};

  if (data.latency !== undefined) extensions[INSPIRE_EXTENSIONS.LATENCY] = data.latency;
  if (data.depth !== undefined) extensions[INSPIRE_EXTENSIONS.DEPTH] = data.depth;
  if (data.modality) extensions[INSPIRE_EXTENSIONS.MODALITY] = data.modality;
  if (data.a11y) extensions[INSPIRE_EXTENSIONS.A11Y] = data.a11y;
  if (data.timeToFirstAction !== undefined) extensions[INSPIRE_EXTENSIONS.TIME_TO_FIRST_ACTION] = data.timeToFirstAction;
  if (data.revisionCount !== undefined) extensions[INSPIRE_EXTENSIONS.REVISION_COUNT] = data.revisionCount;
  if (data.distractorsTouched) extensions[INSPIRE_EXTENSIONS.DISTRACTORS_TOUCHED] = data.distractorsTouched;
  if (data.rageClicks !== undefined) extensions[INSPIRE_EXTENSIONS.RAGE_CLICKS] = data.rageClicks;
  if (data.confidenceRating !== undefined) extensions[INSPIRE_EXTENSIONS.CONFIDENCE_RATING] = data.confidenceRating;

  return extensions;
}

/**
 * Create AI decision extensions for EU AI Act compliance
 */
export function createInspireAIExtensions(data: {
  recommended?: boolean;
  modelVersion?: string;
  confidence?: number;
  explanationId?: string;
  learnerOverride?: boolean;
  overrideReason?: string;
}): Record<string, unknown> {
  const extensions: Record<string, unknown> = {};

  if (data.recommended !== undefined) extensions[INSPIRE_EXTENSIONS.AI_RECOMMENDED] = data.recommended;
  if (data.modelVersion) extensions[INSPIRE_EXTENSIONS.AI_MODEL_VERSION] = data.modelVersion;
  if (data.confidence !== undefined) extensions[INSPIRE_EXTENSIONS.AI_CONFIDENCE] = data.confidence;
  if (data.explanationId) extensions[INSPIRE_EXTENSIONS.AI_EXPLANATION_ID] = data.explanationId;
  if (data.learnerOverride !== undefined) extensions[INSPIRE_EXTENSIONS.LEARNER_OVERRIDE] = data.learnerOverride;
  if (data.overrideReason) extensions[INSPIRE_EXTENSIONS.OVERRIDE_REASON] = data.overrideReason;

  return extensions;
}

/**
 * Create skill tracking extensions
 */
export function createInspireSkillExtensions(data: {
  skillId?: string;
  masteryEstimate?: number;
  masteryLevel?: MasteryLevel;
  prerequisiteSkills?: string[];
  cognitiveLoad?: {
    intrinsic?: number;
    extraneous?: number;
    germane?: number;
    total?: number;
  };
}): Record<string, unknown> {
  const extensions: Record<string, unknown> = {};

  if (data.skillId) extensions[INSPIRE_EXTENSIONS.SKILL_ID] = data.skillId;
  if (data.masteryEstimate !== undefined) extensions[INSPIRE_EXTENSIONS.MASTERY_ESTIMATE] = data.masteryEstimate;
  if (data.masteryLevel) extensions[INSPIRE_EXTENSIONS.MASTERY_LEVEL] = data.masteryLevel;
  if (data.prerequisiteSkills) extensions[INSPIRE_EXTENSIONS.PREREQUISITE_SKILLS] = data.prerequisiteSkills;

  if (data.cognitiveLoad) {
    if (data.cognitiveLoad.intrinsic !== undefined) {
      extensions[INSPIRE_EXTENSIONS.COGNITIVE_LOAD_INTRINSIC] = data.cognitiveLoad.intrinsic;
    }
    if (data.cognitiveLoad.extraneous !== undefined) {
      extensions[INSPIRE_EXTENSIONS.COGNITIVE_LOAD_EXTRANEOUS] = data.cognitiveLoad.extraneous;
    }
    if (data.cognitiveLoad.germane !== undefined) {
      extensions[INSPIRE_EXTENSIONS.COGNITIVE_LOAD_GERMANE] = data.cognitiveLoad.germane;
    }
    if (data.cognitiveLoad.total !== undefined) {
      extensions[INSPIRE_EXTENSIONS.COGNITIVE_LOAD_TOTAL] = data.cognitiveLoad.total;
    }
  }

  return extensions;
}
