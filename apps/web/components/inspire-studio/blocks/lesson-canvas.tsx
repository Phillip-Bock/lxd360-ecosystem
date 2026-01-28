'use client';

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  type UniqueIdentifier,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  Copy,
  Eye,
  EyeOff,
  GripVertical,
  Plus,
  Settings,
  Trash2,
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { ContentBlockDefinition } from '@/lib/features/inspire-studio/config/authoringBlocks';
import { cn } from '@/lib/utils';

// =============================================================================
// TYPES
// =============================================================================

export interface CanvasBlock {
  id: string;
  type: string;
  blockDefinition: ContentBlockDefinition;
  content: Record<string, unknown>;
  styles: {
    padding?: string;
    margin?: string;
    background?: string;
    borderRadius?: string;
    shadow?: string;
    animation?: string;
  };
  inspire: {
    phase: string;
    cognitiveLoad: 'low' | 'medium' | 'high';
    estimatedTime: number;
    accessibilityScore: number;
  };
  meta: {
    createdAt: string;
    updatedAt: string;
  };
  isVisible?: boolean;
}

export interface LessonCanvasProps {
  blocks: CanvasBlock[];
  onBlocksChange: (blocks: CanvasBlock[]) => void;
  selectedBlockId?: string | null;
  onSelectBlock?: (id: string | null) => void;
  onBlockSettings?: (block: CanvasBlock) => void;
  onBlockDelete?: (id: string) => void;
  onBlockDuplicate?: (id: string) => void;
  currentPhase?: string;
  className?: string;
  readOnly?: boolean;
}

interface SortableBlockProps {
  block: CanvasBlock;
  isSelected: boolean;
  onSelect: () => void;
  onSettings: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onToggleVisibility: () => void;
  isFirst: boolean;
  isLast: boolean;
  readOnly?: boolean;
}

// =============================================================================
// SORTABLE BLOCK COMPONENT
// =============================================================================

function SortableBlock({
  block,
  isSelected,
  onSelect,
  onSettings,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onToggleVisibility,
  isFirst,
  isLast,
  readOnly,
}: SortableBlockProps): React.JSX.Element {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const phaseColors: Record<string, string> = {
    ignite: '#f97316',
    navigate: 'var(--info)',
    scaffold: '#a855f7',
    practice: 'var(--success)',
    integrate: '#06b6d4',
    reflect: '#ec4899',
    extend: 'var(--warning)',
  };

  const phaseColor = phaseColors[block.inspire.phase] || '#888';

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className={cn('group relative', isDragging && 'z-50 opacity-90')}
      onClick={onSelect}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      {/* Block Container */}
      <div
        className={cn(
          'relative rounded-lg border transition-all',
          'bg-studio-surface/50 border-studio-border/50',
          isSelected && 'ring-2 ring-studio-accent border-studio-accent',
          !block.isVisible && 'opacity-50',
          isDragging && 'shadow-2xl',
        )}
      >
        {/* Phase Indicator */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg"
          style={{ backgroundColor: phaseColor }}
        />

        {/* Block Toolbar (visible on hover/selection) */}
        <div
          className={cn(
            'absolute -top-8 left-0 right-0 flex items-center justify-between px-2',
            'opacity-0 group-hover:opacity-100 transition-opacity',
            isSelected && 'opacity-100',
          )}
        >
          {/* Left: Block Type Info */}
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-medium px-2 py-0.5 rounded"
              style={{ backgroundColor: `${phaseColor}20`, color: phaseColor }}
            >
              {block.blockDefinition.name}
            </span>
            <span className="text-[10px] text-muted-foreground">
              ~{Math.round(block.inspire.estimatedTime / 60)}min
            </span>
          </div>

          {/* Right: Actions */}
          {!readOnly && (
            <div className="flex items-center gap-1">
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleVisibility();
                      }}
                    >
                      {block.isVisible !== false ? (
                        <Eye className="w-3.5 h-3.5" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Toggle visibility</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveUp();
                      }}
                      disabled={isFirst}
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Move up</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveDown();
                      }}
                      disabled={isLast}
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Move down</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicate();
                      }}
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Duplicate</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSettings();
                      }}
                    >
                      <Settings className="w-3.5 h-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Settings</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Delete</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>

        {/* Block Content */}
        <div className="flex items-stretch">
          {/* Drag Handle */}
          {!readOnly && (
            <div
              {...attributes}
              {...listeners}
              className={cn(
                'flex items-center justify-center w-8 cursor-grab active:cursor-grabbing',
                'text-muted-foreground hover:text-foreground transition-colors',
                'border-r border-studio-border/30',
              )}
            >
              <GripVertical className="w-4 h-4" />
            </div>
          )}

          {/* Content Area */}
          <div className="flex-1 p-4">
            {/* Placeholder content - would be replaced with actual block renderer */}
            <div className="min-h-[60px] flex items-center justify-center text-muted-foreground text-sm">
              <span>{block.blockDefinition.name} Content</span>
            </div>
          </div>
        </div>

        {/* Cognitive Load Indicator */}
        <div className="absolute bottom-2 right-2">
          <div
            className={cn(
              'text-[10px] px-1.5 py-0.5 rounded',
              block.inspire.cognitiveLoad === 'low' && 'bg-green-500/20 text-green-500',
              block.inspire.cognitiveLoad === 'medium' && 'bg-amber-500/20 text-amber-500',
              block.inspire.cognitiveLoad === 'high' && 'bg-red-500/20 text-red-500',
            )}
          >
            {block.inspire.cognitiveLoad} load
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// =============================================================================
// DROP ZONE COMPONENT
// =============================================================================

interface DropZoneProps {
  onDrop: () => void;
  isOver?: boolean;
}

function DropZone({ onDrop, isOver }: DropZoneProps): React.JSX.Element {
  return (
    <motion.div
      className={cn(
        'relative h-16 mx-4 my-2 rounded-lg border-2 border-dashed',
        'flex items-center justify-center transition-all',
        isOver
          ? 'border-studio-accent bg-studio-accent/10'
          : 'border-studio-border/50 bg-transparent hover:border-studio-border',
      )}
      onClick={onDrop}
      whileHover={{ scale: 1.01 }}
    >
      <div className="flex items-center gap-2 text-muted-foreground">
        <Plus className="w-4 h-4" />
        <span className="text-sm">Add block here</span>
      </div>
    </motion.div>
  );
}

// =============================================================================
// LESSON CANVAS
// =============================================================================

export function LessonCanvas({
  blocks,
  onBlocksChange,
  selectedBlockId,
  onSelectBlock,
  onBlockSettings,
  onBlockDelete,
  onBlockDuplicate,
  currentPhase = 'scaffold',
  className,
  readOnly = false,
}: LessonCanvasProps) {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [overId, setOverId] = useState<UniqueIdentifier | null>(null);

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Active block for drag overlay
  const activeBlock = useMemo(() => {
    if (!activeId) return null;
    return blocks.find((block) => block.id === activeId);
  }, [activeId, blocks]);

  // Handlers
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id);
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    setOverId(event.over?.id || null);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      setActiveId(null);
      setOverId(null);

      if (!over) return;

      // Handle drop from palette
      if (String(active.id).startsWith('palette-')) {
        const blockData = active.data.current?.block as ContentBlockDefinition;
        if (blockData) {
          const newBlock: CanvasBlock = {
            id: `block-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
            type: blockData.id,
            blockDefinition: blockData,
            content: {},
            styles: {},
            inspire: {
              phase: currentPhase,
              cognitiveLoad: blockData.cognitiveLoad,
              estimatedTime: blockData.estimatedTime,
              accessibilityScore: blockData.accessibilityScore,
            },
            meta: {
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            isVisible: true,
          };

          const overIndex = blocks.findIndex((b) => b.id === over.id);
          const newBlocks = [...blocks];
          if (overIndex >= 0) {
            newBlocks.splice(overIndex, 0, newBlock);
          } else {
            newBlocks.push(newBlock);
          }
          onBlocksChange(newBlocks);
        }
        return;
      }

      // Handle reorder within canvas
      if (active.id !== over.id) {
        const oldIndex = blocks.findIndex((b) => b.id === active.id);
        const newIndex = blocks.findIndex((b) => b.id === over.id);

        if (oldIndex !== -1 && newIndex !== -1) {
          onBlocksChange(arrayMove(blocks, oldIndex, newIndex));
        }
      }
    },
    [blocks, currentPhase, onBlocksChange],
  );

  const handleMoveBlock = useCallback(
    (id: string, direction: 'up' | 'down') => {
      const index = blocks.findIndex((b) => b.id === id);
      if (index === -1) return;

      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= blocks.length) return;

      onBlocksChange(arrayMove(blocks, index, newIndex));
    },
    [blocks, onBlocksChange],
  );

  const handleToggleVisibility = useCallback(
    (id: string) => {
      onBlocksChange(
        blocks.map((block) =>
          block.id === id ? { ...block, isVisible: block.isVisible === false } : block,
        ),
      );
    },
    [blocks, onBlocksChange],
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className={cn('flex-1 overflow-auto bg-studio-bg', className)}>
        <div className="max-w-4xl mx-auto py-8 px-4">
          {/* Empty State */}
          {blocks.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-16 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-studio-surface flex items-center justify-center mb-4">
                <Plus className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                Start Building Your Lesson
              </h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Drag content blocks from the palette on the left, or click the Insert button in the
                ribbon to add your first block.
              </p>
            </motion.div>
          )}

          {/* Blocks List */}
          <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {blocks.map((block, index) => (
                  <SortableBlock
                    key={block.id}
                    block={block}
                    isSelected={selectedBlockId === block.id}
                    onSelect={() => onSelectBlock?.(block.id)}
                    onSettings={() => onBlockSettings?.(block)}
                    onDelete={() => onBlockDelete?.(block.id)}
                    onDuplicate={() => onBlockDuplicate?.(block.id)}
                    onMoveUp={() => handleMoveBlock(block.id, 'up')}
                    onMoveDown={() => handleMoveBlock(block.id, 'down')}
                    onToggleVisibility={() => handleToggleVisibility(block.id)}
                    isFirst={index === 0}
                    isLast={index === blocks.length - 1}
                    readOnly={readOnly}
                  />
                ))}
              </AnimatePresence>
            </div>
          </SortableContext>

          {/* Add Block Drop Zone */}
          {blocks.length > 0 && !readOnly && (
            <DropZone onDrop={() => {}} isOver={overId === 'canvas-end'} />
          )}
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeBlock && (
          <div className="opacity-80 shadow-2xl">
            <div className="bg-studio-surface border border-studio-accent rounded-lg p-4">
              <span className="text-sm font-medium">{activeBlock.blockDefinition.name}</span>
            </div>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

// Types are exported from interface declarations above
