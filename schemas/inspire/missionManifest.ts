/**
 * INSPIRE Mission Manifest Schema
 *
 * The "Golden Thread" manifest that maintains continuity across
 * Encoding, Synthesization, and Assimilation phases.
 *
 * @module schemas/inspire/missionManifest
 */

import { z } from 'zod';
import { AssimilationDataSchema, EncodingDataSchema, SynthesizationDataSchema } from './index';

// ============================================================================
// MISSION METADATA
// ============================================================================

export const MissionMetadataSchema = z.object({
  /** Mission unique identifier */
  id: z.string().uuid(),
  /** Mission title */
  title: z.string().min(1).max(200),
  /** Mission description */
  description: z.string().optional(),
  /** Organization ID for multi-tenancy */
  organizationId: z.string().optional(),
  /** Created by user ID */
  createdBy: z.string().optional(),
  /** Target industry */
  industry: z.string().optional(),
  /** Course type */
  courseType: z.string().optional(),
  /** Version number */
  version: z.number().int().positive().default(1),
  /** Created timestamp */
  createdAt: z.string().datetime().optional(),
  /** Last updated timestamp */
  updatedAt: z.string().datetime().optional(),
});
export type MissionMetadata = z.infer<typeof MissionMetadataSchema>;

// ============================================================================
// NEURO SIGNATURE
// ============================================================================

/**
 * NeuroSignature captures the cognitive profile of the learning experience.
 * This is derived from Encoding phase inputs and informs Assimilation.
 */
export const NeuroSignatureSchema = z.object({
  /** Primary neuroscience principles applied */
  principles: z.array(z.string()).default([]),
  /** Gamification/dopamine intensity (1-10) */
  dopamineIntensity: z.number().min(1).max(10).default(5),
  /** Working memory guard: max new concepts per module */
  workingMemoryLimit: z.number().min(3).max(7).default(5),
  /** Primary learning modality */
  primaryModality: z
    .enum(['visual', 'auditory', 'textual', 'kinesthetic', 'social'])
    .default('visual'),
  /** Secondary modality for dual coding */
  secondaryModality: z.enum(['visual', 'auditory', 'textual', 'kinesthetic', 'social']).optional(),
  /** Dual coding score (0-100) */
  dualCodingScore: z.number().min(0).max(100).default(50),
  /** Target engagement level */
  engagementLevel: z
    .enum(['passive', 'reflective', 'active', 'collaborative', 'exploratory', 'immersive'])
    .default('active'),
  /** Cognitive load estimate (0-10) */
  cognitiveLoadEstimate: z.number().min(0).max(10).default(5),
});
export type NeuroSignature = z.infer<typeof NeuroSignatureSchema>;

// ============================================================================
// COMPETENCY LADDER
// ============================================================================

export const CompetencyRungSchema = z.object({
  /** Unique rung identifier */
  id: z.string().uuid(),
  /** Rung order (1 = bottom) */
  order: z.number().int().positive(),
  /** Learning objective statement */
  objective: z.string().min(1),
  /** Bloom's cognitive level */
  cognitiveLevel: z.enum(['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create']),
  /** ICDT complexity level (1-6) */
  complexityLevel: z.number().min(1).max(6),
  /** Target proficiency (1-6) */
  targetProficiency: z.number().min(1).max(6),
  /** Observable performance criteria */
  performanceCriteria: z.array(z.string()).default([]),
  /** Mapped job tasks */
  jobTasks: z.array(z.string()).default([]),
  /** Prerequisites (other rung IDs) */
  prerequisites: z.array(z.string()).default([]),
  /** SMART goal text */
  smartGoal: z.string().optional(),
  /** Recommended block types for this level */
  recommendedBlockTypes: z.array(z.string()).default([]),
});
export type CompetencyRung = z.infer<typeof CompetencyRungSchema>;

// ============================================================================
// MISSION MANIFEST (GOLDEN THREAD)
// ============================================================================

/**
 * The complete Mission Manifest - the "Golden Thread" that connects
 * all phases of the INSPIRE methodology.
 */
export const MissionManifestSchema = z.object({
  /** Mission metadata */
  metadata: MissionMetadataSchema,

  /** Neuro signature derived from Encoding */
  neuroSignature: NeuroSignatureSchema.optional(),

  /** Competency ladder from Synthesization */
  competencyLadder: z.array(CompetencyRungSchema).default([]),

  /** Phase 1: Encoding data */
  encoding: EncodingDataSchema.optional(),

  /** Phase 2: Synthesization data */
  synthesization: SynthesizationDataSchema.optional(),

  /** Phase 3: Assimilation data */
  assimilation: AssimilationDataSchema.optional(),
});
export type MissionManifest = z.infer<typeof MissionManifestSchema>;

// ============================================================================
// MANIFEST EXPORT FORMAT
// ============================================================================

export const ManifestExportSchema = z.object({
  /** Export format version */
  formatVersion: z.string().default('1.0'),
  /** Export timestamp */
  exportedAt: z.string().datetime(),
  /** Exporting user */
  exportedBy: z.string().optional(),
  /** The manifest data */
  manifest: MissionManifestSchema,
  /** Export checksum for integrity */
  checksum: z.string().optional(),
});
export type ManifestExport = z.infer<typeof ManifestExportSchema>;

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isMissionManifest(value: unknown): value is MissionManifest {
  return MissionManifestSchema.safeParse(value).success;
}

export function isCompetencyRung(value: unknown): value is CompetencyRung {
  return CompetencyRungSchema.safeParse(value).success;
}
