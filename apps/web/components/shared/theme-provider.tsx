'use client';

import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from 'next-themes';
import type * as React from 'react';

/**
 * ThemeProvider - Wrapper component for theme context
 *
 * @component
 * @param {ThemeProviderProps} props - Props passed to NextThemesProvider
 * @returns {JSX.Element} Theme provider wrapping children
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps): React.JSX.Element {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
