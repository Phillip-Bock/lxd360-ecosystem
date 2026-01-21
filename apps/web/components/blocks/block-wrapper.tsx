'use client';

/**
 * BlockWrapper - Shared wrapper for all content blocks
 * Provides selection, editing state, and drag handle
 */

import type { KeyboardEvent, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BlockWrapperProps {
  id: string;
  type: string;
  isSelected?: boolean;
  isEditing?: boolean;
  onClick?: () => void;
  onDoubleClick?: () => void;
  children: ReactNode;
  className?: string;
}

export function BlockWrapper({
  id,
  type,
  isSelected = false,
  isEditing = false,
  onClick,
  onDoubleClick,
  children,
  className,
}: BlockWrapperProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick?.();
    }
  };

  return (
    <article
      data-block-id={id}
      data-block-type={type}
      aria-label={`${type} block`}
      className={cn(
        'group relative rounded-lg transition-all duration-200',
        'border-2 border-transparent',
        isSelected && 'border-cyan-500 ring-2 ring-cyan-500/20',
        isEditing && 'border-purple-500 ring-2 ring-purple-500/20',
        !isSelected && !isEditing && 'hover:border-border',
        className,
      )}
    >
      {/* Block type label (shown on hover or selection) */}
      <div
        className={cn(
          'absolute -top-6 left-2 px-2 py-0.5 text-xs font-medium rounded',
          'bg-background/80 backdrop-blur-xs border border-border',
          'opacity-0 transition-opacity',
          (isSelected || isEditing) && 'opacity-100',
          'group-hover:opacity-100',
        )}
      >
        {type}
      </div>

      {/* Drag handle (shown on hover) */}
      <div
        className={cn(
          'absolute -left-8 top-1/2 -translate-y-1/2',
          'w-6 h-8 flex items-center justify-center',
          'rounded bg-background/80 backdrop-blur-xs border border-border',
          'opacity-0 cursor-grab transition-opacity',
          'group-hover:opacity-100',
          isSelected && 'opacity-100',
        )}
      >
        <svg
          className="w-4 h-4 text-muted-foreground"
          fill="currentColor"
          viewBox="0 0 20 20"
          role="img"
          aria-labelledby={`drag-handle-title-${id}`}
        >
          <title id={`drag-handle-title-${id}`}>Drag to reorder block</title>
          <path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
        </svg>
      </div>

      {/* Block content with interactive overlay */}
      <button
        type="button"
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        onKeyDown={handleKeyDown}
        aria-pressed={isSelected}
        className="w-full text-left p-4 bg-transparent border-none cursor-pointer"
      >
        {children}
      </button>
    </article>
  );
}
