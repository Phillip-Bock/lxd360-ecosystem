'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

export interface SortableWidgetWrapperProps {
  /** Unique identifier for the widget */
  id: string;
  /** Whether edit mode is active */
  isEditMode: boolean;
  /** Column span (1-4) */
  colSpan?: 1 | 2 | 3 | 4;
  /** Callback when remove button is clicked */
  onRemove?: () => void;
  /** Widget content */
  children: ReactNode;
  /** Additional class names */
  className?: string;
}

// ============================================================================
// COL SPAN CLASSES
// ============================================================================

const colSpanClasses: Record<number, string> = {
  1: 'lg:col-span-1',
  2: 'lg:col-span-2',
  3: 'lg:col-span-3',
  4: 'lg:col-span-4',
};

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Sortable Widget Wrapper
 *
 * Wraps dashboard widgets with drag-and-drop functionality using dnd-kit.
 * Shows drag handle and remove button when in edit mode.
 *
 * @example
 * ```tsx
 * <SortableWidgetWrapper id="skill-mastery" isEditMode={editMode} colSpan={2}>
 *   <SkillMasteryWidget skills={skills} />
 * </SortableWidgetWrapper>
 * ```
 */
export function SortableWidgetWrapper({
  id,
  isEditMode,
  colSpan = 2,
  onRemove,
  children,
  className,
}: SortableWidgetWrapperProps): React.JSX.Element {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative group',
        colSpanClasses[colSpan],
        isDragging && 'z-50 opacity-80',
        className,
      )}
    >
      {/* Edit mode overlay */}
      {isEditMode && (
        <div
          className={cn(
            'absolute inset-0 z-10 rounded-xl border-2 border-dashed transition-all duration-200',
            isDragging
              ? 'border-[var(--color-lxd-primary)] bg-[var(--color-lxd-primary)]/10'
              : 'border-transparent group-hover:border-[var(--color-lxd-primary)]/50',
          )}
        />
      )}

      {/* Drag handle - visible only in edit mode */}
      {isEditMode && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1">
          <button
            type="button"
            {...attributes}
            {...listeners}
            className={cn(
              'flex items-center justify-center px-3 py-1 rounded-full',
              'bg-[var(--color-lxd-primary)] text-white',
              'cursor-grab active:cursor-grabbing',
              'shadow-lg transition-transform hover:scale-105',
              'focus:outline-none focus:ring-2 focus:ring-[var(--color-lxd-primary)]/50',
            )}
            aria-label={`Drag to reorder ${id} widget`}
          >
            <GripVertical className="h-4 w-4" aria-hidden="true" />
            <span className="ml-1 text-xs font-medium">Drag</span>
          </button>
        </div>
      )}

      {/* Remove button - visible only in edit mode */}
      {isEditMode && onRemove && (
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'absolute -top-2 -right-2 z-20 h-6 w-6 rounded-full',
            'bg-destructive text-destructive-foreground',
            'opacity-0 group-hover:opacity-100 transition-opacity',
            'hover:bg-destructive/90',
          )}
          onClick={onRemove}
          aria-label={`Remove ${id} widget`}
        >
          <X className="h-3 w-3" aria-hidden="true" />
        </Button>
      )}

      {/* Widget content */}
      <div className={cn(isDragging && 'pointer-events-none')}>{children}</div>
    </div>
  );
}

// ============================================================================
// DRAG OVERLAY COMPONENT
// ============================================================================

export interface WidgetDragOverlayProps {
  /** Widget being dragged */
  children: ReactNode;
}

/**
 * Widget Drag Overlay
 *
 * Shows a preview of the widget being dragged.
 * Used with DndContext's DragOverlay component.
 */
export function WidgetDragOverlay({ children }: WidgetDragOverlayProps): React.JSX.Element {
  return (
    <div
      className={cn(
        'rounded-xl shadow-2xl',
        'ring-2 ring-[var(--color-lxd-primary)]',
        'transform scale-105',
        'opacity-90',
      )}
    >
      {children}
    </div>
  );
}

export default SortableWidgetWrapper;
