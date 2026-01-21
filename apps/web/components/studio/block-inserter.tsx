'use client';

/**
 * BlockInserter - Block palette for INSERT ribbon tab
 * Displays available blocks grouped by category
 */

import {
  AlignLeft,
  ChevronDown,
  HelpCircle,
  Image,
  LayoutGrid,
  List,
  MessageSquareText,
  PlayCircle,
  RefreshCcw,
  SquarePen,
} from 'lucide-react';
import { useState } from 'react';
import { BLOCK_ICONS, blockRegistry } from '@/lib/block-registry';
import { cn } from '@/lib/utils';
import type { BlockDefinition, StarterBlockType } from '@/types/blocks';

// Use BlockDefinition's category type for correct type checking
type BlockCategoryType = BlockDefinition['category'];

interface BlockInserterProps {
  onInsert: (type: StarterBlockType) => void;
  disabled?: boolean;
}

// Map icon names to actual components
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Bars3BottomLeftIcon: AlignLeft,
  PhotoIcon: Image,
  PlayCircleIcon: PlayCircle,
  ChatBubbleBottomCenterTextIcon: MessageSquareText,
  ListBulletIcon: List,
  QuestionMarkCircleIcon: HelpCircle,
  PencilSquareIcon: SquarePen,
  ChevronDownIcon: ChevronDown,
  RectangleGroupIcon: LayoutGrid,
  ArrowPathRoundedSquareIcon: RefreshCcw,
};

// Category display order and metadata
const CATEGORIES: Array<{
  id: BlockCategoryType;
  label: string;
  description: string;
}> = [
  { id: 'text', label: 'Text', description: 'Text content blocks' },
  { id: 'media', label: 'Media', description: 'Images, video, and audio' },
  { id: 'assessment', label: 'Assessment', description: 'Questions and quizzes' },
  { id: 'interactive', label: 'Interactive', description: 'Engaging interactions' },
];

export function BlockInserter({ onInsert, disabled = false }: BlockInserterProps) {
  const [hoveredBlock, setHoveredBlock] = useState<StarterBlockType | null>(null);

  // Group blocks by category
  const blocksByCategory = CATEGORIES.map((cat) => ({
    ...cat,
    blocks: blockRegistry.getByCategory(cat.id),
  }));

  return (
    <div className="flex gap-6 p-2">
      {blocksByCategory.map((category) => (
        <div key={category.id} className="space-y-2">
          {/* Category header */}
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">
            {category.label}
          </div>

          {/* Block buttons */}
          <div className="flex flex-wrap gap-1">
            {category.blocks.map((block) => {
              const IconComponent = ICON_MAP[BLOCK_ICONS[block.type as StarterBlockType]];
              const isHovered = hoveredBlock === block.type;

              return (
                <button
                  type="button"
                  key={block.type}
                  onClick={() => onInsert(block.type as StarterBlockType)}
                  onMouseEnter={() => setHoveredBlock(block.type as StarterBlockType)}
                  onMouseLeave={() => setHoveredBlock(null)}
                  disabled={disabled}
                  title={block.description}
                  className={cn(
                    'flex flex-col items-center gap-1 p-2 rounded-lg transition-all',
                    'min-w-16 border border-transparent',
                    'hover:bg-card hover:border-border',
                    isHovered && 'bg-card border-cyan-500/50',
                    disabled && 'opacity-50 cursor-not-allowed',
                  )}
                >
                  {IconComponent && (
                    <IconComponent
                      className={cn(
                        'w-6 h-6 transition-colors',
                        isHovered ? 'text-cyan-500' : 'text-muted-foreground',
                      )}
                    />
                  )}
                  <span className="text-xs text-foreground">{block.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
