'use client';

// =============================================================================
// xAPI Spatial Verbs
// =============================================================================
// Statement builders for 360° spatial interactions.
// =============================================================================

import { v4 as uuidv4 } from 'uuid';
import type { Statement } from '@/lib/xapi/types';
import type { Hotspot, ThreeSixtyScene, Vector3 } from '../three-sixty-editor/types';
import { SPATIAL_EXTENSIONS, SPATIAL_VERBS } from '../three-sixty-editor/types';

// =============================================================================
// Actor Helper
// =============================================================================

interface SpatialActor {
  name: string;
  mbox?: string;
  account?: {
    homePage: string;
    name: string;
  };
}

function buildActor(actor: SpatialActor) {
  return {
    objectType: 'Agent' as const,
    name: actor.name,
    mbox: actor.mbox,
    account: actor.account,
  };
}

// =============================================================================
// Activity Builders
// =============================================================================

function buildSceneActivity(scene: ThreeSixtyScene) {
  return {
    objectType: 'Activity' as const,
    id: `https://inspire.lxd360.com/spatial/scenes/${scene.id}`,
    definition: {
      type: 'https://inspire.lxd360.com/xapi/activities/360-scene',
      name: { 'en-US': scene.title },
      description: scene.metadata?.description
        ? { 'en-US': scene.metadata.description }
        : undefined,
    },
  };
}

function buildHotspotActivity(sceneId: string, hotspot: Hotspot) {
  return {
    objectType: 'Activity' as const,
    id: `https://inspire.lxd360.com/spatial/scenes/${sceneId}/hotspots/${hotspot.id}`,
    definition: {
      type: 'https://inspire.lxd360.com/xapi/activities/hotspot',
      name: hotspot.label ? { 'en-US': hotspot.label } : undefined,
    },
  };
}

// =============================================================================
// Statement Builders
// =============================================================================

/**
 * Build statement for scene initialization
 */
export function buildSceneInitializedStatement(
  actor: SpatialActor,
  scene: ThreeSixtyScene,
): Statement {
  return {
    id: uuidv4(),
    actor: buildActor(actor),
    verb: SPATIAL_VERBS.INITIALIZED,
    object: buildSceneActivity(scene),
    version: '1.0.3',
    context: {
      platform: 'INSPIRE Studio',
      language: 'en-US',
      extensions: {
        [SPATIAL_EXTENSIONS.SCENE_ID]: scene.id,
        [SPATIAL_EXTENSIONS.TOUR_MODE]: scene.isGuided ? 'guided' : 'unguided',
      },
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Build statement for exploration start
 */
export function buildExplorationStartedStatement(
  actor: SpatialActor,
  scene: ThreeSixtyScene,
  mode: 'guided' | 'unguided',
): Statement {
  return {
    id: uuidv4(),
    actor: buildActor(actor),
    verb: SPATIAL_VERBS.EXPLORED,
    object: buildSceneActivity(scene),
    version: '1.0.3',
    context: {
      platform: 'INSPIRE Studio',
      language: 'en-US',
      extensions: {
        [SPATIAL_EXTENSIONS.SCENE_ID]: scene.id,
        [SPATIAL_EXTENSIONS.TOUR_MODE]: mode,
      },
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Build statement for hotspot gaze/focus
 */
export function buildHotspotFocusedStatement(
  actor: SpatialActor,
  scene: ThreeSixtyScene,
  hotspot: Hotspot,
  dwellTime: number, // milliseconds
): Statement {
  return {
    id: uuidv4(),
    actor: buildActor(actor),
    verb: SPATIAL_VERBS.FOCUSED,
    object: buildHotspotActivity(scene.id, hotspot),
    version: '1.0.3',
    result: {
      duration: `PT${(dwellTime / 1000).toFixed(2)}S`,
    },
    context: {
      platform: 'INSPIRE Studio',
      language: 'en-US',
      contextActivities: {
        parent: [buildSceneActivity(scene)],
      },
      extensions: {
        [SPATIAL_EXTENSIONS.SCENE_ID]: scene.id,
        [SPATIAL_EXTENSIONS.HOTSPOT_ID]: hotspot.id,
        [SPATIAL_EXTENSIONS.DWELL_TIME]: dwellTime,
        [SPATIAL_EXTENSIONS.POSITION]: hotspot.position,
      },
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Build statement for hotspot interaction
 */
export function buildHotspotInteractedStatement(
  actor: SpatialActor,
  scene: ThreeSixtyScene,
  hotspot: Hotspot,
  interactionType: 'click' | 'gaze' | 'proximity',
): Statement {
  return {
    id: uuidv4(),
    actor: buildActor(actor),
    verb: SPATIAL_VERBS.INTERACTED,
    object: buildHotspotActivity(scene.id, hotspot),
    version: '1.0.3',
    context: {
      platform: 'INSPIRE Studio',
      language: 'en-US',
      contextActivities: {
        parent: [buildSceneActivity(scene)],
      },
      extensions: {
        [SPATIAL_EXTENSIONS.SCENE_ID]: scene.id,
        [SPATIAL_EXTENSIONS.HOTSPOT_ID]: hotspot.id,
        [SPATIAL_EXTENSIONS.POSITION]: hotspot.position,
        'https://inspire.lxd360.com/xapi/extensions/spatial/interaction-type': interactionType,
        'https://inspire.lxd360.com/xapi/extensions/spatial/hotspot-type': hotspot.type,
      },
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Build statement for scene navigation
 */
export function buildSceneNavigatedStatement(
  actor: SpatialActor,
  fromScene: ThreeSixtyScene,
  toScene: ThreeSixtyScene,
  triggerHotspot?: Hotspot,
): Statement {
  return {
    id: uuidv4(),
    actor: buildActor(actor),
    verb: SPATIAL_VERBS.NAVIGATED,
    object: buildSceneActivity(toScene),
    version: '1.0.3',
    context: {
      platform: 'INSPIRE Studio',
      language: 'en-US',
      contextActivities: {
        parent: [buildSceneActivity(fromScene)],
      },
      extensions: {
        [SPATIAL_EXTENSIONS.SCENE_ID]: toScene.id,
        'https://inspire.lxd360.com/xapi/extensions/spatial/from-scene': fromScene.id,
        ...(triggerHotspot && {
          [SPATIAL_EXTENSIONS.HOTSPOT_ID]: triggerHotspot.id,
        }),
      },
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Build statement for tour stop reached
 */
export function buildTourStopReachedStatement(
  actor: SpatialActor,
  scene: ThreeSixtyScene,
  stopIndex: number,
  totalStops: number,
  hotspot?: Hotspot,
): Statement {
  return {
    id: uuidv4(),
    actor: buildActor(actor),
    verb: SPATIAL_VERBS.FOCUSED,
    object: hotspot ? buildHotspotActivity(scene.id, hotspot) : buildSceneActivity(scene),
    version: '1.0.3',
    result: {
      completion: stopIndex === totalStops - 1,
    },
    context: {
      platform: 'INSPIRE Studio',
      language: 'en-US',
      extensions: {
        [SPATIAL_EXTENSIONS.SCENE_ID]: scene.id,
        [SPATIAL_EXTENSIONS.TOUR_MODE]: 'guided',
        [SPATIAL_EXTENSIONS.TOUR_STOP]: `${stopIndex + 1}/${totalStops}`,
      },
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Build statement for tour/scene completion
 */
export function buildSceneCompletedStatement(
  actor: SpatialActor,
  scene: ThreeSixtyScene,
  duration: number, // milliseconds
  hotspotsVisited: number,
  totalHotspots: number,
): Statement {
  return {
    id: uuidv4(),
    actor: buildActor(actor),
    verb: SPATIAL_VERBS.COMPLETED,
    object: buildSceneActivity(scene),
    version: '1.0.3',
    result: {
      completion: true,
      duration: `PT${(duration / 1000).toFixed(2)}S`,
      score:
        totalHotspots > 0
          ? {
              scaled: hotspotsVisited / totalHotspots,
              raw: hotspotsVisited,
              min: 0,
              max: totalHotspots,
            }
          : undefined,
      extensions: {
        'https://inspire.lxd360.com/xapi/extensions/spatial/hotspots-visited': hotspotsVisited,
        'https://inspire.lxd360.com/xapi/extensions/spatial/total-hotspots': totalHotspots,
      },
    },
    context: {
      platform: 'INSPIRE Studio',
      language: 'en-US',
      extensions: {
        [SPATIAL_EXTENSIONS.SCENE_ID]: scene.id,
        [SPATIAL_EXTENSIONS.TOUR_MODE]: scene.isGuided ? 'guided' : 'unguided',
      },
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Build statement for view direction change (for analytics)
 */
export function buildViewDirectionStatement(
  actor: SpatialActor,
  scene: ThreeSixtyScene,
  direction: Vector3,
  timestamp?: string,
): Statement {
  return {
    id: uuidv4(),
    actor: buildActor(actor),
    verb: SPATIAL_VERBS.EXPLORED,
    object: buildSceneActivity(scene),
    version: '1.0.3',
    context: {
      platform: 'INSPIRE Studio',
      language: 'en-US',
      extensions: {
        [SPATIAL_EXTENSIONS.SCENE_ID]: scene.id,
        [SPATIAL_EXTENSIONS.VIEW_DIRECTION]: direction,
      },
    },
    timestamp: timestamp ?? new Date().toISOString(),
  };
}
