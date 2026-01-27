import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Persona } from '@/lib/rbac/personas';

// ============================================================================
// TYPES
// ============================================================================

export interface WidgetConfig {
  id: string;
  visible: boolean;
  order: number;
  colSpan: 1 | 2 | 3 | 4;
}

export interface PersonaLayout {
  widgets: WidgetConfig[];
  lastUpdated: number;
}

export type DashboardLayouts = Record<Persona, PersonaLayout>;

// ============================================================================
// DEFAULT LAYOUTS BY PERSONA
// ============================================================================

// Widget IDs must match the definitions in MissionControlDashboard.tsx
const DEFAULT_LEARNER_WIDGETS: WidgetConfig[] = [
  { id: 'skill-mastery', visible: true, order: 0, colSpan: 2 },
  { id: 'ai-recommendations', visible: true, order: 1, colSpan: 2 },
  { id: 'learning-velocity', visible: true, order: 2, colSpan: 4 },
];

const DEFAULT_EDITOR_WIDGETS: WidgetConfig[] = [
  { id: 'jitai-alerts', visible: true, order: 0, colSpan: 2 },
  { id: 'class-analytics', visible: true, order: 1, colSpan: 2 },
  { id: 'skill-mastery', visible: true, order: 2, colSpan: 4 },
];

const DEFAULT_MANAGER_WIDGETS: WidgetConfig[] = [
  { id: 'skill-heatmap', visible: true, order: 0, colSpan: 4 },
  { id: 'compliance-gap', visible: true, order: 1, colSpan: 2 },
  { id: 'roi-analytics', visible: true, order: 2, colSpan: 2 },
];

const DEFAULT_OWNER_WIDGETS: WidgetConfig[] = [
  { id: 'system-health', visible: true, order: 0, colSpan: 2 },
  { id: 'audit-log', visible: true, order: 1, colSpan: 2 },
  { id: 'jitai-alerts', visible: true, order: 2, colSpan: 2 },
  { id: 'ai-recommendations', visible: true, order: 3, colSpan: 2 },
];

const DEFAULT_LAYOUTS: DashboardLayouts = {
  learner: { widgets: DEFAULT_LEARNER_WIDGETS, lastUpdated: Date.now() },
  editor: { widgets: DEFAULT_EDITOR_WIDGETS, lastUpdated: Date.now() },
  manager: { widgets: DEFAULT_MANAGER_WIDGETS, lastUpdated: Date.now() },
  owner: { widgets: DEFAULT_OWNER_WIDGETS, lastUpdated: Date.now() },
};

// ============================================================================
// STORE INTERFACE
// ============================================================================

interface DashboardLayoutState {
  layouts: DashboardLayouts;
  editMode: boolean;

  // Actions
  setEditMode: (editMode: boolean) => void;
  reorderWidgets: (persona: Persona, activeId: string, overId: string) => void;
  toggleWidgetVisibility: (persona: Persona, widgetId: string) => void;
  updateWidgetColSpan: (persona: Persona, widgetId: string, colSpan: 1 | 2 | 3 | 4) => void;
  resetToDefaults: (persona: Persona) => void;
  resetAllToDefaults: () => void;
  getVisibleWidgets: (persona: Persona) => WidgetConfig[];
}

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const useDashboardLayoutStore = create<DashboardLayoutState>()(
  persist(
    (set, get) => ({
      layouts: DEFAULT_LAYOUTS,
      editMode: false,

      setEditMode: (editMode) => set({ editMode }),

      reorderWidgets: (persona, activeId, overId) => {
        set((state) => {
          const layout = state.layouts[persona];
          const widgets = [...layout.widgets];

          const activeIndex = widgets.findIndex((w) => w.id === activeId);
          const overIndex = widgets.findIndex((w) => w.id === overId);

          if (activeIndex === -1 || overIndex === -1) return state;

          // Swap the order values
          const activeWidget = widgets[activeIndex];
          const overWidget = widgets[overIndex];

          const activeOrder = activeWidget.order;
          activeWidget.order = overWidget.order;
          overWidget.order = activeOrder;

          // Sort by order
          widgets.sort((a, b) => a.order - b.order);

          return {
            layouts: {
              ...state.layouts,
              [persona]: {
                widgets,
                lastUpdated: Date.now(),
              },
            },
          };
        });
      },

      toggleWidgetVisibility: (persona, widgetId) => {
        set((state) => {
          const layout = state.layouts[persona];
          const widgets = layout.widgets.map((w) =>
            w.id === widgetId ? { ...w, visible: !w.visible } : w,
          );

          return {
            layouts: {
              ...state.layouts,
              [persona]: {
                widgets,
                lastUpdated: Date.now(),
              },
            },
          };
        });
      },

      updateWidgetColSpan: (persona, widgetId, colSpan) => {
        set((state) => {
          const layout = state.layouts[persona];
          const widgets = layout.widgets.map((w) => (w.id === widgetId ? { ...w, colSpan } : w));

          return {
            layouts: {
              ...state.layouts,
              [persona]: {
                widgets,
                lastUpdated: Date.now(),
              },
            },
          };
        });
      },

      resetToDefaults: (persona) => {
        set((state) => ({
          layouts: {
            ...state.layouts,
            [persona]: {
              widgets:
                persona === 'learner'
                  ? [...DEFAULT_LEARNER_WIDGETS]
                  : persona === 'editor'
                    ? [...DEFAULT_EDITOR_WIDGETS]
                    : persona === 'manager'
                      ? [...DEFAULT_MANAGER_WIDGETS]
                      : [...DEFAULT_OWNER_WIDGETS],
              lastUpdated: Date.now(),
            },
          },
        }));
      },

      resetAllToDefaults: () => {
        set({ layouts: { ...DEFAULT_LAYOUTS } });
      },

      getVisibleWidgets: (persona) => {
        const layout = get().layouts[persona];
        return layout.widgets.filter((w) => w.visible).sort((a, b) => a.order - b.order);
      },
    }),
    {
      name: 'dashboard-layout',
      version: 1,
    },
  ),
);

export default useDashboardLayoutStore;
