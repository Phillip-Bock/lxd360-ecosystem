'use client';

export const dynamic = 'force-dynamic';

/**
 * Reset Password Page
 * ====================
 * Single centered card with dark blue gradient background.
 * All internal elements have thin purple borders.
 * Features tilt/shine animation on hover.
 */

import { verifyPasswordResetCode } from 'firebase/auth';
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { AlertTriangle, ArrowRight, CheckCircle, Eye, EyeOff, KeyRound } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getFirebaseAuth } from '@/lib/firebase/client';

// Tilt animation constants
const ROTATION_RANGE = 12;
const HALF_ROTATION_RANGE = ROTATION_RANGE / 2;
const PERSPECTIVE = '1500px';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

export default function ResetPasswordPage(): React.JSX.Element | null {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [_oobCode, setOobCode] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Tilt animation
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const xSpring = useSpring(x, { stiffness: 200, damping: 20 });
  const ySpring = useSpring(y, { stiffness: 200, damping: 20 });
  const transform = useMotionTemplate`rotateX(${xSpring}deg) rotateY(${ySpring}deg)`;
  const sheenOpacity = useTransform(
    ySpring,
    [-HALF_ROTATION_RANGE, 0, HALF_ROTATION_RANGE],
    [0.15, 0, 0.15],
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) * ROTATION_RANGE;
    const mouseY = (e.clientY - rect.top) * ROTATION_RANGE;
    const rX = (mouseY / rect.height - HALF_ROTATION_RANGE) * -1;
    const rY = mouseX / rect.width - HALF_ROTATION_RANGE;
    x.set(rX);
    y.set(rY);
  };

  const handleMouseLeave = (): void => {
    x.set(0);
    y.set(0);
  };

  useEffect(() => {
    setMounted(true);
    const code = searchParams.get('oobCode');

    const checkSession = async (): Promise<void> => {
      if (!code) {
        setIsValidSession(false);
        setCheckingSession(false);
        return;
      }

      try {
        const auth = getFirebaseAuth();
        if (!auth) {
          setIsValidSession(false);
          setCheckingSession(false);
          return;
        }
        await verifyPasswordResetCode(auth, code);
        setOobCode(code);
        setIsValidSession(true);
      } catch {
        setIsValidSession(false);
      } finally {
        setCheckingSession(false);
      }
    };

    checkSession();
  }, [searchParams]);

  const handleResetPassword = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }

    // TODO(LXD-302): Implement Firebase Auth updatePassword
    try {
      setError('Password reset temporarily disabled during Firebase migration');
      setSuccess(true);
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="w-8 h-8 border-4 border-(--brand-secondary) border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isValidSession && !checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div style={{ perspective: PERSPECTIVE }}>
          <motion.div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            style={{
              transform,
              boxShadow:
                '0 0 40px color-mix(in srgb, var(--brand-secondary) 15%, transparent), 0 0 80px color-mix(in srgb, var(--brand-secondary) 8%, transparent)',
            }}
            className="relative w-full max-w-md bg-linear-to-br from-(--blue-dark-700) via-(--blue-dark-600) to-(--blue-dark-700) rounded-2xl border-2 border-[color-mix(in srgb, var(--brand-secondary) 40%, transparent)] p-8"
          >
            <motion.div
              style={{ opacity: sheenOpacity }}
              className="pointer-events-none absolute inset-0 z-0 rounded-2xl bg-linear-to-br from-[color-mix(in srgb, var(--brand-secondary) 30%, transparent)] via-[color-mix(in srgb, var(--brand-secondary) 10%, transparent)] to-transparent"
            />

            <div className="relative z-10 space-y-6">
              <div className="text-center">
                <Link href="/" className="inline-block">
                  <Image
                    src="/lxd360-logo.png"
                    alt="LXD360"
                    width={160}
                    height={64}
                    className="brightness-0 invert mx-auto"
                  />
                </Link>
              </div>

              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-linear-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto shadow-lg shadow-red-500/30">
                  <AlertTriangle className="w-8 h-8 text-brand-primary" strokeWidth={2} />
                </div>
                <h1 className="text-2xl font-bold text-brand-primary">Invalid or Expired Link</h1>
                <p className="text-brand-primary text-sm">
                  This password reset link is invalid or has expired. Please contact support.
                </p>
                <Link href="/auth/login">
                  <Button className="w-full bg-brand-surface hover:bg-(--surface-card-hover) text-(--text-primary) h-11 rounded-xl border-2 border-[color-mix(in srgb, var(--brand-secondary) 40%, transparent)] mt-4">
                    Return to Login
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>

              <p className="text-center text-brand-primary text-xs">
                © {new Date().getFullYear()} LXD360 LLC
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      {/* Perspective wrapper for tilt effect */}
      <div style={{ perspective: PERSPECTIVE }}>
        {/* Card with Tilt */}
        <motion.div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          style={{
            transform,
            boxShadow:
              '0 0 40px color-mix(in srgb, var(--brand-secondary) 15%, transparent), 0 0 80px color-mix(in srgb, var(--brand-secondary) 8%, transparent)',
          }}
          className="relative w-full max-w-md bg-linear-to-br from-(--blue-dark-700) via-(--blue-dark-600) to-(--blue-dark-700) rounded-2xl border-2 border-[color-mix(in srgb, var(--brand-secondary) 40%, transparent)] p-8"
        >
          {/* Sheen overlay - purple glow */}
          <motion.div
            style={{ opacity: sheenOpacity }}
            className="pointer-events-none absolute inset-0 z-0 rounded-2xl bg-linear-to-br from-[color-mix(in srgb, var(--brand-secondary) 30%, transparent)] via-[color-mix(in srgb, var(--brand-secondary) 10%, transparent)] to-transparent"
          />

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="relative z-10 space-y-6"
          >
            {/* Logo */}
            <motion.div variants={fadeInUp} className="text-center">
              <Link href="/" className="inline-block">
                <Image
                  src="/lxd360-logo.png"
                  alt="LXD360"
                  width={160}
                  height={64}
                  className="brightness-0 invert mx-auto"
                />
              </Link>
              <p className="text-brand-primary/50 text-xs mt-2">
                Training the Future for the Future
              </p>
            </motion.div>

            {success ? (
              <motion.div variants={fadeInUp} className="text-center space-y-4">
                <div className="w-16 h-16 bg-linear-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto shadow-lg shadow-green-500/30">
                  <CheckCircle className="w-8 h-8 text-brand-primary" strokeWidth={2} />
                </div>
                <h1 className="text-2xl font-bold text-brand-primary">Password Updated!</h1>
                <p className="text-brand-primary text-sm">
                  Your password has been successfully updated. Redirecting you to login...
                </p>
              </motion.div>
            ) : (
              <>
                {/* Icon & Title */}
                <motion.div variants={fadeInUp} className="text-center">
                  <div className="w-16 h-16 bg-linear-to-br from-(--brand-secondary) to-(--brand-primary) rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[color-mix(in srgb, var(--brand-secondary) 30%, transparent)]">
                    <KeyRound className="w-8 h-8 text-brand-primary" strokeWidth={2} />
                  </div>
                  <h1 className="text-2xl font-bold text-brand-primary mb-2">
                    Create new password
                  </h1>
                  <p className="text-brand-primary text-sm">Enter your new password below</p>
                </motion.div>

                {/* Form */}
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <motion.div variants={fadeInUp}>
                    <Label htmlFor="password" className="text-brand-primary/60 text-sm">
                      New Password
                    </Label>
                    <div className="relative mt-1">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-primary/30" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isLoading}
                        className="bg-brand-surface border-2 border-[color-mix(in srgb, var(--brand-secondary) 40%, transparent)] text-(--text-primary) placeholder:text-(--text-primary)/40 pl-10 pr-10 h-11"
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-primary/30 hover:text-brand-primary/60"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </motion.div>

                  <motion.div variants={fadeInUp}>
                    <Label htmlFor="confirmPassword" className="text-brand-primary/60 text-sm">
                      Confirm Password
                    </Label>
                    <div className="relative mt-1">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-primary/30" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        disabled={isLoading}
                        className="bg-brand-surface border-2 border-[color-mix(in srgb, var(--brand-secondary) 40%, transparent)] text-(--text-primary) placeholder:text-(--text-primary)/40 pl-10 pr-10 h-11"
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-primary/30 hover:text-brand-primary/60"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </motion.div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-brand-error/10 border border-brand-error/40 rounded-xl p-3"
                    >
                      <p className="text-sm text-brand-error">{error}</p>
                    </motion.div>
                  )}

                  <motion.div variants={fadeInUp}>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-brand-surface hover:bg-(--surface-card-hover) text-(--text-primary) h-11 rounded-xl border-2 border-[color-mix(in srgb, var(--brand-secondary) 40%, transparent)]"
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <svg
                            className="animate-spin w-4 h-4"
                            viewBox="0 0 24 24"
                            role="img"
                            aria-label="Loading"
                          >
                            <title>Loading</title>
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Updating Password...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          Update Password
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      )}
                    </Button>
                  </motion.div>
                </form>

                {/* Link */}
                <motion.div variants={fadeInUp} className="text-center">
                  <p className="text-brand-primary text-sm">
                    Remember your password?{' '}
                    <Link
                      href="/auth/login"
                      className="text-(--brand-secondary) hover:text-(--brand-primary) font-medium"
                    >
                      Login
                    </Link>
                  </p>
                </motion.div>
              </>
            )}
          </motion.div>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="relative z-10 text-center text-brand-primary text-xs mt-6"
          >
            © {new Date().getFullYear()} LXD360 LLC
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
