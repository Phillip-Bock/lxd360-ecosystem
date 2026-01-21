/**
 * Monitoring Hooks
 * React hooks for fetching and managing monitoring data (GCP-focused)
 */

'use client';

import { useCallback, useEffect, useState } from 'react';
import useSWR from 'swr';
import type { MonitoringAlert, MonitoringDashboardData, RealtimeStream } from './types';
import { generateMockRealtimeData } from './utils';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new Error('Failed to fetch monitoring data');
    throw error;
  }
  return res.json();
};

/**
 * Hook for fetching complete monitoring dashboard data
 */
export function useMonitoringDashboard(refreshInterval = 30000) {
  const { data, error, isLoading, mutate } = useSWR<MonitoringDashboardData>(
    '/api/monitoring',
    fetcher,
    {
      refreshInterval,
      revalidateOnFocus: true,
      dedupingInterval: 5000,
    },
  );

  return {
    data,
    error,
    isLoading,
    refresh: mutate,
  };
}

/**
 * Hook for real-time metrics stream
 */
export function useRealtimeMetrics(interval = 1000): RealtimeStream {
  const [stream, setStream] = useState<RealtimeStream>({
    cpu: generateMockRealtimeData(60, 45, 20),
    memory: generateMockRealtimeData(60, 65, 10),
    requests: generateMockRealtimeData(60, 150, 50),
    errors: generateMockRealtimeData(60, 2, 3),
    latency: generateMockRealtimeData(60, 120, 40),
  });

  useEffect(() => {
    const updateMetrics = () => {
      setStream((prev) => {
        const now = Date.now();
        const addPoint = (arr: typeof prev.cpu, base: number, variance: number) => {
          const newArr = [
            ...arr.slice(1),
            {
              timestamp: now,
              value: Math.max(0, base + (Math.random() - 0.5) * variance * 2),
            },
          ];
          return newArr;
        };

        return {
          cpu: addPoint(prev.cpu, 45, 20),
          memory: addPoint(prev.memory, 65, 10),
          requests: addPoint(prev.requests, 150, 50),
          errors: addPoint(prev.errors, 2, 3),
          latency: addPoint(prev.latency, 120, 40),
        };
      });
    };

    const timer = setInterval(updateMetrics, interval);
    return () => clearInterval(timer);
  }, [interval]);

  return stream;
}

/**
 * Hook for monitoring alerts
 */
export function useMonitoringAlerts(refreshInterval = 10000) {
  const { data, error, isLoading, mutate } = useSWR<{ data: MonitoringAlert[] }>(
    '/api/monitoring/alerts',
    fetcher,
    {
      refreshInterval,
      revalidateOnFocus: true,
    },
  );

  const acknowledgeAlert = useCallback(
    async (alertId: string) => {
      await fetch(`/api/monitoring/alerts/${alertId}/acknowledge`, {
        method: 'POST',
      });
      mutate();
    },
    [mutate],
  );

  const resolveAlert = useCallback(
    async (alertId: string) => {
      await fetch(`/api/monitoring/alerts/${alertId}/resolve`, {
        method: 'POST',
      });
      mutate();
    },
    [mutate],
  );

  return {
    alerts: data?.data || [],
    error,
    isLoading,
    refresh: mutate,
    acknowledgeAlert,
    resolveAlert,
  };
}

/**
 * Hook for connection status pulse
 */
export function useConnectionPulse(connected: boolean) {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (!connected) return;

    const timer = setInterval(() => {
      setPulse((p) => !p);
    }, 1000);

    return () => clearInterval(timer);
  }, [connected]);

  return pulse;
}

/**
 * Hook for auto-refresh control
 */
export function useAutoRefresh(defaultEnabled = true, defaultInterval = 30000) {
  const [enabled, setEnabled] = useState(defaultEnabled);
  const [interval, setIntervalState] = useState(defaultInterval);

  return {
    enabled,
    interval,
    toggle: () => setEnabled((e) => !e),
    setEnabled,
    setInterval: setIntervalState,
  };
}
