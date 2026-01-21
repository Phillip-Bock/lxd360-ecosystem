import { z } from 'zod';

/**
 * NASA Task Load Index (NASA-TLX) dimensions
 * Used for multi-dimensional workload assessment
 */
export const NasaTlxDimensionSchema = z.enum([
  'mental_demand',
  'physical_demand',
  'temporal_demand',
  'performance',
  'effort',
  'frustration',
]);
export type NasaTlxDimension = z.infer<typeof NasaTlxDimensionSchema>;

/**
 * NASA-TLX rating (0-100 scale)
 */
export const NasaTlxRatingSchema = z.object({
  dimension: NasaTlxDimensionSchema,
  rating: z.number().min(0).max(100),
  weight: z.number().min(0).max(5).optional(), // From pairwise comparisons
});
export type NasaTlxRating = z.infer<typeof NasaTlxRatingSchema>;

/**
 * Paas Mental Effort Scale (1-9)
 * Simple unidimensional measure
 */
export const PaasRatingSchema = z.number().min(1).max(9);
export type PaasRating = z.infer<typeof PaasRatingSchema>;

/**
 * Leppink's Multi-Component Cognitive Load Scale
 * Separates intrinsic, extraneous, and germane load
 */
export const LeppinkLoadTypeSchema = z.enum(['intrinsic', 'extraneous', 'germane']);
export type LeppinkLoadType = z.infer<typeof LeppinkLoadTypeSchema>;

export const LeppinkItemSchema = z.object({
  loadType: LeppinkLoadTypeSchema,
  rating: z.number().min(0).max(10),
  itemText: z.string().optional(),
});
export type LeppinkItem = z.infer<typeof LeppinkItemSchema>;

/**
 * Cognitive Load Index - unified measurement
 */
export const CognitiveLoadIndexSchema = z.object({
  // Raw scores
  intrinsicLoad: z.number().min(0).max(100),
  extraneousLoad: z.number().min(0).max(100),
  germaneLoad: z.number().min(0).max(100),

  // Calculated metrics
  totalLoad: z.number().min(0).max(100),
  effectiveLoad: z.number().min(0).max(100), // intrinsic + germane
  wastedLoad: z.number().min(0).max(100), // extraneous

  // Risk assessment
  overloadRisk: z.enum(['low', 'medium', 'high', 'critical']),
  recommendedAction: z.string().optional(),

  // Metadata
  timestamp: z.string().datetime(),
  sessionId: z.string().uuid().optional(),
  blockId: z.string().optional(),
});
export type CognitiveLoadIndex = z.infer<typeof CognitiveLoadIndexSchema>;

/**
 * Element Interactivity - measure of content complexity
 * Based on Sweller's CLT
 */
export const ElementInteractivitySchema = z.object({
  elementCount: z.number().min(1),
  interactionLevel: z.enum(['isolated', 'sequential', 'interconnected']),
  estimatedLoad: z.number().min(0).max(100),
});
export type ElementInteractivity = z.infer<typeof ElementInteractivitySchema>;

/**
 * Bandwidth context - external factors affecting available capacity
 * Based on Mullainathan & Shafir's "Scarcity" research
 */
export const BandwidthContextSchema = z.object({
  // Time pressure (0 = no pressure, 100 = extreme)
  timePressure: z.number().min(0).max(100).default(0),

  // Environmental distractions (0 = none, 100 = severe)
  distractions: z.number().min(0).max(100).default(0),

  // Fatigue level (0 = fresh, 100 = exhausted)
  fatigue: z.number().min(0).max(100).default(0),

  // Session duration in minutes
  sessionDuration: z.number().min(0).default(0),

  // Time of day factor (circadian)
  timeOfDay: z.enum(['morning', 'midday', 'afternoon', 'evening', 'night']).optional(),

  // Calculated bandwidth penalty (reduces available capacity)
  bandwidthPenalty: z.number().min(0).max(50).default(0),
});
export type BandwidthContext = z.infer<typeof BandwidthContextSchema>;

/**
 * Instructional Efficiency Score
 * Based on Paas & Van Merriënboer Z-score formula
 */
export const InstructionalEfficiencySchema = z.object({
  performanceZScore: z.number(),
  effortZScore: z.number(),
  efficiencyScore: z.number(), // (P - E) / sqrt(2)
  interpretation: z.enum([
    'highly_efficient',
    'efficient',
    'neutral',
    'inefficient',
    'highly_inefficient',
  ]),
});
export type InstructionalEfficiency = z.infer<typeof InstructionalEfficiencySchema>;
