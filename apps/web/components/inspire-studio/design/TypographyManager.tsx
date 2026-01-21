'use client';

import { RotateCcw, Type } from 'lucide-react';
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

export interface TypographyConfig {
  headingFont: string;
  bodyFont: string;
  monoFont: string;
  baseSize: number; // in pixels
  scaleRatio: number; // e.g., 1.25 for Major Third
  lineHeight: number; // e.g., 1.5
  letterSpacing: number; // in em
}

interface TypographyManagerProps {
  typography: TypographyConfig;
  onChange: (typography: TypographyConfig) => void;
  className?: string;
}

// =============================================================================
// Font Options
// =============================================================================

const FONT_OPTIONS = [
  { value: 'Inter, sans-serif', label: 'Inter' },
  { value: 'Roboto, sans-serif', label: 'Roboto' },
  { value: 'Open Sans, sans-serif', label: 'Open Sans' },
  { value: 'Lato, sans-serif', label: 'Lato' },
  { value: 'Poppins, sans-serif', label: 'Poppins' },
  { value: 'Montserrat, sans-serif', label: 'Montserrat' },
  { value: 'Source Sans Pro, sans-serif', label: 'Source Sans Pro' },
  { value: 'Nunito Sans, sans-serif', label: 'Nunito Sans' },
  { value: 'Merriweather, serif', label: 'Merriweather' },
  { value: 'Playfair Display, serif', label: 'Playfair Display' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'OpenDyslexic, sans-serif', label: 'OpenDyslexic (Accessibility)' },
] as const;

const MONO_FONT_OPTIONS = [
  { value: 'JetBrains Mono, monospace', label: 'JetBrains Mono' },
  { value: 'Fira Code, monospace', label: 'Fira Code' },
  { value: 'Source Code Pro, monospace', label: 'Source Code Pro' },
  { value: 'Roboto Mono, monospace', label: 'Roboto Mono' },
  { value: 'IBM Plex Mono, monospace', label: 'IBM Plex Mono' },
] as const;

const SCALE_RATIOS = [
  { value: 1.125, label: 'Minor Second (1.125)' },
  { value: 1.2, label: 'Minor Third (1.200)' },
  { value: 1.25, label: 'Major Third (1.250)' },
  { value: 1.333, label: 'Perfect Fourth (1.333)' },
  { value: Math.SQRT2, label: 'Augmented Fourth (1.414)' },
  { value: 1.5, label: 'Perfect Fifth (1.500)' },
  { value: 1.618, label: 'Golden Ratio (1.618)' },
] as const;

// =============================================================================
// Default Typography
// =============================================================================

export const DEFAULT_TYPOGRAPHY: TypographyConfig = {
  headingFont: 'Inter, sans-serif',
  bodyFont: 'Inter, sans-serif',
  monoFont: 'JetBrains Mono, monospace',
  baseSize: 16,
  scaleRatio: 1.25,
  lineHeight: 1.5,
  letterSpacing: 0,
};

// =============================================================================
// Typography Manager Component
// =============================================================================

export function TypographyManager({ typography, onChange, className }: TypographyManagerProps) {
  // Handle changes
  const handleChange = useCallback(
    <K extends keyof TypographyConfig>(key: K, value: TypographyConfig[K]) => {
      onChange({
        ...typography,
        [key]: value,
      });
    },
    [typography, onChange],
  );

  // Reset to defaults
  const handleReset = useCallback(() => {
    onChange(DEFAULT_TYPOGRAPHY);
  }, [onChange]);

  // Calculate font sizes based on scale ratio
  const fontSizes = {
    xs: Math.round(typography.baseSize / typography.scaleRatio),
    sm: Math.round(typography.baseSize / Math.sqrt(typography.scaleRatio)),
    base: typography.baseSize,
    lg: Math.round(typography.baseSize * Math.sqrt(typography.scaleRatio)),
    xl: Math.round(typography.baseSize * typography.scaleRatio),
    '2xl': Math.round(typography.baseSize * typography.scaleRatio ** 2),
    '3xl': Math.round(typography.baseSize * typography.scaleRatio ** 3),
    '4xl': Math.round(typography.baseSize * typography.scaleRatio ** 4),
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Type className="w-4 h-4 text-lxd-cyan" />
          <h4 className="text-sm font-semibold text-white">Typography</h4>
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

      {/* Font Families */}
      <div className="space-y-4">
        <p className="text-xs text-white/40 uppercase tracking-wider">Font Families</p>

        {/* Heading Font */}
        <div className="space-y-1.5">
          <Label className="text-xs text-white/60">Headings</Label>
          <Select
            value={typography.headingFont}
            onValueChange={(v) => handleChange('headingFont', v)}
          >
            <SelectTrigger className="h-9 bg-lxd-dark-surface border-lxd-dark-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FONT_OPTIONS.map((font) => (
                <SelectItem key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                  {font.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Body Font */}
        <div className="space-y-1.5">
          <Label className="text-xs text-white/60">Body</Label>
          <Select value={typography.bodyFont} onValueChange={(v) => handleChange('bodyFont', v)}>
            <SelectTrigger className="h-9 bg-lxd-dark-surface border-lxd-dark-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FONT_OPTIONS.map((font) => (
                <SelectItem key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                  {font.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Mono Font */}
        <div className="space-y-1.5">
          <Label className="text-xs text-white/60">Code / Mono</Label>
          <Select value={typography.monoFont} onValueChange={(v) => handleChange('monoFont', v)}>
            <SelectTrigger className="h-9 bg-lxd-dark-surface border-lxd-dark-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONO_FONT_OPTIONS.map((font) => (
                <SelectItem key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                  {font.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Scale Settings */}
      <div className="space-y-4">
        <p className="text-xs text-white/40 uppercase tracking-wider">Scale</p>

        {/* Base Size */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-white/60">Base Size</Label>
            <span className="text-xs text-white/80">{typography.baseSize}px</span>
          </div>
          <Slider
            value={[typography.baseSize]}
            onValueChange={([v]) => handleChange('baseSize', v)}
            min={12}
            max={24}
            step={1}
            className="w-full"
          />
        </div>

        {/* Scale Ratio */}
        <div className="space-y-1.5">
          <Label className="text-xs text-white/60">Scale Ratio</Label>
          <Select
            value={String(typography.scaleRatio)}
            onValueChange={(v) => handleChange('scaleRatio', Number(v))}
          >
            <SelectTrigger className="h-9 bg-lxd-dark-surface border-lxd-dark-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SCALE_RATIOS.map((ratio) => (
                <SelectItem key={ratio.value} value={String(ratio.value)}>
                  {ratio.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Line Height */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-white/60">Line Height</Label>
            <span className="text-xs text-white/80">{typography.lineHeight.toFixed(2)}</span>
          </div>
          <Slider
            value={[typography.lineHeight * 100]}
            onValueChange={([v]) => handleChange('lineHeight', v / 100)}
            min={100}
            max={200}
            step={5}
            className="w-full"
          />
        </div>

        {/* Letter Spacing */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-white/60">Letter Spacing</Label>
            <span className="text-xs text-white/80">{typography.letterSpacing.toFixed(2)}em</span>
          </div>
          <Slider
            value={[(typography.letterSpacing + 0.1) * 100]}
            onValueChange={([v]) => handleChange('letterSpacing', v / 100 - 0.1)}
            min={0}
            max={20}
            step={1}
            className="w-full"
          />
        </div>
      </div>

      {/* Size Scale Preview */}
      <div className="space-y-3">
        <p className="text-xs text-white/40 uppercase tracking-wider">Size Scale</p>
        <div className="space-y-2 p-3 rounded-lg bg-lxd-dark-surface border border-lxd-dark-border">
          {Object.entries(fontSizes).map(([key, size]) => (
            <div key={key} className="flex items-baseline justify-between">
              <span
                className="text-white/80"
                style={{
                  fontSize: `${size}px`,
                  fontFamily: key.includes('xl') ? typography.headingFont : typography.bodyFont,
                  lineHeight: typography.lineHeight,
                  letterSpacing: `${typography.letterSpacing}em`,
                }}
              >
                {key}
              </span>
              <span className="text-xs text-white/40">{size}px</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TypographyManager;
