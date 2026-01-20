'use client';

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { ChevronRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * =============================================================================
 * LXP360-SaaS | Unified Button Component
 * =============================================================================
 *
 * @fileoverview Unified button component with multiple variants including
 * CTA (animated shimmer), secondary (cyan dot pulse), and standard variants.
 *
 * @version      2.0.0
 * @updated      2025-12-20
 *
 * =============================================================================
 */

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-lxd-primary/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-lxd-primary text-white shadow-glow-sm hover:bg-lxd-primary/90',
        primary: 'bg-lxd-primary text-white shadow-glow-sm hover:bg-lxd-primary/90',
        cta: 'group relative isolate overflow-hidden bg-black text-white border border-transparent rounded-lg px-6 py-3 font-medium hover:scale-[1.02] active:scale-[0.98] cta-shimmer shadow-glow-sm hover:shadow-glow-md',
        secondary:
          'bg-lxd-secondary text-white shadow-glow-sm hover:bg-lxd-secondary/90 hover:shadow-glow-md',
        tertiary: 'bg-transparent hover:bg-card hover:text-foreground',
        ghost: 'bg-transparent hover:bg-card hover:shadow-glow-sm',
        glass:
          'bg-lxd-card backdrop-blur-xl border border-lxd-border text-white shadow-sm hover:bg-lxd-card/90 hover:shadow-glow-md',
        destructive:
          'bg-error text-white shadow-sm hover:bg-error/90 hover:shadow-[0_0_20px_rgba(205,10,10,0.4)]',
        outline: 'border border-border bg-transparent hover:bg-card hover:shadow-glow-sm',
        link: 'text-lxd-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        md: 'h-10 px-4 py-2',
        lg: 'h-12 rounded-md px-8 text-base',
        icon: 'h-10 w-10 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  href?: string;
  target?: React.HTMLAttributeAnchorTarget;
  rel?: string;
  download?: boolean | string;
}

/**
 * CTA Shimmer Effect Component
 * Renders the animated gradient border and shimmer effects for CTA variant
 */
function CtaShimmerEffect(): React.JSX.Element {
  return (
    <>
      {/* Gradient border animation */}
      <span
        className="pointer-events-none absolute inset-0 rounded-lg"
        style={{
          background: `linear-gradient(#000, #000) padding-box,
            conic-gradient(from var(--shimmer-angle, 0deg), transparent, #67e8f9 5%, white 10%, #67e8f9 15%, transparent 20%) border-box`,
          border: '1px solid transparent',
        }}
        aria-hidden="true"
      />
      {/* Dots pattern overlay */}
      <span
        className="pointer-events-none absolute inset-[3px] rounded-[5px] opacity-40"
        style={{
          background: `radial-gradient(circle at 2px 2px, white 0.5px, transparent 0) padding-box`,
          backgroundSize: '4px 4px',
          backgroundRepeat: 'space',
          maskImage:
            'conic-gradient(from calc(var(--shimmer-angle, 0deg) + 45deg), black, transparent 10% 90%, black)',
        }}
        aria-hidden="true"
      />
      {/* Inner glow */}
      <span
        className="pointer-events-none absolute inset-0 rounded-lg opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          boxShadow: 'inset 0 -1rem 2rem 4px rgba(103, 232, 249, 0.3)',
        }}
        aria-hidden="true"
      />
    </>
  );
}

/**
 * Secondary Dot Pulse Component
 * Renders the animated cyan dot for secondary variant
 */
function SecondaryDotPulse(): React.JSX.Element {
  return (
    <span className="relative z-10 h-3 w-3 shrink-0 rounded-full bg-cyan-400 transition-all duration-500 ease-out group-hover:scale-125 group-hover:bg-cyan-300 group-hover:shadow-lg group-hover:shadow-cyan-300/50">
      {/* Ping animation */}
      <span
        className="absolute inset-0 animate-ping rounded-full bg-cyan-400 opacity-0 group-hover:opacity-60"
        style={{ animationDuration: '2s' }}
        aria-hidden="true"
      />
    </span>
  );
}

/**
 * Renders button content based on variant
 */
function ButtonContent({
  variant,
  loading,
  children,
}: {
  variant: ButtonProps['variant'];
  loading: boolean;
  children: React.ReactNode;
}): React.JSX.Element {
  if (variant === 'cta') {
    return (
      <>
        <CtaShimmerEffect />
        <span className="relative z-10 flex items-center">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {children}
          <ChevronRight className="ml-1 size-4 shrink-0 transition-transform duration-300 ease-out group-hover:translate-x-1" />
        </span>
      </>
    );
  }

  if (variant === 'secondary') {
    return (
      <>
        <span
          className="absolute inset-0 rounded-lg bg-linear-to-r from-cyan-200/0 via-cyan-200/10 to-cyan-200/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 dark:from-cyan-200/0 dark:via-cyan-200/10 dark:to-cyan-200/0"
          aria-hidden="true"
        />
        <span
          className="absolute inset-0 animate-pulse rounded-lg border-2 border-cyan-200/0 opacity-0 transition-all duration-500 group-hover:border-cyan-500/30 group-hover:opacity-100 dark:group-hover:border-cyan-200/30"
          aria-hidden="true"
        />
        <span className="relative z-10 text-sm font-medium tracking-wide whitespace-nowrap transition-all duration-300 group-hover:text-cyan-600 dark:group-hover:text-cyan-50">
          {loading ? <Loader2 className="mr-2 inline h-4 w-4 animate-spin" /> : null}
          {children}
        </span>
        <SecondaryDotPulse />
      </>
    );
  }

  return (
    <>
      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      {children}
    </>
  );
}

/**
 * Button Component
 *
 * Unified button with multiple variants:
 * - default/primary: Standard shadcn button
 * - cta: Animated shiny button with gradient shimmer and chevron
 * - secondary: Button with cyan dot pulse effect
 * - tertiary: Minimal transparent button
 * - ghost: Transparent with cyan glow on hover
 * - destructive: Red with red glow on hover
 * - outline: Border only
 * - link: Text only with underline on hover
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      children,
      disabled,
      href,
      target,
      rel,
      download,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;
    const classes = cn(buttonVariants({ variant, size, className }));

    // Handle href - render as link
    if (href) {
      const isExternal =
        href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:');

      if (isExternal) {
        return (
          <a
            href={href}
            className={classes}
            target={target}
            rel={rel}
            download={download}
            aria-disabled={isDisabled}
          >
            <ButtonContent variant={variant} loading={loading}>
              {children}
            </ButtonContent>
          </a>
        );
      }

      return (
        <Link
          href={href}
          className={classes}
          target={target}
          rel={rel}
          download={download}
          aria-disabled={isDisabled}
        >
          <ButtonContent variant={variant} loading={loading}>
            {children}
          </ButtonContent>
        </Link>
      );
    }

    // Handle asChild - use Slot
    if (asChild) {
      return (
        <Slot className={classes} ref={ref} {...props}>
          {children}
        </Slot>
      );
    }

    // Standard button
    return (
      <button type="button" className={classes} ref={ref} disabled={isDisabled} {...props}>
        <ButtonContent variant={variant} loading={loading}>
          {children}
        </ButtonContent>
      </button>
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
export type { ButtonProps };
