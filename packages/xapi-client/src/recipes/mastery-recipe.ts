/**
 * Skill Mastery Achievement Recipe
 *
 * Records skill mastery achievements with SM-2 scheduling data.
 *
 * @module @inspire/xapi-client/recipes/mastery-recipe
 */

import { type ConsentTier, INSPIRE_EXTENSIONS } from '@inspire/types';
import { v4 as uuidv4 } from 'uuid';
import type { Actor, Statement } from '../schemas';
import { ACTIVITY_TYPES } from '../schemas/activity';
import { ADL_VERBS } from '../schemas/verb';
import type { MasteryLevel } from './assessment-recipe';

// ============================================================================
// INPUT TYPE
// ============================================================================

export interface SkillMasteryInput {
  actor: Actor;
  skillId: string;
  skillName: string;

  // Mastery
  masteryLevel: MasteryLevel;
  masteryProbability: number;
  totalAttempts: number;
  successRate: number;

  // SM-2 Spaced Repetition
  easinessFactor: number;
  intervalDays: number;
  nextReviewDue: string;

  // Context
  sessionId: string;
  courseId: string;
  tenantId: string;
  consentTier: ConsentTier;
}

// ============================================================================
// RECIPE FUNCTION
// ============================================================================

/**
 * Create an xAPI statement for skill mastery achievement.
 */
export function createSkillMasteryStatement(input: SkillMasteryInput): Statement {
  return {
    id: uuidv4(),
    actor: input.actor,
    verb: ADL_VERBS.mastered,
    object: {
      objectType: 'Activity',
      id: `https://lxd360.com/skills/${input.skillId}`,
      definition: {
        type: ACTIVITY_TYPES.skill,
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
        [INSPIRE_EXTENSIONS.SKILL_ID]: input.skillId,
        [INSPIRE_EXTENSIONS.MASTERY_ESTIMATE]: input.masteryProbability,
        [INSPIRE_EXTENSIONS.MASTERY_LEVEL]: input.masteryLevel,
        'https://lxd360.com/xapi/extensions/total-attempts': input.totalAttempts,
        'https://lxd360.com/xapi/extensions/success-rate': input.successRate,
        [INSPIRE_EXTENSIONS.EASINESS_FACTOR]: input.easinessFactor,
        [INSPIRE_EXTENSIONS.REVIEW_INTERVAL]: input.intervalDays,
        'https://lxd360.com/xapi/extensions/next-review': input.nextReviewDue,
      },
    },
    context: {
      registration: input.sessionId,
      platform: 'INSPIRE Ignite',
      contextActivities: {
        grouping: [
          {
            objectType: 'Activity',
            id: `https://lxd360.com/courses/${input.courseId}`,
            definition: { type: ACTIVITY_TYPES.course },
          },
        ],
      },
      extensions: {
        [INSPIRE_EXTENSIONS.SESSION_ID]: input.sessionId,
        [INSPIRE_EXTENSIONS.CONSENT_TIER]: input.consentTier,
      },
    },
    timestamp: new Date().toISOString(),
    version: '1.0.3',
  };
}
