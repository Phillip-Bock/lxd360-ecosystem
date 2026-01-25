'use client';

import {
  Compass,
  Eye,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  Smartphone,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { logger } from '@/lib/logger';
import { type Hotspot, hotspotColors, type PanoramaScene } from './HotspotTypes';

const log = logger.scope('PanoramaBlock');

// Photo Sphere Viewer imports (dynamic to avoid SSR issues)
let Viewer: typeof import('@photo-sphere-viewer/core').Viewer | null = null;
let MarkersPlugin: typeof import('@photo-sphere-viewer/markers-plugin').MarkersPlugin | null = null;

interface PanoramaBlockProps {
  scene: PanoramaScene;
  onHotspotClick?: (hotspot: Hotspot) => void;
  onSceneNavigate?: (targetSceneId: string) => void;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  showCompass?: boolean;
  showControls?: boolean;
  enableVR?: boolean;
  className?: string;
  isEditing?: boolean;
  onPositionClick?: (pitch: number, yaw: number) => void;
}

export function PanoramaBlock({
  scene,
  onHotspotClick,
  onSceneNavigate,
  autoRotate = false,
  autoRotateSpeed = 2,
  showCompass = true,
  showControls = true,
  enableVR = true,
  className = '',
  isEditing = false,
  onPositionClick,
}: PanoramaBlockProps): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<InstanceType<typeof import('@photo-sphere-viewer/core').Viewer> | null>(
    null,
  );
  const [isLoaded, setIsLoaded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAutoRotating, setIsAutoRotating] = useState(autoRotate);
  const [currentPosition, setCurrentPosition] = useState({ pitch: 0, yaw: 0 });
  const [zoom, setZoom] = useState(50);
  const [showVRButton, setShowVRButton] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle hotspot click (must be declared before useEffect that uses it)
  const handleHotspotClick = useCallback(
    (hotspot: Hotspot): void => {
      if (hotspot.type === 'scene' && onSceneNavigate) {
        onSceneNavigate(hotspot.targetSceneId);
      } else if (hotspot.type === 'link') {
        window.open(hotspot.url, hotspot.openInNewTab ? '_blank' : '_self');
      } else if (onHotspotClick) {
        onHotspotClick(hotspot);
      }
    },
    [onHotspotClick, onSceneNavigate],
  );

  // Initialize viewer
  useEffect(() => {
    let mounted = true;

    const initViewer = async () => {
      if (!containerRef.current) return;

      try {
        // Dynamic import for SSR compatibility
        const psvCore = await import('@photo-sphere-viewer/core');
        const psvMarkers = await import('@photo-sphere-viewer/markers-plugin');

        // Import CSS
        await import('@photo-sphere-viewer/core/index.css');
        await import('@photo-sphere-viewer/markers-plugin/index.css');

        if (!mounted) return;

        Viewer = psvCore.Viewer;
        MarkersPlugin = psvMarkers.MarkersPlugin;

        // Destroy existing viewer
        if (viewerRef.current) {
          viewerRef.current.destroy();
        }

        // Create new viewer
        const viewer = new Viewer({
          container: containerRef.current,
          panorama: scene.imageUrl,
          defaultPitch: scene.initialPitch ? (scene.initialPitch * Math.PI) / 180 : 0,
          defaultYaw: scene.initialYaw ? (scene.initialYaw * Math.PI) / 180 : 0,
          navbar: false,
          loadingTxt: 'Loading panorama...',
          mousewheel: true,
          touchmoveTwoFingers: true,
          plugins: [
            [
              MarkersPlugin,
              {
                markers: scene.hotspots.map((hotspot) => ({
                  id: hotspot.id,
                  position: {
                    pitch: (hotspot.pitch * Math.PI) / 180,
                    yaw: (hotspot.yaw * Math.PI) / 180,
                  },
                  html: createHotspotHTML(hotspot),
                  anchor: 'center center',
                  tooltip: hotspot.tooltip || getHotspotTooltip(hotspot),
                  data: hotspot,
                })),
              },
            ],
          ],
        });

        viewerRef.current = viewer;

        // Event listeners
        viewer.addEventListener('ready', () => {
          if (mounted) {
            setIsLoaded(true);
            setError(null);
          }
        });

        viewer.addEventListener('position-updated', (e) => {
          if (mounted) {
            setCurrentPosition({
              pitch: (e.position.pitch * 180) / Math.PI,
              yaw: (e.position.yaw * 180) / Math.PI,
            });
          }
        });

        viewer.addEventListener('zoom-updated', (e) => {
          if (mounted) {
            setZoom(e.zoomLevel);
          }
        });

        viewer.addEventListener('click', (e) => {
          if (isEditing && onPositionClick && e.data) {
            onPositionClick((e.data.pitch * 180) / Math.PI, (e.data.yaw * 180) / Math.PI);
          }
        });

        // Marker click handler
        const markersPlugin = viewer.getPlugin(MarkersPlugin) as InstanceType<typeof MarkersPlugin>;
        if (markersPlugin) {
          markersPlugin.addEventListener('select-marker', (e) => {
            const hotspot = e.marker.data as Hotspot;
            if (hotspot) {
              handleHotspotClick(hotspot);
            }
          });
        }

        // Check for VR support
        if (enableVR && navigator.xr) {
          navigator.xr.isSessionSupported('immersive-vr').then((supported) => {
            if (mounted) setShowVRButton(supported);
          });
        }

        // Auto-rotate
        if (autoRotate && viewer && typeof viewer === 'object' && 'startAutorotate' in viewer) {
          const viewerWithAutorotate = viewer as {
            startAutorotate: (config: { speed: string }) => void;
          };
          viewerWithAutorotate.startAutorotate({ speed: `${autoRotateSpeed}rpm` });
          setIsAutoRotating(true);
        }
      } catch (err) {
        log.error(
          'Failed to initialize panorama viewer',
          err instanceof Error ? err : new Error(String(err)),
        );
        if (mounted) {
          setError('Failed to load panorama viewer');
        }
      }
    };

    initViewer();

    return () => {
      mounted = false;
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, [
    scene.imageUrl,
    scene.hotspots,
    scene.initialPitch,
    scene.initialYaw,
    autoRotate,
    autoRotateSpeed,
    enableVR,
    isEditing,
    onPositionClick,
    handleHotspotClick,
  ]);

  // Update markers when hotspots change
  useEffect(() => {
    if (!viewerRef.current || !MarkersPlugin) return;

    const markersPlugin = viewerRef.current.getPlugin(MarkersPlugin) as InstanceType<
      typeof MarkersPlugin
    >;
    if (!markersPlugin) return;

    // Clear existing markers
    markersPlugin.clearMarkers();

    // Add new markers
    scene.hotspots.forEach((hotspot) => {
      markersPlugin.addMarker({
        id: hotspot.id,
        position: {
          pitch: (hotspot.pitch * Math.PI) / 180,
          yaw: (hotspot.yaw * Math.PI) / 180,
        },
        html: createHotspotHTML(hotspot),
        anchor: 'center center',
        tooltip: hotspot.tooltip || getHotspotTooltip(hotspot),
        data: hotspot,
      });
    });
  }, [scene.hotspots]);

  const toggleAutoRotate = (): void => {
    const viewer = viewerRef.current;
    if (!viewer || typeof viewer !== 'object') return;

    if ('stopAutorotate' in viewer && 'startAutorotate' in viewer) {
      const viewerWithAutorotate = viewer as {
        stopAutorotate: () => void;
        startAutorotate: (config: { speed: string }) => void;
      };

      if (isAutoRotating) {
        viewerWithAutorotate.stopAutorotate();
      } else {
        viewerWithAutorotate.startAutorotate({ speed: `${autoRotateSpeed}rpm` });
      }
      setIsAutoRotating(!isAutoRotating);
    }
  };

  const toggleFullscreen = (): void => {
    if (!viewerRef.current) return;
    viewerRef.current.toggleFullscreen();
    setIsFullscreen(!isFullscreen);
  };

  const resetView = (): void => {
    if (!viewerRef.current) return;
    viewerRef.current.animate({
      pitch: scene.initialPitch ? (scene.initialPitch * Math.PI) / 180 : 0,
      yaw: scene.initialYaw ? (scene.initialYaw * Math.PI) / 180 : 0,
      zoom: 50,
      speed: 1000,
    });
  };

  const handleZoom = (direction: 'in' | 'out'): void => {
    if (!viewerRef.current) return;
    const newZoom = direction === 'in' ? Math.min(zoom + 10, 100) : Math.max(zoom - 10, 0);
    viewerRef.current.zoom(newZoom);
  };

  if (error) {
    return (
      <Card className={`p-6 bg-(--lxd-blue-dark-700) border-2 border-brand-error/50 ${className}`}>
        <div className="flex flex-col items-center justify-center h-64 text-brand-error">
          <p className="text-lg font-medium mb-2">Failed to load panorama</p>
          <p className="text-sm text-brand-muted">{error}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={`overflow-hidden bg-(--lxd-blue-dark-700) border-2 border-(--lxd-blue-light) ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-(--brand-primary)">
        <div className="flex items-center gap-3">
          <Eye className="w-5 h-5 text-(--lxd-blue-light)" />
          <div>
            <h3 className="text-lg font-semibold text-brand-primary">{scene.name}</h3>
            {scene.caption && <p className="text-sm text-brand-muted">{scene.caption}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEditing && (
            <Badge
              variant="outline"
              className="border-(--color-lxd-warning) text-(--color-lxd-warning)"
            >
              Edit Mode
            </Badge>
          )}
          <Badge variant="outline" className="border-teal-400 text-teal-400">
            {scene.hotspots.length} Hotspots
          </Badge>
        </div>
      </div>

      {/* Panorama Container */}
      <div className="relative">
        <div
          ref={containerRef}
          className="w-full aspect-video bg-(--brand-primary)"
          style={{ minHeight: '400px' }}
        />

        {/* Loading Overlay */}
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-(--lxd-blue-dark-700)/90">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-4 border-(--lxd-blue-light) border-t-transparent rounded-full animate-spin" />
              <p className="text-brand-muted">Loading panorama...</p>
            </div>
          </div>
        )}

        {/* Controls Overlay */}
        {showControls && isLoaded && (
          <>
            {/* Top-right controls */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <Button
                size="icon"
                variant="outline"
                onClick={toggleFullscreen}
                className="bg-(--lxd-blue-dark-700)/80 border-(--brand-primary) text-brand-primary hover:bg-(--brand-primary)"
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </Button>
              <Button
                size="icon"
                variant="outline"
                onClick={resetView}
                className="bg-(--lxd-blue-dark-700)/80 border-(--brand-primary) text-brand-primary hover:bg-(--brand-primary)"
                title="Reset View"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>

            {/* Bottom controls */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-(--lxd-blue-dark-700)/80 rounded-lg p-2 border border-(--brand-primary)">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => handleZoom('out')}
                className="text-brand-primary hover:bg-(--brand-primary)"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <div className="w-20 h-1 bg-(--brand-primary) rounded-full overflow-hidden">
                <div
                  className="h-full bg-(--lxd-blue-light) transition-all"
                  style={{ width: `${zoom}%` }}
                />
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => handleZoom('in')}
                className="text-brand-primary hover:bg-(--brand-primary)"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <div className="w-px h-6 bg-(--brand-primary)" />
              <Button
                size="icon"
                variant="ghost"
                onClick={toggleAutoRotate}
                className={`text-brand-primary hover:bg-(--brand-primary) ${isAutoRotating ? 'text-teal-400' : ''}`}
                title={isAutoRotating ? 'Stop Auto-Rotate' : 'Start Auto-Rotate'}
              >
                {isAutoRotating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              {enableVR && showVRButton && (
                <>
                  <div className="w-px h-6 bg-(--brand-primary)" />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-brand-primary hover:bg-(--brand-primary)"
                    title="Enter VR Mode"
                  >
                    <Smartphone className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>

            {/* Compass */}
            {showCompass && (
              <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-(--lxd-blue-dark-700)/80 rounded-lg px-3 py-2 border border-(--brand-primary)">
                <Compass className="w-4 h-4 text-teal-400" />
                <span className="text-xs text-brand-primary font-mono">
                  {Math.round(currentPosition.yaw)}°
                </span>
              </div>
            )}

            {/* Position indicator (edit mode) */}
            {isEditing && (
              <div className="absolute top-4 left-4 bg-(--lxd-blue-dark-700)/80 rounded-lg px-3 py-2 border border-(--color-lxd-warning)">
                <p className="text-xs text-(--color-lxd-warning) font-mono">
                  Click to place hotspot
                </p>
                <p className="text-xs text-brand-primary font-mono mt-1">
                  Pitch: {currentPosition.pitch.toFixed(1)}° | Yaw: {currentPosition.yaw.toFixed(1)}
                  °
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Mobile touch hint */}
      <div className="p-3 bg-(--brand-primary)/30 border-t border-(--brand-primary) text-center">
        <p className="text-xs text-brand-muted">
          Drag to look around • Pinch to zoom • Click hotspots for more info
        </p>
      </div>
    </Card>
  );
}

// Helper function to create hotspot HTML
function createHotspotHTML(hotspot: Hotspot): string {
  const color = hotspotColors[hotspot.type];

  // Colors should already be CSS variables from HotspotTypes
  const cssColor = color;

  return `
    <div class="panorama-hotspot" style="
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      background: ${cssColor};
      border-radius: 50%;
      cursor: pointer;
      box-shadow: 0 4px 12px ${cssColor}40;
      transition: transform 0.2s, box-shadow 0.2s;
      animation: pulse 2s infinite;
    ">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        ${getIconPath(hotspot.type)}
      </svg>
    </div>
    <style>
      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
      }
      .panorama-hotspot:hover {
        transform: scale(1.2) !important;
        box-shadow: 0 6px 20px ${cssColor}60 !important;
      }
    </style>
  `;
}

// Get SVG path for icon
function getIconPath(type: Hotspot['type']): string {
  switch (type) {
    case 'info':
      return '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>';
    case 'scene':
      return '<polygon points="3 11 22 2 13 21 11 13 3 11"/>';
    case 'link':
      return '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>';
    case 'custom':
      return '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>';
    case 'video':
      return '<polygon points="5 3 19 12 5 21 5 3"/>';
    case 'document':
      return '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>';
    case 'warning':
      return '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>';
    default:
      return '';
  }
}

// Get tooltip text for hotspot
function getHotspotTooltip(hotspot: Hotspot): string {
  switch (hotspot.type) {
    case 'info':
      return hotspot.title;
    case 'scene':
      return `Go to: ${hotspot.targetSceneId}`;
    case 'link':
      return hotspot.title;
    case 'custom':
      return hotspot.title;
    case 'video':
      return hotspot.title;
    case 'document':
      return hotspot.title;
    case 'warning':
      return `⚠️ ${hotspot.title}`;
    default:
      return 'Hotspot';
  }
}

export default PanoramaBlock;
