'use client';

/**
 * Magic Link Handler Component
 *
 * Handles magic link token validation and Firebase authentication.
 * Shows loading state, error messages, and redirects on success.
 */

import { signInWithCustomToken } from 'firebase/auth';
import { ArrowRight, CheckCircle2, Loader2, Mail, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { getFirebaseAuth } from '@/lib/firebase/client';

// =============================================================================
// Types
// =============================================================================

type ValidationState = 'loading' | 'success' | 'error' | 'no-token';

interface ValidationError {
  message: string;
  code?: string;
}

// =============================================================================
// Component
// =============================================================================

export function MagicLinkHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [state, setState] = useState<ValidationState>('loading');
  const [error, setError] = useState<ValidationError | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  const validateAndSignIn = useCallback(
    async (magicToken: string) => {
      try {
        // Call API to validate token
        const response = await fetch('/api/auth/magic-link/validate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: magicToken }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError({
            message: data.error || 'Failed to validate magic link',
            code: data.code,
          });
          setState('error');
          return;
        }

        // Get Firebase auth instance
        const auth = getFirebaseAuth();
        if (!auth) {
          setError({
            message: 'Authentication service unavailable. Please try again.',
            code: 'AUTH_UNAVAILABLE',
          });
          setState('error');
          return;
        }

        // Sign in with custom token
        await signInWithCustomToken(auth, data.customToken);

        // Set email for success message
        setEmail(data.email);
        setState('success');

        // Redirect to dashboard after short delay
        setTimeout(() => {
          router.push('/ignite/dashboard');
        }, 1500);
      } catch (_err) {
        setError({
          message: 'An unexpected error occurred. Please try again.',
          code: 'UNKNOWN_ERROR',
        });
        setState('error');
      }
    },
    [router],
  );

  useEffect(() => {
    if (!token) {
      setState('no-token');
      return;
    }

    validateAndSignIn(token);
  }, [token, validateAndSignIn]);

  // Render based on state
  if (state === 'loading') {
    return <LoadingState />;
  }

  if (state === 'success') {
    return <SuccessState email={email} />;
  }

  if (state === 'no-token') {
    return <NoTokenState />;
  }

  return <ErrorState error={error} />;
}

// =============================================================================
// Sub-components
// =============================================================================

function LoadingState() {
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-lxd-primary)]/10">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-lxd-primary)]" />
      </div>
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Signing you in...</h1>
        <p className="mt-2 text-muted-foreground">Please wait while we verify your magic link.</p>
      </div>
    </div>
  );
}

function SuccessState({ email }: { email: string | null }) {
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-lxd-success)]/10">
        <CheckCircle2 className="h-8 w-8 text-[var(--color-lxd-success)]" />
      </div>
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Welcome back!</h1>
        <p className="mt-2 text-muted-foreground">
          {email ? (
            <>
              Signed in as <strong>{email}</strong>
            </>
          ) : (
            'You have been signed in successfully.'
          )}
        </p>
        <p className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Redirecting to dashboard...
        </p>
      </div>
    </div>
  );
}

function NoTokenState() {
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-lxd-warning)]/10">
        <Mail className="h-8 w-8 text-[var(--color-lxd-warning)]" />
      </div>
      <div>
        <h1 className="text-2xl font-semibold text-foreground">No Magic Link Found</h1>
        <p className="mt-2 text-muted-foreground">
          It looks like you navigated to this page without a magic link.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/login"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--color-lxd-primary)] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--color-lxd-primary-dark)]"
        >
          Go to Login
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

function ErrorState({ error }: { error: ValidationError | null }) {
  const getErrorMessage = () => {
    if (!error) return 'An unexpected error occurred.';

    switch (error.code) {
      case 'EXPIRED_TOKEN':
        return 'This magic link has expired. Please request a new one.';
      case 'ALREADY_USED':
        return 'This magic link has already been used. Please request a new one.';
      case 'INVALID_TOKEN':
        return 'This magic link is invalid. Please request a new one.';
      default:
        return error.message;
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-lxd-error)]/10">
        <XCircle className="h-8 w-8 text-[var(--color-lxd-error)]" />
      </div>
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Sign In Failed</h1>
        <p className="mt-2 text-muted-foreground">{getErrorMessage()}</p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/login"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--color-lxd-primary)] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--color-lxd-primary-dark)]"
        >
          Request New Link
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
