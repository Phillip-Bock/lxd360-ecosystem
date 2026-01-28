'use client';

export const dynamic = 'force-dynamic';

/**
 * Magic Link Validation Page
 *
 * Handles magic link authentication flow.
 * Validates the token from URL and signs the user in.
 */

import { Loader2 } from 'lucide-react';
import { Suspense } from 'react';
import { MagicLinkHandler } from './MagicLinkHandler';

// =============================================================================
// Loading Fallback
// =============================================================================

function LoadingFallback() {
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-lxd-primary)]/10">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-lxd-primary)]" />
      </div>
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Loading...</h1>
        <p className="mt-2 text-muted-foreground">Please wait while we prepare your sign-in.</p>
      </div>
    </div>
  );
}

// =============================================================================
// Page Component
// =============================================================================

export default function MagicLinkPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-lxd-light-page p-4 dark:bg-lxd-dark-page">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-lg">
        <Suspense fallback={<LoadingFallback />}>
          <MagicLinkHandler />
        </Suspense>
      </div>
    </div>
  );
}
