'use client';

/**
 * ListBlock - Bulleted, numbered, or checklist
 */

import { type KeyboardEvent, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import type { ListConfig, ListContent, ListItem } from '@/types/blocks';
import { BlockWrapper } from '../block-wrapper';

interface ListBlockProps {
  id: string;
  content: ListContent;
  config: ListConfig;
  isSelected?: boolean;
  isEditing?: boolean;
  onSelect?: () => void;
  onContentChange?: (content: ListContent) => void;
  onStartEditing?: () => void;
  onStopEditing?: () => void;
}

export function ListBlock({
  id,
  content,
  config,
  isSelected = false,
  isEditing = false,
  onSelect,
  onContentChange,
  onStartEditing,
  onStopEditing,
}: ListBlockProps) {
  const [items, setItems] = useState<ListItem[]>(content.items);

  useEffect(() => {
    // Use setTimeout to avoid sync setState in effect (React 19 pattern)
    const timeout = setTimeout(() => {
      setItems(content.items);
    }, 0);
    return () => clearTimeout(timeout);
  }, [content.items]);

  const handleItemChange = (index: number, text: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], text };
    setItems(newItems);
  };

  const handleCheckChange = (index: number) => {
    if (config.interactive && content.listType === 'check') {
      const newItems = [...items];
      newItems[index] = { ...newItems[index], checked: !newItems[index].checked };
      setItems(newItems);
      onContentChange?.({ ...content, items: newItems });
    }
  };

  const handleKeyDown = (e: KeyboardEvent, index: number) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const newItems = [...items];
      newItems.splice(index + 1, 0, { text: '' });
      setItems(newItems);
    } else if (e.key === 'Backspace' && items[index].text === '' && items.length > 1) {
      e.preventDefault();
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onStopEditing?.();
    }
  };

  const handleBlur = () => {
    if (JSON.stringify(items) !== JSON.stringify(content.items)) {
      onContentChange?.({ ...content, items });
    }
  };

  const spacingClasses = {
    compact: 'space-y-1',
    normal: 'space-y-2',
    relaxed: 'space-y-3',
  };

  const ListTag = content.listType === 'number' ? 'ol' : 'ul';

  const markerClasses = {
    disc: 'list-disc',
    circle: 'list-[circle]',
    square: 'list-[square]',
    decimal: 'list-decimal',
    alpha: 'list-[lower-alpha]',
    roman: 'list-[lower-roman]',
  };

  return (
    <BlockWrapper
      id={id}
      type="List"
      isSelected={isSelected}
      isEditing={isEditing}
      onClick={onSelect}
      onDoubleClick={onStartEditing}
    >
      <ListTag
        className={cn(
          'pl-6',
          spacingClasses[config.spacing || 'normal'],
          content.listType !== 'check' && markerClasses[config.markerStyle || 'disc'],
        )}
      >
        {items.map((item, index) => (
          <li
            key={index}
            className={cn(
              'text-foreground',
              content.listType === 'check' && 'list-none flex items-start gap-2 -ml-6',
              config.animate && 'animate-fade-in',
              item.checked && 'text-muted-foreground line-through',
            )}
          >
            {content.listType === 'check' && (
              <input
                type="checkbox"
                checked={item.checked || false}
                onChange={() => handleCheckChange(index)}
                disabled={!config.interactive}
                className={cn(
                  'mt-1 h-4 w-4 rounded border-border',
                  'checked:bg-cyan-500 checked:border-cyan-500',
                  config.interactive && 'cursor-pointer',
                )}
              />
            )}
            {isEditing ? (
              <input
                type="text"
                value={item.text}
                onChange={(e) => handleItemChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onBlur={handleBlur}
                placeholder="List item..."
                className={cn(
                  'flex-1 bg-transparent outline-hidden',
                  'border-b border-transparent focus:border-cyan-500',
                )}
              />
            ) : (
              <span>{item.text || 'Empty item'}</span>
            )}
          </li>
        ))}
      </ListTag>

      {/* Add item button when editing */}
      {isEditing && (
        <button
          type="button"
          onClick={() => setItems([...items, { text: '' }])}
          className="mt-2 text-sm text-cyan-500 hover:text-cyan-400 flex items-center gap-1"
        >
          <svg
            aria-hidden="true"
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add item
        </button>
      )}
    </BlockWrapper>
  );
}
