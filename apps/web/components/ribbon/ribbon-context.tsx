'use client';

import * as React from 'react';

interface RibbonContextValue {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const RibbonContext = React.createContext<RibbonContextValue | undefined>(undefined);

export function useRibbon() {
  const context = React.useContext(RibbonContext);
  if (!context) {
    throw new Error('useRibbon must be used within a RibbonProvider');
  }
  return context;
}

interface RibbonProviderProps {
  children: React.ReactNode;
  defaultTab?: string;
}

export function RibbonProvider({ children, defaultTab = 'home' }: RibbonProviderProps) {
  const [activeTab, setActiveTab] = React.useState(defaultTab);
  const [collapsed, setCollapsed] = React.useState(false);

  const value = React.useMemo(
    () => ({ activeTab, setActiveTab, collapsed, setCollapsed }),
    [activeTab, collapsed],
  );

  return <RibbonContext.Provider value={value}>{children}</RibbonContext.Provider>;
}
