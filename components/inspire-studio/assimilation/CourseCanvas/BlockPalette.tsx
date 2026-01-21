'use client';

import {
  AlignLeft,
  BarChart2,
  Box,
  ClipboardCheck,
  Compass,
  FileText,
  Folder,
  GitBranch,
  Hand,
  Heading,
  Headphones,
  Image,
  Layers,
  MessageCircle,
  Monitor,
  MousePointer,
  Move,
  RefreshCw,
  Users,
  Video,
} from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { BlockType } from '@/schemas/inspire';
import { BLOCK_CATEGORIES, BLOCK_TYPE_CATALOG, type BlockTypeOption } from './types';

// ============================================================================
// ICON MAPPING
// ============================================================================

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  'file-text': FileText,
  image: Image,
  'clipboard-check': ClipboardCheck,
  headphones: Headphones,
  video: Video,
  box: Box,
  users: Users,
  heading: Heading,
  'align-left': AlignLeft,
  'mouse-pointer': MousePointer,
  layers: Layers,
  folder: Folder,
  'refresh-cw': RefreshCw,
  move: Move,
  monitor: Monitor,
  'git-branch': GitBranch,
  compass: Compass,
  'message-circle': MessageCircle,
  'bar-chart-2': BarChart2,
  hand: Hand,
};

// ============================================================================
// COMPONENT
// ============================================================================

interface BlockPaletteProps {
  onSelectBlock: (blockType: BlockType) => void;
  className?: string;
}

/**
 * BlockPalette - Panel showing available block types for adding to canvas
 */
export function BlockPalette({ onSelectBlock, className }: BlockPaletteProps) {
  const [search, setSearch] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>('smart-suite');

  const filteredBlocks = BLOCK_TYPE_CATALOG.filter((block) =>
    block.name.toLowerCase().includes(search.toLowerCase()),
  );

  const groupedBlocks = BLOCK_CATEGORIES.map((category) => ({
    ...category,
    blocks: filteredBlocks.filter((block) => block.category === category.id),
  }));

  const handleDragStart = (e: React.DragEvent, block: BlockTypeOption) => {
    e.dataTransfer.setData('blockType', block.type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className={cn('flex flex-col h-full bg-lxd-dark-surface', className)}>
      {/* Header */}
      <div className="p-3 border-b border-lxd-dark-border">
        <h3 className="font-medium text-sm mb-2">Blocks</h3>
        <Input
          placeholder="Search blocks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 text-xs bg-lxd-dark-bg border-lxd-dark-border"
        />
      </div>

      {/* Block List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {groupedBlocks.map((category) => {
            if (category.blocks.length === 0) return null;

            const isExpanded = expandedCategory === category.id || search.length > 0;

            return (
              <div key={category.id} className="rounded-lg overflow-hidden">
                {/* Category Header */}
                <button
                  type="button"
                  onClick={() => setExpandedCategory(isExpanded && !search ? null : category.id)}
                  className={cn(
                    'w-full flex items-center justify-between px-2 py-1.5 text-xs font-medium',
                    'hover:bg-lxd-dark-bg/50 transition-colors rounded',
                    category.color,
                  )}
                >
                  <span>{category.name}</span>
                  <span className="text-muted-foreground">{category.blocks.length}</span>
                </button>

                {/* Block Items */}
                {isExpanded && (
                  <div className="grid grid-cols-2 gap-1 p-1">
                    {category.blocks.map((block) => {
                      const Icon = ICON_MAP[block.icon];

                      return (
                        <button
                          key={block.type}
                          type="button"
                          draggable
                          onDragStart={(e) => handleDragStart(e, block)}
                          onClick={() => onSelectBlock(block.type)}
                          className={cn(
                            'flex flex-col items-center gap-1 p-2 rounded-lg',
                            'bg-lxd-dark-bg/30 border border-transparent',
                            'hover:bg-lxd-dark-bg hover:border-lxd-purple/30',
                            'transition-all cursor-grab active:cursor-grabbing',
                            'group',
                          )}
                        >
                          <div
                            className={cn(
                              'w-8 h-8 rounded-lg flex items-center justify-center',
                              'bg-lxd-dark-surface border border-lxd-dark-border',
                              'group-hover:border-lxd-purple/50 transition-colors',
                            )}
                          >
                            {Icon && (
                              <Icon className="h-4 w-4 text-muted-foreground group-hover:text-lxd-purple" />
                            )}
                          </div>
                          <span className="text-[10px] text-center text-muted-foreground group-hover:text-foreground line-clamp-1">
                            {block.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Footer Tip */}
      <div className="p-2 border-t border-lxd-dark-border">
        <p className="text-[10px] text-muted-foreground text-center">
          Drag blocks to canvas or click to add
        </p>
      </div>
    </div>
  );
}
