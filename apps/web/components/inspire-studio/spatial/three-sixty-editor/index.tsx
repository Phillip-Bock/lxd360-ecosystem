'use client';

import { Eye, EyeOff, Grid3X3, Image, MapPin, Maximize, Route, Settings2 } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { screenToSpherePosition } from '../spatial-utils';
import { GuidedTourEngine } from './guided-tour-engine';
import { HotspotManager, TourSequenceManager } from './hotspot-manager';
import { HotspotMarker } from './hotspot-marker';
import { OrbitController } from './orbit-controller';
import { PanoramaSphere } from './panorama-sphere';
import type {
  Hotspot,
  HotspotType,
  ThreeSixtyEditorProps,
  ThreeSixtyScene,
  Vector3,
} from './types';

// =============================================================================
// Main Editor Component
// =============================================================================

/**
 * ThreeSixtyEditor - Complete 360° panorama editor
 *
 * Features:
 * - Equirectangular image loading
 * - Interactive hotspot placement
 * - Guided vs Unguided tour modes
 * - xAPI tracking ready
 */
export function ThreeSixtyEditor({
  scene: initialScene,
  onSceneChange,
  onHotspotSelect,
  onHotspotAdd,
  onHotspotUpdate,
  onHotspotDelete,
  className,
}: ThreeSixtyEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Editor state
  const [scene, setScene] = useState<ThreeSixtyScene | null>(initialScene ?? null);
  const [rotation, setRotation] = useState({ phi: 0, theta: 0 });
  const [zoom, setZoom] = useState(1);
  const [selectedHotspotId, setSelectedHotspotId] = useState<string | null>(null);
  const [isPlacingHotspot, setIsPlacingHotspot] = useState(false);
  const [newHotspotType, setNewHotspotType] = useState<HotspotType>('info_popup');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [showHotspotLabels, setShowHotspotLabels] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Scene update helper
  const updateScene = useCallback(
    (updates: Partial<ThreeSixtyScene>) => {
      if (!scene) return;
      const updated = { ...scene, ...updates };
      setScene(updated);
      onSceneChange?.(updated);
    },
    [scene, onSceneChange],
  );

  // Hotspot handlers
  const handleHotspotSelect = useCallback(
    (id: string | null) => {
      setSelectedHotspotId(id);
      onHotspotSelect?.(id);
    },
    [onHotspotSelect],
  );

  const handleHotspotAdd = useCallback(
    (hotspot: Hotspot) => {
      if (!scene) return;
      updateScene({ hotspots: [...scene.hotspots, hotspot] });
      onHotspotAdd?.(hotspot);
    },
    [scene, updateScene, onHotspotAdd],
  );

  const handleHotspotUpdate = useCallback(
    (id: string, updates: Partial<Hotspot>) => {
      if (!scene) return;
      const hotspots = scene.hotspots.map((h) => (h.id === id ? { ...h, ...updates } : h));
      updateScene({ hotspots });
      onHotspotUpdate?.(id, updates);
    },
    [scene, updateScene, onHotspotUpdate],
  );

  const handleHotspotDelete = useCallback(
    (id: string) => {
      if (!scene) return;
      updateScene({ hotspots: scene.hotspots.filter((h) => h.id !== id) });
      if (selectedHotspotId === id) {
        setSelectedHotspotId(null);
      }
      onHotspotDelete?.(id);
    },
    [scene, selectedHotspotId, updateScene, onHotspotDelete],
  );

  // Handle click on panorama for hotspot placement
  const handlePanoramaClick = useCallback(
    (e: React.MouseEvent) => {
      if (!isPlacingHotspot || !containerRef.current || !scene) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const position = screenToSpherePosition(x, y, rect.width, rect.height);

      const newHotspot: Hotspot = {
        id: uuidv4(),
        position,
        type: newHotspotType,
        interactionTrigger: 'click',
        xapiVerb: 'interacted',
        iconScale: 1,
      };

      handleHotspotAdd(newHotspot);
      handleHotspotSelect(newHotspot.id);
      setIsPlacingHotspot(false);
    },
    [isPlacingHotspot, scene, newHotspotType, handleHotspotAdd, handleHotspotSelect],
  );

  // Toggle fullscreen
  const handleFullscreen = useCallback(() => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      containerRef.current.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  }, [isFullscreen]);

  // Create new scene
  const handleCreateScene = useCallback(
    (url: string) => {
      const newScene: ThreeSixtyScene = {
        id: uuidv4(),
        title: 'New 360° Scene',
        assetUrl: url,
        initialHeading: { x: 0, y: 0, z: 0 },
        isGuided: false,
        hotspots: [],
        ambientAudioVolume: 0.5,
      };
      setScene(newScene);
      onSceneChange?.(newScene);
    },
    [onSceneChange],
  );

  // Empty state
  if (!scene) {
    return (
      <div
        className={cn(
          'flex items-center justify-center min-h-[400px] rounded-lg border border-dashed border-lxd-dark-border',
          className,
        )}
      >
        <div className="text-center space-y-4 p-8">
          <Image className="h-16 w-16 text-muted-foreground/30 mx-auto" />
          <div>
            <h3 className="text-lg font-medium">No panorama loaded</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Enter a URL to an equirectangular panorama image
            </p>
          </div>
          <div className="flex gap-2 max-w-md mx-auto">
            <Input
              id="panorama-url"
              placeholder="https://example.com/panorama.jpg"
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const input = e.target as HTMLInputElement;
                  if (input.value) handleCreateScene(input.value);
                }
              }}
            />
            <Button
              type="button"
              onClick={() => {
                const input = document.getElementById('panorama-url') as HTMLInputElement;
                if (input?.value) handleCreateScene(input.value);
              }}
            >
              Load
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex h-full', className)} ref={containerRef}>
      {/* Main panorama view */}
      <div
        className={cn(
          'relative flex-1 bg-black rounded-lg overflow-hidden',
          isPlacingHotspot && 'cursor-crosshair',
        )}
        onClick={handlePanoramaClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            // Trigger click for keyboard users when placing hotspot
            handlePanoramaClick(e as unknown as React.MouseEvent);
          }
        }}
        role="application"
        aria-label="360 degree panorama viewer"
        tabIndex={isPlacingHotspot ? 0 : -1}
      >
        <PanoramaSphere
          imageUrl={scene.assetUrl}
          rotation={rotation}
          zoom={zoom}
          showGrid={showGrid}
          className="w-full h-full"
        >
          {/* Hotspot overlays */}
          {scene.hotspots.map((hotspot) => {
            // Calculate 2D position from 3D (simplified projection)
            const containerRect = containerRef.current?.getBoundingClientRect();
            if (!containerRect) return null;

            // Project 3D position to 2D (simplified)
            const phi = Math.atan2(hotspot.position.x, hotspot.position.z);
            const theta = Math.asin(
              hotspot.position.y /
                Math.sqrt(
                  hotspot.position.x ** 2 + hotspot.position.y ** 2 + hotspot.position.z ** 2,
                ),
            );

            // Adjust for camera rotation
            const relPhi = phi - rotation.phi;
            const relTheta = theta - rotation.theta;

            // Check if in view (simplified)
            if (Math.abs(relPhi) > Math.PI / 2 || Math.abs(relTheta) > Math.PI / 4) {
              return null;
            }

            // Convert to screen position
            const screenX = 50 + (relPhi / Math.PI) * 100;
            const screenY = 50 - (relTheta / (Math.PI / 2)) * 100;

            return (
              <div
                key={hotspot.id}
                className="absolute pointer-events-auto"
                style={{
                  left: `${screenX}%`,
                  top: `${screenY}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <HotspotMarker
                  hotspot={hotspot}
                  isSelected={hotspot.id === selectedHotspotId}
                  isEditing={!isPreviewMode}
                  onClick={() => handleHotspotSelect(hotspot.id)}
                />
              </div>
            );
          })}
        </PanoramaSphere>

        {/* Orbit controls */}
        <OrbitController
          rotation={rotation}
          onRotationChange={setRotation}
          zoom={zoom}
          onZoomChange={setZoom}
          enabled={!isPlacingHotspot}
          containerRef={containerRef}
        />

        {/* Top toolbar */}
        <div className="absolute top-4 right-4 flex gap-2">
          <Button
            type="button"
            variant="secondary"
            size="icon"
            onClick={() => setShowGrid(!showGrid)}
            className={cn('h-8 w-8', showGrid && 'bg-lxd-cyan/20')}
            title="Toggle grid"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="icon"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className={cn('h-8 w-8', isPreviewMode && 'bg-lxd-cyan/20')}
            title={isPreviewMode ? 'Exit preview' : 'Preview mode'}
          >
            {isPreviewMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="icon"
            onClick={handleFullscreen}
            className="h-8 w-8"
            title="Fullscreen"
          >
            <Maximize className="h-4 w-4" />
          </Button>
        </div>

        {/* Preview mode: Tour controls */}
        {isPreviewMode && scene.isGuided && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
            <GuidedTourEngine
              scene={scene}
              onPositionChange={(pos) => {
                // Convert position to rotation
                const phi = Math.atan2(pos.x, pos.z);
                const theta = Math.asin(pos.y / Math.sqrt(pos.x ** 2 + pos.y ** 2 + pos.z ** 2));
                setRotation({ phi, theta });
              }}
              onStopReached={(hotspot, _index) => {
                if (hotspot) handleHotspotSelect(hotspot.id);
              }}
              onTourComplete={() => {
                setIsPreviewMode(false);
              }}
            />
          </div>
        )}

        {/* Placement mode indicator */}
        {isPlacingHotspot && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-lxd-cyan/90 text-white px-4 py-2 rounded-full text-sm">
            Click to place hotspot
          </div>
        )}
      </div>

      {/* Right sidebar */}
      {!isPreviewMode && (
        <div className="w-80 border-l border-lxd-dark-border bg-lxd-dark-bg overflow-hidden flex flex-col">
          <Tabs defaultValue="hotspots" className="flex-1 flex flex-col">
            <TabsList className="flex-shrink-0 w-full rounded-none border-b border-lxd-dark-border bg-transparent">
              <TabsTrigger value="hotspots" className="flex-1">
                <MapPin className="h-4 w-4 mr-2" />
                Hotspots
              </TabsTrigger>
              <TabsTrigger value="tour" className="flex-1">
                <Route className="h-4 w-4 mr-2" />
                Tour
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex-1">
                <Settings2 className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="hotspots" className="flex-1 m-0 overflow-hidden">
              <HotspotManager
                scene={scene}
                selectedHotspotId={selectedHotspotId}
                isPlacingHotspot={isPlacingHotspot}
                newHotspotType={newHotspotType}
                onSelectHotspot={handleHotspotSelect}
                onUpdateHotspot={handleHotspotUpdate}
                onDeleteHotspot={handleHotspotDelete}
                onStartPlacing={(type) => {
                  setNewHotspotType(type);
                  setIsPlacingHotspot(true);
                }}
                onCancelPlacing={() => setIsPlacingHotspot(false)}
                onTypeChange={setNewHotspotType}
                className="h-full"
              />
            </TabsContent>

            <TabsContent value="tour" className="flex-1 m-0 p-4 overflow-y-auto">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="guided-mode">Guided Tour Mode</Label>
                  <Switch
                    id="guided-mode"
                    checked={scene.isGuided}
                    onCheckedChange={(checked) => updateScene({ isGuided: checked })}
                  />
                </div>

                {scene.isGuided && (
                  <TourSequenceManager
                    scene={scene}
                    onUpdateSequence={(sequence) => updateScene({ tourSequence: sequence })}
                  />
                )}
              </div>
            </TabsContent>

            <TabsContent value="settings" className="flex-1 m-0 p-4 overflow-y-auto">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="scene-title">Scene Title</Label>
                  <Input
                    id="scene-title"
                    value={scene.title}
                    onChange={(e) => updateScene({ title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scene-url">Panorama URL</Label>
                  <Input
                    id="scene-url"
                    value={scene.assetUrl}
                    onChange={(e) => updateScene({ assetUrl: e.target.value })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="show-labels">Show Hotspot Labels</Label>
                  <Switch
                    id="show-labels"
                    checked={showHotspotLabels}
                    onCheckedChange={setShowHotspotLabels}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}

// Export types
export type { ThreeSixtyEditorProps, ThreeSixtyScene, Hotspot, Vector3, HotspotType };

export default ThreeSixtyEditor;
