import { Inter, JetBrains_Mono, Plus_Jakarta_Sans } from 'next/font/google';

// ============================================================================
// Primary Font - Inter
// ============================================================================

/**
 * Inter - Primary body font
 * Used for: Body text, UI elements, forms
 */
export const inter = Inter({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
  fallback: [
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'Helvetica Neue',
    'Arial',
    'sans-serif',
  ],
});

// ============================================================================
// Display Font - Plus Jakarta Sans
// ============================================================================

/**
 * Plus Jakarta Sans - Display/Heading font
 * Used for: Headings, hero text, emphasis
 */
export const plusJakartaSans = Plus_Jakarta_Sans({
  weight: ['500', '600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-plus-jakarta-sans',
  display: 'swap',
  preload: true,
  fallback: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
});

// ============================================================================
// Monospace Font - JetBrains Mono
// ============================================================================

/**
 * JetBrains Mono - Monospace/Code font
 * Used for: Code blocks, technical content, data tables
 */
export const jetbrainsMono = JetBrains_Mono({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
  preload: false, // Not critical - load async
  fallback: ['SF Mono', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
});

// ============================================================================
// Font Class String
// ============================================================================

/**
 * Combined font variable class string for the body element
 * Usage: <body className={fontVariables}>
 */
export const fontVariables = `${inter.variable} ${plusJakartaSans.variable} ${jetbrainsMono.variable}`;

// ============================================================================
// Font Family CSS Variables
// ============================================================================

/**
 * CSS variable names for use in Tailwind config or CSS
 */
export const fontFamilyVars = {
  sans: 'var(--font-inter)',
  display: 'var(--font-plus-jakarta-sans)',
  mono: 'var(--font-jetbrains-mono)',
} as const;

// ============================================================================
// Font Loading Status
// ============================================================================

/**
 * Check if fonts have loaded (client-side only)
 */
export function areFontsLoaded(): boolean {
  if (typeof document === 'undefined') return false;
  return document.fonts.status === 'loaded';
}

/**
 * Wait for fonts to load
 */
export async function waitForFonts(): Promise<void> {
  if (typeof document === 'undefined') return;
  await document.fonts.ready;
}

// ============================================================================
// Re-exports for convenience
// ============================================================================

export { inter as primaryFont, plusJakartaSans as displayFont, jetbrainsMono as monoFont };
