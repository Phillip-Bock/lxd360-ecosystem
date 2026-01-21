'use client';

import { useCallback, useEffect, useRef } from 'react';
import type { BlockStyleConfig } from '@/components/inspire-studio/design/BlockStylePresets';
import type { ColorPalette } from '@/components/inspire-studio/design/ColorPaletteManager';
import type { ThemeConfig } from '@/components/inspire-studio/design/ThemePreviewCard';
import type { TypographyConfig } from '@/components/inspire-studio/design/TypographyManager';

// =============================================================================
// Types
// =============================================================================

interface UseThemeSyncOptions {
  /** Root element to apply CSS variables to. Defaults to document.documentElement */
  rootElement?: HTMLElement | null;
  /** Whether to sync immediately on mount. Defaults to true */
  syncOnMount?: boolean;
  /** Prefix for CSS variable names. Defaults to 'inspire' */
  prefix?: string;
}

interface UseThemeSyncReturn {
  /** Apply a theme to CSS variables */
  applyTheme: (theme: ThemeConfig) => void;
  /** Apply only colors */
  applyColors: (palette: ColorPalette) => void;
  /** Apply only typography */
  applyTypography: (typography: TypographyConfig) => void;
  /** Apply only block styles */
  applyBlockStyles: (blockStyles: BlockStyleConfig) => void;
  /** Clear all theme CSS variables */
  clearTheme: () => void;
  /** Get current CSS variable value */
  getVariable: (name: string) => string;
}

// =============================================================================
// Shadow CSS Values
// =============================================================================

const SHADOW_VALUES: Record<string, string> = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
};

// =============================================================================
// useThemeSync Hook
// =============================================================================

export function useThemeSync(
  theme: ThemeConfig | null,
  options: UseThemeSyncOptions = {},
): UseThemeSyncReturn {
  const { rootElement, syncOnMount = true, prefix = 'inspire' } = options;

  // Track all applied CSS variables for cleanup
  const appliedVariables = useRef<Set<string>>(new Set());

  // Get the root element
  const getRoot = useCallback((): HTMLElement | null => {
    if (rootElement !== undefined) {
      return rootElement;
    }
    if (typeof document !== 'undefined') {
      return document.documentElement;
    }
    return null;
  }, [rootElement]);

  // Set a CSS variable
  const setVariable = useCallback(
    (name: string, value: string) => {
      const root = getRoot();
      if (!root) return;

      const varName = `--${prefix}-${name}`;
      root.style.setProperty(varName, value);
      appliedVariables.current.add(varName);
    },
    [getRoot, prefix],
  );

  // Get a CSS variable value
  const getVariable = useCallback(
    (name: string): string => {
      const root = getRoot();
      if (!root) return '';

      const varName = `--${prefix}-${name}`;
      return getComputedStyle(root).getPropertyValue(varName).trim();
    },
    [getRoot, prefix],
  );

  // Clear a CSS variable
  const clearVariable = useCallback(
    (name: string) => {
      const root = getRoot();
      if (!root) return;

      root.style.removeProperty(name);
      appliedVariables.current.delete(name);
    },
    [getRoot],
  );

  // Apply color palette to CSS variables
  const applyColors = useCallback(
    (palette: ColorPalette) => {
      setVariable('color-primary', palette.primary);
      setVariable('color-secondary', palette.secondary);
      setVariable('color-accent', palette.accent);
      setVariable('color-background', palette.background);
      setVariable('color-surface', palette.surface);
      setVariable('color-text', palette.text);
      setVariable('color-text-secondary', palette.textSecondary);
      setVariable('color-border', palette.border);
      setVariable('color-success', palette.success);
      setVariable('color-warning', palette.warning);
      setVariable('color-error', palette.error);
    },
    [setVariable],
  );

  // Apply typography to CSS variables
  const applyTypography = useCallback(
    (typography: TypographyConfig) => {
      setVariable('font-heading', typography.headingFont);
      setVariable('font-body', typography.bodyFont);
      setVariable('font-mono', typography.monoFont);
      setVariable('font-size-base', `${typography.baseSize}px`);
      setVariable('font-scale', String(typography.scaleRatio));
      setVariable('line-height', String(typography.lineHeight));
      setVariable('letter-spacing', `${typography.letterSpacing}em`);

      // Calculate and set font size scale
      const sizes = {
        xs: Math.round(typography.baseSize / typography.scaleRatio),
        sm: Math.round(typography.baseSize / Math.sqrt(typography.scaleRatio)),
        base: typography.baseSize,
        lg: Math.round(typography.baseSize * Math.sqrt(typography.scaleRatio)),
        xl: Math.round(typography.baseSize * typography.scaleRatio),
        '2xl': Math.round(typography.baseSize * typography.scaleRatio ** 2),
        '3xl': Math.round(typography.baseSize * typography.scaleRatio ** 3),
        '4xl': Math.round(typography.baseSize * typography.scaleRatio ** 4),
      };

      Object.entries(sizes).forEach(([key, value]) => {
        setVariable(`font-size-${key}`, `${value}px`);
      });
    },
    [setVariable],
  );

  // Apply block styles to CSS variables
  const applyBlockStyles = useCallback(
    (blockStyles: BlockStyleConfig) => {
      setVariable('radius', `${blockStyles.borderRadius}px`);
      setVariable('radius-sm', `${Math.round(blockStyles.borderRadius / 2)}px`);
      setVariable('radius-lg', `${Math.round(blockStyles.borderRadius * 1.5)}px`);
      setVariable('border-width', `${blockStyles.borderWidth}px`);
      setVariable('shadow', SHADOW_VALUES[blockStyles.shadowSize] ?? 'none');
      setVariable('container-padding', `${blockStyles.containerPadding}px`);
      setVariable('block-gap', `${blockStyles.blockGap}px`);
      setVariable('animation-duration', `${blockStyles.animationDuration}ms`);
      setVariable('animation-easing', blockStyles.animationEasing);
    },
    [setVariable],
  );

  // Apply complete theme
  const applyTheme = useCallback(
    (themeConfig: ThemeConfig) => {
      applyColors(themeConfig.palette);
      applyTypography(themeConfig.typography);
      applyBlockStyles(themeConfig.blockStyles);
    },
    [applyColors, applyTypography, applyBlockStyles],
  );

  // Clear all theme CSS variables
  const clearTheme = useCallback(() => {
    appliedVariables.current.forEach((varName) => {
      clearVariable(varName);
    });
    appliedVariables.current.clear();
  }, [clearVariable]);

  // Sync theme on mount and when theme changes
  useEffect(() => {
    if (!theme) return;

    if (syncOnMount) {
      applyTheme(theme);
    }

    // Cleanup on unmount
    return () => {
      // Optionally clear variables on unmount
      // clearTheme();
    };
  }, [theme, syncOnMount, applyTheme]);

  return {
    applyTheme,
    applyColors,
    applyTypography,
    applyBlockStyles,
    clearTheme,
    getVariable,
  };
}

// =============================================================================
// CSS Variable Generator (for build-time)
// =============================================================================

export function generateThemeCSSVariables(theme: ThemeConfig, prefix = 'inspire'): string {
  const lines: string[] = [];

  // Colors
  lines.push(`  --${prefix}-color-primary: ${theme.palette.primary};`);
  lines.push(`  --${prefix}-color-secondary: ${theme.palette.secondary};`);
  lines.push(`  --${prefix}-color-accent: ${theme.palette.accent};`);
  lines.push(`  --${prefix}-color-background: ${theme.palette.background};`);
  lines.push(`  --${prefix}-color-surface: ${theme.palette.surface};`);
  lines.push(`  --${prefix}-color-text: ${theme.palette.text};`);
  lines.push(`  --${prefix}-color-text-secondary: ${theme.palette.textSecondary};`);
  lines.push(`  --${prefix}-color-border: ${theme.palette.border};`);
  lines.push(`  --${prefix}-color-success: ${theme.palette.success};`);
  lines.push(`  --${prefix}-color-warning: ${theme.palette.warning};`);
  lines.push(`  --${prefix}-color-error: ${theme.palette.error};`);

  // Typography
  lines.push(`  --${prefix}-font-heading: ${theme.typography.headingFont};`);
  lines.push(`  --${prefix}-font-body: ${theme.typography.bodyFont};`);
  lines.push(`  --${prefix}-font-mono: ${theme.typography.monoFont};`);
  lines.push(`  --${prefix}-font-size-base: ${theme.typography.baseSize}px;`);
  lines.push(`  --${prefix}-line-height: ${theme.typography.lineHeight};`);
  lines.push(`  --${prefix}-letter-spacing: ${theme.typography.letterSpacing}em;`);

  // Block Styles
  lines.push(`  --${prefix}-radius: ${theme.blockStyles.borderRadius}px;`);
  lines.push(`  --${prefix}-border-width: ${theme.blockStyles.borderWidth}px;`);
  lines.push(`  --${prefix}-shadow: ${SHADOW_VALUES[theme.blockStyles.shadowSize] ?? 'none'};`);
  lines.push(`  --${prefix}-container-padding: ${theme.blockStyles.containerPadding}px;`);
  lines.push(`  --${prefix}-block-gap: ${theme.blockStyles.blockGap}px;`);
  lines.push(`  --${prefix}-animation-duration: ${theme.blockStyles.animationDuration}ms;`);
  lines.push(`  --${prefix}-animation-easing: ${theme.blockStyles.animationEasing};`);

  return `:root {\n${lines.join('\n')}\n}`;
}

export default useThemeSync;
