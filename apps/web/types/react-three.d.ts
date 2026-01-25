// biome-ignore-all lint/suspicious/noExplicitAny: Type declarations for third-party libraries require flexible typing
// Type declarations for @react-three/fiber and @react-three/drei beta versions
// These augment the types for React 19 compatibility
// Using permissive types to avoid conflicts with actual implementations

declare module '@react-three/fiber' {
  import type { ReactNode } from 'react';
  import type { Camera, Object3D, Scene, WebGLRenderer } from 'three';

  export interface RootState {
    gl: WebGLRenderer;
    scene: Scene;
    camera: Camera;
    clock: { elapsedTime: number; getDelta: () => number; getElapsedTime: () => number };
    size: { width: number; height: number };
    viewport: { width: number; height: number };
    mouse: { x: number; y: number };
    raycaster: unknown;
    events: unknown;
    invalidate: () => void;
    advance: (timestamp: number, runGlobalEffects?: boolean) => void;
    get: () => RootState;
    set: (state: Partial<RootState>) => void;
  }

  export interface CanvasProps {
    children?: ReactNode;
    shadows?: boolean;
    dpr?: number | [number, number];
    camera?: Record<string, unknown>;
    gl?: Record<string, unknown>;
    style?: React.CSSProperties;
    className?: string;
    frameloop?: 'always' | 'demand' | 'never';
    onCreated?: (state: RootState) => void;
    [key: string]: unknown;
  }

  export function Canvas(props: CanvasProps): JSX.Element;
  export function useFrame(
    callback: (state: RootState, delta: number) => void,
    renderPriority?: number,
  ): void;
  export function useThree(): RootState;
  export function extend(objects: Record<string, unknown>): void;
  export function useLoader<T>(
    loader: new () => unknown,
    url: string | string[],
    extensions?: (loader: unknown) => void,
    onProgress?: (event: ProgressEvent) => void,
  ): T;

  export interface ThreeEvent<T = unknown> {
    nativeEvent: T;
    stopPropagation: () => void;
    target: unknown;
    currentTarget: unknown;
    delta: number;
    ray: unknown;
    camera: Camera;
    eventObject: Object3D;
    unprojectedPoint: unknown;
    pointer: { x: number; y: number };
    intersections: unknown[];
    object: Object3D;
    [key: string]: unknown;
  }

  // Re-export for compatibility
  export * from 'three';
}

declare module '@react-three/drei' {
  import type { ReactNode, RefObject } from 'react';
  import type { AnimationAction, AnimationClip, AnimationMixer, Group, Texture } from 'three';

  // OrbitControls with all common props
  export interface OrbitControlsProps {
    ref?: RefObject<unknown>;
    enablePan?: boolean;
    enableZoom?: boolean;
    enableRotate?: boolean;
    enableDamping?: boolean;
    dampingFactor?: number;
    minPolarAngle?: number;
    maxPolarAngle?: number;
    minAzimuthAngle?: number;
    maxAzimuthAngle?: number;
    minDistance?: number;
    maxDistance?: number;
    rotateSpeed?: number;
    zoomSpeed?: number;
    panSpeed?: number;
    autoRotate?: boolean;
    autoRotateSpeed?: number;
    target?: [number, number, number];
    makeDefault?: boolean;
    onStart?: () => void;
    onEnd?: () => void;
    onChange?: () => void;
    [key: string]: unknown;
  }

  export function OrbitControls(props: OrbitControlsProps): JSX.Element;

  // Environment
  export interface EnvironmentProps {
    preset?: string;
    background?: boolean;
    blur?: number;
    files?: string | string[];
    path?: string;
    [key: string]: unknown;
  }

  export function Environment(props: EnvironmentProps): JSX.Element;

  // Grid
  export interface GridProps {
    args?: [number, number];
    cellSize?: number;
    cellThickness?: number;
    cellColor?: string;
    sectionSize?: number;
    sectionThickness?: number;
    sectionColor?: string;
    followCamera?: boolean;
    infiniteGrid?: boolean;
    fadeDistance?: number;
    fadeStrength?: number;
    position?: [number, number, number] | number[];
    [key: string]: unknown;
  }

  export function Grid(props: GridProps): JSX.Element;

  // GLTF loader result
  export interface GLTFResult {
    scene: Group;
    scenes: Group[];
    nodes: Record<string, unknown>;
    materials: Record<string, unknown>;
    animations: AnimationClip[];
    asset: unknown;
  }

  export function useGLTF(
    path: string,
    useDraco?: boolean | string,
    useMeshOpt?: boolean,
    extendLoader?: (loader: unknown) => void,
  ): GLTFResult;
  export namespace useGLTF {
    function preload(path: string, useDraco?: boolean | string): void;
  }

  // Animations
  export interface AnimationsResult {
    actions: Record<string, AnimationAction | null>;
    mixer: AnimationMixer;
    names: string[];
    ref: RefObject<unknown>;
  }

  export function useAnimations(clips: AnimationClip[], ref?: RefObject<unknown>): AnimationsResult;

  // Texture loader
  export function useTexture(
    path: string | string[],
    onLoad?: (texture: Texture | Texture[]) => void,
  ): Texture | Texture[];

  // Html component
  export interface HtmlProps {
    children?: ReactNode;
    className?: string;
    style?: React.CSSProperties;
    transform?: boolean;
    occlude?: boolean | unknown[];
    center?: boolean;
    position?: [number, number, number];
    distanceFactor?: number;
    sprite?: boolean;
    zIndexRange?: [number, number];
    [key: string]: unknown;
  }

  export function Html(props: HtmlProps): JSX.Element;

  // Other utilities
  export function Center(props: { children?: ReactNode; [key: string]: unknown }): JSX.Element;
  export function Float(props: {
    children?: ReactNode;
    speed?: number;
    rotationIntensity?: number;
    floatIntensity?: number;
    [key: string]: unknown;
  }): JSX.Element;

  export interface ContactShadowsProps {
    opacity?: number;
    scale?: number | [number, number];
    blur?: number;
    far?: number;
    position?: [number, number, number];
    color?: string;
    resolution?: number;
    [key: string]: unknown;
  }

  export function ContactShadows(props: ContactShadowsProps): JSX.Element;

  // Camera
  export function PerspectiveCamera(props: {
    makeDefault?: boolean;
    fov?: number;
    position?: [number, number, number];
    [key: string]: unknown;
  }): JSX.Element;

  // Bounds
  export function Bounds(props: {
    children?: ReactNode;
    fit?: boolean;
    clip?: boolean;
    observe?: boolean;
    margin?: number;
    [key: string]: unknown;
  }): JSX.Element;

  // Progress
  export function useProgress(): {
    active: boolean;
    progress: number;
    errors: string[];
    item: string;
    loaded: number;
    total: number;
  };

  // Preload
  export function Preload(props: { all?: boolean }): JSX.Element;
}
