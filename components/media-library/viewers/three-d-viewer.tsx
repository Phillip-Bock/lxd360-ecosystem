'use client';

import { Center, Environment, Html, OrbitControls, useGLTF, useProgress } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  Box,
  Grid3X3,
  Info,
  Maximize2,
  Palette,
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
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

export interface ThreeDViewerProps {
  src: string;
  format: 'glb' | 'gltf' | 'fbx' | 'obj' | 'usdz';
  autoRotate?: boolean;
  backgroundColor?: string;
}

interface ModelInfo {
  vertices: number;
  faces: number;
  meshes: number;
}

interface ModelProps {
  src: string;
  wireframe: boolean;
  onLoad: (info: ModelInfo) => void;
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

// 3D Model component
function Model({ src, wireframe, onLoad }: ModelProps) {
  const { scene } = useGLTF(src);
  const modelRef = React.useRef<THREE.Group>(null);

  React.useEffect(() => {
    if (!scene) return;

    let vertices = 0;
    let faces = 0;
    let meshes = 0;

    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        meshes++;
        child.material = child.material.clone();
        if (child.material instanceof THREE.MeshStandardMaterial) {
          child.material.wireframe = wireframe;
        }

        const geometry = child.geometry;
        if (geometry.index) {
          faces += geometry.index.count / 3;
        } else if (geometry.attributes.position) {
          faces += geometry.attributes.position.count / 3;
        }
        if (geometry.attributes.position) {
          vertices += geometry.attributes.position.count;
        }
      }
    });

    onLoad({ vertices, faces: Math.round(faces), meshes });
  }, [scene, wireframe, onLoad]);

  return (
    <Center>
      <primitive ref={modelRef} object={scene} />
    </Center>
  );
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

// Camera controller for reset
function CameraController({
  resetTrigger,
  controlsRef,
}: {
  resetTrigger: number;
  controlsRef: React.RefObject<OrbitControlsType | null>;
}) {
  const { camera } = useThree();

  React.useEffect(() => {
    if (resetTrigger > 0) {
      camera.position.set(0, 0, 5);
      camera.lookAt(0, 0, 0);
      if (controlsRef.current) {
        controlsRef.current.reset();
      }
    }
  }, [resetTrigger, camera, controlsRef]);

  return null;
}

const BACKGROUND_COLORS = [
  { value: '#1a1a1a', label: 'Dark' },
  { value: '#ffffff', label: 'Light' },
  { value: '#2d3748', label: 'Slate' },
  { value: '#1e3a5f', label: 'Navy' },
  { value: '#3d5a3d', label: 'Forest' },
  { value: 'transparent', label: 'Transparent' },
];

const ENVIRONMENTS = [
  { value: 'studio', label: 'Studio' },
  { value: 'sunset', label: 'Sunset' },
  { value: 'dawn', label: 'Dawn' },
  { value: 'night', label: 'Night' },
  { value: 'warehouse', label: 'Warehouse' },
  { value: 'forest', label: 'Forest' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'city', label: 'City' },
  { value: 'park', label: 'Park' },
  { value: 'lobby', label: 'Lobby' },
];

export function ThreeDViewer({
  src,
  format,
  autoRotate: initialAutoRotate = false,
  backgroundColor: initialBgColor = '#1a1a1a',
}: ThreeDViewerProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const controlsRef = React.useRef<OrbitControlsType>(null);

  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [autoRotate, setAutoRotate] = React.useState(initialAutoRotate);
  const [wireframe, setWireframe] = React.useState(false);
  const [backgroundColor, setBackgroundColor] = React.useState(initialBgColor);
  const [environment, setEnvironment] = React.useState<string>('studio');
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [showInfo, setShowInfo] = React.useState(false);
  const [modelInfo, setModelInfo] = React.useState<ModelInfo | null>(null);
  const [resetTrigger, setResetTrigger] = React.useState(0);

  // Check format support
  const isSupported = format === 'glb' || format === 'gltf';

  const handleModelLoad = React.useCallback((info: ModelInfo) => {
    setModelInfo(info);
    setIsLoading(false);
  }, []);

  const handleError = React.useCallback(() => {
    setError('Failed to load 3D model');
    setIsLoading(false);
  }, []);

  const handleResetCamera = React.useCallback(() => {
    setResetTrigger((t) => t + 1);
  }, []);

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
          <Box className="h-16 w-16 text-muted-foreground" />
          <h3 className="mt-4 font-medium text-lg">3D Model</h3>
          <p className="mt-1 text-sm text-muted-foreground uppercase">{format}</p>
          <p className="mt-4 text-sm text-muted-foreground max-w-md">
            This 3D format ({format.toUpperCase()}) requires conversion for web preview. Currently
            supported formats: GLB, GLTF.
          </p>
          <a
            href={src}
            download
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Download Model
          </a>
        </div>
      </ViewerContainer>
    );
  }

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
        style={{
          backgroundColor:
            backgroundColor === 'transparent' ? 'var(--background)' : backgroundColor,
        }}
      >
        {/* Canvas */}
        <Canvas
          camera={{ position: [0, 0, 5], fov: 50 }}
          onError={handleError}
          gl={{ preserveDrawingBuffer: true, alpha: true }}
        >
          <React.Suspense fallback={<Loader />}>
            <Model src={src} wireframe={wireframe} onLoad={handleModelLoad} />
            <Environment preset={environment as Parameters<typeof Environment>[0]['preset']} />
          </React.Suspense>

          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />

          <OrbitControls
            ref={controlsRef}
            autoRotate={autoRotate}
            autoRotateSpeed={2}
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
          />

          <AutoRotateController autoRotate={autoRotate} controlsRef={controlsRef} />
          <CameraController resetTrigger={resetTrigger} controlsRef={controlsRef} />
        </Canvas>

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="flex flex-col items-center gap-2 text-brand-primary">
              <div className="h-8 w-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Loading model...</span>
            </div>
          </div>
        )}

        {/* Model info overlay */}
        {showInfo && modelInfo && (
          <div className="absolute top-3 left-3 bg-background/95 backdrop-blur-xs border rounded-lg p-3 text-sm space-y-1">
            <div className="font-medium">Model Info</div>
            <div className="text-muted-foreground">
              Vertices: {modelInfo.vertices.toLocaleString()}
            </div>
            <div className="text-muted-foreground">Faces: {modelInfo.faces.toLocaleString()}</div>
            <div className="text-muted-foreground">Meshes: {modelInfo.meshes}</div>
            <div className="text-muted-foreground uppercase">Format: {format}</div>
          </div>
        )}

        {/* Toolbar */}
        <ViewerToolbar>
          <ToolbarGroup>
            <ToolbarButton
              icon={autoRotate ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              label={autoRotate ? 'Stop rotation' : 'Auto rotate'}
              onClick={() => setAutoRotate(!autoRotate)}
              active={autoRotate}
            />
            <ToolbarButton
              icon={<RotateCcw className="h-4 w-4" />}
              label="Reset camera"
              onClick={handleResetCamera}
            />
          </ToolbarGroup>

          <ToolbarSeparator />

          <ToolbarGroup>
            <ToolbarButton
              icon={<Grid3X3 className="h-4 w-4" />}
              label="Wireframe"
              onClick={() => setWireframe(!wireframe)}
              active={wireframe}
            />
            <ToolbarButton
              icon={<Info className="h-4 w-4" />}
              label="Model info"
              onClick={() => setShowInfo(!showInfo)}
              active={showInfo}
            />
          </ToolbarGroup>

          <ToolbarSeparator />

          <ToolbarGroup>
            {/* Background color */}
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
                        backgroundColor:
                          color.value === 'transparent' ? 'transparent' : color.value,
                        backgroundImage:
                          color.value === 'transparent'
                            ? 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)'
                            : undefined,
                        backgroundSize: '8px 8px',
                        backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
                      }}
                    />
                    {color.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Environment */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="h-8 w-8 flex items-center justify-center hover:bg-accent rounded-md transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center">
                {ENVIRONMENTS.map((env) => (
                  <DropdownMenuItem
                    key={env.value}
                    onClick={() => setEnvironment(env.value)}
                    className={cn(environment === env.value && 'bg-accent')}
                  >
                    {env.label}
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
