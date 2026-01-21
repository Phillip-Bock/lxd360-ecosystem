'use client';

import { Plus, Plus as PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { BlockRenderer } from '@/components/blocks/block-renderer';
import { cn } from '@/lib/utils';
import { useStudioStore } from '@/store/studio-store';
import type { BlockInstance } from '@/types/blocks';

export default function CourseCanvas() {
  const { blocks, selectedBlockId, selectBlock, addBlock, updateBlock } = useStudioStore();
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);

  const handleAddBlock = () => {
    // Add a paragraph block with default content from the registry
    addBlock('paragraph');
  };

  const handleBlockSelect = (blockId: string) => {
    selectBlock(blockId);
  };

  const handleStartEditing = (blockId: string) => {
    setEditingBlockId(blockId);
  };

  const handleStopEditing = () => {
    setEditingBlockId(null);
  };

  const handleContentChange = (blockId: string, content: BlockInstance['content']) => {
    // Update the block's content
    updateBlock(blockId, { content });
  };

  // Convert store blocks to BlockRenderer-compatible format
  const renderableBlocks: BlockInstance[] = blocks.map((block) => ({
    id: block.id,
    type: block.type as BlockInstance['type'],
    order: block.order,
    // Provide default timestamps for BlockRenderer compatibility
    createdAt: '',
    updatedAt: '',
    // Type cast for content/config compatibility
    content: block.content as BlockInstance['content'],
    config: block.config as BlockInstance['config'],
    parentId: block.parentId,
    className: block.className,
    style: block.style,
    duration: block.duration,
    cognitiveLoad: block.cognitiveLoad,
  }));

  return (
    <div className="flex flex-col items-center py-8 px-4">
      {/* Slide Container */}
      <div
        className={cn(
          'relative w-full max-w-4xl aspect-video rounded-lg',
          'bg-card border border-border shadow-lg',
          'flex flex-col',
        )}
      >
        {/* Slide Header */}
        <div className="absolute -top-8 left-0 text-sm text-muted-foreground">Slide 1 of 1</div>

        {/* Canvas Content */}
        <div className="flex-1 p-8 overflow-auto">
          {renderableBlocks.length === 0 ? (
            <EmptyCanvas onAddBlock={handleAddBlock} />
          ) : (
            <div className="space-y-4 pl-8">
              {renderableBlocks.map((block) => (
                <BlockRenderer
                  key={block.id}
                  block={block}
                  isSelected={selectedBlockId === block.id}
                  isEditing={editingBlockId === block.id}
                  onSelect={() => handleBlockSelect(block.id)}
                  onStartEditing={() => handleStartEditing(block.id)}
                  onStopEditing={handleStopEditing}
                  onContentChange={(content) => handleContentChange(block.id, content)}
                  onXAPIEvent={() => {
                    // xAPI events are handled by useXAPITracking hook in player context
                  }}
                />
              ))}

              {/* Add Block Button */}
              <button
                type="button"
                onClick={handleAddBlock}
                className="w-full py-3 rounded-lg border-2 border-dashed border-muted-foreground/25 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="h-5 w-5" />
                Add Block
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Slide Thumbnails (future) */}
      <div className="mt-6 flex gap-2">
        <div className="w-24 h-14 rounded border-2 border-primary bg-card" />
        <button
          type="button"
          className="w-24 h-14 rounded border-2 border-dashed border-muted-foreground/25 flex items-center justify-center hover:border-primary/50 transition-colors"
        >
          <PlusIcon className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}

function EmptyCanvas({ onAddBlock }: { onAddBlock: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <Plus className="h-8 w-8 text-primary" />
      </div>
      <h3 className="text-lg font-medium mb-2">Start Building Your Course</h3>
      <p className="text-muted-foreground mb-6 max-w-sm">
        Add content blocks from the INSERT tab or click below to add your first block.
      </p>
      <button
        type="button"
        onClick={onAddBlock}
        className="px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        Add First Block
      </button>
    </div>
  );
}
