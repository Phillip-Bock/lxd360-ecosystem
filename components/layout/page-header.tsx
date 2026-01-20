'use client';

import Link from 'next/link';
import * as React from 'react';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

interface BreadcrumbItem {
  /** Display label */
  label: string;
  /** Navigation href (optional - last item typically has no href) */
  href?: string;
}

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Page title */
  title: string;
  /** Page description (optional) */
  description?: string;
  /** Breadcrumb items (optional) */
  breadcrumbs?: BreadcrumbItem[];
  /** Actions slot (right-aligned buttons) */
  actions?: React.ReactNode;
  /** Whether to show gradient accent line */
  gradient?: boolean;
}

// ============================================================================
// Sub-components
// ============================================================================

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

function PageBreadcrumbs({ items }: BreadcrumbsProps) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm mb-3">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <React.Fragment key={item.label}>
            {index > 0 && <span className="text-muted-foreground/50">/</span>}
            {isLast || !item.href ? (
              <span className={cn(isLast ? 'text-foreground/80' : 'text-muted-foreground')}>
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  ({ className, title, description, breadcrumbs, actions, gradient = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('pb-6', gradient && 'border-b border-border/50', className)}
        {...props}
      >
        {/* Gradient accent line */}
        {gradient && (
          <div
            className="h-0.5 w-24 mb-4 rounded-full"
            style={{
              background: 'var(--gradient-neural)',
            }}
            aria-hidden="true"
          />
        )}

        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && <PageBreadcrumbs items={breadcrumbs} />}

        {/* Title and actions row */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
            {description && <p className="text-muted-foreground">{description}</p>}
          </div>

          {/* Actions slot */}
          {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </div>
      </div>
    );
  },
);
PageHeader.displayName = 'PageHeader';

export type { BreadcrumbItem as PageHeaderBreadcrumbItem };
