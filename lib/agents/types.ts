import { z } from 'zod';

// ============================================================================
// COURSE STRUCTURE TYPES
// ============================================================================

/**
 * Content block types supported by the Designer Agent
 */
export type ContentBlockType =
  | 'text'
  | 'video'
  | 'quiz'
  | 'interactive'
  | 'scenario'
  | 'assessment';

/**
 * Schema for content block generation
 */
export const ContentBlockSchema = z.object({
  id: z.string(),
  type: z.enum(['text', 'video', 'quiz', 'interactive', 'scenario', 'assessment']),
  title: z.string(),
  content: z.string(),
  duration: z.number().int().positive().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type ContentBlock = z.infer<typeof ContentBlockSchema>;

/**
 * Schema for lesson structure
 */
export const LessonSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  objectives: z.array(z.string()),
  blocks: z.array(ContentBlockSchema),
  estimatedDuration: z.number().int().positive(),
});

export type Lesson = z.infer<typeof LessonSchema>;

/**
 * Schema for module structure
 */
export const ModuleSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  lessons: z.array(LessonSchema),
});

export type Module = z.infer<typeof ModuleSchema>;

/**
 * Schema for course outline
 */
export const CourseOutlineSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  targetAudience: z.string(),
  learningObjectives: z.array(z.string()),
  prerequisites: z.array(z.string()).optional(),
  estimatedDuration: z.number().int().positive(),
  modules: z.array(ModuleSchema),
});

export type CourseOutline = z.infer<typeof CourseOutlineSchema>;

/**
 * Schema for full course with content
 */
export const FullCourseSchema = CourseOutlineSchema.extend({
  createdAt: z.string().datetime(),
  generatedBy: z.literal('designer-agent'),
  version: z.string(),
});

export type FullCourse = z.infer<typeof FullCourseSchema>;

// ============================================================================
// LEARNER AGENT TYPES
// ============================================================================

/**
 * Behavior profile types for the Learner Agent
 */
export type LearnerBehaviorType = 'diligent' | 'explorer' | 'struggler' | 'speedster' | 'dropout';

/**
 * Schema for learner behavior profile
 */
export const LearnerProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  behaviorType: z.enum(['diligent', 'explorer', 'struggler', 'speedster', 'dropout']),
  attributes: z.object({
    attentionSpan: z.number().min(0).max(100),
    comprehensionLevel: z.number().min(0).max(100),
    engagementLevel: z.number().min(0).max(100),
    completionLikelihood: z.number().min(0).max(100),
  }),
});

export type LearnerProfile = z.infer<typeof LearnerProfileSchema>;

/**
 * Default behavior profiles with predefined characteristics
 */
export const LEARNER_BEHAVIOR_PROFILES: Record<
  LearnerBehaviorType,
  Omit<LearnerProfile, 'id' | 'email'>
> = {
  diligent: {
    name: 'Alex Diligent',
    behaviorType: 'diligent',
    attributes: {
      attentionSpan: 95,
      comprehensionLevel: 90,
      engagementLevel: 95,
      completionLikelihood: 100,
    },
  },
  explorer: {
    name: 'Jordan Explorer',
    behaviorType: 'explorer',
    attributes: {
      attentionSpan: 70,
      comprehensionLevel: 85,
      engagementLevel: 80,
      completionLikelihood: 75,
    },
  },
  struggler: {
    name: 'Casey Struggler',
    behaviorType: 'struggler',
    attributes: {
      attentionSpan: 50,
      comprehensionLevel: 45,
      engagementLevel: 60,
      completionLikelihood: 40,
    },
  },
  speedster: {
    name: 'Morgan Speedster',
    behaviorType: 'speedster',
    attributes: {
      attentionSpan: 40,
      comprehensionLevel: 70,
      engagementLevel: 50,
      completionLikelihood: 85,
    },
  },
  dropout: {
    name: 'Taylor Dropout',
    behaviorType: 'dropout',
    attributes: {
      attentionSpan: 20,
      comprehensionLevel: 55,
      engagementLevel: 25,
      completionLikelihood: 15,
    },
  },
};

// ============================================================================
// INTERACTION TYPES
// ============================================================================

/**
 * Schema for block interaction result
 */
export const BlockInteractionSchema = z.object({
  blockId: z.string(),
  blockType: z.enum(['text', 'video', 'quiz', 'interactive', 'scenario', 'assessment']),
  startedAt: z.string().datetime(),
  completedAt: z.string().datetime().optional(),
  durationSeconds: z.number().int().nonnegative(),
  completed: z.boolean(),
  score: z.number().min(0).max(100).optional(),
  attempts: z.number().int().positive().optional(),
  response: z.string().optional(),
});

export type BlockInteraction = z.infer<typeof BlockInteractionSchema>;

/**
 * Schema for assessment result
 */
export const AssessmentResultSchema = z.object({
  assessmentId: z.string(),
  learnerId: z.string(),
  startedAt: z.string().datetime(),
  completedAt: z.string().datetime(),
  score: z.number().min(0).max(100),
  passed: z.boolean(),
  passingScore: z.number().min(0).max(100),
  attempts: z.number().int().positive(),
  questionResults: z.array(
    z.object({
      questionId: z.string(),
      correct: z.boolean(),
      response: z.string(),
      timeSpentSeconds: z.number().int().nonnegative(),
    }),
  ),
});

export type AssessmentResult = z.infer<typeof AssessmentResultSchema>;

/**
 * Schema for course consumption result
 */
export const CourseConsumptionSchema = z.object({
  courseId: z.string(),
  learnerId: z.string(),
  startedAt: z.string().datetime(),
  completedAt: z.string().datetime().optional(),
  progress: z.number().min(0).max(100),
  completed: z.boolean(),
  totalTimeSeconds: z.number().int().nonnegative(),
  blockInteractions: z.array(BlockInteractionSchema),
  assessmentResults: z.array(AssessmentResultSchema).optional(),
});

export type CourseConsumption = z.infer<typeof CourseConsumptionSchema>;

// ============================================================================
// DEMO SCENARIO TYPES
// ============================================================================

/**
 * Schema for demo scenario configuration
 */
export const DemoScenarioSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  courseConfig: z.object({
    topic: z.string(),
    industry: z.string(),
    targetAudience: z.string(),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
    moduleCount: z.number().int().min(1).max(5),
    lessonsPerModule: z.number().int().min(1).max(5),
  }),
  learnerProfiles: z.array(z.enum(['diligent', 'explorer', 'struggler', 'speedster', 'dropout'])),
  simulateRealTime: z.boolean().default(false),
  generateXAPIStatements: z.boolean().default(true),
});

export type DemoScenario = z.infer<typeof DemoScenarioSchema>;

/**
 * Schema for demo execution result
 */
export const DemoResultSchema = z.object({
  scenarioId: z.string(),
  startedAt: z.string().datetime(),
  completedAt: z.string().datetime(),
  course: FullCourseSchema,
  learnerResults: z.array(CourseConsumptionSchema),
  xapiStatementCount: z.number().int().nonnegative(),
  summary: z.object({
    totalLearners: z.number().int().positive(),
    completedLearners: z.number().int().nonnegative(),
    averageProgress: z.number().min(0).max(100),
    averageScore: z.number().min(0).max(100).optional(),
    totalXAPIStatements: z.number().int().nonnegative(),
  }),
});

export type DemoResult = z.infer<typeof DemoResultSchema>;

// ============================================================================
// AGENT CONFIGURATION TYPES
// ============================================================================

/**
 * Designer Agent configuration
 */
export interface DesignerAgentConfig {
  model?: string;
  temperature?: number;
  maxRetries?: number;
  baseUrl?: string;
}

/**
 * Learner Agent configuration
 */
export interface LearnerAgentConfig {
  simulateDelay?: boolean;
  baseDelayMs?: number;
  variancePercent?: number;
}

/**
 * Demo Orchestrator configuration
 */
export interface DemoOrchestratorConfig {
  designerConfig?: DesignerAgentConfig;
  learnerConfig?: LearnerAgentConfig;
  storeStatements?: boolean;
  organizationId?: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

/**
 * Standard API response for demo endpoints
 */
export interface DemoAPIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  meta: {
    timestamp: string;
    durationMs?: number;
  };
}

/**
 * Run demo request body
 */
export const RunDemoRequestSchema = z.object({
  scenarioId: z.string(),
  options: z
    .object({
      simulateRealTime: z.boolean().optional(),
      generateXAPIStatements: z.boolean().optional(),
      storeStatements: z.boolean().optional(),
      organizationId: z.string().optional(),
    })
    .optional(),
});

export type RunDemoRequest = z.infer<typeof RunDemoRequestSchema>;
