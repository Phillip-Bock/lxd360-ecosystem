'use client';

import { Brain, Clock, Layers } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { AssimilationData, BlockType, CanvasConfig, ContentBlock } from '@/schemas/inspire';
import { useMissionStore } from '@/store/inspire';
import { BlockItem } from './BlockItem';
import { BlockPalette } from './BlockPalette';
import { CanvasGrid } from './CanvasGrid';
import { CanvasToolbar } from './CanvasToolbar';
import {
  type CanvasTool,
  calculateCognitiveLoad,
  estimateDuration,
  GRID_CONFIGS,
  getBlockTypeOption,
  getDefaultCanvasConfig,
  snapToGrid,
} from './types';

// ============================================================================
// COMPONENT
// ============================================================================

interface CourseCanvasProps {
  className?: string;
}

/**
 * CourseCanvas - Main visual editor for INSPIRE content authoring
 *
 * Features:
 * - Drag-and-drop block placement
 * - Grid-based layout (12-column or 10x10)
 * - Zoom and pan controls
 * - Block selection and editing
 * - Real-time cognitive load meter
 *
 * Output to store:
 * - manifest.assimilation
 */
export function CourseCanvas({ className }: CourseCanvasProps) {
  const manifest = useMissionStore((state) => state.manifest);
  const updateAssimilationData = useMissionStore((state) => state.updateAssimilationData);

  // Canvas state
  const [canvasConfig, setCanvasConfig] = useState<CanvasConfig>(
    manifest?.assimilation?.canvasConfig ?? getDefaultCanvasConfig(),
  );
  const [blocks, setBlocks] = useState<ContentBlock[]>(manifest?.assimilation?.blocks ?? []);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<CanvasTool>('select');

  // Calculate metrics
  const cognitiveLoad = useMemo(() => calculateCognitiveLoad(blocks), [blocks]);
  const estimatedDurationMinutes = useMemo(() => estimateDuration(blocks), [blocks]);

  // Scale factor for display
  const scale = canvasConfig.zoom / 100;

  // Sync to store
  useEffect(() => {
    const assimilationData: AssimilationData = {
      blocks,
      canvasConfig,
      cognitiveLoadMeterValue: cognitiveLoad,
      estimatedDuration: estimatedDurationMinutes,
    };
    updateAssimilationData(assimilationData);
  }, [blocks, canvasConfig, cognitiveLoad, estimatedDurationMinutes, updateAssimilationData]);

  // Handle config change
  const handleConfigChange = useCallback((updates: Partial<CanvasConfig>) => {
    setCanvasConfig((prev) => ({ ...prev, ...updates }));
  }, []);

  // Handle adding a block
  const handleAddBlock = useCallback(
    (blockType: BlockType, x?: number, y?: number) => {
      const blockTypeOption = getBlockTypeOption(blockType);
      const gridConfig = GRID_CONFIGS[canvasConfig.gridType];
      const cellWidth = canvasConfig.width / gridConfig.columns;
      const cellHeight = canvasConfig.height / gridConfig.rows;

      // Default position at center if not specified
      const defaultX =
        x ?? canvasConfig.width / 2 - ((blockTypeOption?.defaultSize.width ?? 4) * cellWidth) / 2;
      const defaultY =
        y ??
        canvasConfig.height / 2 - ((blockTypeOption?.defaultSize.height ?? 3) * cellHeight) / 2;

      const snappedPos = snapToGrid(defaultX, defaultY, canvasConfig);

      const newBlock: ContentBlock = {
        id: uuidv4(),
        type: blockType,
        order: blocks.length,
        position: {
          x: snappedPos.x,
          y: snappedPos.y,
          width: (blockTypeOption?.defaultSize.width ?? 4) * cellWidth,
          height: (blockTypeOption?.defaultSize.height ?? 3) * cellHeight,
        },
        content: {},
        config: {},
        inspireMeta: {
          cognitiveLoadWeight: 1,
        },
      };

      setBlocks((prev) => [...prev, newBlock]);
      setSelectedBlockId(newBlock.id);
      setActiveTool('select');
    },
    [canvasConfig, blocks.length],
  );

  // Handle drop from palette
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const blockType = e.dataTransfer.getData('blockType') as BlockType;
      if (!blockType) return;

      const canvasRect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - canvasRect.left) / scale;
      const y = (e.clientY - canvasRect.top) / scale;

      handleAddBlock(blockType, x, y);
    },
    [scale, handleAddBlock],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  // Handle canvas click (deselect)
  const handleCanvasClick = useCallback(() => {
    setSelectedBlockId(null);
  }, []);

  // Handle block selection
  const handleBlockSelect = useCallback((blockId: string) => {
    setSelectedBlockId(blockId);
  }, []);

  // Handle block double-click (edit)
  const handleBlockDoubleClick = useCallback((_blockId: string) => {
    // TODO(LXD-STUDIO): Open block editor dialog
    void _blockId;
  }, []);

  // Handle delete key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedBlockId) {
        setBlocks((prev) => prev.filter((b) => b.id !== selectedBlockId));
        setSelectedBlockId(null);
      }
      if (e.key === 'Escape') {
        setSelectedBlockId(null);
      }
      // Tool shortcuts
      if (e.key === 'v' || e.key === 'V') setActiveTool('select');
      if (e.key === 'a' || e.key === 'A') setActiveTool('add');
      if (e.key === ' ') setActiveTool('pan');
      if (e.key === 'g' || e.key === 'G') {
        setCanvasConfig((prev) => ({ ...prev, gridVisible: !prev.gridVisible }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedBlockId]);

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Toolbar */}
      <CanvasToolbar
        canvasConfig={canvasConfig}
        onConfigChange={handleConfigChange}
        activeTool={activeTool}
        onToolChange={setActiveTool}
      />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Block Palette */}
        <div className="w-48 border-r border-lxd-dark-border shrink-0">
          <BlockPalette onSelectBlock={handleAddBlock} />
        </div>

        {/* Canvas Area */}
        <div className="flex-1 overflow-auto bg-lxd-dark-bg p-4">
          <div
            className="relative mx-auto rounded-lg overflow-hidden"
            style={{
              width: canvasConfig.width * scale,
              height: canvasConfig.height * scale,
              backgroundColor: canvasConfig.backgroundColor,
              boxShadow: '0 0 40px rgba(0, 0, 0, 0.5)',
            }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={handleCanvasClick}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                handleCanvasClick();
              }
            }}
            role="application"
            aria-label="Course canvas"
          >
            {/* Grid Overlay */}
            <CanvasGrid
              canvasConfig={{
                ...canvasConfig,
                width: canvasConfig.width * scale,
                height: canvasConfig.height * scale,
              }}
            />

            {/* Blocks */}
            {blocks.map((block) => (
              <BlockItem
                key={block.id}
                block={block}
                isSelected={selectedBlockId === block.id}
                onSelect={() => handleBlockSelect(block.id)}
                onDoubleClick={() => handleBlockDoubleClick(block.id)}
                scale={scale}
              />
            ))}

            {/* Empty State */}
            {blocks.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Layers className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">Drag blocks here to start building</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">or press A to add a block</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Metrics */}
        <div className="w-56 border-l border-lxd-dark-border bg-lxd-dark-surface shrink-0 p-4 space-y-4">
          {/* Cognitive Load Meter */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium flex items-center gap-1">
                <Brain className="h-3 w-3 text-lxd-purple" />
                Cognitive Load
              </span>
              <Badge
                variant="outline"
                className={cn(
                  cognitiveLoad > 70
                    ? 'text-red-400'
                    : cognitiveLoad > 40
                      ? 'text-yellow-400'
                      : 'text-green-400',
                )}
              >
                {cognitiveLoad}%
              </Badge>
            </div>
            <div className="h-2 bg-lxd-dark-bg rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  cognitiveLoad > 70
                    ? 'bg-red-500'
                    : cognitiveLoad > 40
                      ? 'bg-yellow-500'
                      : 'bg-green-500',
                )}
                style={{ width: `${cognitiveLoad}%` }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground">
              {cognitiveLoad > 70
                ? 'High load - consider splitting content'
                : cognitiveLoad > 40
                  ? 'Moderate load - good balance'
                  : 'Low load - room for more content'}
            </p>
          </div>

          {/* Duration Estimate */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium flex items-center gap-1">
                <Clock className="h-3 w-3 text-lxd-cyan" />
                Est. Duration
              </span>
              <span className="text-sm font-bold text-lxd-cyan">
                {estimatedDurationMinutes} min
              </span>
            </div>
          </div>

          {/* Block Count */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium flex items-center gap-1">
                <Layers className="h-3 w-3" />
                Blocks
              </span>
              <span className="text-sm font-bold">{blocks.length}</span>
            </div>
          </div>

          {/* Selected Block Info */}
          {selectedBlockId && (
            <div className="pt-4 border-t border-lxd-dark-border space-y-2">
              <h4 className="text-xs font-medium">Selected Block</h4>
              {(() => {
                const block = blocks.find((b) => b.id === selectedBlockId);
                if (!block) return null;
                const blockType = getBlockTypeOption(block.type);
                return (
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{blockType?.name ?? block.type}</p>
                    <p className="text-xs text-muted-foreground">{blockType?.description}</p>
                    <div className="flex gap-1 flex-wrap mt-2">
                      <Badge variant="outline" className="text-[10px]">
                        {Math.round(block.position.width)} × {Math.round(block.position.height)}
                      </Badge>
                      {block.inspireMeta?.phase && (
                        <Badge variant="outline" className="text-[10px]">
                          {block.inspireMeta.phase}
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CourseCanvas;
