'use client';

/**
 * =============================================================================
 * INSPIRE Studio | Ribbon Tabs Navigation Component
 * =============================================================================
 *
 * The tab strip for navigating between ribbon tabs.
 * Supports main tabs and contextual tabs that appear based on selection.
 */

import { cn } from '@/lib/utils';

export interface RibbonTabItem {
  id: string;
  label: string;
  isContextual?: boolean;
  contextColor?: string;
}

interface RibbonTabsProps {
  tabs: RibbonTabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
}

export function RibbonTabs({
  tabs,
  activeTab,
  onTabChange,
  isCollapsed = false,
  onToggleCollapse,
  className,
}: RibbonTabsProps) {
  // Separate main tabs from contextual tabs
  const mainTabs = tabs.filter((tab) => !tab.isContextual);
  const contextualTabs = tabs.filter((tab) => tab.isContextual);

  return (
    <div
      className={cn(
        'flex items-center gap-0.5 px-2 pt-1 border-b border-(--surface-card-hover)',
        className,
      )}
    >
      {/* Main Tabs */}
      <div className="flex items-center gap-0.5">
        {mainTabs.map((tab) => (
          <button
            type="button"
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            onDoubleClick={onToggleCollapse}
            className={cn(
              'px-4 py-2 text-sm font-medium transition-all duration-150 rounded-t-md border-b-2',
              activeTab === tab.id
                ? 'bg-(--surface-card-hover)/50 text-(--brand-primary-hover) border-(--brand-primary-hover)'
                : 'text-(--text-muted) border-transparent hover:bg-(--surface-card-hover)/30 hover:text-(--text-inverse)',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contextual Tabs */}
      {contextualTabs.length > 0 && (
        <>
          <div className="w-px h-6 bg-(--surface-card-hover)/50 mx-2" />
          <div className="flex items-center gap-0.5">
            {contextualTabs.map((tab) => (
              <button
                type="button"
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  'px-4 py-2 text-sm font-medium transition-all duration-150 rounded-t-md border-b-2',
                  activeTab === tab.id
                    ? 'bg-(--surface-card-hover)/50 border-b-2'
                    : 'border-transparent hover:bg-(--surface-card-hover)/30',
                )}
                style={{
                  color:
                    activeTab === tab.id
                      ? tab.contextColor || 'var(--color-warning)'
                      : 'var(--text-muted)',
                  borderColor:
                    activeTab === tab.id
                      ? tab.contextColor || 'var(--color-warning)'
                      : 'transparent',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Collapse indicator */}
      <div className="flex-1" />
      {isCollapsed && (
        <span className="text-[10px] text-(--text-tertiary) px-2">Double-click tab to expand</span>
      )}
    </div>
  );
}
