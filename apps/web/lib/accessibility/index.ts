// ============================================================================
// Focus Management
// ============================================================================

export {
  // Screen reader
  announce,
  announceAssertive,
  announcePolite,
  clearAnnouncements,
  clearFocusStack,
  // Focus trap
  createFocusTrap,
  FOCUSABLE_SELECTOR,
  type FocusTrap,
  type FocusTrapOptions,
  // Selectors
  focusableSelector,
  focusWhenReady,
  focusWithin,
  getActiveElement,
  getFirstFocusable,
  getFocusableElements,
  getLastFocusable,
  // Focus ring
  initFocusRingManagement,
  // Query functions
  isFocusable,
  isUsingKeyboard,
  type LiveRegionOptions,
  type RovingTabindexOptions,
  restoreFocus,
  // Focus save/restore
  saveFocus,
  // Roving tabindex
  setupRovingTabindex,
  TABBABLE_SELECTOR,
  tabbableSelector,
} from './focus-management';

// ============================================================================
// Color Utilities
// ============================================================================

export {
  adjustForContrast,
  type ColorBlindnessType,
  type ContrastResult,
  checkContrast,
  // Constants
  contrastRatios,
  generateAccessiblePalette,
  getContrastRatio,
  // CSS utilities
  getCssVariable,
  getFocusRingStyles,
  getReadableTextColor,
  // Contrast calculations
  getRelativeLuminance,
  type HSL,
  hslToRgb,
  // Preference detection
  isHighContrastMode,
  onPreferenceChange,
  // Color parsing
  parseColor,
  prefersDarkMode,
  prefersReducedMotion,
  // Types
  type RGB,
  rgbToHex,
  rgbToHsl,
  setCssVariable,
  // Color blindness
  simulateColorBlindness,
} from './color-utils';

// ============================================================================
// Axe DevTools (Development Only)
// ============================================================================

export {
  AxeAccessibilityProvider,
  type AxeResults,
  type AxeViolation,
  useAxeContext,
} from './axe-init';
