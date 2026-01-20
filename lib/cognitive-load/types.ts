/**
 * Cognitive Load Types - Based on Cognitive Load Theory (Sweller, 1988)
 * Implements NASA-TLX, Paas Scale, and Leppink's 3-Component Model
 */

/** Element interactivity level affects how content elements must be processed */
export type ElementInteractivity = 'isolated' | 'sequential' | 'interconnected';

/** Load severity levels for UI feedback */
export type LoadLevel = 'low' | 'optimal' | 'high' | 'overload';

/** INSPIRE framework stages for contextual recommendations */
export type InspireStage =
  | 'intrigue'
  | 'note'
  | 'scaffold'
  | 'practice'
  | 'integrate'
  | 'reflect'
  | 'extend';

/** Metrics extracted from lesson content */
export interface ContentMetrics {
  wordCount: number;
  sentenceCount: number;
  paragraphCount: number;
  imageCount: number;
  videoCount: number;
  audioCount: number;
  interactionCount: number;
  questionCount: number;
  conceptDensity: number;
  readabilityScore: number;
  elementInteractivity: ElementInteractivity;
  estimatedDurationMinutes: number;
}

/** NASA-TLX workload assessment dimensions */
export interface NasaTlxDimensions {
  mentalDemand: number;
  physicalDemand: number;
  temporalDemand: number;
  performance: number;
  effort: number;
  frustration: number;
}

/** Paas Mental Effort Scale (1-9) */
export interface PaasScale {
  mentalEffort: number;
  perceivedDifficulty: number;
}

/** Leppink's 3-Component Model */
export interface LeppinkComponents {
  intrinsicLoad: number;
  extraneousLoad: number;
  germaneLoad: number;
}

/** Individual recommendation with priority and action */
export interface Recommendation {
  id: string;
  priority: 'high' | 'medium' | 'low';
  category: 'content' | 'design' | 'interaction' | 'pacing';
  message: string;
  action?: string;
  impactScore: number;
}

/** Final cognitive load analysis result */
export interface CognitiveLoadResult {
  /** Intrinsic load - inherent complexity of content (0-100) */
  intrinsic: number;
  /** Extraneous load - unnecessary design burden (0-100) */
  extraneous: number;
  /** Germane load - productive learning effort (0-100) */
  germane: number;
  /** Combined total load (0-100) */
  total: number;
  /** Load to capacity ratio (0-1+) */
  ratio: number;
  /** Severity level for UI display */
  level: LoadLevel;
  /** Actionable recommendations to optimize load */
  recommendations: Recommendation[];
  /** Raw component scores */
  leppink: LeppinkComponents;
  /** NASA-TLX predicted scores */
  nasaTlx: NasaTlxDimensions;
  /** Paas scale predictions */
  paas: PaasScale;
  /** Current INSPIRE stage context */
  inspireStage?: InspireStage;
  /** Timestamp of analysis */
  analyzedAt: Date;
}

/** Configuration for load calculation thresholds */
export interface LoadThresholds {
  optimal: { min: number; max: number };
  high: { min: number; max: number };
  overload: { min: number };
}

/** Default thresholds based on CLT research */
export const DEFAULT_THRESHOLDS: LoadThresholds = {
  optimal: { min: 30, max: 60 },
  high: { min: 60, max: 80 },
  overload: { min: 80 },
};
