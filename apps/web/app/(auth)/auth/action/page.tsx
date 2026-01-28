'use client';

export const dynamic = 'force-dynamic';

/**
 * Firebase Auth Action Handler
 * ============================
 * Handles Firebase authentication action links:
 * - verifyEmail: Email verification
 * - resetPassword: Password reset (redirects to reset page)
 * - recoverEmail: Email change recovery
 */

import { applyActionCode, checkActionCode } from 'firebase/auth';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Loader2, Mail } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import type React from 'react';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { getFirebaseAuth } from '@/lib/firebase/client';

type ActionMode = 'verifyEmail' | 'resetPassword' | 'recoverEmail';
type ActionStatus = 'loading' | 'success' | 'error';

interface ActionState {
  status: ActionStatus;
  message: string;
  email?: string;
}

function AuthActionContent(): React.JSX.Element {
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') as ActionMode | null;
  const oobCode = searchParams.get('oobCode');

  const [state, setState] = useState<ActionState>({
    status: 'loading',
    message: 'Verifying your request...',
  });

  const handleVerifyEmail = useCallback(async (code: string) => {
    const auth = getFirebaseAuth();
    if (!auth) {
      setState({
        status: 'error',
        message: 'Authentication service unavailable. Please try again later.',
      });
      return;
    }

    try {
      // First check the action code to get email info
      const info = await checkActionCode(auth, code);
      const email = info.data.email ?? undefined;

      // Apply the action code to verify the email
      await applyActionCode(auth, code);

      setState({
        status: 'success',
        message: 'Your email has been verified successfully!',
        email,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Verification failed';
      const cleanMessage = message
        .replace('Firebase: ', '')
        .replace(/\(auth\/.*\)/, '')
        .trim();

      // Handle specific error codes
      if (message.includes('auth/invalid-action-code')) {
        setState({
          status: 'error',
          message: 'This verification link is invalid or has already been used.',
        });
      } else if (message.includes('auth/expired-action-code')) {
        setState({
          status: 'error',
          message: 'This verification link has expired. Please request a new one.',
        });
      } else {
        setState({
          status: 'error',
          message: cleanMessage || 'Failed to verify email. Please try again.',
        });
      }
    }
  }, []);

  useEffect(() => {
    if (!mode || !oobCode) {
      setState({
        status: 'error',
        message: 'Invalid verification link. Please check your email and try again.',
      });
      return;
    }

    switch (mode) {
      case 'verifyEmail':
        handleVerifyEmail(oobCode);
        break;
      case 'resetPassword':
        // Redirect to reset password page with the code
        window.location.href = `/reset-password?oobCode=${oobCode}`;
        break;
      case 'recoverEmail':
        // Handle email recovery if needed
        setState({
          status: 'error',
          message: 'Email recovery is not yet supported. Please contact support.',
        });
        break;
      default:
        setState({
          status: 'error',
          message: 'Unknown action type. Please check your link and try again.',
        });
    }
  }, [mode, oobCode, handleVerifyEmail]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          boxShadow:
            '0 0 40px color-mix(in srgb, var(--brand-secondary) 15%, transparent), 0 0 80px color-mix(in srgb, var(--brand-secondary) 8%, transparent)',
        }}
        className="relative w-full max-w-md bg-linear-to-br from-(--blue-dark-700) via-(--blue-dark-600) to-(--blue-dark-700) rounded-2xl border-2 border-[color-mix(in srgb, var(--brand-secondary) 40%, transparent)] p-10"
      >
        <div className="text-center space-y-4">
          {/* Icon based on status */}
          <div
            className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${
              state.status === 'loading'
                ? 'bg-[color-mix(in_srgb,var(--brand-secondary)_20%,transparent)]'
                : state.status === 'success'
                  ? 'bg-green-500/20'
                  : 'bg-red-500/20'
            }`}
          >
            {state.status === 'loading' && (
              <Loader2 className="w-8 h-8 text-(--brand-secondary) animate-spin" />
            )}
            {state.status === 'success' && <CheckCircle2 className="w-8 h-8 text-green-500" />}
            {state.status === 'error' && <AlertCircle className="w-8 h-8 text-red-500" />}
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-brand-primary">
            {state.status === 'loading' && 'Verifying...'}
            {state.status === 'success' && 'Email Verified!'}
            {state.status === 'error' && 'Verification Failed'}
          </h1>

          {/* Message */}
          <p className="text-brand-primary text-base">{state.message}</p>

          {/* Show email if available */}
          {state.status === 'success' && state.email && (
            <div className="flex items-center justify-center gap-2 text-brand-primary/60 text-sm">
              <Mail className="w-4 h-4" />
              <span>{state.email}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-4 space-y-3">
            {state.status === 'success' && (
              <Link href="/login">
                <Button
                  type="button"
                  className="w-full bg-brand-surface hover:bg-(--surface-card-hover) text-(--text-primary) h-11 rounded-xl border-2 border-[color-mix(in srgb, var(--brand-secondary) 40%, transparent)]"
                >
                  Continue to Sign In
                </Button>
              </Link>
            )}

            {state.status === 'error' && (
              <>
                <Link href="/sign-up">
                  <Button
                    type="button"
                    className="w-full bg-brand-surface hover:bg-(--surface-card-hover) text-(--text-primary) h-11 rounded-xl border-2 border-[color-mix(in srgb, var(--brand-secondary) 40%, transparent)]"
                  >
                    Create New Account
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full text-brand-primary/60 hover:text-brand-primary"
                  >
                    Back to Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function AuthActionPage(): React.JSX.Element {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-6 bg-background">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-(--brand-secondary) animate-spin" />
            <p className="text-brand-primary/60">Loading...</p>
          </div>
        </div>
      }
    >
      <AuthActionContent />
    </Suspense>
  );
}
