// =============================================================================
// INSPIRE Studio Spatial Module
// =============================================================================
// Exports for the 360° Neural-Spatial Editor and Player components.
// =============================================================================

// Utilities
export * from './spatial-utils';
export type {
  Hotspot,
  HotspotType,
  ThreeSixtyEditorProps,
  ThreeSixtyScene,
  Vector3,
} from './ThreeSixtyEditor';
// Editor
export { ThreeSixtyEditor } from './ThreeSixtyEditor';

// Editor Components
export { GuidedTourEngine } from './ThreeSixtyEditor/GuidedTourEngine';
export { HotspotConfig } from './ThreeSixtyEditor/HotspotConfig';
export { HotspotManager, TourSequenceManager } from './ThreeSixtyEditor/HotspotManager';
export { HotspotListItem, HotspotMarker } from './ThreeSixtyEditor/HotspotMarker';
export { OrbitController } from './ThreeSixtyEditor/OrbitController';
export { PanoramaSphere } from './ThreeSixtyEditor/PanoramaSphere';

// Types
export type {
  CameraAnimation,
  EditorState,
  HotspotConfigProps,
  HotspotMarkerProps,
  InteractionTrigger,
  ThreeSixtyPlayerProps,
  TourState,
} from './ThreeSixtyEditor/types';
export {
  defaultEditorState,
  defaultTourState,
  HotspotSchema,
  HotspotTypeSchema,
  InteractionTriggerSchema,
  SPATIAL_EXTENSIONS,
  SPATIAL_VERBS,
  ThreeSixtySceneSchema,
  Vector3Schema,
} from './ThreeSixtyEditor/types';
// Player
export { ThreeSixtyPlayer } from './ThreeSixtyPlayer';
