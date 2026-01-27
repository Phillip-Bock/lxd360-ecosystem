'use client';

import { Contrast, Droplets, Palette, RotateCcw, Sparkles, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { TooltipProvider } from '@/components/ui/tooltip';

export interface FilterSettings {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  grayscale: number;
  sepia: number;
  hueRotate: number;
}

interface FilterToolProps {
  filters: FilterSettings;
  onFilterChange: (filters: FilterSettings) => void;
  onReset: () => void;
}

const DEFAULT_FILTERS: FilterSettings = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  blur: 0,
  grayscale: 0,
  sepia: 0,
  hueRotate: 0,
};

const FILTER_PRESETS = [
  { name: 'None', filters: { ...DEFAULT_FILTERS } },
  {
    name: 'Vivid',
    filters: { ...DEFAULT_FILTERS, saturation: 130, contrast: 110 },
  },
  {
    name: 'Warm',
    filters: { ...DEFAULT_FILTERS, sepia: 20, saturation: 110 },
  },
  {
    name: 'Cool',
    filters: { ...DEFAULT_FILTERS, hueRotate: 180, saturation: 80 },
  },
  {
    name: 'B&W',
    filters: { ...DEFAULT_FILTERS, grayscale: 100 },
  },
  {
    name: 'Vintage',
    filters: { ...DEFAULT_FILTERS, sepia: 40, contrast: 90, saturation: 80 },
  },
  {
    name: 'High Contrast',
    filters: { ...DEFAULT_FILTERS, contrast: 150, brightness: 95 },
  },
  {
    name: 'Muted',
    filters: { ...DEFAULT_FILTERS, saturation: 50, brightness: 105 },
  },
];

/**
 * FilterTool - Image filter controls (brightness, contrast, saturation, etc.)
 */
export function FilterTool({ filters, onFilterChange, onReset }: FilterToolProps) {
  const updateFilter = (key: keyof FilterSettings, value: number) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const applyPreset = (preset: FilterSettings) => {
    onFilterChange(preset);
  };

  return (
    <TooltipProvider>
      <div className="space-y-4 p-4 bg-(--studio-bg) rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <Sparkles className="h-4 w-4" />
            <span>Filters & Adjustments</span>
          </div>
          <Button variant="ghost" size="sm" className="text-zinc-500 h-8" onClick={onReset}>
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset
          </Button>
        </div>

        {/* Presets */}
        <div className="space-y-2">
          <Label className="text-xs text-zinc-500">Presets</Label>
          <div className="flex flex-wrap gap-2">
            {FILTER_PRESETS.map((preset) => (
              <Button
                key={preset.name}
                variant="outline"
                size="sm"
                className="text-xs border-white/10"
                onClick={() => applyPreset(preset.filters)}
              >
                {preset.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Adjustments */}
        <div className="space-y-4 pt-2 border-t border-white/5">
          {/* Brightness */}
          <FilterSlider
            icon={Sun}
            label="Brightness"
            value={filters.brightness}
            min={0}
            max={200}
            onChange={(v) => updateFilter('brightness', v)}
          />

          {/* Contrast */}
          <FilterSlider
            icon={Contrast}
            label="Contrast"
            value={filters.contrast}
            min={0}
            max={200}
            onChange={(v) => updateFilter('contrast', v)}
          />

          {/* Saturation */}
          <FilterSlider
            icon={Droplets}
            label="Saturation"
            value={filters.saturation}
            min={0}
            max={200}
            onChange={(v) => updateFilter('saturation', v)}
          />

          {/* Hue Rotate */}
          <FilterSlider
            icon={Palette}
            label="Hue"
            value={filters.hueRotate}
            min={0}
            max={360}
            suffix="°"
            onChange={(v) => updateFilter('hueRotate', v)}
          />

          {/* Grayscale */}
          <FilterSlider
            icon={Contrast}
            label="Grayscale"
            value={filters.grayscale}
            min={0}
            max={100}
            onChange={(v) => updateFilter('grayscale', v)}
          />

          {/* Sepia */}
          <FilterSlider
            icon={Palette}
            label="Sepia"
            value={filters.sepia}
            min={0}
            max={100}
            onChange={(v) => updateFilter('sepia', v)}
          />

          {/* Blur */}
          <FilterSlider
            icon={Sparkles}
            label="Blur"
            value={filters.blur}
            min={0}
            max={20}
            suffix="px"
            onChange={(v) => updateFilter('blur', v)}
          />
        </div>
      </div>
    </TooltipProvider>
  );
}

/**
 * Reusable filter slider component
 */
function FilterSlider({
  icon: Icon,
  label,
  value,
  min,
  max,
  suffix = '%',
  onChange,
}: {
  icon: typeof Sun;
  label: string;
  value: number;
  min: number;
  max: number;
  suffix?: string;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-3 w-3 text-zinc-500" />
          <Label className="text-xs text-zinc-400">{label}</Label>
        </div>
        <span className="text-xs text-zinc-500">
          {value}
          {suffix}
        </span>
      </div>
      <Slider value={[value]} min={min} max={max} step={1} onValueChange={([v]) => onChange(v)} />
    </div>
  );
}

/**
 * Generate CSS filter string from settings
 */
export function getFilterCSS(filters: FilterSettings): string {
  return [
    `brightness(${filters.brightness}%)`,
    `contrast(${filters.contrast}%)`,
    `saturate(${filters.saturation}%)`,
    `grayscale(${filters.grayscale}%)`,
    `sepia(${filters.sepia}%)`,
    `hue-rotate(${filters.hueRotate}deg)`,
    filters.blur > 0 ? `blur(${filters.blur}px)` : '',
  ]
    .filter(Boolean)
    .join(' ');
}

/**
 * Preview component with filter applied
 */
export function FilterPreview({
  imageUrl,
  filters,
}: {
  imageUrl: string;
  filters: FilterSettings;
}) {
  const filterCSS = getFilterCSS(filters);

  return (
    <div className="relative rounded-lg overflow-hidden">
      <div
        className="w-full h-48 bg-cover bg-center"
        style={{
          backgroundImage: `url(${imageUrl})`,
          filter: filterCSS,
        }}
      />
    </div>
  );
}
