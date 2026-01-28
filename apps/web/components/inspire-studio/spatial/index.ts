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
} from './three-sixty-editor';
// Editor
export { ThreeSixtyEditor } from './three-sixty-editor';

// Editor Components
export { GuidedTourEngine } from './three-sixty-editor/guided-tour-engine';
export { HotspotConfig } from './three-sixty-editor/hotspot-config';
export { HotspotManager, TourSequenceManager } from './three-sixty-editor/hotspot-manager';
export { HotspotListItem, HotspotMarker } from './three-sixty-editor/hotspot-marker';
export { OrbitController } from './three-sixty-editor/orbit-controller';
export { PanoramaSphere } from './three-sixty-editor/panorama-sphere';

// Types
export type {
  CameraAnimation,
  EditorState,
  HotspotConfigProps,
  HotspotMarkerProps,
  InteractionTrigger,
  ThreeSixtyPlayerProps,
  TourState,
} from './three-sixty-editor/types';
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
} from './three-sixty-editor/types';
// Player
export { ThreeSixtyPlayer } from './three-sixty-player';
