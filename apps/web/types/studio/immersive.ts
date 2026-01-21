/**
 * Immersive Content Types - Phases 13, 15, 19
 * Types for 360° panoramas, 3D models, and VR experiences
 */

// =============================================================================
// 360° PANORAMA TYPES
// =============================================================================

/**
 * A 360° panorama scene
 */
export interface PanoramaScene {
  /** Unique identifier */
  id: string;
  /** Scene name */
  name: string;
  /** Description */
  description?: string;
  /** Panorama image URL (equirectangular projection) */
  imageUrl: string;
  /** Image resolution */
  resolution?: { width: number; height: number };
  /** Thumbnail URL */
  thumbnailUrl?: string;
  /** Initial view direction */
  initialView: SphericalCoordinates;
  /** Field of view limits */
  fovLimits?: { min: number; max: number };
  /** Hotspots in this scene */
  hotspots: PanoramaHotspot[];
  /** Audio ambient for this scene */
  ambientAudio?: AudioConfig;
  /** Scene metadata */
  metadata?: Record<string, unknown>;
  /** xAPI tracking ID */
  xapiId?: string;
}

/**
 * Spherical coordinates for view direction
 */
export interface SphericalCoordinates {
  /** Horizontal angle (yaw) in degrees, 0-360 */
  theta: number;
  /** Vertical angle (pitch) in degrees, -90 to 90 */
  phi: number;
  /** Field of view in degrees */
  fov?: number;
}

/**
 * A hotspot in a 360° panorama
 */
export interface PanoramaHotspot {
  /** Unique identifier */
  id: string;
  /** Hotspot name */
  name: string;
  /** Position in spherical coordinates */
  position: SphericalCoordinates;
  /** Hotspot type */
  type: HotspotType;
  /** Visual style */
  style: HotspotStyle;
  /** Content/action */
  content: HotspotContent;
  /** Visibility conditions */
  visible?: boolean;
  /** Animation */
  animation?: HotspotAnimation;
  /** Tooltip on hover */
  tooltip?: string;
  /** Required before navigation (for gated tours) */
  required?: boolean;
  /** Has been visited */
  visited?: boolean;
}

export type HotspotType =
  | 'info' // Information popup
  | 'navigation' // Link to another scene
  | 'media' // Play media
  | 'quiz' // Quiz/assessment
  | 'link' // External link
  | 'audio' // Audio narration
  | 'video' // Embedded video
  | 'model' // 3D model popup
  | 'custom'; // Custom action

export interface HotspotStyle {
  /** Icon type */
  icon: HotspotIcon;
  /** Icon color */
  color: string;
  /** Icon size in pixels */
  size: number;
  /** Pulse animation */
  pulse?: boolean;
  /** Glow effect */
  glow?: boolean;
  /** Custom icon URL */
  customIconUrl?: string;
  /** Background style */
  background?: 'none' | 'circle' | 'rounded' | 'pill';
  /** Background color */
  backgroundColor?: string;
  /** Opacity when not hovered */
  idleOpacity?: number;
}

export type HotspotIcon =
  | 'info'
  | 'arrow'
  | 'play'
  | 'question'
  | 'link'
  | 'audio'
  | 'video'
  | 'cube'
  | 'eye'
  | 'star'
  | 'pin'
  | 'custom';

export interface HotspotContent {
  /** For info type - HTML content */
  html?: string;
  /** For navigation type - target scene ID */
  targetSceneId?: string;
  /** For navigation - transition effect */
  transition?: SceneTransition;
  /** For media type - media URL */
  mediaUrl?: string;
  /** For media - media type */
  mediaType?: 'image' | 'video' | 'audio';
  /** For quiz type - question ID */
  questionId?: string;
  /** For link type - URL */
  url?: string;
  /** For link - open in new tab */
  newTab?: boolean;
  /** For model type - model config */
  model?: Model3DReference;
  /** Custom data */
  customData?: Record<string, unknown>;
}

export interface HotspotAnimation {
  /** Animation type */
  type: 'bounce' | 'pulse' | 'spin' | 'fade' | 'none';
  /** Duration in ms */
  duration: number;
  /** Delay before animation */
  delay?: number;
  /** Repeat infinitely */
  infinite?: boolean;
}

export type SceneTransition =
  | 'fade'
  | 'crossfade'
  | 'zoom'
  | 'slide-left'
  | 'slide-right'
  | 'dissolve'
  | 'none';

/**
 * Audio configuration
 */
export interface AudioConfig {
  /** Audio URL */
  url: string;
  /** Volume (0-1) */
  volume: number;
  /** Loop audio */
  loop: boolean;
  /** Auto-play */
  autoPlay: boolean;
  /** Spatial audio position */
  spatialPosition?: SphericalCoordinates;
  /** Fade in duration (ms) */
  fadeIn?: number;
  /** Fade out duration (ms) */
  fadeOut?: number;
}

/**
 * A virtual tour containing multiple scenes
 */
export interface VirtualTour {
  /** Unique identifier */
  id: string;
  /** Tour name */
  name: string;
  /** Description */
  description?: string;
  /** Thumbnail */
  thumbnailUrl?: string;
  /** All scenes in the tour */
  scenes: PanoramaScene[];
  /** Starting scene ID */
  startSceneId: string;
  /** Tour settings */
  settings: TourSettings;
  /** Tour map/floorplan */
  map?: TourMap;
  /** Global audio */
  globalAudio?: AudioConfig;
  /** Completion tracking */
  tracking?: TourTracking;
}

export interface TourSettings {
  /** Auto-rotate when idle */
  autoRotate: boolean;
  /** Auto-rotate speed (deg/sec) */
  autoRotateSpeed: number;
  /** Show compass */
  showCompass: boolean;
  /** Show scene title */
  showSceneTitle: boolean;
  /** Enable gyroscope on mobile */
  enableGyroscope: boolean;
  /** Enable VR mode */
  enableVR: boolean;
  /** Control sensitivity */
  controlSensitivity: number;
  /** Keyboard controls */
  keyboardControls: boolean;
  /** Mouse wheel zoom */
  mouseWheelZoom: boolean;
  /** Touch drag sensitivity */
  touchSensitivity: number;
  /** Inertia after drag */
  inertia: boolean;
}

export interface TourMap {
  /** Map image URL */
  imageUrl: string;
  /** Map dimensions */
  dimensions: { width: number; height: number };
  /** Scene positions on map */
  scenePositions: Array<{
    sceneId: string;
    x: number;
    y: number;
    rotation?: number;
  }>;
  /** Show map by default */
  showByDefault: boolean;
  /** Map position */
  position: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
}

export interface TourTracking {
  /** Track scene visits */
  trackVisits: boolean;
  /** Track hotspot interactions */
  trackHotspots: boolean;
  /** Track time per scene */
  trackTime: boolean;
  /** Required scenes for completion */
  requiredScenes?: string[];
  /** Required hotspots for completion */
  requiredHotspots?: string[];
  /** Completion percentage threshold */
  completionThreshold?: number;
}

// =============================================================================
// 3D MODEL TYPES
// =============================================================================

/**
 * A 3D model configuration
 */
export interface Model3D {
  /** Unique identifier */
  id: string;
  /** Model name */
  name: string;
  /** Description */
  description?: string;
  /** Model file URL */
  modelUrl: string;
  /** Model format */
  format: ModelFormat;
  /** Thumbnail URL */
  thumbnailUrl?: string;
  /** Model scale */
  scale: number;
  /** Initial rotation */
  rotation: Vector3;
  /** Initial position */
  position: Vector3;
  /** Material overrides */
  materials?: MaterialOverride[];
  /** Model parts/hierarchy */
  parts: ModelPart[];
  /** Hotspots attached to model */
  hotspots: Model3DHotspot[];
  /** Animations */
  animations: ModelAnimation[];
  /** Exploded view config */
  explodedView?: ExplodedViewConfig;
  /** Lighting */
  lighting: LightingConfig;
  /** Environment */
  environment: EnvironmentConfig;
  /** Interaction settings */
  interaction: InteractionConfig;
}

export type ModelFormat = 'gltf' | 'glb' | 'obj' | 'fbx' | 'step' | 'iges' | 'stl';

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface MaterialOverride {
  /** Part ID or material name */
  target: string;
  /** Override color */
  color?: string;
  /** Override opacity */
  opacity?: number;
  /** Override metalness */
  metalness?: number;
  /** Override roughness */
  roughness?: number;
  /** Override emissive */
  emissive?: string;
  /** Texture URL */
  textureUrl?: string;
}

/**
 * A part of a 3D model
 */
export interface ModelPart {
  /** Part ID (matches mesh name) */
  id: string;
  /** Display name */
  name: string;
  /** Parent part ID */
  parentId?: string;
  /** Part description */
  description?: string;
  /** Is selectable */
  selectable: boolean;
  /** Highlight color when selected */
  highlightColor?: string;
  /** Visibility */
  visible: boolean;
  /** Custom metadata */
  metadata?: Record<string, unknown>;
  /** Exploded position offset */
  explodedOffset?: Vector3;
  /** Part number/ID for BOM */
  partNumber?: string;
}

/**
 * A hotspot attached to a 3D model
 */
export interface Model3DHotspot {
  /** Unique identifier */
  id: string;
  /** Hotspot name */
  name: string;
  /** Attached part ID */
  partId?: string;
  /** Position in 3D space */
  position: Vector3;
  /** Look-at point for camera */
  lookAt?: Vector3;
  /** Hotspot type */
  type: HotspotType;
  /** Visual style */
  style: HotspotStyle;
  /** Content */
  content: HotspotContent;
  /** Show when part is selected */
  showOnPartSelect?: boolean;
  /** Always face camera */
  billboard?: boolean;
}

/**
 * Animation configuration
 */
export interface ModelAnimation {
  /** Animation ID */
  id: string;
  /** Animation name */
  name: string;
  /** Animation type */
  type: 'embedded' | 'explode' | 'custom';
  /** Duration in ms */
  duration: number;
  /** Auto-play */
  autoPlay: boolean;
  /** Loop */
  loop: boolean;
  /** For embedded - clip name */
  clipName?: string;
  /** For custom - keyframes */
  keyframes?: AnimationKeyframe[];
}

export interface AnimationKeyframe {
  /** Time in ms */
  time: number;
  /** Target part ID */
  partId: string;
  /** Position */
  position?: Vector3;
  /** Rotation (euler) */
  rotation?: Vector3;
  /** Scale */
  scale?: Vector3;
  /** Opacity */
  opacity?: number;
  /** Easing */
  easing?: EasingType;
}

export type EasingType = 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'bounce' | 'elastic';

/**
 * Exploded view configuration
 */
export interface ExplodedViewConfig {
  /** Enable exploded view */
  enabled: boolean;
  /** Explosion factor (1 = normal, >1 = exploded) */
  factor: number;
  /** Explosion center point */
  center: Vector3;
  /** Animation duration */
  animationDuration: number;
  /** Show connection lines */
  showConnectionLines: boolean;
  /** Line color */
  lineColor: string;
  /** Line opacity */
  lineOpacity: number;
  /** Per-part offsets */
  partOffsets?: Record<string, Vector3>;
  /** Explosion direction mode */
  mode: 'radial' | 'axis' | 'custom';
  /** For axis mode - explosion axis */
  axis?: Vector3;
}

/**
 * Lighting configuration
 */
export interface LightingConfig {
  /** Ambient light intensity */
  ambientIntensity: number;
  /** Ambient light color */
  ambientColor: string;
  /** Directional lights */
  directionalLights: DirectionalLight[];
  /** Point lights */
  pointLights?: PointLight[];
  /** Environment map URL */
  environmentMap?: string;
  /** Environment map intensity */
  environmentIntensity?: number;
  /** Enable shadows */
  shadows: boolean;
  /** Shadow quality */
  shadowQuality: 'low' | 'medium' | 'high';
}

export interface DirectionalLight {
  /** Light position */
  position: Vector3;
  /** Light color */
  color: string;
  /** Light intensity */
  intensity: number;
  /** Cast shadows */
  castShadow: boolean;
}

export interface PointLight {
  /** Light position */
  position: Vector3;
  /** Light color */
  color: string;
  /** Light intensity */
  intensity: number;
  /** Light distance */
  distance: number;
  /** Light decay */
  decay: number;
}

/**
 * Environment configuration
 */
export interface EnvironmentConfig {
  /** Background type */
  backgroundType: 'color' | 'gradient' | 'image' | 'hdri' | 'transparent';
  /** Background color */
  backgroundColor?: string;
  /** Gradient colors */
  gradientColors?: [string, string];
  /** Background image URL */
  backgroundImage?: string;
  /** HDRI URL */
  hdriUrl?: string;
  /** Show ground plane */
  showGround: boolean;
  /** Ground color */
  groundColor?: string;
  /** Ground grid */
  showGrid: boolean;
  /** Grid size */
  gridSize?: number;
  /** Grid divisions */
  gridDivisions?: number;
  /** Fog */
  fog?: {
    enabled: boolean;
    color: string;
    near: number;
    far: number;
  };
}

/**
 * Interaction configuration
 */
export interface InteractionConfig {
  /** Enable rotation */
  enableRotation: boolean;
  /** Enable zoom */
  enableZoom: boolean;
  /** Enable pan */
  enablePan: boolean;
  /** Min zoom distance */
  minDistance: number;
  /** Max zoom distance */
  maxDistance: number;
  /** Rotation speed */
  rotateSpeed: number;
  /** Zoom speed */
  zoomSpeed: number;
  /** Pan speed */
  panSpeed: number;
  /** Enable damping */
  enableDamping: boolean;
  /** Damping factor */
  dampingFactor: number;
  /** Auto-rotate when idle */
  autoRotate: boolean;
  /** Auto-rotate speed */
  autoRotateSpeed: number;
  /** Enable part selection */
  enablePartSelection: boolean;
  /** Selection mode */
  selectionMode: 'single' | 'multi';
  /** Double-click to focus */
  doubleClickFocus: boolean;
}

/**
 * Reference to a 3D model (for hotspots)
 */
export interface Model3DReference {
  /** Model ID */
  modelId: string;
  /** Override scale */
  scale?: number;
  /** Override position */
  position?: Vector3;
  /** Auto-play animations */
  autoPlay?: boolean;
  /** Initial animation */
  initialAnimation?: string;
}

// =============================================================================
// VR/XR TYPES
// =============================================================================

/**
 * WebXR session configuration
 */
export interface XRConfig {
  /** Enable VR mode */
  enableVR: boolean;
  /** Enable AR mode */
  enableAR: boolean;
  /** Required XR features */
  requiredFeatures: XRFeature[];
  /** Optional XR features */
  optionalFeatures: XRFeature[];
  /** Reference space type */
  referenceSpaceType: XRReferenceSpace;
  /** Controller config */
  controllers: XRControllerConfig;
  /** Hand tracking */
  handTracking: boolean;
  /** Teleportation */
  teleportation: TeleportationConfig;
  /** Comfort settings */
  comfort: ComfortSettings;
}

export type XRFeature =
  | 'local'
  | 'local-floor'
  | 'bounded-floor'
  | 'unbounded'
  | 'hand-tracking'
  | 'hit-test'
  | 'anchors'
  | 'plane-detection'
  | 'mesh-detection';

export type XRReferenceSpace = 'local' | 'local-floor' | 'bounded-floor' | 'unbounded';

export interface XRControllerConfig {
  /** Show controller models */
  showControllers: boolean;
  /** Controller model type */
  modelType: 'default' | 'hand' | 'custom';
  /** Pointer ray */
  pointerRay: boolean;
  /** Ray color */
  rayColor: string;
  /** Haptic feedback */
  haptics: boolean;
}

export interface TeleportationConfig {
  /** Enable teleportation */
  enabled: boolean;
  /** Teleport button */
  button: 'trigger' | 'grip' | 'thumbstick';
  /** Valid surfaces */
  validSurfaces: 'floor' | 'all' | 'tagged';
  /** Arc color */
  arcColor: string;
  /** Invalid color */
  invalidColor: string;
  /** Fade transition */
  fadeTransition: boolean;
  /** Fade duration */
  fadeDuration: number;
}

export interface ComfortSettings {
  /** Vignette during motion */
  vignette: boolean;
  /** Vignette intensity */
  vignetteIntensity: number;
  /** Snap turning */
  snapTurn: boolean;
  /** Snap turn angle */
  snapTurnAngle: number;
  /** Smooth turning speed */
  smoothTurnSpeed: number;
  /** Seated mode */
  seatedMode: boolean;
  /** Seated height offset */
  seatedHeightOffset: number;
}

/**
 * XR interaction point
 */
export interface XRInteractionPoint {
  /** Unique identifier */
  id: string;
  /** Position in 3D space */
  position: Vector3;
  /** Interaction radius */
  radius: number;
  /** Interaction type */
  type: 'grab' | 'press' | 'hover' | 'gaze';
  /** Visual indicator */
  indicator: {
    visible: boolean;
    color: string;
    shape: 'sphere' | 'ring' | 'custom';
  };
  /** Action on interact */
  action: HotspotContent;
  /** Haptic feedback config */
  hapticFeedback?: {
    intensity: number;
    duration: number;
  };
}

// =============================================================================
// SHARED TYPES
// =============================================================================

/**
 * Camera preset
 */
export interface CameraPreset {
  /** Preset ID */
  id: string;
  /** Preset name */
  name: string;
  /** Camera position */
  position: Vector3;
  /** Camera target */
  target: Vector3;
  /** Field of view */
  fov?: number;
  /** Transition duration */
  transitionDuration?: number;
}

/**
 * Annotation
 */
export interface Annotation {
  /** Unique identifier */
  id: string;
  /** Annotation text */
  text: string;
  /** Rich text content */
  richText?: string;
  /** Position in 3D or spherical */
  position: Vector3 | SphericalCoordinates;
  /** Annotation style */
  style: AnnotationStyle;
  /** Connection line to surface */
  showLine?: boolean;
  /** Line end point */
  lineEndPoint?: Vector3;
}

export interface AnnotationStyle {
  /** Background color */
  backgroundColor: string;
  /** Text color */
  textColor: string;
  /** Font size */
  fontSize: number;
  /** Padding */
  padding: number;
  /** Border radius */
  borderRadius: number;
  /** Max width */
  maxWidth: number;
  /** Always face camera */
  billboard: boolean;
  /** Scale with distance */
  scaleWithDistance: boolean;
}

/**
 * Measurement tool result
 */
export interface Measurement {
  /** Measurement ID */
  id: string;
  /** Measurement type */
  type: 'distance' | 'angle' | 'area';
  /** Measurement points */
  points: Vector3[];
  /** Calculated value */
  value: number;
  /** Unit */
  unit: string;
  /** Label */
  label?: string;
  /** Color */
  color: string;
}

/**
 * Screenshot/capture configuration
 */
export interface CaptureConfig {
  /** Resolution width */
  width: number;
  /** Resolution height */
  height: number;
  /** Format */
  format: 'png' | 'jpeg' | 'webp';
  /** Quality (for jpeg/webp) */
  quality: number;
  /** Include UI */
  includeUI: boolean;
  /** Transparent background */
  transparentBackground: boolean;
}

// =============================================================================
// STATE TYPES
// =============================================================================

/**
 * Viewer state
 */
export interface ViewerState {
  /** Current scene ID (for tours) */
  currentSceneId?: string;
  /** Current view direction */
  currentView: SphericalCoordinates;
  /** Is playing animation */
  isAnimating: boolean;
  /** Current animation ID */
  currentAnimation?: string;
  /** Animation progress (0-1) */
  animationProgress: number;
  /** Is in VR mode */
  isVRMode: boolean;
  /** Is loading */
  isLoading: boolean;
  /** Load progress (0-100) */
  loadProgress: number;
  /** Selected parts */
  selectedParts: string[];
  /** Exploded view factor */
  explodedFactor: number;
  /** Visited scenes */
  visitedScenes: string[];
  /** Visited hotspots */
  visitedHotspots: string[];
  /** Is fullscreen */
  isFullscreen: boolean;
  /** Error state */
  error?: string;
}

/**
 * Interaction event
 */
export interface ViewerInteractionEvent {
  /** Event type */
  type: 'hotspot-click' | 'part-select' | 'scene-change' | 'animation-complete' | 'tour-complete';
  /** Target ID */
  targetId: string;
  /** Timestamp */
  timestamp: number;
  /** Additional data */
  data?: Record<string, unknown>;
}
