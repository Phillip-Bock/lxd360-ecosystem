'use client';

import { Compass, Minus, Plus, RotateCcw } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// =============================================================================
// Types
// =============================================================================

interface OrbitControllerProps {
  /** Current camera rotation (phi, theta in radians) */
  rotation: { phi: number; theta: number };
  /** Callback when rotation changes */
  onRotationChange: (rotation: { phi: number; theta: number }) => void;
  /** Current zoom level (1 = default) */
  zoom: number;
  /** Callback when zoom changes */
  onZoomChange: (zoom: number) => void;
  /** Whether controls are enabled */
  enabled?: boolean;
  /** Auto-rotate speed (0 = disabled) */
  autoRotateSpeed?: number;
  /** Container ref for mouse events */
  containerRef?: React.RefObject<HTMLElement | null>;
  /** Invert Y axis */
  invertY?: boolean;
  /** Rotation sensitivity */
  sensitivity?: number;
  /** Min/max zoom */
  minZoom?: number;
  maxZoom?: number;
  /** Class name for controls overlay */
  className?: string;
}

// =============================================================================
// Component
// =============================================================================

/**
 * OrbitController - Mouse/touch controls for 360° panorama navigation
 */
export function OrbitController({
  rotation,
  onRotationChange,
  zoom,
  onZoomChange,
  enabled = true,
  autoRotateSpeed = 0,
  containerRef,
  invertY = false,
  sensitivity = 0.003,
  minZoom = 0.5,
  maxZoom = 2,
  className,
}: OrbitControllerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const lastPointerRef = useRef({ x: 0, y: 0 });
  const autoRotateRef = useRef<number | null>(null);

  // Handle mouse/touch start
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!enabled) return;
      setIsDragging(true);
      lastPointerRef.current = { x: e.clientX, y: e.clientY };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [enabled],
  );

  // Handle mouse/touch move
  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!enabled || !isDragging) return;

      const deltaX = e.clientX - lastPointerRef.current.x;
      const deltaY = e.clientY - lastPointerRef.current.y;
      lastPointerRef.current = { x: e.clientX, y: e.clientY };

      const newPhi = rotation.phi - deltaX * sensitivity;
      const thetaChange = deltaY * sensitivity * (invertY ? -1 : 1);
      const newTheta = Math.max(
        -Math.PI / 2 + 0.1,
        Math.min(Math.PI / 2 - 0.1, rotation.theta - thetaChange),
      );

      onRotationChange({ phi: newPhi, theta: newTheta });
    },
    [enabled, isDragging, rotation, sensitivity, invertY, onRotationChange],
  );

  // Handle mouse/touch end
  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  }, []);

  // Handle wheel zoom
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (!enabled) return;
      e.preventDefault();

      const zoomDelta = e.deltaY > 0 ? -0.1 : 0.1;
      const newZoom = Math.max(minZoom, Math.min(maxZoom, zoom + zoomDelta));
      onZoomChange(newZoom);
    },
    [enabled, zoom, minZoom, maxZoom, onZoomChange],
  );

  // Attach wheel listener to container
  useEffect(() => {
    const container = containerRef?.current;
    if (!container) return;

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [containerRef, handleWheel]);

  // Auto-rotate
  useEffect(() => {
    if (autoRotateSpeed === 0 || isDragging) {
      if (autoRotateRef.current) {
        cancelAnimationFrame(autoRotateRef.current);
        autoRotateRef.current = null;
      }
      return;
    }

    let lastTime = performance.now();

    function animate(time: number) {
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      onRotationChange({
        phi: rotation.phi + autoRotateSpeed * delta,
        theta: rotation.theta,
      });

      autoRotateRef.current = requestAnimationFrame(animate);
    }

    autoRotateRef.current = requestAnimationFrame(animate);

    return () => {
      if (autoRotateRef.current) {
        cancelAnimationFrame(autoRotateRef.current);
      }
    };
  }, [autoRotateSpeed, isDragging, rotation, onRotationChange]);

  // Reset to default view
  const handleReset = useCallback(() => {
    onRotationChange({ phi: 0, theta: 0 });
    onZoomChange(1);
  }, [onRotationChange, onZoomChange]);

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    onZoomChange(Math.min(maxZoom, zoom + 0.1));
  }, [zoom, maxZoom, onZoomChange]);

  const handleZoomOut = useCallback(() => {
    onZoomChange(Math.max(minZoom, zoom - 0.1));
  }, [zoom, minZoom, onZoomChange]);

  // Convert rotation to compass direction
  const compassDirection = Math.round(((rotation.phi * 180) / Math.PI + 360) % 360);
  const cardinalDirection = getCardinalDirection(compassDirection);

  return (
    <>
      {/* Invisible drag overlay */}
      <div
        className={cn('absolute inset-0', isDragging ? 'cursor-grabbing' : 'cursor-grab')}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      />

      {/* Controls overlay */}
      <div className={cn('absolute bottom-4 right-4 flex flex-col gap-2', className)}>
        {/* Zoom controls */}
        <div className="flex flex-col gap-1 bg-black/50 backdrop-blur rounded-lg p-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleZoomIn}
            disabled={zoom >= maxZoom}
            className="h-8 w-8 text-white hover:bg-white/20"
          >
            <Plus className="h-4 w-4" />
          </Button>

          <div className="px-2 py-1 text-xs text-white text-center">{Math.round(zoom * 100)}%</div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleZoomOut}
            disabled={zoom <= minZoom}
            className="h-8 w-8 text-white hover:bg-white/20"
          >
            <Minus className="h-4 w-4" />
          </Button>
        </div>

        {/* Reset button */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleReset}
          className="h-8 w-8 bg-black/50 backdrop-blur text-white hover:bg-white/20 rounded-lg"
          title="Reset view"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* Compass */}
      <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur rounded-lg p-2">
        <div className="relative w-12 h-12">
          <Compass
            className="w-12 h-12 text-white"
            style={{
              transform: `rotate(${-compassDirection}deg)`,
              transition: 'transform 0.1s ease-out',
            }}
          />
        </div>
        <div className="text-xs text-white text-center mt-1">
          {compassDirection}° {cardinalDirection}
        </div>
      </div>
    </>
  );
}

// =============================================================================
// Helpers
// =============================================================================

function getCardinalDirection(degrees: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}

export default OrbitController;
