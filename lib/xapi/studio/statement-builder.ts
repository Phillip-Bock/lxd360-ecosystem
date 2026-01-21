'use client';

import { v4 as uuidv4 } from 'uuid';
import type { Activity, Actor, Statement, Verb } from '../types';
import {
  type BlockActionOptions,
  buildStudioContextExtensions,
  getStudioVerb,
  type InspirePhase,
  STUDIO_ACTIVITY_TYPES,
  type StudioStatementOptions,
} from './types';

// =============================================================================
// INSPIRE Studio Statement Builder
// =============================================================================
// Builds xAPI statements for content authoring activities in INSPIRE Studio.
// =============================================================================

/**
 * Build an activity object for a mission
 */
export function buildMissionActivity(missionId: string, missionName?: string): Activity {
  return {
    objectType: 'Activity',
    id: `https://inspire.lxd360.com/missions/${missionId}`,
    definition: {
      type: STUDIO_ACTIVITY_TYPES.MISSION,
      name: missionName ? { 'en-US': missionName } : undefined,
    },
  };
}

/**
 * Build an activity object for a phase
 */
export function buildPhaseActivity(missionId: string, phase: InspirePhase): Activity {
  const phaseNames: Record<InspirePhase, string> = {
    encoding: 'Encoding Phase',
    synthesization: 'Synthesization Phase',
    assimilation: 'Assimilation Phase',
    audit: 'Audit Phase',
  };

  return {
    objectType: 'Activity',
    id: `https://inspire.lxd360.com/missions/${missionId}/phases/${phase}`,
    definition: {
      type: STUDIO_ACTIVITY_TYPES.PHASE,
      name: { 'en-US': phaseNames[phase] },
    },
  };
}

/**
 * Build an activity object for a step
 */
export function buildStepActivity(
  missionId: string,
  phase: InspirePhase,
  step: string,
  stepName?: string,
): Activity {
  return {
    objectType: 'Activity',
    id: `https://inspire.lxd360.com/missions/${missionId}/phases/${phase}/steps/${step}`,
    definition: {
      type: STUDIO_ACTIVITY_TYPES.STEP,
      name: stepName ? { 'en-US': stepName } : { 'en-US': `Step ${step}` },
    },
  };
}

/**
 * Build an activity object for a canvas
 */
export function buildCanvasActivity(missionId: string): Activity {
  return {
    objectType: 'Activity',
    id: `https://inspire.lxd360.com/missions/${missionId}/canvas`,
    definition: {
      type: STUDIO_ACTIVITY_TYPES.CANVAS,
      name: { 'en-US': 'Course Canvas' },
    },
  };
}

/**
 * Build an activity object for a content block
 */
export function buildBlockActivity(
  missionId: string,
  blockId: string,
  blockType: string,
): Activity {
  return {
    objectType: 'Activity',
    id: `https://inspire.lxd360.com/missions/${missionId}/blocks/${blockId}`,
    definition: {
      type: STUDIO_ACTIVITY_TYPES.BLOCK,
      name: { 'en-US': blockType },
      extensions: {
        'https://inspire.lxd360.com/xapi/extensions/studio/block-type': blockType,
      },
    },
  };
}

/**
 * Build an activity object for an export package
 */
export function buildExportActivity(missionId: string, exportId: string, format: string): Activity {
  return {
    objectType: 'Activity',
    id: `https://inspire.lxd360.com/missions/${missionId}/exports/${exportId}`,
    definition: {
      type: STUDIO_ACTIVITY_TYPES.EXPORT_PACKAGE,
      name: { 'en-US': `${format.toUpperCase()} Export` },
    },
  };
}

/**
 * Build an activity object for an audit report
 */
export function buildAuditActivity(missionId: string, auditId: string): Activity {
  return {
    objectType: 'Activity',
    id: `https://inspire.lxd360.com/missions/${missionId}/audits/${auditId}`,
    definition: {
      type: STUDIO_ACTIVITY_TYPES.AUDIT_REPORT,
      name: { 'en-US': 'QA Audit Report' },
    },
  };
}

// =============================================================================
// Statement Builders
// =============================================================================

/**
 * Build a complete xAPI statement for a studio action
 */
export function buildStudioStatement(
  actor: Actor,
  verb: Verb,
  activity: Activity,
  options: StudioStatementOptions,
): Statement {
  const contextExtensions = buildStudioContextExtensions(options);

  return {
    id: uuidv4(),
    actor,
    verb,
    object: activity,
    version: '1.0.3',
    context: {
      platform: 'INSPIRE Studio',
      language: 'en-US',
      contextActivities: {
        parent: [buildMissionActivity(options.missionId)],
        grouping: options.phase
          ? [buildPhaseActivity(options.missionId, options.phase)]
          : undefined,
      },
      extensions: Object.keys(contextExtensions).length > 0 ? contextExtensions : undefined,
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Build a statement for creating a block
 */
export function buildBlockCreatedStatement(actor: Actor, options: BlockActionOptions): Statement {
  return buildStudioStatement(
    actor,
    getStudioVerb('created'),
    buildBlockActivity(options.missionId, options.blockId, options.blockType),
    {
      missionId: options.missionId,
      phase: options.phase,
      blockType: options.blockType,
      blockId: options.blockId,
      additionalExtensions: options.newPosition
        ? {
            'https://inspire.lxd360.com/xapi/extensions/studio/position': options.newPosition,
          }
        : undefined,
    },
  );
}

/**
 * Build a statement for editing a block
 */
export function buildBlockEditedStatement(actor: Actor, options: BlockActionOptions): Statement {
  const extensions: Record<string, unknown> = {};

  if (options.contentChanges) {
    extensions['https://inspire.lxd360.com/xapi/extensions/studio/content-changes'] =
      options.contentChanges;
  }
  if (options.configChanges) {
    extensions['https://inspire.lxd360.com/xapi/extensions/studio/config-changes'] =
      options.configChanges;
  }

  return buildStudioStatement(
    actor,
    getStudioVerb('edited'),
    buildBlockActivity(options.missionId, options.blockId, options.blockType),
    {
      missionId: options.missionId,
      phase: options.phase,
      blockType: options.blockType,
      blockId: options.blockId,
      additionalExtensions: Object.keys(extensions).length > 0 ? extensions : undefined,
    },
  );
}

/**
 * Build a statement for deleting a block
 */
export function buildBlockDeletedStatement(actor: Actor, options: BlockActionOptions): Statement {
  return buildStudioStatement(
    actor,
    getStudioVerb('deleted'),
    buildBlockActivity(options.missionId, options.blockId, options.blockType),
    {
      missionId: options.missionId,
      phase: options.phase,
      blockType: options.blockType,
      blockId: options.blockId,
    },
  );
}

/**
 * Build a statement for moving a block
 */
export function buildBlockMovedStatement(actor: Actor, options: BlockActionOptions): Statement {
  const extensions: Record<string, unknown> = {};

  if (options.previousPosition) {
    extensions['https://inspire.lxd360.com/xapi/extensions/studio/previous-position'] =
      options.previousPosition;
  }
  if (options.newPosition) {
    extensions['https://inspire.lxd360.com/xapi/extensions/studio/new-position'] =
      options.newPosition;
  }

  return buildStudioStatement(
    actor,
    getStudioVerb('moved'),
    buildBlockActivity(options.missionId, options.blockId, options.blockType),
    {
      missionId: options.missionId,
      phase: options.phase,
      blockType: options.blockType,
      blockId: options.blockId,
      additionalExtensions: extensions,
    },
  );
}

/**
 * Build a statement for resizing a block
 */
export function buildBlockResizedStatement(actor: Actor, options: BlockActionOptions): Statement {
  const extensions: Record<string, unknown> = {};

  if (options.previousSize) {
    extensions['https://inspire.lxd360.com/xapi/extensions/studio/previous-size'] =
      options.previousSize;
  }
  if (options.newSize) {
    extensions['https://inspire.lxd360.com/xapi/extensions/studio/new-size'] = options.newSize;
  }

  return buildStudioStatement(
    actor,
    getStudioVerb('resized'),
    buildBlockActivity(options.missionId, options.blockId, options.blockType),
    {
      missionId: options.missionId,
      phase: options.phase,
      blockType: options.blockType,
      blockId: options.blockId,
      additionalExtensions: extensions,
    },
  );
}

/**
 * Build a statement for phase completion
 */
export function buildPhaseCompletedStatement(
  actor: Actor,
  missionId: string,
  phase: InspirePhase,
  options?: Partial<StudioStatementOptions>,
): Statement {
  return {
    id: uuidv4(),
    actor,
    verb: {
      id: 'http://adlnet.gov/expapi/verbs/completed',
      display: { 'en-US': 'completed' },
    },
    object: buildPhaseActivity(missionId, phase),
    version: '1.0.3',
    context: {
      platform: 'INSPIRE Studio',
      language: 'en-US',
      contextActivities: {
        parent: [buildMissionActivity(missionId)],
      },
      extensions: options
        ? buildStudioContextExtensions({ missionId, phase, ...options })
        : undefined,
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Build a statement for publishing/exporting
 */
export function buildExportStatement(
  actor: Actor,
  missionId: string,
  exportId: string,
  options: StudioStatementOptions,
): Statement {
  return buildStudioStatement(
    actor,
    getStudioVerb('exported'),
    buildExportActivity(missionId, exportId, options.export?.format ?? 'unknown'),
    options,
  );
}

/**
 * Build a statement for QA audit
 */
export function buildAuditStatement(
  actor: Actor,
  missionId: string,
  auditId: string,
  action: 'validated' | 'approved' | 'rejected',
  options?: Partial<StudioStatementOptions>,
): Statement {
  return buildStudioStatement(
    actor,
    getStudioVerb(action),
    buildAuditActivity(missionId, auditId),
    { missionId, phase: 'audit', ...options },
  );
}

/**
 * Build a statement for AI content generation
 */
export function buildAIGenerationStatement(
  actor: Actor,
  missionId: string,
  blockId: string,
  blockType: string,
  options: StudioStatementOptions,
): Statement {
  return buildStudioStatement(
    actor,
    getStudioVerb('generated'),
    buildBlockActivity(missionId, blockId, blockType),
    {
      ...options,
      ai: {
        generated: true,
        ...options.ai,
      },
    },
  );
}
