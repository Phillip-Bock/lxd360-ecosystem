/**
 * Monitoring Utilities
 * Helper functions for monitoring data processing
 */

import type { RealtimeMetric, ServiceHealth } from './types';

/**
 * Calculate overall health from multiple service health statuses
 */
export function calculateOverallHealth(healths: ServiceHealth[]): ServiceHealth {
  if (healths.some((h) => h === 'critical')) return 'critical';
  if (healths.some((h) => h === 'warning')) return 'warning';
  if (healths.some((h) => h === 'unknown')) return 'unknown';
  return 'healthy';
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Format milliseconds to human-readable duration
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms.toFixed(0)}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
  if (ms < 3600000) return `${(ms / 60000).toFixed(1)}m`;
  return `${(ms / 3600000).toFixed(1)}h`;
}

/**
 * Format large numbers with K, M, B suffixes
 */
export function formatNumber(num: number): string {
  if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
  return num.toFixed(0);
}

/**
 * Format percentage
 */
export function formatPercent(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Get health color based on status
 */
export function getHealthColor(health: ServiceHealth): string {
  switch (health) {
    case 'healthy':
      return '#10B981'; // Emerald
    case 'warning':
      return '#F59E0B'; // Amber
    case 'critical':
      return '#EF4444'; // Red
    default:
      return '#6B7280'; // Gray
  }
}

/**
 * Get health gradient for futuristic UI
 */
export function getHealthGradient(health: ServiceHealth): string {
  switch (health) {
    case 'healthy':
      return 'from-emerald-500/20 via-emerald-500/5 to-transparent';
    case 'warning':
      return 'from-amber-500/20 via-amber-500/5 to-transparent';
    case 'critical':
      return 'from-red-500/20 via-red-500/5 to-transparent';
    default:
      return 'from-gray-500/20 via-gray-500/5 to-transparent';
  }
}

/**
 * Get health glow effect for futuristic UI
 */
export function getHealthGlow(health: ServiceHealth): string {
  switch (health) {
    case 'healthy':
      return '0 0 40px rgba(16, 185, 129, 0.3), 0 0 80px rgba(16, 185, 129, 0.1)';
    case 'warning':
      return '0 0 40px rgba(245, 158, 11, 0.3), 0 0 80px rgba(245, 158, 11, 0.1)';
    case 'critical':
      return '0 0 40px rgba(239, 68, 68, 0.3), 0 0 80px rgba(239, 68, 68, 0.1)';
    default:
      return '0 0 40px rgba(107, 114, 128, 0.3), 0 0 80px rgba(107, 114, 128, 0.1)';
  }
}

/**
 * Calculate trend from metric array
 */
export function calculateTrend(metrics: RealtimeMetric[]): 'up' | 'down' | 'stable' {
  if (metrics.length < 2) return 'stable';
  const recent = metrics.slice(-5);
  const first = recent[0].value;
  const last = recent[recent.length - 1].value;
  const change = ((last - first) / first) * 100;
  if (change > 5) return 'up';
  if (change < -5) return 'down';
  return 'stable';
}

/**
 * Generate sparkline data points
 */
export function generateSparklinePoints(
  metrics: RealtimeMetric[],
  width: number,
  height: number,
): string {
  if (metrics.length === 0) return '';

  const max = Math.max(...metrics.map((m) => m.value));
  const min = Math.min(...metrics.map((m) => m.value));
  const range = max - min || 1;

  return metrics
    .map((m, i) => {
      const x = (i / (metrics.length - 1)) * width;
      const y = height - ((m.value - min) / range) * height;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');
}

/**
 * Web Vitals thresholds (Core Web Vitals standards)
 */
export const WEB_VITALS_THRESHOLDS = {
  lcp: { good: 2500, poor: 4000 }, // ms
  fid: { good: 100, poor: 300 }, // ms
  cls: { good: 0.1, poor: 0.25 }, // score
  fcp: { good: 1800, poor: 3000 }, // ms
  ttfb: { good: 800, poor: 1800 }, // ms
  inp: { good: 200, poor: 500 }, // ms
} as const;

/**
 * Get Web Vital rating
 */
export function getWebVitalRating(
  metric: keyof typeof WEB_VITALS_THRESHOLDS,
  value: number,
): ServiceHealth {
  const threshold = WEB_VITALS_THRESHOLDS[metric];
  if (value <= threshold.good) return 'healthy';
  if (value <= threshold.poor) return 'warning';
  return 'critical';
}

/**
 * Format relative time
 */
export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return then.toLocaleDateString();
}

/**
 * Generate mock real-time data for demo
 */
export function generateMockRealtimeData(
  points: number,
  baseValue: number,
  variance: number,
): RealtimeMetric[] {
  const now = Date.now();
  return Array.from({ length: points }, (_, i) => ({
    timestamp: now - (points - i) * 1000,
    value: baseValue + (Math.random() - 0.5) * variance * 2,
  }));
}

/**
 * Interpolate color between two hex colors
 */
export function interpolateColor(color1: string, color2: string, factor: number): string {
  const c1 = parseInt(color1.slice(1), 16);
  const c2 = parseInt(color2.slice(1), 16);

  const r1 = (c1 >> 16) & 0xff;
  const g1 = (c1 >> 8) & 0xff;
  const b1 = c1 & 0xff;

  const r2 = (c2 >> 16) & 0xff;
  const g2 = (c2 >> 8) & 0xff;
  const b2 = c2 & 0xff;

  const r = Math.round(r1 + (r2 - r1) * factor);
  const g = Math.round(g1 + (g2 - g1) * factor);
  const b = Math.round(b1 + (b2 - b1) * factor);

  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
