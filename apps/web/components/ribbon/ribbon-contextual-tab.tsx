'use client';

import type { LucideIcon } from 'lucide-react';
import { createContext, type ReactNode, useCallback, useContext, useState } from 'react';
import { RibbonTab, RibbonTabPanel } from './ribbon-tabs';

// Context type for managing contextual tabs
export interface ContextualTabConfig {
  id: string;
  label: string;
  icon?: LucideIcon;
  color?: string;
  groupLabel?: string;
  content: ReactNode;
}

interface ContextualTabContextType {
  activeTabs: ContextualTabConfig[];
  showTab: (config: ContextualTabConfig) => void;
  hideTab: (id: string) => void;
  hideAllTabs: () => void;
  isTabActive: (id: string) => boolean;
}

const ContextualTabContext = createContext<ContextualTabContextType | null>(null);

export function useContextualTabs() {
  const context = useContext(ContextualTabContext);
  if (!context) {
    throw new Error('useContextualTabs must be used within ContextualTabProvider');
  }
  return context;
}

interface ContextualTabProviderProps {
  children: ReactNode;
}

export function ContextualTabProvider({ children }: ContextualTabProviderProps) {
  const [activeTabs, setActiveTabs] = useState<ContextualTabConfig[]>([]);

  const showTab = useCallback((config: ContextualTabConfig) => {
    setActiveTabs((prev) => {
      // Replace if exists, otherwise add
      const exists = prev.find((t) => t.id === config.id);
      if (exists) {
        return prev.map((t) => (t.id === config.id ? config : t));
      }
      return [...prev, config];
    });
  }, []);

  const hideTab = useCallback((id: string) => {
    setActiveTabs((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const hideAllTabs = useCallback(() => {
    setActiveTabs([]);
  }, []);

  const isTabActive = useCallback(
    (id: string) => {
      return activeTabs.some((t) => t.id === id);
    },
    [activeTabs],
  );

  return (
    <ContextualTabContext.Provider
      value={{ activeTabs, showTab, hideTab, hideAllTabs, isTabActive }}
    >
      {children}
    </ContextualTabContext.Provider>
  );
}

// Component for rendering contextual tab triggers
interface ContextualTabTriggerProps {
  tab: ContextualTabConfig;
  isActive?: boolean;
  onClick?: () => void;
}

export function ContextualTabTrigger({
  tab,
  isActive = false,
  onClick,
}: ContextualTabTriggerProps) {
  const colorClass = tab.color || 'bg-purple-600';

  return (
    <div className="flex flex-col">
      {tab.groupLabel && (
        <div className={`text-xs text-center px-2 py-0.5 text-white ${colorClass} rounded-t-sm`}>
          {tab.groupLabel}
        </div>
      )}
      <RibbonTab
        value={tab.id}
        onClick={onClick}
        className={`
          ${isActive ? 'border-b-2' : ''}
        `}
        style={{
          borderBottomColor: isActive ? tab.color : undefined,
        }}
      >
        {tab.icon && <tab.icon className="h-4 w-4 mr-1" />}
        {tab.label}
      </RibbonTab>
    </div>
  );
}

// Component for rendering contextual tab content
interface ContextualTabContentProps {
  tab: ContextualTabConfig;
}

export function ContextualTabContent({ tab }: ContextualTabContentProps) {
  return <RibbonTabPanel value={tab.id}>{tab.content}</RibbonTabPanel>;
}

// Render all active contextual tabs
interface ContextualTabsProps {
  currentTab?: string;
  onTabChange?: (tabId: string) => void;
}

export function ContextualTabs({ currentTab, onTabChange }: ContextualTabsProps) {
  const { activeTabs } = useContextualTabs();

  // Group tabs by groupLabel
  const groupedTabs = activeTabs.reduce(
    (acc, tab) => {
      const group = tab.groupLabel || 'default';
      if (!acc[group]) {
        acc[group] = [];
      }
      acc[group].push(tab);
      return acc;
    },
    {} as Record<string, ContextualTabConfig[]>,
  );

  if (activeTabs.length === 0) {
    return null;
  }

  return (
    <>
      {/* Tab triggers */}
      {Object.entries(groupedTabs).map(([groupLabel, tabs]) => (
        <div key={groupLabel} className="flex items-end">
          {tabs.map((tab) => (
            <ContextualTabTrigger
              key={tab.id}
              tab={tab}
              isActive={currentTab === tab.id}
              onClick={() => onTabChange?.(tab.id)}
            />
          ))}
        </div>
      ))}
    </>
  );
}

// Render all active contextual tab panels
export function ContextualTabPanels() {
  const { activeTabs } = useContextualTabs();

  return (
    <>
      {activeTabs.map((tab) => (
        <ContextualTabContent key={tab.id} tab={tab} />
      ))}
    </>
  );
}

// Hook for common contextual tabs (Image, Table, Shape, etc.)
export function useImageContextualTab(isSelected: boolean, content: ReactNode) {
  const { showTab, hideTab } = useContextualTabs();

  const imageTabConfig: ContextualTabConfig = {
    id: 'image-format',
    label: 'Format',
    groupLabel: 'Picture Tools',
    color: 'bg-purple-600',
    content,
  };

  // Show/hide based on selection
  if (isSelected) {
    showTab(imageTabConfig);
  } else {
    hideTab('image-format');
  }
}

export function useTableContextualTab(
  isSelected: boolean,
  designContent: ReactNode,
  layoutContent: ReactNode,
) {
  const { showTab, hideTab } = useContextualTabs();

  const designTabConfig: ContextualTabConfig = {
    id: 'table-design',
    label: 'Design',
    groupLabel: 'Table Tools',
    color: 'bg-orange-600',
    content: designContent,
  };

  const layoutTabConfig: ContextualTabConfig = {
    id: 'table-layout',
    label: 'Layout',
    groupLabel: 'Table Tools',
    color: 'bg-orange-600',
    content: layoutContent,
  };

  if (isSelected) {
    showTab(designTabConfig);
    showTab(layoutTabConfig);
  } else {
    hideTab('table-design');
    hideTab('table-layout');
  }
}

export function useShapeContextualTab(isSelected: boolean, content: ReactNode) {
  const { showTab, hideTab } = useContextualTabs();

  const shapeTabConfig: ContextualTabConfig = {
    id: 'shape-format',
    label: 'Format',
    groupLabel: 'Drawing Tools',
    color: 'bg-green-600',
    content,
  };

  if (isSelected) {
    showTab(shapeTabConfig);
  } else {
    hideTab('shape-format');
  }
}

export function useVideoContextualTab(
  isSelected: boolean,
  formatContent: ReactNode,
  playbackContent: ReactNode,
) {
  const { showTab, hideTab } = useContextualTabs();

  const formatTabConfig: ContextualTabConfig = {
    id: 'video-format',
    label: 'Format',
    groupLabel: 'Video Tools',
    color: 'bg-blue-600',
    content: formatContent,
  };

  const playbackTabConfig: ContextualTabConfig = {
    id: 'video-playback',
    label: 'Playback',
    groupLabel: 'Video Tools',
    color: 'bg-blue-600',
    content: playbackContent,
  };

  if (isSelected) {
    showTab(formatTabConfig);
    showTab(playbackTabConfig);
  } else {
    hideTab('video-format');
    hideTab('video-playback');
  }
}
