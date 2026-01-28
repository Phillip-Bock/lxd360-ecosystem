// Immersive 360° Panorama and VR Components
// For facility tours, site familiarization, and safety training

// Types and utilities
export {
  type BaseHotspot,
  type CustomHotspot,
  clampPitch,
  createHotspot,
  type DocumentHotspot,
  defaultTourConfig,
  degreesToRadians,
  type Hotspot,
  type HotspotType,
  hotspotColors,
  hotspotIcons,
  hotspotLabels,
  type InfoHotspot,
  type LinkHotspot,
  normalizeYaw,
  type PanoramaEditorState,
  type PanoramaScene,
  type PanoramaTourConfig,
  type PanoramaViewerState,
  radiansToDegrees,
  type SceneHotspot,
  type VideoHotspot,
  type WarningHotspot,
} from './hotspot-types';

// 360° Panorama Components
export { PanoramaBlock } from './panorama-block';
export { PanoramaEditor } from './panorama-editor';
export { PanoramaTour } from './panorama-tour';
export { PanoramaUploader } from './panorama-uploader';

// VR/3D Components
export { preloadModel, VRSceneBlock } from './vr-scene-block';
