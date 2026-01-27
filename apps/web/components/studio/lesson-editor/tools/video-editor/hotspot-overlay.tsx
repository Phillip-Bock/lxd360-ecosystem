'use client';

import {
  Circle,
  Clock,
  ExternalLink,
  Link,
  MessageSquare,
  MousePointer2,
  Plus,
  Square,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export type VideoHotspotShape = 'circle' | 'rectangle';
export type VideoHotspotAction = 'tooltip' | 'link' | 'pause' | 'skip';

export interface VideoHotspot {
  id: string;
  shape: VideoHotspotShape;
  x: number;
  y: number;
  width: number;
  height: number;
  startTime: number;
  endTime: number;
  action: VideoHotspotAction;
  label: string;
  content: string;
  url?: string;
  skipToTime?: number;
  color: string;
}

interface VideoHotspotOverlayProps {
  hotspots: VideoHotspot[];
  selectedId: string | null;
  currentTime: number;
  duration: number;
  onHotspotsChange: (hotspots: VideoHotspot[]) => void;
  onSelect: (id: string | null) => void;
}

const HOTSPOT_COLORS = ['#0072f5', '#00d4ff', '#8b5cf6', '#f44336', '#00c853', '#ff9800'];

const ACTION_TYPES: {
  type: VideoHotspotAction;
  label: string;
  icon: typeof Link;
}[] = [
  { type: 'tooltip', label: 'Show Info', icon: MessageSquare },
  { type: 'link', label: 'Open Link', icon: Link },
  { type: 'pause', label: 'Pause Video', icon: Clock },
  { type: 'skip', label: 'Skip To', icon: ExternalLink },
];

/**
 * VideoHotspotOverlay - Add clickable hotspots to video at specific timestamps
 */
export function VideoHotspotOverlay({
  hotspots,
  selectedId,
  currentTime,
  duration,
  onHotspotsChange,
  onSelect,
}: VideoHotspotOverlayProps) {
  const selectedHotspot = hotspots.find((h) => h.id === selectedId);

  // Get hotspots visible at current time
  const visibleHotspots = hotspots.filter(
    (h) => currentTime >= h.startTime && currentTime <= h.endTime,
  );

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const addHotspot = () => {
    const newHotspot: VideoHotspot = {
      id: `vhotspot-${Date.now()}`,
      shape: 'circle',
      x: 50,
      y: 50,
      width: 10,
      height: 10,
      startTime: currentTime,
      endTime: Math.min(currentTime + 5, duration),
      action: 'tooltip',
      label: 'Click here',
      content: 'Hotspot info...',
      color: '#0072f5',
    };
    onHotspotsChange([...hotspots, newHotspot]);
    onSelect(newHotspot.id);
  };

  const updateHotspot = (id: string, updates: Partial<VideoHotspot>) => {
    onHotspotsChange(hotspots.map((h) => (h.id === id ? { ...h, ...updates } : h)));
  };

  const deleteHotspot = (id: string) => {
    onHotspotsChange(hotspots.filter((h) => h.id !== id));
    if (selectedId === id) {
      onSelect(null);
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-4 p-4 bg-(--studio-bg) rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <MousePointer2 className="h-4 w-4" />
            <span>Video Hotspots</span>
          </div>
          <Button variant="outline" size="sm" className="border-white/10" onClick={addHotspot}>
            <Plus className="h-4 w-4 mr-1" />
            Add Hotspot
          </Button>
        </div>

        {/* Currently visible indicator */}
        {visibleHotspots.length > 0 && (
          <div className="flex items-center gap-2 p-2 bg-primary/10 border border-primary/30 rounded-xs">
            <MousePointer2 className="h-4 w-4 text-primary" />
            <span className="text-sm text-primary">
              {visibleHotspots.length} hotspot
              {visibleHotspots.length !== 1 ? 's' : ''} visible now
            </span>
          </div>
        )}

        {/* Hotspot List */}
        {hotspots.length > 0 && (
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {hotspots.map((hotspot) => {
              const isVisible = currentTime >= hotspot.startTime && currentTime <= hotspot.endTime;

              return (
                <button
                  type="button"
                  key={hotspot.id}
                  className={`w-full flex items-center gap-2 p-2 rounded-xs cursor-pointer transition-colors border-none text-left ${
                    selectedId === hotspot.id
                      ? 'bg-primary/20 border border-primary/50'
                      : isVisible
                        ? 'bg-green-500/10 border border-green-500/30'
                        : 'bg-white/5 hover:bg-white/10'
                  }`}
                  onClick={() => onSelect(hotspot.id)}
                  aria-pressed={selectedId === hotspot.id}
                >
                  <div
                    className={`w-4 h-4 shrink-0 ${
                      hotspot.shape === 'circle' ? 'rounded-full' : 'rounded-xs'
                    }`}
                    style={{ backgroundColor: hotspot.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{hotspot.label}</p>
                    <p className="text-xs text-zinc-500">
                      {formatTime(hotspot.startTime)} - {formatTime(hotspot.endTime)}
                    </p>
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteHotspot(hotspot.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3 text-red-400" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Delete</TooltipContent>
                  </Tooltip>
                </button>
              );
            })}
          </div>
        )}

        {/* Selected Hotspot Editor */}
        {selectedHotspot && (
          <div className="space-y-4 pt-4 border-t border-white/5">
            {/* Label */}
            <div className="space-y-2">
              <Label className="text-xs text-zinc-500">Label</Label>
              <Input
                value={selectedHotspot.label}
                onChange={(e) => updateHotspot(selectedHotspot.id, { label: e.target.value })}
                className="bg-(--studio-surface) border-white/10"
              />
            </div>

            {/* Shape */}
            <div className="flex gap-2">
              <Button
                variant={selectedHotspot.shape === 'circle' ? 'default' : 'outline'}
                size="sm"
                className={selectedHotspot.shape !== 'circle' ? 'border-white/10' : ''}
                onClick={() => updateHotspot(selectedHotspot.id, { shape: 'circle' })}
              >
                <Circle className="h-4 w-4 mr-1" />
                Circle
              </Button>
              <Button
                variant={selectedHotspot.shape === 'rectangle' ? 'default' : 'outline'}
                size="sm"
                className={selectedHotspot.shape !== 'rectangle' ? 'border-white/10' : ''}
                onClick={() => updateHotspot(selectedHotspot.id, { shape: 'rectangle' })}
              >
                <Square className="h-4 w-4 mr-1" />
                Rectangle
              </Button>
            </div>

            {/* Time Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-zinc-500">Start Time</Label>
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    value={selectedHotspot.startTime.toFixed(1)}
                    onChange={(e) =>
                      updateHotspot(selectedHotspot.id, {
                        startTime: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="bg-(--studio-surface) border-white/10 text-sm"
                    step={0.1}
                  />
                  <span className="text-xs text-zinc-500">s</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-zinc-500">End Time</Label>
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    value={selectedHotspot.endTime.toFixed(1)}
                    onChange={(e) =>
                      updateHotspot(selectedHotspot.id, {
                        endTime: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="bg-(--studio-surface) border-white/10 text-sm"
                    step={0.1}
                  />
                  <span className="text-xs text-zinc-500">s</span>
                </div>
              </div>
            </div>

            {/* Duration slider */}
            <div className="space-y-2">
              <Label className="text-xs text-zinc-500">Time Range</Label>
              <Slider
                value={[selectedHotspot.startTime, selectedHotspot.endTime]}
                min={0}
                max={duration}
                step={0.1}
                onValueChange={([start, end]) => {
                  if (start < end) {
                    updateHotspot(selectedHotspot.id, {
                      startTime: start,
                      endTime: end,
                    });
                  }
                }}
              />
            </div>

            {/* Action Type */}
            <div className="space-y-2">
              <Label className="text-xs text-zinc-500">Click Action</Label>
              <div className="grid grid-cols-2 gap-2">
                {ACTION_TYPES.map(({ type, label, icon: Icon }) => (
                  <Button
                    key={type}
                    variant={selectedHotspot.action === type ? 'default' : 'outline'}
                    size="sm"
                    className={`text-xs ${
                      selectedHotspot.action !== type ? 'border-white/10' : ''
                    }`}
                    onClick={() => updateHotspot(selectedHotspot.id, { action: type })}
                  >
                    <Icon className="h-3 w-3 mr-1" />
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Action-specific content */}
            {selectedHotspot.action === 'tooltip' && (
              <div className="space-y-2">
                <Label className="text-xs text-zinc-500">Info Text</Label>
                <textarea
                  value={selectedHotspot.content}
                  onChange={(e) => updateHotspot(selectedHotspot.id, { content: e.target.value })}
                  className="w-full h-16 bg-(--studio-surface) border border-white/10 rounded-md p-2 text-sm resize-none"
                />
              </div>
            )}

            {selectedHotspot.action === 'link' && (
              <div className="space-y-2">
                <Label className="text-xs text-zinc-500">Link URL</Label>
                <Input
                  value={selectedHotspot.url || ''}
                  onChange={(e) => updateHotspot(selectedHotspot.id, { url: e.target.value })}
                  placeholder="https://..."
                  className="bg-(--studio-surface) border-white/10"
                />
              </div>
            )}

            {selectedHotspot.action === 'skip' && (
              <div className="space-y-2">
                <Label className="text-xs text-zinc-500">Skip To (seconds)</Label>
                <Input
                  type="number"
                  value={selectedHotspot.skipToTime || 0}
                  onChange={(e) =>
                    updateHotspot(selectedHotspot.id, {
                      skipToTime: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="bg-(--studio-surface) border-white/10"
                  step={0.1}
                />
              </div>
            )}

            {/* Color */}
            <div className="space-y-2">
              <Label className="text-xs text-zinc-500">Color</Label>
              <div className="flex gap-2">
                {HOTSPOT_COLORS.map((color) => (
                  <button
                    type="button"
                    key={color}
                    className={`w-6 h-6 rounded-full border-2 ${
                      selectedHotspot.color === color ? 'border-white' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => updateHotspot(selectedHotspot.id, { color })}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {hotspots.length === 0 && (
          <div className="text-center py-6 text-zinc-500">
            <MousePointer2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No video hotspots</p>
            <p className="text-xs mt-1">Add interactive elements that appear at specific times</p>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
