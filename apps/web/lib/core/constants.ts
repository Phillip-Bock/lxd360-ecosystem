/**
 * Application Constants
 * =====================
 * Centralized constants file to eliminate magic numbers and strings.
 *
 * @module lib/constants
 */

// ============================================================================
// PAGINATION
// ============================================================================

export const PAGINATION = {
  /** Default page size for list views */
  DEFAULT_PAGE_SIZE: 20,
  /** Maximum page size allowed */
  MAX_PAGE_SIZE: 100,
  /** Default page size for mobile views */
  MOBILE_PAGE_SIZE: 10,
  /** Page size for infinite scroll */
  INFINITE_SCROLL_SIZE: 15,
} as const;

// ============================================================================
// API LIMITS
// ============================================================================

export const API_LIMITS = {
  /** Maximum file upload size in bytes (10MB) */
  MAX_FILE_SIZE: 10 * 1024 * 1024,
  /** Maximum request body size in bytes (1MB) */
  MAX_BODY_SIZE: 1 * 1024 * 1024,
  /** API rate limit per minute */
  RATE_LIMIT_PER_MINUTE: 100,
  /** Maximum concurrent requests */
  MAX_CONCURRENT_REQUESTS: 10,
  /** Request timeout in milliseconds */
  REQUEST_TIMEOUT_MS: 30000,
  /** Long polling timeout in milliseconds */
  LONG_POLL_TIMEOUT_MS: 60000,
} as const;

// ============================================================================
// AUTHENTICATION
// ============================================================================

export const AUTH = {
  /** Session expiry in seconds (7 days) */
  SESSION_EXPIRY_SECONDS: 7 * 24 * 60 * 60,
  /** Refresh token expiry in seconds (30 days) */
  REFRESH_TOKEN_EXPIRY_SECONDS: 30 * 24 * 60 * 60,
  /** Password minimum length */
  PASSWORD_MIN_LENGTH: 8,
  /** Maximum login attempts before lockout */
  MAX_LOGIN_ATTEMPTS: 5,
  /** Lockout duration in minutes */
  LOCKOUT_DURATION_MINUTES: 15,
  /** OTP expiry in minutes */
  OTP_EXPIRY_MINUTES: 10,
} as const;

// ============================================================================
// CACHING
// ============================================================================

export const CACHE = {
  /** Short cache duration in seconds (5 minutes) */
  SHORT_TTL_SECONDS: 5 * 60,
  /** Medium cache duration in seconds (1 hour) */
  MEDIUM_TTL_SECONDS: 60 * 60,
  /** Long cache duration in seconds (24 hours) */
  LONG_TTL_SECONDS: 24 * 60 * 60,
  /** Static asset cache duration in seconds (1 year) */
  STATIC_TTL_SECONDS: 365 * 24 * 60 * 60,
  /** Stale-while-revalidate window in seconds */
  STALE_WHILE_REVALIDATE_SECONDS: 60,
} as const;

// ============================================================================
// LEARNING PLATFORM
// ============================================================================

export const LEARNING = {
  /** Minimum passing score percentage */
  MIN_PASSING_SCORE: 70,
  /** Maximum quiz attempts allowed */
  MAX_QUIZ_ATTEMPTS: 3,
  /** Session timeout for learning activities in minutes */
  SESSION_TIMEOUT_MINUTES: 30,
  /** Completion threshold percentage */
  COMPLETION_THRESHOLD: 80,
  /** Default video playback rate */
  DEFAULT_PLAYBACK_RATE: 1.0,
  /** Maximum playback rate */
  MAX_PLAYBACK_RATE: 2.0,
  /** Spaced repetition intervals (days) */
  SPACED_REPETITION_INTERVALS: [1, 3, 7, 14, 30, 60] as const,
} as const;

// ============================================================================
// NEXUS (Mentorship Platform)
// ============================================================================

export const NEXUS = {
  /** Maximum connections per mentor */
  MAX_CONNECTIONS_PER_MENTOR: 10,
  /** Session duration options in minutes */
  SESSION_DURATIONS: [30, 45, 60, 90] as const,
  /** Karma points for activities */
  KARMA: {
    MESSAGE_SENT: 1,
    SESSION_COMPLETED: 10,
    GOAL_COMPLETED: 25,
    PATH_COMPLETED: 50,
    POST_CREATED: 5,
    COMMENT_ADDED: 2,
    POST_LIKED_RECEIVED: 2,
    COMMENT_RECEIVED: 1,
  },
  /** Rating scale */
  RATING_MIN: 1,
  RATING_MAX: 5,
} as const;

// ============================================================================
// UI/UX
// ============================================================================

export const UI = {
  /** Toast notification duration in milliseconds */
  TOAST_DURATION_MS: 5000,
  /** Error toast duration in milliseconds */
  ERROR_TOAST_DURATION_MS: 8000,
  /** Animation duration in milliseconds */
  ANIMATION_DURATION_MS: 200,
  /** Debounce delay for search inputs in milliseconds */
  SEARCH_DEBOUNCE_MS: 300,
  /** Throttle delay for scroll events in milliseconds */
  SCROLL_THROTTLE_MS: 100,
  /** Maximum characters for truncated text */
  TRUNCATE_LENGTH: 150,
  /** Sidebar collapse breakpoint in pixels */
  SIDEBAR_BREAKPOINT: 768,
} as const;

// ============================================================================
// ROLES & PERMISSIONS
// ============================================================================

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ORG_ADMIN: 'org_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  INSTRUCTOR: 'instructor',
  MENTOR: 'mentor',
  LEARNER: 'learner',
  MENTEE: 'mentee',
  SUBSCRIBER: 'subscriber',
  USER: 'user',
  GUEST: 'guest',
} as const;

export const ROLE_LEVELS = {
  [ROLES.SUPER_ADMIN]: 100,
  [ROLES.ORG_ADMIN]: 90,
  [ROLES.ADMIN]: 80,
  [ROLES.MANAGER]: 70,
  [ROLES.INSTRUCTOR]: 60,
  [ROLES.MENTOR]: 50,
  [ROLES.LEARNER]: 40,
  [ROLES.MENTEE]: 30,
  [ROLES.SUBSCRIBER]: 20,
  [ROLES.USER]: 10,
  [ROLES.GUEST]: 0,
} as const;

// ============================================================================
// PRODUCTS
// ============================================================================

export const PRODUCTS = {
  LXD360_FE: 'lxd360-fe',
  INSPIRE_STUDIO: 'inspire-studio',
  LXP360_LMS_LRS: 'lxp360-lms-lrs',
  LXD_NEXUS: 'lxd-nexus',
  CONSULTATION: 'consultation',
  LXD_ECOMMERCE: 'lxd-ecommerce',
} as const;

// ============================================================================
// FILE TYPES
// ============================================================================

export const FILE_TYPES = {
  IMAGES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'] as const,
  DOCUMENTS: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ] as const,
  VIDEOS: ['video/mp4', 'video/webm', 'video/ogg'] as const,
  AUDIO: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm'] as const,
  ARCHIVES: [
    'application/zip',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
  ] as const,
} as const;

// ============================================================================
// HTTP STATUS CODES
// ============================================================================

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// ============================================================================
// ERROR CODES
// ============================================================================

export const ERROR_CODES = {
  // Authentication
  AUTH_ERROR: 'AUTH_ERROR',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',

  // Authorization
  FORBIDDEN: 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',

  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',

  // Resource
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  CONFLICT: 'CONFLICT',

  // Rate limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',

  // Server
  SERVER_ERROR: 'SERVER_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR: 'DATABASE_ERROR',
} as const;

// ============================================================================
// REGEX PATTERNS
// ============================================================================

export const PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[1-9]\d{1,14}$/,
  URL: /^https?:\/\/[^\s/$.?#].[^\s]*$/,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
} as const;

// ============================================================================
// EXPORTS
// ============================================================================

const constants = {
  PAGINATION,
  API_LIMITS,
  AUTH,
  CACHE,
  LEARNING,
  NEXUS,
  UI,
  ROLES,
  ROLE_LEVELS,
  PRODUCTS,
  FILE_TYPES,
  HTTP_STATUS,
  ERROR_CODES,
  PATTERNS,
};

export default constants;
