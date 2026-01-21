'use client';

import { ImageOff, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

// =============================================================================
// Types
// =============================================================================

interface PanoramaSphereProps {
  /** URL of the equirectangular panorama image */
  imageUrl: string;
  /** Camera rotation (phi = horizontal, theta = vertical) */
  rotation: { phi: number; theta: number };
  /** Zoom level (1 = default FOV) */
  zoom: number;
  /** Callback when image loads */
  onLoad?: () => void;
  /** Callback on load error */
  onError?: (error: Error) => void;
  /** Background color while loading */
  backgroundColor?: string;
  /** Whether to show grid overlay (for editing) */
  showGrid?: boolean;
  /** Class name for container */
  className?: string;
  /** Children (hotspot overlays) */
  children?: React.ReactNode;
}

// =============================================================================
// Component
// =============================================================================

/**
 * PanoramaSphere - 360° panorama viewer using CSS transforms
 *
 * This is a lightweight CSS-based implementation.
 * For full 3D with React Three Fiber, use EditorScene.tsx instead.
 */
export function PanoramaSphere({
  imageUrl,
  rotation,
  zoom,
  onLoad,
  onError,
  backgroundColor = '#0A0A0F',
  showGrid = false,
  className,
  children,
}: PanoramaSphereProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Load and validate image
  useEffect(() => {
    if (!imageUrl) {
      setIsLoading(false);
      setHasError(true);
      return;
    }

    setIsLoading(true);
    setHasError(false);

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      setIsLoading(false);
      setImageLoaded(true);
      onLoad?.();
    };

    img.onerror = () => {
      setIsLoading(false);
      setHasError(true);
      onError?.(new Error(`Failed to load panorama: ${imageUrl}`));
    };

    img.src = imageUrl;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [imageUrl, onLoad, onError]);

  // Calculate transform for panorama effect
  // Convert rotation to translate percentage
  const horizontalOffset = ((rotation.phi / (2 * Math.PI)) * 100 + 50) % 100;
  const verticalOffset = (rotation.theta / Math.PI) * 100 + 50;

  // Calculate FOV-based scale
  const fovScale = 1 / zoom;

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-hidden', className)}
      style={{ backgroundColor }}
    >
      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-lxd-cyan animate-spin mx-auto" />
            <p className="text-sm text-white/70 mt-2">Loading panorama...</p>
          </div>
        </div>
      )}

      {/* Error state */}
      {hasError && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-center">
            <ImageOff className="h-12 w-12 text-red-500 mx-auto" />
            <p className="text-sm text-white/70 mt-2">Failed to load panorama</p>
            <p className="text-xs text-white/50 mt-1">Check the image URL</p>
          </div>
        </div>
      )}

      {/* Panorama image container */}
      {imageLoaded && !hasError && (
        <div
          className="absolute inset-0"
          style={{
            perspective: '1000px',
            perspectiveOrigin: 'center center',
          }}
        >
          {/* Panorama image with transform */}
          <div
            className="absolute"
            style={{
              width: '400%',
              height: '200%',
              left: '50%',
              top: '50%',
              transform: `
                translate(-50%, -50%)
                translateX(${-horizontalOffset * 4}%)
                translateY(${-(verticalOffset - 50) * 2}%)
                scale(${fovScale})
              `,
              transformOrigin: 'center center',
              transition: 'transform 0.05s ease-out',
            }}
          >
            <Image
              src={imageUrl}
              alt="360° panorama"
              fill
              className="object-cover"
              draggable={false}
              unoptimized
            />
          </div>
        </div>
      )}

      {/* Grid overlay for editing */}
      {showGrid && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Horizontal lines */}
          {[25, 50, 75].map((y) => (
            <div
              key={`h-${y}`}
              className="absolute left-0 right-0 border-t border-white/20"
              style={{ top: `${y}%` }}
            />
          ))}
          {/* Vertical lines */}
          {[25, 50, 75].map((x) => (
            <div
              key={`v-${x}`}
              className="absolute top-0 bottom-0 border-l border-white/20"
              style={{ left: `${x}%` }}
            />
          ))}
          {/* Center crosshair */}
          <div className="absolute top-1/2 left-1/2 w-8 h-8 -translate-x-1/2 -translate-y-1/2">
            <div className="absolute top-1/2 left-0 right-0 border-t border-lxd-cyan" />
            <div className="absolute left-1/2 top-0 bottom-0 border-l border-lxd-cyan" />
          </div>
        </div>
      )}

      {/* Hotspot children */}
      <div className="absolute inset-0 pointer-events-none">{children}</div>

      {/* Rotation indicator */}
      <div className="absolute top-4 left-4 bg-black/50 backdrop-blur rounded px-2 py-1">
        <p className="text-xs text-white/70 font-mono">
          φ: {((rotation.phi * 180) / Math.PI).toFixed(1)}° θ:{' '}
          {((rotation.theta * 180) / Math.PI).toFixed(1)}°
        </p>
      </div>
    </div>
  );
}

export default PanoramaSphere;
