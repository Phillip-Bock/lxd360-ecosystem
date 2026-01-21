'use client';

import {
  Environment,
  Html,
  OrbitControls,
  useAnimations,
  useGLTF,
  useProgress,
} from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  Camera,
  ChevronDown,
  Maximize2,
  Palette,
  Pause,
  Play,
  RotateCcw,
  Smile,
  User,
} from 'lucide-react';
import * as React from 'react';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsType } from 'three-stdlib';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { ViewerContainer } from './viewer-container';
import { ToolbarButton, ToolbarGroup, ToolbarSeparator, ViewerToolbar } from './viewer-toolbar';

export interface AICharacterViewerProps {
  src: string;
  format: 'glb' | 'vrm' | 'rpm';
  animations?: string[];
  expressions?: string[];
}

interface CharacterProps {
  src: string;
  currentAnimation: string | null;
  isPlaying: boolean;
  onAnimationsLoaded: (animations: string[]) => void;
}

// Loading component
function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2 text-foreground">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-sm">{Math.round(progress)}%</span>
      </div>
    </Html>
  );
}

// Character model component
function Character({ src, currentAnimation, isPlaying, onAnimationsLoaded }: CharacterProps) {
  const group = React.useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(src);
  const { actions, names } = useAnimations(animations, group);

  // Report available animations
  React.useEffect(() => {
    if (names.length > 0) {
      onAnimationsLoaded(names);
    }
  }, [names, onAnimationsLoaded]);

  // Handle animation playback
  React.useEffect(() => {
    // Stop all current animations
    Object.values(actions).forEach((action) => {
      action?.stop();
    });

    if (currentAnimation && actions[currentAnimation]) {
      const action = actions[currentAnimation];
      if (action) {
        action.reset();
        action.setLoop(THREE.LoopRepeat, Infinity);
        if (isPlaying) {
          action.play();
        }
      }
    }
  }, [currentAnimation, isPlaying, actions]);

  // Center the model
  React.useEffect(() => {
    if (scene) {
      const box = new THREE.Box3().setFromObject(scene);
      const center = box.getCenter(new THREE.Vector3());
      scene.position.sub(center);

      // Scale to reasonable size
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      if (maxDim > 2) {
        const scale = 2 / maxDim;
        scene.scale.setScalar(scale);
      }
    }
  }, [scene]);

  return (
    <group ref={group}>
      <primitive object={scene} />
    </group>
  );
}

// Camera controller
function CameraController({
  preset,
  controlsRef,
}: {
  preset: 'full' | 'portrait' | 'closeup';
  controlsRef: React.RefObject<OrbitControlsType | null>;
}) {
  const { camera } = useThree();

  React.useEffect(() => {
    switch (preset) {
      case 'full':
        camera.position.set(0, 0, 4);
        break;
      case 'portrait':
        camera.position.set(0, 0.5, 2);
        break;
      case 'closeup':
        camera.position.set(0, 0.8, 1);
        break;
    }
    camera.lookAt(0, 0, 0);
    if (controlsRef.current) {
      controlsRef.current.target.set(0, preset === 'closeup' ? 0.8 : 0, 0);
      controlsRef.current.update();
    }
  }, [preset, camera, controlsRef]);

  return null;
}

// Auto-rotation controller
function AutoRotateController({
  autoRotate,
  controlsRef,
}: {
  autoRotate: boolean;
  controlsRef: React.RefObject<OrbitControlsType | null>;
}) {
  useFrame(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate;
    }
  });

  return null;
}

const BACKGROUND_COLORS = [
  { value: '#1a1a1a', label: 'Dark' },
  { value: '#ffffff', label: 'Light' },
  { value: '#2d3748', label: 'Slate' },
  { value: '#4a5568', label: 'Gray' },
  { value: 'gradient', label: 'Gradient' },
];

const CAMERA_PRESETS = [
  { value: 'full', label: 'Full Body', icon: User },
  { value: 'portrait', label: 'Portrait', icon: User },
  { value: 'closeup', label: 'Close-up', icon: User },
] as const;

export function AICharacterViewer({
  src,
  format,
  animations: providedAnimations,
  expressions: providedExpressions,
}: AICharacterViewerProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const controlsRef = React.useRef<OrbitControlsType>(null);

  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [autoRotate, setAutoRotate] = React.useState(false);
  const [backgroundColor, setBackgroundColor] = React.useState('#2d3748');
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [cameraPreset, setCameraPreset] = React.useState<'full' | 'portrait' | 'closeup'>('full');

  // Animation state
  const [availableAnimations, setAvailableAnimations] = React.useState<string[]>(
    providedAnimations || [],
  );
  const [currentAnimation, setCurrentAnimation] = React.useState<string | null>(null);
  const [isPlaying, setIsPlaying] = React.useState(true);

  // Expressions state
  const [availableExpressions] = React.useState<string[]>(providedExpressions || []);
  const [currentExpression, setCurrentExpression] = React.useState<string | null>(null);

  // Check format support
  const isSupported = format === 'glb' || format === 'vrm' || format === 'rpm';

  const handleAnimationsLoaded = React.useCallback(
    (animations: string[]) => {
      setAvailableAnimations(animations);
      if (animations.length > 0 && !currentAnimation) {
        setCurrentAnimation(animations[0]);
      }
      setIsLoading(false);
    },
    [currentAnimation],
  );

  const toggleFullscreen = React.useCallback(async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      // Silently ignore - fullscreen not supported or user declined
    }
  }, []);

  // Fullscreen change listener
  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Handle unsupported formats
  if (!isSupported) {
    return (
      <ViewerContainer className="min-h-[400px]">
        <div className="flex flex-col items-center justify-center h-full py-12 px-6 text-center">
          <User className="h-16 w-16 text-muted-foreground" />
          <h3 className="mt-4 font-medium text-lg">AI Character</h3>
          <p className="mt-1 text-sm text-muted-foreground uppercase">{format}</p>
          <p className="mt-4 text-sm text-muted-foreground max-w-md">
            This character format is not directly viewable. Download to use in compatible software.
          </p>
          <a
            href={src}
            download
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Download Character
          </a>
        </div>
      </ViewerContainer>
    );
  }

  const backgroundStyle =
    backgroundColor === 'gradient'
      ? { background: 'linear-gradient(180deg, #4a5568 0%, #2d3748 50%, #1a202c 100%)' }
      : { backgroundColor };

  return (
    <ViewerContainer
      isLoading={false}
      error={error}
      onRetry={() => {
        setError(null);
        setIsLoading(true);
      }}
      fullscreen={isFullscreen}
      className="min-h-[500px]"
    >
      <div
        ref={containerRef}
        className={cn('relative w-full h-full', isFullscreen && 'bg-black')}
        style={backgroundStyle}
      >
        {/* Canvas */}
        <Canvas
          camera={{ position: [0, 0, 4], fov: 50 }}
          onError={() => setError('Failed to load character')}
        >
          <React.Suspense fallback={<Loader />}>
            <Character
              src={src}
              currentAnimation={currentAnimation}
              isPlaying={isPlaying}
              onAnimationsLoaded={handleAnimationsLoaded}
            />
            <Environment preset="studio" />
          </React.Suspense>

          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={0.8} />
          <directionalLight position={[-5, 5, -5]} intensity={0.4} />

          <OrbitControls
            ref={controlsRef}
            autoRotate={autoRotate}
            autoRotateSpeed={1}
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={1}
            maxDistance={10}
          />

          <AutoRotateController autoRotate={autoRotate} controlsRef={controlsRef} />
          <CameraController preset={cameraPreset} controlsRef={controlsRef} />
        </Canvas>

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="flex flex-col items-center gap-2 text-brand-primary">
              <div className="h-8 w-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Loading character...</span>
            </div>
          </div>
        )}

        {/* Format badge */}
        <div className="absolute top-3 left-3 bg-background/80 backdrop-blur-xs border rounded-md px-2 py-1 text-xs uppercase">
          {format === 'rpm' ? 'Ready Player Me' : format}
        </div>

        {/* Toolbar */}
        <ViewerToolbar>
          {/* Animation controls */}
          {availableAnimations.length > 0 && (
            <>
              <ToolbarGroup>
                <ToolbarButton
                  icon={isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  label={isPlaying ? 'Pause animation' : 'Play animation'}
                  onClick={() => setIsPlaying(!isPlaying)}
                  active={isPlaying}
                />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="h-8 px-2 flex items-center gap-1 hover:bg-accent rounded-md transition-colors text-sm"
                    >
                      {currentAnimation || 'Select animation'}
                      <ChevronDown className="h-3 w-3" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="max-h-[300px] overflow-auto">
                    {availableAnimations.map((anim) => (
                      <DropdownMenuItem
                        key={anim}
                        onClick={() => setCurrentAnimation(anim)}
                        className={cn(currentAnimation === anim && 'bg-accent')}
                      >
                        {anim}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </ToolbarGroup>
              <ToolbarSeparator />
            </>
          )}

          {/* Expression controls */}
          {availableExpressions.length > 0 && (
            <>
              <ToolbarGroup>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="h-8 px-2 flex items-center gap-1 hover:bg-accent rounded-md transition-colors text-sm"
                    >
                      <Smile className="h-4 w-4 mr-1" />
                      {currentExpression || 'Expression'}
                      <ChevronDown className="h-3 w-3" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem
                      onClick={() => setCurrentExpression(null)}
                      className={cn(!currentExpression && 'bg-accent')}
                    >
                      Neutral
                    </DropdownMenuItem>
                    {availableExpressions.map((expr) => (
                      <DropdownMenuItem
                        key={expr}
                        onClick={() => setCurrentExpression(expr)}
                        className={cn(currentExpression === expr && 'bg-accent')}
                      >
                        {expr}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </ToolbarGroup>
              <ToolbarSeparator />
            </>
          )}

          <ToolbarGroup>
            <ToolbarButton
              icon={autoRotate ? <Pause className="h-4 w-4" /> : <RotateCcw className="h-4 w-4" />}
              label={autoRotate ? 'Stop rotation' : 'Auto rotate'}
              onClick={() => setAutoRotate(!autoRotate)}
              active={autoRotate}
            />
          </ToolbarGroup>

          <ToolbarSeparator />

          {/* Camera presets */}
          <ToolbarGroup>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="h-8 w-8 flex items-center justify-center hover:bg-accent rounded-md transition-colors"
                >
                  <Camera className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center">
                {CAMERA_PRESETS.map((preset) => (
                  <DropdownMenuItem
                    key={preset.value}
                    onClick={() => setCameraPreset(preset.value)}
                    className={cn(cameraPreset === preset.value && 'bg-accent')}
                  >
                    {preset.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </ToolbarGroup>

          <ToolbarSeparator />

          {/* Background color */}
          <ToolbarGroup>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="h-8 w-8 flex items-center justify-center hover:bg-accent rounded-md transition-colors"
                >
                  <Palette className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center">
                {BACKGROUND_COLORS.map((color) => (
                  <DropdownMenuItem
                    key={color.value}
                    onClick={() => setBackgroundColor(color.value)}
                    className={cn(backgroundColor === color.value && 'bg-accent')}
                  >
                    <div
                      className="h-4 w-4 rounded border mr-2"
                      style={{
                        backgroundColor: color.value === 'gradient' ? undefined : color.value,
                        backgroundImage:
                          color.value === 'gradient'
                            ? 'linear-gradient(180deg, #4a5568, #1a202c)'
                            : undefined,
                      }}
                    />
                    {color.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </ToolbarGroup>

          <ToolbarSeparator />

          <ToolbarGroup>
            <ToolbarButton
              icon={<Maximize2 className="h-4 w-4" />}
              label="Fullscreen"
              shortcut="F"
              onClick={toggleFullscreen}
            />
          </ToolbarGroup>
        </ViewerToolbar>
      </div>
    </ViewerContainer>
  );
}
