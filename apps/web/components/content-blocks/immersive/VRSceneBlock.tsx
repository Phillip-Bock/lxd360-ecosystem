'use client';

import { Center, Environment, Html, OrbitControls, useGLTF, useProgress } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  Box,
  Grid3X3,
  Maximize2,
  Minimize2,
  Move3D,
  Pause,
  Play,
  Settings,
  Smartphone,
  Sun,
} from 'lucide-react';
import type React from 'react';
import { Suspense, useEffect, useRef, useState } from 'react';
import type * as THREE from 'three';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { logger } from '@/lib/logger';

const log = logger.scope('VRSceneBlock');

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

// Loading component
function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2">
        <div className="w-12 h-12 border-4 border-(--brand-primary) border-t-transparent rounded-full animate-spin" />
        <p className="text-brand-primary text-sm">{progress.toFixed(0)}% loaded</p>
      </div>
    </Html>
  );
}

// Model component
interface ModelProps {
  url: string;
  autoRotate?: boolean;
  rotationSpeed?: number;
  scale?: number;
}

function Model({
  url,
  autoRotate = false,
  rotationSpeed = 0.5,
  scale = 1,
}: ModelProps): React.JSX.Element {
  const { scene } = useGLTF(url);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * rotationSpeed;
    }
  });

  return (
    <group ref={groupRef}>
      <Center>
        <primitive object={scene} scale={scale} />
      </Center>
    </group>
  );
}

// Environment presets
type EnvironmentPreset =
  | 'sunset'
  | 'dawn'
  | 'night'
  | 'warehouse'
  | 'forest'
  | 'apartment'
  | 'studio'
  | 'city'
  | 'park'
  | 'lobby';

const environmentPresets: { value: EnvironmentPreset; label: string }[] = [
  { value: 'studio', label: 'Studio' },
  { value: 'sunset', label: 'Sunset' },
  { value: 'dawn', label: 'Dawn' },
  { value: 'night', label: 'Night' },
  { value: 'warehouse', label: 'Warehouse' },
  { value: 'forest', label: 'Forest' },
  { value: 'city', label: 'City' },
  { value: 'park', label: 'Park' },
  { value: 'lobby', label: 'Lobby' },
];

// VR Button component
function VRButton() {
  const { gl } = useThree();
  const [vrSupported, setVrSupported] = useState(false);

  useEffect(() => {
    if (navigator.xr) {
      navigator.xr.isSessionSupported('immersive-vr').then(setVrSupported);
    }
  }, []);

  const enterVR = async () => {
    if (!navigator.xr) return;
    try {
      const session = await navigator.xr.requestSession('immersive-vr');
      gl.xr.setSession(session);
    } catch (err) {
      log.error('Failed to enter VR', err instanceof Error ? err : new Error(String(err)));
    }
  };

  if (!vrSupported) return null;

  return (
    <Html position={[0, 2, 0]}>
      <Button onClick={enterVR} className="bg-(--brand-primary) hover:bg-(--brand-primary)/80">
        <Smartphone className="w-4 h-4 mr-2" />
        Enter VR
      </Button>
    </Html>
  );
}

interface VRSceneBlockProps {
  modelUrl: string;
  title?: string;
  description?: string;
  autoRotate?: boolean;
  showGrid?: boolean;
  showEnvironment?: boolean;
  initialEnvironment?: EnvironmentPreset;
  enableVR?: boolean;
  className?: string;
}

export function VRSceneBlock({
  modelUrl,
  title = '3D Model Viewer',
  description,
  autoRotate: initialAutoRotate = true,
  showGrid: initialShowGrid = true,
  showEnvironment: initialShowEnvironment = true,
  initialEnvironment = 'studio',
  enableVR = true,
  className = '',
}: VRSceneBlockProps): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoRotate, setAutoRotate] = useState(initialAutoRotate);
  const [showGrid, setShowGrid] = useState(initialShowGrid);
  const [showEnvironment, setShowEnvironment] = useState(initialShowEnvironment);
  const [environment, setEnvironment] = useState<EnvironmentPreset>(initialEnvironment);
  const [modelScale, setModelScale] = useState(1);
  const [rotationSpeed, setRotationSpeed] = useState(0.5);
  const [showSettings, setShowSettings] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      containerRef.current.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (error) {
    return (
      <Card className={`p-6 bg-(--lxd-blue-dark-700) border-2 border-brand-error/50 ${className}`}>
        <div className="flex flex-col items-center justify-center h-64 text-brand-error">
          <Box className="w-12 h-12 mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">Failed to load 3D model</p>
          <p className="text-sm text-brand-muted">{error}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card
      ref={containerRef}
      className={`overflow-hidden bg-(--lxd-blue-dark-700) border-2 border-(--brand-primary) ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-(--lxd-blue-light)">
        <div className="flex items-center gap-3">
          <Box className="w-5 h-5 text-(--brand-primary)" />
          <div>
            <h3 className="text-lg font-semibold text-brand-primary">{title}</h3>
            {description && <p className="text-sm text-brand-muted">{description}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-teal-400 text-teal-400">
            3D Model
          </Badge>
        </div>
      </div>

      {/* Canvas Container */}
      <div className="relative aspect-video bg-linear-to-br from-(--lxd-blue-dark-700) to-(--lxd-blue-light)">
        <Canvas
          shadows
          dpr={[1, 2]}
          camera={{ position: [0, 0, 5], fov: 50 }}
          gl={{ preserveDrawingBuffer: true }}
          onError={() => setError('Failed to initialize 3D scene')}
        >
          <Suspense fallback={<Loader />}>
            {/* Lighting */}
            <ambientLight intensity={0.5} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
            <pointLight position={[-10, -10, -10]} intensity={0.5} />

            {/* Environment */}
            {showEnvironment && <Environment preset={environment} background={false} />}

            {/* Grid */}
            {showGrid && (
              <gridHelper args={[10, 10, 'var(--lxd-blue-light)', 'var(--lxd-blue-light)']} />
            )}

            {/* Model */}
            <Model
              url={modelUrl}
              autoRotate={autoRotate}
              rotationSpeed={rotationSpeed}
              scale={modelScale}
            />

            {/* Controls */}
            <OrbitControls
              makeDefault
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minDistance={2}
              maxDistance={20}
              autoRotate={false}
            />

            {/* VR Support */}
            {enableVR && <VRButton />}
          </Suspense>
        </Canvas>

        {/* Controls Overlay */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <Button
            size="icon"
            variant="outline"
            onClick={toggleFullscreen}
            className="bg-(--lxd-blue-dark-700)/80 border-(--lxd-blue-light) text-brand-primary hover:bg-(--lxd-blue-light)"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={() => setShowSettings(!showSettings)}
            className={`bg-(--lxd-blue-dark-700)/80 border-(--lxd-blue-light) text-brand-primary hover:bg-(--lxd-blue-light) ${
              showSettings ? 'ring-2 ring-(--brand-primary)' : ''
            }`}
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>

        {/* Quick Controls */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-(--lxd-blue-dark-700)/80 rounded-lg p-2 border border-(--lxd-blue-light)">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setAutoRotate(!autoRotate)}
            className={`text-brand-primary hover:bg-(--lxd-blue-light) ${autoRotate ? 'text-teal-400' : ''}`}
            title={autoRotate ? 'Stop Rotation' : 'Start Rotation'}
          >
            {autoRotate ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <div className="w-px h-6 bg-(--lxd-blue-light)" />
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setShowGrid(!showGrid)}
            className={`text-brand-primary hover:bg-(--lxd-blue-light) ${showGrid ? 'text-teal-400' : ''}`}
            title="Toggle Grid"
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setShowEnvironment(!showEnvironment)}
            className={`text-brand-primary hover:bg-(--lxd-blue-light) ${showEnvironment ? 'text-teal-400' : ''}`}
            title="Toggle Environment"
          >
            <Sun className="w-4 h-4" />
          </Button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="absolute top-16 right-4 w-64 bg-(--lxd-blue-dark-700)/95 border border-(--lxd-blue-light) rounded-lg p-4 backdrop-blur-xs">
            <h4 className="text-sm font-medium text-brand-primary mb-4">Settings</h4>

            <div className="space-y-4">
              {/* Model Scale */}
              <div>
                <label htmlFor="model-scale-slider" className="text-xs text-brand-muted block mb-2">
                  Model Scale: {modelScale.toFixed(1)}
                </label>
                <Slider
                  id="model-scale-slider"
                  value={[modelScale]}
                  onValueChange={([v]) => setModelScale(v)}
                  min={0.1}
                  max={3}
                  step={0.1}
                  className="w-full"
                />
              </div>

              {/* Rotation Speed */}
              <div>
                <label
                  htmlFor="rotation-speed-slider"
                  className="text-xs text-brand-muted block mb-2"
                >
                  Rotation Speed: {rotationSpeed.toFixed(1)}
                </label>
                <Slider
                  id="rotation-speed-slider"
                  value={[rotationSpeed]}
                  onValueChange={([v]) => setRotationSpeed(v)}
                  min={0.1}
                  max={2}
                  step={0.1}
                  className="w-full"
                />
              </div>

              {/* Environment Preset */}
              <div>
                <label htmlFor="environment-select" className="text-xs text-brand-muted block mb-2">
                  Environment
                </label>
                <Select
                  value={environment}
                  onValueChange={(v) => setEnvironment(v as EnvironmentPreset)}
                >
                  <SelectTrigger
                    id="environment-select"
                    className="bg-(--lxd-blue-light)/50 border-(--lxd-blue-light) text-brand-primary"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-(--lxd-blue-dark-700) border-(--lxd-blue-light)">
                    {environmentPresets.map((preset) => (
                      <SelectItem
                        key={preset.value}
                        value={preset.value}
                        className="text-brand-primary hover:bg-(--lxd-blue-light)"
                      >
                        {preset.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Instructions Overlay */}
        <div className="absolute bottom-16 left-4 text-xs text-brand-muted">
          <p>Drag to rotate • Scroll to zoom • Right-drag to pan</p>
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 bg-(--lxd-blue-light)/30 border-t border-(--lxd-blue-light) flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Move3D className="w-4 h-4 text-(--brand-primary)" />
          <span className="text-xs text-brand-muted">Interactive 3D View</span>
        </div>
        <div className="flex items-center gap-2">
          {enableVR && (
            <Badge variant="outline" className="text-xs border-brand-secondary text-brand-purple">
              VR Ready
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
}

// Preload function for optimizing model loading
export function preloadModel(url: string) {
  useGLTF.preload(url);
}

export default VRSceneBlock;
