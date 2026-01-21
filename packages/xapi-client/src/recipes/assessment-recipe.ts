/**
 * Assessment Answer Recipe
 *
 * Full behavioral telemetry and mastery tracking for assessment interactions.
 *
 * @module @inspire/xapi-client/recipes/assessment-recipe
 */

import { type ConsentTier, INSPIRE_EXTENSIONS } from '@inspire/types';
import { v4 as uuidv4 } from 'uuid';
import type { Actor, Context, Result, Score, Statement } from '../schemas';
import { ACTIVITY_TYPES } from '../schemas/activity';
import { formatDuration } from '../schemas/result';
import { ADL_VERBS } from '../schemas/verb';

// ============================================================================
// INPUT TYPE
// ============================================================================

export type MasteryLevel = 'novice' | 'developing' | 'proficient' | 'mastered';

export interface AssessmentAnswerInput {
  actor: Actor;
  questionId: string;
  questionText: string;
  assessmentId: string;
  assessmentName: string;
  skillId: string;

  // Response
  correct: boolean;
  score?: Partial<Score>;
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

// ============================================================================
// RECIPE FUNCTION
// ============================================================================

/**
 * Create an xAPI statement for an assessment answer.
 * Includes full behavioral telemetry and mastery tracking.
 */
export function createAssessmentAnswerStatement(input: AssessmentAnswerInput): Statement {
  const result: Result = {
    success: input.correct,
    completion: true,
    score: input.score,
    duration: formatDuration(input.responseTimeMs / 1000),
    response: input.response,
    extensions: {
      [INSPIRE_EXTENSIONS.LATENCY]: input.responseTimeMs,
      [INSPIRE_EXTENSIONS.SKILL_ID]: input.skillId,
      [INSPIRE_EXTENSIONS.MASTERY_ESTIMATE]: input.masteryAfter,
      [INSPIRE_EXTENSIONS.MASTERY_LEVEL]: input.masteryLevel,
      ...(input.confidenceRating !== undefined && {
        'https://lxd360.com/xapi/extensions/confidence-rating': input.confidenceRating,
      }),
      ...(input.revisionCount !== undefined && {
        [INSPIRE_EXTENSIONS.REVISION_COUNT]: input.revisionCount,
      }),
      ...(input.distractorsTouched &&
        input.distractorsTouched.length > 0 && {
          'https://lxd360.com/xapi/extensions/distractors-touched': input.distractorsTouched,
        }),
    },
  };

  const contextActivities: Context['contextActivities'] = {
    parent: [
      {
        objectType: 'Activity',
        id: `https://lxd360.com/assessments/${input.assessmentId}`,
        definition: {
          type: ACTIVITY_TYPES.assessment,
          name: { 'en-US': input.assessmentName },
        },
      },
    ],
    grouping: [
      {
        objectType: 'Activity',
        id: `https://lxd360.com/courses/${input.courseId}`,
        definition: { type: ACTIVITY_TYPES.course },
      },
    ],
  };

  if (input.moduleId && contextActivities.grouping) {
    contextActivities.grouping.push({
      objectType: 'Activity',
      id: `https://lxd360.com/modules/${input.moduleId}`,
      definition: { type: ACTIVITY_TYPES.module },
    });
  }

  const contextExtensions: Record<string, unknown> = {
    [INSPIRE_EXTENSIONS.SESSION_ID]: input.sessionId,
    [INSPIRE_EXTENSIONS.CONSENT_TIER]: input.consentTier,
    'https://lxd360.com/xapi/extensions/mastery-before': input.masteryBefore,
    'https://lxd360.com/xapi/extensions/mastery-delta': input.masteryAfter - input.masteryBefore,
  };

  if (input.aiRecommended !== undefined) {
    contextExtensions[INSPIRE_EXTENSIONS.AI_RECOMMENDED] = input.aiRecommended;
    if (input.aiModelVersion) {
      contextExtensions['https://lxd360.com/xapi/extensions/ai-model-version'] =
        input.aiModelVersion;
    }
    if (input.aiExplanationId) {
      contextExtensions['https://lxd360.com/xapi/extensions/ai-explanation-id'] =
        input.aiExplanationId;
    }
  }

  return {
    id: uuidv4(),
    actor: input.actor,
    verb: ADL_VERBS.answered,
    object: {
      objectType: 'Activity',
      id: `https://lxd360.com/questions/${input.questionId}`,
      definition: {
        type: ACTIVITY_TYPES.question,
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
    version: '1.0.3',
  };
}
