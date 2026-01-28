'use client';

export const dynamic = 'force-dynamic';

/**
 * Email Verification Required Page
 * =================================
 * Shown to users who are signed in but have not verified their email.
 * Allows them to resend the verification email.
 */

import { sendEmailVerification, signOut } from 'firebase/auth';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, LogOut, Mail, RefreshCw } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type React from 'react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { getFirebaseAuth } from '@/lib/firebase/client';
import { useSafeAuth } from '@/providers/SafeAuthProvider';

export default function VerifyEmailPage(): React.JSX.Element | null {
  const { user, loading } = useSafeAuth();
  const router = useRouter();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  // Redirect if not logged in or already verified
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (!loading && user?.emailVerified) {
      router.push('/ignite/dashboard');
    }
  }, [user, loading, router]);

  const handleResendEmail = async () => {
    if (!user) return;

    setSending(true);
    setError(null);
    setSent(false);

    try {
      await sendEmailVerification(user);
      setSent(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send email';
      if (message.includes('too-many-requests')) {
        setError('Too many requests. Please wait a few minutes before trying again.');
      } else {
        setError(
          message
            .replace('Firebase: ', '')
            .replace(/\(auth\/.*\)/, '')
            .trim(),
        );
      }
    } finally {
      setSending(false);
    }
  };

  const handleCheckVerification = async () => {
    if (!user) return;

    setChecking(true);
    try {
      // Reload user to get latest emailVerified status
      await user.reload();

      if (user.emailVerified) {
        router.push('/ignite/dashboard');
      } else {
        setError(
          'Email not verified yet. Please check your inbox and click the verification link.',
        );
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to check verification status';
      setError(message);
    } finally {
      setChecking(false);
    }
  };

  const handleSignOut = async () => {
    const auth = getFirebaseAuth();
    if (auth) {
      await signOut(auth);
      router.push('/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-(--brand-secondary) animate-spin" />
      </div>
    );
  }

  if (!user || user.emailVerified) {
    return null;
  }

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
        <div className="text-center space-y-6">
          {/* Logo */}
          <Link href="/" className="inline-block">
            <Image
              src="/lxd360-logo.png"
              alt="LXD360"
              width={120}
              height={48}
              className="brightness-0 invert mx-auto"
            />
          </Link>

          {/* Icon */}
          <div className="mx-auto w-16 h-16 bg-[color-mix(in_srgb,var(--brand-secondary)_20%,transparent)] rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-(--brand-secondary)" />
          </div>

          {/* Title & Message */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-brand-primary">Verify Your Email</h1>
            <p className="text-brand-primary text-base">
              We sent a verification email to <span className="font-semibold">{user.email}</span>.
              Please check your inbox and click the link to continue.
            </p>
          </div>

          {/* Success message */}
          {sent && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-500/10 border border-green-500/40 rounded-xl p-3 flex items-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
              <p className="text-sm text-green-400">Verification email sent! Check your inbox.</p>
            </motion.div>
          )}

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-brand-error/10 border border-brand-error/40 rounded-xl p-3"
            >
              <p className="text-sm text-brand-error">{error}</p>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              type="button"
              onClick={handleCheckVerification}
              disabled={checking}
              className="w-full bg-brand-surface hover:bg-(--surface-card-hover) text-(--text-primary) h-11 rounded-xl border-2 border-[color-mix(in srgb, var(--brand-secondary) 40%, transparent)]"
            >
              {checking ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Checking...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  I&apos;ve Verified My Email
                </span>
              )}
            </Button>

            <Button
              type="button"
              onClick={handleResendEmail}
              disabled={sending}
              variant="ghost"
              className="w-full text-brand-primary/60 hover:text-brand-primary"
            >
              {sending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Resend Verification Email
                </span>
              )}
            </Button>

            <Button
              type="button"
              onClick={handleSignOut}
              variant="ghost"
              className="w-full text-brand-primary/40 hover:text-brand-primary/60"
            >
              <span className="flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                Sign Out
              </span>
            </Button>
          </div>

          {/* Help text */}
          <p className="text-brand-primary/40 text-xs">
            Can&apos;t find the email? Check your spam folder or try resending.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
