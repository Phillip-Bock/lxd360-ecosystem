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
} from './block-style-presets';
export {
  ColorPaletteManager,
  DEFAULT_DARK_PALETTE,
  DEFAULT_LIGHT_PALETTE,
  default as ColorPaletteManagerComponent,
} from './color-palette-manager';
export { default as ThemeEditorComponent, ThemeEditor } from './theme-editor';
export { default as ThemePreviewCardComponent, ThemePreviewCard } from './theme-preview-card';
export {
  DEFAULT_TYPOGRAPHY,
  default as TypographyManagerComponent,
  TypographyManager,
} from './typography-manager';

// =============================================================================
// Types
// =============================================================================

export type { BlockStyleConfig } from './block-style-presets';
export type { ColorPalette } from './color-palette-manager';
export type { ThemeConfig } from './theme-preview-card';
export type { TypographyConfig } from './typography-manager';
