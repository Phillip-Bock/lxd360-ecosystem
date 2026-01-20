'use client';

/**
 * VIP Access Content Component
 * ============================
 * Locked content style page for VIP access.
 * Users enter their VIP code to unlock access to the VIP dashboard.
 *
 * Design inspired by Qurova template 401.html password-protected page.
 * Branded for LXP360 with custom colors and styling.
 */

import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Lock, Shield, Sparkles, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

// ============================================================================
// VIP BENEFITS
// ============================================================================

const VIP_BENEFITS = [
  { icon: Sparkles, text: 'Early access to new features' },
  { icon: Shield, text: 'Priority support from our team' },
  { icon: Star, text: 'Exclusive training resources' },
  { icon: CheckCircle, text: 'Beta program participation' },
];

// ============================================================================
// COMPONENT
// ============================================================================

export function VIPAccessContent(): React.JSX.Element {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Validate VIP code via API
      const response = await fetch('/api/vip/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        // Store VIP session info
        sessionStorage.setItem('vip_user', JSON.stringify(data.user));
        sessionStorage.setItem('vip_access_level', data.user.accessLevel);

        // Redirect based on access level
        if (data.user.accessLevel === 'god') {
          router.push('/super-admin');
        } else {
          router.push('/vip-demo');
        }
      } else {
        setError(data.error || 'Invalid VIP code. Please check your code and try again.');
        setIsLoading(false);
      }
    } catch {
      // Silently ignore - network error, show generic message to user
      setError('Unable to validate code. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-lxd-light-bg via-lxd-light-card to-lxd-light-surface dark:from-lxd-dark-page dark:via-lxd-dark-surface dark:to-lxd-dark-page">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-lxd-blue/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-lxd-purple/10 rounded-full blur-3xl" />
      </div>

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md mx-auto px-6"
      >
        {/* Card */}
        <div className="bg-brand-surface/80 dark:bg-lxd-dark-card/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-lxd-light-border/50 dark:border-lxd-purple-dark/30 p-8 md:p-10">
          {/* Lock Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="flex justify-center mb-6"
          >
            <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-lxd-blue to-lxd-purple flex items-center justify-center shadow-lg shadow-lxd-blue/25">
              <Lock className="w-10 h-10 text-brand-primary" />
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl md:text-3xl font-bold text-center text-lxd-text-dark dark:text-lxd-text-light mb-3"
          >
            VIP Access
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center text-lxd-text-dark-body dark:text-lxd-text-light-muted mb-8"
          >
            Enter your exclusive VIP code to unlock premium features and early access to the LXP360
            platform.
          </motion.p>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter your VIP code"
                className="w-full px-5 py-4 rounded-xl bg-lxd-light-surface/50 dark:bg-lxd-dark-surface/50 border border-lxd-light-border dark:border-lxd-purple-dark/30 text-lxd-text-dark dark:text-lxd-text-light placeholder:text-lxd-text-dark-body/50 dark:placeholder:text-lxd-text-light-muted/50 focus:outline-hidden focus:ring-2 focus:ring-lxd-blue/50 focus:border-lxd-blue transition-all"
                disabled={isLoading}
              />
            </div>

            {/* Error message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-brand-error text-sm text-center bg-red-50 dark:bg-red-900/20 rounded-lg py-2 px-4"
              >
                {error}
              </motion.div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading || !code.trim()}
              className="w-full py-4 px-6 rounded-xl bg-linear-to-r from-lxd-blue to-lxd-blue-dark text-brand-primary font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-lxd-blue/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Unlock VIP Access
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </motion.form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-lxd-light-border dark:border-lxd-purple-dark/30" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-brand-surface dark:bg-lxd-dark-card text-lxd-text-dark-body dark:text-lxd-text-light-muted">
                VIP Benefits
              </span>
            </div>
          </div>

          {/* Benefits list */}
          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="space-y-3"
          >
            {VIP_BENEFITS.map((benefit, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="flex items-center gap-3 text-sm text-lxd-text-dark-body dark:text-lxd-text-light-muted"
              >
                <div className="w-8 h-8 rounded-lg bg-lxd-blue/10 dark:bg-lxd-blue/20 flex items-center justify-center shrink-0">
                  <benefit.icon className="w-4 h-4 text-lxd-blue" />
                </div>
                {benefit.text}
              </motion.li>
            ))}
          </motion.ul>
        </div>

        {/* Contact link */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-sm text-lxd-text-dark-body dark:text-lxd-text-light-muted mt-6"
        >
          Don&apos;t have a VIP code?{' '}
          <a href="/contact" className="text-lxd-blue hover:underline">
            Contact us
          </a>{' '}
          to learn about VIP access.
        </motion.p>
      </motion.div>
    </div>
  );
}
