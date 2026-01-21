/**
 * =============================================================================
 * LXP360-SaaS | Interaction Ribbon - Connection Utilities
 * =============================================================================
 *
 * @fileoverview Connection testing utilities for integration status monitoring
 *
 * =============================================================================
 */

'use client';

import { useCallback, useState } from 'react';
import type { IntegrationStatus } from '@/lib/integrations/types';

// ============================================================================
// Types
// ============================================================================

export interface ConnectionTestResult {
  integrationId: string;
  status: IntegrationStatus;
  latencyMs?: number;
  message?: string;
  testedAt: Date;
}

export interface ConnectionTestState {
  results: Map<string, ConnectionTestResult>;
  isTestingAll: boolean;
  lastTestedAt: Date | null;
}

// ============================================================================
// Hook: useConnectionTest
// ============================================================================

/**
 * Hook for testing individual or all integration connections
 */
export function useConnectionTest() {
  const [state, setState] = useState<ConnectionTestState>({
    results: new Map(),
    isTestingAll: false,
    lastTestedAt: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Test a single integration connection
   */
  const testConnection = useCallback(
    async (integrationId: string): Promise<ConnectionTestResult> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/integrations/status?service=${integrationId}`);
        const data = await response.json();

        const result: ConnectionTestResult = {
          integrationId,
          status: data.health?.[integrationId]?.status ?? 'error',
          latencyMs: data.health?.[integrationId]?.latencyMs,
          message: data.health?.[integrationId]?.message,
          testedAt: new Date(),
        };

        setState((prev) => ({
          ...prev,
          results: new Map(prev.results).set(integrationId, result),
          lastTestedAt: new Date(),
        }));

        return result;
      } catch (err) {
        const errorResult: ConnectionTestResult = {
          integrationId,
          status: 'error',
          message: err instanceof Error ? err.message : 'Connection test failed',
          testedAt: new Date(),
        };

        setState((prev) => ({
          ...prev,
          results: new Map(prev.results).set(integrationId, errorResult),
        }));

        setError(err instanceof Error ? err : new Error('Connection test failed'));
        return errorResult;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  /**
   * Test all integration connections
   */
  const testAllConnections = useCallback(async (): Promise<Map<string, ConnectionTestResult>> => {
    setState((prev) => ({ ...prev, isTestingAll: true }));
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/integrations/status');
      const data = await response.json();

      const results = new Map<string, ConnectionTestResult>();

      if (data.health) {
        for (const [id, health] of Object.entries(data.health)) {
          const healthData = health as {
            status?: IntegrationStatus;
            latencyMs?: number;
            message?: string;
          };
          results.set(id, {
            integrationId: id,
            status: healthData.status ?? 'error',
            latencyMs: healthData.latencyMs,
            message: healthData.message,
            testedAt: new Date(),
          });
        }
      }

      setState({
        results,
        isTestingAll: false,
        lastTestedAt: new Date(),
      });

      return results;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to test connections'));
      setState((prev) => ({ ...prev, isTestingAll: false }));
      return new Map();
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Get the result for a specific integration
   */
  const getResult = useCallback(
    (integrationId: string): ConnectionTestResult | undefined => {
      return state.results.get(integrationId);
    },
    [state.results],
  );

  /**
   * Clear all test results
   */
  const clearResults = useCallback(() => {
    setState({
      results: new Map(),
      isTestingAll: false,
      lastTestedAt: null,
    });
    setError(null);
  }, []);

  return {
    results: state.results,
    isLoading,
    isTestingAll: state.isTestingAll,
    lastTestedAt: state.lastTestedAt,
    error,
    testConnection,
    testAllConnections,
    getResult,
    clearResults,
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Quick status check without API calls
 */
export async function getQuickConnectionStatus(): Promise<Record<string, IntegrationStatus>> {
  try {
    const response = await fetch('/api/integrations/status?quick=true');
    const data = await response.json();
    return data.status ?? {};
  } catch {
    // Silently ignore - return empty status object as fallback
    return {};
  }
}

/**
 * Check if an integration is operational
 */
export function isOperational(status: IntegrationStatus): boolean {
  return status === 'connected' || status === 'degraded';
}

/**
 * Get status priority for sorting (lower = better)
 */
export function getStatusPriority(status: IntegrationStatus): number {
  const priorities: Record<IntegrationStatus, number> = {
    connected: 0,
    degraded: 1,
    initializing: 2,
    not_configured: 3,
    disconnected: 4,
    error: 5,
  };
  return priorities[status] ?? 6;
}

/**
 * Sort integrations by status priority
 */
export function sortByStatus<T extends { status: IntegrationStatus }>(items: T[]): T[] {
  return [...items].sort((a, b) => getStatusPriority(a.status) - getStatusPriority(b.status));
}

/**
 * Get human-readable status description
 */
export function getStatusDescription(status: IntegrationStatus): string {
  const descriptions: Record<IntegrationStatus, string> = {
    connected: 'Connected and operational',
    degraded: 'Operational with reduced performance',
    initializing: 'Starting up...',
    not_configured: 'Not configured - add API keys',
    disconnected: 'Disconnected - check network',
    error: 'Error - check logs',
  };
  return descriptions[status] ?? 'Unknown status';
}

/**
 * Get status color for UI
 */
export function getStatusColor(status: IntegrationStatus): string {
  const colors: Record<IntegrationStatus, string> = {
    connected: 'text-green-600',
    degraded: 'text-yellow-600',
    initializing: 'text-blue-600',
    not_configured: 'text-gray-400',
    disconnected: 'text-orange-600',
    error: 'text-red-600',
  };
  return colors[status] ?? 'text-gray-500';
}

/**
 * Get status background color for UI
 */
export function getStatusBgColor(status: IntegrationStatus): string {
  const colors: Record<IntegrationStatus, string> = {
    connected: 'bg-green-100',
    degraded: 'bg-yellow-100',
    initializing: 'bg-blue-100',
    not_configured: 'bg-gray-100',
    disconnected: 'bg-orange-100',
    error: 'bg-red-100',
  };
  return colors[status] ?? 'bg-gray-100';
}
