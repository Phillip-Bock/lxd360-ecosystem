'use client';

import {
  Crop,
  Lock,
  Monitor,
  RectangleHorizontal,
  RectangleVertical,
  RotateCcw,
  Smartphone,
  Square,
  Unlock,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface CropSettings {
  x: number;
  y: number;
  width: number;
  height: number;
  aspectRatio: number | null;
}

interface CropToolProps {
  imageWidth: number;
  imageHeight: number;
  cropSettings: CropSettings;
  onCropChange: (settings: CropSettings) => void;
  onApply: () => void;
  onReset: () => void;
}

const ASPECT_RATIOS = [
  { label: 'Free', value: null, icon: Crop },
  { label: '1:1', value: 1, icon: Square },
  { label: '16:9', value: 16 / 9, icon: RectangleHorizontal },
  { label: '4:3', value: 4 / 3, icon: RectangleHorizontal },
  { label: '3:2', value: 3 / 2, icon: RectangleHorizontal },
  { label: '9:16', value: 9 / 16, icon: RectangleVertical },
  { label: 'Mobile', value: 9 / 16, icon: Smartphone },
  { label: 'Desktop', value: 16 / 9, icon: Monitor },
] as const;

/**
 * CropTool - Image crop controls with aspect ratio presets
 */
export function CropTool({
  imageWidth,
  imageHeight,
  cropSettings,
  onCropChange,
  onApply,
  onReset,
}: CropToolProps) {
  const [isLocked, setIsLocked] = useState(cropSettings.aspectRatio !== null);

  const handleAspectRatioChange = (ratio: number | null) => {
    if (ratio === null) {
      setIsLocked(false);
      onCropChange({ ...cropSettings, aspectRatio: null });
      return;
    }

    setIsLocked(true);

    // Calculate new dimensions based on aspect ratio
    const currentAspect = cropSettings.width / cropSettings.height;
    let newWidth = cropSettings.width;
    let newHeight = cropSettings.height;

    if (currentAspect > ratio) {
      // Current is wider, adjust width
      newWidth = cropSettings.height * ratio;
    } else {
      // Current is taller, adjust height
      newHeight = cropSettings.width / ratio;
    }

    // Ensure within bounds
    newWidth = Math.min(newWidth, imageWidth - cropSettings.x);
    newHeight = Math.min(newHeight, imageHeight - cropSettings.y);

    onCropChange({
      ...cropSettings,
      width: newWidth,
      height: newHeight,
      aspectRatio: ratio,
    });
  };

  const handleDimensionChange = (dimension: 'width' | 'height', value: number) => {
    const newSettings = { ...cropSettings };

    if (dimension === 'width') {
      newSettings.width = Math.min(value, imageWidth - cropSettings.x);
      if (isLocked && cropSettings.aspectRatio) {
        newSettings.height = newSettings.width / cropSettings.aspectRatio;
      }
    } else {
      newSettings.height = Math.min(value, imageHeight - cropSettings.y);
      if (isLocked && cropSettings.aspectRatio) {
        newSettings.width = newSettings.height * cropSettings.aspectRatio;
      }
    }

    onCropChange(newSettings);
  };

  const handlePositionChange = (axis: 'x' | 'y', value: number) => {
    const newSettings = { ...cropSettings };
    if (axis === 'x') {
      newSettings.x = Math.max(0, Math.min(value, imageWidth - cropSettings.width));
    } else {
      newSettings.y = Math.max(0, Math.min(value, imageHeight - cropSettings.height));
    }
    onCropChange(newSettings);
  };

  return (
    <TooltipProvider>
      <div className="space-y-4 p-4 bg-(--studio-bg) rounded-lg">
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <Crop className="h-4 w-4" />
          <span>Crop & Resize</span>
        </div>

        {/* Aspect Ratio Presets */}
        <div className="space-y-2">
          <Label className="text-xs text-zinc-500">Aspect Ratio</Label>
          <div className="flex flex-wrap gap-2">
            {ASPECT_RATIOS.map((ratio) => {
              const Icon = ratio.icon;
              const isActive = cropSettings.aspectRatio === ratio.value;

              return (
                <Tooltip key={ratio.label}>
                  <TooltipTrigger asChild>
                    <Button
                      variant={isActive ? 'default' : 'outline'}
                      size="sm"
                      className={`h-8 ${!isActive ? 'border-white/10' : ''}`}
                      onClick={() => handleAspectRatioChange(ratio.value)}
                    >
                      <Icon className="h-3 w-3 mr-1" />
                      {ratio.label}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{ratio.label} aspect ratio</TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </div>

        {/* Dimension Inputs */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs text-zinc-500">Width</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={Math.round(cropSettings.width)}
                onChange={(e) => handleDimensionChange('width', parseInt(e.target.value, 10) || 0)}
                className="bg-(--studio-surface) border-white/10"
              />
              <span className="text-xs text-zinc-500">px</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-zinc-500">Height</Label>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                onClick={() => setIsLocked(!isLocked)}
              >
                {isLocked ? (
                  <Lock className="h-3 w-3 text-primary" />
                ) : (
                  <Unlock className="h-3 w-3 text-zinc-500" />
                )}
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={Math.round(cropSettings.height)}
                onChange={(e) => handleDimensionChange('height', parseInt(e.target.value, 10) || 0)}
                className="bg-(--studio-surface) border-white/10"
              />
              <span className="text-xs text-zinc-500">px</span>
            </div>
          </div>
        </div>

        {/* Position Inputs */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs text-zinc-500">X Position</Label>
            <Input
              type="number"
              value={Math.round(cropSettings.x)}
              onChange={(e) => handlePositionChange('x', parseInt(e.target.value, 10) || 0)}
              className="bg-(--studio-surface) border-white/10"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-zinc-500">Y Position</Label>
            <Input
              type="number"
              value={Math.round(cropSettings.y)}
              onChange={(e) => handlePositionChange('y', parseInt(e.target.value, 10) || 0)}
              className="bg-(--studio-surface) border-white/10"
            />
          </div>
        </div>

        {/* Info */}
        <div className="text-xs text-zinc-600 pt-2 border-t border-white/5">
          Original: {imageWidth} × {imageHeight}px
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 border-white/10" onClick={onReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button size="sm" className="flex-1" onClick={onApply}>
            Apply Crop
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
}

/**
 * Visual crop preview overlay
 */
export function CropPreview({
  imageUrl,
  cropSettings,
  imageWidth,
  imageHeight,
}: {
  imageUrl: string;
  cropSettings: CropSettings;
  imageWidth: number;
  imageHeight: number;
}) {
  const scaleX = 300 / imageWidth;
  const scaleY = 200 / imageHeight;
  const scale = Math.min(scaleX, scaleY);

  const displayWidth = imageWidth * scale;
  const displayHeight = imageHeight * scale;

  return (
    <div
      className="relative bg-zinc-900 rounded-lg overflow-hidden"
      style={{ width: displayWidth, height: displayHeight }}
    >
      {/* Darkened image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-40"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />

      {/* Crop region */}
      <div
        className="absolute border-2 border-primary bg-cover bg-center"
        style={{
          left: cropSettings.x * scale,
          top: cropSettings.y * scale,
          width: cropSettings.width * scale,
          height: cropSettings.height * scale,
          backgroundImage: `url(${imageUrl})`,
          backgroundPosition: `-${cropSettings.x * scale}px -${cropSettings.y * scale}px`,
          backgroundSize: `${displayWidth}px ${displayHeight}px`,
        }}
      >
        {/* Corner handles */}
        <div className="absolute -left-1 -top-1 w-2 h-2 bg-white rounded-full" />
        <div className="absolute -right-1 -top-1 w-2 h-2 bg-white rounded-full" />
        <div className="absolute -left-1 -bottom-1 w-2 h-2 bg-white rounded-full" />
        <div className="absolute -right-1 -bottom-1 w-2 h-2 bg-white rounded-full" />
      </div>
    </div>
  );
}
