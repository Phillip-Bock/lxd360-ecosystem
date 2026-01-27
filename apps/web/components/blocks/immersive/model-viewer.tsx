'use client';

/**
 * ModelViewer - Phase 15
 * Interactive 3D model viewer with exploded views, part selection, and annotations
 */

import {
  Bounds,
  Center,
  ContactShadows,
  Environment,
  Grid,
  Html,
  OrbitControls,
  PerspectiveCamera,
  useGLTF,
} from '@react-three/drei';
import { Canvas, type ThreeEvent, useFrame } from '@react-three/fiber';
import {
  Box,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Layers,
  Loader2,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
} from 'lucide-react';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import type {
  CameraPreset,
  EnvironmentConfig,
  ExplodedViewConfig,
  InteractionConfig,
  LightingConfig,
  Model3D,
  Model3DHotspot,
  ModelPart,
  Vector3,
} from '@/types/studio/immersive';

// =============================================================================
// TYPES
// =============================================================================

interface ModelViewerProps {
  /** Model configuration */
  model: Model3D;
  /** Camera presets */
  cameraPresets?: CameraPreset[];
  /** Show UI controls */
  showControls?: boolean;
  /** Show parts tree */
  showPartsTree?: boolean;
  /** Enable part selection */
  enableSelection?: boolean;
  /** On part select */
  onPartSelect?: (partIds: string[]) => void;
  /** On hotspot click */
  onHotspotClick?: (hotspot: Model3DHotspot) => void;
  /** On animation complete */
  onAnimationComplete?: (animationId: string) => void;
  /** Class name */
  className?: string;
  /** Height */
  height?: string | number;
}

interface ViewerState {
  isLoading: boolean;
  loadProgress: number;
  selectedParts: string[];
  explodedFactor: number;
  isAnimating: boolean;
  currentAnimation: string | null;
  animationProgress: number;
  isFullscreen: boolean;
  showWireframe: boolean;
  highlightedPart: string | null;
}

// =============================================================================
// 3D MODEL COMPONENT
// =============================================================================

interface ModelMeshProps {
  url: string;
  scale: number;
  position: Vector3;
  rotation: Vector3;
  parts: ModelPart[];
  selectedParts: string[];
  highlightedPart: string | null;
  explodedFactor: number;
  explodedConfig?: ExplodedViewConfig;
  onPartClick: (partId: string) => void;
  onPartHover: (partId: string | null) => void;
  showWireframe: boolean;
}

function ModelMesh({
  url,
  scale,
  position,
  rotation,
  parts,
  selectedParts,
  highlightedPart,
  explodedFactor,
  explodedConfig,
  onPartClick,
  onPartHover,
  showWireframe,
}: ModelMeshProps) {
  const { scene } = useGLTF(url);
  const groupRef = useRef<THREE.Group>(null);

  // Clone scene to avoid mutations
  const clonedScene = useMemo(() => scene.clone(), [scene]);

  // Part visibility and selection
  useEffect(() => {
    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const partConfig = parts.find((p) => p.id === child.name);

        // Visibility
        child.visible = partConfig?.visible !== false;

        // Selection highlight
        if (selectedParts.includes(child.name)) {
          const highlightMaterial = new THREE.MeshStandardMaterial({
            color: partConfig?.highlightColor || '#00ff00',
            emissive: partConfig?.highlightColor || '#00ff00',
            emissiveIntensity: 0.3,
            wireframe: showWireframe,
          });
          child.material = highlightMaterial;
        }

        // Hover highlight
        if (child.name === highlightedPart && !selectedParts.includes(child.name)) {
          const hoverMaterial = (child.material as THREE.MeshStandardMaterial).clone();
          hoverMaterial.emissive = new THREE.Color('#ffffff');
          hoverMaterial.emissiveIntensity = 0.1;
          child.material = hoverMaterial;
        }
      }
    });
  }, [clonedScene, parts, selectedParts, highlightedPart, showWireframe]);

  // Exploded view animation
  useFrame(() => {
    if (!explodedConfig?.enabled || explodedFactor === 1) return;

    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const partConfig = parts.find((p) => p.id === child.name);
        if (!partConfig?.explodedOffset) return;

        const originalPosition = child.userData.originalPosition || child.position.clone();
        if (!child.userData.originalPosition) {
          child.userData.originalPosition = originalPosition.clone();
        }

        const factor = explodedFactor - 1; // 0 when not exploded, positive when exploded
        child.position.set(
          originalPosition.x + partConfig.explodedOffset.x * factor,
          originalPosition.y + partConfig.explodedOffset.y * factor,
          originalPosition.z + partConfig.explodedOffset.z * factor,
        );
      }
    });
  });

  return (
    <group
      ref={groupRef}
      scale={scale}
      position={[position.x, position.y, position.z]}
      rotation={[
        THREE.MathUtils.degToRad(rotation.x),
        THREE.MathUtils.degToRad(rotation.y),
        THREE.MathUtils.degToRad(rotation.z),
      ]}
    >
      <primitive
        object={clonedScene}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          const mesh = e.object as THREE.Mesh;
          const partConfig = parts.find((p) => p.id === mesh.name);
          if (partConfig?.selectable !== false) {
            onPartClick(mesh.name);
          }
        }}
        onPointerEnter={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          const mesh = e.object as THREE.Mesh;
          onPartHover(mesh.name);
          document.body.style.cursor = 'pointer';
        }}
        onPointerLeave={() => {
          onPartHover(null);
          document.body.style.cursor = 'auto';
        }}
      />
    </group>
  );
}

// =============================================================================
// HOTSPOT MARKERS
// =============================================================================

interface HotspotMarkersProps {
  hotspots: Model3DHotspot[];
  selectedParts: string[];
  onClick: (hotspot: Model3DHotspot) => void;
}

function HotspotMarkers({ hotspots, selectedParts, onClick }: HotspotMarkersProps) {
  return (
    <>
      {hotspots
        .filter((h) => !h.showOnPartSelect || selectedParts.includes(h.partId || ''))
        .map((hotspot) => (
          <group
            key={hotspot.id}
            position={[hotspot.position.x, hotspot.position.y, hotspot.position.z]}
          >
            <mesh onClick={() => onClick(hotspot)}>
              <sphereGeometry args={[0.05, 16, 16]} />
              <meshBasicMaterial color={hotspot.style.color} />
            </mesh>

            {hotspot.billboard && (
              <Html center distanceFactor={10}>
                <button
                  type="button"
                  className="px-2 py-1 bg-black/80 rounded text-white text-xs whitespace-nowrap cursor-pointer hover:bg-black border-none"
                  onClick={() => onClick(hotspot)}
                >
                  {hotspot.name}
                </button>
              </Html>
            )}
          </group>
        ))}
    </>
  );
}

// =============================================================================
// CAMERA CONTROLS
// =============================================================================

interface CameraControlsProps {
  config: InteractionConfig;
  onReset?: () => void;
}

function CameraControls({ config }: CameraControlsProps) {
  return (
    <OrbitControls
      enableRotate={config.enableRotation}
      enableZoom={config.enableZoom}
      enablePan={config.enablePan}
      minDistance={config.minDistance}
      maxDistance={config.maxDistance}
      rotateSpeed={config.rotateSpeed}
      zoomSpeed={config.zoomSpeed}
      panSpeed={config.panSpeed}
      enableDamping={config.enableDamping}
      dampingFactor={config.dampingFactor}
      autoRotate={config.autoRotate}
      autoRotateSpeed={config.autoRotateSpeed}
    />
  );
}

// =============================================================================
// LIGHTING
// =============================================================================

interface SceneLightingProps {
  config: LightingConfig;
}

function SceneLighting({ config }: SceneLightingProps) {
  return (
    <>
      <ambientLight intensity={config.ambientIntensity} color={config.ambientColor} />

      {config.directionalLights.map((light, i) => (
        <directionalLight
          key={i}
          position={[light.position.x, light.position.y, light.position.z]}
          intensity={light.intensity}
          color={light.color}
          castShadow={light.castShadow && config.shadows}
          shadow-mapSize={
            config.shadowQuality === 'high' ? 2048 : config.shadowQuality === 'medium' ? 1024 : 512
          }
        />
      ))}

      {config.pointLights?.map((light, i) => (
        <pointLight
          key={i}
          position={[light.position.x, light.position.y, light.position.z]}
          intensity={light.intensity}
          color={light.color}
          distance={light.distance}
          decay={light.decay}
        />
      ))}
    </>
  );
}

// =============================================================================
// ENVIRONMENT
// =============================================================================

interface SceneEnvironmentProps {
  config: EnvironmentConfig;
}

function SceneEnvironment({ config }: SceneEnvironmentProps) {
  return (
    <>
      {config.backgroundType === 'color' && (
        <color attach="background" args={[config.backgroundColor || '#1a1a2e']} />
      )}

      {config.backgroundType === 'hdri' && config.hdriUrl && (
        <Environment files={config.hdriUrl} background />
      )}

      {config.showGround && (
        <ContactShadows
          position={[0, -0.01, 0]}
          opacity={0.5}
          scale={10}
          blur={2}
          far={4}
          color={config.groundColor}
        />
      )}

      {config.showGrid && (
        <Grid
          position={[0, 0, 0]}
          args={[config.gridSize || 10, config.gridDivisions || 10]}
          cellColor="#333"
          sectionColor="#555"
          fadeDistance={30}
          fadeStrength={1}
          infiniteGrid
        />
      )}

      {config.fog?.enabled && (
        <fog attach="fog" args={[config.fog.color, config.fog.near, config.fog.far]} />
      )}
    </>
  );
}

// =============================================================================
// PARTS TREE
// =============================================================================

interface PartsTreeProps {
  parts: ModelPart[];
  selectedParts: string[];
  onSelectPart: (partId: string) => void;
  onToggleVisibility: (partId: string) => void;
}

function PartsTree({ parts, selectedParts, onSelectPart, onToggleVisibility }: PartsTreeProps) {
  const [expandedParts, setExpandedParts] = useState<Set<string>>(new Set());

  const toggleExpanded = (partId: string) => {
    setExpandedParts((prev) => {
      const next = new Set(prev);
      if (next.has(partId)) {
        next.delete(partId);
      } else {
        next.add(partId);
      }
      return next;
    });
  };

  const rootParts = parts.filter((p) => !p.parentId);
  const getChildren = (partId: string) => parts.filter((p) => p.parentId === partId);

  const renderPart = (part: ModelPart, level: number = 0) => {
    const children = getChildren(part.id);
    const hasChildren = children.length > 0;
    const isExpanded = expandedParts.has(part.id);
    const isSelected = selectedParts.includes(part.id);

    return (
      <div key={part.id}>
        <div
          className={cn(
            'flex items-center gap-1 py-1 px-1 rounded transition-colors',
            isSelected ? 'bg-primary/20' : 'hover:bg-white/5',
          )}
          style={{ paddingLeft: `${level * 12 + 4}px` }}
        >
          {hasChildren ? (
            <button
              type="button"
              className="w-4 h-4 flex items-center justify-center"
              onClick={() => toggleExpanded(part.id)}
              aria-label={isExpanded ? `Collapse ${part.name}` : `Expand ${part.name}`}
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </button>
          ) : (
            <span className="w-4" />
          )}

          <button
            type="button"
            className="flex items-center gap-1 flex-1 min-w-0 cursor-pointer bg-transparent border-none p-0 text-left"
            onClick={() => onSelectPart(part.id)}
            aria-pressed={isSelected}
            aria-label={`Select ${part.name}`}
          >
            <Box className="h-3 w-3 text-zinc-500 shrink-0" />
            <span className="text-xs text-white flex-1 truncate">{part.name}</span>
          </button>

          <button
            type="button"
            className="w-4 h-4 opacity-50 hover:opacity-100"
            onClick={() => onToggleVisibility(part.id)}
            aria-label={part.visible !== false ? `Hide ${part.name}` : `Show ${part.name}`}
          >
            {part.visible !== false ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
          </button>
        </div>

        {hasChildren && isExpanded && children.map((child) => renderPart(child, level + 1))}
      </div>
    );
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-2">{rootParts.map((part) => renderPart(part))}</div>
    </ScrollArea>
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
      <p className="text-zinc-400 text-sm mt-2">Loading 3D model...</p>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function ModelViewer({
  model,
  cameraPresets: _cameraPresets,
  showControls = true,
  showPartsTree = true,
  enableSelection = true,
  onPartSelect,
  onHotspotClick,
  onAnimationComplete,
  className,
  height = '100%',
}: ModelViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [state, setState] = useState<ViewerState>({
    isLoading: true,
    loadProgress: 0,
    selectedParts: [],
    explodedFactor: 1,
    isAnimating: false,
    currentAnimation: null,
    animationProgress: 0,
    isFullscreen: false,
    showWireframe: false,
    highlightedPart: null,
  });

  const [showTree, setShowTree] = useState(showPartsTree);

  // Part selection
  const handlePartClick = useCallback(
    (partId: string) => {
      if (!enableSelection) return;

      setState((prev) => {
        const isSelected = prev.selectedParts.includes(partId);
        const newSelection =
          model.interaction.selectionMode === 'multi'
            ? isSelected
              ? prev.selectedParts.filter((id) => id !== partId)
              : [...prev.selectedParts, partId]
            : isSelected
              ? []
              : [partId];

        onPartSelect?.(newSelection);
        return { ...prev, selectedParts: newSelection };
      });
    },
    [enableSelection, model.interaction.selectionMode, onPartSelect],
  );

  const handlePartHover = useCallback((partId: string | null) => {
    setState((prev) => ({ ...prev, highlightedPart: partId }));
  }, []);

  // Toggle visibility
  const handleToggleVisibility = useCallback((_partId: string) => {
    // This would update the model.parts in the parent component
    // For now, just track locally
  }, []);

  // Exploded view
  const handleExplodedChange = useCallback((factor: number) => {
    setState((prev) => ({ ...prev, explodedFactor: factor }));
  }, []);

  // Fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setState((prev) => ({ ...prev, isFullscreen: true }));
    } else {
      document.exitFullscreen();
      setState((prev) => ({ ...prev, isFullscreen: false }));
    }
  }, []);

  // Reset view
  const resetView = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedParts: [],
      explodedFactor: 1,
      showWireframe: false,
    }));
  }, []);

  // Play animation
  const playAnimation = useCallback(
    (animationId: string) => {
      const animation = model.animations.find((a) => a.id === animationId);
      if (!animation) return;

      setState((prev) => ({
        ...prev,
        isAnimating: true,
        currentAnimation: animationId,
        animationProgress: 0,
      }));

      // Animation would be handled by Three.js AnimationMixer
      // Simplified for this implementation
      setTimeout(() => {
        setState((prev) => ({
          ...prev,
          isAnimating: false,
          currentAnimation: null,
          animationProgress: 100,
        }));
        onAnimationComplete?.(animationId);
      }, animation.duration);
    },
    [model.animations, onAnimationComplete],
  );

  return (
    <div
      ref={containerRef}
      className={cn('relative bg-(--neural-bg) overflow-hidden flex', className)}
      style={{ height }}
    >
      {/* Parts Tree Sidebar */}
      {showTree && (
        <div className="w-56 border-r border-white/10 flex flex-col bg-black/50">
          <div className="h-10 border-b border-white/10 flex items-center justify-between px-3">
            <div className="flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-medium text-white">Parts</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setShowTree(false)}
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
          <PartsTree
            parts={model.parts}
            selectedParts={state.selectedParts}
            onSelectPart={handlePartClick}
            onToggleVisibility={handleToggleVisibility}
          />
        </div>
      )}

      {/* 3D Canvas */}
      <div className="flex-1 relative">
        <Canvas shadows={model.lighting.shadows}>
          <Suspense fallback={null}>
            <PerspectiveCamera makeDefault position={[5, 5, 5]} fov={50} />
            <CameraControls config={model.interaction} />

            <SceneLighting config={model.lighting} />
            <SceneEnvironment config={model.environment} />

            <Bounds fit clip observe margin={1.2}>
              <Center>
                <ModelMesh
                  url={model.modelUrl}
                  scale={model.scale}
                  position={model.position}
                  rotation={model.rotation}
                  parts={model.parts}
                  selectedParts={state.selectedParts}
                  highlightedPart={state.highlightedPart}
                  explodedFactor={state.explodedFactor}
                  explodedConfig={model.explodedView}
                  onPartClick={handlePartClick}
                  onPartHover={handlePartHover}
                  showWireframe={state.showWireframe}
                />
              </Center>
            </Bounds>

            <HotspotMarkers
              hotspots={model.hotspots}
              selectedParts={state.selectedParts}
              onClick={(h) => onHotspotClick?.(h)}
            />
          </Suspense>
        </Canvas>

        {/* Loading Overlay */}
        {state.isLoading && <LoadingOverlay progress={state.loadProgress} />}

        {/* Top Controls */}
        {showControls && !state.isLoading && (
          <div className="absolute top-4 right-4 flex items-center gap-1">
            {!showTree && showPartsTree && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 bg-black/50 hover:bg-black/70"
                onClick={() => setShowTree(true)}
              >
                <Layers className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'h-8 w-8 bg-black/50 hover:bg-black/70',
                state.showWireframe && 'bg-primary/30',
              )}
              onClick={() => setState((prev) => ({ ...prev, showWireframe: !prev.showWireframe }))}
            >
              <Box className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 bg-black/50 hover:bg-black/70"
              onClick={resetView}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 bg-black/50 hover:bg-black/70"
              onClick={toggleFullscreen}
            >
              {state.isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}

        {/* Exploded View Control */}
        {model.explodedView?.enabled && showControls && !state.isLoading && (
          <div className="absolute bottom-20 left-4 right-4 max-w-xs">
            <div className="bg-black/70 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-white">Exploded View</span>
                <span className="text-xs text-zinc-500">
                  {Math.round((state.explodedFactor - 1) * 100)}%
                </span>
              </div>
              <Slider
                value={[state.explodedFactor]}
                onValueChange={([v]) => handleExplodedChange(v)}
                min={1}
                max={model.explodedView.factor}
                step={0.01}
              />
            </div>
          </div>
        )}

        {/* Animation Controls */}
        {model.animations.length > 0 && showControls && !state.isLoading && (
          <div className="absolute bottom-4 left-4 flex items-center gap-1">
            {model.animations.map((anim) => (
              <Button
                key={anim.id}
                variant="ghost"
                size="sm"
                className={cn(
                  'h-7 bg-black/50 hover:bg-black/70',
                  state.currentAnimation === anim.id && 'bg-primary/30',
                )}
                onClick={() => playAnimation(anim.id)}
                disabled={state.isAnimating}
              >
                {state.currentAnimation === anim.id ? (
                  <Pause className="h-3 w-3 mr-1" />
                ) : (
                  <Play className="h-3 w-3 mr-1" />
                )}
                <span className="text-xs">{anim.name}</span>
              </Button>
            ))}
          </div>
        )}

        {/* Selection Info */}
        {state.selectedParts.length > 0 && !state.isLoading && (
          <div className="absolute bottom-4 right-4 bg-black/70 rounded-lg p-2">
            <p className="text-xs text-white">
              {state.selectedParts.length} part{state.selectedParts.length > 1 ? 's' : ''} selected
            </p>
            <p className="text-[10px] text-zinc-500 mt-0.5">
              {model.parts.find((p) => p.id === state.selectedParts[0])?.name}
              {state.selectedParts.length > 1 && ` +${state.selectedParts.length - 1} more`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ModelViewer;
