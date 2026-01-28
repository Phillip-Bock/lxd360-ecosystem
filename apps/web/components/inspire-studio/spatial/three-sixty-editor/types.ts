'use client';

import { z } from 'zod';

// =============================================================================
// 360° Editor Types
// =============================================================================
// Types for the 360° Neural-Spatial Editor including hotspots, scenes, and tours.
// =============================================================================

// =============================================================================
// Vector3 Schema
// =============================================================================

export const Vector3Schema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number(),
});
export type Vector3 = z.infer<typeof Vector3Schema>;

// =============================================================================
// Hotspot Types
// =============================================================================

export const HotspotTypeSchema = z.enum([
  'info_popup', // Simple text/image popup
  'audio_spatial', // Positional audio source
  'navigation', // Jump to another scene
  'quiz_block', // Opens a Logic Quiz block
  'sim_trigger', // Starts a simulation
]);
export type HotspotType = z.infer<typeof HotspotTypeSchema>;

export const InteractionTriggerSchema = z.enum(['click', 'gaze', 'proximity']);
export type InteractionTrigger = z.infer<typeof InteractionTriggerSchema>;

export const HotspotSchema = z.object({
  id: z.string().uuid(),
  position: Vector3Schema,
  type: HotspotTypeSchema,
  label: z.string().optional(),
  description: z.string().optional(),
  linkedBlockId: z.string().optional(),
  linkedSceneId: z.string().optional(),
  audioSrc: z.string().url().optional(),
  interactionTrigger: InteractionTriggerSchema.default('click'),
  xapiVerb: z.string().default('interacted'),
  iconColor: z.string().optional(),
  iconScale: z.number().min(0.1).max(5).default(1),
});
export type Hotspot = z.infer<typeof HotspotSchema>;

// =============================================================================
// Scene Schema
// =============================================================================

export const ThreeSixtySceneSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  assetUrl: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  initialHeading: Vector3Schema.default({ x: 0, y: 0, z: 0 }),
  isGuided: z.boolean().default(false),
  tourSequence: z.array(z.string()).optional(), // Hotspot IDs in order
  hotspots: z.array(HotspotSchema).default([]),
  ambientAudioSrc: z.string().url().optional(),
  ambientAudioVolume: z.number().min(0).max(1).default(0.5),
  metadata: z
    .object({
      description: z.string().optional(),
      duration: z.number().optional(), // Estimated viewing time in seconds
      cognitiveLoad: z.number().min(1).max(10).optional(),
    })
    .optional(),
});
export type ThreeSixtyScene = z.infer<typeof ThreeSixtySceneSchema>;

// =============================================================================
// Editor State
// =============================================================================

export interface EditorState {
  scene: ThreeSixtyScene | null;
  selectedHotspotId: string | null;
  isPlacingHotspot: boolean;
  newHotspotType: HotspotType;
  cameraPosition: Vector3;
  cameraRotation: Vector3;
  zoom: number;
  isPreviewMode: boolean;
  showGrid: boolean;
  showHotspotLabels: boolean;
}

export const defaultEditorState: EditorState = {
  scene: null,
  selectedHotspotId: null,
  isPlacingHotspot: false,
  newHotspotType: 'info_popup',
  cameraPosition: { x: 0, y: 0, z: 0 },
  cameraRotation: { x: 0, y: 0, z: 0 },
  zoom: 1,
  isPreviewMode: false,
  showGrid: false,
  showHotspotLabels: true,
};

// =============================================================================
// Tour State
// =============================================================================

export interface TourState {
  isPlaying: boolean;
  currentStopIndex: number;
  totalStops: number;
  autoAdvance: boolean;
  autoAdvanceDelay: number; // ms
}

export const defaultTourState: TourState = {
  isPlaying: false,
  currentStopIndex: 0,
  totalStops: 0,
  autoAdvance: false,
  autoAdvanceDelay: 5000,
};

// =============================================================================
// Camera Animation
// =============================================================================

export interface CameraAnimation {
  from: Vector3;
  to: Vector3;
  duration: number;
  easing: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';
}

// =============================================================================
// xAPI Spatial Verbs
// =============================================================================

export const SPATIAL_VERBS = {
  INITIALIZED: {
    id: 'http://adlnet.gov/expapi/verbs/initialized',
    display: { 'en-US': 'initialized' },
  },
  EXPLORED: {
    id: 'https://w3id.org/xapi/tla/verbs/explored',
    display: { 'en-US': 'explored' },
  },
  FOCUSED: {
    id: 'https://w3id.org/xapi/tla/verbs/focused',
    display: { 'en-US': 'focused' },
  },
  INTERACTED: {
    id: 'http://adlnet.gov/expapi/verbs/interacted',
    display: { 'en-US': 'interacted' },
  },
  COMPLETED: {
    id: 'http://adlnet.gov/expapi/verbs/completed',
    display: { 'en-US': 'completed' },
  },
  NAVIGATED: {
    id: 'https://w3id.org/xapi/tla/verbs/navigated',
    display: { 'en-US': 'navigated' },
  },
} as const;

// =============================================================================
// Spatial Extensions
// =============================================================================

export const SPATIAL_EXTENSIONS = {
  SCENE_ID: 'https://inspire.lxd360.com/xapi/extensions/spatial/scene-id',
  HOTSPOT_ID: 'https://inspire.lxd360.com/xapi/extensions/spatial/hotspot-id',
  POSITION: 'https://inspire.lxd360.com/xapi/extensions/spatial/position',
  DWELL_TIME: 'https://inspire.lxd360.com/xapi/extensions/spatial/dwell-time',
  TOUR_MODE: 'https://inspire.lxd360.com/xapi/extensions/spatial/tour-mode',
  TOUR_STOP: 'https://inspire.lxd360.com/xapi/extensions/spatial/tour-stop',
  VIEW_DIRECTION: 'https://inspire.lxd360.com/xapi/extensions/spatial/view-direction',
} as const;

// =============================================================================
// Props Types
// =============================================================================

export interface ThreeSixtyEditorProps {
  scene?: ThreeSixtyScene;
  onSceneChange?: (scene: ThreeSixtyScene) => void;
  onHotspotSelect?: (hotspotId: string | null) => void;
  onHotspotAdd?: (hotspot: Hotspot) => void;
  onHotspotUpdate?: (hotspotId: string, updates: Partial<Hotspot>) => void;
  onHotspotDelete?: (hotspotId: string) => void;
  className?: string;
}

export interface ThreeSixtyPlayerProps {
  scene: ThreeSixtyScene;
  autoStart?: boolean;
  showControls?: boolean;
  onHotspotInteract?: (hotspotId: string, type: HotspotType) => void;
  onTourComplete?: () => void;
  onSceneComplete?: (duration: number) => void;
  className?: string;
}

export interface HotspotMarkerProps {
  hotspot: Hotspot;
  isSelected?: boolean;
  isEditing?: boolean;
  onClick?: () => void;
  onPositionChange?: (position: Vector3) => void;
}

export interface HotspotConfigProps {
  hotspot: Hotspot;
  onUpdate: (updates: Partial<Hotspot>) => void;
  onDelete: () => void;
  availableScenes?: Array<{ id: string; title: string }>;
  availableBlocks?: Array<{ id: string; type: string; label: string }>;
}
