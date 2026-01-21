'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import {
  buildHotspotFocusedStatement,
  buildHotspotInteractedStatement,
  buildSceneCompletedStatement,
  buildSceneInitializedStatement,
} from '../spatial-utils';
import { GuidedTourEngine } from '../ThreeSixtyEditor/GuidedTourEngine';
import { HotspotMarker } from '../ThreeSixtyEditor/HotspotMarker';
import { OrbitController } from '../ThreeSixtyEditor/OrbitController';
import { PanoramaSphere } from '../ThreeSixtyEditor/PanoramaSphere';
import type { Hotspot, ThreeSixtyPlayerProps, Vector3 } from '../ThreeSixtyEditor/types';

// =============================================================================
// xAPI Actor (would come from auth context in real app)
// =============================================================================

const DEFAULT_ACTOR = {
  name: 'Learner',
  account: {
    homePage: 'https://inspire.lxd360.com',
    name: 'learner-id',
  },
};

// =============================================================================
// Component
// =============================================================================

/**
 * ThreeSixtyPlayer - Learner-facing 360° panorama viewer
 *
 * Features:
 * - Panorama viewing with orbit controls
 * - Hotspot interactions
 * - Guided tour playback
 * - xAPI statement generation
 * - Dwell time tracking
 */
export function ThreeSixtyPlayer({
  scene,
  autoStart = false,
  showControls = true,
  onHotspotInteract,
  onTourComplete,
  onSceneComplete,
  className,
}: ThreeSixtyPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number>(Date.now());
  const hotspotsVisitedRef = useRef<Set<string>>(new Set());
  const dwellTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentGazeRef = useRef<string | null>(null);
  const gazeStartRef = useRef<number | null>(null);

  // State
  const [rotation, setRotation] = useState({
    phi: scene.initialHeading?.x ?? 0,
    theta: scene.initialHeading?.y ?? 0,
  });
  const [zoom, setZoom] = useState(1);
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Send xAPI statement for scene initialization
  useEffect(() => {
    if (!isLoaded) return;

    const statement = buildSceneInitializedStatement(DEFAULT_ACTOR, scene);
    // TODO(LXD-XAPI): Send to xAPI endpoint
    void statement;
    startTimeRef.current = Date.now();
  }, [scene, isLoaded]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (dwellTimerRef.current) {
        clearTimeout(dwellTimerRef.current);
      }

      // Send completion statement
      const duration = Date.now() - startTimeRef.current;
      const statement = buildSceneCompletedStatement(
        DEFAULT_ACTOR,
        scene,
        duration,
        hotspotsVisitedRef.current.size,
        scene.hotspots.length,
      );
      // TODO(LXD-XAPI): Send to xAPI endpoint
      void statement;
      onSceneComplete?.(duration);
    };
  }, [scene, onSceneComplete]);

  // Handle hotspot click/interaction
  const handleHotspotClick = useCallback(
    (hotspot: Hotspot) => {
      // Track visit
      hotspotsVisitedRef.current.add(hotspot.id);

      // Send xAPI statement
      const statement = buildHotspotInteractedStatement(
        DEFAULT_ACTOR,
        scene,
        hotspot,
        hotspot.interactionTrigger,
      );
      // TODO(LXD-XAPI): Send to xAPI endpoint
      void statement;

      // Handle by type
      switch (hotspot.type) {
        case 'info_popup':
          setActiveHotspot(hotspot);
          setShowPopup(true);
          break;

        case 'audio_spatial':
          if (hotspot.audioSrc) {
            const audio = new Audio(hotspot.audioSrc);
            audio.play().catch(console.error);
          }
          break;

        case 'navigation':
          // TODO(LXD-SPATIAL): Navigate to linked scene
          void hotspot.linkedSceneId;
          break;

        case 'quiz_block':
          // TODO(LXD-SPATIAL): Open linked quiz block
          void hotspot.linkedBlockId;
          break;

        case 'sim_trigger':
          // TODO(LXD-SPATIAL): Trigger simulation
          void hotspot.linkedBlockId;
          break;
      }

      onHotspotInteract?.(hotspot.id, hotspot.type);
    },
    [scene, onHotspotInteract],
  );

  // Handle hotspot gaze tracking
  const handleHotspotGaze = useCallback(
    (hotspot: Hotspot) => {
      if (hotspot.interactionTrigger !== 'gaze') return;

      if (currentGazeRef.current === hotspot.id) return;

      // Clear previous gaze timer
      if (dwellTimerRef.current) {
        clearTimeout(dwellTimerRef.current);
        if (currentGazeRef.current && gazeStartRef.current) {
          const dwellTime = Date.now() - gazeStartRef.current;
          const prevHotspot = scene.hotspots.find((h) => h.id === currentGazeRef.current);
          if (prevHotspot && dwellTime > 500) {
            const statement = buildHotspotFocusedStatement(
              DEFAULT_ACTOR,
              scene,
              prevHotspot,
              dwellTime,
            );
            // TODO(LXD-XAPI): Send to xAPI endpoint
            void statement;
          }
        }
      }

      currentGazeRef.current = hotspot.id;
      gazeStartRef.current = Date.now();

      // Start new gaze timer (2s for trigger)
      dwellTimerRef.current = setTimeout(() => {
        handleHotspotClick(hotspot);
      }, 2000);
    },
    [scene, handleHotspotClick],
  );

  // Close popup
  const handleClosePopup = useCallback(() => {
    setShowPopup(false);
    setActiveHotspot(null);
  }, []);

  // Handle tour position changes
  const handleTourPositionChange = useCallback((position: Vector3) => {
    const phi = Math.atan2(position.x, position.z);
    const theta = Math.asin(
      position.y / Math.sqrt(position.x ** 2 + position.y ** 2 + position.z ** 2),
    );
    setRotation({ phi, theta });
  }, []);

  // Handle tour stop reached
  const handleTourStopReached = useCallback((hotspot: Hotspot | null, _index: number) => {
    if (hotspot) {
      hotspotsVisitedRef.current.add(hotspot.id);
      setActiveHotspot(hotspot);
      if (hotspot.type === 'info_popup' && hotspot.description) {
        setShowPopup(true);
      }
    }
  }, []);

  // Handle tour complete
  const handleTourComplete = useCallback(() => {
    const duration = Date.now() - startTimeRef.current;
    const statement = buildSceneCompletedStatement(
      DEFAULT_ACTOR,
      scene,
      duration,
      hotspotsVisitedRef.current.size,
      scene.hotspots.length,
    );
    // TODO(LXD-XAPI): Send to xAPI endpoint
    void statement;
    onTourComplete?.();
  }, [scene, onTourComplete]);

  return (
    <div className={cn('relative overflow-hidden rounded-lg', className)} ref={containerRef}>
      {/* Panorama */}
      <PanoramaSphere
        imageUrl={scene.assetUrl}
        rotation={rotation}
        zoom={zoom}
        onLoad={() => setIsLoaded(true)}
        className="w-full h-full"
      >
        {/* Hotspot overlays */}
        {scene.hotspots.map((hotspot) => {
          // Calculate 2D position from 3D
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

          // Check if in view
          if (Math.abs(relPhi) > Math.PI / 2 || Math.abs(relTheta) > Math.PI / 4) {
            return null;
          }

          // Convert to screen position
          const screenX = 50 + (relPhi / Math.PI) * 100;
          const screenY = 50 - (relTheta / (Math.PI / 2)) * 100;

          // Check for gaze trigger
          if (
            hotspot.interactionTrigger === 'gaze' &&
            Math.abs(relPhi) < 0.1 &&
            Math.abs(relTheta) < 0.1
          ) {
            handleHotspotGaze(hotspot);
          }

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
                isSelected={activeHotspot?.id === hotspot.id}
                onClick={() => handleHotspotClick(hotspot)}
              />
            </div>
          );
        })}
      </PanoramaSphere>

      {/* Orbit controls */}
      {showControls && !scene.isGuided && (
        <OrbitController
          rotation={rotation}
          onRotationChange={setRotation}
          zoom={zoom}
          onZoomChange={setZoom}
          containerRef={containerRef}
        />
      )}

      {/* Guided tour controls */}
      {scene.isGuided && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
          <GuidedTourEngine
            scene={scene}
            autoStart={autoStart}
            onPositionChange={handleTourPositionChange}
            onStopReached={handleTourStopReached}
            onTourComplete={handleTourComplete}
          />
        </div>
      )}

      {/* Info popup */}
      {showPopup && activeHotspot && (
        <div
          role="presentation"
          className="absolute inset-0 flex items-center justify-center bg-black/50"
          onClick={handleClosePopup}
          onKeyDown={(e) => e.key === 'Escape' && handleClosePopup()}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="hotspot-dialog-title"
            className="bg-lxd-dark-surface rounded-lg p-6 max-w-md mx-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <h3 id="hotspot-dialog-title" className="text-lg font-semibold mb-2">
              {activeHotspot.label || 'Information'}
            </h3>
            {activeHotspot.description && (
              <p className="text-sm text-muted-foreground">{activeHotspot.description}</p>
            )}
            <button
              type="button"
              onClick={handleClosePopup}
              className="mt-4 px-4 py-2 bg-lxd-purple text-white rounded-md hover:bg-lxd-purple/80 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Loading overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-lxd-cyan border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-white/70 mt-2">Loading panorama...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default ThreeSixtyPlayer;
