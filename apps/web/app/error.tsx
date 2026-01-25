'use client';

import {
  AlertTriangle,
  ArrowLeft,
  Check,
  Copy,
  Home,
  MessageCircle,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { logger } from '@/lib/logger';

const log = logger.scope('ErrorPage');

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Log error (Cloud Logging will capture this in production)
    log.error('Page error', error, {
      digest: error.digest,
    });
  }, [error]);

  const copyErrorId = async () => {
    if (error.digest) {
      try {
        await navigator.clipboard.writeText(error.digest);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Silently ignore - Clipboard API not available
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-lg w-full">
          {/* Error Card */}
          <div className="bg-card border border-border rounded-xl p-8 shadow-lg">
            {/* Icon */}
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
              <AlertTriangle className="w-8 h-8 text-destructive" aria-hidden="true" />
            </div>

            {/* Content */}
            <div className="text-center space-y-4">
              <h1 className="text-2xl font-bold text-foreground">Something went wrong</h1>
              <p className="text-muted-foreground">
                We encountered an unexpected error. Our team has been notified and is working to
                resolve the issue.
              </p>

              {/* Error Digest */}
              {error.digest && (
                <div className="flex items-center justify-center gap-2 p-3 bg-muted/50 rounded-lg">
                  <span className="text-xs text-muted-foreground font-mono">
                    Error ID: {error.digest}
                  </span>
                  <button
                    type="button"
                    onClick={copyErrorId}
                    className="p-1 hover:bg-muted rounded transition-colors"
                    aria-label="Copy error ID"
                    title="Copy error ID"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-brand-success" />
                    ) : (
                      <Copy className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
              )}

              {/* Development Error Details */}
              {process.env.NODE_ENV === 'development' && (
                <details className="text-left bg-muted/50 rounded-lg p-4 mt-4">
                  <summary className="text-sm font-medium cursor-pointer text-foreground">
                    Developer Details
                  </summary>
                  <pre className="mt-2 text-xs overflow-auto whitespace-pre-wrap text-muted-foreground max-h-48">
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
            </div>

            {/* Actions */}
            <div className="mt-8 space-y-3">
              <Button onClick={reset} variant="primary" className="w-full gap-2">
                <RefreshCw className="w-4 h-4" aria-hidden="true" />
                Try Again
              </Button>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={() => window.history.back()}
                >
                  <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                  Go Back
                </Button>
                <Button variant="outline" asChild className="flex-1">
                  <Link href="/" className="gap-2">
                    <Home className="w-4 h-4" aria-hidden="true" />
                    Home
                  </Link>
                </Button>
              </div>
            </div>

            {/* Support Link */}
            <div className="mt-6 pt-6 border-t border-border text-center">
              <p className="text-sm text-muted-foreground">
                If this problem persists,{' '}
                <Link
                  href="/support"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  <MessageCircle className="w-3 h-3" aria-hidden="true" />
                  contact our support team
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
