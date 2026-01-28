'use client';

import { AlertTriangle, Home, MessageCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { logger } from '@/lib/logger';

const log = logger.scope('ErrorBoundary');

// =============================================================================
// Types
// =============================================================================

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode | ((props: ErrorFallbackProps) => React.ReactNode);
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  resetKeys?: unknown[];
}

export interface ErrorFallbackProps {
  error: Error;
  errorInfo: React.ErrorInfo | null;
  reset: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

// =============================================================================
// Default Fallback Component
// =============================================================================

function DefaultErrorFallback({ error, reset }: ErrorFallbackProps) {
  const errorDigest = (error as Error & { digest?: string })?.digest;

  return (
    <div role="alert" className="min-h-[400px] flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Error Icon */}
        <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-destructive" aria-hidden="true" />
        </div>

        {/* Error Message */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">Something went wrong</h2>
          <p className="text-sm text-muted-foreground">
            We apologize for the inconvenience. An unexpected error has occurred.
          </p>
          {errorDigest && (
            <p className="text-xs text-muted-foreground font-mono mt-2">Error ID: {errorDigest}</p>
          )}
        </div>

        {/* Error Details (Development only) */}
        {process.env.NODE_ENV === 'development' && (
          <details className="text-left bg-muted/50 rounded-lg p-4">
            <summary className="text-sm font-medium cursor-pointer text-foreground">
              Technical Details
            </summary>
            <pre className="mt-2 text-xs overflow-auto whitespace-pre-wrap text-muted-foreground">
              {error.message}
              {error.stack && (
                <>
                  {'\n\n'}
                  {error.stack}
                </>
              )}
            </pre>
          </details>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset} variant="primary" className="gap-2">
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            Try Again
          </Button>
          <Button variant="outline" asChild>
            <Link href="/" className="gap-2">
              <Home className="w-4 h-4" aria-hidden="true" />
              Go Home
            </Link>
          </Button>
        </div>

        {/* Support Link */}
        <p className="text-sm text-muted-foreground">
          Need help?{' '}
          <Link
            href="/support"
            className="text-primary hover:underline inline-flex items-center gap-1"
          >
            <MessageCircle className="w-3 h-3" aria-hidden="true" />
            Contact Support
          </Link>
        </p>
      </div>
    </div>
  );
}

// =============================================================================
// Error Boundary Class Component
// =============================================================================

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Update state with error info
    this.setState({ errorInfo });

    // Log error (Cloud Logging will capture this in production)
    log.error('Component error caught', error, {
      componentStack: errorInfo.componentStack,
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    // Reset error state if resetKeys change
    if (
      this.state.hasError &&
      this.props.resetKeys &&
      prevProps.resetKeys &&
      !this.areKeysEqual(prevProps.resetKeys, this.props.resetKeys)
    ) {
      this.reset();
    }
  }

  private areKeysEqual(prevKeys: unknown[], nextKeys: unknown[]): boolean {
    if (prevKeys.length !== nextKeys.length) return false;
    return prevKeys.every((key, index) => key === nextKeys[index]);
  }

  reset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback } = this.props;

    if (hasError && error) {
      // Custom fallback (function or node)
      if (typeof fallback === 'function') {
        return fallback({
          error,
          errorInfo,
          reset: this.reset,
        });
      }

      if (fallback) {
        return fallback;
      }

      // Default fallback UI
      return <DefaultErrorFallback error={error} errorInfo={errorInfo} reset={this.reset} />;
    }

    return children;
  }
}

// =============================================================================
// Hook for accessing error boundary reset (for nested components)
// =============================================================================

const ErrorBoundaryContext = React.createContext<{
  reset: () => void;
  error: Error | null;
} | null>(null);

export function useErrorBoundary() {
  const context = React.useContext(ErrorBoundaryContext);
  return context;
}

// =============================================================================
// Error Boundary with Context Provider
// =============================================================================

export function ErrorBoundaryWithContext({ children, ...props }: ErrorBoundaryProps) {
  const [key, setKey] = React.useState(0);

  const reset = React.useCallback(() => {
    setKey((prev) => prev + 1);
  }, []);

  return (
    <ErrorBoundary key={key} {...props} resetKeys={[key]}>
      <ErrorBoundaryContext.Provider value={{ reset, error: null }}>
        {children}
      </ErrorBoundaryContext.Provider>
    </ErrorBoundary>
  );
}

export default ErrorBoundary;
