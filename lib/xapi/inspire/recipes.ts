// =============================================================================
// INSPIRE xAPI Recipes
// =============================================================================
// Pre-built statement patterns for common learning scenarios.
// These ensure consistent instrumentation across the platform.
// =============================================================================

import { v4 as uuidv4 } from 'uuid';
import type { Statement, Actor, Verb, Result, Context } from '../types';
import { 
  INSPIRE_EXTENSIONS, 
  type Modality, 
  type ConsentTier,
  type DepthLevel,
  type MasteryLevel,
  createInspireBehavioralExtensions,
  createInspireAIExtensions,
  createInspireSkillExtensions,
  createInspireContextExtensions,
} from './extensions';

// =============================================================================
// INSPIRE Verbs (Custom vocabulary)
// =============================================================================

export const INSPIRE_VERBS = {
  // Standard ADL verbs
  ATTEMPTED: {
    id: 'http://adlnet.gov/expapi/verbs/attempted',
    display: { 'en-US': 'attempted' },
  },
  COMPLETED: {
    id: 'http://adlnet.gov/expapi/verbs/completed',
    display: { 'en-US': 'completed' },
  },
  PASSED: {
    id: 'http://adlnet.gov/expapi/verbs/passed',
    display: { 'en-US': 'passed' },
  },
  FAILED: {
    id: 'http://adlnet.gov/expapi/verbs/failed',
    display: { 'en-US': 'failed' },
  },
  ANSWERED: {
    id: 'http://adlnet.gov/expapi/verbs/answered',
    display: { 'en-US': 'answered' },
  },
  EXPERIENCED: {
    id: 'http://adlnet.gov/expapi/verbs/experienced',
    display: { 'en-US': 'experienced' },
  },
  LAUNCHED: {
    id: 'http://adlnet.gov/expapi/verbs/launched',
    display: { 'en-US': 'launched' },
  },
  TERMINATED: {
    id: 'http://adlnet.gov/expapi/verbs/terminated',
    display: { 'en-US': 'terminated' },
  },
  PROGRESSED: {
    id: 'http://adlnet.gov/expapi/verbs/progressed',
    display: { 'en-US': 'progressed' },
  },
  
  // Video/Audio verbs
  PLAYED: {
    id: 'https://w3id.org/xapi/video/verbs/played',
    display: { 'en-US': 'played' },
  },
  PAUSED: {
    id: 'https://w3id.org/xapi/video/verbs/paused',
    display: { 'en-US': 'paused' },
  },
  SEEKED: {
    id: 'https://w3id.org/xapi/video/verbs/seeked',
    display: { 'en-US': 'seeked' },
  },
  
  // INSPIRE Custom verbs
  PROBED: {
    id: 'https://inspire.lxd360.com/xapi/verbs/probed',
    display: { 'en-US': 'was probed for baseline' },
  },
  ADAPTED: {
    id: 'https://inspire.lxd360.com/xapi/verbs/adapted',
    display: { 'en-US': 'received adaptation' },
  },
  OVERRODE: {
    id: 'https://inspire.lxd360.com/xapi/verbs/overrode',
    display: { 'en-US': 'overrode recommendation' },
  },
  MASTERED: {
    id: 'https://inspire.lxd360.com/xapi/verbs/mastered',
    display: { 'en-US': 'mastered' },
  },
  STRUGGLED: {
    id: 'https://inspire.lxd360.com/xapi/verbs/struggled',
    display: { 'en-US': 'struggled with' },
  },
  REFLECTED: {
    id: 'https://inspire.lxd360.com/xapi/verbs/reflected',
    display: { 'en-US': 'reflected on' },
  },
} as const;

// =============================================================================
// INSPIRE Activity Types
// =============================================================================

export const INSPIRE_ACTIVITY_TYPES = {
  COURSE: 'http://adlnet.gov/expapi/activities/course',
  MODULE: 'http://adlnet.gov/expapi/activities/module',
  LESSON: 'http://adlnet.gov/expapi/activities/lesson',
  ASSESSMENT: 'http://adlnet.gov/expapi/activities/assessment',
  QUESTION: 'http://adlnet.gov/expapi/activities/question',
  INTERACTION: 'http://adlnet.gov/expapi/activities/interaction',
  MEDIA: 'http://adlnet.gov/expapi/activities/media',
  
  // INSPIRE specific
  PROBE: 'https://inspire.lxd360.com/xapi/activities/probe',
  SKILL: 'https://inspire.lxd360.com/xapi/activities/skill',
  CONTENT_BLOCK: 'https://inspire.lxd360.com/xapi/activities/content-block',
  LEARNING_PATH: 'https://inspire.lxd360.com/xapi/activities/learning-path',
  REFLECTION: 'https://inspire.lxd360.com/xapi/activities/reflection',
} as const;

// =============================================================================
// Recipe: Intelligent Probe (Cold-Start Baseline)
// =============================================================================

export interface IntelligentProbeInput {
  actor: Actor;
  probeId: string;
  probeName: string;
  skillId: string;
  skillName: string;
  
  // Response data
  correct: boolean;
  responseTimeMs: number;
  confidenceRating?: number;
  selectedAnswer?: string;
  distractorsTouched?: string[];
  
  // Context
  sessionId: string;
  courseId?: string;
  tenantId: string;
  consentTier: ConsentTier;
  dataResidency?: string;
}

/**
 * Create an xAPI statement for an intelligent probe response
 * Used during cold-start to establish learner baseline
 */
export function createProbeStatement(input: IntelligentProbeInput): Statement {
  const {
    actor,
    probeId,
    probeName,
    skillId,
    skillName,
    correct,
    responseTimeMs,
    confidenceRating,
    selectedAnswer,
    distractorsTouched,
    sessionId,
    courseId,
    tenantId,
    consentTier,
    dataResidency,
  } = input;

  const result: Result = {
    success: correct,
    completion: true,
    duration: `PT${(responseTimeMs / 1000).toFixed(2)}S`,
    response: selectedAnswer,
    extensions: {
      ...createInspireBehavioralExtensions({
        latency: responseTimeMs,
        confidenceRating,
        distractorsTouched,
      }),
    },
  };

  const contextExtensions = createInspireContextExtensions({
    sessionId,
    consentTier,
    dataResidency,
  });

  const skillExtensions = createInspireSkillExtensions({
    skillId,
  });

  const context: Context = {
    registration: sessionId,
    platform: 'INSPIRE Ignite',
    extensions: {
      ...contextExtensions,
      ...skillExtensions,
    },
  };

  if (courseId) {
    context.contextActivities = {
      parent: [{
        objectType: 'Activity',
        id: `https://inspire.lxd360.com/courses/${courseId}`,
        definition: {
          type: INSPIRE_ACTIVITY_TYPES.COURSE,
        },
      }],
    };
  }

  return {
    id: uuidv4(),
    actor,
    verb: INSPIRE_VERBS.PROBED,
    object: {
      objectType: 'Activity',
      id: `https://inspire.lxd360.com/probes/${probeId}`,
      definition: {
        type: INSPIRE_ACTIVITY_TYPES.PROBE,
        name: { 'en-US': probeName },
        description: { 'en-US': `Baseline probe for skill: ${skillName}` },
        extensions: {
          [INSPIRE_EXTENSIONS.SKILL_ID]: skillId,
        },
      },
    },
    result,
    context,
    timestamp: new Date().toISOString(),
  };
}

// =============================================================================
// Recipe: Assessment Answer
// =============================================================================

export interface AssessmentAnswerInput {
  actor: Actor;
  questionId: string;
  questionText: string;
  assessmentId: string;
  assessmentName: string;
  skillId: string;
  
  // Response
  correct: boolean;
  score?: { scaled?: number; raw?: number; min?: number; max?: number };
  responseTimeMs: number;
  response: string;
  confidenceRating?: number;
  revisionCount?: number;
  distractorsTouched?: string[];
  
  // Mastery update
  masteryBefore: number;
  masteryAfter: number;
  masteryLevel: MasteryLevel;
  
  // Context
  sessionId: string;
  courseId: string;
  moduleId?: string;
  tenantId: string;
  consentTier: ConsentTier;
  
  // AI
  aiRecommended?: boolean;
  aiModelVersion?: string;
  aiExplanationId?: string;
}

/**
 * Create an xAPI statement for an assessment answer
 * Includes full behavioral telemetry and mastery tracking
 */
export function createAssessmentAnswerStatement(input: AssessmentAnswerInput): Statement {
  const result: Result = {
    success: input.correct,
    completion: true,
    score: input.score,
    duration: `PT${(input.responseTimeMs / 1000).toFixed(2)}S`,
    response: input.response,
    extensions: {
      ...createInspireBehavioralExtensions({
        latency: input.responseTimeMs,
        confidenceRating: input.confidenceRating,
        revisionCount: input.revisionCount,
        distractorsTouched: input.distractorsTouched,
      }),
      ...createInspireSkillExtensions({
        skillId: input.skillId,
        masteryEstimate: input.masteryAfter,
        masteryLevel: input.masteryLevel,
      }),
    },
  };

  const contextActivities: Context['contextActivities'] = {
    parent: [{
      objectType: 'Activity',
      id: `https://inspire.lxd360.com/assessments/${input.assessmentId}`,
      definition: {
        type: INSPIRE_ACTIVITY_TYPES.ASSESSMENT,
        name: { 'en-US': input.assessmentName },
      },
    }],
    grouping: [{
      objectType: 'Activity',
      id: `https://inspire.lxd360.com/courses/${input.courseId}`,
      definition: { type: INSPIRE_ACTIVITY_TYPES.COURSE },
    }],
  };

  if (input.moduleId) {
    contextActivities.grouping?.push({
      objectType: 'Activity',
      id: `https://inspire.lxd360.com/modules/${input.moduleId}`,
      definition: { type: INSPIRE_ACTIVITY_TYPES.MODULE },
    });
  }

  const contextExtensions: Record<string, unknown> = {
    ...createInspireContextExtensions({
      sessionId: input.sessionId,
      consentTier: input.consentTier,
    }),
    // Track mastery change for analytics
    'https://inspire.lxd360.com/xapi/extensions/mastery-before': input.masteryBefore,
    'https://inspire.lxd360.com/xapi/extensions/mastery-delta': input.masteryAfter - input.masteryBefore,
  };

  if (input.aiRecommended !== undefined) {
    Object.assign(contextExtensions, createInspireAIExtensions({
      recommended: input.aiRecommended,
      modelVersion: input.aiModelVersion,
      explanationId: input.aiExplanationId,
    }));
  }

  return {
    id: uuidv4(),
    actor: input.actor,
    verb: INSPIRE_VERBS.ANSWERED,
    object: {
      objectType: 'Activity',
      id: `https://inspire.lxd360.com/questions/${input.questionId}`,
      definition: {
        type: INSPIRE_ACTIVITY_TYPES.QUESTION,
        name: { 'en-US': input.questionText.substring(0, 100) },
        extensions: {
          [INSPIRE_EXTENSIONS.SKILL_ID]: input.skillId,
        },
      },
    },
    result,
    context: {
      registration: input.sessionId,
      platform: 'INSPIRE Ignite',
      contextActivities,
      extensions: contextExtensions,
    },
    timestamp: new Date().toISOString(),
  };
}

// =============================================================================
// Recipe: Modality Swap (AI Adaptation)
// =============================================================================

export interface ModalitySwapInput {
  actor: Actor;
  contentBlockId: string;
  contentBlockName: string;
  skillId: string;
  
  // Swap details
  fromModality: Modality;
  toModality: Modality;
  reason: string;
  
  // AI decision
  aiModelVersion: string;
  aiConfidence: number;
  aiExplanationId: string;
  
  // Did learner override?
  learnerOverride?: boolean;
  overrideReason?: string;
  
  // Context
  sessionId: string;
  courseId: string;
  tenantId: string;
  consentTier: ConsentTier;
}

/**
 * Create an xAPI statement for AI-driven modality adaptation
 * Critical for EU AI Act transparency requirements
 */
export function createModalitySwapStatement(input: ModalitySwapInput): Statement {
  const verb = input.learnerOverride ? INSPIRE_VERBS.OVERRODE : INSPIRE_VERBS.ADAPTED;

  return {
    id: uuidv4(),
    actor: input.actor,
    verb,
    object: {
      objectType: 'Activity',
      id: `https://inspire.lxd360.com/content-blocks/${input.contentBlockId}`,
      definition: {
        type: INSPIRE_ACTIVITY_TYPES.CONTENT_BLOCK,
        name: { 'en-US': input.contentBlockName },
        extensions: {
          [INSPIRE_EXTENSIONS.SKILL_ID]: input.skillId,
          [INSPIRE_EXTENSIONS.MODALITY]: input.toModality,
          'https://inspire.lxd360.com/xapi/extensions/from-modality': input.fromModality,
        },
      },
    },
    result: {
      response: input.reason,
      extensions: {
        ...createInspireAIExtensions({
          recommended: true,
          modelVersion: input.aiModelVersion,
          confidence: input.aiConfidence,
          explanationId: input.aiExplanationId,
          learnerOverride: input.learnerOverride,
          overrideReason: input.overrideReason,
        }),
      },
    },
    context: {
      registration: input.sessionId,
      platform: 'INSPIRE Ignite',
      contextActivities: {
        parent: [{
          objectType: 'Activity',
          id: `https://inspire.lxd360.com/courses/${input.courseId}`,
          definition: { type: INSPIRE_ACTIVITY_TYPES.COURSE },
        }],
      },
      extensions: createInspireContextExtensions({
        sessionId: input.sessionId,
        consentTier: input.consentTier,
      }),
    },
    timestamp: new Date().toISOString(),
  };
}

// =============================================================================
// Recipe: Content Block Interaction
// =============================================================================

export interface ContentBlockInteractionInput {
  actor: Actor;
  blockId: string;
  blockType: string;
  blockName: string;
  
  // Interaction
  verb: 'launched' | 'completed' | 'experienced' | 'progressed';
  completion?: boolean;
  progress?: number; // 0-1
  duration?: number; // ms
  depth?: DepthLevel;
  modality: Modality;
  
  // Context
  sessionId: string;
  courseId: string;
  lessonId: string;
  skillId?: string;
  tenantId: string;
  consentTier: ConsentTier;
}

/**
 * Create an xAPI statement for content block interaction
 */
export function createContentBlockStatement(input: ContentBlockInteractionInput): Statement {
  const verbMap = {
    launched: INSPIRE_VERBS.LAUNCHED,
    completed: INSPIRE_VERBS.COMPLETED,
    experienced: INSPIRE_VERBS.EXPERIENCED,
    progressed: INSPIRE_VERBS.PROGRESSED,
  };

  const result: Result | undefined = (input.completion !== undefined || input.progress !== undefined || input.duration !== undefined) ? {
    completion: input.completion,
    extensions: {
      ...createInspireBehavioralExtensions({
        depth: input.depth,
        modality: input.modality,
      }),
      ...(input.progress !== undefined && {
        'https://inspire.lxd360.com/xapi/extensions/progress': input.progress,
      }),
    },
  } : undefined;

  if (result && input.duration) {
    result.duration = `PT${(input.duration / 1000).toFixed(2)}S`;
  }

  return {
    id: uuidv4(),
    actor: input.actor,
    verb: verbMap[input.verb],
    object: {
      objectType: 'Activity',
      id: `https://inspire.lxd360.com/content-blocks/${input.blockId}`,
      definition: {
        type: INSPIRE_ACTIVITY_TYPES.CONTENT_BLOCK,
        name: { 'en-US': input.blockName },
        extensions: {
          'https://inspire.lxd360.com/xapi/extensions/block-type': input.blockType,
          [INSPIRE_EXTENSIONS.MODALITY]: input.modality,
          ...(input.skillId && { [INSPIRE_EXTENSIONS.SKILL_ID]: input.skillId }),
        },
      },
    },
    result,
    context: {
      registration: input.sessionId,
      platform: 'INSPIRE Ignite',
      contextActivities: {
        parent: [{
          objectType: 'Activity',
          id: `https://inspire.lxd360.com/lessons/${input.lessonId}`,
          definition: { type: INSPIRE_ACTIVITY_TYPES.LESSON },
        }],
        grouping: [{
          objectType: 'Activity',
          id: `https://inspire.lxd360.com/courses/${input.courseId}`,
          definition: { type: INSPIRE_ACTIVITY_TYPES.COURSE },
        }],
      },
      extensions: createInspireContextExtensions({
        sessionId: input.sessionId,
        consentTier: input.consentTier,
      }),
    },
    timestamp: new Date().toISOString(),
  };
}

// =============================================================================
// Recipe: Skill Mastery Achievement
// =============================================================================

export interface SkillMasteryInput {
  actor: Actor;
  skillId: string;
  skillName: string;
  
  // Mastery
  masteryLevel: MasteryLevel;
  masteryProbability: number;
  totalAttempts: number;
  successRate: number;
  
  // SM-2
  easinessFactor: number;
  intervalDays: number;
  nextReviewDue: string;
  
  // Context
  sessionId: string;
  courseId: string;
  tenantId: string;
  consentTier: ConsentTier;
}

/**
 * Create an xAPI statement for skill mastery achievement
 */
export function createSkillMasteryStatement(input: SkillMasteryInput): Statement {
  return {
    id: uuidv4(),
    actor: input.actor,
    verb: INSPIRE_VERBS.MASTERED,
    object: {
      objectType: 'Activity',
      id: `https://inspire.lxd360.com/skills/${input.skillId}`,
      definition: {
        type: INSPIRE_ACTIVITY_TYPES.SKILL,
        name: { 'en-US': input.skillName },
      },
    },
    result: {
      success: true,
      completion: true,
      score: {
        scaled: input.masteryProbability,
      },
      extensions: {
        ...createInspireSkillExtensions({
          skillId: input.skillId,
          masteryEstimate: input.masteryProbability,
          masteryLevel: input.masteryLevel,
        }),
        'https://inspire.lxd360.com/xapi/extensions/total-attempts': input.totalAttempts,
        'https://inspire.lxd360.com/xapi/extensions/success-rate': input.successRate,
        [INSPIRE_EXTENSIONS.SR_EASINESS_FACTOR]: input.easinessFactor,
        [INSPIRE_EXTENSIONS.SR_INTERVAL_DAYS]: input.intervalDays,
        [INSPIRE_EXTENSIONS.SR_NEXT_REVIEW]: input.nextReviewDue,
      },
    },
    context: {
      registration: input.sessionId,
      platform: 'INSPIRE Ignite',
      contextActivities: {
        grouping: [{
          objectType: 'Activity',
          id: `https://inspire.lxd360.com/courses/${input.courseId}`,
          definition: { type: INSPIRE_ACTIVITY_TYPES.COURSE },
        }],
      },
      extensions: createInspireContextExtensions({
        sessionId: input.sessionId,
        consentTier: input.consentTier,
      }),
    },
    timestamp: new Date().toISOString(),
  };
}
