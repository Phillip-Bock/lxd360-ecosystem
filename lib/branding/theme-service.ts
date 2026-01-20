// ============================================================================
// Types
// ============================================================================

export interface ThemeColors {
  primary: Record<string, string>;
  secondary: Record<string, string>;
  orange: Record<string, string>;
  yellow: Record<string, string>;
  green: Record<string, string>;
  red: Record<string, string>;
  purple: Record<string, string>;
  magenta: Record<string, string>;
  pink: Record<string, string>;
  brown: Record<string, string>;
  black: Record<string, string>;
  white: Record<string, string>;
}

export interface ButtonTokens {
  radius: number;
  paddingX: number;
  paddingY: number;
  fontSize: number;
  fontWeight: number;
  shadowBlur: number;
  shadowSpread: number;
}

export interface CardTokens {
  padding: number;
  radius: number;
  shadowBlur: number;
  borderWidth: number;
}

export interface InputTokens {
  height: number;
  padding: number;
  radius: number;
  borderWidth: number;
}

export interface ToggleTokens {
  width: number;
  height: number;
  thumbSize: number;
}

export interface TypographyConfig {
  fontFamily: string;
  displayFontFamily: string;
  baseSize: number;
  scaleRatio: number;
  lineHeight: number;
  letterSpacing: number;
}

export interface ThemeConfiguration {
  id: string;
  tenantId: string;
  name: string;
  version: string;
  status: 'draft' | 'published' | 'archived';
  colors: ThemeColors;
  buttonTokens: ButtonTokens;
  cardTokens: CardTokens;
  inputTokens: InputTokens;
  toggleTokens: ToggleTokens;
  typography: TypographyConfig;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

// ============================================================================
// Default Theme
// ============================================================================

export const defaultTheme: Omit<ThemeConfiguration, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'> =
  {
    name: 'LXD360 Default',
    version: '1.0.0',
    status: 'draft',
    colors: {
      primary: {
        '50': 'hsl(214 100% 97%)',
        '100': 'hsl(214 95% 93%)',
        '200': 'hsl(213 97% 87%)',
        '300': 'hsl(212 96% 78%)',
        '400': 'hsl(213 94% 68%)',
        '500': 'hsl(217 91% 60%)',
        '600': 'hsl(221 83% 53%)',
        '700': 'hsl(224 76% 48%)',
        '800': 'hsl(226 71% 40%)',
        '900': 'hsl(224 64% 33%)',
        '950': 'hsl(226 57% 21%)',
      },
      secondary: {
        '50': 'hsl(220 70% 96%)',
        '500': 'hsl(220 70% 45%)',
        '900': 'hsl(220 70% 18%)',
      },
      orange: {
        '500': 'hsl(25 95% 53%)',
      },
      yellow: {
        '500': 'hsl(45 93% 47%)',
      },
      green: {
        '500': 'hsl(142 71% 45%)',
      },
      red: {
        '500': 'hsl(0 84% 60%)',
      },
      purple: {
        '500': 'hsl(271 91% 65%)',
      },
      magenta: {
        '500': 'hsl(330 81% 60%)',
      },
      pink: {
        '500': 'hsl(350 89% 60%)',
      },
      brown: {
        '500': 'hsl(30 50% 45%)',
      },
      black: {
        '500': 'hsl(0 0% 45%)',
      },
      white: {
        '500': 'hsl(0 0% 92%)',
      },
    },
    buttonTokens: {
      radius: 8,
      paddingX: 16,
      paddingY: 8,
      fontSize: 14,
      fontWeight: 500,
      shadowBlur: 12,
      shadowSpread: 0,
    },
    cardTokens: {
      padding: 24,
      radius: 16,
      shadowBlur: 12,
      borderWidth: 1,
    },
    inputTokens: {
      height: 40,
      padding: 16,
      radius: 8,
      borderWidth: 1,
    },
    toggleTokens: {
      width: 44,
      height: 24,
      thumbSize: 20,
    },
    typography: {
      fontFamily: 'Geist, system-ui, sans-serif',
      displayFontFamily: "'Space Grotesk', sans-serif",
      baseSize: 16,
      scaleRatio: 1.25,
      lineHeight: 1.5,
      letterSpacing: 0,
    },
  };

// ============================================================================
// Generate CSS from Theme
// ============================================================================

export function generateThemeCSS(theme: Partial<ThemeConfiguration>): string {
  const t = { ...defaultTheme, ...theme };
  const lines: string[] = [
    '/**',
    ' * =============================================================================',
    ` * ${t.name} | Theme Configuration`,
    ' * =============================================================================',
    ' *',
    ' * @fileoverview Auto-generated theme configuration file',
    ` * @version      ${t.version}`,
    ` * @generated    ${new Date().toISOString()}`,
    ' *',
    ' * =============================================================================',
    ' */',
    '',
    ':root {',
    '  /* ==========================================================================',
    '     Color Tokens',
    '     ========================================================================== */',
  ];

  // Add color variables
  Object.entries(t.colors).forEach(([family, shades]) => {
    lines.push(``, `  /* ${family.charAt(0).toUpperCase() + family.slice(1)} */`);
    Object.entries(shades as Record<string, string>).forEach(([shade, value]) => {
      lines.push(`  --${family}-${shade}: ${value};`);
    });
  });

  // Add button tokens
  lines.push(
    ``,
    `  /* ==========================================================================`,
    `     Button Tokens`,
    `     ========================================================================== */`,
  );
  lines.push(`  --btn-radius: ${t.buttonTokens.radius}px;`);
  lines.push(`  --btn-padding-x: ${t.buttonTokens.paddingX}px;`);
  lines.push(`  --btn-padding-y: ${t.buttonTokens.paddingY}px;`);
  lines.push(`  --btn-font-size: ${t.buttonTokens.fontSize}px;`);
  lines.push(`  --btn-font-weight: ${t.buttonTokens.fontWeight};`);
  lines.push(`  --btn-shadow-blur: ${t.buttonTokens.shadowBlur}px;`);
  lines.push(`  --btn-shadow-spread: ${t.buttonTokens.shadowSpread}px;`);

  // Add card tokens
  lines.push(
    ``,
    `  /* ==========================================================================`,
    `     Card Tokens`,
    `     ========================================================================== */`,
  );
  lines.push(`  --card-padding: ${t.cardTokens.padding}px;`);
  lines.push(`  --card-radius: ${t.cardTokens.radius}px;`);
  lines.push(`  --card-shadow-blur: ${t.cardTokens.shadowBlur}px;`);
  lines.push(`  --card-border-width: ${t.cardTokens.borderWidth}px;`);

  // Add input tokens
  lines.push(
    ``,
    `  /* ==========================================================================`,
    `     Input Tokens`,
    `     ========================================================================== */`,
  );
  lines.push(`  --input-height: ${t.inputTokens.height}px;`);
  lines.push(`  --input-padding: ${t.inputTokens.padding}px;`);
  lines.push(`  --input-radius: ${t.inputTokens.radius}px;`);
  lines.push(`  --input-border-width: ${t.inputTokens.borderWidth}px;`);

  // Add toggle tokens
  lines.push(
    ``,
    `  /* ==========================================================================`,
    `     Toggle Tokens`,
    `     ========================================================================== */`,
  );
  lines.push(`  --toggle-width: ${t.toggleTokens.width}px;`);
  lines.push(`  --toggle-height: ${t.toggleTokens.height}px;`);
  lines.push(`  --toggle-thumb-size: ${t.toggleTokens.thumbSize}px;`);

  // Add typography
  lines.push(
    ``,
    `  /* ==========================================================================`,
    `     Typography`,
    `     ========================================================================== */`,
  );
  lines.push(`  --font-sans: ${t.typography.fontFamily};`);
  lines.push(`  --font-display: ${t.typography.displayFontFamily};`);
  lines.push(`  --font-size-base: ${t.typography.baseSize}px;`);
  lines.push(`  --line-height: ${t.typography.lineHeight};`);
  lines.push(`  --letter-spacing: ${t.typography.letterSpacing}em;`);
  lines.push(`  --scale-ratio: ${t.typography.scaleRatio};`);

  // Generate type scale
  lines.push(``, `  /* Generated Type Scale */`);
  const scales = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl'];
  scales.forEach((scale, index) => {
    const size = t.typography.baseSize * t.typography.scaleRatio ** (index - 2);
    lines.push(`  --font-size-${scale}: ${size.toFixed(2)}px;`);
  });

  lines.push(`}`);

  return lines.join('\n');
}

// ============================================================================
// Generate TSX Theme File
// ============================================================================

export function generateThemeTSX(theme: Partial<ThemeConfiguration>): string {
  const t = { ...defaultTheme, ...theme };

  return `/**
 * =============================================================================
 * ${t.name} | Theme Configuration
 * =============================================================================
 *
 * @fileoverview Auto-generated theme configuration file
 * @version      ${t.version}
 * @generated    ${new Date().toISOString()}
 *
 * =============================================================================
 */

export const theme = ${JSON.stringify(
    {
      name: t.name,
      version: t.version,
      colors: t.colors,
      buttonTokens: t.buttonTokens,
      cardTokens: t.cardTokens,
      inputTokens: t.inputTokens,
      toggleTokens: t.toggleTokens,
      typography: t.typography,
    },
    null,
    2,
  )} as const;

export type Theme = typeof theme;

// ============================================================================
// Helper Functions
// ============================================================================

export function getColor(family: keyof typeof theme.colors, shade: string): string {
  return theme.colors[family]?.[shade] ?? '';
}

export function getButtonToken<K extends keyof typeof theme.buttonTokens>(key: K): typeof theme.buttonTokens[K] {
  return theme.buttonTokens[key];
}

export function getCardToken<K extends keyof typeof theme.cardTokens>(key: K): typeof theme.cardTokens[K] {
  return theme.cardTokens[key];
}
`;
}

// ============================================================================
// Generate JSON Theme
// ============================================================================

export function generateThemeJSON(theme: Partial<ThemeConfiguration>): string {
  const t = { ...defaultTheme, ...theme };
  return JSON.stringify(
    {
      name: t.name,
      version: t.version,
      colors: t.colors,
      tokens: {
        button: t.buttonTokens,
        card: t.cardTokens,
        input: t.inputTokens,
        toggle: t.toggleTokens,
      },
      typography: t.typography,
    },
    null,
    2,
  );
}
