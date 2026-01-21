'use client';

import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  Move,
  Plus,
  Trash2,
  Type,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  textAlign: 'left' | 'center' | 'right';
  color: string;
  backgroundColor: string;
  opacity: number;
}

interface TextOverlayToolProps {
  overlays: TextOverlay[];
  selectedId: string | null;
  onOverlaysChange: (overlays: TextOverlay[]) => void;
  onSelect: (id: string | null) => void;
}

const FONT_FAMILIES = [
  { label: 'Sans Serif', value: 'Inter, sans-serif' },
  { label: 'Serif', value: 'Georgia, serif' },
  { label: 'Mono', value: 'monospace' },
  { label: 'Display', value: 'system-ui, sans-serif' },
];

const PRESET_COLORS = [
  '#ffffff',
  '#000000',
  '#0072f5',
  '#00d4ff',
  '#8b5cf6',
  '#f44336',
  '#00c853',
  '#ff9800',
];

/**
 * TextOverlayTool - Add and edit text overlays on images
 */
export function TextOverlayTool({
  overlays,
  selectedId,
  onOverlaysChange,
  onSelect,
}: TextOverlayToolProps) {
  const selectedOverlay = overlays.find((o) => o.id === selectedId);

  const addOverlay = () => {
    const newOverlay: TextOverlay = {
      id: `text-${Date.now()}`,
      text: 'New Text',
      x: 50,
      y: 50,
      fontSize: 24,
      fontFamily: 'Inter, sans-serif',
      fontWeight: 'normal',
      fontStyle: 'normal',
      textAlign: 'center',
      color: '#ffffff',
      backgroundColor: 'transparent',
      opacity: 100,
    };
    onOverlaysChange([...overlays, newOverlay]);
    onSelect(newOverlay.id);
  };

  const updateOverlay = (id: string, updates: Partial<TextOverlay>) => {
    onOverlaysChange(overlays.map((o) => (o.id === id ? { ...o, ...updates } : o)));
  };

  const deleteOverlay = (id: string) => {
    onOverlaysChange(overlays.filter((o) => o.id !== id));
    if (selectedId === id) {
      onSelect(null);
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-4 p-4 bg-[#0d0d14] rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <Type className="h-4 w-4" />
            <span>Text Overlay</span>
          </div>
          <Button variant="outline" size="sm" className="border-white/10" onClick={addOverlay}>
            <Plus className="h-4 w-4 mr-1" />
            Add Text
          </Button>
        </div>

        {/* Text List */}
        {overlays.length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs text-zinc-500">Text Layers</Label>
            <div className="space-y-1">
              {overlays.map((overlay) => (
                <button
                  type="button"
                  key={overlay.id}
                  className={`w-full flex items-center gap-2 p-2 rounded-xs cursor-pointer transition-colors border-none text-left ${
                    selectedId === overlay.id
                      ? 'bg-primary/20 border border-primary/50'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                  onClick={() => onSelect(overlay.id)}
                  aria-pressed={selectedId === overlay.id}
                >
                  <Type className="h-4 w-4 text-zinc-500 shrink-0" />
                  <span className="flex-1 text-sm truncate">{overlay.text}</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteOverlay(overlay.id);
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

        {/* Selected Text Editor */}
        {selectedOverlay && (
          <div className="space-y-4 pt-4 border-t border-white/5">
            {/* Text Content */}
            <div className="space-y-2">
              <Label className="text-xs text-zinc-500">Text</Label>
              <Input
                value={selectedOverlay.text}
                onChange={(e) => updateOverlay(selectedOverlay.id, { text: e.target.value })}
                className="bg-[#1a1a2e] border-white/10"
              />
            </div>

            {/* Font Family */}
            <div className="space-y-2">
              <Label className="text-xs text-zinc-500">Font</Label>
              <select
                value={selectedOverlay.fontFamily}
                onChange={(e) => updateOverlay(selectedOverlay.id, { fontFamily: e.target.value })}
                className="w-full bg-[#1a1a2e] border border-white/10 rounded-md px-3 py-2 text-sm"
              >
                {FONT_FAMILIES.map((font) => (
                  <option key={font.value} value={font.value}>
                    {font.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Font Size */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-xs text-zinc-500">Size</Label>
                <span className="text-xs text-zinc-400">{selectedOverlay.fontSize}px</span>
              </div>
              <Slider
                value={[selectedOverlay.fontSize]}
                min={12}
                max={120}
                step={1}
                onValueChange={([v]) => updateOverlay(selectedOverlay.id, { fontSize: v })}
              />
            </div>

            {/* Style Buttons */}
            <div className="flex gap-2">
              <Button
                variant={selectedOverlay.fontWeight === 'bold' ? 'default' : 'outline'}
                size="sm"
                className={selectedOverlay.fontWeight !== 'bold' ? 'border-white/10' : ''}
                onClick={() =>
                  updateOverlay(selectedOverlay.id, {
                    fontWeight: selectedOverlay.fontWeight === 'bold' ? 'normal' : 'bold',
                  })
                }
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button
                variant={selectedOverlay.fontStyle === 'italic' ? 'default' : 'outline'}
                size="sm"
                className={selectedOverlay.fontStyle !== 'italic' ? 'border-white/10' : ''}
                onClick={() =>
                  updateOverlay(selectedOverlay.id, {
                    fontStyle: selectedOverlay.fontStyle === 'italic' ? 'normal' : 'italic',
                  })
                }
              >
                <Italic className="h-4 w-4" />
              </Button>
              <div className="flex-1" />
              <Button
                variant={selectedOverlay.textAlign === 'left' ? 'default' : 'outline'}
                size="sm"
                className={selectedOverlay.textAlign !== 'left' ? 'border-white/10' : ''}
                onClick={() => updateOverlay(selectedOverlay.id, { textAlign: 'left' })}
              >
                <AlignLeft className="h-4 w-4" />
              </Button>
              <Button
                variant={selectedOverlay.textAlign === 'center' ? 'default' : 'outline'}
                size="sm"
                className={selectedOverlay.textAlign !== 'center' ? 'border-white/10' : ''}
                onClick={() => updateOverlay(selectedOverlay.id, { textAlign: 'center' })}
              >
                <AlignCenter className="h-4 w-4" />
              </Button>
              <Button
                variant={selectedOverlay.textAlign === 'right' ? 'default' : 'outline'}
                size="sm"
                className={selectedOverlay.textAlign !== 'right' ? 'border-white/10' : ''}
                onClick={() => updateOverlay(selectedOverlay.id, { textAlign: 'right' })}
              >
                <AlignRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Colors */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-zinc-500">Text Color</Label>
                <div className="flex gap-1 flex-wrap">
                  {PRESET_COLORS.map((color) => (
                    <button
                      type="button"
                      key={color}
                      className={`w-6 h-6 rounded-xs border ${
                        selectedOverlay.color === color ? 'border-primary' : 'border-white/20'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => updateOverlay(selectedOverlay.id, { color })}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-zinc-500">Background</Label>
                <div className="flex gap-1 flex-wrap">
                  <button
                    type="button"
                    className={`w-6 h-6 rounded-xs border ${
                      selectedOverlay.backgroundColor === 'transparent'
                        ? 'border-primary'
                        : 'border-white/20'
                    }`}
                    style={{
                      background:
                        'repeating-conic-gradient(#808080 0% 25%, transparent 0% 50%) 50% / 8px 8px',
                    }}
                    onClick={() =>
                      updateOverlay(selectedOverlay.id, {
                        backgroundColor: 'transparent',
                      })
                    }
                  />
                  {PRESET_COLORS.slice(0, 7).map((color) => (
                    <button
                      type="button"
                      key={color}
                      className={`w-6 h-6 rounded-xs border ${
                        selectedOverlay.backgroundColor === color
                          ? 'border-primary'
                          : 'border-white/20'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => updateOverlay(selectedOverlay.id, { backgroundColor: color })}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Position */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-zinc-500">X Position (%)</Label>
                <Slider
                  value={[selectedOverlay.x]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={([v]) => updateOverlay(selectedOverlay.id, { x: v })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-zinc-500">Y Position (%)</Label>
                <Slider
                  value={[selectedOverlay.y]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={([v]) => updateOverlay(selectedOverlay.id, { y: v })}
                />
              </div>
            </div>

            {/* Opacity */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-xs text-zinc-500">Opacity</Label>
                <span className="text-xs text-zinc-400">{selectedOverlay.opacity}%</span>
              </div>
              <Slider
                value={[selectedOverlay.opacity]}
                min={0}
                max={100}
                step={1}
                onValueChange={([v]) => updateOverlay(selectedOverlay.id, { opacity: v })}
              />
            </div>

            <p className="text-xs text-zinc-600 flex items-center gap-1">
              <Move className="h-3 w-3" />
              Drag text on image to reposition
            </p>
          </div>
        )}

        {overlays.length === 0 && (
          <div className="text-center py-6 text-zinc-500">
            <Type className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No text overlays</p>
            <p className="text-xs mt-1">Click &quot;Add Text&quot; to get started</p>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
