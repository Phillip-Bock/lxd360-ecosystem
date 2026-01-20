'use client';

/**
 * ImageToolsTab - Contextual ribbon tab for image block editing
 * Provides Crop, Transform, Adjustments, Accessibility, and Source groups
 */

import {
  Accessibility,
  AlignCenter,
  AlignLeft,
  AlignRight,
  Copy,
  Crop,
  FlipHorizontal,
  FlipVertical,
  RotateCcw,
  RotateCw,
  Settings,
  Sparkles,
  Sun,
  Trash2,
  Upload,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { RibbonGroup } from '../ribbon-group';

type AspectRatio = 'free' | '1:1' | '4:3' | '16:9' | '9:16' | 'custom';

interface ImageToolsTabProps {
  /** Current crop aspect ratio */
  aspectRatio?: AspectRatio;
  /** Current brightness value (0-200, 100 = normal) */
  brightness?: number;
  /** Current contrast value (0-200, 100 = normal) */
  contrast?: number;
  /** Current saturation value (0-200, 100 = normal) */
  saturation?: number;
  /** Alt text for accessibility */
  altText?: string;
  /** Image source URL */
  imageUrl?: string;
  /** Callback for aspect ratio change */
  onAspectRatioChange?: (ratio: AspectRatio) => void;
  /** Callback to open crop tool */
  onOpenCrop?: () => void;
  /** Callback for zoom in */
  onZoomIn?: () => void;
  /** Callback for zoom out */
  onZoomOut?: () => void;
  /** Callback for rotate left */
  onRotateLeft?: () => void;
  /** Callback for rotate right */
  onRotateRight?: () => void;
  /** Callback for flip horizontal */
  onFlipHorizontal?: () => void;
  /** Callback for flip vertical */
  onFlipVertical?: () => void;
  /** Callback for brightness change */
  onBrightnessChange?: (value: number) => void;
  /** Callback for contrast change */
  onContrastChange?: (value: number) => void;
  /** Callback for saturation change */
  onSaturationChange?: (value: number) => void;
  /** Callback to reset adjustments */
  onResetAdjustments?: () => void;
  /** Callback to update alt text */
  onAltTextChange?: (text: string) => void;
  /** Callback to open AI alt text generator */
  onGenerateAltText?: () => void;
  /** Callback to replace image */
  onReplaceImage?: () => void;
  /** Callback to set image from URL */
  onSetImageUrl?: (url: string) => void;
  /** Callback for alignment change */
  onAlignmentChange?: (alignment: 'left' | 'center' | 'right') => void;
  /** Current alignment */
  alignment?: 'left' | 'center' | 'right';
  /** Callback to duplicate block */
  onDuplicate?: () => void;
  /** Callback to delete block */
  onDelete?: () => void;
  /** Callback to open settings */
  onOpenSettings?: () => void;
}

/**
 * ImageToolsTab - Full contextual ribbon tab for image editing
 */
export function ImageToolsTab({
  aspectRatio = 'free',
  brightness = 100,
  contrast = 100,
  saturation = 100,
  altText = '',
  alignment = 'center',
  onAspectRatioChange,
  onOpenCrop,
  onZoomIn,
  onZoomOut,
  onRotateLeft,
  onRotateRight,
  onFlipHorizontal,
  onFlipVertical,
  onBrightnessChange,
  onContrastChange,
  onSaturationChange,
  onResetAdjustments,
  onAltTextChange,
  onGenerateAltText,
  onReplaceImage,
  onAlignmentChange,
  onDuplicate,
  onDelete,
  onOpenSettings,
}: ImageToolsTabProps) {
  const aspectRatios: { value: AspectRatio; label: string }[] = [
    { value: 'free', label: 'Free' },
    { value: '1:1', label: '1:1' },
    { value: '4:3', label: '4:3' },
    { value: '16:9', label: '16:9' },
    { value: '9:16', label: '9:16' },
  ];

  return (
    <TooltipProvider>
      <div className="flex items-stretch gap-1 px-2">
        {/* Crop Group */}
        <RibbonGroup label="Crop">
          <div className="flex items-center gap-1 px-1">
            {/* Crop Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 border-white/10"
                  onClick={onOpenCrop}
                >
                  <Crop className="h-4 w-4 mr-1" />
                  Crop
                </Button>
              </TooltipTrigger>
              <TooltipContent>Open crop tool</TooltipContent>
            </Tooltip>

            {/* Aspect Ratio Buttons */}
            <div className="flex gap-0.5 ml-1">
              {aspectRatios.map((ratio) => (
                <Tooltip key={ratio.value}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        'h-7 px-2 text-xs',
                        aspectRatio === ratio.value && 'bg-cyan-500/20 text-cyan-400',
                      )}
                      onClick={() => onAspectRatioChange?.(ratio.value)}
                    >
                      {ratio.label}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Aspect ratio: {ratio.label}</TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
        </RibbonGroup>

        {/* Transform Group */}
        <RibbonGroup label="Transform">
          <div className="flex items-center gap-1 px-1">
            {/* Zoom */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onZoomIn}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom In</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onZoomOut}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom Out</TooltipContent>
            </Tooltip>

            <div className="w-px h-6 bg-white/10 mx-1" />

            {/* Rotate */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onRotateLeft}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Rotate Left 90°</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onRotateRight}>
                  <RotateCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Rotate Right 90°</TooltipContent>
            </Tooltip>

            <div className="w-px h-6 bg-white/10 mx-1" />

            {/* Flip */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onFlipHorizontal}>
                  <FlipHorizontal className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Flip Horizontal</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onFlipVertical}>
                  <FlipVertical className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Flip Vertical</TooltipContent>
            </Tooltip>
          </div>
        </RibbonGroup>

        {/* Adjustments Group */}
        <RibbonGroup label="Adjustments">
          <div className="flex items-center gap-3 px-2">
            {/* Brightness */}
            <div className="flex items-center gap-1">
              <Sun className="h-3 w-3 text-amber-400" />
              <Slider
                value={[brightness]}
                min={0}
                max={200}
                step={1}
                onValueChange={(val) => onBrightnessChange?.(val[0])}
                className="w-16"
              />
              <span className="text-[10px] text-zinc-500 w-6">{brightness}%</span>
            </div>

            {/* Contrast */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-zinc-500">C</span>
              <Slider
                value={[contrast]}
                min={0}
                max={200}
                step={1}
                onValueChange={(val) => onContrastChange?.(val[0])}
                className="w-16"
              />
              <span className="text-[10px] text-zinc-500 w-6">{contrast}%</span>
            </div>

            {/* Saturation */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-zinc-500">S</span>
              <Slider
                value={[saturation]}
                min={0}
                max={200}
                step={1}
                onValueChange={(val) => onSaturationChange?.(val[0])}
                className="w-16"
              />
              <span className="text-[10px] text-zinc-500 w-6">{saturation}%</span>
            </div>

            {/* Reset */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={onResetAdjustments}
                >
                  <RotateCcw className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reset Adjustments</TooltipContent>
            </Tooltip>
          </div>
        </RibbonGroup>

        {/* Accessibility Group */}
        <RibbonGroup label="Accessibility">
          <div className="flex items-center gap-2 px-2">
            <Accessibility className="h-4 w-4 text-green-400" />
            <Input
              value={altText}
              onChange={(e) => onAltTextChange?.(e.target.value)}
              placeholder="Alt text..."
              className="h-7 w-32 text-xs bg-zinc-900 border-white/10"
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 border-primary/50 text-primary"
                  onClick={onGenerateAltText}
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI
                </Button>
              </TooltipTrigger>
              <TooltipContent>Generate alt text with AI</TooltipContent>
            </Tooltip>
          </div>
        </RibbonGroup>

        {/* Source Group */}
        <RibbonGroup label="Source">
          <div className="flex items-center gap-1 px-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 border-white/10"
                  onClick={onReplaceImage}
                >
                  <Upload className="h-4 w-4 mr-1" />
                  Replace
                </Button>
              </TooltipTrigger>
              <TooltipContent>Replace image</TooltipContent>
            </Tooltip>

            {/* Alignment */}
            <div className="flex gap-0.5 ml-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      'h-7 w-7',
                      alignment === 'left' && 'bg-cyan-500/20 text-cyan-400',
                    )}
                    onClick={() => onAlignmentChange?.('left')}
                  >
                    <AlignLeft className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Align Left</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      'h-7 w-7',
                      alignment === 'center' && 'bg-cyan-500/20 text-cyan-400',
                    )}
                    onClick={() => onAlignmentChange?.('center')}
                  >
                    <AlignCenter className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Align Center</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      'h-7 w-7',
                      alignment === 'right' && 'bg-cyan-500/20 text-cyan-400',
                    )}
                    onClick={() => onAlignmentChange?.('right')}
                  >
                    <AlignRight className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Align Right</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </RibbonGroup>

        {/* Block Actions Group */}
        <RibbonGroup label="Block">
          <div className="flex items-center gap-1 px-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onDuplicate}>
                  <Copy className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Duplicate Block</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  onClick={onDelete}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete Block</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onOpenSettings}>
                  <Settings className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Image Settings</TooltipContent>
            </Tooltip>
          </div>
        </RibbonGroup>
      </div>
    </TooltipProvider>
  );
}
