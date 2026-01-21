/**
 * Monitoring Dashboard Types
 * Type definitions for system monitoring (GCP-focused)
 */

// ============================================================================
// COMBINED MONITORING TYPES
// ============================================================================

export type ServiceHealth = 'healthy' | 'warning' | 'critical' | 'unknown';

export interface ServiceStatus {
  name: string;
  slug: 'cloud-run' | 'firestore' | 'cloud-sql';
  connected: boolean;
  health: ServiceHealth;
  lastChecked: string;
  latency: number;
  uptime: number;
  icon: string;
}

export interface MonitoringDashboardData {
  services: ServiceStatus[];
  overallHealth: ServiceHealth;
  lastUpdated: string;
}

export interface AlertConfig {
  id: string;
  service: 'cloud-run' | 'firestore' | 'all';
  type: 'error_rate' | 'latency' | 'availability' | 'custom';
  threshold: number;
  comparison: 'gt' | 'lt' | 'eq';
  enabled: boolean;
  notificationChannels: ('email' | 'slack' | 'webhook')[];
}

export interface MonitoringAlert {
  id: string;
  service: string;
  type: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
  resolvedAt: string | null;
}

// ============================================================================
// REAL-TIME TYPES
// ============================================================================

export interface RealtimeMetric {
  timestamp: number;
  value: number;
  label?: string;
}

export interface RealtimeStream {
  cpu: RealtimeMetric[];
  memory: RealtimeMetric[];
  requests: RealtimeMetric[];
  errors: RealtimeMetric[];
  latency: RealtimeMetric[];
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface MonitoringApiResponse<T> {
  success: boolean;
  data: T | null;
  error?: string;
  timestamp: string;
}
