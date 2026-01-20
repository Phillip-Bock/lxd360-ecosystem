/**
 * =============================================================================
 * LXP360-SaaS | Core Web Vitals Tracking
 * =============================================================================
 *
 * @fileoverview Core Web Vitals monitoring and reporting
 *
 * @description
 * Tracks Core Web Vitals metrics:
 * - LCP (Largest Contentful Paint)
 * - FID (First Input Delay)
 * - CLS (Cumulative Layout Shift)
 * - FCP (First Contentful Paint)
 * - TTFB (Time to First Byte)
 * - INP (Interaction to Next Paint)
 *
 * =============================================================================
 */

'use client';

import * as React from 'react';
import { logger } from '@/lib/logger';

const log = logger.child({ module: 'performance-web-vitals' });

// ============================================================================
// Types
// ============================================================================

export interface WebVitalsMetric {
  id: string;
  name: 'CLS' | 'FCP' | 'FID' | 'INP' | 'LCP' | 'TTFB';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  entries: PerformanceEntry[];
  navigationType: 'navigate' | 'reload' | 'back-forward' | 'prerender';
}

// Type from web-vitals library
interface WebVitalsMetricImport {
  id: string;
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  entries: PerformanceEntry[];
  navigationType: string;
}

export interface WebVitalsReport {
  metrics: Record<string, WebVitalsMetric>;
  timestamp: number;
  url: string;
  userAgent: string;
}

export type MetricHandler = (metric: WebVitalsMetric) => void;

// ============================================================================
// Thresholds
// ============================================================================

/**
 * Core Web Vitals thresholds
 * @see https://web.dev/vitals/
 */
export const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 }, // ms
  FID: { good: 100, poor: 300 }, // ms
  CLS: { good: 0.1, poor: 0.25 }, // score
  FCP: { good: 1800, poor: 3000 }, // ms
  TTFB: { good: 800, poor: 1800 }, // ms
  INP: { good: 200, poor: 500 }, // ms
} as const;

// ============================================================================
// Rating Helper
// ============================================================================

/**
 * Get rating for a metric value
 */
export function getRating(
  name: keyof typeof THRESHOLDS,
  value: number,
): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[name];
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

/**
 * Get color for rating
 */
export function getRatingColor(rating: 'good' | 'needs-improvement' | 'poor'): string {
  switch (rating) {
    case 'good':
      return '#0cce6b'; // Green
    case 'needs-improvement':
      return '#ffa400'; // Orange
    case 'poor':
      return '#ff4e42'; // Red
  }
}

// ============================================================================
// Metric Collection
// ============================================================================

const metricsCollected: Record<string, WebVitalsMetric> = {};

/**
 * Initialize web vitals tracking
 */
export async function initWebVitals(onMetric?: MetricHandler): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    // Dynamic import of web-vitals library
    // Using dynamic import with type assertion to handle optional dependency
    const webVitals = await import('web-vitals').catch(() => null);

    if (!webVitals) {
      log.warn('web-vitals package not installed - performance tracking disabled');
      return;
    }

    const { onCLS, onFCP, onFID, onINP, onLCP, onTTFB } = webVitals;

    const handleMetric = (metric: WebVitalsMetricImport) => {
      // Convert the imported metric type to our internal type
      const typedMetric: WebVitalsMetric = metric as WebVitalsMetric;
      metricsCollected[typedMetric.name] = typedMetric;

      // Log in development
      if (process.env.NODE_ENV === 'development') {
        log.debug('Web vital metric', {
          name: typedMetric.name,
          value: typedMetric.value.toFixed(2),
          rating: typedMetric.rating,
        });
      }

      // Call custom handler
      onMetric?.(typedMetric);
    };

    // Register all metric handlers
    onCLS(handleMetric);
    onFCP(handleMetric);
    onFID(handleMetric);
    onINP(handleMetric);
    onLCP(handleMetric);
    onTTFB(handleMetric);
  } catch (error) {
    log.error('Failed to load web-vitals', { error });
  }
}

/**
 * Get collected metrics
 */
export function getCollectedMetrics(): Record<string, WebVitalsMetric> {
  return { ...metricsCollected };
}

/**
 * Get web vitals report
 */
export function getWebVitalsReport(): WebVitalsReport {
  return {
    metrics: getCollectedMetrics(),
    timestamp: Date.now(),
    url: typeof window !== 'undefined' ? window.location.href : '',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
  };
}

// ============================================================================
// Analytics Integration
// ============================================================================

/**
 * Send metrics to analytics endpoint
 */
export async function sendToAnalytics(metric: WebVitalsMetric, endpoint?: string): Promise<void> {
  const analyticsEndpoint = endpoint || '/api/analytics/vitals';

  const body = {
    id: metric.id,
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    navigationType: metric.navigationType,
    url: window.location.href,
    timestamp: Date.now(),
  };

  // Use sendBeacon if available for reliability
  if (navigator.sendBeacon) {
    navigator.sendBeacon(analyticsEndpoint, JSON.stringify(body));
  } else {
    // Fallback to fetch
    try {
      await fetch(analyticsEndpoint, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
      });
    } catch (error) {
      log.error('Failed to send analytics', { error });
    }
  }
}

/**
 * Send metrics to Google Analytics
 */
export function sendToGoogleAnalytics(metric: WebVitalsMetric): void {
  if (typeof window !== 'undefined' && 'gtag' in window) {
    // Type-safe access to gtag function
    const windowWithGtag = window as typeof window & {
      gtag: (command: string, eventName: string, params: Record<string, unknown>) => void;
    };

    windowWithGtag.gtag('event', metric.name, {
      event_category: 'Web Vitals',
      event_label: metric.id,
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      non_interaction: true,
    });
  }
}

// ============================================================================
// Performance Marks and Measures
// ============================================================================

/**
 * Create a performance mark
 */
export function mark(name: string): void {
  if (typeof performance !== 'undefined') {
    performance.mark(name);
  }
}

/**
 * Create a performance measure
 */
export function measure(name: string, startMark: string, endMark?: string): void {
  if (typeof performance !== 'undefined') {
    try {
      performance.measure(name, startMark, endMark);
    } catch (error) {
      log.error('Performance measure error', { error });
    }
  }
}

/**
 * Get all performance measures
 */
export function getMeasures(): PerformanceEntryList {
  if (typeof performance !== 'undefined') {
    return performance.getEntriesByType('measure');
  }
  return [];
}

/**
 * Clear all performance marks and measures
 */
export function clearPerformanceData(): void {
  if (typeof performance !== 'undefined') {
    performance.clearMarks();
    performance.clearMeasures();
  }
}

// ============================================================================
// React Hook
// ============================================================================

/**
 * Hook to track web vitals
 */
export function useWebVitals(
  options: { onMetric?: MetricHandler; sendToEndpoint?: string; sendToGA?: boolean } = {},
) {
  const { onMetric, sendToEndpoint, sendToGA = false } = options;

  React.useEffect(() => {
    const handler: MetricHandler = (metric) => {
      onMetric?.(metric);

      if (sendToEndpoint) {
        sendToAnalytics(metric, sendToEndpoint);
      }

      if (sendToGA) {
        sendToGoogleAnalytics(metric);
      }
    };

    initWebVitals(handler);
  }, [onMetric, sendToEndpoint, sendToGA]);

  return getCollectedMetrics;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Web Vitals Provider Component
 */
export function WebVitalsProvider({
  children,
  onMetric,
  analyticsEndpoint,
  enableGoogleAnalytics = false,
}: {
  children: React.ReactNode;
  onMetric?: MetricHandler;
  analyticsEndpoint?: string;
  enableGoogleAnalytics?: boolean;
}) {
  useWebVitals({
    onMetric,
    sendToEndpoint: analyticsEndpoint,
    sendToGA: enableGoogleAnalytics,
  });

  return <>{children}</>;
}

// ============================================================================
// Exports
// ============================================================================
// Types are already exported inline above
