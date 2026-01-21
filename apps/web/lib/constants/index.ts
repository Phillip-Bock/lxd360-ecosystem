// Cognitive load constants
export {
  COGNITIVE_LOAD_COLORS,
  COGNITIVE_LOAD_THRESHOLDS,
  type CognitiveLoadLevel,
  getCognitiveLoadLevel,
} from './cognitive-load';
// Learning constants
export {
  COMPLETION,
  CONTENT_LIMITS,
  ENGAGEMENT_WEIGHTS,
  PAGINATION,
  SPACED_REPETITION,
} from './learning';
// Role constants
export {
  ROLE_CATEGORY_MAP,
  ROLE_DISPLAY_NAMES,
  ROLES,
  type Role,
  USER_CATEGORIES,
  type UserCategory,
} from './roles';
// Route constants
export {
  API_ROUTES,
  AUTH_ROUTES,
  getDashboardPath,
  getLegacyRedirect,
  isProtectedPath,
  LEGACY_ROUTE_MAPPINGS,
  PROTECTED_ROUTE_PREFIXES,
  PUBLIC_ROUTES,
  ROLE_DASHBOARD_PATHS,
} from './routes';
// Theme constants
export {
  FLOATING_BADGE_STYLE,
  THEME,
  type Theme,
  type ThemeColors,
  type ThemeMode,
} from './theme';
// Timing constants
export {
  ANIMATION,
  RETRY,
  TIMING,
} from './timing';
