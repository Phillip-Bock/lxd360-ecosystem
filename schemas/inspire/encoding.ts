/**
 * INSPIRE Encoding Phase Schemas
 *
 * Schemas for the Encoding phase (Phase 1) of the INSPIRE methodology:
 * - Industry Analysis
 * - Learner Persona
 * - ITLA (Activation Strategy)
 * - ILMI (Modality Integrator)
 * - ICES (Engagement Spectrum)
 *
 * @module schemas/inspire/encoding
 */

import { z } from 'zod';

// ============================================================================
// INDUSTRY ANALYSIS (Step 1.1)
// ============================================================================

export const PerformanceGapSchema = z.object({
  /** Unique identifier */
  id: z.string().uuid(),
  /** Gap description */
  description: z.string().min(1),
  /** Root cause analysis */
  rootCause: z.string().optional(),
  /** Business impact */
  businessImpact: z.enum(['critical', 'high', 'medium', 'low']).default('medium'),
  /** Success metrics to track */
  successMetrics: z.array(z.string()).default([]),
  /** Data source */
  source: z.enum(['manual', 'csv_upload', 'ai_suggested']).default('manual'),
});
export type PerformanceGap = z.infer<typeof PerformanceGapSchema>;

export const IndustryAnalysisSchema = z.object({
  /** Selected industry */
  industry: z.string().min(1),
  /** Industry sub-sector (optional) */
  subSector: z.string().optional(),
  /** Target topic/subject */
  topic: z.string().min(1),
  /** Identified performance gaps */
  performanceGaps: z.array(PerformanceGapSchema).default([]),
  /** Regulatory requirements */
  regulatoryRequirements: z.array(z.string()).default([]),
  /** Business drivers */
  businessDrivers: z.array(z.string()).default([]),
  /** AI research injection used */
  aiResearchUsed: z.boolean().default(false),
  /** Completion timestamp */
  completedAt: z.string().datetime().optional(),
});
export type IndustryAnalysis = z.infer<typeof IndustryAnalysisSchema>;

// ============================================================================
// LEARNER PERSONA (Step 1.2)
// ============================================================================

export const LearnerArchetypeSchema = z.enum([
  'entry-level',
  'individual-contributor',
  'manager',
  'director',
  'executive',
  'specialist',
  'contractor',
  'other',
]);
export type LearnerArchetype = z.infer<typeof LearnerArchetypeSchema>;

export const DigitalFluencySchema = z.enum(['low', 'medium', 'high']);
export type DigitalFluency = z.infer<typeof DigitalFluencySchema>;

export const PriorKnowledgeLevelSchema = z.enum([
  'none',
  'awareness',
  'basic',
  'intermediate',
  'advanced',
  'expert',
]);
export type PriorKnowledgeLevel = z.infer<typeof PriorKnowledgeLevelSchema>;

export const LearnerPersonaSchema = z.object({
  /** Unique identifier */
  id: z.string().uuid(),
  /** Persona name */
  name: z.string().min(1),
  /** Archetype category */
  archetype: LearnerArchetypeSchema,
  /** Role/job title */
  jobTitle: z.string().optional(),
  /** Years of experience */
  yearsExperience: z.number().min(0).max(50).optional(),
  /** Prior knowledge level */
  priorKnowledge: PriorKnowledgeLevelSchema.default('basic'),
  /** Digital fluency */
  digitalFluency: DigitalFluencySchema.default('medium'),
  /** Motivation: Internal drive (1-10) */
  internalMotivation: z.number().min(1).max(10).default(5),
  /** Motivation: External drive (1-10) */
  externalMotivation: z.number().min(1).max(10).default(5),
  /** Learning goals */
  learningGoals: z.array(z.string()).default([]),
  /** Pain points/challenges */
  painPoints: z.array(z.string()).default([]),
  /** Accessibility needs */
  accessibilityNeeds: z.array(z.string()).default([]),
  /** Time constraints (hours per week) */
  availableTimePerWeek: z.number().min(0).optional(),
  /** Preferred learning times */
  preferredLearningTimes: z.array(z.string()).default([]),
  /** Geographic location */
  location: z.string().optional(),
  /** Primary language */
  primaryLanguage: z.string().default('en'),
  /** Source of persona */
  source: z.enum(['manual', 'library', 'ai_generated']).default('manual'),
});
export type LearnerPersona = z.infer<typeof LearnerPersonaSchema>;

// ============================================================================
// ITLA - ACTIVATION STRATEGY (Step 1.3)
// ============================================================================

export const NeuroPrincipleSchema = z.enum([
  'spaced-repetition',
  'retrieval-practice',
  'emotional-arousal',
  'multisensory-integration',
  'novelty-curiosity',
  'cognitive-load-management',
  'social-learning',
  'feedback-error-correction',
  'metacognition-reflection',
  'contextual-situated',
  'motivation-reward',
  'attention-management',
  'sleep-rest-integration',
]);
export type NeuroPrinciple = z.infer<typeof NeuroPrincipleSchema>;

export const NeuroPrincipleConfigSchema = z.object({
  /** Principle identifier */
  principle: NeuroPrincipleSchema,
  /** Enabled for this project */
  enabled: z.boolean().default(true),
  /** Priority (1 = highest) */
  priority: z.number().int().min(1).max(13).default(5),
  /** Application notes */
  applicationNotes: z.string().optional(),
  /** Recommended techniques */
  techniques: z.array(z.string()).default([]),
});
export type NeuroPrincipleConfig = z.infer<typeof NeuroPrincipleConfigSchema>;

export const ITLAOutputSchema = z.object({
  /** Selected neuroscience principles */
  principles: z.array(NeuroPrincipleConfigSchema).default([]),
  /** Gamification/dopamine intensity (1-10) */
  dopamineSliderValue: z.number().min(1).max(10).default(5),
  /** Working memory guard: max new concepts (3-5) */
  workingMemoryLimit: z.number().min(3).max(7).default(5),
  /** AI-matched principles */
  aiMatchedPrinciples: z.array(NeuroPrincipleSchema).default([]),
  /** Spaced repetition schedule */
  spacedRepetitionSchedule: z
    .object({
      enabled: z.boolean().default(false),
      intervals: z.array(z.number()).default([1, 3, 7, 14, 30]), // days
    })
    .optional(),
  /** Completion timestamp */
  completedAt: z.string().datetime().optional(),
});
export type ITLAOutput = z.infer<typeof ITLAOutputSchema>;

// ============================================================================
// ILMI - MODALITY INTEGRATOR (Step 1.4)
// ============================================================================

export const ModalityTypeSchema = z.enum([
  'visual',
  'auditory',
  'textual',
  'kinesthetic',
  'social-async',
  'gamified',
  'reflective',
  'contextual-situated',
]);
export type ModalityType = z.infer<typeof ModalityTypeSchema>;

export const ModalitySelectionSchema = z.object({
  /** Modality type */
  type: ModalityTypeSchema,
  /** Is primary modality */
  isPrimary: z.boolean().default(false),
  /** Is secondary modality */
  isSecondary: z.boolean().default(false),
  /** Weight/percentage (0-100) */
  weight: z.number().min(0).max(100).default(0),
});
export type ModalitySelection = z.infer<typeof ModalitySelectionSchema>;

export const ILMIOutputSchema = z.object({
  /** Primary modality */
  primaryModality: ModalityTypeSchema,
  /** Secondary modality for dual coding */
  secondaryModality: ModalityTypeSchema.optional(),
  /** All modality selections with weights */
  modalities: z.array(ModalitySelectionSchema).default([]),
  /** Dual coding validation score (0-100) */
  dualCodingScore: z.number().min(0).max(100).default(0),
  /** Dual coding pair valid (Visual + Auditory recommended) */
  dualCodingValid: z.boolean().default(false),
  /** Modality balance wheel data */
  balanceWheel: z
    .object({
      visual: z.number().min(0).max(100).default(0),
      auditory: z.number().min(0).max(100).default(0),
      textual: z.number().min(0).max(100).default(0),
      kinesthetic: z.number().min(0).max(100).default(0),
    })
    .optional(),
  /** Recommended interaction types based on modality */
  recommendedInteractions: z.array(z.string()).default([]),
  /** Completion timestamp */
  completedAt: z.string().datetime().optional(),
});
export type ILMIOutput = z.infer<typeof ILMIOutputSchema>;

// ============================================================================
// ICES - ENGAGEMENT SPECTRUM (Step 1.5)
// ============================================================================

export const EngagementLevelSchema = z.enum([
  'passive',
  'reflective',
  'active',
  'collaborative',
  'exploratory',
  'immersive',
]);
export type EngagementLevel = z.infer<typeof EngagementLevelSchema>;

export const EngagementLevelConfigSchema = z.object({
  /** Level identifier */
  level: EngagementLevelSchema,
  /** Human-readable description */
  description: z.string(),
  /** Cognitive load range */
  cognitiveLoadRange: z.object({
    min: z.number().min(0).max(10),
    max: z.number().min(0).max(10),
  }),
  /** Recommended for */
  recommendedFor: z.array(z.string()).default([]),
  /** Not recommended for */
  notRecommendedFor: z.array(z.string()).default([]),
});
export type EngagementLevelConfig = z.infer<typeof EngagementLevelConfigSchema>;

export const ICESOutputSchema = z.object({
  /** Target engagement level */
  targetLevel: EngagementLevelSchema,
  /** Cognitive load estimate (0-10) */
  cognitiveLoadEstimate: z.number().min(0).max(10).default(5),
  /** Stress simulation config (for immersive levels) */
  stressConfig: z
    .object({
      enabled: z.boolean().default(false),
      intensity: z.number().min(1).max(10).default(5),
      type: z.enum(['time-pressure', 'consequences', 'competition', 'realism']).optional(),
    })
    .optional(),
  /** Working memory guard warning */
  workingMemoryWarning: z.boolean().default(false),
  /** Modality alignment check passed */
  modalityAlignmentValid: z.boolean().default(true),
  /** Recommended block types for this level */
  recommendedBlockTypes: z.array(z.string()).default([]),
  /** Completion timestamp */
  completedAt: z.string().datetime().optional(),
});
export type ICESOutput = z.infer<typeof ICESOutputSchema>;

// ============================================================================
// COMBINED ENCODING DATA
// ============================================================================

export const EncodingDataSchema = z.object({
  /** Step 1.1: Industry Analysis */
  industryAnalysis: IndustryAnalysisSchema.optional(),
  /** Step 1.2: Learner Persona(s) */
  personas: z.array(LearnerPersonaSchema).optional(),
  /** Step 1.3: ITLA Activation Strategy */
  activationStrategy: ITLAOutputSchema.optional(),
  /** Step 1.4: ILMI Modality Plan */
  modalityPlan: ILMIOutputSchema.optional(),
  /** Step 1.5: ICES Engagement Level */
  engagementLevel: ICESOutputSchema.optional(),
  /** Phase completion status */
  isComplete: z.boolean().optional(),
  /** Phase started timestamp */
  startedAt: z.string().datetime().optional(),
  /** Phase completed timestamp */
  completedAt: z.string().datetime().optional(),
});
export type EncodingData = z.infer<typeof EncodingDataSchema>;

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isEncodingData(value: unknown): value is EncodingData {
  return EncodingDataSchema.safeParse(value).success;
}

export function isLearnerPersona(value: unknown): value is LearnerPersona {
  return LearnerPersonaSchema.safeParse(value).success;
}

export function isITLAOutput(value: unknown): value is ITLAOutput {
  return ITLAOutputSchema.safeParse(value).success;
}

export function isILMIOutput(value: unknown): value is ILMIOutput {
  return ILMIOutputSchema.safeParse(value).success;
}

export function isICESOutput(value: unknown): value is ICESOutput {
  return ICESOutputSchema.safeParse(value).success;
}
