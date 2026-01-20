// =============================================================================
// CORE THREE.JS TYPES
// =============================================================================

/** 3D vector as tuple [x, y, z] */
export type Vector3Tuple = [number, number, number];

/** 4D vector for quaternions [x, y, z, w] */
export type Vector4Tuple = [number, number, number, number];

/** Euler rotation as tuple [x, y, z, order?] */
export type EulerTuple = [number, number, number, string?];

/** RGB color as tuple [r, g, b] (0-1 range) */
export type ColorTuple = [number, number, number];

/** RGBA color as tuple [r, g, b, a] (0-1 range) */
export type ColorAlphaTuple = [number, number, number, number];

/** Hex color string */
export type HexColor = `#${string}`;

/** CSS color or hex */
export type CSSColor = HexColor | string;

// =============================================================================
// CAMERA CONFIGURATION
// =============================================================================

export type CameraType = 'perspective' | 'orthographic';

export interface PerspectiveCameraConfig {
  type: 'perspective';
  fov: number;
  near: number;
  far: number;
  position: Vector3Tuple;
  lookAt?: Vector3Tuple;
  zoom?: number;
}

export interface OrthographicCameraConfig {
  type: 'orthographic';
  left: number;
  right: number;
  top: number;
  bottom: number;
  near: number;
  far: number;
  position: Vector3Tuple;
  lookAt?: Vector3Tuple;
  zoom?: number;
}

export type CameraConfig = PerspectiveCameraConfig | OrthographicCameraConfig;

// =============================================================================
// LIGHTING CONFIGURATION
// =============================================================================

export type LightType = 'ambient' | 'directional' | 'point' | 'spot' | 'hemisphere' | 'rect-area';

export interface BaseLightConfig {
  type: LightType;
  color: CSSColor;
  intensity: number;
  castShadow?: boolean;
}

export interface AmbientLightConfig extends BaseLightConfig {
  type: 'ambient';
}

export interface DirectionalLightConfig extends BaseLightConfig {
  type: 'directional';
  position: Vector3Tuple;
  target?: Vector3Tuple;
  shadow?: ShadowConfig;
}

export interface PointLightConfig extends BaseLightConfig {
  type: 'point';
  position: Vector3Tuple;
  distance?: number;
  decay?: number;
}

export interface SpotLightConfig extends BaseLightConfig {
  type: 'spot';
  position: Vector3Tuple;
  target?: Vector3Tuple;
  angle?: number;
  penumbra?: number;
  distance?: number;
  decay?: number;
  shadow?: ShadowConfig;
}

export interface HemisphereLightConfig extends BaseLightConfig {
  type: 'hemisphere';
  skyColor: CSSColor;
  groundColor: CSSColor;
  position?: Vector3Tuple;
}

export interface RectAreaLightConfig extends BaseLightConfig {
  type: 'rect-area';
  width: number;
  height: number;
  position: Vector3Tuple;
  lookAt?: Vector3Tuple;
}

export type LightConfig =
  | AmbientLightConfig
  | DirectionalLightConfig
  | PointLightConfig
  | SpotLightConfig
  | HemisphereLightConfig
  | RectAreaLightConfig;

export interface ShadowConfig {
  mapSize: [number, number];
  bias?: number;
  normalBias?: number;
  radius?: number;
  camera?: {
    near?: number;
    far?: number;
    left?: number;
    right?: number;
    top?: number;
    bottom?: number;
  };
}

export interface LightingConfig {
  lights: LightConfig[];
  shadowsEnabled?: boolean;
  shadowType?: 'basic' | 'pcf' | 'pcf-soft' | 'vsm';
}

// =============================================================================
// ENVIRONMENT CONFIGURATION
// =============================================================================

export type EnvironmentPreset =
  | 'apartment'
  | 'city'
  | 'dawn'
  | 'forest'
  | 'lobby'
  | 'night'
  | 'park'
  | 'studio'
  | 'sunset'
  | 'warehouse';

export interface EnvironmentConfig {
  background?: CSSColor | 'transparent';
  environmentMap?: string | EnvironmentPreset;
  fog?: FogConfig;
  ground?: GroundConfig;
}

export interface FogConfig {
  type: 'linear' | 'exponential';
  color: CSSColor;
  near?: number;
  far?: number;
  density?: number;
}

export interface GroundConfig {
  enabled: boolean;
  height?: number;
  radius?: number;
  color?: CSSColor;
  receiveShadow?: boolean;
}

// =============================================================================
// POST PROCESSING
// =============================================================================

export interface PostProcessingConfig {
  enabled: boolean;
  effects: PostProcessingEffect[];
}

export type PostProcessingEffect =
  | BloomEffect
  | DOFEffect
  | SSAOEffect
  | VignetteEffect
  | ChromaticAberrationEffect
  | ToneMappingEffect;

export interface BloomEffect {
  type: 'bloom';
  intensity?: number;
  luminanceThreshold?: number;
  luminanceSmoothing?: number;
  mipmapBlur?: boolean;
}

export interface DOFEffect {
  type: 'depth-of-field';
  focusDistance?: number;
  focalLength?: number;
  bokehScale?: number;
}

export interface SSAOEffect {
  type: 'ssao';
  radius?: number;
  intensity?: number;
  luminanceInfluence?: number;
}

export interface VignetteEffect {
  type: 'vignette';
  offset?: number;
  darkness?: number;
}

export interface ChromaticAberrationEffect {
  type: 'chromatic-aberration';
  offset?: [number, number];
}

export interface ToneMappingEffect {
  type: 'tone-mapping';
  mode?: 'aces' | 'reinhard' | 'cineon' | 'linear';
  exposure?: number;
}

// =============================================================================
// SCENE CONFIGURATION
// =============================================================================

export interface SceneConfig {
  camera: CameraConfig;
  lighting: LightingConfig;
  environment: EnvironmentConfig;
  postProcessing?: PostProcessingConfig;
  physics?: PhysicsConfig;
  audio?: Audio3DConfig;
}

// =============================================================================
// MATERIALS
// =============================================================================

export type MaterialType =
  | 'standard'
  | 'physical'
  | 'basic'
  | 'lambert'
  | 'phong'
  | 'toon'
  | 'matcap'
  | 'shader';

export interface BaseMaterialConfig {
  type: MaterialType;
  color?: CSSColor;
  opacity?: number;
  transparent?: boolean;
  side?: 'front' | 'back' | 'double';
  wireframe?: boolean;
  visible?: boolean;
}

export interface StandardMaterialConfig extends BaseMaterialConfig {
  type: 'standard';
  roughness?: number;
  metalness?: number;
  map?: string;
  normalMap?: string;
  roughnessMap?: string;
  metalnessMap?: string;
  aoMap?: string;
  emissive?: CSSColor;
  emissiveIntensity?: number;
  emissiveMap?: string;
  envMapIntensity?: number;
}

export interface PhysicalMaterialConfig extends Omit<StandardMaterialConfig, 'type'> {
  type: 'physical';
  clearcoat?: number;
  clearcoatRoughness?: number;
  sheen?: number;
  sheenColor?: CSSColor;
  transmission?: number;
  thickness?: number;
  ior?: number;
}

export type MaterialConfig = BaseMaterialConfig | StandardMaterialConfig | PhysicalMaterialConfig;

// =============================================================================
// GEOMETRY
// =============================================================================

export type GeometryType =
  | 'box'
  | 'sphere'
  | 'cylinder'
  | 'cone'
  | 'torus'
  | 'plane'
  | 'circle'
  | 'ring'
  | 'dodecahedron'
  | 'icosahedron'
  | 'octahedron'
  | 'tetrahedron'
  | 'capsule'
  | 'extrude'
  | 'lathe'
  | 'tube'
  | 'custom';

export interface BoxGeometryConfig {
  type: 'box';
  width: number;
  height: number;
  depth: number;
  widthSegments?: number;
  heightSegments?: number;
  depthSegments?: number;
}

export interface SphereGeometryConfig {
  type: 'sphere';
  radius: number;
  widthSegments?: number;
  heightSegments?: number;
  phiStart?: number;
  phiLength?: number;
  thetaStart?: number;
  thetaLength?: number;
}

export interface CylinderGeometryConfig {
  type: 'cylinder';
  radiusTop: number;
  radiusBottom: number;
  height: number;
  radialSegments?: number;
  heightSegments?: number;
  openEnded?: boolean;
}

export interface PlaneGeometryConfig {
  type: 'plane';
  width: number;
  height: number;
  widthSegments?: number;
  heightSegments?: number;
}

export type GeometryConfig =
  | BoxGeometryConfig
  | SphereGeometryConfig
  | CylinderGeometryConfig
  | PlaneGeometryConfig;

// =============================================================================
// 3D MODELS
// =============================================================================

export type ModelFormat = 'gltf' | 'glb' | 'fbx' | 'obj' | 'draco';

export interface Model3DConfig {
  src: string;
  format: ModelFormat;
  position?: Vector3Tuple;
  rotation?: EulerTuple;
  scale?: Vector3Tuple | number;
  castShadow?: boolean;
  receiveShadow?: boolean;
  animations?: ModelAnimationConfig[];
  onLoad?: () => void;
  onProgress?: (progress: number) => void;
  onError?: (error: Error) => void;
}

export interface ModelAnimationConfig {
  name: string;
  autoPlay?: boolean;
  loop?: boolean | 'once' | 'repeat' | 'pingpong';
  timeScale?: number;
  clampWhenFinished?: boolean;
}

// =============================================================================
// ANIMATIONS
// =============================================================================

export interface AnimationKeyframe {
  time: number;
  value: number | Vector3Tuple | Vector4Tuple;
  easing?: EasingFunction;
}

export type EasingFunction =
  | 'linear'
  | 'easeIn'
  | 'easeOut'
  | 'easeInOut'
  | 'easeInQuad'
  | 'easeOutQuad'
  | 'easeInCubic'
  | 'easeOutCubic'
  | 'easeInExpo'
  | 'easeOutExpo'
  | 'easeInElastic'
  | 'easeOutElastic'
  | 'easeInBounce'
  | 'easeOutBounce';

export interface AnimationTrack {
  property: 'position' | 'rotation' | 'scale' | 'opacity' | 'color';
  keyframes: AnimationKeyframe[];
}

export interface AnimationClip {
  name: string;
  duration: number;
  tracks: AnimationTrack[];
  loop?: boolean | 'once' | 'repeat' | 'pingpong';
}

// =============================================================================
// PHYSICS (Rapier/Cannon)
// =============================================================================

export interface PhysicsConfig {
  enabled: boolean;
  gravity?: Vector3Tuple;
  debug?: boolean;
  interpolate?: boolean;
  timeStep?: number;
}

export type ColliderType =
  | 'box'
  | 'sphere'
  | 'capsule'
  | 'cylinder'
  | 'cone'
  | 'convex'
  | 'trimesh'
  | 'heightfield';

export type RigidBodyType = 'dynamic' | 'static' | 'kinematic';

export interface RigidBodyConfig {
  type: RigidBodyType;
  mass?: number;
  friction?: number;
  restitution?: number;
  linearDamping?: number;
  angularDamping?: number;
  gravityScale?: number;
  ccd?: boolean;
  sensor?: boolean;
  colliders?: ColliderConfig[];
}

export interface ColliderConfig {
  type: ColliderType;
  args?: number[];
  position?: Vector3Tuple;
  rotation?: EulerTuple;
  friction?: number;
  restitution?: number;
  sensor?: boolean;
}

// =============================================================================
// XR / VR / AR TYPES
// =============================================================================

export type XRMode = 'vr' | 'ar' | 'inline';

export type XRSessionMode = 'immersive-vr' | 'immersive-ar' | 'inline';

export type XRReferenceSpaceType =
  | 'local'
  | 'local-floor'
  | 'bounded-floor'
  | 'unbounded'
  | 'viewer';

export interface XRConfig {
  mode: XRMode;
  sessionMode?: XRSessionMode;
  referenceSpaceType?: XRReferenceSpaceType;
  foveation?: number;
  frameRate?: number;
  hand?: XRHandConfig;
  controller?: XRControllerConfig;
  hitTest?: XRHitTestConfig;
  anchors?: boolean;
  planeDetection?: boolean;
  lightEstimation?: boolean;
}

export interface XRHandConfig {
  enabled: boolean;
  model?: 'spheres' | 'boxes' | 'mesh';
  profile?: string;
}

export interface XRControllerConfig {
  enabled: boolean;
  model?: boolean;
  rayPointer?: boolean;
  teleport?: boolean;
  haptics?: boolean;
}

export interface XRHitTestConfig {
  enabled: boolean;
  source: 'viewer' | 'controller';
}

export type XRHandedness = 'left' | 'right' | 'none';

export interface XRControllerState {
  handedness: XRHandedness;
  position: Vector3Tuple;
  rotation: Vector4Tuple;
  grip?: {
    position: Vector3Tuple;
    rotation: Vector4Tuple;
  };
  buttons: XRButtonState[];
  axes: number[];
  squeeze?: number;
  trigger?: number;
}

export interface XRButtonState {
  pressed: boolean;
  touched: boolean;
  value: number;
}

export interface XRInteractionEvent {
  type: 'select' | 'selectstart' | 'selectend' | 'squeeze' | 'squeezestart' | 'squeezeend';
  controller: XRControllerState;
  target?: string;
  position?: Vector3Tuple;
}

// =============================================================================
// AUDIO 3D
// =============================================================================

export interface Audio3DConfig {
  enabled: boolean;
  listener?: {
    position?: Vector3Tuple;
    rotation?: EulerTuple;
  };
  sources?: AudioSourceConfig[];
}

export interface AudioSourceConfig {
  id: string;
  src: string;
  position: Vector3Tuple;
  volume?: number;
  loop?: boolean;
  autoPlay?: boolean;
  refDistance?: number;
  maxDistance?: number;
  rolloffFactor?: number;
  distanceModel?: 'linear' | 'inverse' | 'exponential';
  cone?: {
    innerAngle?: number;
    outerAngle?: number;
    outerGain?: number;
  };
}

// =============================================================================
// LEARNING EXPERIENCE TYPES (LXP360 SPECIFIC)
// =============================================================================

export type LearningInteractionType =
  | 'observe'
  | 'rotate'
  | 'zoom'
  | 'click'
  | 'drag'
  | 'manipulate'
  | 'assemble'
  | 'annotate'
  | 'measure'
  | 'xr-interact';

export interface LearningHotspot {
  id: string;
  position: Vector3Tuple;
  title: string;
  description?: string;
  media?: {
    type: 'text' | 'image' | 'video' | 'audio';
    src?: string;
    content?: string;
  };
  actions?: HotspotAction[];
  xapiVerb?: string;
  highlighted?: boolean;
  visible?: boolean;
}

export interface HotspotAction {
  type: 'navigate' | 'reveal' | 'animate' | 'quiz' | 'track';
  target?: string;
  data?: Record<string, unknown>;
}

export interface Learning3DExperience {
  id: string;
  title: string;
  description?: string;
  scene: SceneConfig;
  models: Model3DConfig[];
  hotspots?: LearningHotspot[];
  interactions?: LearningInteractionType[];
  xr?: XRConfig;
  accessibility?: {
    altText: string;
    audioDescription?: string;
    reducedMotion?: boolean;
    highContrast?: boolean;
  };
  analytics?: {
    trackRotation?: boolean;
    trackZoom?: boolean;
    trackHotspots?: boolean;
    trackTime?: boolean;
  };
}

// =============================================================================
// REACT THREE FIBER COMPONENT PROPS
// =============================================================================

export interface Canvas3DProps {
  scene: SceneConfig;
  className?: string;
  style?: React.CSSProperties;
  frameloop?: 'always' | 'demand' | 'never';
  performance?: {
    min?: number;
    max?: number;
    debounce?: number;
  };
  dpr?: number | [number, number];
  gl?: {
    antialias?: boolean;
    alpha?: boolean;
    powerPreference?: 'default' | 'high-performance' | 'low-power';
    preserveDrawingBuffer?: boolean;
    toneMapping?: 'none' | 'linear' | 'reinhard' | 'cineon' | 'aces';
    toneMappingExposure?: number;
  };
  onCreated?: (state: RootState) => void;
}

export interface RootState {
  gl: unknown; // WebGLRenderer
  scene: unknown; // Scene
  camera: unknown; // Camera
  clock: unknown; // Clock
  size: { width: number; height: number };
  viewport: { width: number; height: number; factor: number };
  pointer: { x: number; y: number };
  controls: unknown | null;
}

export type UseFrameCallback = (state: RootState, delta: number) => void;

// =============================================================================
// GLTF RESULT TYPE
// =============================================================================

export interface GLTFResult {
  nodes: Record<string, unknown>;
  materials: Record<string, unknown>;
  animations: unknown[];
  scene: unknown;
  scenes: unknown[];
  cameras: unknown[];
  asset: {
    generator?: string;
    version: string;
    copyright?: string;
  };
}

// =============================================================================
// EXPORT HELPERS
// =============================================================================

/** Type guard for perspective camera */
export function isPerspectiveCamera(config: CameraConfig): config is PerspectiveCameraConfig {
  return config.type === 'perspective';
}

/** Type guard for orthographic camera */
export function isOrthographicCamera(config: CameraConfig): config is OrthographicCameraConfig {
  return config.type === 'orthographic';
}

/** Create default scene config */
export function createDefaultSceneConfig(): SceneConfig {
  return {
    camera: {
      type: 'perspective',
      fov: 75,
      near: 0.1,
      far: 1000,
      position: [0, 5, 10],
    },
    lighting: {
      lights: [
        { type: 'ambient', color: '#ffffff', intensity: 0.5 },
        {
          type: 'directional',
          color: '#ffffff',
          intensity: 1,
          position: [10, 10, 10],
          castShadow: true,
        },
      ],
      shadowsEnabled: true,
    },
    environment: {
      background: '#1a1a2e',
    },
  };
}

/** Create XR-ready scene config */
export function createXRSceneConfig(mode: XRMode): SceneConfig & { xr: XRConfig } {
  const base = createDefaultSceneConfig();
  return {
    ...base,
    xr: {
      mode,
      sessionMode: mode === 'vr' ? 'immersive-vr' : 'immersive-ar',
      referenceSpaceType: 'local-floor',
      controller: {
        enabled: true,
        model: true,
        rayPointer: true,
        teleport: mode === 'vr',
      },
      hand: {
        enabled: true,
        model: 'mesh',
      },
    },
  };
}

// =============================================================================
// RE-EXPORTS
// =============================================================================

export type { Vector3Tuple as Vec3, Vector4Tuple as Vec4, EulerTuple as Euler };
