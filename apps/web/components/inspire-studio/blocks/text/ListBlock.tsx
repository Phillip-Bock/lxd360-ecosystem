'use client';

import { CheckSquare, GripVertical, List, ListOrdered, Plus, Trash2 } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import type { ListBlockContent, ListItem } from '@/types/blocks';
import type { BlockComponentProps } from '../BlockRenderer';

const LIST_TYPES = {
  bullet: { icon: List, label: 'Bullet' },
  numbered: { icon: ListOrdered, label: 'Numbered' },
  checklist: { icon: CheckSquare, label: 'Checklist' },
};

/**
 * ListBlock - Bullet, numbered, and checklist
 */
export function ListBlock({ block, isEditing, onUpdate }: BlockComponentProps<ListBlockContent>) {
  const content = block.content as ListBlockContent;
  const [, setEditingItem] = useState<string | null>(null);

  const listType = content.type || 'bullet';
  // Wrapped in useMemo to maintain stable reference
  const items = useMemo(() => content.items || [], [content.items]);

  // Generate unique ID - wrapped in useCallback to prevent recreation on every render
  const generateId = useCallback(
    () => `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    [],
  );

  // Add new item
  const addItem = useCallback(
    (parentId?: string, index?: number) => {
      const newItem: ListItem = {
        id: generateId(),
        text: '',
      };

      let newItems: ListItem[];

      if (parentId) {
        // Add as child
        newItems = items.map((item: ListItem) => {
          if (item.id === parentId) {
            return {
              ...item,
              children: [...(item.children || []), newItem],
            };
          }
          return item;
        });
      } else {
        // Add at root level
        newItems = [...items];
        if (index !== undefined) {
          newItems.splice(index + 1, 0, newItem);
        } else {
          newItems.push(newItem);
        }
      }

      onUpdate({ content: { ...content, items: newItems } });
      if (newItem.id) {
        setEditingItem(newItem.id);
      }
    },
    [content, items, onUpdate, generateId],
  );

  // Update item text
  const updateItem = useCallback(
    (itemId: string, updates: Partial<ListItem>) => {
      const updateRecursive = (items: ListItem[]): ListItem[] => {
        return items.map((item) => {
          if (item.id === itemId) {
            return { ...item, ...updates };
          }
          if (item.children) {
            return { ...item, children: updateRecursive(item.children) };
          }
          return item;
        });
      };

      onUpdate({ content: { ...content, items: updateRecursive(items) } });
    },
    [content, items, onUpdate],
  );

  // Delete item
  const deleteItem = useCallback(
    (itemId: string) => {
      const deleteRecursive = (items: ListItem[]): ListItem[] => {
        return items
          .filter((item) => item.id !== itemId)
          .map((item) => {
            if (item.children) {
              return { ...item, children: deleteRecursive(item.children) };
            }
            return item;
          });
      };

      onUpdate({ content: { ...content, items: deleteRecursive(items) } });
    },
    [content, items, onUpdate],
  );

  // Toggle checkbox
  const toggleCheck = useCallback(
    (itemId: string) => {
      updateItem(itemId, { checked: !items.find((i: ListItem) => i.id === itemId)?.checked });
    },
    [items, updateItem],
  );

  // Render list item
  const renderItem = (item: ListItem, index: number, depth: number = 0) => {
    return (
      <li
        key={item.id}
        className={`
          group relative
          ${listType === 'checklist' ? 'list-none' : ''}
          ${depth > 0 ? 'ml-6' : ''}
        `}
      >
        <div className="flex items-start gap-2 py-1">
          {/* Drag handle (edit mode) */}
          {isEditing && (
            <button
              type="button"
              aria-label="Drag to reorder item"
              className="opacity-0 group-hover:opacity-100 p-0.5 text-studio-text-muted hover:text-brand-primary cursor-grab transition-opacity"
            >
              <GripVertical className="w-4 h-4" aria-hidden="true" />
            </button>
          )}

          {/* Checkbox for checklist */}
          {listType === 'checklist' && (
            <button
              type="button"
              onClick={() => item.id && toggleCheck(item.id)}
              aria-label={
                item.checked
                  ? `Uncheck ${item.text || 'list item'}`
                  : `Check ${item.text || 'list item'}`
              }
              aria-pressed={item.checked}
              className={`
                shrink-0 w-5 h-5 mt-0.5 rounded border-2 transition-colors
                ${
                  item.checked
                    ? 'bg-studio-accent border-studio-accent text-brand-primary'
                    : 'border-studio-text-muted hover:border-studio-accent'
                }
              `}
            >
              {item.checked && (
                <svg
                  className="w-full h-full"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  aria-hidden="true"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          )}

          {/* Item text */}
          {isEditing ? (
            <input
              type="text"
              value={item.text}
              onChange={(e) => item.id && updateItem(item.id, { text: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  addItem(undefined, index);
                } else if (e.key === 'Backspace' && item.text === '' && item.id) {
                  e.preventDefault();
                  deleteItem(item.id);
                } else if (e.key === 'Tab') {
                  e.preventDefault();
                  // TODO(LXD-301): Indent/outdent
                }
              }}
              onBlur={() => setEditingItem(null)}
              className={`
                flex-1 bg-transparent outline-hidden text-studio-text
                ${item.checked ? 'line-through text-studio-text-muted' : ''}
              `}
              placeholder="List item..."
              aria-label={`List item ${index + 1}`}
            />
          ) : (
            <button
              type="button"
              className={`
                flex-1 text-left text-studio-text cursor-text bg-transparent border-none p-0
                ${item.checked ? 'line-through text-studio-text-muted' : ''}
              `}
              onClick={() => isEditing && item.id && setEditingItem(item.id)}
              aria-label={`Edit ${item.text || 'list item'}`}
            >
              {item.text || 'List item'}
            </button>
          )}

          {/* Delete button (edit mode) */}
          {isEditing && item.id && (
            <button
              type="button"
              onClick={() => deleteItem(item.id as string)}
              aria-label={`Delete ${item.text || 'list item'}`}
              className="opacity-0 group-hover:opacity-100 p-0.5 text-studio-text-muted hover:text-brand-error transition-opacity"
            >
              <Trash2 className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Nested items */}
        {item.children && item.children.length > 0 && (
          <ul
            className={
              listType === 'numbered' ? 'list-decimal' : listType === 'bullet' ? 'list-disc' : ''
            }
          >
            {item.children.map((child, childIndex) => renderItem(child, childIndex, depth + 1))}
          </ul>
        )}
      </li>
    );
  };

  // Preview mode
  if (!isEditing) {
    const ListTag = listType === 'numbered' ? 'ol' : 'ul';

    return (
      <ListTag
        className={`
          ${listType === 'numbered' ? 'list-decimal' : listType === 'bullet' ? 'list-disc' : ''}
          ${listType !== 'checklist' ? 'pl-6' : ''}
          space-y-1
        `}
        start={content.startNumber}
      >
        {items.map((item: ListItem, index: number) => renderItem(item, index))}
      </ListTag>
    );
  }

  return (
    <div className="space-y-3">
      {/* List type selector */}
      <fieldset className="flex gap-1 border-none p-0 m-0">
        <legend className="sr-only">List type</legend>
        {(Object.keys(LIST_TYPES) as Array<keyof typeof LIST_TYPES>).map((type) => {
          const config = LIST_TYPES[type];
          return (
            <button
              type="button"
              key={type}
              onClick={() => onUpdate({ content: { ...content, type } })}
              aria-pressed={listType === type}
              className={`
                flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-lg transition-colors
                ${
                  listType === type
                    ? 'bg-studio-accent text-brand-primary'
                    : 'bg-studio-surface/30 text-studio-text-muted hover:text-brand-primary'
                }
              `}
            >
              <config.icon className="w-3.5 h-3.5" aria-hidden="true" />
              {config.label}
            </button>
          );
        })}
      </fieldset>

      {/* List items */}
      <div
        className={`
          ${listType === 'numbered' ? 'list-decimal' : listType === 'bullet' ? 'list-disc' : ''}
          ${listType !== 'checklist' ? 'pl-6' : ''}
        `}
      >
        {items.map((item: ListItem, index: number) => renderItem(item, index))}
      </div>

      {/* Add item button */}
      <button
        type="button"
        onClick={() => addItem()}
        className="flex items-center gap-2 px-3 py-2 text-sm text-studio-text-muted hover:text-studio-accent hover:bg-studio-surface/30 rounded-lg transition-colors"
      >
        <Plus className="w-4 h-4" aria-hidden="true" />
        Add item
      </button>
    </div>
  );
}

export default ListBlock;
