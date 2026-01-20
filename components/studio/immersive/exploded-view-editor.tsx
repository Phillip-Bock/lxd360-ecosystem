'use client';

/**
 * ExplodedViewEditor - Phase 15
 * Configure exploded view animations for 3D models
 */

import { Box, ChevronDown, ChevronRight, Expand, Layers, Move, RotateCcw } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import type { ExplodedViewConfig, Model3D, ModelPart, Vector3 } from '@/types/studio/immersive';

// =============================================================================
// TYPES
// =============================================================================

interface ExplodedViewEditorProps {
  model: Model3D;
  config: ExplodedViewConfig;
  onChange: (config: ExplodedViewConfig) => void;
  onPreview?: (factor: number) => void;
  onClose?: () => void;
}

// =============================================================================
// VECTOR3 INPUT
// =============================================================================

interface Vector3InputProps {
  label: string;
  value: Vector3;
  onChange: (value: Vector3) => void;
  step?: number;
}

function Vector3Input({ label, value, onChange, step = 0.1 }: Vector3InputProps) {
  return (
    <div className="space-y-2">
      <Label className="text-xs text-zinc-400">{label}</Label>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <Label className="text-[10px] text-zinc-500">X</Label>
          <Input
            type="number"
            value={value.x}
            onChange={(e) => onChange({ ...value, x: Number(e.target.value) })}
            step={step}
            className="h-7 bg-zinc-900 border-white/10 text-sm"
          />
        </div>
        <div>
          <Label className="text-[10px] text-zinc-500">Y</Label>
          <Input
            type="number"
            value={value.y}
            onChange={(e) => onChange({ ...value, y: Number(e.target.value) })}
            step={step}
            className="h-7 bg-zinc-900 border-white/10 text-sm"
          />
        </div>
        <div>
          <Label className="text-[10px] text-zinc-500">Z</Label>
          <Input
            type="number"
            value={value.z}
            onChange={(e) => onChange({ ...value, z: Number(e.target.value) })}
            step={step}
            className="h-7 bg-zinc-900 border-white/10 text-sm"
          />
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// PART OFFSET ITEM
// =============================================================================

interface PartOffsetItemProps {
  part: ModelPart;
  offset: Vector3;
  isExpanded: boolean;
  onToggle: () => void;
  onChange: (offset: Vector3) => void;
  onAutoCalculate: () => void;
}

function PartOffsetItem({
  part,
  offset,
  isExpanded,
  onToggle,
  onChange,
  onAutoCalculate,
}: PartOffsetItemProps) {
  const hasOffset = offset.x !== 0 || offset.y !== 0 || offset.z !== 0;

  return (
    <div className="border border-white/10 rounded-lg overflow-hidden">
      <button
        type="button"
        className="w-full px-3 py-2 flex items-center gap-2 cursor-pointer hover:bg-white/5 text-left"
        onClick={onToggle}
      >
        <span className="w-4 h-4 flex items-center justify-center">
          {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        </span>

        <Box className="h-3.5 w-3.5 text-zinc-500" />
        <span className="text-sm text-white flex-1 truncate">{part.name}</span>

        {hasOffset && (
          <span className="text-[9px] text-primary bg-primary/10 px-1.5 py-0.5 rounded">
            Configured
          </span>
        )}
      </button>

      {isExpanded && (
        <div className="px-3 pb-3 pt-1 space-y-3 border-t border-white/5">
          <Vector3Input label="Explosion Offset" value={offset} onChange={onChange} />

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-7 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                onAutoCalculate();
              }}
            >
              <Move className="h-3 w-3 mr-1" />
              Auto Calculate
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                onChange({ x: 0, y: 0, z: 0 });
              }}
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function ExplodedViewEditor({
  model,
  config,
  onChange,
  onPreview,
  onClose,
}: ExplodedViewEditorProps) {
  const [expandedParts, setExpandedParts] = useState<Set<string>>(new Set());
  const [previewFactor, setPreviewFactor] = useState(1);

  const togglePart = useCallback((partId: string) => {
    setExpandedParts((prev) => {
      const next = new Set(prev);
      if (next.has(partId)) {
        next.delete(partId);
      } else {
        next.add(partId);
      }
      return next;
    });
  }, []);

  const updatePartOffset = useCallback(
    (partId: string, offset: Vector3) => {
      const newOffsets = { ...(config.partOffsets || {}), [partId]: offset };
      onChange({ ...config, partOffsets: newOffsets });
    },
    [config, onChange],
  );

  const autoCalculateOffset = useCallback(
    (part: ModelPart) => {
      // Calculate offset based on part position relative to center
      // This is a simplified calculation - real implementation would use mesh bounds
      const _center = config.center;
      const baseDistance = 2; // Base explosion distance

      let offset: Vector3;

      if (config.mode === 'radial') {
        // Radial explosion - push away from center
        // Would use actual part position in real implementation
        const angle = Math.random() * Math.PI * 2;
        const elevation = (Math.random() - 0.5) * Math.PI;
        offset = {
          x: Math.cos(angle) * Math.cos(elevation) * baseDistance,
          y: Math.sin(elevation) * baseDistance,
          z: Math.sin(angle) * Math.cos(elevation) * baseDistance,
        };
      } else if (config.mode === 'axis' && config.axis) {
        // Axis explosion - push along specified axis
        const index = model.parts.indexOf(part);
        const multiplier = (index + 1) * 0.5;
        offset = {
          x: config.axis.x * multiplier,
          y: config.axis.y * multiplier,
          z: config.axis.z * multiplier,
        };
      } else {
        // Custom - no auto calculation
        offset = { x: 0, y: 0, z: 0 };
      }

      updatePartOffset(part.id, offset);
    },
    [config, model.parts, updatePartOffset],
  );

  const autoCalculateAll = useCallback(() => {
    model.parts.forEach((part) => {
      if (part.selectable !== false) {
        autoCalculateOffset(part);
      }
    });
  }, [model.parts, autoCalculateOffset]);

  const handlePreviewChange = useCallback(
    (factor: number) => {
      setPreviewFactor(factor);
      onPreview?.(factor);
    },
    [onPreview],
  );

  const configurableParts = model.parts.filter((p) => p.selectable !== false);

  return (
    <div className="flex flex-col h-full bg-[#0a0a0f]">
      {/* Header */}
      <div className="h-12 border-b border-white/10 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-2">
          <Expand className="h-4 w-4 text-primary" />
          <span className="font-medium text-sm text-white">Exploded View</span>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <span className="text-lg">×</span>
          </Button>
        )}
      </div>

      {/* Main Settings */}
      <div className="px-4 py-3 border-b border-white/10 space-y-4">
        {/* Enable Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm text-white">Enable Exploded View</Label>
            <p className="text-[10px] text-zinc-500">Allow learners to explode the model</p>
          </div>
          <Switch
            checked={config.enabled}
            onCheckedChange={(checked) => onChange({ ...config, enabled: checked })}
          />
        </div>

        {/* Preview Slider */}
        {config.enabled && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-zinc-400">Preview</Label>
              <span className="text-xs text-zinc-500">
                {Math.round(((previewFactor - 1) / (config.factor - 1)) * 100)}%
              </span>
            </div>
            <Slider
              value={[previewFactor]}
              onValueChange={([v]) => handlePreviewChange(v)}
              min={1}
              max={config.factor}
              step={0.01}
            />
            <div className="flex justify-between text-[10px] text-zinc-600">
              <span>Collapsed</span>
              <span>Fully Exploded</span>
            </div>
          </div>
        )}
      </div>

      {config.enabled && (
        <>
          {/* Global Settings */}
          <div className="px-4 py-3 border-b border-white/10 space-y-4">
            <div className="space-y-2">
              <Label className="text-xs text-zinc-400">Explosion Mode</Label>
              <Select
                value={config.mode}
                onValueChange={(v) =>
                  onChange({ ...config, mode: v as ExplodedViewConfig['mode'] })
                }
              >
                <SelectTrigger className="h-8 bg-zinc-900 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="radial">Radial (from center)</SelectItem>
                  <SelectItem value="axis">Along Axis</SelectItem>
                  <SelectItem value="custom">Custom per part</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {config.mode === 'axis' && (
              <Vector3Input
                label="Explosion Axis"
                value={config.axis || { x: 0, y: 1, z: 0 }}
                onChange={(axis) => onChange({ ...config, axis })}
                step={0.1}
              />
            )}

            <Vector3Input
              label="Explosion Center"
              value={config.center}
              onChange={(center) => onChange({ ...config, center })}
              step={0.1}
            />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-zinc-400">Max Explosion Factor</Label>
                <span className="text-xs text-zinc-500">{config.factor}x</span>
              </div>
              <Slider
                value={[config.factor]}
                onValueChange={([v]) => onChange({ ...config, factor: v })}
                min={1.5}
                max={5}
                step={0.5}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-zinc-400">Animation Duration</Label>
                <span className="text-xs text-zinc-500">{config.animationDuration}ms</span>
              </div>
              <Slider
                value={[config.animationDuration]}
                onValueChange={([v]) => onChange({ ...config, animationDuration: v })}
                min={200}
                max={2000}
                step={100}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm text-white">Connection Lines</Label>
                <p className="text-[10px] text-zinc-500">Show lines between parts</p>
              </div>
              <Switch
                checked={config.showConnectionLines}
                onCheckedChange={(checked) => onChange({ ...config, showConnectionLines: checked })}
              />
            </div>

            {config.showConnectionLines && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[10px] text-zinc-500">Line Color</Label>
                  <Input
                    type="color"
                    value={config.lineColor}
                    onChange={(e) => onChange({ ...config, lineColor: e.target.value })}
                    className="h-7 w-full bg-zinc-900 border-white/10"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-zinc-500">Opacity</Label>
                  <Input
                    type="number"
                    value={config.lineOpacity}
                    onChange={(e) => onChange({ ...config, lineOpacity: Number(e.target.value) })}
                    min={0}
                    max={1}
                    step={0.1}
                    className="h-7 bg-zinc-900 border-white/10 text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Part Offsets */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="px-4 py-2 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="h-3.5 w-3.5 text-zinc-500" />
                <span className="text-xs font-medium text-white">Part Offsets</span>
                <span className="text-[10px] text-zinc-500">({configurableParts.length})</span>
              </div>
              <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={autoCalculateAll}>
                <Move className="h-3 w-3 mr-1" />
                Auto All
              </Button>
            </div>

            <ScrollArea className="flex-1 px-4 py-2">
              <div className="space-y-2">
                {configurableParts.map((part) => (
                  <PartOffsetItem
                    key={part.id}
                    part={part}
                    offset={config.partOffsets?.[part.id] || { x: 0, y: 0, z: 0 }}
                    isExpanded={expandedParts.has(part.id)}
                    onToggle={() => togglePart(part.id)}
                    onChange={(offset) => updatePartOffset(part.id, offset)}
                    onAutoCalculate={() => autoCalculateOffset(part)}
                  />
                ))}
              </div>
            </ScrollArea>
          </div>
        </>
      )}

      {/* Footer */}
      <div className="px-4 py-2 border-t border-white/5 shrink-0">
        <p className="text-[10px] text-zinc-500 text-center">
          Configure how model parts separate when exploded. Use Auto to calculate based on part
          positions.
        </p>
      </div>
    </div>
  );
}

export default ExplodedViewEditor;
