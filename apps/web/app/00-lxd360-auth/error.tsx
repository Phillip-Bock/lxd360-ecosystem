'use client';

import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AuthError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('[AuthError]', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-destructive" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Authentication Error</h1>
          <p className="mt-2 text-muted-foreground">
            We encountered a problem with authentication. Please try again.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <Button onClick={reset} variant="primary" className="w-full gap-2">
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            Try Again
          </Button>
          <Button variant="outline" asChild className="w-full gap-2">
            <Link href="/login">
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              Back to Login
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
