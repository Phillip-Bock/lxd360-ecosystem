'use client';

import { Info, Link, Navigation, Play, Trash2, Volume2 } from 'lucide-react';
import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import type { Hotspot, HotspotConfigProps, HotspotType, InteractionTrigger } from './types';

// =============================================================================
// Component
// =============================================================================

/**
 * HotspotConfig - Configuration panel for editing hotspot properties
 */
export function HotspotConfig({
  hotspot,
  onUpdate,
  onDelete,
  availableScenes = [],
  availableBlocks = [],
}: HotspotConfigProps) {
  const handleChange = useCallback(
    <K extends keyof Hotspot>(key: K, value: Hotspot[K]) => {
      onUpdate({ [key]: value });
    },
    [onUpdate],
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Hotspot Settings</h3>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onDelete}
          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <Separator />

      {/* Label */}
      <div className="space-y-2">
        <Label htmlFor="hotspot-label" className="text-xs">
          Label
        </Label>
        <Input
          id="hotspot-label"
          value={hotspot.label ?? ''}
          onChange={(e) => handleChange('label', e.target.value)}
          placeholder="Enter hotspot label..."
          className="h-8 text-xs"
        />
      </div>

      {/* Type */}
      <div className="space-y-2">
        <Label className="text-xs">Type</Label>
        <Select value={hotspot.type} onValueChange={(v) => handleChange('type', v as HotspotType)}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="info_popup">
              <span className="flex items-center gap-2">
                <Info className="h-3 w-3" /> Info Popup
              </span>
            </SelectItem>
            <SelectItem value="audio_spatial">
              <span className="flex items-center gap-2">
                <Volume2 className="h-3 w-3" /> Spatial Audio
              </span>
            </SelectItem>
            <SelectItem value="navigation">
              <span className="flex items-center gap-2">
                <Navigation className="h-3 w-3" /> Navigation
              </span>
            </SelectItem>
            <SelectItem value="quiz_block">
              <span className="flex items-center gap-2">
                <Link className="h-3 w-3" /> Quiz Block
              </span>
            </SelectItem>
            <SelectItem value="sim_trigger">
              <span className="flex items-center gap-2">
                <Play className="h-3 w-3" /> Simulation Trigger
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Type-specific fields */}
      {hotspot.type === 'info_popup' && (
        <div className="space-y-2">
          <Label htmlFor="hotspot-description" className="text-xs">
            Description
          </Label>
          <Textarea
            id="hotspot-description"
            value={hotspot.description ?? ''}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Enter popup content..."
            className="text-xs min-h-[80px]"
          />
        </div>
      )}

      {hotspot.type === 'audio_spatial' && (
        <div className="space-y-2">
          <Label htmlFor="hotspot-audio" className="text-xs">
            Audio URL
          </Label>
          <Input
            id="hotspot-audio"
            type="url"
            value={hotspot.audioSrc ?? ''}
            onChange={(e) => handleChange('audioSrc', e.target.value)}
            placeholder="https://example.com/audio.mp3"
            className="h-8 text-xs"
          />
        </div>
      )}

      {hotspot.type === 'navigation' && (
        <div className="space-y-2">
          <Label className="text-xs">Target Scene</Label>
          <Select
            value={hotspot.linkedSceneId ?? ''}
            onValueChange={(v) => handleChange('linkedSceneId', v)}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Select scene..." />
            </SelectTrigger>
            <SelectContent>
              {availableScenes.length === 0 ? (
                <SelectItem value="" disabled>
                  No scenes available
                </SelectItem>
              ) : (
                availableScenes.map((scene) => (
                  <SelectItem key={scene.id} value={scene.id}>
                    {scene.title}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      )}

      {hotspot.type === 'quiz_block' && (
        <div className="space-y-2">
          <Label className="text-xs">Linked Block</Label>
          <Select
            value={hotspot.linkedBlockId ?? ''}
            onValueChange={(v) => handleChange('linkedBlockId', v)}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Select block..." />
            </SelectTrigger>
            <SelectContent>
              {availableBlocks.length === 0 ? (
                <SelectItem value="" disabled>
                  No blocks available
                </SelectItem>
              ) : (
                availableBlocks.map((block) => (
                  <SelectItem key={block.id} value={block.id}>
                    {block.label} ({block.type})
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      )}

      <Separator />

      {/* Interaction Trigger */}
      <div className="space-y-2">
        <Label className="text-xs">Interaction Trigger</Label>
        <Select
          value={hotspot.interactionTrigger}
          onValueChange={(v) => handleChange('interactionTrigger', v as InteractionTrigger)}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="click">Click</SelectItem>
            <SelectItem value="gaze">Gaze (2s dwell)</SelectItem>
            <SelectItem value="proximity">Proximity</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Icon Scale */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Icon Scale</Label>
          <span className="text-xs text-muted-foreground">{hotspot.iconScale ?? 1}x</span>
        </div>
        <Slider
          value={[hotspot.iconScale ?? 1]}
          min={0.5}
          max={2}
          step={0.1}
          onValueChange={([v]) => handleChange('iconScale', v)}
        />
      </div>

      {/* Icon Color */}
      <div className="space-y-2">
        <Label htmlFor="hotspot-color" className="text-xs">
          Custom Color (optional)
        </Label>
        <div className="flex gap-2">
          <Input
            id="hotspot-color"
            type="color"
            value={hotspot.iconColor ?? '#00CED1'}
            onChange={(e) => handleChange('iconColor', e.target.value)}
            className="h-8 w-12 p-1 cursor-pointer"
          />
          <Input
            value={hotspot.iconColor ?? ''}
            onChange={(e) => handleChange('iconColor', e.target.value)}
            placeholder="Use default"
            className="h-8 text-xs flex-1"
          />
          {hotspot.iconColor && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleChange('iconColor', undefined)}
              className="h-8 text-xs"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      <Separator />

      {/* Position (read-only) */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Position</Label>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="p-2 rounded bg-muted/30 text-center">
            <span className="text-muted-foreground">X:</span> {hotspot.position.x.toFixed(1)}
          </div>
          <div className="p-2 rounded bg-muted/30 text-center">
            <span className="text-muted-foreground">Y:</span> {hotspot.position.y.toFixed(1)}
          </div>
          <div className="p-2 rounded bg-muted/30 text-center">
            <span className="text-muted-foreground">Z:</span> {hotspot.position.z.toFixed(1)}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">Click on the panorama to reposition</p>
      </div>
    </div>
  );
}

export default HotspotConfig;
