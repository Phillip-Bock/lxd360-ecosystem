/**
 * Modality Swap Recipe
 *
 * Records AI-driven modality adaptations with EU AI Act compliance.
 *
 * @module @inspire/xapi-client/recipes/modality-recipe
 */

import { type ConsentTier, type ContentModality, INSPIRE_EXTENSIONS } from '@inspire/types';
import { v4 as uuidv4 } from 'uuid';
import type { Actor, Statement } from '../schemas';
import { ACTIVITY_TYPES } from '../schemas/activity';
import { INSPIRE_VERBS } from '../schemas/verb';

// ============================================================================
// INPUT TYPE
// ============================================================================

export interface ModalitySwapInput {
  actor: Actor;
  contentBlockId: string;
  contentBlockName: string;
  skillId: string;

  // Swap details
  fromModality: ContentModality;
  toModality: ContentModality;
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

// ============================================================================
// RECIPE FUNCTION
// ============================================================================

/**
 * Create an xAPI statement for AI-driven modality adaptation.
 * Critical for EU AI Act transparency requirements.
 */
export function createModalitySwapStatement(input: ModalitySwapInput): Statement {
  const verb = input.learnerOverride ? INSPIRE_VERBS.overrode : INSPIRE_VERBS.adapted;

  return {
    id: uuidv4(),
    actor: input.actor,
    verb,
    object: {
      objectType: 'Activity',
      id: `https://lxd360.com/content-blocks/${input.contentBlockId}`,
      definition: {
        type: ACTIVITY_TYPES.contentBlock,
        name: { 'en-US': input.contentBlockName },
        extensions: {
          [INSPIRE_EXTENSIONS.SKILL_ID]: input.skillId,
          [INSPIRE_EXTENSIONS.MODALITY]: input.toModality,
          'https://lxd360.com/xapi/extensions/from-modality': input.fromModality,
        },
      },
    },
    result: {
      response: input.reason,
      extensions: {
        [INSPIRE_EXTENSIONS.AI_RECOMMENDED]: true,
        'https://lxd360.com/xapi/extensions/ai-model-version': input.aiModelVersion,
        'https://lxd360.com/xapi/extensions/ai-confidence': input.aiConfidence,
        'https://lxd360.com/xapi/extensions/ai-explanation-id': input.aiExplanationId,
        ...(input.learnerOverride !== undefined && {
          [INSPIRE_EXTENSIONS.LEARNER_OVERRIDE]: input.learnerOverride,
        }),
        ...(input.overrideReason && {
          'https://lxd360.com/xapi/extensions/override-reason': input.overrideReason,
        }),
      },
    },
    context: {
      registration: input.sessionId,
      platform: 'INSPIRE Ignite',
      contextActivities: {
        parent: [
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
