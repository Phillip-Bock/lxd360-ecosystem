'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '@/lib/utils';

// ============================================================================
// Variants
// ============================================================================

const sectionVariants = cva('w-full', {
  variants: {
    variant: {
      default: '',
      glass: 'bg-card/80 backdrop-blur-xl border border-border/50 rounded-lg shadow-sm',
      frosted: 'bg-lxd-card backdrop-blur-xl border border-lxd-border rounded-lg',
      elevated: 'bg-card rounded-lg shadow-md hover:shadow-glow-sm transition-shadow',
    },
    padding: {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    },
    spacing: {
      none: '',
      sm: 'space-y-2',
      md: 'space-y-4',
      lg: 'space-y-6',
    },
  },
  defaultVariants: {
    variant: 'default',
    padding: 'none',
    spacing: 'md',
  },
});

// ============================================================================
// Types
// ============================================================================

interface SectionProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof sectionVariants> {
  /** Section title (optional) */
  title?: string;
  /** Section description (optional) */
  description?: string;
  /** Actions slot (rendered next to title) */
  actions?: React.ReactNode;
  /** HTML element to render as */
  as?: 'section' | 'div' | 'article';
}

// ============================================================================
// Main Component
// ============================================================================

function SectionImpl(
  {
    className,
    variant,
    padding,
    spacing,
    title,
    description,
    actions,
    as = 'section',
    children,
    ...props
  }: SectionProps,
  ref: React.ForwardedRef<HTMLElement>,
): React.JSX.Element {
  const hasHeader = title || description || actions;
  const classes = cn(sectionVariants({ variant, padding, spacing }), className);

  const content = (
    <>
      {hasHeader && (
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            {title && (
              <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
            )}
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
          {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </div>
      )}
      {children}
    </>
  );

  if (as === 'article') {
    return (
      <article ref={ref as React.Ref<HTMLElement>} className={classes} {...props}>
        {content}
      </article>
    );
  }

  if (as === 'div') {
    return (
      <div ref={ref as React.Ref<HTMLDivElement>} className={classes} {...props}>
        {content}
      </div>
    );
  }

  return (
    <section ref={ref as React.Ref<HTMLElement>} className={classes} {...props}>
      {content}
    </section>
  );
}

export const Section = React.forwardRef(SectionImpl);
Section.displayName = 'Section';

export { sectionVariants };
