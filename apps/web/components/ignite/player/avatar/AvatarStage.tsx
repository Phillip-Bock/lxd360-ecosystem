'use client';

import { Environment, OrbitControls } from '@react-three/drei';
import { Canvas, extend } from '@react-three/fiber';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, Sparkles, User } from 'lucide-react';
import { Component, type ErrorInfo, type ReactNode, Suspense, useCallback, useState } from 'react';
import { PlaneGeometry, ShadowMaterial } from 'three';
import { cn } from '@/lib/utils';
import { type AnimationState, AvatarModel } from './AvatarModel';

// ============================================================================
// ERROR BOUNDARY FOR REACT 19 COMPATIBILITY
// ============================================================================

interface R3FErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface R3FErrorBoundaryState {
  hasError: boolean;
}

class R3FErrorBoundary extends Component<R3FErrorBoundaryProps, R3FErrorBoundaryState> {
  constructor(props: R3FErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): R3FErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Suppress React 19 reconciler errors from @react-three/fiber
    if (error.message?.includes('reconciler') || error.message?.includes('fiber')) {
      console.debug('[AvatarStage] R3F reconciler error suppressed:', error.message);
      return;
    }
    console.error('[AvatarStage] 3D rendering error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Extend R3F with Three.js geometries and materials
extend({ PlaneGeometry, ShadowMaterial });

// ============================================================================
// TYPES
// ============================================================================

export type AvatarPersona = 'cortex' | 'neuro' | 'ignite' | 'inspire';

export interface AvatarStageProps {
  /** Selected avatar persona */
  persona?: AvatarPersona;
  /** Custom model path (overrides persona) */
  modelPath?: string;
  /** Current animation to play (controlled) */
  animation?: AnimationState;
  /** Callback when one-shot animation completes */
  onAnimationComplete?: (animation: AnimationState) => void;
  /** Whether controls are enabled */
  enableControls?: boolean;
  /** Additional class name */
  className?: string;
  /** Background color */
  backgroundColor?: string;
  /** Height of the stage */
  height?: number | string;
}

// ============================================================================
// PERSONA MODEL MAPPING
// ============================================================================

const PERSONA_MODELS: Record<AvatarPersona, string> = {
  cortex: '/models/cortex.glb',
  neuro: '/models/neuro.glb',
  ignite: '/models/ignite.glb',
  inspire: '/models/inspire.glb',
};

// ============================================================================
// LOADING FALLBACK
// ============================================================================

function LoadingFallback() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex items-center justify-center"
    >
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <div className="h-12 w-12 rounded-full bg-lxd-primary/20 animate-pulse" />
          <Loader2 className="absolute inset-0 m-auto h-6 w-6 text-lxd-primary animate-spin" />
        </div>
        <span className="text-xs text-muted-foreground">Loading avatar...</span>
      </div>
    </motion.div>
  );
}

// ============================================================================
// ERROR FALLBACK (2D Avatar with Pulse Effect)
// ============================================================================

interface ErrorFallbackProps {
  persona?: AvatarPersona;
}

function ErrorFallback({ persona }: ErrorFallbackProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="absolute inset-0 flex items-center justify-center"
    >
      <div className="relative">
        {/* Pulse rings */}
        <div className="absolute inset-0 animate-ping">
          <div className="h-full w-full rounded-full bg-lxd-primary/20" />
        </div>
        <div className="absolute inset-0 animate-pulse" style={{ animationDelay: '0.5s' }}>
          <div className="h-full w-full rounded-full bg-lxd-primary/30" />
        </div>

        {/* Avatar icon */}
        <div
          className={cn(
            'relative flex h-20 w-20 items-center justify-center rounded-full',
            'bg-gradient-to-br from-lxd-primary/30 to-lxd-primary/10',
            'border-2 border-lxd-primary/40',
            'shadow-[0_0_30px_rgba(37,99,235,0.3)]',
          )}
        >
          {persona ? (
            <Sparkles className="h-8 w-8 text-lxd-primary" />
          ) : (
            <User className="h-8 w-8 text-lxd-primary" />
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// SCENE LIGHTING
// ============================================================================

function StudioLighting() {
  return (
    <>
      {/* Ambient fill light */}
      <ambientLight intensity={0.5} color="#ffffff" />

      {/* Main key light (top-right) */}
      <directionalLight
        position={[3, 4, 2]}
        intensity={1.5}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={10}
        shadow-camera-near={0.1}
        shadow-camera-left={-3}
        shadow-camera-right={3}
        shadow-camera-top={3}
        shadow-camera-bottom={-3}
      />

      {/* Fill light (left) */}
      <directionalLight position={[-2, 2, 2]} intensity={0.7} color="#e0e7ff" />

      {/* Rim light (back-right) - LXD360 Blue tint */}
      <spotLight
        position={[2, 2, -3]}
        intensity={1.2}
        color="#2563EB"
        angle={0.5}
        penumbra={0.5}
        castShadow={false}
      />

      {/* Bottom fill (subtle) */}
      <pointLight position={[0, -1, 2]} intensity={0.3} color="#94a3b8" />
    </>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * AvatarStage - Studio-Lit 3D Avatar Viewer
 *
 * A professional-grade 3D viewer with cinematic lighting for
 * displaying character models as AI assistants.
 *
 * Features:
 * - Studio lighting setup (key, fill, rim)
 * - Environment reflections
 * - Narrow FOV camera (head/chest shot)
 * - Smooth loading transitions
 * - Graceful fallback to 2D avatar
 *
 * @example
 * ```tsx
 * <AvatarStage
 *   persona="ignite"
 *   animation="talking"
 *   onAnimationComplete={(anim) => setAnimation('idle')}
 *   height={300}
 * />
 * ```
 */
export function AvatarStage({
  persona = 'ignite',
  modelPath,
  animation = 'idle',
  onAnimationComplete,
  enableControls = false,
  className,
  backgroundColor = 'transparent',
  height = 200,
}: AvatarStageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Determine model path
  const resolvedModelPath = modelPath || PERSONA_MODELS[persona];

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    setHasError(false);
  }, []);

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoaded(false);
  }, []);

  return (
    <div
      className={cn('relative overflow-hidden rounded-xl', className)}
      style={{
        height: typeof height === 'number' ? `${height}px` : height,
        backgroundColor,
      }}
    >
      <AnimatePresence mode="wait">
        {hasError ? (
          <ErrorFallback key="error" persona={persona} />
        ) : (
          <>
            {!isLoaded && <LoadingFallback key="loading" />}

            <R3FErrorBoundary fallback={<ErrorFallback persona={persona} />}>
              <motion.div
                key="canvas"
                initial={{ opacity: 0 }}
                animate={{ opacity: isLoaded ? 1 : 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0"
              >
                <Canvas
                  shadows
                  dpr={[1, 2]}
                  camera={{ position: [0, 1.6, 1.2], fov: 25 }}
                  gl={{
                    antialias: true,
                    alpha: true,
                    powerPreference: 'high-performance',
                  }}
                  style={{ background: backgroundColor }}
                >
                  {/* Orbit controls - limited rotation for portrait framing */}
                  <OrbitControls
                    enablePan={false}
                    enableZoom={enableControls}
                    minPolarAngle={Math.PI / 2.5}
                    maxPolarAngle={Math.PI / 2}
                    minAzimuthAngle={-Math.PI / 6}
                    maxAzimuthAngle={Math.PI / 6}
                    target={[0, 1.4, 0]}
                  />

                  {/* Studio lighting setup */}
                  <StudioLighting />

                  {/* Environment for reflections */}
                  <Environment preset="city" />

                  {/* Ground plane for shadows */}
                  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
                    <planeGeometry args={[10, 10]} />
                    <shadowMaterial opacity={0.3} />
                  </mesh>

                  {/* Avatar model */}
                  <Suspense fallback={null}>
                    <AvatarModel
                      modelPath={resolvedModelPath}
                      animation={animation}
                      onAnimationComplete={onAnimationComplete}
                      premiumMaterials={true}
                      scale={1}
                      position={[0, 0, 0]}
                      onLoad={handleLoad}
                      onError={handleError}
                    />
                  </Suspense>
                </Canvas>
              </motion.div>
            </R3FErrorBoundary>
          </>
        )}
      </AnimatePresence>

      {/* Subtle vignette overlay */}
      <div
        className="pointer-events-none absolute inset-0 rounded-xl"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.2) 100%)',
        }}
      />
    </div>
  );
}

export default AvatarStage;
