'use client';

import {
  Grid3X3,
  Hand,
  MousePointer2,
  Plus,
  Redo2,
  Ruler,
  Settings,
  Undo2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { CanvasConfig, GridType } from '@/schemas/inspire';
import { CANVAS_PRESETS, type CanvasTool } from './types';

// ============================================================================
// COMPONENT
// ============================================================================

interface CanvasToolbarProps {
  canvasConfig: CanvasConfig;
  onConfigChange: (config: Partial<CanvasConfig>) => void;
  activeTool: CanvasTool;
  onToolChange: (tool: CanvasTool) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  className?: string;
}

/**
 * CanvasToolbar - Toolbar for canvas controls and settings
 */
export function CanvasToolbar({
  canvasConfig,
  onConfigChange,
  activeTool,
  onToolChange,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  className,
}: CanvasToolbarProps) {
  const handleZoomIn = () => {
    const newZoom = Math.min(200, canvasConfig.zoom + 10);
    onConfigChange({ zoom: newZoom });
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(25, canvasConfig.zoom - 10);
    onConfigChange({ zoom: newZoom });
  };

  const handlePresetChange = (presetId: string) => {
    const preset = CANVAS_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      onConfigChange({
        width: preset.width,
        height: preset.height,
        aspectRatio: preset.aspectRatio,
      });
    }
  };

  return (
    <TooltipProvider>
      <div
        className={cn(
          'flex items-center gap-2 px-3 py-2 bg-lxd-dark-surface border-b border-lxd-dark-border',
          className,
        )}
      >
        {/* Tools */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn(
                  'h-8 w-8',
                  activeTool === 'select' && 'bg-lxd-purple/20 text-lxd-purple',
                )}
                onClick={() => onToolChange('select')}
              >
                <MousePointer2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Select (V)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn(
                  'h-8 w-8',
                  activeTool === 'pan' && 'bg-lxd-purple/20 text-lxd-purple',
                )}
                onClick={() => onToolChange('pan')}
              >
                <Hand className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Pan (Space)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn(
                  'h-8 w-8',
                  activeTool === 'add' && 'bg-lxd-purple/20 text-lxd-purple',
                )}
                onClick={() => onToolChange('add')}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Add Block (A)</TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Undo/Redo */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                disabled={!canUndo}
                onClick={onUndo}
              >
                <Undo2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                disabled={!canRedo}
                onClick={onRedo}
              >
                <Redo2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Redo (Ctrl+Y)</TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Canvas Size Preset */}
        <Select
          value={
            CANVAS_PRESETS.find(
              (p) => p.width === canvasConfig.width && p.height === canvasConfig.height,
            )?.id ?? 'custom'
          }
          onValueChange={handlePresetChange}
        >
          <SelectTrigger className="w-[140px] h-8 bg-lxd-dark-bg border-lxd-dark-border text-xs">
            <SelectValue placeholder="Canvas Size" />
          </SelectTrigger>
          <SelectContent className="bg-lxd-dark-surface border-lxd-dark-border">
            {CANVAS_PRESETS.map((preset) => (
              <SelectItem key={preset.id} value={preset.id} className="text-xs">
                {preset.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Grid Type */}
        <Select
          value={canvasConfig.gridType}
          onValueChange={(v) => onConfigChange({ gridType: v as GridType })}
        >
          <SelectTrigger className="w-[130px] h-8 bg-lxd-dark-bg border-lxd-dark-border text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-lxd-dark-surface border-lxd-dark-border">
            <SelectItem value="12-column" className="text-xs">
              12-Column
            </SelectItem>
            <SelectItem value="10x10-technical" className="text-xs">
              10x10 Technical
            </SelectItem>
          </SelectContent>
        </Select>

        <Separator orientation="vertical" className="h-6" />

        {/* View Toggles */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn('h-8 w-8', canvasConfig.gridVisible && 'text-lxd-cyan')}
                onClick={() => onConfigChange({ gridVisible: !canvasConfig.gridVisible })}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle Grid (G)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn('h-8 w-8', canvasConfig.rulersVisible && 'text-lxd-cyan')}
                onClick={() => onConfigChange({ rulersVisible: !canvasConfig.rulersVisible })}
              >
                <Ruler className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle Rulers (R)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn('h-8 w-8', canvasConfig.snapToGrid && 'text-lxd-cyan')}
                onClick={() => onConfigChange({ snapToGrid: !canvasConfig.snapToGrid })}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Snap to Grid (S)</TooltipContent>
          </Tooltip>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleZoomOut}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom Out (-)</TooltipContent>
          </Tooltip>

          <span className="text-xs font-medium w-12 text-center">{canvasConfig.zoom}%</span>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleZoomIn}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom In (+)</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}
