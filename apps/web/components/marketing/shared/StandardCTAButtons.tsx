'use client';

/**
 * StandardCTAButtons Component
 * ============================
 * Standardized Call-to-Action buttons for all public pages.
 *
 * Three CTAs:
 * 1. "Create AI-Powered Content Fast" -> /inspire-studio
 * 2. "Unify Your Entire Tech Stack" -> /lxd-ecosystem
 * 3. "Design Your L&D Strategy Blueprint" -> /solutions
 *
 * Styled with SplashButton gradient animation pattern.
 *
 * @example
 * // Basic usage - shows all CTAs except current page
 * <StandardCTAButtons currentPage="/inspire-studio" />
 *
 * // In a section with custom className
 * <StandardCTAButtons currentPage="/solutions" className="mt-8" />
 */

import { motion } from 'framer-motion';
import Link from 'next/link';

interface CTAButton {
  label: string;
  href: string;
  id: string;
}

const CTA_BUTTONS: CTAButton[] = [
  {
    id: 'inspire-studio',
    label: 'Create AI-Powered Content Fast',
    href: '/inspire-studio',
  },
  {
    id: 'lxd-ecosystem',
    label: 'Unify Your Entire Tech Stack',
    href: '/lxd-ecosystem',
  },
  {
    id: 'solutions',
    label: 'Design Your L&D Strategy Blueprint',
    href: '/solutions',
  },
];

interface StandardCTAButtonsProps {
  /** Current page path to exclude its CTA (e.g., "/inspire-studio") */
  currentPage?: string;
  /** Additional CSS classes */
  className?: string;
  /** Animation delay for staggered entrance */
  animationDelay?: number;
}

/**
 * SplashButton styled CTA
 */
function SplashButton({ label, href, index }: { label: string; href: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
    >
      <Link
        href={href}
        className="inline-block rounded-md bg-linear-to-br from-blue-400 to-blue-700 px-6 py-3 text-base font-semibold text-zinc-50 ring-2 ring-brand-primary/50 ring-offset-2 ring-offset-slate-900 transition-all duration-300 hover:scale-[1.02] hover:ring-transparent active:scale-[0.98] active:ring-brand-primary/70 dark:ring-offset-slate-900"
      >
        {label}
      </Link>
    </motion.div>
  );
}

/**
 * StandardCTAButtons Component
 * Renders the three standard CTAs, excluding the current page's CTA
 */
export function StandardCTAButtons({
  currentPage,
  className = '',
  animationDelay = 0,
}: StandardCTAButtonsProps) {
  // Filter out the CTA for the current page
  const visibleCTAs = CTA_BUTTONS.filter((cta) => {
    if (!currentPage) return true;
    // Check if current page matches the CTA href
    return !currentPage.includes(cta.id);
  });

  if (visibleCTAs.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay: animationDelay }}
      className={`flex flex-wrap items-center justify-center gap-4 ${className}`}
    >
      {visibleCTAs.map((cta, index) => (
        <SplashButton key={cta.id} label={cta.label} href={cta.href} index={index} />
      ))}
    </motion.div>
  );
}

/**
 * Single CTA Button Export
 * For cases where you need just one styled CTA
 */
export function SingleCTAButton({
  label,
  href,
  className = '',
}: {
  label: string;
  href: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-block rounded-md bg-linear-to-br from-blue-400 to-blue-700 px-6 py-3 text-base font-semibold text-zinc-50 ring-2 ring-brand-primary/50 ring-offset-2 ring-offset-slate-900 transition-all duration-300 hover:scale-[1.02] hover:ring-transparent active:scale-[0.98] active:ring-brand-primary/70 dark:ring-offset-slate-900 ${className}`}
    >
      {label}
    </Link>
  );
}

export default StandardCTAButtons;
