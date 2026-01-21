'use client';

/**
 * LRSConnectionTester - Test LRS endpoint connectivity
 *
 * Provides a button to test LRS connections with visual feedback
 * showing connection status, response time, and any errors.
 */

import { AlertCircle, CheckCircle2, Loader2, Server, Wifi, WifiOff } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// =============================================================================
// TYPES
// =============================================================================

interface LRSConnectionTesterProps {
  /** LRS endpoint URL */
  endpoint: string;
  /** Authorization header (Basic or Bearer) */
  auth?: string;
  /** Show detailed results */
  showDetails?: boolean;
  /** Callback when test completes */
  onTestComplete?: (result: ConnectionTestResult) => void;
  /** Additional class name */
  className?: string;
}

interface ConnectionTestResult {
  success: boolean;
  responseTime: number;
  xapiVersion?: string;
  error?: string;
  timestamp: string;
}

type TestStatus = 'idle' | 'testing' | 'success' | 'error';

// =============================================================================
// COMPONENT
// =============================================================================

export function LRSConnectionTester({
  endpoint,
  auth,
  showDetails = true,
  onTestComplete,
  className,
}: LRSConnectionTesterProps) {
  const [status, setStatus] = useState<TestStatus>('idle');
  const [result, setResult] = useState<ConnectionTestResult | null>(null);

  const testConnection = useCallback(async () => {
    if (!endpoint) {
      setResult({
        success: false,
        responseTime: 0,
        error: 'No endpoint configured',
        timestamp: new Date().toISOString(),
      });
      setStatus('error');
      return;
    }

    setStatus('testing');
    setResult(null);

    const startTime = performance.now();

    try {
      // Normalize endpoint URL
      const baseUrl = endpoint.endsWith('/') ? endpoint.slice(0, -1) : endpoint;
      const aboutUrl = `${baseUrl}/about`;

      const headers: Record<string, string> = {
        'X-Experience-API-Version': '1.0.3',
      };

      if (auth) {
        headers.Authorization = auth;
      }

      const response = await fetch(aboutUrl, {
        method: 'GET',
        headers,
        mode: 'cors',
      });

      const responseTime = Math.round(performance.now() - startTime);

      if (response.ok) {
        let xapiVersion: string | undefined;

        try {
          const data = await response.json();
          xapiVersion = data.version?.[0] || data['X-Experience-API-Version'];
        } catch {
          // Response may not be JSON
        }

        const testResult: ConnectionTestResult = {
          success: true,
          responseTime,
          xapiVersion,
          timestamp: new Date().toISOString(),
        };

        setResult(testResult);
        setStatus('success');
        onTestComplete?.(testResult);
      } else {
        let errorMessage = `HTTP ${response.status}`;

        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          errorMessage = response.statusText || errorMessage;
        }

        const testResult: ConnectionTestResult = {
          success: false,
          responseTime,
          error: errorMessage,
          timestamp: new Date().toISOString(),
        };

        setResult(testResult);
        setStatus('error');
        onTestComplete?.(testResult);
      }
    } catch (error) {
      const responseTime = Math.round(performance.now() - startTime);
      const errorMessage =
        error instanceof Error
          ? error.message.includes('Failed to fetch')
            ? 'Network error - check CORS or endpoint URL'
            : error.message
          : 'Unknown error';

      const testResult: ConnectionTestResult = {
        success: false,
        responseTime,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      };

      setResult(testResult);
      setStatus('error');
      onTestComplete?.(testResult);
    }
  }, [endpoint, auth, onTestComplete]);

  const getStatusIcon = () => {
    switch (status) {
      case 'testing':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Server className="h-4 w-4" />;
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={testConnection}
          disabled={status === 'testing' || !endpoint}
          className="gap-2"
        >
          {getStatusIcon()}
          {status === 'testing' ? 'Testing...' : 'Test Connection'}
        </Button>

        {status !== 'idle' && (
          <div
            className={cn(
              'flex items-center gap-2 text-sm',
              status === 'success' && 'text-green-500',
              status === 'error' && 'text-red-500',
              status === 'testing' && 'text-zinc-400',
            )}
          >
            {status === 'success' ? (
              <Wifi className="h-4 w-4" />
            ) : status === 'error' ? (
              <WifiOff className="h-4 w-4" />
            ) : null}
            <span>
              {status === 'testing'
                ? 'Connecting...'
                : status === 'success'
                  ? 'Connected'
                  : 'Connection failed'}
            </span>
          </div>
        )}
      </div>

      {showDetails && result && (
        <div
          className={cn(
            'p-3 rounded-lg text-sm',
            result.success
              ? 'bg-green-500/10 border border-green-500/20'
              : 'bg-red-500/10 border border-red-500/20',
          )}
        >
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-zinc-400">Response Time</span>
              <span className="font-mono">{result.responseTime}ms</span>
            </div>

            {result.xapiVersion && (
              <div className="flex justify-between">
                <span className="text-zinc-400">xAPI Version</span>
                <span className="font-mono">{result.xapiVersion}</span>
              </div>
            )}

            {result.error && (
              <div className="flex justify-between">
                <span className="text-zinc-400">Error</span>
                <span className="text-red-400 text-right max-w-[200px] truncate">
                  {result.error}
                </span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-zinc-400">Tested</span>
              <span className="font-mono text-xs">
                {new Date(result.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// COMPACT VERSION
// =============================================================================

interface LRSConnectionBadgeProps {
  endpoint: string;
  auth?: string;
  autoTest?: boolean;
  className?: string;
}

/**
 * Compact badge showing LRS connection status.
 * Useful for headers or toolbars.
 */
export function LRSConnectionBadge({
  endpoint,
  auth,
  autoTest = false,
  className,
}: LRSConnectionBadgeProps) {
  const [status, setStatus] = useState<TestStatus>('idle');
  const [responseTime, setResponseTime] = useState<number | null>(null);

  const testConnection = useCallback(async () => {
    if (!endpoint) return;

    setStatus('testing');

    const startTime = performance.now();

    try {
      const baseUrl = endpoint.endsWith('/') ? endpoint.slice(0, -1) : endpoint;
      const headers: Record<string, string> = {
        'X-Experience-API-Version': '1.0.3',
      };

      if (auth) {
        headers.Authorization = auth;
      }

      const response = await fetch(`${baseUrl}/about`, {
        method: 'GET',
        headers,
        mode: 'cors',
      });

      setResponseTime(Math.round(performance.now() - startTime));
      setStatus(response.ok ? 'success' : 'error');
    } catch {
      setResponseTime(Math.round(performance.now() - startTime));
      setStatus('error');
    }
  }, [endpoint, auth]);

  // Auto-test on mount if configured
  useState(() => {
    if (autoTest && endpoint) {
      testConnection();
    }
  });

  return (
    <button
      type="button"
      onClick={testConnection}
      disabled={status === 'testing' || !endpoint}
      className={cn(
        'flex items-center gap-2 px-2 py-1 rounded text-xs transition-colors',
        'bg-white/5 border border-white/10 hover:bg-white/10',
        status === 'success' && 'border-green-500/30',
        status === 'error' && 'border-red-500/30',
        className,
      )}
    >
      {status === 'testing' ? (
        <Loader2 className="h-3 w-3 animate-spin text-zinc-400" />
      ) : status === 'success' ? (
        <CheckCircle2 className="h-3 w-3 text-green-500" />
      ) : status === 'error' ? (
        <AlertCircle className="h-3 w-3 text-red-500" />
      ) : (
        <Server className="h-3 w-3 text-zinc-400" />
      )}

      <span className="text-zinc-300">
        {status === 'testing'
          ? 'Testing...'
          : status === 'success'
            ? `LRS OK${responseTime ? ` (${responseTime}ms)` : ''}`
            : status === 'error'
              ? 'LRS Error'
              : 'Test LRS'}
      </span>
    </button>
  );
}
