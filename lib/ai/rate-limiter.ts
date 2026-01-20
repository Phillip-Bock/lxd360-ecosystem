import type { AIProvider, AIRateLimitConfig, AIRateLimitState } from './types';

// ============================================================================
// Default Rate Limits
// ============================================================================

const DEFAULT_RATE_LIMITS: Record<AIProvider, AIRateLimitConfig> = {
  openai: {
    provider: 'openai',
    requestsPerMinute: 60,
    tokensPerMinute: 90000,
    tokensPerDay: 1000000,
  },
  anthropic: {
    provider: 'anthropic',
    requestsPerMinute: 50,
    tokensPerMinute: 100000,
    tokensPerDay: 1000000,
  },
  google: {
    provider: 'google',
    requestsPerMinute: 60,
    tokensPerMinute: 1000000,
  },
  gemini: {
    provider: 'gemini',
    requestsPerMinute: 60,
    tokensPerMinute: 1000000,
  },
};

// ============================================================================
// Rate Limit State
// ============================================================================

interface RateLimitWindow {
  requests: number;
  tokens: number;
  windowStart: number;
}

interface DailyTokens {
  tokens: number;
  dayStart: number;
}

const rateLimitState: Map<string, RateLimitWindow> = new Map();
const dailyTokenState: Map<string, DailyTokens> = new Map();

// ============================================================================
// Rate Limiter Class
// ============================================================================

export class AIRateLimiter {
  private config: AIRateLimitConfig;

  constructor(provider: AIProvider, customConfig?: Partial<AIRateLimitConfig>) {
    this.config = {
      ...DEFAULT_RATE_LIMITS[provider],
      ...customConfig,
    };
  }

  /**
   * Get a unique key for the rate limit window
   */
  private getKey(userId?: string): string {
    return userId ? `${this.config.provider}:${userId}` : `${this.config.provider}:global`;
  }

  /**
   * Get or create the rate limit window
   */
  private getWindow(key: string): RateLimitWindow {
    const now = Date.now();
    const existing = rateLimitState.get(key);

    // Check if window has expired (1 minute)
    if (existing && now - existing.windowStart < 60000) {
      return existing;
    }

    const newWindow: RateLimitWindow = {
      requests: 0,
      tokens: 0,
      windowStart: now,
    };
    rateLimitState.set(key, newWindow);
    return newWindow;
  }

  /**
   * Get or create the daily token counter
   */
  private getDailyTokens(key: string): DailyTokens {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const dayStart = startOfDay.getTime();

    const existing = dailyTokenState.get(key);

    if (existing && existing.dayStart === dayStart) {
      return existing;
    }

    const newDaily: DailyTokens = {
      tokens: 0,
      dayStart,
    };
    dailyTokenState.set(key, newDaily);
    return newDaily;
  }

  /**
   * Check if a request can be made
   */
  canMakeRequest(_estimatedTokens: number = 0, userId?: string): AIRateLimitState {
    void _estimatedTokens; // Suppress unused parameter warning
    const key = this.getKey(userId);
    const window = this.getWindow(key);
    const daily = this.getDailyTokens(key);

    const requestsRemaining = Math.max(0, this.config.requestsPerMinute - window.requests);
    const tokensRemaining = Math.max(0, this.config.tokensPerMinute - window.tokens);

    // Check daily limit if configured
    let dailyTokensRemaining = Infinity;
    if (this.config.tokensPerDay) {
      dailyTokensRemaining = Math.max(0, this.config.tokensPerDay - daily.tokens);
    }

    const resetAt = new Date(window.windowStart + 60000);

    return {
      requestsRemaining,
      tokensRemaining: Math.min(tokensRemaining, dailyTokensRemaining),
      resetAt,
    };
  }

  /**
   * Check if rate limited
   */
  isRateLimited(estimatedTokens: number = 0, userId?: string): boolean {
    const state = this.canMakeRequest(estimatedTokens, userId);
    return state.requestsRemaining <= 0 || state.tokensRemaining < estimatedTokens;
  }

  /**
   * Record a request
   */
  recordRequest(tokens: number, userId?: string): void {
    const key = this.getKey(userId);
    const window = this.getWindow(key);
    const daily = this.getDailyTokens(key);

    window.requests++;
    window.tokens += tokens;
    daily.tokens += tokens;
  }

  /**
   * Wait until rate limit resets
   */
  async waitForReset(userId?: string): Promise<void> {
    const state = this.canMakeRequest(0, userId);
    const now = Date.now();
    const waitTime = state.resetAt.getTime() - now;

    if (waitTime > 0) {
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }

  /**
   * Get current state
   */
  getState(userId?: string): AIRateLimitState {
    return this.canMakeRequest(0, userId);
  }

  /**
   * Get configuration
   */
  getConfig(): AIRateLimitConfig {
    return { ...this.config };
  }
}

// ============================================================================
// Rate Limiter Factory
// ============================================================================

const rateLimiters: Map<AIProvider, AIRateLimiter> = new Map();

/**
 * Get or create a rate limiter for a provider
 */
export function getRateLimiter(provider: AIProvider): AIRateLimiter {
  let limiter = rateLimiters.get(provider);

  if (!limiter) {
    limiter = new AIRateLimiter(provider);
    rateLimiters.set(provider, limiter);
  }

  return limiter;
}

/**
 * Check rate limit before making a request
 */
export async function checkRateLimit(
  provider: AIProvider,
  estimatedTokens: number,
  userId?: string,
  options?: { wait?: boolean },
): Promise<boolean> {
  const limiter = getRateLimiter(provider);

  if (limiter.isRateLimited(estimatedTokens, userId)) {
    if (options?.wait) {
      await limiter.waitForReset(userId);
      return true;
    }
    return false;
  }

  return true;
}

/**
 * Record a completed request
 */
export function recordRequest(provider: AIProvider, tokens: number, userId?: string): void {
  const limiter = getRateLimiter(provider);
  limiter.recordRequest(tokens, userId);
}
