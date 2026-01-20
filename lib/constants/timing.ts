export const TIMING = {
  /** Send cognitive metrics every 30 seconds */
  METRICS_INTERVAL_MS: 30_000,
  /** Click history window for pattern detection */
  CLICK_HISTORY_WINDOW_MS: 60_000,
  /** Cognitive meter animation duration */
  METER_ANIMATION_MS: 500,
  /** Debounce delay for search inputs */
  SEARCH_DEBOUNCE_MS: 300,
  /** Toast notification auto-dismiss */
  TOAST_DURATION_MS: 5_000,
  /** Session timeout warning (25 minutes) */
  SESSION_WARNING_MS: 25 * 60 * 1000,
  /** Session timeout (30 minutes) */
  SESSION_TIMEOUT_MS: 30 * 60 * 1000,
  /** Auto-save draft interval */
  AUTO_SAVE_INTERVAL_MS: 60_000,
  /** Real-time subscription reconnect delay */
  REALTIME_RECONNECT_MS: 3_000,
} as const;

export const RETRY = {
  /** Maximum retry attempts for API calls */
  MAX_ATTEMPTS: 3,
  /** Base delay for exponential backoff */
  BASE_DELAY_MS: 1_000,
  /** Maximum delay cap for retries */
  MAX_DELAY_MS: 10_000,
} as const;

export const ANIMATION = {
  /** Fast transitions (hover effects) */
  FAST_MS: 150,
  /** Normal transitions (UI feedback) */
  NORMAL_MS: 300,
  /** Slow transitions (page transitions) */
  SLOW_MS: 500,
  /** Stagger delay for list animations */
  STAGGER_MS: 50,
} as const;
