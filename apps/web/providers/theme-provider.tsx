'use client';

/**
 * ThemeProvider - Context for managing theme state and CSS variables
 */

import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { DEFAULT_THEME, type Theme, type ThemeColors } from '@/types/theme';

interface ThemeContextValue {
  theme: Theme;
  colorMode: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  setColorMode: (mode: 'light' | 'dark') => void;
  updateColors: (colors: Partial<ThemeColors>) => void;
  resetTheme: () => void;
  getCSSVariables: () => Record<string, string>;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  children: ReactNode;
  initialTheme?: Theme;
}

export function ThemeProvider({ children, initialTheme }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(initialTheme ?? DEFAULT_THEME);
  const [colorMode, setColorMode] = useState<'light' | 'dark'>('dark');

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  const updateColors = useCallback(
    (colors: Partial<ThemeColors>) => {
      setThemeState((prev) => ({
        ...prev,
        colors: {
          ...prev.colors,
          [colorMode]: {
            ...prev.colors[colorMode],
            ...colors,
          },
        },
        updatedAt: new Date().toISOString(),
      }));
    },
    [colorMode],
  );

  const resetTheme = useCallback(() => {
    setThemeState(DEFAULT_THEME);
  }, []);

  const getCSSVariables = useCallback(() => {
    const colors = theme.colors[colorMode];
    const variables: Record<string, string> = {};

    // Colors - convert camelCase to kebab-case
    for (const [key, value] of Object.entries(colors)) {
      const kebabKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      variables[`--color-${kebabKey}`] = value;
    }

    // Typography
    variables['--font-heading'] = theme.typography.fontFamily.heading;
    variables['--font-body'] = theme.typography.fontFamily.body;
    variables['--font-mono'] = theme.typography.fontFamily.mono;

    for (const [key, value] of Object.entries(theme.typography.fontSize)) {
      variables[`--font-size-${key}`] = value;
    }

    // Spacing
    for (const [key, value] of Object.entries(theme.spacing)) {
      variables[`--spacing-${key}`] = value;
    }

    // Border Radius
    for (const [key, value] of Object.entries(theme.borderRadius)) {
      variables[`--radius-${key}`] = value;
    }

    return variables;
  }, [theme, colorMode]);

  const value = useMemo(
    () => ({
      theme,
      colorMode,
      setTheme,
      setColorMode,
      updateColors,
      resetTheme,
      getCSSVariables,
    }),
    [theme, colorMode, setTheme, updateColors, resetTheme, getCSSVariables],
  );

  const cssVars = getCSSVariables();

  return (
    <ThemeContext.Provider value={value}>
      <div style={cssVars as React.CSSProperties}>{children}</div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
