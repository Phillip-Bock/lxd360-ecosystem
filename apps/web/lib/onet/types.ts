/**
 * O*NET Knowledge Graph Types
 *
 * Type definitions for O*NET occupational data integration.
 * Solves the "Cold Start" problem by pre-seeding skill taxonomy.
 *
 * @see https://www.onetonline.org/
 */

// =============================================================================
// SKILL CATEGORIES
// =============================================================================

/** O*NET Skill categories */
export type SkillCategory =
  | 'basic_skills'
  | 'complex_problem_solving'
  | 'resource_management'
  | 'social_skills'
  | 'systems_skills'
  | 'technical_skills';

/** O*NET Knowledge categories */
export type KnowledgeCategory =
  | 'business_and_management'
  | 'manufacturing_and_production'
  | 'engineering_and_technology'
  | 'mathematics_and_science'
  | 'health_services'
  | 'education_and_training'
  | 'arts_and_humanities'
  | 'law_and_public_safety'
  | 'communications'
  | 'transportation';

/** O*NET Ability categories */
export type AbilityCategory = 'cognitive' | 'psychomotor' | 'physical' | 'sensory';

/** Element type classification */
export type ElementType = 'skill' | 'knowledge' | 'ability';

// =============================================================================
// SKILL DEFINITIONS
// =============================================================================

/**
 * O*NET Skill representation
 */
export interface ONetSkill {
  /** O*NET element ID (e.g., "2.A.1.a") */
  onetElementId: string;
  /** Human-readable name */
  name: string;
  /** Detailed description */
  description: string;
  /** Category classification */
  category: SkillCategory | KnowledgeCategory | AbilityCategory;
  /** Element type */
  elementType: ElementType;
  /** Vector embedding for semantic search (768 dimensions for Vertex AI) */
  embedding?: number[];
  /** Related O*NET element IDs */
  relatedElements?: string[];
}

// =============================================================================
// OCCUPATION DEFINITIONS
// =============================================================================

/**
 * O*NET Occupation representation
 */
export interface ONetOccupation {
  /** O*NET-SOC code (e.g., "15-1252.00") */
  onetSocCode: string;
  /** Job title */
  title: string;
  /** Job description */
  description: string;
  /** Job family/category */
  jobFamily: string;
  /** Required skills with importance and level */
  requiredSkills: OccupationSkillRequirement[];
  /** Typical education level */
  typicalEducation?: string;
  /** Experience requirements */
  experienceRequired?: string;
  /** Median salary (if available) */
  medianSalary?: number;
  /** Growth outlook */
  growthOutlook?: 'declining' | 'stable' | 'growing' | 'rapid_growth';
}

/**
 * Skill requirement for an occupation
 */
export interface OccupationSkillRequirement {
  /** O*NET element ID */
  skillId: string;
  /** Importance score (1-5, with 5 being most important) */
  importance: number;
  /** Required level (1-7, with 7 being most advanced) */
  level: number;
  /** Skill name (denormalized for convenience) */
  skillName?: string;
}

// =============================================================================
// USER MASTERY
// =============================================================================

/**
 * Evidence source for skill mastery
 */
export type MasteryEvidenceSource = 'assessment' | 'xapi' | 'self_reported' | 'inferred';

/**
 * User's mastery of a specific skill
 */
export interface UserSkillMastery {
  /** User/Learner ID */
  learnerId: string;
  /** O*NET skill ID */
  skillId: string;
  /** Current mastery score (0-1, from BKT) */
  masteryScore: number;
  /** Confidence level (how certain we are about this score) */
  confidence: number;
  /** Evidence source */
  evidenceSource: MasteryEvidenceSource;
  /** Last verified/updated timestamp */
  lastVerified: Date;
  /** Number of data points contributing to this score */
  dataPoints: number;
}

// =============================================================================
// GAP ANALYSIS
// =============================================================================

/** Priority levels for skill gaps */
export type SkillGapPriority = 'critical' | 'high' | 'medium' | 'low';

/**
 * Identified skill gap between user and target role
 */
export interface SkillGap {
  /** The skill that needs development */
  skill: ONetSkill;
  /** Required level for target role (1-7) */
  requiredLevel: number;
  /** User's current level (0-7, 0 = no evidence) */
  currentLevel: number;
  /** Gap size (requiredLevel - currentLevel) */
  gap: number;
  /** Priority based on importance and gap size */
  priority: SkillGapPriority;
  /** Estimated hours to close gap */
  estimatedHours: number;
}

/**
 * Skill that can transfer from existing knowledge
 */
export interface TransferableSkill {
  /** User's existing skill */
  existingSkill: ONetSkill;
  /** Target role's required skill */
  targetSkill: ONetSkill;
  /** Similarity score (0-1, from vector comparison) */
  similarity: number;
  /** Estimated effort to transfer (0-1, lower is easier) */
  transferEffort: number;
  /** Explanation of transferability */
  explanation: string;
}

/**
 * Complete gap analysis result
 */
export interface GapAnalysisResult {
  /** Target occupation */
  targetOccupation: ONetOccupation;
  /** User ID */
  learnerId: string;
  /** Analysis timestamp */
  analyzedAt: Date;
  /** Overall readiness score (0-100) */
  readinessScore: number;
  /** Skills the user is missing */
  missingSkills: SkillGap[];
  /** Skills that can transfer from existing knowledge */
  transferableSkills: TransferableSkill[];
  /** Skills already mastered */
  masteredSkills: ONetSkill[];
  /** Estimated total training hours */
  estimatedTrainingHours: number;
  /** Recommended learning path order */
  recommendedPath: string[]; // Skill IDs in order
}

// =============================================================================
// EMBEDDING TYPES
// =============================================================================

/**
 * Skill with pre-computed embedding
 */
export interface SkillWithEmbedding extends ONetSkill {
  embedding: number[];
}

/**
 * Batch embedding request
 */
export interface EmbeddingBatchRequest {
  skills: ONetSkill[];
  model?: string;
}

/**
 * Batch embedding response
 */
export interface EmbeddingBatchResponse {
  embeddings: Map<string, number[]>;
  model: string;
  dimensions: number;
}

// =============================================================================
// SEARCH & MATCHING
// =============================================================================

/**
 * Skill search query
 */
export interface SkillSearchQuery {
  /** Text query */
  query: string;
  /** Filter by category */
  category?: SkillCategory | KnowledgeCategory | AbilityCategory;
  /** Filter by element type */
  elementType?: ElementType;
  /** Maximum results */
  limit?: number;
  /** Use semantic search (requires embeddings) */
  semantic?: boolean;
}

/**
 * Skill search result
 */
export interface SkillSearchResult {
  skill: ONetSkill;
  /** Relevance score (0-1) */
  score: number;
  /** Match type */
  matchType: 'exact' | 'partial' | 'semantic';
}

/**
 * Occupation search query
 */
export interface OccupationSearchQuery {
  /** Text query */
  query: string;
  /** Filter by job family */
  jobFamily?: string;
  /** Filter by growth outlook */
  growthOutlook?: ONetOccupation['growthOutlook'];
  /** Maximum results */
  limit?: number;
}

/**
 * Occupation search result
 */
export interface OccupationSearchResult {
  occupation: ONetOccupation;
  /** Relevance score (0-1) */
  score: number;
}
