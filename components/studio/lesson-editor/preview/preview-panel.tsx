'use client';

/**
 * PreviewPanel - Device preview system for testing content across screen sizes
 * Supports desktop, tablet, and mobile views with accessibility overlays
 */

import {
  Accessibility,
  Monitor,
  Moon,
  Pause,
  Play,
  RotateCcw,
  Smartphone,
  Sun,
  Tablet,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { CanvasBlock } from '../lesson-canvas';

const DEVICES = {
  desktop: {
    name: 'Desktop',
    width: 1920,
    height: 1080,
    icon: Monitor,
    scale: 0.5,
  },
  laptop: {
    name: 'Laptop',
    width: 1366,
    height: 768,
    icon: Monitor,
    scale: 0.6,
  },
  tablet: {
    name: 'iPad Pro',
    width: 1024,
    height: 1366,
    icon: Tablet,
    scale: 0.5,
  },
  tabletLandscape: {
    name: 'iPad Landscape',
    width: 1366,
    height: 1024,
    icon: Tablet,
    scale: 0.5,
  },
  mobile: {
    name: 'iPhone 14 Pro',
    width: 393,
    height: 852,
    icon: Smartphone,
    scale: 0.8,
  },
  mobileLandscape: {
    name: 'iPhone Landscape',
    width: 852,
    height: 393,
    icon: Smartphone,
    scale: 0.7,
  },
} as const;

type DeviceKey = keyof typeof DEVICES;

interface PreviewPanelProps {
  blocks: CanvasBlock[];
  courseTitle?: string;
  lessonTitle?: string;
  onClose: () => void;
}

/**
 * PreviewPanel - Full-screen preview with device simulation
 */
export function PreviewPanel({ blocks, lessonTitle, onClose }: PreviewPanelProps) {
  const [device, setDevice] = useState<DeviceKey>('desktop');
  const [zoom, setZoom] = useState(100);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showA11yOverlay, setShowA11yOverlay] = useState(false);
  const [colorMode, setColorMode] = useState<'light' | 'dark'>('light');
  const [isRotated, setIsRotated] = useState(false);

  const currentDevice = DEVICES[device];

  const frameDimensions = useMemo(() => {
    const baseWidth = isRotated ? currentDevice.height : currentDevice.width;
    const baseHeight = isRotated ? currentDevice.width : currentDevice.height;
    const scale = (zoom / 100) * currentDevice.scale;
    return {
      width: baseWidth * scale,
      height: baseHeight * scale,
      actualWidth: baseWidth,
      actualHeight: baseHeight,
    };
  }, [zoom, isRotated, currentDevice]);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
      {/* Header Toolbar */}
      <div className="h-14 bg-[#1a1a2e] border-b border-white/10 flex items-center justify-between px-4">
        {/* Left: Device Selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-zinc-400 mr-2">Device:</span>
          <div className="flex items-center gap-1 bg-zinc-900 rounded-lg p-1">
            {Object.entries(DEVICES)
              .slice(0, 3)
              .map(([key, dev]) => {
                const Icon = dev.icon;
                return (
                  <TooltipProvider key={key}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={device === key ? 'default' : 'ghost'}
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => setDevice(key as DeviceKey)}
                        >
                          <Icon className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{dev.name}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
          </div>

          <Select value={device} onValueChange={(v) => setDevice(v as DeviceKey)}>
            <SelectTrigger className="w-[160px] h-8 bg-zinc-900 border-white/10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(DEVICES).map(([key, dev]) => (
                <SelectItem key={key} value={key}>
                  {dev.name} ({dev.width}x{dev.height})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            className="h-8 border-white/10"
            onClick={() => setIsRotated(!isRotated)}
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        {/* Center: Title */}
        <div className="text-center">
          <div className="text-sm font-medium text-white">{lessonTitle || 'Untitled Lesson'}</div>
          <div className="text-xs text-zinc-500">
            {frameDimensions.actualWidth} x {frameDimensions.actualHeight}
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-2">
          {/* Zoom */}
          <div className="flex items-center gap-2 mr-4">
            <ZoomOut className="w-4 h-4 text-zinc-400" />
            <Slider
              value={[zoom]}
              onValueChange={(v) => setZoom(v[0])}
              min={25}
              max={150}
              step={25}
              className="w-24"
            />
            <ZoomIn className="w-4 h-4 text-zinc-400" />
            <span className="text-xs text-zinc-400 w-10">{zoom}%</span>
          </div>

          {/* A11y Toggle */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={showA11yOverlay ? 'default' : 'outline'}
                  size="sm"
                  className="h-8 border-white/10"
                  onClick={() => setShowA11yOverlay(!showA11yOverlay)}
                >
                  <Accessibility className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Accessibility Overlay</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Color Mode */}
          <Button
            variant="outline"
            size="sm"
            className="h-8 border-white/10"
            onClick={() => setColorMode(colorMode === 'light' ? 'dark' : 'light')}
          >
            {colorMode === 'light' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>

          {/* Play/Pause */}
          <Button
            variant="outline"
            size="sm"
            className="h-8 border-white/10"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>

          {/* Close */}
          <Button variant="destructive" size="sm" className="h-8" onClick={onClose}>
            Exit Preview
          </Button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
        {/* Device Frame */}
        <div
          className={cn(
            'relative bg-black rounded-[2rem] p-3 shadow-2xl transition-all duration-300',
            device.includes('mobile') && 'rounded-[3rem]',
          )}
          style={{
            width: frameDimensions.width + 24,
            height: frameDimensions.height + 24,
          }}
        >
          {/* Screen Bezel */}
          <div
            className={cn(
              'relative overflow-hidden bg-white rounded-xl',
              colorMode === 'dark' && 'bg-gray-900',
            )}
            style={{
              width: frameDimensions.width,
              height: frameDimensions.height,
            }}
          >
            {/* Content */}
            <div
              className="w-full h-full overflow-auto"
              style={{
                transform: `scale(${(zoom / 100) * currentDevice.scale})`,
                transformOrigin: 'top left',
                width: frameDimensions.actualWidth,
                height: frameDimensions.actualHeight,
              }}
            >
              <div
                className={cn(
                  'min-h-full p-6',
                  colorMode === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-black',
                )}
              >
                {blocks.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-zinc-400">
                    No content to preview
                  </div>
                ) : (
                  <div className="space-y-4">
                    {blocks.map((block) => (
                      <div
                        key={block.id}
                        className={cn(
                          'p-4 border rounded-lg',
                          colorMode === 'dark' ? 'border-gray-700' : 'border-gray-200',
                        )}
                        data-block-type={block.type}
                      >
                        <span className="text-xs text-zinc-500 uppercase">{block.type}</span>
                        {typeof block.content?.text === 'string' && block.content.text && (
                          <p className="mt-2 text-sm">{block.content.text}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* A11y Overlay */}
            {showA11yOverlay && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded-sm">
                  A11y Mode Active
                </div>
                <div className="absolute inset-0 border-4 border-cyan-500/30" />
              </div>
            )}
          </div>

          {/* Device notch (for mobile) */}
          {device.includes('mobile') && !isRotated && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-b-2xl" />
          )}
        </div>
      </div>

      {/* Bottom Bar: Navigation Simulation */}
      <div className="h-12 bg-[#1a1a2e] border-t border-white/10 flex items-center justify-center gap-4">
        <Button variant="outline" size="sm" className="border-white/10" disabled>
          Previous
        </Button>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-32 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full w-1/3 bg-primary rounded-full" />
          </div>
          <span className="text-xs text-zinc-500">Slide 1 of {blocks.length || 1}</span>
        </div>
        <Button variant="outline" size="sm" className="border-white/10">
          Next
        </Button>
      </div>
    </div>
  );
}

export default PreviewPanel;
