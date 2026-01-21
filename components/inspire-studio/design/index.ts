/**
 * INSPIRE Studio - Global Theme Engine
 *
 * Design tab components for managing colors, typography, and block styles.
 * Replaces traditional "Slide Masters" with a CSS Variable system.
 *
 * @module components/inspire-studio/design
 */

// =============================================================================
// Main Components
// =============================================================================

export {
  BlockStylePresets,
  DEFAULT_BLOCK_STYLES,
  default as BlockStylePresetsComponent,
} from './BlockStylePresets';
export {
  ColorPaletteManager,
  DEFAULT_DARK_PALETTE,
  DEFAULT_LIGHT_PALETTE,
  default as ColorPaletteManagerComponent,
} from './ColorPaletteManager';
export { default as ThemeEditorComponent, ThemeEditor } from './ThemeEditor';
export { default as ThemePreviewCardComponent, ThemePreviewCard } from './ThemePreviewCard';
export {
  DEFAULT_TYPOGRAPHY,
  default as TypographyManagerComponent,
  TypographyManager,
} from './TypographyManager';

// =============================================================================
// Types
// =============================================================================

export type { BlockStyleConfig } from './BlockStylePresets';
export type { ColorPalette } from './ColorPaletteManager';
export type { ThemeConfig } from './ThemePreviewCard';
export type { TypographyConfig } from './TypographyManager';
