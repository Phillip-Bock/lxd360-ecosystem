'use client';

import { usePathname } from 'next/navigation';
import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';

type ThemeContextType = 'public' | 'internal' | 'inspire';
type ThemeMode = 'dark' | 'light';

interface ThemeContextValue {
  context: ThemeContextType;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const pathname = usePathname();
  const [mode, setModeState] = useState<ThemeMode>('dark');

  // Determine context based on route
  const getContext = (): ThemeContextType => {
    if (pathname?.startsWith('/inspire')) return 'inspire';
    if (
      pathname?.startsWith('/dashboard') ||
      pathname?.startsWith('/admin') ||
      pathname?.startsWith('/instructor')
    ) {
      return 'internal';
    }
    return 'public';
  };

  const context = getContext();

  // Load user preference from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(`theme-mode-${context}`);
    if (stored === 'light' || stored === 'dark') {
      setModeState(stored);
    }
  }, [context]);

  // Update document attribute when theme changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', `${context}-${mode}`);
  }, [context, mode]);

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    localStorage.setItem(`theme-mode-${context}`, newMode);
  };

  return (
    <ThemeContext.Provider value={{ context, mode, setMode }}>{children}</ThemeContext.Provider>
  );
}
