'use client';

import type { DraggableAttributes } from '@dnd-kit/core';
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  type UniqueIdentifier,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  AlertTriangle,
  BarChart2,
  BookOpen,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  FileText,
  GraduationCap,
  GripVertical,
  HelpCircle,
  Pencil,
  Plus,
  Puzzle,
  Trash2,
  User,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useOutlineStore } from '@/store/outline-store';
import type { ChildItem, ModuleItem, OutlineItemType } from '@/types/outline';

const ITEM_ICONS: Record<OutlineItemType, React.ComponentType<{ className?: string }>> = {
  module: BookOpen,
  lesson: FileText,
  'check-on-learning': HelpCircle,
  scenario: Puzzle,
  assessment: GraduationCap,
  'question-bank': ClipboardList,
  survey: BarChart2,
  'survey-bank': ClipboardList,
};

// Item labels for type display - used in tooltips/aria-labels
// module: 'Module', lesson: 'Lesson', etc.

interface SortableModuleProps {
  module: ModuleItem;
  isExpanded: boolean;
  showObjectivesWarning: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function SortableModule({
  module,
  isExpanded,
  showObjectivesWarning,
  onToggle,
  onEdit,
  onDelete,
}: SortableModuleProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: module.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const Icon = ITEM_ICONS.module;

  return (
    <div ref={setNodeRef} style={style} className="mb-2">
      <div
        className={`flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-colors ${
          isDragging ? 'shadow-lg ring-2 ring-blue-500' : ''
        }`}
      >
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="p-1 text-slate-400 hover:text-slate-600 cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onToggle}
          className="p-1 text-slate-400 hover:text-slate-600"
        >
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        <Icon className="w-5 h-5 text-slate-600" />

        <div className="flex-1">
          <span className="font-semibold text-slate-800 text-base">{module.title}</span>
          {showObjectivesWarning && (
            <div className="flex items-center gap-1 text-amber-500 text-xs mt-0.5">
              <AlertTriangle className="h-3 w-3" />
              <span>Add Course Objectives to enable assessment mapping</span>
            </div>
          )}
        </div>

        <span className="text-xs text-slate-500">
          {module.children.length} item{module.children.length !== 1 ? 's' : ''}
        </span>

        <button
          type="button"
          onClick={onEdit}
          className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
        >
          <Pencil className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onDelete}
          className="p-1 text-slate-400 hover:text-red-500 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

interface SortableChildItemProps {
  item: ChildItem;
  onEdit?: () => void;
  onDelete: () => void;
}

// Common props for child item components
interface ChildItemComponentProps {
  item: ChildItem;
  onDelete: () => void;
  attributes: DraggableAttributes;
  listeners: SyntheticListenerMap | undefined;
  isDragging: boolean;
}

interface EditableChildItemProps extends ChildItemComponentProps {
  onEdit: () => void;
}

// Render different child item types with distinct styles
function LessonItem({
  item,
  onEdit,
  onDelete,
  attributes,
  listeners,
  isDragging,
}: EditableChildItemProps) {
  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 ml-8 rounded-lg border transition-colors bg-blue-500 border-blue-600 hover:border-blue-400 ${
        isDragging ? 'shadow-lg ring-2 ring-blue-300' : ''
      }`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="p-1 text-white/80 hover:text-white cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="w-4 h-4" />
      </button>
      <FileText className="w-4 h-4 text-white/80" />
      <span className="flex-1 text-sm font-medium text-white">{item.title}</span>
      <button
        type="button"
        onClick={onEdit}
        className="px-2 py-1 text-xs font-medium rounded transition-colors bg-blue-400/30 hover:bg-blue-400/50 text-white"
      >
        Edit Lesson →
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="p-1 text-white/80 hover:text-red-200 transition-colors"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

function CheckOnLearningItem({
  item,
  onEdit,
  onDelete,
  attributes,
  listeners,
  isDragging,
}: EditableChildItemProps) {
  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 ml-8 rounded-lg border transition-colors bg-sky-400 border-sky-500 hover:border-sky-300 ${
        isDragging ? 'shadow-lg ring-2 ring-sky-300' : ''
      }`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="p-1 text-white/80 hover:text-white cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="w-4 h-4" />
      </button>
      <HelpCircle className="w-4 h-4 text-white/80" />
      <span className="flex-1 text-sm font-medium text-white">{item.title}</span>
      <button
        type="button"
        onClick={onEdit}
        className="px-2 py-1 text-xs font-medium rounded transition-colors bg-sky-300/30 hover:bg-sky-300/50 text-white"
      >
        Edit →
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="p-1 text-white/80 hover:text-red-200 transition-colors"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

function AssessmentItem({
  item,
  onDelete,
  attributes,
  listeners,
  isDragging,
}: ChildItemComponentProps) {
  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 ml-8 rounded-lg border transition-colors bg-indigo-500 border-indigo-600 hover:border-indigo-400 ${
        isDragging ? 'shadow-lg ring-2 ring-indigo-300' : ''
      }`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="p-1 text-white/80 hover:text-white cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="w-4 h-4" />
      </button>
      <GraduationCap className="w-4 h-4 text-white/80" />
      <span className="flex-1 text-sm font-medium text-white">{item.title}</span>
      <button
        type="button"
        onClick={onDelete}
        className="p-1 text-white/80 hover:text-red-200 transition-colors"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

function SurveyItem({
  item,
  onDelete,
  attributes,
  listeners,
  isDragging,
}: ChildItemComponentProps) {
  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 ml-8 rounded-lg border transition-colors bg-violet-500 border-violet-600 hover:border-violet-400 ${
        isDragging ? 'shadow-lg ring-2 ring-violet-300' : ''
      }`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="p-1 text-white/80 hover:text-white cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="w-4 h-4" />
      </button>
      <BarChart2 className="w-4 h-4 text-white/80" />
      <span className="flex-1 text-sm font-medium text-white">{item.title}</span>
      <button
        type="button"
        onClick={onDelete}
        className="p-1 text-white/80 hover:text-red-200 transition-colors"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

function ScenarioItem({
  item,
  onEdit,
  onDelete,
  attributes,
  listeners,
  isDragging,
}: EditableChildItemProps) {
  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 ml-8 rounded-lg border transition-colors bg-teal-500 border-teal-600 hover:border-teal-400 ${
        isDragging ? 'shadow-lg ring-2 ring-teal-300' : ''
      }`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="p-1 text-white/80 hover:text-white cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="w-4 h-4" />
      </button>
      <Puzzle className="w-4 h-4 text-white/80" />
      <span className="flex-1 text-sm font-medium text-white">{item.title}</span>
      <button
        type="button"
        onClick={onEdit}
        className="px-2 py-1 text-xs font-medium rounded transition-colors bg-teal-400/30 hover:bg-teal-400/50 text-white"
      >
        Edit →
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="p-1 text-white/80 hover:text-red-200 transition-colors"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

function DefaultItem({
  item,
  onDelete,
  attributes,
  listeners,
  isDragging,
}: ChildItemComponentProps) {
  const Icon = ITEM_ICONS[item.type];
  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 ml-8 rounded-lg border transition-colors bg-slate-100 border-slate-200 hover:border-slate-300 ${
        isDragging ? 'shadow-lg ring-2 ring-slate-300' : ''
      }`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="p-1 text-slate-500 hover:text-slate-700 cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="w-4 h-4" />
      </button>
      <Icon className="w-4 h-4 text-slate-500" />
      <span className="flex-1 text-sm font-medium text-slate-700">{item.title}</span>
      <button
        type="button"
        onClick={onDelete}
        className="p-1 text-slate-500 hover:text-red-500 transition-colors"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

function SortableChildItem({ item, onEdit, onDelete }: SortableChildItemProps) {
  const router = useRouter();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleEdit = () => {
    if (item.type === 'lesson') {
      router.push(`/inspire-studio/lesson-builder/${item.id}`);
    } else if (onEdit) {
      onEdit();
    }
  };

  const commonProps = { item, onDelete, attributes, listeners, isDragging };

  return (
    <div ref={setNodeRef} style={style} className="mb-1">
      {item.type === 'lesson' && <LessonItem {...commonProps} onEdit={handleEdit} />}
      {item.type === 'check-on-learning' && (
        <CheckOnLearningItem {...commonProps} onEdit={handleEdit} />
      )}
      {item.type === 'assessment' && <AssessmentItem {...commonProps} />}
      {item.type === 'survey' && <SurveyItem {...commonProps} />}
      {item.type === 'scenario' && <ScenarioItem {...commonProps} onEdit={handleEdit} />}
      {!['lesson', 'check-on-learning', 'assessment', 'survey', 'scenario'].includes(item.type) && (
        <DefaultItem {...commonProps} />
      )}
    </div>
  );
}

interface ModuleGroupProps {
  module: ModuleItem;
  isExpanded: boolean;
  showObjectivesWarning: boolean;
  onToggle: () => void;
}

function ModuleGroup({ module, isExpanded, showObjectivesWarning, onToggle }: ModuleGroupProps) {
  const { updateModule, removeModule, removeChildItem } = useOutlineStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(module.title);

  const childIds = useMemo(() => module.children.map((c) => c.id), [module.children]);

  const handleSaveTitle = () => {
    if (editTitle.trim()) {
      updateModule(module.id, { title: editTitle.trim() });
    }
    setIsEditing(false);
  };

  return (
    <div>
      {isEditing ? (
        <div className="flex items-center gap-2 px-3 py-2 mb-2 bg-white rounded-lg border border-blue-400">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveTitle();
              if (e.key === 'Escape') setIsEditing(false);
            }}
            className="flex-1 px-2 py-1 text-base font-semibold text-slate-800 bg-white border border-slate-300 rounded focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={handleSaveTitle}
            className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="px-3 py-1 text-sm font-medium text-slate-600 bg-slate-100 rounded hover:bg-slate-200"
          >
            Cancel
          </button>
        </div>
      ) : (
        <SortableModule
          module={module}
          isExpanded={isExpanded}
          showObjectivesWarning={showObjectivesWarning}
          onToggle={onToggle}
          onEdit={() => {
            setEditTitle(module.title);
            setIsEditing(true);
          }}
          onDelete={() => removeModule(module.id)}
        />
      )}

      {isExpanded && module.children.length > 0 && (
        <SortableContext items={childIds} strategy={verticalListSortingStrategy}>
          {module.children.map((child) => (
            <SortableChildItem
              key={child.id}
              item={child}
              onDelete={() => removeChildItem(child.id, module.id)}
            />
          ))}
        </SortableContext>
      )}

      {isExpanded && module.children.length === 0 && (
        <div className="ml-8 px-3 py-4 text-sm text-slate-500 text-center border border-dashed border-slate-300 rounded-lg mb-2 bg-slate-50">
          No items in this module. Add lessons, assessments, or other content from the sidebar.
        </div>
      )}
    </div>
  );
}

export function OutlineTree() {
  const {
    outline,
    reorderModules,
    reorderChildItems,
    removeChildItem,
    moveChildToModule,
    selectModule,
  } = useOutlineStore();

  // Track previous module IDs to detect new modules
  const prevModuleIdsRef = useRef<Set<string>>(new Set());

  // Initialize with all existing modules expanded
  const [expandedModules, setExpandedModules] = useState<Set<string>>(() => {
    return new Set(outline.modules.map((m) => m.id));
  });
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

  // Auto-expand newly added modules
  useEffect(() => {
    const currentIds = new Set(outline.modules.map((m) => m.id));
    const prevIds = prevModuleIdsRef.current;

    // Find new modules (in current but not in previous)
    const newModuleIds: string[] = [];
    for (const id of currentIds) {
      if (!prevIds.has(id)) {
        newModuleIds.push(id);
      }
    }

    // Auto-expand new modules
    if (newModuleIds.length > 0) {
      setExpandedModules((prev) => {
        const next = new Set(prev);
        for (const id of newModuleIds) {
          next.add(id);
        }
        return next;
      });
    }

    // Update ref for next comparison
    prevModuleIdsRef.current = currentIds;
  }, [outline.modules]);

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

  const moduleIds = useMemo(() => outline.modules.map((m) => m.id), [outline.modules]);
  const topLevelIds = useMemo(
    () => outline.topLevelItems.map((i) => i.id),
    [outline.topLevelItems],
  );

  const toggleModule = (id: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
    // Set as selected module for adding items from sidebar
    selectModule(id);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const activeIdStr = String(active.id);
    const overIdStr = String(over.id);

    // Check if dragging modules (module-to-module reordering)
    const activeModuleIndex = outline.modules.findIndex((m) => m.id === activeIdStr);
    const overModuleIndex = outline.modules.findIndex((m) => m.id === overIdStr);

    if (activeModuleIndex !== -1 && overModuleIndex !== -1) {
      reorderModules(activeModuleIndex, overModuleIndex);
      return;
    }

    // Find which module contains the active item (if it's a child)
    let activeParentId: string | null = null;
    let activeChildIndex = -1;
    for (const mod of outline.modules) {
      const idx = mod.children.findIndex((c) => c.id === activeIdStr);
      if (idx !== -1) {
        activeParentId = mod.id;
        activeChildIndex = idx;
        break;
      }
    }

    // If active item is in top-level items
    if (activeChildIndex === -1) {
      const topIdx = outline.topLevelItems.findIndex((i) => i.id === activeIdStr);
      if (topIdx !== -1) {
        activeChildIndex = topIdx;
        activeParentId = null;
      }
    }

    // If we found the active item as a child
    if (activeChildIndex !== -1) {
      // Find where we're dropping (which module/position)
      let overParentId: string | null = null;
      let overChildIndex = -1;

      // Check if dropping onto a module header (move to that module)
      const overModule = outline.modules.find((m) => m.id === overIdStr);
      if (overModule) {
        // Dropping onto a module - add to end of that module
        overParentId = overModule.id;
        overChildIndex = overModule.children.length;

        // If same module, just reordering
        if (activeParentId === overParentId) {
          return; // No change needed when dropping on own module header
        }

        // Move to different module
        moveChildToModule(activeIdStr, activeParentId, overParentId, overChildIndex);
        return;
      }

      // Check if dropping onto another child item (within same or different module)
      for (const mod of outline.modules) {
        const idx = mod.children.findIndex((c) => c.id === overIdStr);
        if (idx !== -1) {
          overParentId = mod.id;
          overChildIndex = idx;
          break;
        }
      }

      // Check top-level items
      if (overChildIndex === -1) {
        const topIdx = outline.topLevelItems.findIndex((i) => i.id === overIdStr);
        if (topIdx !== -1) {
          overParentId = null;
          overChildIndex = topIdx;
        }
      }

      if (overChildIndex !== -1) {
        // Same parent - just reorder
        if (activeParentId === overParentId) {
          reorderChildItems(activeParentId, activeChildIndex, overChildIndex);
        } else {
          // Different parent - move to new module
          moveChildToModule(activeIdStr, activeParentId, overParentId, overChildIndex);
        }
        return;
      }
    }
  };

  // Find active item for overlay
  const getActiveItem = () => {
    if (!activeId) return null;
    const activeIdStr = String(activeId);

    const foundModule = outline.modules.find((m) => m.id === activeIdStr);
    if (foundModule) return { type: 'module' as const, item: foundModule };

    for (const mod of outline.modules) {
      const child = mod.children.find((c) => c.id === activeIdStr);
      if (child) return { type: 'child' as const, item: child };
    }

    const topLevel = outline.topLevelItems.find((i) => i.id === activeIdStr);
    if (topLevel) return { type: 'child' as const, item: topLevel };

    return null;
  };

  const activeItem = getActiveItem();

  const [isObjectivesExpanded, setIsObjectivesExpanded] = useState(true);
  const { openObjectivesModal } = useOutlineStore();

  const titleBackground = outline.titleBackground;
  const hasBackground = titleBackground.type !== 'none' && titleBackground.url;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden rounded-lg mb-0">
          {/* Background image layer */}
          {hasBackground && (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${titleBackground.url})`,
                filter: `brightness(${titleBackground.brightness}%) contrast(${titleBackground.contrast}%)`,
                transform: `scale(${titleBackground.scale}) translate(${titleBackground.positionX}%, ${titleBackground.positionY}%)`,
              }}
            />
          )}
          {/* Overlay for text readability */}
          {hasBackground && (
            <div
              className="absolute inset-0 bg-black"
              style={{ opacity: titleBackground.overlayOpacity / 100 }}
            />
          )}

          {/* Hero Content */}
          <div
            className={`relative z-10 p-8 ${hasBackground ? 'min-h-50 flex flex-col justify-end' : ''}`}
            style={{
              textAlign: outline.titleAlignment,
            }}
          >
            <h1
              className={`text-4xl font-bold mb-2 ${hasBackground ? 'text-white' : 'text-foreground'}`}
            >
              {outline.title || 'Untitled Course'}
            </h1>

            {outline.authorDisplayMode !== 'none' && outline.authorName && (
              <div
                className={`mt-3 flex items-center gap-2 ${
                  outline.titleAlignment === 'center'
                    ? 'justify-center'
                    : outline.titleAlignment === 'right'
                      ? 'justify-end'
                      : 'justify-start'
                }`}
              >
                {outline.authorDisplayMode === 'avatar' && (
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className={`w-5 h-5 ${hasBackground ? 'text-white' : 'text-primary'}`} />
                  </div>
                )}
                <span
                  className={`text-sm ${hasBackground ? 'text-white/80' : 'text-muted-foreground'}`}
                >
                  {outline.authorName}
                </span>
              </div>
            )}
          </div>
        </section>

        {/* DESCRIPTION SECTION */}
        <section className="p-6 border-b border-border">
          <p className="text-muted-foreground">
            {outline.description || 'No description provided.'}
          </p>
          {outline.description && (
            <span className="text-xs text-muted-foreground mt-2 block">
              {outline.description.length}/500
            </span>
          )}
        </section>

        {/* OBJECTIVES SECTION */}
        <section className="p-6 border-b border-border">
          <button
            type="button"
            onClick={() => setIsObjectivesExpanded(!isObjectivesExpanded)}
            className="flex items-center gap-2 w-full text-left"
          >
            {isObjectivesExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="font-semibold text-foreground">
              Course Objectives ({outline.objectives.length})
            </span>
          </button>

          {isObjectivesExpanded && (
            <div className="mt-3 pl-6">
              {outline.objectives.length === 0 ? (
                <p className="text-sm text-muted-foreground">No objectives defined yet.</p>
              ) : (
                <ul className="space-y-1">
                  {outline.objectives.map((obj, index) => (
                    <li
                      key={obj.id}
                      className="flex items-start gap-2 text-sm text-foreground py-1"
                    >
                      <span className="text-muted-foreground">{index + 1}.</span>
                      <span>{obj.text}</span>
                    </li>
                  ))}
                </ul>
              )}
              <button
                type="button"
                onClick={openObjectivesModal}
                className="mt-3 flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
              >
                <Plus className="h-3 w-3" />
                Add Objective
              </button>
            </div>
          )}
        </section>

        {/* Spacer before modules */}
        <div className="p-6">
          {/* Outline Tree */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            {/* Modules */}
            {outline.modules.length > 0 && (
              <div className="mb-6">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Modules
                </h2>
                <SortableContext items={moduleIds} strategy={verticalListSortingStrategy}>
                  {outline.modules.map((module) => (
                    <ModuleGroup
                      key={module.id}
                      module={module}
                      isExpanded={expandedModules.has(module.id)}
                      showObjectivesWarning={outline.objectives.length === 0}
                      onToggle={() => toggleModule(module.id)}
                    />
                  ))}
                </SortableContext>
              </div>
            )}

            {/* Top-level Items (assessments, etc. not in modules) */}
            {outline.topLevelItems.length > 0 && (
              <div className="mb-6">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Additional Items
                </h2>
                <SortableContext items={topLevelIds} strategy={verticalListSortingStrategy}>
                  {outline.topLevelItems.map((item) => (
                    <SortableChildItem
                      key={item.id}
                      item={item}
                      onDelete={() => removeChildItem(item.id, null)}
                    />
                  ))}
                </SortableContext>
              </div>
            )}

            {/* Empty State */}
            {outline.modules.length === 0 && outline.topLevelItems.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <BookOpen className="w-16 h-16 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No content yet</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Start building your course by adding modules, lessons, and assessments from the
                  sidebar on the left.
                </p>
              </div>
            )}

            {/* Drag Overlay */}
            <DragOverlay>
              {activeItem && activeItem.type === 'module' && (
                <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-blue-500 shadow-xl">
                  <GripVertical className="w-4 h-4 text-slate-400" />
                  <BookOpen className="w-5 h-5 text-slate-600" />
                  <span className="font-semibold text-slate-800">
                    {(activeItem.item as ModuleItem).title}
                  </span>
                </div>
              )}
              {activeItem &&
                activeItem.type === 'child' &&
                (() => {
                  const childItem = activeItem.item as ChildItem;
                  const Icon = ITEM_ICONS[childItem.type];
                  // Use explicit classes for each type
                  if (childItem.type === 'lesson') {
                    return (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg border shadow-xl bg-blue-500 border-blue-600">
                        <GripVertical className="w-4 h-4 text-white/80" />
                        <Icon className="w-4 h-4 text-white/80" />
                        <span className="text-sm font-medium text-white">{childItem.title}</span>
                      </div>
                    );
                  }
                  if (childItem.type === 'check-on-learning') {
                    return (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg border shadow-xl bg-sky-400 border-sky-500">
                        <GripVertical className="w-4 h-4 text-white/80" />
                        <Icon className="w-4 h-4 text-white/80" />
                        <span className="text-sm font-medium text-white">{childItem.title}</span>
                      </div>
                    );
                  }
                  if (childItem.type === 'assessment') {
                    return (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg border shadow-xl bg-indigo-500 border-indigo-600">
                        <GripVertical className="w-4 h-4 text-white/80" />
                        <Icon className="w-4 h-4 text-white/80" />
                        <span className="text-sm font-medium text-white">{childItem.title}</span>
                      </div>
                    );
                  }
                  if (childItem.type === 'survey') {
                    return (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg border shadow-xl bg-violet-500 border-violet-600">
                        <GripVertical className="w-4 h-4 text-white/80" />
                        <Icon className="w-4 h-4 text-white/80" />
                        <span className="text-sm font-medium text-white">{childItem.title}</span>
                      </div>
                    );
                  }
                  if (childItem.type === 'scenario') {
                    return (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg border shadow-xl bg-teal-500 border-teal-600">
                        <GripVertical className="w-4 h-4 text-white/80" />
                        <Icon className="w-4 h-4 text-white/80" />
                        <span className="text-sm font-medium text-white">{childItem.title}</span>
                      </div>
                    );
                  }
                  // Default
                  return (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg border shadow-xl bg-slate-100 border-slate-200">
                      <GripVertical className="w-4 h-4 text-slate-500" />
                      <Icon className="w-4 h-4 text-slate-500" />
                      <span className="text-sm font-medium text-slate-700">{childItem.title}</span>
                    </div>
                  );
                })()}
            </DragOverlay>
          </DndContext>
        </div>
      </div>
    </div>
  );
}
