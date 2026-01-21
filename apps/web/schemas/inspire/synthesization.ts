/**
 * INSPIRE Synthesization Phase Schemas
 *
 * Schemas for the Synthesization phase (Phase 2) of the INSPIRE methodology:
 * - IPMG (Performance Mapping Grid)
 * - ICDT (Cognitive Demand Taxonomy)
 * - ICPF (Capability Progression Framework)
 * - ICL (Competency Ladder)
 *
 * @module schemas/inspire/synthesization
 */

import { z } from 'zod';

// ============================================================================
// IPMG - PERFORMANCE MAPPING GRID (Step 2.1)
// ============================================================================

export const TaskFrequencySchema = z.enum([
  'hourly',
  'daily',
  'weekly',
  'monthly',
  'quarterly',
  'annually',
  'as-needed',
]);
export type TaskFrequency = z.infer<typeof TaskFrequencySchema>;

export const TaskCriticalitySchema = z.enum(['high-stakes', 'high-frequency', 'both', 'standard']);
export type TaskCriticality = z.infer<typeof TaskCriticalitySchema>;

export const JobTaskSchema = z.object({
  /** Unique identifier */
  id: z.string().uuid(),
  /** Task title */
  title: z.string().min(1),
  /** Task description */
  description: z.string().optional(),
  /** Task frequency */
  frequency: TaskFrequencySchema.default('daily'),
  /** Task criticality */
  criticality: TaskCriticalitySchema.default('standard'),
  /** Parent task ID (for hierarchical tasks) */
  parentTaskId: z.string().uuid().optional(),
});
export type JobTask = z.infer<typeof JobTaskSchema>;

export const PerformanceCriterionSchema = z.object({
  /** Unique identifier */
  id: z.string().uuid(),
  /** Criterion text (e.g., "with zero errors") */
  criterion: z.string().min(1),
  /** Measurement method */
  measurementMethod: z.string().optional(),
  /** Target metric */
  targetMetric: z.string().optional(),
});
export type PerformanceCriterion = z.infer<typeof PerformanceCriterionSchema>;

export const TaskCompetencyLinkSchema = z.object({
  /** Unique identifier */
  id: z.string().uuid(),
  /** Linked job task ID */
  taskId: z.string().uuid(),
  /** Linked competency/objective ID */
  competencyId: z.string().uuid(),
  /** Performance criteria */
  performanceCriteria: z.array(PerformanceCriterionSchema).default([]),
  /** Link strength/relevance */
  relevance: z.enum(['primary', 'secondary', 'supporting']).default('primary'),
});
export type TaskCompetencyLink = z.infer<typeof TaskCompetencyLinkSchema>;

export const IPMGOutputSchema = z.object({
  /** All job tasks */
  tasks: z.array(JobTaskSchema).default([]),
  /** Task-to-competency links */
  taskCompetencyLinks: z.array(TaskCompetencyLinkSchema).default([]),
  /** Performance criteria (reusable) */
  performanceCriteria: z.array(PerformanceCriterionSchema).default([]),
  /** Fallback matrix used */
  fallbackMatrixUsed: z.boolean().default(false),
  /** Industry baseline applied */
  industryBaseline: z.string().optional(),
  /** Completion timestamp */
  completedAt: z.string().datetime().optional(),
});
export type IPMGOutput = z.infer<typeof IPMGOutputSchema>;

// ============================================================================
// ICDT - COGNITIVE DEMAND TAXONOMY (Step 2.2)
// ============================================================================

export const ComplexityLevelSchema = z.enum([
  'foundation', // Level 1: Recognize & Recall
  'application', // Level 2: Apply in familiar context
  'adaptive', // Level 3: Modify approach
  'strategic', // Level 4: Multi-system coordination
  'mastery', // Level 5: Near-automaticity
  'innovation', // Level 6: Novel problem-solving
]);
export type ComplexityLevel = z.infer<typeof ComplexityLevelSchema>;

export const LearningDomainSchema = z.enum([
  'cognitive',
  'affective',
  'psychomotor',
  'social',
  'metacognitive',
  'creative',
  'digital',
]);
export type LearningDomain = z.infer<typeof LearningDomainSchema>;

export const BloomVerbSchema = z.enum([
  // Remember
  'define',
  'identify',
  'list',
  'name',
  'recall',
  'recognize',
  'state',
  // Understand
  'classify',
  'describe',
  'discuss',
  'explain',
  'interpret',
  'paraphrase',
  'summarize',
  // Apply
  'apply',
  'demonstrate',
  'execute',
  'implement',
  'operate',
  'solve',
  'use',
  // Analyze
  'analyze',
  'compare',
  'contrast',
  'differentiate',
  'examine',
  'organize',
  'relate',
  // Evaluate
  'appraise',
  'assess',
  'critique',
  'evaluate',
  'judge',
  'justify',
  'validate',
  // Create
  'compose',
  'construct',
  'create',
  'design',
  'develop',
  'formulate',
  'produce',
]);
export type BloomVerb = z.infer<typeof BloomVerbSchema>;

export const ObjectiveDemandSchema = z.object({
  /** Unique identifier */
  id: z.string().uuid(),
  /** Learning objective text */
  objectiveText: z.string().min(1),
  /** ICDT complexity level */
  complexityLevel: ComplexityLevelSchema,
  /** Active learning domains */
  domains: z.array(LearningDomainSchema).default([]),
  /** Action verb used */
  actionVerb: BloomVerbSchema.optional(),
  /** Cognitive load weight (1-3) */
  cognitiveLoadWeight: z.number().min(1).max(3).default(1),
  /** Notes */
  notes: z.string().optional(),
});
export type ObjectiveDemand = z.infer<typeof ObjectiveDemandSchema>;

export const ICDTOutputSchema = z.object({
  /** Objectives with cognitive demand tags */
  objectives: z.array(ObjectiveDemandSchema).default([]),
  /** Cognitive load heatmap data */
  cognitiveLoadDistribution: z
    .object({
      foundation: z.number().default(0),
      application: z.number().default(0),
      adaptive: z.number().default(0),
      strategic: z.number().default(0),
      mastery: z.number().default(0),
      innovation: z.number().default(0),
    })
    .optional(),
  /** Domain coverage */
  domainCoverage: z.array(LearningDomainSchema).default([]),
  /** Average complexity */
  averageComplexity: z.number().min(1).max(6).optional(),
  /** Completion timestamp */
  completedAt: z.string().datetime().optional(),
});
export type ICDTOutput = z.infer<typeof ICDTOutputSchema>;

// ============================================================================
// ICPF - CAPABILITY PROGRESSION FRAMEWORK (Step 2.3)
// ============================================================================

export const ProficiencyLevelSchema = z.enum([
  'aware', // Level 1: Recognizes information exists
  'comprehend', // Level 2: Understands concepts
  'apply', // Level 3: Uses in familiar contexts
  'adapt', // Level 4: Modifies for novel situations
  'integrate', // Level 5: Combines multiple skills
  'elevate', // Level 6: Innovates and teaches others
]);
export type ProficiencyLevel = z.infer<typeof ProficiencyLevelSchema>;

export const ScaffoldingConfigSchema = z.object({
  /** Proficiency level */
  level: ProficiencyLevelSchema,
  /** Hint visibility (0 = none, 100 = full) */
  hintVisibility: z.number().min(0).max(100),
  /** Support type */
  supportType: z.enum(['full-guidance', 'partial-hints', 'feedback-only', 'none']),
  /** Fade rate (how quickly support fades) */
  fadeRate: z.enum(['slow', 'medium', 'fast']).default('medium'),
});
export type ScaffoldingConfig = z.infer<typeof ScaffoldingConfigSchema>;

export const DomainBenchmarkSchema = z.object({
  /** Learning domain */
  domain: LearningDomainSchema,
  /** Proficiency level */
  level: ProficiencyLevelSchema,
  /** Observable behaviors at this level */
  observableBehaviors: z.array(z.string()).default([]),
});
export type DomainBenchmark = z.infer<typeof DomainBenchmarkSchema>;

export const ICPFOutputSchema = z.object({
  /** Target proficiency level */
  targetProficiency: ProficiencyLevelSchema,
  /** Starting proficiency (from persona) */
  startingProficiency: ProficiencyLevelSchema.optional(),
  /** Scaffolding configuration per level */
  scaffolding: z.array(ScaffoldingConfigSchema).default([]),
  /** Domain benchmarks */
  domainBenchmarks: z.array(DomainBenchmarkSchema).default([]),
  /** Neuro readiness alignment score (0-100) */
  neuroReadinessScore: z.number().min(0).max(100).optional(),
  /** Milestones */
  milestones: z
    .array(
      z.object({
        level: ProficiencyLevelSchema,
        milestone: z.string(),
        celebration: z.string().optional(),
      }),
    )
    .default([]),
  /** Completion timestamp */
  completedAt: z.string().datetime().optional(),
});
export type ICPFOutput = z.infer<typeof ICPFOutputSchema>;

// ============================================================================
// ICL - COMPETENCY LADDER (Step 2.4)
// ============================================================================

export const LadderRungSchema = z.object({
  /** Unique identifier */
  id: z.string().uuid(),
  /** Rung order (1 = bottom, highest = top) */
  order: z.number().int().positive(),
  /** Learning objective (SMART goal) */
  objective: z.string().min(1),
  /** Action verb */
  actionVerb: BloomVerbSchema.optional(),
  /** ICDT complexity level */
  complexityLevel: ComplexityLevelSchema,
  /** ICPF proficiency target */
  proficiencyTarget: ProficiencyLevelSchema,
  /** Mapped job task IDs */
  taskIds: z.array(z.string()).default([]),
  /** Prerequisites (other rung IDs) */
  prerequisites: z.array(z.string()).default([]),
  /** Unlock logic for player */
  unlockLogic: z
    .object({
      requiresCompletion: z.array(z.string()).default([]),
      requiresScore: z.number().min(0).max(100).optional(),
    })
    .optional(),
  /** Recommended block types */
  recommendedBlockTypes: z.array(z.string()).default([]),
  /** Estimated time (minutes) */
  estimatedMinutes: z.number().min(0).optional(),
});
export type LadderRung = z.infer<typeof LadderRungSchema>;

export const ICLOutputSchema = z.object({
  /** Ladder rungs (ordered from bottom to top) */
  rungs: z.array(LadderRungSchema).default([]),
  /** Prerequisites map (visual connections) */
  prerequisiteMap: z.record(z.string(), z.array(z.string())).default({}),
  /** Gaps identified (missing prerequisites) */
  identifiedGaps: z
    .array(
      z.object({
        rungId: z.string(),
        missingPrerequisites: z.array(z.string()),
        recommendation: z.string(),
      }),
    )
    .default([]),
  /** SMART goal optimization applied */
  smartOptimized: z.boolean().default(false),
  /** Total estimated duration (minutes) */
  totalEstimatedMinutes: z.number().min(0).optional(),
  /** Completion timestamp */
  completedAt: z.string().datetime().optional(),
});
export type ICLOutput = z.infer<typeof ICLOutputSchema>;

// ============================================================================
// COMBINED SYNTHESIZATION DATA
// ============================================================================

export const SynthesizationDataSchema = z.object({
  /** Step 2.1: IPMG Performance Mapping */
  performanceMapping: IPMGOutputSchema.optional(),
  /** Step 2.2: ICDT Cognitive Demand */
  cognitiveDemand: ICDTOutputSchema.optional(),
  /** Step 2.3: ICPF Capability Progression */
  capabilityProgression: ICPFOutputSchema.optional(),
  /** Step 2.4: ICL Competency Ladder */
  competencyLadder: ICLOutputSchema.optional(),
  /** Phase completion status */
  isComplete: z.boolean().optional(),
  /** Phase started timestamp */
  startedAt: z.string().datetime().optional(),
  /** Phase completed timestamp */
  completedAt: z.string().datetime().optional(),
});
export type SynthesizationData = z.infer<typeof SynthesizationDataSchema>;

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isSynthesizationData(value: unknown): value is SynthesizationData {
  return SynthesizationDataSchema.safeParse(value).success;
}

export function isIPMGOutput(value: unknown): value is IPMGOutput {
  return IPMGOutputSchema.safeParse(value).success;
}

export function isICDTOutput(value: unknown): value is ICDTOutput {
  return ICDTOutputSchema.safeParse(value).success;
}

export function isICPFOutput(value: unknown): value is ICPFOutput {
  return ICPFOutputSchema.safeParse(value).success;
}

export function isICLOutput(value: unknown): value is ICLOutput {
  return ICLOutputSchema.safeParse(value).success;
}
