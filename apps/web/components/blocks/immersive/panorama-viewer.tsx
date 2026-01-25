'use client';

/**
 * PanoramaViewer - Phase 13
 * Immersive 360° panorama viewer using React Three Fiber
 */

import { Html, OrbitControls, PerspectiveCamera, useTexture } from '@react-three/drei';
import { Canvas, type ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Map as MapIcon,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type {
  PanoramaHotspot,
  PanoramaScene,
  SphericalCoordinates,
  TourSettings,
  VirtualTour,
} from '@/types/studio/immersive';

// =============================================================================
// TYPES
// =============================================================================

interface PanoramaViewerProps {
  /** Single scene or full tour */
  tour?: VirtualTour;
  scene?: PanoramaScene;
  /** Initial scene ID (for tours) */
  initialSceneId?: string;
  /** Viewer settings override */
  settings?: Partial<TourSettings>;
  /** Show controls */
  showControls?: boolean;
  /** Show minimap */
  showMinimap?: boolean;
  /** Enable VR mode */
  enableVR?: boolean;
  /** On hotspot click */
  onHotspotClick?: (hotspot: PanoramaHotspot, scene: PanoramaScene) => void;
  /** On scene change */
  onSceneChange?: (scene: PanoramaScene) => void;
  /** On tour complete */
  onTourComplete?: () => void;
  /** Class name */
  className?: string;
  /** Height */
  height?: string | number;
}

// =============================================================================
// PANORAMA SPHERE COMPONENT
// =============================================================================

interface PanoramaSphereProps {
  imageUrl: string;
  onLoaded?: () => void;
}

function PanoramaSphere({ imageUrl, onLoaded }: PanoramaSphereProps) {
  const texture = useTexture(imageUrl, (tex: THREE.Texture | THREE.Texture[]) => {
    const t = Array.isArray(tex) ? tex[0] : tex;
    t.colorSpace = THREE.SRGBColorSpace;
    t.minFilter = THREE.LinearFilter;
    t.magFilter = THREE.LinearFilter;
    onLoaded?.();
  });

  return (
    <mesh scale={[-1, 1, 1]}>
      <sphereGeometry args={[500, 64, 32]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} />
    </mesh>
  );
}

// =============================================================================
// HOTSPOT COMPONENT
// =============================================================================

interface HotspotMarkerProps {
  hotspot: PanoramaHotspot;
  onClick: () => void;
  isVisited: boolean;
}

function HotspotMarker({ hotspot, onClick, isVisited }: HotspotMarkerProps) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);

  // Convert spherical to cartesian
  const position = useMemo(() => {
    const theta = THREE.MathUtils.degToRad(hotspot.position.theta);
    const phi = THREE.MathUtils.degToRad(90 - hotspot.position.phi);
    const radius = 100;

    return new THREE.Vector3(
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta),
    );
  }, [hotspot.position]);

  // Animation
  useFrame((state) => {
    if (meshRef.current && hotspot.style.pulse) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
      meshRef.current.scale.setScalar(scale);
    }
  });

  const getIcon = () => {
    switch (hotspot.style.icon) {
      case 'info':
        return 'i';
      case 'arrow':
        return '>';
      case 'play':
        return '>';
      case 'question':
        return '?';
      case 'link':
        return '@';
      case 'audio':
        return 'A';
      case 'video':
        return 'V';
      case 'cube':
        return '3D';
      case 'eye':
        return 'o';
      case 'star':
        return '*';
      case 'pin':
        return '+';
      default:
        return '.';
    }
  };

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <sphereGeometry args={[hotspot.style.size / 10, 16, 16]} />
        <meshBasicMaterial
          color={hotspot.style.color}
          transparent
          opacity={hovered ? 1 : hotspot.style.idleOpacity || 0.8}
        />
      </mesh>

      {/* Glow effect */}
      {hotspot.style.glow && (
        <mesh>
          <sphereGeometry args={[hotspot.style.size / 8, 16, 16]} />
          <meshBasicMaterial color={hotspot.style.color} transparent opacity={0.2} />
        </mesh>
      )}

      {/* HTML tooltip */}
      <Html
        center
        distanceFactor={100}
        style={{
          pointerEvents: 'none',
          transition: 'all 0.2s',
          opacity: hovered ? 1 : 0,
          transform: hovered ? 'translateY(-30px)' : 'translateY(-20px)',
        }}
      >
        <div className="bg-black/80 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
          {hotspot.tooltip || hotspot.name}
        </div>
      </Html>

      {/* Icon label */}
      <Html center distanceFactor={100}>
        <div
          className={cn(
            'w-8 h-8 flex items-center justify-center rounded-full text-lg cursor-pointer transition-transform',
            hovered && 'scale-125',
            isVisited && 'opacity-60',
          )}
          style={{
            backgroundColor: hotspot.style.backgroundColor || 'rgba(0,0,0,0.5)',
            color: hotspot.style.color,
          }}
        >
          {getIcon()}
        </div>
      </Html>
    </group>
  );
}

// =============================================================================
// CAMERA CONTROLLER
// =============================================================================

interface CameraControllerProps {
  initialView: SphericalCoordinates;
  settings: TourSettings;
  onViewChange?: (view: SphericalCoordinates) => void;
}

// Type for OrbitControls ref with autoRotate properties
interface OrbitControlsRef {
  autoRotate: boolean;
  autoRotateSpeed: number;
  update: () => void;
}

function CameraController({ initialView, settings, onViewChange }: CameraControllerProps) {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsRef | null>(null);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const lastInteractionRef = useRef(Date.now());

  // Set initial view
  useEffect(() => {
    const theta = THREE.MathUtils.degToRad(initialView.theta);
    const phi = THREE.MathUtils.degToRad(90 - initialView.phi);
    const radius = 0.1;

    const target = new THREE.Vector3(
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta),
    );

    camera.lookAt(target);

    if (initialView.fov) {
      const perspCamera = camera as THREE.PerspectiveCamera;
      perspCamera.fov = initialView.fov;
      perspCamera.updateProjectionMatrix();
    }
  }, [camera, initialView]);

  // Auto-rotate when idle
  useFrame(() => {
    if (
      controlsRef.current &&
      settings.autoRotate &&
      !isUserInteracting &&
      Date.now() - lastInteractionRef.current > 3000
    ) {
      controlsRef.current.autoRotate = true;
      controlsRef.current.autoRotateSpeed = settings.autoRotateSpeed;
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableZoom={settings.mouseWheelZoom}
      enablePan={false}
      enableDamping={settings.inertia}
      dampingFactor={0.1}
      rotateSpeed={-settings.controlSensitivity}
      minDistance={0.1}
      maxDistance={0.1}
      target={[0, 0, 0]}
      onStart={() => {
        setIsUserInteracting(true);
        lastInteractionRef.current = Date.now();
        if (controlsRef.current) {
          controlsRef.current.autoRotate = false;
        }
      }}
      onEnd={() => {
        setIsUserInteracting(false);
        lastInteractionRef.current = Date.now();
      }}
      onChange={() => {
        if (onViewChange) {
          // Calculate current view from camera
          const direction = new THREE.Vector3();
          camera.getWorldDirection(direction);

          const theta = THREE.MathUtils.radToDeg(Math.atan2(direction.z, direction.x));
          const phi = THREE.MathUtils.radToDeg(Math.asin(direction.y));

          onViewChange({
            theta: ((theta % 360) + 360) % 360,
            phi,
            fov: (camera as THREE.PerspectiveCamera).fov,
          });
        }
      }}
    />
  );
}

// =============================================================================
// SCENE COMPONENT
// =============================================================================

interface PanoramaSceneViewProps {
  scene: PanoramaScene;
  settings: TourSettings;
  visitedHotspots: Set<string>;
  onHotspotClick: (hotspot: PanoramaHotspot) => void;
  onLoaded: () => void;
}

function PanoramaSceneView({
  scene,
  settings,
  visitedHotspots,
  onHotspotClick,
  onLoaded,
}: PanoramaSceneViewProps) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 0]} fov={75} />
      <CameraController initialView={scene.initialView} settings={settings} />

      <Suspense fallback={null}>
        <PanoramaSphere imageUrl={scene.imageUrl} onLoaded={onLoaded} />
      </Suspense>

      {scene.hotspots
        .filter((h) => h.visible !== false)
        .map((hotspot) => (
          <HotspotMarker
            key={hotspot.id}
            hotspot={hotspot}
            onClick={() => onHotspotClick(hotspot)}
            isVisited={visitedHotspots.has(hotspot.id)}
          />
        ))}
    </>
  );
}

// =============================================================================
// LOADING OVERLAY
// =============================================================================

function LoadingOverlay({ progress }: { progress: number }) {
  return (
    <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-50">
      <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
      <div className="w-48 h-1 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-zinc-400 text-sm mt-2">Loading panorama...</p>
    </div>
  );
}

// =============================================================================
// COMPASS COMPONENT
// =============================================================================

function CompassOverlay({ theta }: { theta: number }) {
  return (
    <div className="absolute top-4 right-4 w-12 h-12 bg-black/50 rounded-full flex items-center justify-center">
      <div className="w-8 h-8 relative" style={{ transform: `rotate(${-theta}deg)` }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[12px] border-b-red-500" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center rotate-180">
          <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[12px] border-b-white/50" />
        </div>
      </div>
      <span className="absolute -bottom-5 text-[10px] text-white/70">N</span>
    </div>
  );
}

// =============================================================================
// MINIMAP COMPONENT
// =============================================================================

interface MinimapProps {
  tour: VirtualTour;
  currentSceneId: string;
  visitedScenes: Set<string>;
  onSceneSelect: (sceneId: string) => void;
}

function Minimap({ tour, currentSceneId, visitedScenes, onSceneSelect }: MinimapProps) {
  const tourMap = tour.map;
  if (!tourMap) return null;

  return (
    <div className="absolute bottom-20 left-4 bg-black/70 rounded-lg p-2 border border-white/10">
      <div className="relative" style={{ width: 150, height: 100 }}>
        {/* biome-ignore lint/performance/noImgElement: small decorative map preview */}
        <img
          src={tourMap.imageUrl}
          alt="Tour map"
          className="w-full h-full object-contain opacity-70"
        />
        {tourMap.scenePositions.map((pos) => {
          const scene = tour.scenes.find((s) => s.id === pos.sceneId);
          if (!scene) return null;

          const isCurrent = pos.sceneId === currentSceneId;
          const isVisited = visitedScenes.has(pos.sceneId);

          return (
            <button
              key={pos.sceneId}
              type="button"
              className={cn(
                'absolute w-3 h-3 rounded-full transform -translate-x-1/2 -translate-y-1/2 transition-all',
                isCurrent && 'bg-primary ring-2 ring-primary/50 scale-125',
                !isCurrent && isVisited && 'bg-green-500',
                !isCurrent && !isVisited && 'bg-white/50',
              )}
              style={{
                left: `${(pos.x / tourMap.dimensions.width) * 100}%`,
                top: `${(pos.y / tourMap.dimensions.height) * 100}%`,
              }}
              onClick={() => onSceneSelect(pos.sceneId)}
              title={scene.name}
            />
          );
        })}
      </div>
    </div>
  );
}

// =============================================================================
// SCENE SELECTOR (for tours)
// =============================================================================

interface SceneSelectorProps {
  scenes: PanoramaScene[];
  currentSceneId: string;
  visitedScenes: Set<string>;
  onSceneSelect: (sceneId: string) => void;
}

function SceneSelector({
  scenes,
  currentSceneId,
  visitedScenes,
  onSceneSelect,
}: SceneSelectorProps) {
  const currentIndex = scenes.findIndex((s) => s.id === currentSceneId);

  const goToNext = () => {
    if (currentIndex < scenes.length - 1) {
      onSceneSelect(scenes[currentIndex + 1].id);
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      onSceneSelect(scenes[currentIndex - 1].id);
    }
  };

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/70 rounded-full px-2 py-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={goToPrev}
        disabled={currentIndex === 0}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="flex items-center gap-1 px-2">
        {scenes.map((scene) => (
          <button
            key={scene.id}
            type="button"
            className={cn(
              'w-2 h-2 rounded-full transition-all',
              scene.id === currentSceneId && 'bg-primary w-4',
              scene.id !== currentSceneId && visitedScenes.has(scene.id) && 'bg-green-500',
              scene.id !== currentSceneId && !visitedScenes.has(scene.id) && 'bg-white/30',
            )}
            onClick={() => onSceneSelect(scene.id)}
            title={scene.name}
          />
        ))}
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={goToNext}
        disabled={currentIndex === scenes.length - 1}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function PanoramaViewer({
  tour,
  scene: singleScene,
  initialSceneId,
  settings: settingsOverride,
  showControls = true,
  showMinimap = true,
  enableVR = false,
  onHotspotClick,
  onSceneChange,
  onTourComplete,
  className,
  height = '100%',
}: PanoramaViewerProps) {
  // Determine scenes and settings
  const scenes = tour?.scenes || (singleScene ? [singleScene] : []);
  const defaultSettings: TourSettings = {
    autoRotate: false,
    autoRotateSpeed: 0.5,
    showCompass: true,
    showSceneTitle: true,
    enableGyroscope: true,
    enableVR: enableVR,
    controlSensitivity: 0.5,
    keyboardControls: true,
    mouseWheelZoom: true,
    touchSensitivity: 1,
    inertia: true,
  };
  const settings = { ...defaultSettings, ...tour?.settings, ...settingsOverride };

  // State
  const [currentSceneId, setCurrentSceneId] = useState(
    initialSceneId || tour?.startSceneId || scenes[0]?.id,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showMap, setShowMap] = useState(tour?.map?.showByDefault || false);
  const [currentView, _setCurrentView] = useState<SphericalCoordinates>({ theta: 0, phi: 0 });
  const [visitedScenes, setVisitedScenes] = useState<Set<string>>(new Set([currentSceneId]));
  const [visitedHotspots, setVisitedHotspots] = useState<Set<string>>(new Set());

  const containerRef = useRef<HTMLDivElement>(null);

  // Get current scene
  const currentScene = scenes.find((s) => s.id === currentSceneId) || scenes[0];

  // Handle scene change
  const handleSceneChange = useCallback(
    (sceneId: string) => {
      setIsLoading(true);
      setLoadProgress(0);
      setCurrentSceneId(sceneId);
      setVisitedScenes((prev) => new Set([...prev, sceneId]));

      const scene = scenes.find((s) => s.id === sceneId);
      if (scene) {
        onSceneChange?.(scene);
      }

      // Check for tour completion
      if (tour?.tracking?.requiredScenes) {
        const allVisited = tour.tracking.requiredScenes.every(
          (id) => visitedScenes.has(id) || id === sceneId,
        );
        if (allVisited) {
          onTourComplete?.();
        }
      }
    },
    [scenes, visitedScenes, tour, onSceneChange, onTourComplete],
  );

  // Handle hotspot click
  const handleHotspotClick = useCallback(
    (hotspot: PanoramaHotspot) => {
      setVisitedHotspots((prev) => new Set([...prev, hotspot.id]));

      // Handle navigation hotspots
      if (hotspot.type === 'navigation' && hotspot.content.targetSceneId) {
        handleSceneChange(hotspot.content.targetSceneId);
        return;
      }

      // Callback for other types
      if (currentScene) {
        onHotspotClick?.(hotspot, currentScene);
      }
    },
    [currentScene, handleSceneChange, onHotspotClick],
  );

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Reset view
  const resetView = useCallback(() => {
    // This would reset camera - implemented via key
  }, []);

  // Keyboard controls
  useEffect(() => {
    if (!settings.keyboardControls) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft': {
          // Previous scene
          const prevIndex = scenes.findIndex((s) => s.id === currentSceneId) - 1;
          if (prevIndex >= 0) {
            handleSceneChange(scenes[prevIndex].id);
          }
          break;
        }
        case 'ArrowRight': {
          // Next scene
          const nextIndex = scenes.findIndex((s) => s.id === currentSceneId) + 1;
          if (nextIndex < scenes.length) {
            handleSceneChange(scenes[nextIndex].id);
          }
          break;
        }
        case 'f':
          toggleFullscreen();
          break;
        case 'm':
          setIsMuted((prev) => !prev);
          break;
        case 'r':
          resetView();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    settings.keyboardControls,
    currentSceneId,
    scenes,
    handleSceneChange,
    toggleFullscreen,
    resetView,
  ]);

  if (!currentScene) {
    return (
      <div
        className={cn('bg-zinc-900 flex items-center justify-center', className)}
        style={{ height }}
      >
        <p className="text-zinc-500">No panorama scene available</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn('relative bg-black overflow-hidden', className)}
      style={{ height }}
    >
      {/* Three.js Canvas */}
      <Canvas>
        <PanoramaSceneView
          scene={currentScene}
          settings={settings}
          visitedHotspots={visitedHotspots}
          onHotspotClick={handleHotspotClick}
          onLoaded={() => {
            setLoadProgress(100);
            setTimeout(() => setIsLoading(false), 300);
          }}
        />
      </Canvas>

      {/* Loading Overlay */}
      {isLoading && <LoadingOverlay progress={loadProgress} />}

      {/* Scene Title */}
      {settings.showSceneTitle && !isLoading && (
        <div className="absolute top-4 left-4 bg-black/50 rounded-lg px-3 py-1.5">
          <h3 className="text-white text-sm font-medium">{currentScene.name}</h3>
          {currentScene.description && (
            <p className="text-zinc-400 text-xs mt-0.5">{currentScene.description}</p>
          )}
        </div>
      )}

      {/* Compass */}
      {settings.showCompass && !isLoading && <CompassOverlay theta={currentView.theta} />}

      {/* Controls */}
      {showControls && !isLoading && (
        <div className="absolute top-4 right-20 flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 bg-black/50 hover:bg-black/70"
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
          {tour?.map && (
            <Button
              variant="ghost"
              size="icon"
              className={cn('h-8 w-8 bg-black/50 hover:bg-black/70', showMap && 'bg-primary/30')}
              onClick={() => setShowMap(!showMap)}
            >
              <MapIcon className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 bg-black/50 hover:bg-black/70"
            onClick={toggleFullscreen}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      )}

      {/* Minimap */}
      {showMinimap && showMap && tour && !isLoading && (
        <Minimap
          tour={tour}
          currentSceneId={currentSceneId}
          visitedScenes={visitedScenes}
          onSceneSelect={handleSceneChange}
        />
      )}

      {/* Scene Selector (for tours) */}
      {scenes.length > 1 && !isLoading && (
        <SceneSelector
          scenes={scenes}
          currentSceneId={currentSceneId}
          visitedScenes={visitedScenes}
          onSceneSelect={handleSceneChange}
        />
      )}

      {/* Progress indicator */}
      {tour?.tracking && !isLoading && (
        <div className="absolute bottom-16 left-4 text-xs text-white/70">
          {visitedScenes.size}/{scenes.length} scenes visited
        </div>
      )}
    </div>
  );
}

export default PanoramaViewer;
