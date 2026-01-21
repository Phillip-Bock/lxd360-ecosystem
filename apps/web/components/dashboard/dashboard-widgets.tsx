'use client';

import { Settings } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { DEFAULT_WIDGETS, type WidgetId } from '@/types/dashboard';
import {
  CalendarWidget,
  ChartsWidget,
  NotificationsWidget,
  ProjectsWidget,
  QuickLinksWidget,
  RecentActivityWidget,
  SearchWidget,
  StorageWidget,
  TimerWidget,
  TodoWidget,
} from './widgets';

// Widget component map
const widgetComponents: Record<WidgetId, React.ComponentType> = {
  projects: ProjectsWidget,
  notifications: NotificationsWidget,
  calendar: CalendarWidget,
  'quick-links': QuickLinksWidget,
  todo: TodoWidget,
  charts: ChartsWidget,
  search: SearchWidget,
  timer: TimerWidget,
  'recent-activity': RecentActivityWidget,
  storage: StorageWidget,
};

interface DashboardWidgetsProps {
  className?: string;
}

export default function DashboardWidgets({ className }: DashboardWidgetsProps) {
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [enabledWidgets, setEnabledWidgets] = useState<WidgetId[]>(
    DEFAULT_WIDGETS.filter((w) => w.enabled).map((w) => w.id),
  );

  const toggleWidget = (id: WidgetId) => {
    setEnabledWidgets((prev) => {
      if (prev.includes(id)) {
        return prev.filter((w) => w !== id);
      }
      // Max 8 visible
      if (prev.length >= 8) {
        return prev;
      }
      return [...prev, id];
    });
  };

  // Get widgets in order, only enabled ones
  const visibleWidgets = DEFAULT_WIDGETS.filter((w) => enabledWidgets.includes(w.id)).slice(0, 8);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Customize Button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setShowCustomizer(!showCustomizer)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-(--inspire-hero-subtext) hover:text-(--inspire-hero-text) hover:bg-(--inspire-separator-light) rounded-lg transition-colors"
        >
          <Settings className="w-4 h-4" />
          Customize
        </button>
      </div>

      {/* Widget Customizer */}
      {showCustomizer && (
        <div
          className="rounded-xl border border-(--inspire-card-border) p-4 bg-(--inspire-card-bg)"
          style={{
            boxShadow: 'var(--inspire-card-shadow)',
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-white">Customize Dashboard</h3>
            <span className="text-xs text-white">{enabledWidgets.length}/8 widgets visible</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {DEFAULT_WIDGETS.map((widget) => {
              const isEnabled = enabledWidgets.includes(widget.id);
              const isDisabled = !isEnabled && enabledWidgets.length >= 8;
              return (
                <button
                  type="button"
                  key={widget.id}
                  onClick={() => toggleWidget(widget.id)}
                  disabled={isDisabled}
                  className={cn(
                    'px-3 py-2 text-sm rounded-lg border transition-all text-left text-white',
                    isEnabled
                      ? 'bg-white/20 border-(--inspire-primary)'
                      : isDisabled
                        ? 'bg-white/5 border-white/10 opacity-50 cursor-not-allowed'
                        : 'bg-white/10 border-white/20 hover:bg-white/15',
                  )}
                >
                  {widget.title}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Widget Grid - 4 columns */}
      <div className="grid grid-cols-4 gap-4">
        {visibleWidgets.map((widget) => {
          const WidgetComponent = widgetComponents[widget.id];
          return <WidgetComponent key={widget.id} />;
        })}
      </div>
    </div>
  );
}
