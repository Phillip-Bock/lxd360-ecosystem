// ============================================================================
// COLOR PALETTE
// ============================================================================

export const colors = {
  // Primary brand colors
  primary: '#2563eb',
  primaryHover: '#1d4ed8',
  secondary: '#1e40af',

  // Neutral colors
  white: '#ffffff',
  black: '#000000',
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },

  // Semantic colors
  success: '#22c55e',
  successLight: '#dcfce7',
  warning: '#f59e0b',
  warningLight: '#fef3c7',
  error: '#ef4444',
  errorLight: '#fee2e2',
  info: '#3b82f6',
  infoLight: '#dbeafe',

  // Background colors
  background: '#f3f4f6',
  surface: '#ffffff',
} as const;

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const typography = {
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  monoFontFamily:
    "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",

  sizes: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
  },

  weights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  lineHeights: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  },
} as const;

// ============================================================================
// SPACING
// ============================================================================

export const spacing = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
} as const;

// ============================================================================
// BORDERS
// ============================================================================

export const borders = {
  radius: {
    sm: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
    full: '9999px',
  },
  width: {
    thin: '1px',
    medium: '2px',
    thick: '4px',
  },
} as const;

// ============================================================================
// SHADOWS
// ============================================================================

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
} as const;

// ============================================================================
// BRANDING
// ============================================================================

export const branding = {
  companyName: 'LXD360',
  logoAlt: 'LXD360',
  tagline: 'Learning Experience Design Platform',

  social: {
    twitter: 'https://twitter.com/lxd360',
    linkedin: 'https://linkedin.com/company/lxd360',
    facebook: 'https://facebook.com/lxd360',
  },

  address: '1234 Main Street, Suite 100, Austin, TX 78701',
} as const;

// ============================================================================
// URLS
// ============================================================================

export const getBaseUrl = () => {
  return process.env.NEXT_PUBLIC_APP_URL || 'https://lxd360.com';
};

export const urls = {
  get base() {
    return getBaseUrl();
  },
  get logo() {
    return `${getBaseUrl()}/images/logo.png`;
  },
  get logoWhite() {
    return `${getBaseUrl()}/images/logo-white.png`;
  },
  get login() {
    return `${getBaseUrl()}/login`;
  },
  get dashboard() {
    return `${getBaseUrl()}/dashboard`;
  },
  get support() {
    return `${getBaseUrl()}/support`;
  },
  get privacy() {
    return `${getBaseUrl()}/privacy`;
  },
  get terms() {
    return `${getBaseUrl()}/terms`;
  },
  get unsubscribe() {
    return `${getBaseUrl()}/unsubscribe`;
  },
  get preferences() {
    return `${getBaseUrl()}/settings/notifications`;
  },

  build: (path: string) => `${getBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`,
} as const;

// ============================================================================
// COMPONENT STYLES
// ============================================================================

export const styles = {
  // Container
  container: {
    backgroundColor: colors.background,
    padding: spacing[10],
  } as const,

  // Main content wrapper
  main: {
    backgroundColor: colors.surface,
    borderRadius: borders.radius.lg,
    boxShadow: shadows.md,
    margin: '0 auto',
    maxWidth: '600px',
    overflow: 'hidden' as const,
  } as const,

  // Header section
  header: {
    backgroundColor: colors.surface,
    borderBottom: `1px solid ${colors.gray[200]}`,
    padding: `${spacing[6]} ${spacing[8]}`,
    textAlign: 'center' as const,
  } as const,

  // Content section
  content: {
    padding: spacing[8],
  } as const,

  // Footer section
  footer: {
    backgroundColor: colors.gray[50],
    borderTop: `1px solid ${colors.gray[200]}`,
    padding: `${spacing[6]} ${spacing[8]}`,
    textAlign: 'center' as const,
  } as const,

  // Typography styles
  heading1: {
    color: colors.gray[900],
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.semibold,
    lineHeight: typography.lineHeights.tight,
    margin: `0 0 ${spacing[4]} 0`,
  } as const,

  heading2: {
    color: colors.gray[900],
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
    lineHeight: typography.lineHeights.tight,
    margin: `${spacing[6]} 0 ${spacing[3]} 0`,
  } as const,

  heading3: {
    color: colors.gray[900],
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    lineHeight: typography.lineHeights.tight,
    margin: `${spacing[4]} 0 ${spacing[2]} 0`,
  } as const,

  paragraph: {
    color: colors.gray[700],
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.base,
    lineHeight: typography.lineHeights.relaxed,
    margin: `0 0 ${spacing[4]} 0`,
  } as const,

  mutedText: {
    color: colors.gray[500],
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.normal,
    margin: `0 0 ${spacing[4]} 0`,
  } as const,

  // Button styles
  button: {
    primary: {
      backgroundColor: colors.primary,
      borderRadius: borders.radius.md,
      color: colors.white,
      display: 'inline-block' as const,
      fontFamily: typography.fontFamily,
      fontSize: typography.sizes.base,
      fontWeight: typography.weights.semibold,
      padding: `${spacing[3]} ${spacing[6]}`,
      textAlign: 'center' as const,
      textDecoration: 'none',
    } as const,
    secondary: {
      backgroundColor: colors.gray[100],
      borderRadius: borders.radius.md,
      color: colors.gray[700],
      display: 'inline-block' as const,
      fontFamily: typography.fontFamily,
      fontSize: typography.sizes.base,
      fontWeight: typography.weights.semibold,
      padding: `${spacing[3]} ${spacing[6]}`,
      textAlign: 'center' as const,
      textDecoration: 'none',
    } as const,
  } as const,

  // Link styles
  link: {
    color: colors.primary,
    textDecoration: 'none',
  } as const,

  // Info box styles
  infoBox: {
    default: {
      backgroundColor: colors.gray[50],
      borderLeft: `${borders.width.thick} solid ${colors.primary}`,
      borderRadius: borders.radius.md,
      margin: `${spacing[5]} 0`,
      padding: spacing[4],
    } as const,
    success: {
      backgroundColor: colors.successLight,
      borderLeft: `${borders.width.thick} solid ${colors.success}`,
      borderRadius: borders.radius.md,
      margin: `${spacing[5]} 0`,
      padding: spacing[4],
    } as const,
    warning: {
      backgroundColor: colors.warningLight,
      borderLeft: `${borders.width.thick} solid ${colors.warning}`,
      borderRadius: borders.radius.md,
      margin: `${spacing[5]} 0`,
      padding: spacing[4],
    } as const,
    error: {
      backgroundColor: colors.errorLight,
      borderLeft: `${borders.width.thick} solid ${colors.error}`,
      borderRadius: borders.radius.md,
      margin: `${spacing[5]} 0`,
      padding: spacing[4],
    } as const,
    info: {
      backgroundColor: colors.infoLight,
      borderLeft: `${borders.width.thick} solid ${colors.info}`,
      borderRadius: borders.radius.md,
      margin: `${spacing[5]} 0`,
      padding: spacing[4],
    } as const,
  } as const,

  // Divider
  divider: {
    borderTop: `1px solid ${colors.gray[200]}`,
    margin: `${spacing[6]} 0`,
  } as const,

  // Code block
  code: {
    backgroundColor: colors.gray[100],
    borderRadius: borders.radius.sm,
    fontFamily: typography.monoFontFamily,
    fontSize: typography.sizes.sm,
    padding: `${spacing[1]} ${spacing[2]}`,
  } as const,

  // Table styles
  table: {
    container: {
      borderCollapse: 'collapse' as const,
      width: '100%',
    } as const,
    header: {
      backgroundColor: colors.gray[50],
      borderBottom: `2px solid ${colors.gray[200]}`,
      color: colors.gray[700],
      fontFamily: typography.fontFamily,
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.semibold,
      padding: spacing[3],
      textAlign: 'left' as const,
    } as const,
    cell: {
      borderBottom: `1px solid ${colors.gray[200]}`,
      color: colors.gray[700],
      fontFamily: typography.fontFamily,
      fontSize: typography.sizes.sm,
      padding: spacing[3],
    } as const,
  } as const,
} as const;

// ============================================================================
// THEME EXPORT
// ============================================================================

export const theme = {
  colors,
  typography,
  spacing,
  borders,
  shadows,
  branding,
  urls,
  styles,
} as const;

export default theme;
