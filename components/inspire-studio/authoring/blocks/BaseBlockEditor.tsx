import { Copy, Eye, EyeOff, GripVertical, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { ContentBlock } from '@/lib/inspire-studio/types/contentBlocks';

export interface BaseBlockEditorProps {
  block: ContentBlock;
  onUpdate: (block: ContentBlock) => void;
  onDelete: (blockId: string) => void;
  onDuplicate: (blockId: string) => void;
  children?: React.ReactNode;
  isSelected?: boolean;
  onSelect?: (blockId: string) => void;
}

export const BaseBlockEditor = ({
  block,
  onDelete,
  onDuplicate,
  children,
  isSelected = false,
  onSelect,
}: BaseBlockEditorProps): React.JSX.Element => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e: React.DragEvent): void => {
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('blockId', block.id);
  };

  const handleDragEnd = (): void => {
    setIsDragging(false);
  };

  const handleClick = (_e: React.MouseEvent | React.KeyboardEvent): void => {
    void _e;
    if (onSelect) {
      onSelect(block.id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(e);
    }
  };

  return (
    <div
      className={`group relative bg-brand-surface border-2 rounded-lg transition-all ${
        isDragging
          ? 'border-brand-primary opacity-50'
          : isSelected
            ? 'border-brand-primary shadow-lg'
            : 'border-brand-default hover:border-brand-strong'
      }`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      role="option"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onClick={handleClick}
      aria-selected={isSelected}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-brand-default bg-brand-page">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="cursor-grab active:cursor-grabbing text-brand-muted hover:text-brand-secondary"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <GripVertical className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            className="text-sm font-semibold text-brand-secondary capitalize bg-transparent border-none cursor-pointer"
          >
            {block.type.replace('_', ' ')}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="p-1.5 text-brand-muted hover:text-brand-secondary hover:bg-gray-200 rounded transition-colors"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate(block.id);
            }}
            className="p-1.5 text-brand-muted hover:text-brand-blue hover:bg-blue-50 rounded transition-colors"
            title="Duplicate"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(block.id);
            }}
            className="p-1.5 text-brand-muted hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      {isExpanded && <div className="p-4">{children}</div>}
    </div>
  );
};
