/**
 * Skills and competency type definitions
 */

export type SkillLevel = 'novice' | 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master';

export interface Skill {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: SkillCategory;
  subcategory?: string;
  icon?: string;
  color?: string;
  // Levels
  levels: SkillLevelDefinition[];
  maxLevel: number;
  // Content
  courseCount: number;
  learnerCount: number;
  assessmentCount: number;
  // Organization
  isCore: boolean;
  isRequired: boolean;
  departmentIds?: string[];
  roleIds?: string[];
  // Relationships
  prerequisites: string[];
  relatedSkills: string[];
  parentSkillId?: string;
  childSkills?: string[];
  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface SkillCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  parentId?: string;
  order: number;
  skillCount: number;
}

export interface SkillLevelDefinition {
  level: number;
  name: SkillLevel;
  description: string;
  requirements: string[];
  minScore: number;
  xpRequired: number;
  badgeId?: string;
}

export interface LearnerSkillProgress {
  skillId: string;
  learnerId: string;
  currentLevel: number;
  currentScore: number; // 0-100
  xp: number;
  xpToNextLevel: number;
  levelName: SkillLevel;
  progressHistory: SkillProgressEntry[];
  assessments: SkillAssessmentResult[];
  endorsements: SkillEndorsement[];
  courses: SkillCourseContribution[];
  lastAssessedAt?: string;
  lastActivityAt: string;
  trend: 'improving' | 'stable' | 'declining';
}

export interface SkillProgressEntry {
  date: string;
  level: number;
  score: number;
  source: 'course' | 'assessment' | 'endorsement' | 'practice';
  sourceId: string;
  delta: number;
}

export interface SkillAssessmentResult {
  assessmentId: string;
  assessmentTitle: string;
  takenAt: string;
  score: number;
  level: SkillLevel;
  passed: boolean;
  certificateId?: string;
}

export interface SkillEndorsement {
  id: string;
  endorserId: string;
  endorserName: string;
  endorserAvatar?: string;
  endorserTitle?: string;
  relationship: 'manager' | 'peer' | 'mentor' | 'instructor' | 'external';
  comment?: string;
  endorsedAt: string;
}

export interface SkillCourseContribution {
  courseId: string;
  courseTitle: string;
  contribution: number; // points contributed
  completedAt?: string;
  status: 'in-progress' | 'completed';
}

export interface SkillGapAnalysis {
  learnerId: string;
  targetRole?: string;
  skills: SkillGap[];
  overallReadiness: number; // 0-100
  estimatedTimeToClose: number; // hours
  recommendedCourses: string[];
  recommendedPaths: string[];
  generatedAt: string;
}

export interface SkillGap {
  skillId: string;
  skillName: string;
  currentLevel: number;
  targetLevel: number;
  gap: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  courses: {
    courseId: string;
    courseTitle: string;
    levelGain: number;
  }[];
  estimatedTime: number; // hours
}

export interface SkillFramework {
  id: string;
  name: string;
  description: string;
  type: 'competency' | 'career' | 'technical' | 'leadership' | 'custom';
  categories: SkillCategory[];
  skills: Skill[];
  roles: RoleSkillRequirement[];
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RoleSkillRequirement {
  roleId: string;
  roleName: string;
  department?: string;
  requiredSkills: {
    skillId: string;
    skillName: string;
    requiredLevel: number;
    isCore: boolean;
  }[];
}

export interface LearningPath {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  thumbnail: string;
  coverImage?: string;
  // Structure
  stages: LearningPathStage[];
  totalCourses: number;
  totalDuration: number; // minutes
  estimatedWeeks: number;
  // Outcomes
  skills: PathSkillOutcome[];
  certificationId?: string;
  badgeId?: string;
  roleTarget?: string;
  // Stats
  enrollmentCount: number;
  completionRate: number;
  rating: number;
  reviewCount: number;
  // Access
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  prerequisites: string[];
  isRequired: boolean;
  isSequential: boolean;
  // Metadata
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  status: 'draft' | 'published' | 'archived';
}

export interface LearningPathStage {
  id: string;
  title: string;
  description?: string;
  order: number;
  items: LearningPathItem[];
  unlockCriteria?: {
    type: 'previous-stage' | 'date' | 'assessment-score';
    value: string | number;
  };
}

export interface LearningPathItem {
  id: string;
  type: 'course' | 'assessment' | 'milestone' | 'resource' | 'activity';
  resourceId: string;
  title: string;
  description?: string;
  duration: number;
  order: number;
  isRequired: boolean;
  unlockCriteria?: string;
}

export interface PathSkillOutcome {
  skillId: string;
  skillName: string;
  levelBefore: number;
  levelAfter: number;
  levelGain: number;
}

export interface LearningPathEnrollment {
  id: string;
  pathId: string;
  learnerId: string;
  status: 'enrolled' | 'in-progress' | 'completed' | 'dropped';
  progress: number;
  currentStageId: string;
  completedItems: string[];
  startedAt: string;
  completedAt?: string;
  estimatedCompletion?: string;
  timeSpent: number;
}
