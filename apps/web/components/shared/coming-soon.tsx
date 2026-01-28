'use client';

import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

// ============================================================================
// COMPONENT PROPS
// ============================================================================

interface ComingSoonProps {
  title: string;
  description?: string;
  showNewsletter?: boolean;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ComingSoon({
  title,
  description = "We're working hard to bring you something amazing.",
  showNewsletter = false,
}: ComingSoonProps) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO(LXD-411): Connect to Brevo newsletter service
    setSubmitted(true);
  };

  return (
    <section className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      {/* Subtle Background Gradient */}
      <div className="absolute inset-0 bg-linear-to-b from-blue-500/5 via-transparent to-purple-500/5 dark:from-blue-500/10 dark:to-purple-500/10" />

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-2xl mx-auto py-20">
        {/* Main Heading - Split design */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-foreground tracking-tight">
            Coming
          </h1>
          <span className="text-5xl sm:text-6xl md:text-7xl font-bold bg-linear-to-r from-[var(--brand-primary)] via-lxd-purple to-[var(--brand-primary)] bg-clip-text text-transparent">
            Soon
          </span>
        </motion.div>

        {/* Page Title Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-6"
        >
          <span className="inline-block px-4 py-2 text-sm font-semibold text-brand-primary bg-linear-to-r from-[var(--brand-primary)] to-lxd-purple rounded-full shadow-lg shadow-[var(--brand-primary)]/25">
            {title}
          </span>
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-lg md:text-xl text-muted-foreground mb-10 max-w-lg mx-auto leading-relaxed"
        >
          {description}
        </motion.p>

        {/* Back to Home Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-brand-primary bg-linear-to-r from-[var(--brand-primary)] to-lxd-purple hover:from-brand-primary hover:to-brand-secondary-hover rounded-xl transition-all duration-300 shadow-lg shadow-[var(--brand-primary)]/25 hover:shadow-xl hover:shadow-[var(--brand-primary)]/30"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </motion.div>

        {/* Optional Newsletter Signup */}
        {showNewsletter && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-16 pt-10 border-t border-border"
          >
            <h3 className="text-lg font-semibold text-foreground mb-2">Get Notified</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Be the first to know when this page launches.
            </p>

            {submitted ? (
              <p className="text-sm text-green-600 dark:text-brand-success font-medium">
                Thanks! We&apos;ll keep you updated.
              </p>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="flex-1 px-4 py-3 text-sm bg-background border border-border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent"
                />
                <button
                  type="submit"
                  className="px-6 py-3 text-sm font-medium text-brand-primary bg-linear-to-r from-[var(--brand-primary)] to-lxd-purple hover:from-brand-primary hover:to-brand-secondary-hover rounded-xl transition-all duration-300"
                >
                  Notify Me
                </button>
              </form>
            )}
          </motion.div>
        )}
      </div>
    </section>
  );
}
