import type * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * =============================================================================
 * LXP360-SaaS | FormSection Component
 * =============================================================================
 *
 * @fileoverview A form section component for grouping related form fields
 * with a title and optional description.
 *
 * @version      1.0.0
 * @updated      2025-12-20
 *
 * =============================================================================
 */

interface FormSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
}

export function FormSection({
  title,
  description,
  className,
  children,
  ...props
}: FormSectionProps): React.JSX.Element {
  return (
    <div className={cn('space-y-4', className)} {...props}>
      <div className="space-y-1">
        <h3 className="text-lg font-medium leading-6">{title}</h3>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}
