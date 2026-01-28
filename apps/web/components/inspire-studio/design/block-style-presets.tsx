'use client';

import { Box, RotateCcw } from 'lucide-react';
import { useCallback } from 'react';
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
import { cn } from '@/lib/utils';

// =============================================================================
// Types
// =============================================================================

export interface BlockStyleConfig {
  borderRadius: number; // in pixels
  borderWidth: number; // in pixels
  shadowSize: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  containerPadding: number; // in pixels
  blockGap: number; // in pixels
  animationDuration: number; // in ms
  animationEasing: string;
}

interface BlockStylePresetsProps {
  blockStyles: BlockStyleConfig;
  onChange: (blockStyles: BlockStyleConfig) => void;
  className?: string;
}

// =============================================================================
// Defaults
// =============================================================================

export const DEFAULT_BLOCK_STYLES: BlockStyleConfig = {
  borderRadius: 8,
  borderWidth: 1,
  shadowSize: 'sm',
  containerPadding: 24,
  blockGap: 16,
  animationDuration: 200,
  animationEasing: 'ease-out',
};

// =============================================================================
// Shadow Options
// =============================================================================

const SHADOW_OPTIONS = [
  { value: 'none', label: 'None', css: 'none' },
  { value: 'sm', label: 'Small', css: '0 1px 2px rgba(0,0,0,0.05)' },
  { value: 'md', label: 'Medium', css: '0 4px 6px rgba(0,0,0,0.1)' },
  { value: 'lg', label: 'Large', css: '0 10px 15px rgba(0,0,0,0.1)' },
  { value: 'xl', label: 'Extra Large', css: '0 20px 25px rgba(0,0,0,0.15)' },
] as const;

const EASING_OPTIONS = [
  { value: 'ease', label: 'Ease' },
  { value: 'ease-in', label: 'Ease In' },
  { value: 'ease-out', label: 'Ease Out' },
  { value: 'ease-in-out', label: 'Ease In/Out' },
  { value: 'linear', label: 'Linear' },
  { value: 'cubic-bezier(0.4, 0, 0.2, 1)', label: 'Smooth' },
  { value: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', label: 'Bounce' },
] as const;

// =============================================================================
// Block Style Presets Component
// =============================================================================

export function BlockStylePresets({ blockStyles, onChange, className }: BlockStylePresetsProps) {
  // Handle changes
  const handleChange = useCallback(
    <K extends keyof BlockStyleConfig>(key: K, value: BlockStyleConfig[K]) => {
      onChange({
        ...blockStyles,
        [key]: value,
      });
    },
    [blockStyles, onChange],
  );

  // Reset to defaults
  const handleReset = useCallback(() => {
    onChange(DEFAULT_BLOCK_STYLES);
  }, [onChange]);

  // Apply preset
  const applyPreset = useCallback(
    (preset: 'rounded' | 'sharp' | 'soft') => {
      switch (preset) {
        case 'rounded':
          onChange({
            ...blockStyles,
            borderRadius: 16,
            borderWidth: 0,
            shadowSize: 'md',
          });
          break;
        case 'sharp':
          onChange({
            ...blockStyles,
            borderRadius: 0,
            borderWidth: 2,
            shadowSize: 'none',
          });
          break;
        case 'soft':
          onChange({
            ...blockStyles,
            borderRadius: 24,
            borderWidth: 0,
            shadowSize: 'lg',
          });
          break;
      }
    },
    [blockStyles, onChange],
  );

  const currentShadow = SHADOW_OPTIONS.find((s) => s.value === blockStyles.shadowSize);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Box className="w-4 h-4 text-lxd-cyan" />
          <h4 className="text-sm font-semibold text-white">Block Styles</h4>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 text-xs"
          onClick={handleReset}
        >
          <RotateCcw className="w-3 h-3 mr-1" />
          Reset
        </Button>
      </div>

      {/* Quick Presets */}
      <div className="space-y-2">
        <p className="text-xs text-white/40 uppercase tracking-wider">Quick Presets</p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1 h-12 flex-col gap-0.5"
            onClick={() => applyPreset('rounded')}
          >
            <div className="w-6 h-4 bg-lxd-cyan/40 rounded-lg" />
            <span className="text-[10px]">Rounded</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1 h-12 flex-col gap-0.5"
            onClick={() => applyPreset('sharp')}
          >
            <div className="w-6 h-4 bg-lxd-cyan/40 border-2 border-lxd-cyan" />
            <span className="text-[10px]">Sharp</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1 h-12 flex-col gap-0.5"
            onClick={() => applyPreset('soft')}
          >
            <div className="w-6 h-4 bg-lxd-cyan/40 rounded-full shadow-lg" />
            <span className="text-[10px]">Soft</span>
          </Button>
        </div>
      </div>

      {/* Border Settings */}
      <div className="space-y-4">
        <p className="text-xs text-white/40 uppercase tracking-wider">Borders</p>

        {/* Border Radius */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-white/60">Corner Radius</Label>
            <span className="text-xs text-white/80">{blockStyles.borderRadius}px</span>
          </div>
          <Slider
            value={[blockStyles.borderRadius]}
            onValueChange={([v]) => handleChange('borderRadius', v)}
            min={0}
            max={32}
            step={2}
            className="w-full"
          />
        </div>

        {/* Border Width */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-white/60">Border Width</Label>
            <span className="text-xs text-white/80">{blockStyles.borderWidth}px</span>
          </div>
          <Slider
            value={[blockStyles.borderWidth]}
            onValueChange={([v]) => handleChange('borderWidth', v)}
            min={0}
            max={4}
            step={1}
            className="w-full"
          />
        </div>
      </div>

      {/* Shadow Settings */}
      <div className="space-y-4">
        <p className="text-xs text-white/40 uppercase tracking-wider">Shadow</p>
        <Select
          value={blockStyles.shadowSize}
          onValueChange={(v) => handleChange('shadowSize', v as BlockStyleConfig['shadowSize'])}
        >
          <SelectTrigger className="h-9 bg-lxd-dark-surface border-lxd-dark-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SHADOW_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Spacing Settings */}
      <div className="space-y-4">
        <p className="text-xs text-white/40 uppercase tracking-wider">Spacing</p>

        {/* Container Padding */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-white/60">Container Padding</Label>
            <span className="text-xs text-white/80">{blockStyles.containerPadding}px</span>
          </div>
          <Slider
            value={[blockStyles.containerPadding]}
            onValueChange={([v]) => handleChange('containerPadding', v)}
            min={8}
            max={48}
            step={4}
            className="w-full"
          />
        </div>

        {/* Block Gap */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-white/60">Block Gap</Label>
            <span className="text-xs text-white/80">{blockStyles.blockGap}px</span>
          </div>
          <Slider
            value={[blockStyles.blockGap]}
            onValueChange={([v]) => handleChange('blockGap', v)}
            min={0}
            max={32}
            step={4}
            className="w-full"
          />
        </div>
      </div>

      {/* Animation Settings */}
      <div className="space-y-4">
        <p className="text-xs text-white/40 uppercase tracking-wider">Animation</p>

        {/* Duration */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-white/60">Duration</Label>
            <span className="text-xs text-white/80">{blockStyles.animationDuration}ms</span>
          </div>
          <Slider
            value={[blockStyles.animationDuration]}
            onValueChange={([v]) => handleChange('animationDuration', v)}
            min={0}
            max={500}
            step={50}
            className="w-full"
          />
        </div>

        {/* Easing */}
        <div className="space-y-1.5">
          <Label className="text-xs text-white/60">Easing</Label>
          <Select
            value={blockStyles.animationEasing}
            onValueChange={(v) => handleChange('animationEasing', v)}
          >
            <SelectTrigger className="h-9 bg-lxd-dark-surface border-lxd-dark-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EASING_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Preview */}
      <div className="space-y-2">
        <p className="text-xs text-white/40 uppercase tracking-wider">Preview</p>
        <div
          className="p-4 bg-lxd-dark-surface border border-lxd-dark-border transition-all"
          style={{
            borderRadius: `${blockStyles.borderRadius}px`,
            borderWidth: `${blockStyles.borderWidth}px`,
            boxShadow: currentShadow?.css,
            padding: `${blockStyles.containerPadding}px`,
            transitionDuration: `${blockStyles.animationDuration}ms`,
            transitionTimingFunction: blockStyles.animationEasing,
          }}
        >
          <div className="space-y-2">
            <div
              className="h-3 bg-white/20 rounded"
              style={{ borderRadius: `${blockStyles.borderRadius / 2}px` }}
            />
            <div
              className="h-3 bg-white/10 rounded w-3/4"
              style={{ borderRadius: `${blockStyles.borderRadius / 2}px` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default BlockStylePresets;
