'use client';

import {
  ContactShadows,
  Environment,
  OrbitControls,
  useAnimations,
  useGLTF,
} from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { Suspense, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { AI_PERSONAS, type AIPersonaId } from '@/lib/ai-personas/persona-config';
import {
  ANIMATION_CLIPS,
  type CharacterState,
  LOOPING_STATES,
  TRANSITION_DURATION,
} from '@/lib/three/character-states';

interface CharacterModelProps {
  modelUrl: string;
  state: CharacterState;
  mouthOpenness?: number;
}

function CharacterModel({ modelUrl, state, mouthOpenness = 0 }: CharacterModelProps) {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(modelUrl);
  const { actions, mixer } = useAnimations(animations, group);

  const clonedScene = useMemo(() => scene.clone(), [scene]);
  const currentAction = useRef<THREE.AnimationAction | null>(null);

  // Handle animation state changes
  useEffect(() => {
    const clipName = ANIMATION_CLIPS[state];
    const action = actions[clipName];

    if (!action) {
      // Try fallback to Idle if specific animation not found
      const fallbackAction = actions.Idle || Object.values(actions)[0];
      if (fallbackAction) {
        fallbackAction.reset().fadeIn(0.3).play();
        currentAction.current = fallbackAction;
      }
      return;
    }

    const duration = TRANSITION_DURATION[state];
    const shouldLoop = LOOPING_STATES.includes(state);

    action.setLoop(shouldLoop ? THREE.LoopRepeat : THREE.LoopOnce, shouldLoop ? Infinity : 1);
    action.clampWhenFinished = !shouldLoop;

    if (currentAction.current && currentAction.current !== action) {
      action.reset().crossFadeFrom(currentAction.current, duration, true).play();
    } else {
      action.reset().fadeIn(duration).play();
    }

    currentAction.current = action;
  }, [state, actions]);

  // Lip sync via morph targets
  useEffect(() => {
    clonedScene.traverse((child) => {
      if (
        child instanceof THREE.SkinnedMesh &&
        child.morphTargetInfluences &&
        child.morphTargetDictionary
      ) {
        const mouthMorphNames = ['mouthOpen', 'jawOpen', 'viseme_aa', 'A', 'mouth_open'];
        for (const name of mouthMorphNames) {
          const idx = child.morphTargetDictionary[name];
          if (idx !== undefined) {
            child.morphTargetInfluences[idx] = mouthOpenness;
            break;
          }
        }
      }
    });
  }, [mouthOpenness, clonedScene]);

  // Subtle idle animation
  useFrame((_, delta) => {
    if (group.current && state === 'idle') {
      group.current.position.y = Math.sin(Date.now() * 0.001) * 0.02 - 1;
    }
    mixer?.update(delta);
  });

  return (
    <group ref={group} position={[0, -1, 0]}>
      <primitive object={clonedScene} />
    </group>
  );
}

interface Character3DProps {
  modelUrl: string;
  personaId: AIPersonaId;
  state: CharacterState;
  mouthOpenness?: number;
  className?: string;
}

export function Character3D({
  modelUrl,
  personaId,
  state,
  mouthOpenness,
  className,
}: Character3DProps) {
  const persona = AI_PERSONAS[personaId];

  return (
    <div className={className}>
      <Canvas
        shadows
        camera={{ position: [0, 0, 2.5], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
        <pointLight position={[-3, 3, -3]} intensity={0.5} color={persona.accentColor} />
        <pointLight position={[3, -2, 3]} intensity={0.3} color={persona.primaryColor} />

        <Suspense fallback={null}>
          <CharacterModel modelUrl={modelUrl} state={state} mouthOpenness={mouthOpenness} />
          <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={5} blur={2} />
          <Environment preset="city" />
        </Suspense>

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 4}
        />
      </Canvas>
    </div>
  );
}
