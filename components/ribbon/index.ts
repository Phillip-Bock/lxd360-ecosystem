// Ribbon UI Component System
// Microsoft Office-style ribbon interface built on shadcn/ui + Radix + Tailwind 4

// Phase 4 presets
export {
  AssessmentRibbon,
  type AssessmentRibbonProps,
  type BackstagePanel,
  INSPIRE_PHASES,
  type InspirePhase,
  InspireStudioRibbon,
  type InspireStudioRibbonProps,
  LessonEditorRibbon,
  type LessonEditorRibbonProps,
  QUESTION_TYPES,
  type QuestionType,
} from './presets';
// Phase 1 exports
export { Ribbon, RibbonContent } from './ribbon';
// Phase 3 exports
export {
  AnimatedPresence,
  ribbonAnimations,
  ribbonKeyframes,
  Shimmer,
  StaggeredList,
} from './ribbon-animations';
export { RibbonBackstage, RibbonBackstageTrigger } from './ribbon-backstage';
// Phase 4 exports - INSPIRE Studio Integration
export {
  type BreadcrumbItem,
  CourseBreadcrumb,
  type CourseBreadcrumbProps,
  RibbonBreadcrumb,
  RibbonBreadcrumbDropdown,
  type RibbonBreadcrumbDropdownProps,
  type RibbonBreadcrumbProps,
} from './ribbon-breadcrumb';
export { RibbonButton } from './ribbon-button';
export { RibbonCollapse } from './ribbon-collapse';
export { DEFAULT_COLORS, RibbonColorPicker } from './ribbon-color-picker';
export { RibbonCombobox } from './ribbon-combobox';
export { RibbonProvider, useRibbon } from './ribbon-context';
export {
  type ContextualTabConfig,
  ContextualTabContent,
  ContextualTabProvider,
  ContextualTabs,
  ContextualTabTrigger,
  useContextualTabs,
  useImageContextualTab,
  useShapeContextualTab,
  useTableContextualTab,
  useVideoContextualTab,
} from './ribbon-contextual-tab';
export { RibbonDropdown } from './ribbon-dropdown';
// Phase 2 exports
export { type GalleryItem, RibbonGallery } from './ribbon-gallery';
export { RibbonGroup } from './ribbon-group';
export {
  KeytipBadge,
  KeytipProvider,
  useKeytip,
  useKeytips,
  WithKeytip,
} from './ribbon-keytips';
export {
  RibbonContentWrapper,
  RibbonMinimizeButton,
  useDoubleClickMinimize,
} from './ribbon-minimize';
export { RibbonQuickAccess } from './ribbon-quick-access';
export {
  type RibbonCommand,
  RibbonCommandPalette,
  RibbonSearchInput,
  RibbonSearchProvider,
  RibbonSearchTrigger,
  useRibbonSearch,
} from './ribbon-search';
export { RibbonSeparator } from './ribbon-separator';
export { RibbonSplitButton } from './ribbon-split-button';
export {
  CursorPositionStatus,
  type CursorPositionStatusProps,
  PageStatus,
  type PageStatusProps,
  RibbonStatusBar,
  type RibbonStatusBarProps,
  SaveStatus,
  type SaveStatusProps,
  type StatusBarItem,
  WordCountStatus,
  type WordCountStatusProps,
} from './ribbon-status-bar';
export { RibbonTab, RibbonTabList, RibbonTabPanel, RibbonTabs } from './ribbon-tabs';
export {
  type RibbonTheme,
  RibbonThemeProvider,
  useRibbonTheme,
  useThemeClasses,
} from './ribbon-theme';
export { RibbonToggleGroup } from './ribbon-toggle-group';
export {
  RibbonZoom,
  type RibbonZoomProps,
  RibbonZoomSlider,
  type RibbonZoomSliderProps,
} from './ribbon-zoom';
export { useRibbonKeyboard, useRibbonShortcuts } from './use-ribbon-keyboard';
