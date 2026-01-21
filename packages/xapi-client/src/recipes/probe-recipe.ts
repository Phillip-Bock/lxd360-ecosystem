/**
 * Intelligent Probe Recipe
 *
 * Used during cold-start to establish learner baseline.
 *
 * @module @inspire/xapi-client/recipes/probe-recipe
 */

import { type ConsentTier, INSPIRE_EXTENSIONS } from '@inspire/types';
import { v4 as uuidv4 } from 'uuid';
import type { Actor, Statement } from '../schemas';
import { ACTIVITY_TYPES } from '../schemas/activity';
import { formatDuration } from '../schemas/result';
import { INSPIRE_VERBS } from '../schemas/verb';

// ============================================================================
// INPUT TYPE
// ============================================================================

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

// ============================================================================
// RECIPE FUNCTION
// ============================================================================

/**
 * Create an xAPI statement for an intelligent probe response.
 * Used during cold-start to establish learner baseline.
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
    consentTier,
    dataResidency,
  } = input;

  const statement: Statement = {
    id: uuidv4(),
    actor,
    verb: INSPIRE_VERBS.probed,
    object: {
      objectType: 'Activity',
      id: `https://lxd360.com/probes/${probeId}`,
      definition: {
        type: ACTIVITY_TYPES.probe,
        name: { 'en-US': probeName },
        description: { 'en-US': `Baseline probe for skill: ${skillName}` },
        extensions: {
          [INSPIRE_EXTENSIONS.SKILL_ID]: skillId,
        },
      },
    },
    result: {
      success: correct,
      completion: true,
      duration: formatDuration(responseTimeMs / 1000),
      response: selectedAnswer,
      extensions: {
        [INSPIRE_EXTENSIONS.LATENCY]: responseTimeMs,
        ...(confidenceRating !== undefined && {
          'https://lxd360.com/xapi/extensions/confidence-rating': confidenceRating,
        }),
        ...(distractorsTouched &&
          distractorsTouched.length > 0 && {
            'https://lxd360.com/xapi/extensions/distractors-touched': distractorsTouched,
          }),
      },
    },
    context: {
      registration: sessionId,
      platform: 'INSPIRE Ignite',
      extensions: {
        [INSPIRE_EXTENSIONS.SESSION_ID]: sessionId,
        [INSPIRE_EXTENSIONS.CONSENT_TIER]: consentTier,
        [INSPIRE_EXTENSIONS.SKILL_ID]: skillId,
        ...(dataResidency && {
          [INSPIRE_EXTENSIONS.DATA_RESIDENCY]: dataResidency,
        }),
      },
      ...(courseId && {
        contextActivities: {
          parent: [
            {
              objectType: 'Activity',
              id: `https://lxd360.com/courses/${courseId}`,
              definition: {
                type: ACTIVITY_TYPES.course,
              },
            },
          ],
        },
      }),
    },
    timestamp: new Date().toISOString(),
    version: '1.0.3',
  };

  return statement;
}
