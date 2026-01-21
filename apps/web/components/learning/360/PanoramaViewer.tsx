'use client';

import { useCallback, useEffect, useRef } from 'react';
import { logger } from '@/lib/logger';
import type { PanoramaHotspot, PanoramaViewerProps } from './types';

// Note: Photo Sphere Viewer CSS must be imported in globals.css or layout
// import "@photo-sphere-viewer/core/index.css"
// import "@photo-sphere-viewer/markers-plugin/index.css"

export function PanoramaViewer({
  imageUrl,
  hotspots = [],
  onHotspotClick,
  onViewChange,
  className = '',
  autoRotate = false,
  initialView = { pitch: 0, yaw: 0 },
}: PanoramaViewerProps): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<unknown>(null);
  const markersPluginRef = useRef<unknown>(null);

  const handleMarkerClick = useCallback(
    (hotspot: PanoramaHotspot): void => {
      onHotspotClick?.(hotspot);
    },
    [onHotspotClick],
  );

  useEffect(() => {
    if (!containerRef.current || typeof window === 'undefined') return;

    let viewer: unknown;
    let markersPlugin: unknown;

    const initViewer = async () => {
      try {
        // Dynamic import for SSR compatibility
        const { Viewer } = await import('@photo-sphere-viewer/core');
        const { MarkersPlugin } = await import('@photo-sphere-viewer/markers-plugin');

        // Import CSS
        await import('@photo-sphere-viewer/core/index.css');
        await import('@photo-sphere-viewer/markers-plugin/index.css');

        const container = containerRef.current;
        if (!container) return;

        viewer = new Viewer({
          container,
          panorama: imageUrl,
          defaultPitch: initialView.pitch * (Math.PI / 180),
          defaultYaw: initialView.yaw * (Math.PI / 180),
          navbar: false,
          plugins: [
            [
              MarkersPlugin,
              {
                markers: hotspots.map((hotspot) => ({
                  id: hotspot.id,
                  position: {
                    pitch: hotspot.pitch * (Math.PI / 180),
                    yaw: hotspot.yaw * (Math.PI / 180),
                  },
                  html: `<div class="panorama-hotspot ${hotspot.className || ''}" title="${hotspot.tooltip || ''}"></div>`,
                  anchor: 'center center',
                  data: hotspot.data,
                })),
              },
            ],
          ],
        });

        viewerRef.current = viewer;
        markersPlugin = (viewer as { getPlugin: (plugin: unknown) => unknown }).getPlugin(
          MarkersPlugin,
        );
        markersPluginRef.current = markersPlugin;

        // Handle marker clicks
        if (markersPlugin && 'addEventListener' in (markersPlugin as object)) {
          (
            markersPlugin as {
              addEventListener: (
                event: string,
                handler: (e: { marker: { id: string } }) => void,
              ) => void;
            }
          ).addEventListener('select-marker', (e: { marker: { id: string } }) => {
            const hotspot = hotspots.find((h) => h.id === e.marker.id);
            if (hotspot) {
              handleMarkerClick(hotspot);
            }
          });
        }

        // Handle view changes
        if (onViewChange && 'addEventListener' in (viewer as object)) {
          (
            viewer as { addEventListener: (event: string, handler: () => void) => void }
          ).addEventListener('position-updated', () => {
            const position = (
              viewer as { getPosition: () => { pitch: number; yaw: number } }
            ).getPosition();
            onViewChange({
              pitch: position.pitch * (180 / Math.PI),
              yaw: position.yaw * (180 / Math.PI),
            });
          });
        }

        // Auto rotate
        if (autoRotate && 'startAutorotate' in (viewer as object)) {
          (viewer as { startAutorotate: () => void }).startAutorotate();
        }
      } catch (error) {
        logger.error('Failed to initialize panorama viewer:', error);
      }
    };

    initViewer();

    return () => {
      if (viewerRef.current && 'destroy' in (viewerRef.current as object)) {
        (viewerRef.current as { destroy: () => void }).destroy();
      }
    };
  }, [imageUrl, hotspots, initialView, autoRotate, handleMarkerClick, onViewChange]);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full min-h-[400px] bg-lxd-dark-page rounded-lg overflow-hidden ${className}`}
      role="img"
      aria-label="360 degree panorama viewer"
    />
  );
}
