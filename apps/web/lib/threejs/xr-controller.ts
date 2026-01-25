/**
 * XR Controller - Phase 19
 * WebXR session management and VR controls
 */

import * as THREE from 'three';
import { logger } from '@/lib/logger';
import type { Vector3, XRConfig as XRConfigType } from '@/types/studio/immersive';

const log = logger.scope('XRManager');

// Re-export XRConfig type for use by hooks
export type { XRConfigType as XRConfig };

// =============================================================================
// TYPES
// =============================================================================

export interface XRSessionState {
  isSupported: boolean;
  isPresenting: boolean;
  sessionMode: 'immersive-vr' | 'immersive-ar' | null;
  controllers: XRControllerState[];
  referenceSpace: XRReferenceSpace | null;
  error: string | null;
}

export interface XRControllerState {
  index: number;
  connected: boolean;
  hand: 'left' | 'right' | 'none';
  position: Vector3;
  rotation: Vector3;
  buttons: {
    trigger: number;
    grip: number;
    thumbstick: { x: number; y: number };
    buttons: boolean[];
  };
}

export interface XRControllerCallbacks {
  onSessionStart?: () => void;
  onSessionEnd?: () => void;
  onControllerConnect?: (index: number, hand: string) => void;
  onControllerDisconnect?: (index: number) => void;
  onSelect?: (controller: XRControllerState) => void;
  onSqueeze?: (controller: XRControllerState) => void;
  onTeleport?: (position: Vector3) => void;
}

// =============================================================================
// XR MANAGER CLASS
// =============================================================================

export class XRManager {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private config: XRConfigType;
  private callbacks: XRControllerCallbacks;

  private session: XRSession | null = null;
  private referenceSpace: XRReferenceSpace | null = null;
  private controllers: THREE.Group[] = [];
  private controllerGrips: THREE.Group[] = [];
  private controllerStates: XRControllerState[] = [];

  // Teleportation
  private teleportRaycaster: THREE.Raycaster;
  private teleportMarker: THREE.Mesh | null = null;
  private teleportLine: THREE.Line | null = null;
  private teleportValid = false;
  private teleportTarget: THREE.Vector3 = new THREE.Vector3();

  // Comfort
  private vignette: THREE.Mesh | null = null;
  private vignetteIntensity = 0;

  constructor(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera,
    config: XRConfigType,
    callbacks: XRControllerCallbacks = {},
  ) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.config = config;
    this.callbacks = callbacks;

    this.teleportRaycaster = new THREE.Raycaster();

    this.setupControllers();
    this.setupTeleportation();
    this.setupComfort();
  }

  // ==========================================================================
  // SESSION MANAGEMENT
  // ==========================================================================

  /**
   * Check if WebXR is supported
   */
  async checkSupport(): Promise<{ vr: boolean; ar: boolean }> {
    const result = { vr: false, ar: false };

    if ('xr' in navigator) {
      const xr = navigator.xr as XRSystem;
      result.vr = await xr.isSessionSupported('immersive-vr');
      result.ar = await xr.isSessionSupported('immersive-ar');
    }

    return result;
  }

  /**
   * Start XR session
   */
  async startSession(mode: 'immersive-vr' | 'immersive-ar' = 'immersive-vr'): Promise<boolean> {
    if (!('xr' in navigator)) {
      log.error('WebXR not supported');
      return false;
    }

    const xr = navigator.xr as XRSystem;

    try {
      // Build session options
      const sessionInit: XRSessionInit = {
        requiredFeatures: this.config.requiredFeatures as string[],
        optionalFeatures: this.config.optionalFeatures as string[],
      };

      // Request session
      this.session = await xr.requestSession(mode, sessionInit);

      // Set up session
      this.session.addEventListener('end', this.onSessionEnd.bind(this));

      // Set up renderer
      await this.renderer.xr.setSession(this.session);

      // Get reference space
      this.referenceSpace = await this.session.requestReferenceSpace(
        this.config.referenceSpaceType as XRReferenceSpaceType,
      );

      this.callbacks.onSessionStart?.();
      return true;
    } catch (error) {
      log.error('Failed to start XR session', error);
      return false;
    }
  }

  /**
   * End XR session
   */
  async endSession(): Promise<void> {
    if (this.session) {
      await this.session.end();
    }
  }

  private onSessionEnd(): void {
    this.session = null;
    this.referenceSpace = null;
    this.callbacks.onSessionEnd?.();
  }

  /**
   * Get current state
   */
  getState(): XRSessionState {
    return {
      isSupported: 'xr' in navigator,
      isPresenting: this.session !== null,
      sessionMode: this.session ? 'immersive-vr' : null,
      controllers: this.controllerStates,
      referenceSpace: this.referenceSpace,
      error: null,
    };
  }

  // ==========================================================================
  // CONTROLLERS
  // ==========================================================================

  private setupControllers(): void {
    // Set up two controllers
    for (let i = 0; i < 2; i++) {
      const controller = this.renderer.xr.getController(i);
      const controllerGrip = this.renderer.xr.getControllerGrip(i);

      controller.addEventListener('selectstart', () => this.onSelectStart(i));
      controller.addEventListener('selectend', () => this.onSelectEnd(i));
      controller.addEventListener('squeezestart', () => this.onSqueezeStart(i));
      controller.addEventListener('squeezeend', () => this.onSqueezeEnd(i));
      controller.addEventListener('connected', (event: THREE.Event & { data?: XRInputSource }) =>
        this.onControllerConnected(i, event),
      );
      controller.addEventListener('disconnected', () => this.onControllerDisconnected(i));

      this.scene.add(controller);
      this.scene.add(controllerGrip);

      this.controllers.push(controller);
      this.controllerGrips.push(controllerGrip);

      // Initialize state
      this.controllerStates.push({
        index: i,
        connected: false,
        hand: 'none',
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        buttons: {
          trigger: 0,
          grip: 0,
          thumbstick: { x: 0, y: 0 },
          buttons: [],
        },
      });

      // Add pointer ray if configured
      if (this.config.controllers.pointerRay) {
        const lineGeometry = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(0, 0, -10),
        ]);
        const lineMaterial = new THREE.LineBasicMaterial({
          color: this.config.controllers.rayColor,
          opacity: 0.5,
          transparent: true,
        });
        const line = new THREE.Line(lineGeometry, lineMaterial);
        controller.add(line);
      }
    }
  }

  private onControllerConnected(
    index: number,
    event: THREE.Event & { data?: XRInputSource },
  ): void {
    const inputSource = event.data;
    if (!inputSource) return;
    const hand = inputSource.handedness || 'none';

    this.controllerStates[index] = {
      ...this.controllerStates[index],
      connected: true,
      hand: hand as 'left' | 'right' | 'none',
    };

    // Add controller model if configured
    if (this.config.controllers.showControllers) {
      const geometry = new THREE.CylinderGeometry(0.01, 0.02, 0.1, 8);
      const material = new THREE.MeshStandardMaterial({
        color: hand === 'left' ? '#4444ff' : '#ff4444',
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.rotation.x = -Math.PI / 2;
      this.controllerGrips[index].add(mesh);
    }

    this.callbacks.onControllerConnect?.(index, hand);
  }

  private onControllerDisconnected(index: number): void {
    this.controllerStates[index].connected = false;
    this.callbacks.onControllerDisconnect?.(index);
  }

  private onSelectStart(index: number): void {
    const state = this.controllerStates[index];
    state.buttons.trigger = 1;

    // Handle teleportation
    if (this.config.teleportation.enabled && this.config.teleportation.button === 'trigger') {
      this.startTeleportAim(index);
    }

    this.callbacks.onSelect?.(state);
  }

  private onSelectEnd(index: number): void {
    const state = this.controllerStates[index];
    state.buttons.trigger = 0;

    // Execute teleport
    if (this.config.teleportation.enabled && this.teleportValid) {
      this.executeTeleport();
    }

    this.hideTeleportVisuals();
  }

  private onSqueezeStart(index: number): void {
    const state = this.controllerStates[index];
    state.buttons.grip = 1;

    if (this.config.teleportation.enabled && this.config.teleportation.button === 'grip') {
      this.startTeleportAim(index);
    }

    this.callbacks.onSqueeze?.(state);
  }

  private onSqueezeEnd(index: number): void {
    const state = this.controllerStates[index];
    state.buttons.grip = 0;

    if (this.config.teleportation.enabled && this.teleportValid) {
      this.executeTeleport();
    }

    this.hideTeleportVisuals();
  }

  // ==========================================================================
  // TELEPORTATION
  // ==========================================================================

  private setupTeleportation(): void {
    if (!this.config.teleportation.enabled) return;

    // Create teleport marker
    const markerGeometry = new THREE.RingGeometry(0.15, 0.2, 32);
    markerGeometry.rotateX(-Math.PI / 2);
    const markerMaterial = new THREE.MeshBasicMaterial({
      color: this.config.teleportation.arcColor,
      opacity: 0.8,
      transparent: true,
    });
    this.teleportMarker = new THREE.Mesh(markerGeometry, markerMaterial);
    this.teleportMarker.visible = false;
    this.scene.add(this.teleportMarker);

    // Create teleport line
    const lineGeometry = new THREE.BufferGeometry();
    const points = new Array(50).fill(null).map(() => new THREE.Vector3());
    lineGeometry.setFromPoints(points);
    const lineMaterial = new THREE.LineBasicMaterial({
      color: this.config.teleportation.arcColor,
      opacity: 0.5,
      transparent: true,
    });
    this.teleportLine = new THREE.Line(lineGeometry, lineMaterial);
    this.teleportLine.visible = false;
    this.scene.add(this.teleportLine);
  }

  private startTeleportAim(_controllerIndex: number): void {
    if (!this.teleportMarker || !this.teleportLine) return;

    this.teleportMarker.visible = true;
    this.teleportLine.visible = true;
  }

  private hideTeleportVisuals(): void {
    if (this.teleportMarker) this.teleportMarker.visible = false;
    if (this.teleportLine) this.teleportLine.visible = false;
    this.teleportValid = false;
  }

  private updateTeleportAim(controller: THREE.Group): void {
    if (!this.teleportMarker || !this.teleportLine) return;

    // Cast ray from controller
    const tempMatrix = new THREE.Matrix4();
    tempMatrix.identity().extractRotation(controller.matrixWorld);

    this.teleportRaycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
    this.teleportRaycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);

    // Check for floor intersection (simplified - real implementation would use physics)
    const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const intersection = new THREE.Vector3();

    if (this.teleportRaycaster.ray.intersectPlane(floorPlane, intersection)) {
      this.teleportTarget.copy(intersection);
      this.teleportMarker.position.copy(intersection);
      this.teleportValid = true;

      // Update marker color based on validity
      const isValidSurface = this.checkValidTeleportSurface(intersection);
      (this.teleportMarker.material as THREE.MeshBasicMaterial).color.set(
        isValidSurface
          ? this.config.teleportation.arcColor
          : this.config.teleportation.invalidColor,
      );
      this.teleportValid = isValidSurface;

      // Update arc line
      this.updateTeleportArc(controller.position, intersection);
    } else {
      this.teleportValid = false;
    }
  }

  private checkValidTeleportSurface(position: THREE.Vector3): boolean {
    // Simplified check - real implementation would check against tagged surfaces or navmesh
    return position.y >= -0.1 && position.y <= 0.1;
  }

  private updateTeleportArc(start: THREE.Vector3, end: THREE.Vector3): void {
    if (!this.teleportLine) return;

    const points: THREE.Vector3[] = [];
    const segments = 50;

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const x = start.x + (end.x - start.x) * t;
      const z = start.z + (end.z - start.z) * t;
      // Parabolic arc
      const y = start.y + (end.y - start.y) * t + Math.sin(t * Math.PI) * 0.5;
      points.push(new THREE.Vector3(x, y, z));
    }

    this.teleportLine.geometry.setFromPoints(points);
  }

  private executeTeleport(): void {
    if (!this.teleportValid) return;

    if (this.config.teleportation.fadeTransition) {
      this.fadeOut(() => {
        this.movePlayer(this.teleportTarget);
        this.fadeIn();
      });
    } else {
      this.movePlayer(this.teleportTarget);
    }

    this.callbacks.onTeleport?.({
      x: this.teleportTarget.x,
      y: this.teleportTarget.y,
      z: this.teleportTarget.z,
    });
  }

  private movePlayer(position: THREE.Vector3): void {
    // Move the camera rig (parent of camera)
    const cameraRig = this.camera.parent;
    if (cameraRig) {
      cameraRig.position.set(position.x, position.y, position.z);
    }
  }

  // ==========================================================================
  // COMFORT
  // ==========================================================================

  private setupComfort(): void {
    if (this.config.comfort.vignette) {
      // Create vignette effect (simplified - would use shader in production)
      const vignetteGeometry = new THREE.PlaneGeometry(2, 2);
      const vignetteMaterial = new THREE.ShaderMaterial({
        uniforms: {
          intensity: { value: 0 },
        },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = vec4(position.xy, 0.0, 1.0);
          }
        `,
        fragmentShader: `
          uniform float intensity;
          varying vec2 vUv;
          void main() {
            vec2 center = vUv - 0.5;
            float dist = length(center);
            float vignette = smoothstep(0.3, 0.7, dist) * intensity;
            gl_FragColor = vec4(0.0, 0.0, 0.0, vignette);
          }
        `,
        transparent: true,
        depthTest: false,
        depthWrite: false,
      });

      this.vignette = new THREE.Mesh(vignetteGeometry, vignetteMaterial);
      this.vignette.frustumCulled = false;
      this.vignette.renderOrder = 9999;
    }
  }

  /**
   * Apply vignette based on motion
   */
  applyMotionVignette(speed: number): void {
    if (!this.vignette) return;

    const targetIntensity = Math.min(speed * this.config.comfort.vignetteIntensity, 1);
    this.vignetteIntensity = THREE.MathUtils.lerp(this.vignetteIntensity, targetIntensity, 0.1);

    const material = this.vignette.material as THREE.ShaderMaterial;
    material.uniforms.intensity.value = this.vignetteIntensity;
  }

  /**
   * Snap turn
   */
  snapTurn(direction: 'left' | 'right'): void {
    if (!this.config.comfort.snapTurn) return;

    const angle = this.config.comfort.snapTurnAngle * (direction === 'left' ? 1 : -1);
    const cameraRig = this.camera.parent;

    if (cameraRig) {
      cameraRig.rotateY(THREE.MathUtils.degToRad(angle));
    }
  }

  // ==========================================================================
  // FADE EFFECTS
  // ==========================================================================

  private fadeOut(onComplete: () => void): void {
    // Simplified fade - would animate in production
    setTimeout(onComplete, this.config.teleportation.fadeDuration / 2);
  }

  private fadeIn(): void {
    // Simplified fade - would animate in production
  }

  // ==========================================================================
  // UPDATE
  // ==========================================================================

  /**
   * Update controller states and handle input
   */
  update(): void {
    if (!this.session) return;

    // Update controller positions
    for (let i = 0; i < this.controllers.length; i++) {
      const controller = this.controllers[i];
      const state = this.controllerStates[i];

      if (state.connected) {
        state.position = {
          x: controller.position.x,
          y: controller.position.y,
          z: controller.position.z,
        };
        state.rotation = {
          x: THREE.MathUtils.radToDeg(controller.rotation.x),
          y: THREE.MathUtils.radToDeg(controller.rotation.y),
          z: THREE.MathUtils.radToDeg(controller.rotation.z),
        };

        // Update teleport aim if active
        if (this.teleportLine?.visible) {
          this.updateTeleportAim(controller);
        }
      }
    }
  }

  // ==========================================================================
  // CLEANUP
  // ==========================================================================

  dispose(): void {
    this.endSession();

    // Remove controllers
    this.controllers.forEach((controller) => {
      this.scene.remove(controller);
    });
    this.controllerGrips.forEach((grip) => {
      this.scene.remove(grip);
    });

    // Remove teleport visuals
    if (this.teleportMarker) {
      this.scene.remove(this.teleportMarker);
      this.teleportMarker.geometry.dispose();
      (this.teleportMarker.material as THREE.Material).dispose();
    }
    if (this.teleportLine) {
      this.scene.remove(this.teleportLine);
      this.teleportLine.geometry.dispose();
      (this.teleportLine.material as THREE.Material).dispose();
    }

    // Remove vignette
    if (this.vignette) {
      this.vignette.geometry.dispose();
      (this.vignette.material as THREE.Material).dispose();
    }
  }
}

// =============================================================================
// FACTORY FUNCTION
// =============================================================================

export function createXRManager(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  config: XRConfigType,
  callbacks?: XRControllerCallbacks,
): XRManager {
  return new XRManager(renderer, scene, camera, config, callbacks);
}

// =============================================================================
// DEFAULT CONFIG
// =============================================================================

export const DEFAULT_XR_CONFIG: XRConfigType = {
  enableVR: true,
  enableAR: false,
  requiredFeatures: ['local-floor'],
  optionalFeatures: ['hand-tracking'],
  referenceSpaceType: 'local-floor',
  controllers: {
    showControllers: true,
    modelType: 'default',
    pointerRay: true,
    rayColor: '#00ff00',
    haptics: true,
  },
  handTracking: false,
  teleportation: {
    enabled: true,
    button: 'trigger',
    validSurfaces: 'floor',
    arcColor: '#00ff00',
    invalidColor: '#ff0000',
    fadeTransition: true,
    fadeDuration: 200,
  },
  comfort: {
    vignette: true,
    vignetteIntensity: 0.5,
    snapTurn: true,
    snapTurnAngle: 45,
    smoothTurnSpeed: 60,
    seatedMode: false,
    seatedHeightOffset: 0,
  },
};
