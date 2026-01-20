'use client';

export const dynamic = 'force-dynamic';

/**
 * Login Page
 * ==========
 * Single centered card with dark blue gradient background.
 * All internal elements have thin purple borders.
 * Contains both login form AND branding content.
 * Features tilt/shine animation on hover.
 */

import {
  GoogleAuthProvider,
  OAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth';
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowRight, Eye, EyeOff, KeyRound, Mail } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { auth } from '@/lib/firebase/client';
import '@/app/globals.css';

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

function GoogleIcon(): React.JSX.Element {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" role="img" aria-label="Google">
      <title>Google</title>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function MicrosoftIcon(): React.JSX.Element {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" role="img" aria-label="Microsoft">
      <title>Microsoft</title>
      <path fill="#F25022" d="M1 1h10v10H1z" />
      <path fill="#00A4EF" d="M1 13h10v10H1z" />
      <path fill="#7FBA00" d="M13 1h10v10H13z" />
      <path fill="#FFB900" d="M13 13h10v10H13z" />
    </svg>
  );
}

export default function LoginPage(): React.JSX.Element | null {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

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
  }, []);

  const handleLogin = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/dashboard');
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(
        message
          .replace('Firebase: ', '')
          .replace(/\(auth\/.*\)/, '')
          .trim(),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push('/dashboard');
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(
        message
          .replace('Firebase: ', '')
          .replace(/\(auth\/.*\)/, '')
          .trim(),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicrosoftLogin = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const provider = new OAuthProvider('microsoft.com');
      await signInWithPopup(auth, provider);
      router.push('/dashboard');
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(
        message
          .replace('Firebase: ', '')
          .replace(/\(auth\/.*\)/, '')
          .trim(),
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      {/* Perspective wrapper for tilt effect */}
      <div style={{ perspective: PERSPECTIVE }}>
        {/* Single Rectangular Card - Horizontal Layout with Tilt */}
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
          className="relative w-full max-w-5xl bg-linear-to-br from-(--blue-dark-700) via-(--blue-dark-600) to-(--blue-dark-700) rounded-2xl border-2 border-(--brand-secondary)/40 p-10"
        >
          {/* Sheen overlay - purple glow */}
          <motion.div
            style={{ opacity: sheenOpacity }}
            className="pointer-events-none absolute inset-0 z-0 rounded-2xl bg-linear-to-br from-(--brand-secondary)/30 via-(--brand-secondary)/10 to-transparent"
          />

          {/* Two-Column Row Layout */}
          <div className="relative z-10 flex flex-row gap-10 items-center">
            {/* LEFT SIDE - Branding */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="flex-1 space-y-6"
            >
              {/* Logo */}
              <motion.div variants={fadeInUp}>
                <Link href="/" className="inline-block">
                  <Image
                    src="/lxd360-logo.png"
                    alt="LXD360"
                    width={160}
                    height={64}
                    className="brightness-0 invert"
                  />
                </Link>
                <p className="text-brand-primary/50 text-xs mt-2">
                  Training the Future for the Future
                </p>
              </motion.div>

              {/* Branding Headline */}
              <motion.div variants={fadeInUp}>
                <h2 className="text-3xl font-bold text-brand-primary mb-3">
                  Get inside LXP360 and start learning
                </h2>
                <p className="text-(--text-inverse) text-base">
                  Access your personalized learning dashboard and continue your journey.
                </p>
              </motion.div>

              {/* Feature Highlights - 2x2 Grid with Shimmer Border */}
              <motion.div variants={fadeInUp} className="grid grid-cols-2 gap-3">
                {[
                  { label: 'AI-Powered', value: 'Content' },
                  { label: 'Real-Time', value: 'Analytics' },
                  { label: 'Seamless', value: 'Integration' },
                  { label: 'Enterprise', value: 'Security' },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="group relative overflow-hidden rounded-xl p-0.5 transition-all duration-500 hover:scale-[1.02]"
                  >
                    {/* Shimmer border animation */}
                    <motion.div
                      initial={{ rotate: '0deg' }}
                      animate={{ rotate: '360deg' }}
                      style={{ scale: 1.75 }}
                      transition={{
                        repeat: Infinity,
                        duration: 3.5,
                        ease: 'linear',
                      }}
                      className="absolute inset-0 z-0 bg-linear-to-br from-(--brand-secondary) via-(--brand-secondary)/0 to-(--brand-secondary) opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    />
                    {/* Static purple border */}
                    <div className="absolute inset-0 z-0 rounded-xl border-2 border-(--brand-secondary)" />
                    {/* Card content */}
                    <div className="relative z-10 text-center p-3 bg-(--blue-dark-700) rounded-[10px]">
                      <p className="text-[10px] text-(--text-inverse) uppercase tracking-wider mb-0.5">
                        {item.label}
                      </p>
                      <p className="font-semibold text-(--text-inverse) text-sm">{item.value}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* RIGHT SIDE - Login Form */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="flex-1 bg-brand-surface/5 border-2 border-(--brand-secondary)/40 rounded-2xl p-8 space-y-5"
            >
              {/* Welcome Title */}
              <motion.div variants={fadeInUp} className="text-center">
                <h1 className="text-xl font-bold text-brand-primary">Welcome Back</h1>
                <p className="text-(--text-inverse) text-sm mt-1">Log in to continue</p>
              </motion.div>

              {/* OAuth Buttons */}
              <motion.div variants={fadeInUp} className="space-y-3">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-(--surface-card) border-2 border-(--brand-secondary)/40 rounded-xl text-(--text-primary) hover:bg-(--surface-card-hover) transition-all"
                >
                  <GoogleIcon />
                  Log in with Google
                </button>
                <button
                  type="button"
                  onClick={handleMicrosoftLogin}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-(--surface-card) border-2 border-(--brand-secondary)/40 rounded-xl text-(--text-primary) hover:bg-(--surface-card-hover) transition-all"
                >
                  <MicrosoftIcon />
                  Log in with Microsoft
                </button>
              </motion.div>

              {/* Divider Text */}
              <motion.div variants={fadeInUp} className="text-center">
                <span className="text-(--text-inverse) text-xs">or continue with email</span>
              </motion.div>

              {/* Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                <motion.div variants={fadeInUp}>
                  <Label htmlFor="email" className="text-brand-primary/60 text-sm">
                    Email
                  </Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-primary/30" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                      className="bg-(--surface-card) border-2 border-(--brand-secondary)/40 text-(--text-primary) placeholder:text-(--text-primary)/40 pl-10 h-11"
                      placeholder="your@email.com"
                    />
                  </div>
                </motion.div>

                <motion.div variants={fadeInUp}>
                  <Label htmlFor="password" className="text-brand-primary/60 text-sm">
                    Password
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
                      className="bg-(--surface-card) border-2 border-(--brand-secondary)/40 text-(--text-primary) placeholder:text-(--text-primary)/40 pl-10 pr-10 h-11"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-primary/30 hover:text-brand-primary/60"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                        Signing in...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        Log In
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    )}
                  </Button>
                </motion.div>
              </form>

              {/* Links */}
              <motion.div variants={fadeInUp} className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  className="text-(--brand-primary) hover:text-(--brand-secondary)"
                  onClick={() => {
                    // TODO(LXD-316): Implement forgot-password modal
                    alert('Forgot password functionality coming soon');
                  }}
                >
                  Forgot password?
                </button>
                <Link
                  href="/auth/sign-up"
                  className="text-(--brand-secondary) hover:text-(--brand-primary)"
                >
                  Sign up
                </Link>
              </motion.div>
            </motion.div>
          </div>

          {/* Footer - Full Width */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="relative z-10 text-center text-brand-primary text-xs mt-8"
          >
            © {new Date().getFullYear()} LXD360 LLC
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
