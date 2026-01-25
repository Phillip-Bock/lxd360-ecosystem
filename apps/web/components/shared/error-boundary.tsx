'use client';

import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { logger } from '@/lib/logger';

const log = logger.scope('ErrorBoundary');

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary Component
 * Catches React errors in child components and displays a fallback UI
 * Logs errors to Cloud Logging and our database
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error (Cloud Logging will capture this in production)
    log.error('Component error caught', error, {
      componentStack: errorInfo.componentStack,
    });

    // Log to our database
    this.logErrorToDatabase(error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });
  }

  async logErrorToDatabase(error: Error, errorInfo: ErrorInfo) {
    try {
      await fetch('/api/admin/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error_type: error.name,
          error_message: error.message,
          error_stack: error.stack,
          service: 'client',
          severity: 'error',
          metadata: {
            componentStack: errorInfo.componentStack,
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
            url: typeof window !== 'undefined' ? window.location.href : undefined,
          },
        }),
      });
    } catch {
      // Silently ignore - logging to database failed
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
          <Card className="w-full max-w-md border-destructive/50">
            <CardHeader>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle className="text-center font-[family-name:var(--font-plus-jakarta-sans)]">
                Something went wrong
              </CardTitle>
              <CardDescription className="text-center font-[family-name:var(--font-inter)]">
                We encountered an unexpected error. Please try again.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="rounded-lg bg-muted p-4">
                  <p className="mb-2 text-sm font-semibold font-[family-name:var(--font-inter)] text-destructive">
                    Error Details (Development Only):
                  </p>
                  <pre className="max-h-40 overflow-auto text-xs font-[family-name:var(--font-jetbrains-mono)]">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <Button
                  onClick={this.handleReset}
                  className="w-full font-[family-name:var(--font-plus-jakarta-sans)]"
                  variant="primary"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
                <Button
                  href="/"
                  variant="secondary"
                  className="w-full font-[family-name:var(--font-plus-jakarta-sans)]"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Go Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook to manually trigger error boundary (useful for async operations)
 */
export function useErrorHandler() {
  return (error: Error) => {
    throw error;
  };
}

/**
 * Hook for logging errors from functional components
 * Use this for async errors that can't be caught by error boundaries
 */
export function useErrorLogger() {
  const logError = async (error: unknown, metadata?: Record<string, unknown>) => {
    const errorInfo =
      error instanceof Error
        ? { type: error.name, message: error.message, stack: error.stack }
        : { type: 'UnknownError', message: String(error) };

    // Log error (Cloud Logging will capture this in production)
    log.error('Async error logged', error instanceof Error ? error : new Error(String(error)), {
      ...errorInfo,
      ...metadata,
    });

    // Log to our database
    try {
      await fetch('/api/admin/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error_type: errorInfo.type,
          error_message: errorInfo.message,
          error_stack: errorInfo.stack,
          service: 'client',
          severity: 'error',
          metadata: {
            ...metadata,
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
            url: typeof window !== 'undefined' ? window.location.href : undefined,
          },
        }),
      });
    } catch {
      // Silently ignore - logging to database failed
    }
  };

  return { logError };
}
