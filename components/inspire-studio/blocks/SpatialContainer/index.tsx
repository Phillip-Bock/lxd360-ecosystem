'use client';

import { Box, Maximize, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import type { BaseBlockProps, SpatialContainerConfig, SpatialContainerContent } from '../types';

// ============================================================================
// DEFAULTS
// ============================================================================

const defaultConfig: SpatialContainerConfig = {
  enableRotation: true,
  enableZoom: true,
  enablePan: true,
  autoRotate: false,
  autoRotateSpeed: 1,
  showHotspots: true,
  showAnnotations: true,
  backgroundColor: '#0A0A0F',
  lighting: 'studio',
};

// ============================================================================
// COMPONENT
// ============================================================================

interface SpatialContainerBlockProps extends BaseBlockProps {
  content?: SpatialContainerContent;
  config?: SpatialContainerConfig;
}

/**
 * SpatialContainerBlock - 3D/XR content container
 *
 * Features:
 * - 3D model viewer (GLTF/GLB)
 * - 360° panorama support
 * - AR scene preview
 * - Interactive hotspots
 *
 * Note: Full 3D rendering requires Three.js/R3F integration
 * This component provides the UI shell and configuration
 */
export function SpatialContainerBlock({
  content,
  config = defaultConfig,
  isEditing = false,
  onContentChange,
  onConfigChange,
  className,
}: SpatialContainerBlockProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(100);
  const [selectedHotspot, setSelectedHotspot] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleConfigChange = useCallback(
    (key: keyof SpatialContainerConfig, value: unknown) => {
      onConfigChange?.({ ...config, [key]: value });
    },
    [config, onConfigChange],
  );

  const handleContentChange = useCallback(
    (updates: Partial<SpatialContainerContent>) => {
      onContentChange?.({ ...content, ...updates });
    },
    [content, onContentChange],
  );

  const handleZoom = useCallback(
    (delta: number) => {
      if (!config.enableZoom) return;
      setZoom((prev) => Math.max(50, Math.min(200, prev + delta)));
    },
    [config.enableZoom],
  );

  const handleReset = useCallback(() => {
    setZoom(100);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      containerRef.current.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  // Render editing mode
  if (isEditing) {
    return (
      <div className={cn('space-y-4', className)}>
        {/* Content Type */}
        <div className="space-y-2">
          <Label className="text-xs">Content Type</Label>
          <Select
            value={content?.type ?? '3d-model'}
            onValueChange={(v) =>
              handleContentChange({ type: v as SpatialContainerContent['type'] })
            }
          >
            <SelectTrigger className="h-8 text-xs bg-lxd-dark-bg border-lxd-dark-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-lxd-dark-surface border-lxd-dark-border">
              <SelectItem value="3d-model">3D Model</SelectItem>
              <SelectItem value="360-panorama">360° Panorama</SelectItem>
              <SelectItem value="ar-scene">AR Scene</SelectItem>
              <SelectItem value="vr-environment">VR Environment</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Model/Source URL */}
        {content?.type === '3d-model' && (
          <div className="space-y-2">
            <Label className="text-xs">3D Model URL (GLTF/GLB)</Label>
            <input
              type="text"
              value={content?.model?.src ?? ''}
              onChange={(e) =>
                handleContentChange({
                  model: {
                    ...content?.model,
                    src: e.target.value,
                    format: 'glb',
                    scale: content?.model?.scale ?? 1,
                    rotation: content?.model?.rotation ?? { x: 0, y: 0, z: 0 },
                    position: content?.model?.position ?? { x: 0, y: 0, z: 0 },
                  },
                })
              }
              placeholder="https://example.com/model.glb"
              className="w-full h-8 px-3 text-xs bg-lxd-dark-bg border border-lxd-dark-border rounded-md"
            />
          </div>
        )}

        {content?.type === '360-panorama' && (
          <div className="space-y-2">
            <Label className="text-xs">Panorama Image URL</Label>
            <input
              type="text"
              value={content?.panoramaSrc ?? ''}
              onChange={(e) => handleContentChange({ panoramaSrc: e.target.value })}
              placeholder="https://example.com/panorama.jpg"
              className="w-full h-8 px-3 text-xs bg-lxd-dark-bg border border-lxd-dark-border rounded-md"
            />
          </div>
        )}

        {/* Model Scale (3D only) */}
        {content?.type === '3d-model' && content?.model && (
          <div className="space-y-2">
            <Label className="text-xs">Model Scale</Label>
            <Slider
              value={[content.model.scale ?? 1]}
              min={0.1}
              max={5}
              step={0.1}
              onValueChange={([v]) =>
                handleContentChange({
                  model: { ...content.model!, scale: v },
                })
              }
              className="w-full"
            />
            <span className="text-xs text-muted-foreground">{content.model.scale ?? 1}x</span>
          </div>
        )}

        {/* Lighting */}
        <div className="space-y-2">
          <Label className="text-xs">Lighting</Label>
          <Select
            value={config.lighting ?? 'studio'}
            onValueChange={(v) =>
              handleConfigChange('lighting', v as SpatialContainerConfig['lighting'])
            }
          >
            <SelectTrigger className="h-8 text-xs bg-lxd-dark-bg border-lxd-dark-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-lxd-dark-surface border-lxd-dark-border">
              <SelectItem value="studio">Studio</SelectItem>
              <SelectItem value="outdoor">Outdoor</SelectItem>
              <SelectItem value="dramatic">Dramatic</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Config Options */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-lxd-dark-border">
          <div className="flex items-center gap-2">
            <Switch
              checked={config.enableRotation ?? true}
              onCheckedChange={(v) => handleConfigChange('enableRotation', v)}
            />
            <Label className="text-xs">Enable Rotation</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={config.enableZoom ?? true}
              onCheckedChange={(v) => handleConfigChange('enableZoom', v)}
            />
            <Label className="text-xs">Enable Zoom</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={config.enablePan ?? true}
              onCheckedChange={(v) => handleConfigChange('enablePan', v)}
            />
            <Label className="text-xs">Enable Pan</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={config.autoRotate ?? false}
              onCheckedChange={(v) => handleConfigChange('autoRotate', v)}
            />
            <Label className="text-xs">Auto Rotate</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={config.showHotspots ?? true}
              onCheckedChange={(v) => handleConfigChange('showHotspots', v)}
            />
            <Label className="text-xs">Show Hotspots</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={config.showAnnotations ?? true}
              onCheckedChange={(v) => handleConfigChange('showAnnotations', v)}
            />
            <Label className="text-xs">Show Annotations</Label>
          </div>
        </div>

        {/* Auto Rotate Speed */}
        {config.autoRotate && (
          <div className="space-y-2">
            <Label className="text-xs">Auto Rotate Speed</Label>
            <Slider
              value={[config.autoRotateSpeed ?? 1]}
              min={0.1}
              max={5}
              step={0.1}
              onValueChange={([v]) => handleConfigChange('autoRotateSpeed', v)}
              className="w-full"
            />
            <span className="text-xs text-muted-foreground">{config.autoRotateSpeed ?? 1}x</span>
          </div>
        )}

        {/* Background Color */}
        <div className="space-y-2">
          <Label className="text-xs">Background Color</Label>
          <input
            type="color"
            value={config.backgroundColor ?? '#0A0A0F'}
            onChange={(e) => handleConfigChange('backgroundColor', e.target.value)}
            className="w-full h-8 bg-lxd-dark-bg border border-lxd-dark-border rounded-md cursor-pointer"
          />
        </div>
      </div>
    );
  }

  // Render display mode - 3D viewer shell
  return (
    <div className={cn('space-y-4', className)}>
      {/* 3D Viewer Container */}
      <div
        ref={containerRef}
        className="relative aspect-video rounded-lg overflow-hidden group"
        style={{ backgroundColor: config.backgroundColor }}
      >
        {/* Placeholder for Three.js/R3F canvas */}
        <div className="absolute inset-0 flex items-center justify-center">
          {!content?.model?.src && !content?.panoramaSrc ? (
            <div className="text-center">
              <Box className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">No 3D content loaded</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Add a model URL in edit mode</p>
            </div>
          ) : (
            <div className="text-center">
              <Box className="h-16 w-16 text-lxd-purple/50 mx-auto mb-4 animate-pulse" />
              <p className="text-muted-foreground">3D Viewer</p>
              <Badge variant="outline" className="mt-2">
                {content?.type === '3d-model' && '3D Model'}
                {content?.type === '360-panorama' && '360° Panorama'}
                {content?.type === 'ar-scene' && 'AR Scene'}
                {content?.type === 'vr-environment' && 'VR Environment'}
              </Badge>
              <p className="text-xs text-muted-foreground/70 mt-2">
                Three.js integration required for full rendering
              </p>
            </div>
          )}
        </div>

        {/* Hotspots */}
        {config.showHotspots &&
          content?.hotspots?.map((hotspot) => (
            <button
              key={hotspot.id}
              type="button"
              className={cn(
                'absolute w-6 h-6 rounded-full bg-lxd-purple border-2 border-white',
                'transform -translate-x-1/2 -translate-y-1/2 cursor-pointer',
                'hover:scale-110 transition-transform',
                selectedHotspot === hotspot.id && 'ring-2 ring-lxd-cyan',
              )}
              style={{
                left: `${hotspot.position.x * 100}%`,
                top: `${hotspot.position.y * 100}%`,
              }}
              onClick={() => setSelectedHotspot(hotspot.id)}
              title={hotspot.label}
            />
          ))}

        {/* Hotspot Tooltip */}
        {selectedHotspot && (
          <div className="absolute bottom-4 left-4 right-4 p-3 rounded-lg bg-lxd-dark-surface/90 backdrop-blur border border-lxd-dark-border">
            {(() => {
              const hotspot = content?.hotspots?.find((h) => h.id === selectedHotspot);
              if (!hotspot) return null;
              return (
                <div>
                  <p className="font-medium">{hotspot.label}</p>
                  {hotspot.content && (
                    <p className="text-sm text-muted-foreground mt-1">{hotspot.content}</p>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* Controls Overlay */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {config.enableZoom && (
            <>
              <Button
                type="button"
                variant="secondary"
                size="icon"
                onClick={() => handleZoom(10)}
                className="h-8 w-8"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="icon"
                onClick={() => handleZoom(-10)}
                className="h-8 w-8"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
            </>
          )}
          <Button
            type="button"
            variant="secondary"
            size="icon"
            onClick={handleReset}
            className="h-8 w-8"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            onClick={toggleFullscreen}
            className="h-8 w-8"
          >
            <Maximize className="h-4 w-4" />
          </Button>
        </div>

        {/* Zoom Indicator */}
        <div className="absolute bottom-4 right-4 text-xs text-white/70">{zoom}%</div>
      </div>

      {/* Annotations List */}
      {config.showAnnotations && content?.annotations && content.annotations.length > 0 && (
        <div className="space-y-2">
          <Label className="text-xs">Annotations</Label>
          <div className="space-y-1">
            {content.annotations.map((annotation) => (
              <div
                key={annotation.id}
                className="p-2 rounded-lg bg-lxd-dark-bg border border-lxd-dark-border text-sm"
              >
                {annotation.text}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default SpatialContainerBlock;
