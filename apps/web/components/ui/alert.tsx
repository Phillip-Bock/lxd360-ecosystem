import { cva, type VariantProps } from 'class-variance-authority';
import type * as React from 'react';

import { cn } from '@/lib/utils';

const alertVariants = cva(
  'relative w-full rounded-lg border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current backdrop-blur-xl transition-shadow',
  {
    variants: {
      variant: {
        default: 'bg-card/80 border-border text-card-foreground',
        destructive:
          'bg-error/10 border-error/50 text-error [&>svg]:text-current *:data-[slot=alert-description]:text-error/90',
        success:
          'bg-success/10 border-success/50 text-success [&>svg]:text-current *:data-[slot=alert-description]:text-success/90',
        warning:
          'bg-warning/10 border-warning/50 text-warning [&>svg]:text-current *:data-[slot=alert-description]:text-warning/90',
        caution:
          'bg-caution/10 border-caution/50 text-caution [&>svg]:text-current *:data-[slot=alert-description]:text-caution/90',
        info: 'bg-info/10 border-info/50 text-info [&>svg]:text-current *:data-[slot=alert-description]:text-info/90',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof alertVariants>): React.JSX.Element {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<'div'>): React.JSX.Element {
  return (
    <div
      data-slot="alert-title"
      className={cn('col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight', className)}
      {...props}
    />
  );
}

function AlertDescription({ className, ...props }: React.ComponentProps<'div'>): React.JSX.Element {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        'text-muted-foreground col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed',
        className,
      )}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription };
