/**
 * Content Block Interaction Recipe
 *
 * Records interactions with INSPIRE Studio content blocks.
 *
 * @module @inspire/xapi-client/recipes/content-block-recipe
 */

import { type ConsentTier, type ContentModality, INSPIRE_EXTENSIONS } from '@inspire/types';
import { v4 as uuidv4 } from 'uuid';
import type { Actor, Result, Statement } from '../schemas';
import { ACTIVITY_TYPES } from '../schemas/activity';
import { formatDuration } from '../schemas/result';
import { ADL_VERBS } from '../schemas/verb';

// ============================================================================
// INPUT TYPE
// ============================================================================

export type DepthLevel = 1 | 2 | 3 | 4 | 5;
export type ContentBlockVerb = 'launched' | 'completed' | 'experienced' | 'progressed';

export interface ContentBlockInteractionInput {
  actor: Actor;
  blockId: string;
  blockType: string;
  blockName: string;

  // Interaction
  verb: ContentBlockVerb;
  completion?: boolean;
  progress?: number; // 0-1
  durationMs?: number;
  depth?: DepthLevel;
  modality: ContentModality;

  // Context
  sessionId: string;
  courseId: string;
  lessonId: string;
  skillId?: string;
  tenantId: string;
  consentTier: ConsentTier;
}

// ============================================================================
// RECIPE FUNCTION
// ============================================================================

/**
 * Create an xAPI statement for content block interaction.
 */
export function createContentBlockStatement(input: ContentBlockInteractionInput): Statement {
  const verbMap = {
    launched: ADL_VERBS.launched,
    completed: ADL_VERBS.completed,
    experienced: ADL_VERBS.experienced,
    progressed: ADL_VERBS.progressed,
  };

  let result: Result | undefined;
  if (
    input.completion !== undefined ||
    input.progress !== undefined ||
    input.durationMs !== undefined
  ) {
    result = {
      completion: input.completion,
      extensions: {
        [INSPIRE_EXTENSIONS.DEPTH]: input.depth,
        [INSPIRE_EXTENSIONS.MODALITY]: input.modality,
        ...(input.progress !== undefined && {
          'https://lxd360.com/xapi/extensions/progress': input.progress,
        }),
      },
    };

    if (input.durationMs) {
      result.duration = formatDuration(input.durationMs / 1000);
    }
  }

  return {
    id: uuidv4(),
    actor: input.actor,
    verb: verbMap[input.verb],
    object: {
      objectType: 'Activity',
      id: `https://lxd360.com/content-blocks/${input.blockId}`,
      definition: {
        type: ACTIVITY_TYPES.contentBlock,
        name: { 'en-US': input.blockName },
        extensions: {
          [INSPIRE_EXTENSIONS.BLOCK_TYPE]: input.blockType,
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
        parent: [
          {
            objectType: 'Activity',
            id: `https://lxd360.com/lessons/${input.lessonId}`,
            definition: { type: ACTIVITY_TYPES.lesson },
          },
        ],
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
