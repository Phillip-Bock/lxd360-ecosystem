'use client';

import Link from 'next/link';

interface GradientShadowButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  /** Gradient variant - determines the color scheme */
  variant?: 'primary' | 'secondary' | 'tertiary';
}

/**
 * Gradient configurations for each variant
 * - primary: Blue gradient (main CTA) - INSPIRE Studio
 * - secondary: Cyan-to-blue gradient (tech stack) - LXP360
 * - tertiary: Purple gradient (strategy) - B2B Blueprint
 */
const gradientConfig = {
  primary: {
    gradient: 'from-blue-500 to-blue-600',
    shadow: 'from-blue-500 to-blue-600',
  },
  secondary: {
    gradient: 'from-cyan-500 to-blue-600',
    shadow: 'from-cyan-500 to-blue-600',
  },
  tertiary: {
    gradient: 'from-purple-500 to-violet-600',
    shadow: 'from-purple-500 to-violet-600',
  },
};

export function GradientShadowButton({
  children,
  href,
  onClick,
  className = '',
  variant = 'primary',
}: GradientShadowButtonProps) {
  const { gradient, shadow } = gradientConfig[variant];

  const buttonContent = (
    <div
      className={`group relative w-fit transition-transform duration-300 active:scale-95 ${className}`}
    >
      {/* Main button with gradient border */}
      <span
        className={`relative z-10 block rounded-lg bg-linear-to-br ${gradient} p-0.5 duration-300 group-hover:scale-105`}
      >
        <span className="block rounded-md bg-lxd-dark-page px-6 py-3 font-semibold text-lxd-text-light duration-300 group-hover:bg-lxd-dark-page/50 group-hover:text-brand-primary group-active:bg-lxd-dark-page/80 text-base whitespace-nowrap">
          {children}
        </span>
      </span>
      {/* Glow shadow effect */}
      <span
        className={`pointer-events-none absolute -inset-3 z-0 transform-gpu rounded-2xl bg-linear-to-br ${shadow} opacity-30 blur-xl transition-all duration-300 group-hover:opacity-70 group-active:opacity-50`}
      />
    </div>
  );

  if (href) {
    return <Link href={href}>{buttonContent}</Link>;
  }

  return (
    <button type="button" onClick={onClick}>
      {buttonContent}
    </button>
  );
}
