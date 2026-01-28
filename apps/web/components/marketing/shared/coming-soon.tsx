'use client';

/**
 * =============================================================================
 * ComingSoon Component
 * =============================================================================
 *
 * Standardized "Coming Soon" placeholder for stub pages.
 * Features neural-futuristic styling with animated background orbs,
 * gradient text, and email capture placeholder.
 *
 * @example
 * <ComingSoon
 *   title="Media Hub"
 *   description="Blog posts, videos, and learning resources"
 *   icon={<Radio className="w-12 h-12" />}
 * />
 */

import { motion } from 'framer-motion';
import { ArrowRight, Bell, Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';

interface ComingSoonProps {
  /** Page title */
  title: string;
  /** Page description */
  description: string;
  /** Optional icon for the page */
  icon?: ReactNode;
  /** Optional additional features to highlight */
  features?: string[];
  /** Optional custom badge text */
  badgeText?: string;
}

export function ComingSoon({
  title,
  description,
  icon,
  features,
  badgeText = 'Coming Soon',
}: ComingSoonProps): React.JSX.Element {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      // Email capture logic would go here
    }
  };

  return (
    <div className="min-h-[80vh] relative overflow-hidden flex items-center justify-center px-4 py-20">
      {/* Animated Background Orbs */}
      <motion.div
        animate={{
          y: [0, -20, 0],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-brand-primary/10 blur-3xl"
        aria-hidden="true"
      />
      <motion.div
        animate={{
          y: [0, 20, 0],
          opacity: [0.15, 0.3, 0.15],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-neural-purple/10 blur-3xl"
        aria-hidden="true"
      />
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.1, 0.25, 0.1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-neural-cyan/5 blur-3xl"
        aria-hidden="true"
      />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 text-center max-w-2xl mx-auto"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-linear-to-r from-brand-primary/20 to-neural-purple/20 border border-brand-primary/30 text-brand-primary dark:text-neural-cyan text-sm font-medium mb-8"
        >
          <Sparkles className="w-4 h-4" aria-hidden="true" />
          <span>{badgeText}</span>
        </motion.div>

        {/* Icon */}
        {icon && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex justify-center mb-8"
          >
            <div className="p-6 rounded-2xl bg-linear-to-br from-brand-primary/10 to-neural-purple/10 border border-brand-primary/20">
              <div className="text-brand-primary dark:text-neural-cyan">{icon}</div>
            </div>
          </motion.div>
        )}

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-lxd-dark-surface dark:text-lxd-light-page"
        >
          <span className="text-transparent bg-clip-text bg-linear-to-r from-brand-primary to-neural-cyan">
            {title}
          </span>
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-xl text-studio-text dark:text-studio-text mb-8 leading-relaxed"
        >
          {description}
        </motion.p>

        {/* Features */}
        {features && features.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex flex-wrap justify-center gap-3 mb-10"
          >
            {features.map((feature, index) => (
              <span
                key={index}
                className="px-4 py-2 rounded-full text-sm font-medium bg-white dark:bg-studio-bg border border-lxd-light-border dark:border-surface-card text-studio-text dark:text-studio-text"
              >
                {feature}
              </span>
            ))}
          </motion.div>
        )}

        {/* Email Capture */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="max-w-md mx-auto"
        >
          {submitted ? (
            <div className="p-6 rounded-2xl bg-linear-to-r from-success/10 to-emerald-500/10 border border-success/30">
              <p className="text-success font-medium flex items-center justify-center gap-2">
                <Bell className="w-5 h-5" aria-hidden="true" />
                You&apos;ll be notified when we launch!
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-studio-text dark:text-studio-text mb-4">
                Get notified when this page goes live
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <label htmlFor="email-capture" className="sr-only">
                  Email address
                </label>
                <input
                  type="email"
                  id="email-capture"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-xl border border-lxd-light-border dark:border-surface-card bg-white dark:bg-studio-bg text-lxd-dark-surface dark:text-lxd-light-page placeholder:text-studio-text/50 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-linear-to-r from-brand-primary to-lxd-secondary text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-brand-primary/25 transition-all whitespace-nowrap"
                >
                  Notify Me
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}

export default ComingSoon;
