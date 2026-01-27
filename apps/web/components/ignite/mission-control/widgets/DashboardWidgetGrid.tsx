'use client';

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { motion } from 'framer-motion';
import { GripVertical, RotateCcw, Settings2 } from 'lucide-react';
import { type ReactNode, useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import type { Persona } from '@/lib/rbac/personas';
import { cn } from '@/lib/utils';
import {
  useDashboardLayoutStore,
  type WidgetConfig,
} from '@/store/inspire/useDashboardLayoutStore';
import { SortableWidgetWrapper, WidgetDragOverlay } from './SortableWidgetWrapper';

// ============================================================================
// TYPES
// ============================================================================

export interface WidgetDefinition {
  id: string;
  label: string;
  component: ReactNode;
  defaultColSpan: 1 | 2 | 3 | 4;
}

export interface DashboardWidgetGridProps {
  /** Current user persona */
  persona: Persona;
  /** Widget definitions (id -> component mapping) */
  widgets: Record<string, WidgetDefinition>;
  /** Additional class names */
  className?: string;
}

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Dashboard Widget Grid
 *
 * A draggable, reorderable grid of dashboard widgets.
 * Supports edit mode for customization with persistent layout storage.
 *
 * Features:
 * - Drag-and-drop reordering via dnd-kit
 * - Edit mode toggle for customization
 * - Reset to defaults
 * - Persisted layout via Zustand + localStorage
 * - Animated transitions with Framer Motion
 * - Keyboard accessible dragging
 *
 * @example
 * ```tsx
 * <DashboardWidgetGrid
 *   persona="learner"
 *   widgets={{
 *     'skill-mastery': {
 *       id: 'skill-mastery',
 *       label: 'Skill Mastery',
 *       component: <SkillMasteryWidget />,
 *       defaultColSpan: 2,
 *     },
 *   }}
 * />
 * ```
 */
export function DashboardWidgetGrid({
  persona,
  widgets,
  className,
}: DashboardWidgetGridProps): React.JSX.Element {
  const [activeId, setActiveId] = useState<string | null>(null);

  const {
    editMode,
    setEditMode,
    reorderWidgets,
    toggleWidgetVisibility,
    resetToDefaults,
    getVisibleWidgets,
  } = useDashboardLayoutStore();

  const visibleWidgets = getVisibleWidgets(persona);

  // Configure sensors for drag
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before starting drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Get the widget config for styling
  const getWidgetConfig = useCallback(
    (widgetId: string): WidgetConfig | undefined => {
      return visibleWidgets.find((w) => w.id === widgetId);
    },
    [visibleWidgets],
  );

  // Handle drag start
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  // Handle drag end
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        reorderWidgets(persona, active.id as string, over.id as string);
      }

      setActiveId(null);
    },
    [persona, reorderWidgets],
  );

  // Handle drag cancel
  const handleDragCancel = useCallback(() => {
    setActiveId(null);
  }, []);

  // Get the active widget for the overlay
  const activeWidget = activeId ? widgets[activeId] : null;
  const activeConfig = activeId ? getWidgetConfig(activeId) : null;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Edit Mode Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {editMode && (
            <motion.p
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-sm text-muted-foreground flex items-center gap-2"
            >
              <GripVertical className="h-4 w-4" aria-hidden="true" />
              Drag widgets to reorder
            </motion.p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {editMode && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => resetToDefaults(persona)}
              className="text-xs"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
              Reset Layout
            </Button>
          )}

          <Button
            variant={editMode ? 'default' : 'outline'}
            size="sm"
            onClick={() => setEditMode(!editMode)}
            className={cn(
              'text-xs',
              editMode && 'bg-[var(--color-lxd-primary)] hover:bg-[var(--color-lxd-primary)]/90',
            )}
          >
            <Settings2 className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
            {editMode ? 'Done Editing' : 'Customize'}
          </Button>
        </div>
      </div>

      {/* Widget Grid */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext items={visibleWidgets.map((w) => w.id)} strategy={rectSortingStrategy}>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {visibleWidgets.map((config) => {
              const widget = widgets[config.id];
              if (!widget) return null;

              return (
                <motion.div key={config.id} variants={itemVariants}>
                  <SortableWidgetWrapper
                    id={config.id}
                    isEditMode={editMode}
                    colSpan={config.colSpan}
                    onRemove={() => toggleWidgetVisibility(persona, config.id)}
                  >
                    {widget.component}
                  </SortableWidgetWrapper>
                </motion.div>
              );
            })}
          </motion.div>
        </SortableContext>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeWidget && activeConfig ? (
            <WidgetDragOverlay>
              <div className={cn('w-full', `lg:col-span-${activeConfig.colSpan}`)}>
                {activeWidget.component}
              </div>
            </WidgetDragOverlay>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Hidden widgets indicator */}
      {editMode && (
        <HiddenWidgetsPanel
          persona={persona}
          widgets={widgets}
          onRestore={(widgetId) => toggleWidgetVisibility(persona, widgetId)}
        />
      )}
    </div>
  );
}

// ============================================================================
// HIDDEN WIDGETS PANEL
// ============================================================================

interface HiddenWidgetsPanelProps {
  persona: Persona;
  widgets: Record<string, WidgetDefinition>;
  onRestore: (widgetId: string) => void;
}

function HiddenWidgetsPanel({
  persona,
  widgets,
  onRestore,
}: HiddenWidgetsPanelProps): React.JSX.Element | null {
  const { layouts } = useDashboardLayoutStore();
  const hiddenWidgets = layouts[persona].widgets.filter((w) => !w.visible);

  if (hiddenWidgets.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-lg bg-muted/50 border border-border/50"
    >
      <p className="text-sm font-medium mb-3 text-muted-foreground">Hidden Widgets</p>
      <div className="flex flex-wrap gap-2">
        {hiddenWidgets.map((config) => {
          const widget = widgets[config.id];
          if (!widget) return null;

          return (
            <Button
              key={config.id}
              variant="outline"
              size="sm"
              onClick={() => onRestore(config.id)}
              className="text-xs"
            >
              {widget.label}
              <span className="ml-1 text-muted-foreground">+</span>
            </Button>
          );
        })}
      </div>
    </motion.div>
  );
}

export default DashboardWidgetGrid;
