'use client';

import { Minus, Plus, RotateCcw } from 'lucide-react';
import { useCallback, useState } from 'react';

export interface RibbonZoomProps {
  value?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  presets?: number[];
  showPercentage?: boolean;
  showSlider?: boolean;
  className?: string;
}

const DEFAULT_PRESETS = [50, 75, 100, 125, 150, 200];

export function RibbonZoom({
  value: controlledValue,
  onChange,
  min = 25,
  max = 400,
  step = 10,
  presets = DEFAULT_PRESETS,
  showPercentage = true,
  showSlider = true,
  className = '',
}: RibbonZoomProps) {
  const [internalValue, setInternalValue] = useState(100);
  const value = controlledValue ?? internalValue;

  const handleChange = useCallback(
    (newValue: number) => {
      const clampedValue = Math.min(max, Math.max(min, newValue));
      if (onChange) {
        onChange(clampedValue);
      } else {
        setInternalValue(clampedValue);
      }
    },
    [onChange, min, max],
  );

  const zoomIn = () => handleChange(value + step);
  const zoomOut = () => handleChange(value - step);
  const resetZoom = () => handleChange(100);

  return (
    <div
      className={`flex items-center gap-2 px-2 py-1 bg-(--ribbon-bg) border border-(--ribbon-border) rounded-md ${className}`}
    >
      {/* Zoom out button */}
      <button
        type="button"
        onClick={zoomOut}
        disabled={value <= min}
        className="p-1 rounded hover:bg-(--ribbon-hover) disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Zoom out"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>

      {/* Slider */}
      {showSlider && (
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => handleChange(Number(e.target.value))}
          className="w-24 h-1 bg-(--ribbon-border) rounded-full appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-3
            [&::-webkit-slider-thumb]:h-3
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-(--ribbon-accent)
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-moz-range-thumb]:w-3
            [&::-moz-range-thumb]:h-3
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-(--ribbon-accent)
            [&::-moz-range-thumb]:border-0
            [&::-moz-range-thumb]:cursor-pointer"
          aria-label="Zoom level"
        />
      )}

      {/* Zoom in button */}
      <button
        type="button"
        onClick={zoomIn}
        disabled={value >= max}
        className="p-1 rounded hover:bg-(--ribbon-hover) disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Zoom in"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>

      {/* Percentage display / dropdown */}
      {showPercentage && (
        <div className="relative group">
          <button
            type="button"
            className="min-w-[3.5rem] px-2 py-0.5 text-sm font-medium rounded hover:bg-(--ribbon-hover) transition-colors"
            onClick={resetZoom}
            aria-label="Reset zoom to 100%"
          >
            {value}%
          </button>

          {/* Preset dropdown on hover */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block">
            <div className="bg-(--ribbon-bg) border border-(--ribbon-border) rounded-md shadow-lg py-1 min-w-[80px]">
              {presets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleChange(preset)}
                  className={`
                    w-full px-3 py-1 text-sm text-left hover:bg-(--ribbon-hover) transition-colors
                    ${value === preset ? 'bg-(--ribbon-active) font-medium' : ''}
                  `}
                >
                  {preset}%
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Reset button */}
      <button
        type="button"
        onClick={resetZoom}
        className="p-1 rounded hover:bg-(--ribbon-hover) transition-colors"
        aria-label="Reset zoom"
        title="Reset to 100%"
      >
        <RotateCcw className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// Simplified zoom for status bar
export interface RibbonZoomSliderProps {
  value?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
}

export function RibbonZoomSlider({
  value = 100,
  onChange,
  min = 25,
  max = 400,
  className = '',
}: RibbonZoomSliderProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={() => onChange?.(Math.max(min, value - 10))}
        disabled={value <= min}
        className="p-0.5 rounded hover:bg-(--ribbon-hover) disabled:opacity-50 transition-colors"
        aria-label="Zoom out"
      >
        <Minus className="h-3 w-3" />
      </button>

      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange?.(Number(e.target.value))}
        className="w-20 h-1 bg-(--ribbon-border) rounded-full appearance-none cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-2.5
          [&::-webkit-slider-thumb]:h-2.5
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-(--ribbon-accent)
          [&::-webkit-slider-thumb]:cursor-pointer"
        aria-label="Zoom level"
      />

      <button
        type="button"
        onClick={() => onChange?.(Math.min(max, value + 10))}
        disabled={value >= max}
        className="p-0.5 rounded hover:bg-(--ribbon-hover) disabled:opacity-50 transition-colors"
        aria-label="Zoom in"
      >
        <Plus className="h-3 w-3" />
      </button>

      <span className="text-xs min-w-[2.5rem] text-right">{value}%</span>
    </div>
  );
}
