'use client';

import { RefreshCw } from 'lucide-react';
import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import type { TitleBackgroundSettings } from '@/types/outline';

interface AdjustmentSlidersProps {
  settings: TitleBackgroundSettings;
  onSettingsChange: (settings: Partial<TitleBackgroundSettings>) => void;
  disabled?: boolean;
}

const DEFAULT_VALUES = {
  brightness: 100,
  contrast: 100,
  overlayOpacity: 0,
};

export function AdjustmentSliders({
  settings,
  onSettingsChange,
  disabled = false,
}: AdjustmentSlidersProps) {
  const handleBrightnessChange = useCallback(
    (value: number[]) => {
      onSettingsChange({ brightness: value[0] });
    },
    [onSettingsChange],
  );

  const handleContrastChange = useCallback(
    (value: number[]) => {
      onSettingsChange({ contrast: value[0] });
    },
    [onSettingsChange],
  );

  const handleOverlayOpacityChange = useCallback(
    (value: number[]) => {
      onSettingsChange({ overlayOpacity: value[0] });
    },
    [onSettingsChange],
  );

  const handleResetAll = useCallback(() => {
    onSettingsChange(DEFAULT_VALUES);
  }, [onSettingsChange]);

  const hasChanges =
    settings.brightness !== DEFAULT_VALUES.brightness ||
    settings.contrast !== DEFAULT_VALUES.contrast ||
    settings.overlayOpacity !== DEFAULT_VALUES.overlayOpacity;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Adjustments</Label>
        {hasChanges && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetAll}
            disabled={disabled}
            className="h-7 text-xs"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Reset
          </Button>
        )}
      </div>

      {/* Brightness */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Brightness</Label>
          <span className="text-xs text-muted-foreground">{settings.brightness}%</span>
        </div>
        <Slider
          value={[settings.brightness]}
          onValueChange={handleBrightnessChange}
          min={0}
          max={200}
          step={1}
          disabled={disabled}
        />
      </div>

      {/* Contrast */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Contrast</Label>
          <span className="text-xs text-muted-foreground">{settings.contrast}%</span>
        </div>
        <Slider
          value={[settings.contrast]}
          onValueChange={handleContrastChange}
          min={0}
          max={200}
          step={1}
          disabled={disabled}
        />
      </div>

      {/* Overlay Opacity */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Dark Overlay</Label>
          <span className="text-xs text-muted-foreground">{settings.overlayOpacity}%</span>
        </div>
        <Slider
          value={[settings.overlayOpacity]}
          onValueChange={handleOverlayOpacityChange}
          min={0}
          max={100}
          step={1}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
