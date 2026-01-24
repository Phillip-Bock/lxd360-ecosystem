'use client';

import { useAnimations, useGLTF } from '@react-three/drei';
import { useEffect, useRef } from 'react';
import type { AnimationAction, Group, Mesh, MeshStandardMaterial } from 'three';
import { LoopOnce, LoopRepeat } from 'three';

// ============================================================================
// TYPES
// ============================================================================

/** Available animation states for the avatar */
export type AnimationState =
  | 'idle'
  | 'talking'
  | 'thinking'
  | 'win'
  | 'wave'
  | 'nod'
  | 'shake'
  | 'listen'
  | 'point'
  | 'celebrate'
  | 'sad';

/** Animations that play once then return to idle */
const ONE_SHOT_ANIMATIONS: AnimationState[] = ['celebrate', 'win', 'wave', 'nod', 'shake', 'point'];

export interface AvatarModelProps {
  /** Path to the .glb model file */
  modelPath: string;
  /** Current animation to play (controlled) */
  animation?: AnimationState;
  /** Callback when one-shot animation completes */
  onAnimationComplete?: (animation: AnimationState) => void;
  /** Whether to apply premium material overrides */
  premiumMaterials?: boolean;
  /** Environment map intensity for reflections */
  envMapIntensity?: number;
  /** Scale multiplier */
  scale?: number;
  /** Position offset [x, y, z] */
  position?: [number, number, number];
  /** Callback when model loads successfully */
  onLoad?: () => void;
  /** Callback when model fails to load */
  onError?: (error: Error) => void;
}

// ============================================================================
// ANIMATION NAME MAPPING
// ============================================================================

/** Maps animation states to possible animation clip names in the GLB file */
const ANIMATION_ALIASES: Record<AnimationState, string[]> = {
  idle: ['idle', 'Idle', 'IDLE', 'Standing', 'Default', 'Rest', 'Breathing'],
  talking: ['talking', 'Talking', 'TALKING', 'Talk', 'Speak', 'Speaking', 'Conversation'],
  thinking: ['thinking', 'Thinking', 'THINKING', 'Think', 'Ponder', 'Consider'],
  win: ['win', 'Win', 'WIN', 'Victory', 'Celebrate', 'Success', 'Happy'],
  wave: ['wave', 'Wave', 'WAVE', 'Waving', 'Hello', 'Greeting'],
  nod: ['nod', 'Nod', 'NOD', 'Nodding', 'Yes', 'Agree'],
  shake: ['shake', 'Shake', 'SHAKE', 'HeadShake', 'No', 'Disagree'],
  listen: ['listen', 'Listen', 'LISTEN', 'Listening', 'Attention'],
  point: ['point', 'Point', 'POINT', 'Pointing', 'Indicate'],
  celebrate: ['celebrate', 'Celebrate', 'CELEBRATE', 'Celebration', 'Cheer'],
  sad: ['sad', 'Sad', 'SAD', 'Disappointed', 'Sorry'],
};

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * AvatarModel - 3D Character Model Loader with Animation Blending
 *
 * Loads .glb character models and manages animation transitions
 * between various states with smooth cross-fading.
 *
 * Features:
 * - GLTF/GLB model loading
 * - 11 animation states (idle, talking, thinking, win, etc.)
 * - Smooth cross-fade transitions (0.5s)
 * - Premium material overrides for polished SaaS look
 * - Shadow casting support
 */
export function AvatarModel({
  modelPath,
  animation = 'idle',
  onAnimationComplete,
  premiumMaterials = true,
  envMapIntensity = 1.2,
  scale = 1,
  position = [0, 0, 0],
  onLoad,
  onError,
}: AvatarModelProps) {
  const groupRef = useRef<Group>(null);
  const previousAnimationRef = useRef<AnimationState>('idle');
  const hasLoadedRef = useRef(false);
  const currentActionRef = useRef<AnimationAction | null>(null);

  // Load the GLTF model
  const { scene, animations } = useGLTF(modelPath, true, true, (loader) => {
    loader.manager.onError = (url) => {
      onError?.(new Error(`Failed to load model: ${url}`));
    };
  });

  // Set up animation actions
  const { actions, mixer } = useAnimations(animations, groupRef);

  // Track model loaded state
  useEffect(() => {
    if (animations.length > 0 && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
    }
  }, [animations]);

  // Apply premium material overrides for polished look
  useEffect(() => {
    if (!scene) return;

    scene.traverse((child) => {
      if ((child as Mesh).isMesh) {
        const mesh = child as Mesh;
        const material = mesh.material as MeshStandardMaterial;

        if (material.isMeshStandardMaterial) {
          if (premiumMaterials) {
            // Premium tech look - more metallic and reflective
            material.metalness = Math.max(material.metalness, 0.7);
            material.roughness = Math.min(material.roughness, 0.3);
          }
          // Always apply envMapIntensity for that shiny SaaS look
          material.envMapIntensity = envMapIntensity;
          material.needsUpdate = true;
        }

        // Enable shadows
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });

    onLoad?.();
  }, [scene, premiumMaterials, envMapIntensity, onLoad]);

  // Handle animation state changes with cross-fading
  useEffect(() => {
    if (!actions || Object.keys(actions).length === 0) return;

    const fadeTime = 0.5; // Cross-fade duration in seconds
    const actionNames = Object.keys(actions);

    // Find matching action for the animation state
    const findAction = (state: AnimationState): string | null => {
      const aliases = ANIMATION_ALIASES[state] || [];

      // Try exact matches first
      for (const alias of aliases) {
        if (actionNames.includes(alias)) return alias;
      }

      // Try case-insensitive partial matches
      const lowerAliases = aliases.map((a) => a.toLowerCase());
      for (const actionName of actionNames) {
        const lowerName = actionName.toLowerCase();
        for (const alias of lowerAliases) {
          if (lowerName.includes(alias) || alias.includes(lowerName)) {
            return actionName;
          }
        }
      }

      return null;
    };

    const currentActionName = findAction(animation);
    const previousActionName = findAction(previousAnimationRef.current);

    // Fallback to first animation if no match
    const effectiveActionName = currentActionName || actionNames[0];
    if (!effectiveActionName) return;

    const currentAction = actions[effectiveActionName];
    const previousAction = previousActionName ? actions[previousActionName] : null;

    if (!currentAction) return;

    // Cross-fade from previous to current animation
    if (previousAction && previousAction !== currentAction) {
      previousAction.fadeOut(fadeTime);
    }

    // Configure loop mode based on animation type
    const isOneShot = ONE_SHOT_ANIMATIONS.includes(animation);
    if (isOneShot) {
      // Play once then call completion callback
      currentAction.setLoop(LoopOnce, 1);
      currentAction.clampWhenFinished = true;
    } else {
      // Loop continuously for talking, idle, thinking, etc.
      currentAction.setLoop(LoopRepeat, Number.POSITIVE_INFINITY);
      currentAction.clampWhenFinished = false;
    }

    currentAction.reset().fadeIn(fadeTime).play();
    currentActionRef.current = currentAction;

    // Update previous animation reference
    previousAnimationRef.current = animation;

    // Listen for one-shot animation completion
    const handleFinished = (event: { action: AnimationAction }) => {
      if (event.action === currentAction && isOneShot) {
        onAnimationComplete?.(animation);
      }
    };

    mixer?.addEventListener('finished', handleFinished);

    return () => {
      mixer?.removeEventListener('finished', handleFinished);
    };
  }, [animation, actions, mixer, onAnimationComplete]);

  return (
    <group ref={groupRef} position={position} scale={scale}>
      <primitive object={scene} />
    </group>
  );
}

// Preload helper for performance
export function preloadModel(modelPath: string): void {
  useGLTF.preload(modelPath);
}

export default AvatarModel;
