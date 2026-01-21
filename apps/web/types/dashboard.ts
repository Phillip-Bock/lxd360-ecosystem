// Dashboard Widget Types

export type WidgetSize = 1 | 2 | 4;

export type WidgetId =
  | 'projects'
  | 'notifications'
  | 'calendar'
  | 'quick-links'
  | 'todo'
  | 'charts'
  | 'search'
  | 'timer'
  | 'recent-activity'
  | 'storage';

export interface WidgetConfig {
  id: WidgetId;
  title: string;
  defaultSize: WidgetSize;
  minSize: WidgetSize;
  maxSize: WidgetSize;
  enabled: boolean;
  order: number;
}

export interface WidgetState {
  id: WidgetId;
  size: WidgetSize;
  enabled: boolean;
  order: number;
}

export interface DashboardLayout {
  widgets: WidgetState[];
  maxVisible: number;
}

// Default widget configurations
export const DEFAULT_WIDGETS: WidgetConfig[] = [
  {
    id: 'projects',
    title: 'Recent Projects',
    defaultSize: 4,
    minSize: 2,
    maxSize: 4,
    enabled: true,
    order: 0,
  },
  {
    id: 'notifications',
    title: 'Notifications',
    defaultSize: 2,
    minSize: 1,
    maxSize: 2,
    enabled: true,
    order: 1,
  },
  {
    id: 'recent-activity',
    title: 'Recent Activity',
    defaultSize: 2,
    minSize: 1,
    maxSize: 2,
    enabled: true,
    order: 2,
  },
  {
    id: 'calendar',
    title: 'Calendar & Events',
    defaultSize: 4,
    minSize: 2,
    maxSize: 4,
    enabled: true,
    order: 3,
  },
  {
    id: 'quick-links',
    title: 'Quick Links',
    defaultSize: 2,
    minSize: 1,
    maxSize: 2,
    enabled: true,
    order: 4,
  },
  {
    id: 'todo',
    title: 'To-Do & Notes',
    defaultSize: 2,
    minSize: 1,
    maxSize: 2,
    enabled: true,
    order: 5,
  },
  {
    id: 'charts',
    title: 'Analytics',
    defaultSize: 4,
    minSize: 2,
    maxSize: 4,
    enabled: false,
    order: 6,
  },
  {
    id: 'search',
    title: 'Quick Search',
    defaultSize: 2,
    minSize: 1,
    maxSize: 2,
    enabled: false,
    order: 7,
  },
  {
    id: 'timer',
    title: 'Focus Timer',
    defaultSize: 1,
    minSize: 1,
    maxSize: 1,
    enabled: false,
    order: 8,
  },
  {
    id: 'storage',
    title: 'Storage',
    defaultSize: 1,
    minSize: 1,
    maxSize: 1,
    enabled: false,
    order: 9,
  },
];

// Get default layout (first 8 enabled widgets)
export function getDefaultLayout(): DashboardLayout {
  return {
    widgets: DEFAULT_WIDGETS.filter((w) => w.enabled)
      .slice(0, 8)
      .map((w) => ({
        id: w.id,
        size: w.defaultSize,
        enabled: w.enabled,
        order: w.order,
      })),
    maxVisible: 8,
  };
}

// Calculate column span class
export function getWidgetColSpan(size: WidgetSize): string {
  switch (size) {
    case 1:
      return 'col-span-1';
    case 2:
      return 'col-span-2';
    case 4:
      return 'col-span-4';
    default:
      return 'col-span-2';
  }
}
