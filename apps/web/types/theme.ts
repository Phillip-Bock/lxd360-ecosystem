/**
 * Theme System Types - Customizable branding and styling
 */

export interface ThemeColors {
  // Brand
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  accent: string;
  accentForeground: string;

  // Semantic
  success: string;
  warning: string;
  error: string;
  info: string;

  // UI
  background: string;
  foreground: string;
  muted: string;
  mutedForeground: string;
  border: string;
  ring: string;

  // Interactive
  buttonPrimary: string;
  buttonSecondary: string;
  linkColor: string;
  linkHover: string;
}

export interface ThemeTypography {
  fontFamily: {
    heading: string;
    body: string;
    mono: string;
  };
  fontSize: {
    h1: string;
    h2: string;
    h3: string;
    h4: string;
    body: string;
    small: string;
    tiny: string;
  };
  fontWeight: {
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
  };
}

export interface ThemeSpacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
}

export interface ThemeBorderRadius {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  full: string;
}

export interface Theme {
  id: string;
  name: string;
  description?: string;
  colors: {
    light: ThemeColors;
    dark: ThemeColors;
  };
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  borderRadius: ThemeBorderRadius;
  logo?: {
    light?: string;
    dark?: string;
  };
  createdAt: string;
  updatedAt: string;
  isDefault?: boolean;
  organizationId?: string;
}

export const DEFAULT_THEME: Theme = {
  id: 'default',
  name: 'INSPIRE Default',
  description: 'Neural-futuristic theme with cyan accents',
  colors: {
    light: {
      primary: '#00d4ff',
      primaryForeground: '#0a0a0f',
      secondary: '#8b5cf6',
      secondaryForeground: '#ffffff',
      accent: '#f59e0b',
      accentForeground: '#0a0a0f',
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
      background: '#ffffff',
      foreground: '#0a0a0f',
      muted: '#f4f4f5',
      mutedForeground: '#71717a',
      border: '#e4e4e7',
      ring: '#00d4ff',
      buttonPrimary: '#00d4ff',
      buttonSecondary: '#8b5cf6',
      linkColor: '#00d4ff',
      linkHover: '#00b8e6',
    },
    dark: {
      primary: '#00d4ff',
      primaryForeground: '#0a0a0f',
      secondary: '#8b5cf6',
      secondaryForeground: '#ffffff',
      accent: '#f59e0b',
      accentForeground: '#0a0a0f',
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
      background: '#0a0a0f',
      foreground: '#fafafa',
      muted: '#1a1a2e',
      mutedForeground: '#a1a1aa',
      border: '#27272a',
      ring: '#00d4ff',
      buttonPrimary: '#00d4ff',
      buttonSecondary: '#8b5cf6',
      linkColor: '#00d4ff',
      linkHover: '#00b8e6',
    },
  },
  typography: {
    fontFamily: {
      heading: 'Inter, system-ui, sans-serif',
      body: 'Inter, system-ui, sans-serif',
      mono: 'JetBrains Mono, monospace',
    },
    fontSize: {
      h1: '2.25rem',
      h2: '1.875rem',
      h3: '1.5rem',
      h4: '1.25rem',
      body: '1rem',
      small: '0.875rem',
      tiny: '0.75rem',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
  },
  borderRadius: {
    none: '0',
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    full: '9999px',
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isDefault: true,
};
