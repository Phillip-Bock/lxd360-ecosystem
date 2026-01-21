/**
 * Type declarations for web-vitals (optional dependency)
 * This allows the code to compile even if web-vitals is not installed
 */

declare module 'web-vitals' {
  export interface Metric {
    id: string;
    name: string;
    value: number;
    rating: 'good' | 'needs-improvement' | 'poor';
    delta: number;
    entries: PerformanceEntry[];
    navigationType: string;
  }

  export type MetricHandler = (metric: Metric) => void;

  export function onCLS(handler: MetricHandler): void;
  export function onFCP(handler: MetricHandler): void;
  export function onFID(handler: MetricHandler): void;
  export function onINP(handler: MetricHandler): void;
  export function onLCP(handler: MetricHandler): void;
  export function onTTFB(handler: MetricHandler): void;
}
