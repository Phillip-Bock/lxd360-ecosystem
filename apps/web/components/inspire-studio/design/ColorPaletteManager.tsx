'use client';

import { Check, Copy, Palette, RotateCcw } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

// =============================================================================
// Types
// =============================================================================

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
}

interface ColorPaletteManagerProps {
  palette: ColorPalette;
  onChange: (palette: ColorPalette) => void;
  className?: string;
}

// =============================================================================
// Default Palettes
// =============================================================================

export const DEFAULT_DARK_PALETTE: ColorPalette = {
  primary: '#00d4ff',
  secondary: '#8b5cf6',
  accent: '#f59e0b',
  background: '#0a0a0f',
  surface: '#1a1a24',
  text: '#ffffff',
  textSecondary: 'rgba(255, 255, 255, 0.6)',
  border: 'rgba(255, 255, 255, 0.1)',
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
};

export const DEFAULT_LIGHT_PALETTE: ColorPalette = {
  primary: '#0072f5',
  secondary: '#7c3aed',
  accent: '#f59e0b',
  background: '#ffffff',
  surface: '#f5f5f5',
  text: '#1a1a1a',
  textSecondary: 'rgba(0, 0, 0, 0.6)',
  border: 'rgba(0, 0, 0, 0.1)',
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
};

// =============================================================================
// Color Swatch Component
// =============================================================================

interface ColorSwatchProps {
  label: string;
  colorKey: keyof ColorPalette;
  value: string;
  onChange: (key: keyof ColorPalette, value: string) => void;
}

function ColorSwatch({ label, colorKey, value, onChange }: ColorSwatchProps) {
  const [localValue, setLocalValue] = useState(value);
  const [copied, setCopied] = useState(false);

  // Handle color change from picker
  const handleColorChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setLocalValue(newValue);
      onChange(colorKey, newValue);
    },
    [colorKey, onChange],
  );

  // Handle text input change
  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setLocalValue(newValue);
      // Only update parent if valid color
      if (/^#[0-9A-Fa-f]{6}$/.test(newValue) || /^rgba?\(/.test(newValue)) {
        onChange(colorKey, newValue);
      }
    },
    [colorKey, onChange],
  );

  // Copy color to clipboard
  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [value]);

  return (
    <div className="flex items-center gap-3">
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="w-10 h-10 rounded-lg border-2 border-lxd-dark-border shadow-sm transition-transform hover:scale-105"
            style={{ backgroundColor: value }}
            aria-label={`Change ${label} color`}
          />
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3" align="start">
          <input
            type="color"
            value={value.startsWith('#') ? value : '#000000'}
            onChange={handleColorChange}
            className="w-48 h-48 cursor-pointer rounded"
          />
        </PopoverContent>
      </Popover>

      <div className="flex-1 min-w-0">
        <Label className="text-xs text-white/60 mb-1 block">{label}</Label>
        <div className="flex gap-2">
          <Input
            value={localValue}
            onChange={handleTextChange}
            className="h-8 text-xs font-mono bg-lxd-dark-surface border-lxd-dark-border flex-1"
            placeholder="#000000"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 flex-shrink-0"
            onClick={handleCopy}
          >
            {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
          </Button>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Color Palette Manager Component
// =============================================================================

export function ColorPaletteManager({ palette, onChange, className }: ColorPaletteManagerProps) {
  // Handle individual color change
  const handleColorChange = useCallback(
    (key: keyof ColorPalette, value: string) => {
      onChange({
        ...palette,
        [key]: value,
      });
    },
    [palette, onChange],
  );

  // Reset to default dark palette
  const handleResetDark = useCallback(() => {
    onChange(DEFAULT_DARK_PALETTE);
  }, [onChange]);

  // Reset to default light palette
  const handleResetLight = useCallback(() => {
    onChange(DEFAULT_LIGHT_PALETTE);
  }, [onChange]);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-lxd-cyan" />
          <h4 className="text-sm font-semibold text-white">Color Palette</h4>
        </div>
        <div className="flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={handleResetDark}
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Dark
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={handleResetLight}
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Light
          </Button>
        </div>
      </div>

      {/* Brand Colors */}
      <div className="space-y-3">
        <p className="text-xs text-white/40 uppercase tracking-wider">Brand</p>
        <ColorSwatch
          label="Primary"
          colorKey="primary"
          value={palette.primary}
          onChange={handleColorChange}
        />
        <ColorSwatch
          label="Secondary"
          colorKey="secondary"
          value={palette.secondary}
          onChange={handleColorChange}
        />
        <ColorSwatch
          label="Accent"
          colorKey="accent"
          value={palette.accent}
          onChange={handleColorChange}
        />
      </div>

      {/* Background & Surface */}
      <div className="space-y-3">
        <p className="text-xs text-white/40 uppercase tracking-wider">Backgrounds</p>
        <ColorSwatch
          label="Background"
          colorKey="background"
          value={palette.background}
          onChange={handleColorChange}
        />
        <ColorSwatch
          label="Surface"
          colorKey="surface"
          value={palette.surface}
          onChange={handleColorChange}
        />
        <ColorSwatch
          label="Border"
          colorKey="border"
          value={palette.border}
          onChange={handleColorChange}
        />
      </div>

      {/* Text Colors */}
      <div className="space-y-3">
        <p className="text-xs text-white/40 uppercase tracking-wider">Text</p>
        <ColorSwatch
          label="Primary Text"
          colorKey="text"
          value={palette.text}
          onChange={handleColorChange}
        />
        <ColorSwatch
          label="Secondary Text"
          colorKey="textSecondary"
          value={palette.textSecondary}
          onChange={handleColorChange}
        />
      </div>

      {/* Status Colors */}
      <div className="space-y-3">
        <p className="text-xs text-white/40 uppercase tracking-wider">Status</p>
        <ColorSwatch
          label="Success"
          colorKey="success"
          value={palette.success}
          onChange={handleColorChange}
        />
        <ColorSwatch
          label="Warning"
          colorKey="warning"
          value={palette.warning}
          onChange={handleColorChange}
        />
        <ColorSwatch
          label="Error"
          colorKey="error"
          value={palette.error}
          onChange={handleColorChange}
        />
      </div>
    </div>
  );
}

export default ColorPaletteManager;
