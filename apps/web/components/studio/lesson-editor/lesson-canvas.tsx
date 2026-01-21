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
import { ChevronDown, Copy, GripVertical, Plus, Settings, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/** Block type definition */
export interface CanvasBlock {
  id: string;
  type: string;
  name: string;
  content: Record<string, unknown>;
  order: number;
}

interface LessonCanvasProps {
  blocks: CanvasBlock[];
  setBlocks: React.Dispatch<React.SetStateAction<CanvasBlock[]>>;
  selectedBlockId: string | null;
  setSelectedBlockId: React.Dispatch<React.SetStateAction<string | null>>;
}

/** Generate unique ID */
const generateId = () => `block-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

/**
 * SortableBlock - Wrapper for drag-and-drop blocks with accessibility
 */
function SortableBlock({
  block,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
}: {
  block: CanvasBlock;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative rounded-lg bg-(--inspire-canvas-bg) border border-(--navy-200) shadow-xs transition-all hover:shadow-sm list-none',
        isSelected && 'ring-2 ring-(--navy-500) ring-offset-2 border-(--navy-400)/30',
        isDragging && 'ring-2 ring-(--navy-500) shadow-lg',
      )}
    >
      {/* Selection button - provides keyboard accessible block selection */}
      <button
        type="button"
        onClick={onSelect}
        aria-label={`Select ${block.name} block`}
        className="absolute inset-0 z-0 w-full h-full bg-transparent border-none cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-(--navy-500) focus-visible:ring-inset rounded-lg"
      />
      {/* Block Toolbar */}
      <div
        className={cn(
          'absolute -top-3 left-4 z-10 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity',
          isSelected && 'opacity-100',
        )}
      >
        <div className="flex items-center gap-0.5 bg-(--inspire-canvas-bg) rounded-md border border-(--navy-200) shadow-xs px-1 py-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
          >
            <Copy className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <Settings className="h-3 w-3" />
          </Button>
          <div className="w-px h-4 bg-(--navy-200) mx-0.5" />
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-destructive hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Drag Handle - Accessible */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label={`Reorder ${block.name} block. Use arrow keys to move.`}
        aria-describedby="dnd-instructions"
        className={cn(
          'absolute left-0 top-0 bottom-0 w-8 z-10 flex items-center justify-center',
          'opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity',
          'cursor-grab active:cursor-grabbing bg-(--navy-100)/50 border-r border-(--navy-100)',
          'focus:outline-hidden focus-visible:ring-2 focus-visible:ring-(--navy-500) focus-visible:ring-inset rounded-l-lg',
        )}
      >
        <GripVertical className="h-4 w-4 text-(--navy-400)" />
      </button>

      {/* Block Content */}
      <div className="relative z-10 p-4 pl-10">
        <BlockRenderer block={block} />
      </div>

      {/* Block Type Label */}
      <div className="absolute top-2 right-2 z-10 text-xs text-(--navy-500) bg-(--navy-100)/50 border border-(--navy-200) px-2 py-0.5 rounded-md">
        {block.name}
      </div>
    </li>
  );
}

/**
 * LessonCanvas - Main canvas area for building lesson content
 * Uses @dnd-kit for accessible drag-and-drop
 */
export function LessonCanvas({
  blocks,
  setBlocks,
  selectedBlockId,
  setSelectedBlockId,
}: LessonCanvasProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  // Configure sensors for mouse/touch and keyboard
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

  // Accessibility announcements
  const announcements = {
    onDragStart({ active }: DragStartEvent) {
      const block = blocks.find((b) => b.id === active.id);
      return `Picked up ${block?.name || 'block'}. Use arrow keys to move, Space to drop, Escape to cancel.`;
    },
    onDragOver({ active, over }: DragOverEvent) {
      if (!over) return undefined;
      const activeBlock = blocks.find((b) => b.id === active.id);
      const overIndex = blocks.findIndex((b) => b.id === over.id);
      return `${activeBlock?.name || 'Block'} is over position ${overIndex + 1} of ${blocks.length}.`;
    },
    onDragEnd({ active, over }: DragEndEvent) {
      const activeBlock = blocks.find((b) => b.id === active.id);
      if (!over) {
        return `${activeBlock?.name || 'Block'} was dropped.`;
      }
      const overIndex = blocks.findIndex((b) => b.id === over.id);
      return `${activeBlock?.name || 'Block'} was placed at position ${overIndex + 1} of ${blocks.length}.`;
    },
    onDragCancel() {
      return `Dragging was cancelled.`;
    },
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveId(null);

    if (!over) return;

    if (active.id !== over.id) {
      setBlocks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const reordered = arrayMove(items, oldIndex, newIndex);
        return reordered.map((item, index) => ({ ...item, order: index }));
      });
    }
  };

  // Handle drop from sidebar (HTML5 drag for cross-component)
  const handleExternalDrop = (e: React.DragEvent, insertIndex?: number) => {
    e.preventDefault();

    const blockType = e.dataTransfer.getData('blockType');
    const blockName = e.dataTransfer.getData('blockName');

    if (!blockType) return;

    const newBlock: CanvasBlock = {
      id: generateId(),
      type: blockType,
      name: blockName || blockType,
      content: {},
      order: insertIndex ?? blocks.length,
    };

    if (insertIndex !== undefined) {
      setBlocks((prev) => {
        const updatedBlocks = [...prev];
        updatedBlocks.splice(insertIndex, 0, newBlock);
        return updatedBlocks.map((b, i) => ({ ...b, order: i }));
      });
    } else {
      setBlocks((prev) => [...prev, newBlock]);
    }

    setSelectedBlockId(newBlock.id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  // Block operations
  const deleteBlock = (id: string) => {
    setBlocks(blocks.filter((b) => b.id !== id).map((b, i) => ({ ...b, order: i })));
    if (selectedBlockId === id) setSelectedBlockId(null);
  };

  const duplicateBlock = (id: string) => {
    const block = blocks.find((b) => b.id === id);
    if (!block) return;

    const index = blocks.findIndex((b) => b.id === id);
    const newBlock: CanvasBlock = {
      ...block,
      id: generateId(),
      order: index + 1,
    };

    const updatedBlocks = [...blocks];
    updatedBlocks.splice(index + 1, 0, newBlock);
    setBlocks(updatedBlocks.map((b, i) => ({ ...b, order: i })));
  };

  const activeBlock = activeId ? blocks.find((b) => b.id === activeId) : null;

  return (
    <main className="flex-1 overflow-y-auto bg-(--navy-100)">
      {/* Infinite scroll container with generous bottom spacing */}
      <div className="max-w-4xl mx-auto p-8 pb-[50vh] min-h-full">
        {/* Screen reader instructions */}
        <div id="dnd-instructions" className="sr-only">
          Press Space or Enter to pick up a block. Use arrow keys to reorder. Press Space or Enter
          to drop, or Escape to cancel.
        </div>

        {/* Lesson Title Area */}
        <div className="mb-8 bg-(--inspire-canvas-bg) rounded-lg border border-(--navy-200) p-6 shadow-xs">
          <input
            type="text"
            placeholder="Lesson Title"
            className="w-full text-3xl font-bold bg-transparent border-none outline-hidden text-(--navy-800) placeholder:text-(--navy-400)"
          />
          <input
            type="text"
            placeholder="Add a brief description..."
            className="w-full mt-2 text-(--navy-500) bg-transparent border-none outline-hidden placeholder:text-(--navy-400)"
          />
        </div>

        {/* Canvas Drop Zone */}
        <section
          aria-label="Lesson content drop zone"
          onDrop={(e) => handleExternalDrop(e)}
          onDragOver={handleDragOver}
          className={cn(
            'min-h-100 rounded-lg transition-colors',
            blocks.length === 0 &&
              'border-2 border-dashed border-(--navy-300) bg-(--inspire-canvas-bg)',
          )}
        >
          {blocks.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center h-100 text-center">
              <div className="w-16 h-16 rounded-full bg-(--navy-100) flex items-center justify-center mb-4">
                <Plus className="h-8 w-8 text-(--navy-400)" />
              </div>
              <h3 className="text-lg font-medium text-(--navy-800) mb-2">
                Start Building Your Lesson
              </h3>
              <p className="text-(--navy-500) max-w-md">
                Drag content blocks from the sidebar or click the + button to add content. Blocks
                will stack vertically and can be reordered using drag-and-drop or keyboard.
              </p>
            </div>
          ) : (
            /* Blocks List with DnD */
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              accessibility={{
                announcements,
                screenReaderInstructions: {
                  draggable:
                    'To pick up a block, press Space or Enter. While dragging, use the arrow keys to move the block. Press Space or Enter again to drop the block, or press Escape to cancel.',
                },
              }}
            >
              <SortableContext
                items={blocks.map((b) => b.id)}
                strategy={verticalListSortingStrategy}
              >
                <ul className="space-y-2 list-none p-0 m-0" aria-label="Lesson content blocks">
                  {blocks.map((block) => (
                    <SortableBlock
                      key={block.id}
                      block={block}
                      isSelected={selectedBlockId === block.id}
                      onSelect={() => setSelectedBlockId(block.id)}
                      onDelete={() => deleteBlock(block.id)}
                      onDuplicate={() => duplicateBlock(block.id)}
                    />
                  ))}
                </ul>
              </SortableContext>

              {/* Drag Overlay */}
              <DragOverlay>
                {activeBlock ? (
                  <div className="rounded-sm border-2 border-(--navy-500) bg-(--inspire-canvas-bg) p-4 opacity-90">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-(--navy-400)" />
                      <span className="text-sm font-medium text-(--navy-800)">
                        {activeBlock.name}
                      </span>
                    </div>
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          )}

          {/* Add Block Button */}
          {blocks.length > 0 && (
            <button
              type="button"
              className={cn(
                'w-full py-6 mt-4 rounded-lg border-2 border-dashed border-(--navy-300)',
                'text-(--navy-400) hover:text-(--navy-600) hover:border-(--navy-400) hover:bg-(--inspire-canvas-bg)',
                'transition-all flex items-center justify-center gap-2',
                'focus:outline-hidden focus-visible:ring-2 focus-visible:ring-(--navy-500)',
              )}
            >
              <Plus className="h-5 w-5" />
              <span className="font-medium">Add Block</span>
            </button>
          )}
        </section>

        {/* Live region for announcements */}
        <div aria-live="polite" aria-atomic="true" className="sr-only" />
      </div>
    </main>
  );
}

// Block Renderer - renders different content based on block type
function BlockRenderer({ block }: { block: CanvasBlock }) {
  switch (block.type) {
    case 'paragraph':
      return (
        <textarea
          placeholder="Start typing your paragraph..."
          className="w-full min-h-20 bg-transparent border-none outline-hidden resize-none text-gray-900 placeholder:text-gray-400"
        />
      );

    case 'heading':
      return (
        <input
          type="text"
          placeholder="Heading text..."
          className="w-full text-2xl font-bold bg-transparent border-none outline-hidden text-gray-900 placeholder:text-gray-400"
        />
      );

    case 'quote':
      return (
        <div className="border-l-4 border-primary pl-4">
          <textarea
            placeholder="Enter quote text..."
            className="w-full min-h-15 bg-transparent border-none outline-hidden resize-none text-gray-900 italic placeholder:text-gray-400"
          />
          <input
            type="text"
            placeholder="— Attribution"
            className="w-full text-sm text-gray-500 bg-transparent border-none outline-hidden mt-2 placeholder:text-gray-400"
          />
        </div>
      );

    case 'image':
      return (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <div className="text-gray-500">
            <p>Drop an image or click to upload</p>
            <p className="text-xs mt-1">PNG, JPG, GIF, WebP • Max 10MB</p>
          </div>
        </div>
      );

    case 'video':
      return (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <div className="text-gray-500">
            <p>Add video URL or upload</p>
            <p className="text-xs mt-1">YouTube, Vimeo, or MP4/WebM file</p>
          </div>
        </div>
      );

    case 'multiple-choice':
    case 'true-false':
    case 'multiple-select':
      return (
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Enter your question..."
            className="w-full text-lg bg-transparent border-none outline-hidden text-gray-900 placeholder:text-gray-400"
          />
          <div className="space-y-2 pl-4">
            {['Option A', 'Option B', 'Option C', 'Option D'].map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  className={cn(
                    'w-5 h-5 rounded-full border-2 border-gray-400',
                    block.type === 'multiple-select' && 'rounded-xs',
                  )}
                />
                <input
                  type="text"
                  placeholder={opt}
                  className="flex-1 bg-transparent border-none outline-hidden text-gray-700 placeholder:text-gray-400"
                />
              </div>
            ))}
          </div>
        </div>
      );

    case 'accordion':
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg">
            <ChevronDown className="h-4 w-4 text-gray-600" />
            <input
              type="text"
              placeholder="Accordion title..."
              className="flex-1 bg-transparent border-none outline-hidden text-gray-900 placeholder:text-gray-400"
            />
          </div>
          <div className="pl-6 text-gray-500 text-sm">Accordion content goes here...</div>
        </div>
      );

    case 'callout':
      return (
        <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
          <textarea
            placeholder="Callout content..."
            className="w-full bg-transparent border-none outline-hidden resize-none text-gray-900 placeholder:text-gray-400"
          />
        </div>
      );

    case 'divider':
      return <hr className="border-gray-300" />;

    case 'spacer':
      return <div className="h-8" />;

    default:
      return (
        <div className="text-gray-500 text-center py-4">
          <p>{block.name} block</p>
          <p className="text-xs">Editor coming soon</p>
        </div>
      );
  }
}
