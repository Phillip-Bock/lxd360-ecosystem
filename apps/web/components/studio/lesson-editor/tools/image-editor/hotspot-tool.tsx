'use client';

import {
  Circle,
  Crosshair,
  ExternalLink,
  Link,
  MessageSquare,
  MousePointer2,
  PlayCircle,
  Plus,
  Square,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export type HotspotShape = 'circle' | 'rectangle' | 'polygon';
export type HotspotAction = 'tooltip' | 'link' | 'modal' | 'video' | 'audio';

export interface Hotspot {
  id: string;
  shape: HotspotShape;
  x: number;
  y: number;
  width: number;
  height: number;
  action: HotspotAction;
  label: string;
  content: string;
  url?: string;
  color: string;
}

interface HotspotToolProps {
  hotspots: Hotspot[];
  selectedId: string | null;
  onHotspotsChange: (hotspots: Hotspot[]) => void;
  onSelect: (id: string | null) => void;
  isDrawing: boolean;
  onDrawingChange: (drawing: boolean) => void;
}

const ACTION_TYPES: { type: HotspotAction; label: string; icon: typeof Link }[] = [
  { type: 'tooltip', label: 'Tooltip', icon: MessageSquare },
  { type: 'link', label: 'Navigate', icon: Link },
  { type: 'modal', label: 'Popup', icon: ExternalLink },
  { type: 'video', label: 'Play Video', icon: PlayCircle },
  { type: 'audio', label: 'Play Audio', icon: PlayCircle },
];

const HOTSPOT_COLORS = ['#0072f5', '#00d4ff', '#8b5cf6', '#f44336', '#00c853', '#ff9800'];

/**
 * HotspotTool - Define clickable regions on images with actions
 */
export function HotspotTool({
  hotspots,
  selectedId,
  onHotspotsChange,
  onSelect,
  isDrawing,
  onDrawingChange,
}: HotspotToolProps) {
  const [drawShape, setDrawShape] = useState<HotspotShape>('circle');
  const selectedHotspot = hotspots.find((h) => h.id === selectedId);

  const startDrawing = (shape: HotspotShape) => {
    setDrawShape(shape);
    onDrawingChange(true);
    onSelect(null);
  };

  const addHotspot = (shape: HotspotShape) => {
    const newHotspot: Hotspot = {
      id: `hotspot-${Date.now()}`,
      shape,
      x: 50,
      y: 50,
      width: shape === 'circle' ? 10 : 15,
      height: shape === 'circle' ? 10 : 10,
      action: 'tooltip',
      label: 'Click here',
      content: 'Hotspot content goes here...',
      color: '#0072f5',
    };
    onHotspotsChange([...hotspots, newHotspot]);
    onSelect(newHotspot.id);
  };

  const updateHotspot = (id: string, updates: Partial<Hotspot>) => {
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
      <div className="space-y-4 p-4 bg-[#0d0d14] rounded-lg">
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <MousePointer2 className="h-4 w-4" />
          <span>Interactive Hotspots</span>
        </div>

        {/* Drawing Tools */}
        <div className="space-y-2">
          <Label className="text-xs text-zinc-500">Add Hotspot</Label>
          <div className="flex gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isDrawing && drawShape === 'circle' ? 'default' : 'outline'}
                  size="sm"
                  className={!(isDrawing && drawShape === 'circle') ? 'border-white/10' : ''}
                  onClick={() => (isDrawing ? onDrawingChange(false) : startDrawing('circle'))}
                >
                  <Circle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Draw circle hotspot</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isDrawing && drawShape === 'rectangle' ? 'default' : 'outline'}
                  size="sm"
                  className={!(isDrawing && drawShape === 'rectangle') ? 'border-white/10' : ''}
                  onClick={() => (isDrawing ? onDrawingChange(false) : startDrawing('rectangle'))}
                >
                  <Square className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Draw rectangle hotspot</TooltipContent>
            </Tooltip>

            <div className="flex-1" />

            <Button
              variant="outline"
              size="sm"
              className="border-white/10"
              onClick={() => addHotspot('circle')}
            >
              <Plus className="h-4 w-4 mr-1" />
              Quick Add
            </Button>
          </div>

          {isDrawing && (
            <p className="text-xs text-primary animate-pulse">
              <Crosshair className="h-3 w-3 inline mr-1" />
              Click and drag on the image to draw a hotspot
            </p>
          )}
        </div>

        {/* Hotspot List */}
        {hotspots.length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs text-zinc-500">Hotspots ({hotspots.length})</Label>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {hotspots.map((hotspot, index) => (
                <button
                  type="button"
                  key={hotspot.id}
                  className={`flex items-center gap-2 p-2 rounded-xs cursor-pointer transition-colors w-full text-left ${
                    selectedId === hotspot.id
                      ? 'bg-primary/20 border border-primary/50'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                  onClick={() => onSelect(hotspot.id)}
                  aria-pressed={selectedId === hotspot.id}
                >
                  <div
                    className={`w-4 h-4 ${
                      hotspot.shape === 'circle' ? 'rounded-full' : 'rounded-xs'
                    }`}
                    style={{ backgroundColor: hotspot.color }}
                    aria-hidden="true"
                  />
                  <span className="flex-1 text-sm truncate">
                    {index + 1}. {hotspot.label}
                  </span>
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
              ))}
            </div>
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
                placeholder="Hotspot label"
                className="bg-[#1a1a2e] border-white/10"
              />
            </div>

            {/* Action Type */}
            <div className="space-y-2">
              <Label className="text-xs text-zinc-500">Action</Label>
              <div className="grid grid-cols-3 gap-2">
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

            {/* Content based on action */}
            {selectedHotspot.action === 'tooltip' && (
              <div className="space-y-2">
                <Label className="text-xs text-zinc-500">Tooltip Text</Label>
                <textarea
                  value={selectedHotspot.content}
                  onChange={(e) => updateHotspot(selectedHotspot.id, { content: e.target.value })}
                  className="w-full h-20 bg-[#1a1a2e] border border-white/10 rounded-md p-2 text-sm resize-none"
                  placeholder="Enter tooltip content..."
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
                  className="bg-[#1a1a2e] border-white/10"
                />
              </div>
            )}

            {(selectedHotspot.action === 'video' || selectedHotspot.action === 'audio') && (
              <div className="space-y-2">
                <Label className="text-xs text-zinc-500">Media URL</Label>
                <Input
                  value={selectedHotspot.url || ''}
                  onChange={(e) => updateHotspot(selectedHotspot.id, { url: e.target.value })}
                  placeholder="Enter media URL..."
                  className="bg-[#1a1a2e] border-white/10"
                />
              </div>
            )}

            {selectedHotspot.action === 'modal' && (
              <div className="space-y-2">
                <Label className="text-xs text-zinc-500">Modal Content</Label>
                <textarea
                  value={selectedHotspot.content}
                  onChange={(e) => updateHotspot(selectedHotspot.id, { content: e.target.value })}
                  className="w-full h-24 bg-[#1a1a2e] border border-white/10 rounded-md p-2 text-sm resize-none"
                  placeholder="Enter popup content..."
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
                    aria-label={`Select ${color} color`}
                    aria-pressed={selectedHotspot.color === color}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {hotspots.length === 0 && !isDrawing && (
          <div className="text-center py-6 text-zinc-500">
            <MousePointer2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hotspots defined</p>
            <p className="text-xs mt-1">Add clickable areas to make your image interactive</p>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}

/**
 * Render hotspot overlay on image
 */
export function HotspotOverlay({
  hotspot,
  isSelected,
  onClick,
}: {
  hotspot: Hotspot;
  isSelected: boolean;
  onClick: () => void;
}) {
  const baseStyle = {
    position: 'absolute' as const,
    left: `${hotspot.x}%`,
    top: `${hotspot.y}%`,
    width: `${hotspot.width}%`,
    height: `${hotspot.height}%`,
    transform: 'translate(-50%, -50%)',
    backgroundColor: `${hotspot.color}33`,
    border: `2px solid ${hotspot.color}`,
    cursor: 'pointer',
    transition: 'all 0.2s',
  };

  const selectedStyle = isSelected
    ? {
        boxShadow: `0 0 0 3px ${hotspot.color}66`,
      }
    : {};

  return (
    <button
      type="button"
      className={`hover:scale-105 ${hotspot.shape === 'circle' ? 'rounded-full' : 'rounded-xs'} p-0 m-0 appearance-none`}
      style={{ ...baseStyle, ...selectedStyle }}
      onClick={onClick}
      aria-label={hotspot.label}
      aria-pressed={isSelected}
    >
      <span className="sr-only">{hotspot.label}</span>
    </button>
  );
}
