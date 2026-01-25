/**
 * O*NET Knowledge Graph Module
 *
 * Provides skill taxonomy, occupation data, and gap analysis for the
 * LXD360 adaptive learning platform. Solves the "Cold Start" problem
 * by pre-seeding with O*NET occupational data.
 *
 * @example
 * ```typescript
 * import { analyzeGap, getOccupationByCode, ONET_OCCUPATIONS } from '@/lib/onet';
 *
 * const occupation = getOccupationByCode('15-1252.00');
 * const gapAnalysis = analyzeGap(userId, occupation, userMasteries);
 * ```
 */

// Gap Engine
export {
  // Core analysis
  analyzeGap,
  buildSkillEmbeddingMap,
  calculateMultiOccupationCoverage,
  cosineSimilarity,
  estimateTimeToReadiness,
  findHighImpactSkills,
  getCachedEmbedding,
  // Recommendations
  getTopRecommendations,
  // Quick access
  quickReadinessCheck,
  // Embedding utilities
  setCachedEmbedding,
} from './gap-engine';

// Seed Data
export {
  findOccupationsRequiringSkill,
  getOccupationByCode,
  getOccupationSkillIds,
  getOccupationSkillsWithDetails,
  getSkillById,
  getSkillOverlap,
  getSkillsByCategory,
  ONET_OCCUPATIONS,
  // Data
  ONET_SKILLS,
  // Helper functions
  searchOccupations,
  searchSkills,
} from './seed-data';
// Types
export type {
  // Skill types
  AbilityCategory,
  ElementType,
  EmbeddingBatchRequest,
  EmbeddingBatchResponse,
  // Gap analysis types
  GapAnalysisResult,
  KnowledgeCategory,
  MasteryEvidenceSource,
  OccupationSearchQuery,
  OccupationSearchResult,
  // Occupation types
  OccupationSkillRequirement,
  ONetOccupation,
  ONetSkill,
  SkillCategory,
  SkillGap,
  SkillGapPriority,
  // Search types
  SkillSearchQuery,
  SkillSearchResult,
  SkillWithEmbedding,
  TransferableSkill,
  UserSkillMastery,
} from './types';
