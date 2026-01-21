'use client';

import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

interface HSLColor {
  h: number;
  s: number;
  l: number;
}

interface ColorPickerProps {
  value: HSLColor;
  onChange: (color: HSLColor) => void;
  presets?: HSLColor[];
  label?: string;
  className?: string;
}

// ============================================================================
// Helpers
// ============================================================================

function hslToString(hsl: HSLColor): string {
  return `hsl(${hsl.h} ${hsl.s}% ${hsl.l}%)`;
}

// ============================================================================
// Component
// ============================================================================

export function ColorPicker({
  value,
  onChange,
  presets = [],
  label,
  className,
}: ColorPickerProps): React.JSX.Element {
  const colorString = hslToString(value);

  return (
    <div className={cn('space-y-4', className)}>
      {label && <Label className="text-sm font-medium text-foreground">{label}</Label>}

      {/* Color preview */}
      <div className="flex items-center gap-4">
        <motion.div
          className="relative w-16 h-16 rounded-xl shadow-lg overflow-hidden"
          style={{ backgroundColor: colorString }}
          animate={{ boxShadow: `0 0 30px ${colorString}` }}
          transition={{ duration: 0.3 }}
        >
          {/* Glassmorphic overlay */}
          <div className="absolute inset-0 bg-linear-to-br from-white/20 to-transparent" />
        </motion.div>

        {/* HSL values display */}
        <div className="flex-1 grid grid-cols-3 gap-2">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">H</Label>
            <Input
              type="number"
              min={0}
              max={360}
              value={value.h}
              onChange={(e) => onChange({ ...value, h: Number(e.target.value) })}
              className="h-8 text-xs font-mono"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">S</Label>
            <Input
              type="number"
              min={0}
              max={100}
              value={value.s}
              onChange={(e) => onChange({ ...value, s: Number(e.target.value) })}
              className="h-8 text-xs font-mono"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">L</Label>
            <Input
              type="number"
              min={0}
              max={100}
              value={value.l}
              onChange={(e) => onChange({ ...value, l: Number(e.target.value) })}
              className="h-8 text-xs font-mono"
            />
          </div>
        </div>
      </div>

      {/* Hue slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Hue</Label>
          <span className="text-xs font-mono text-muted-foreground">{value.h}°</span>
        </div>
        <div className="relative h-3 rounded-full overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to right,
                hsl(0 ${value.s}% ${value.l}%),
                hsl(60 ${value.s}% ${value.l}%),
                hsl(120 ${value.s}% ${value.l}%),
                hsl(180 ${value.s}% ${value.l}%),
                hsl(240 ${value.s}% ${value.l}%),
                hsl(300 ${value.s}% ${value.l}%),
                hsl(360 ${value.s}% ${value.l}%)
              )`,
            }}
          />
          <Slider
            value={[value.h]}
            min={0}
            max={360}
            step={1}
            onValueChange={([h]) => onChange({ ...value, h })}
            className="absolute inset-0"
          />
        </div>
      </div>

      {/* Saturation slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Saturation</Label>
          <span className="text-xs font-mono text-muted-foreground">{value.s}%</span>
        </div>
        <div className="relative h-3 rounded-full overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to right,
                hsl(${value.h} 0% ${value.l}%),
                hsl(${value.h} 100% ${value.l}%)
              )`,
            }}
          />
          <Slider
            value={[value.s]}
            min={0}
            max={100}
            step={1}
            onValueChange={([s]) => onChange({ ...value, s })}
            className="absolute inset-0"
          />
        </div>
      </div>

      {/* Lightness slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Lightness</Label>
          <span className="text-xs font-mono text-muted-foreground">{value.l}%</span>
        </div>
        <div className="relative h-3 rounded-full overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to right,
                hsl(${value.h} ${value.s}% 0%),
                hsl(${value.h} ${value.s}% 50%),
                hsl(${value.h} ${value.s}% 100%)
              )`,
            }}
          />
          <Slider
            value={[value.l]}
            min={0}
            max={100}
            step={1}
            onValueChange={([l]) => onChange({ ...value, l })}
            className="absolute inset-0"
          />
        </div>
      </div>

      {/* Presets */}
      {presets.length > 0 && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Presets</Label>
          <div className="flex flex-wrap gap-2">
            {presets.map((preset, i) => (
              <motion.button
                key={i}
                className="w-8 h-8 rounded-lg shadow-md border border-brand-subtle"
                style={{ backgroundColor: hslToString(preset) }}
                onClick={() => onChange(preset)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
