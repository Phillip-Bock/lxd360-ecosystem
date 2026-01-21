'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export type RibbonTheme = 'neural' | 'light' | 'dark' | 'blue' | 'custom';

interface ThemeConfig {
  background: string;
  tabBackground: string;
  tabActive: string;
  tabText: string;
  tabTextActive: string;
  groupBorder: string;
  buttonHover: string;
  buttonActive: string;
  accentColor: string;
  textPrimary: string;
  textSecondary: string;
}

const themes: Record<Exclude<RibbonTheme, 'custom'>, ThemeConfig> = {
  neural: {
    background: 'bg-linear-to-b from-[#0a0a1a] to-[#1a1a2e]',
    tabBackground: 'bg-transparent',
    tabActive: 'bg-[--color-lxd-primary]/20',
    tabText: 'text-white/70',
    tabTextActive: 'text-white',
    groupBorder: 'border-[--color-lxd-primary]/20',
    buttonHover: 'hover:bg-[--color-lxd-primary]/20',
    buttonActive: 'bg-[--color-lxd-primary]/30',
    accentColor: '--color-lxd-primary',
    textPrimary: 'text-white',
    textSecondary: 'text-white/60',
  },
  light: {
    background: 'bg-linear-to-b from-gray-100 to-gray-50',
    tabBackground: 'bg-transparent',
    tabActive: 'bg-white',
    tabText: 'text-gray-600',
    tabTextActive: 'text-gray-900',
    groupBorder: 'border-gray-200',
    buttonHover: 'hover:bg-gray-200',
    buttonActive: 'bg-gray-300',
    accentColor: '--color-lxd-primary',
    textPrimary: 'text-gray-900',
    textSecondary: 'text-gray-500',
  },
  dark: {
    background: 'bg-linear-to-b from-gray-900 to-gray-800',
    tabBackground: 'bg-transparent',
    tabActive: 'bg-gray-700',
    tabText: 'text-gray-400',
    tabTextActive: 'text-white',
    groupBorder: 'border-gray-700',
    buttonHover: 'hover:bg-gray-700',
    buttonActive: 'bg-gray-600',
    accentColor: '--color-lxd-primary',
    textPrimary: 'text-white',
    textSecondary: 'text-gray-400',
  },
  blue: {
    background: 'bg-linear-to-b from-blue-900 to-blue-800',
    tabBackground: 'bg-transparent',
    tabActive: 'bg-blue-700',
    tabText: 'text-blue-200',
    tabTextActive: 'text-white',
    groupBorder: 'border-blue-700',
    buttonHover: 'hover:bg-blue-700',
    buttonActive: 'bg-blue-600',
    accentColor: '#3b82f6',
    textPrimary: 'text-white',
    textSecondary: 'text-blue-200',
  },
};

interface RibbonThemeContextValue {
  theme: RibbonTheme;
  setTheme: (theme: RibbonTheme) => void;
  config: ThemeConfig;
  customConfig?: Partial<ThemeConfig>;
  setCustomConfig: (config: Partial<ThemeConfig>) => void;
}

const RibbonThemeContext = React.createContext<RibbonThemeContextValue | undefined>(undefined);

export function useRibbonTheme() {
  const context = React.useContext(RibbonThemeContext);
  if (!context) {
    throw new Error('useRibbonTheme must be used within a RibbonThemeProvider');
  }
  return context;
}

interface RibbonThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: RibbonTheme;
  customConfig?: Partial<ThemeConfig>;
}

export function RibbonThemeProvider({
  children,
  defaultTheme = 'neural',
  customConfig: initialCustomConfig,
}: RibbonThemeProviderProps) {
  const [theme, setTheme] = React.useState<RibbonTheme>(defaultTheme);
  const [customConfig, setCustomConfig] = React.useState<Partial<ThemeConfig> | undefined>(
    initialCustomConfig,
  );

  const config = React.useMemo(() => {
    if (theme === 'custom' && customConfig) {
      return { ...themes.neural, ...customConfig };
    }
    return themes[theme as Exclude<RibbonTheme, 'custom'>];
  }, [theme, customConfig]);

  const value = React.useMemo(
    () => ({ theme, setTheme, config, customConfig, setCustomConfig }),
    [theme, config, customConfig],
  );

  return <RibbonThemeContext.Provider value={value}>{children}</RibbonThemeContext.Provider>;
}

// Theme-aware class generator
export function useThemeClasses() {
  const { config } = useRibbonTheme();

  return {
    ribbon: cn(config.background, 'border-b', config.groupBorder),
    tab: cn(config.tabBackground, config.tabText),
    tabActive: cn(config.tabActive, config.tabTextActive),
    group: cn('border-r', config.groupBorder),
    button: cn(config.textSecondary, config.buttonHover),
    buttonActive: cn(config.buttonActive, config.textPrimary),
    text: config.textPrimary,
    textMuted: config.textSecondary,
  };
}
