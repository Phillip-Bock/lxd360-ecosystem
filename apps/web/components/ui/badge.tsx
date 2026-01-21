import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import type * as React from 'react';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-lxd-primary focus-visible:ring-lxd-primary/50 focus-visible:ring-[3px] aria-invalid:ring-error/20 dark:aria-invalid:ring-error/40 aria-invalid:border-error transition-all duration-200 overflow-hidden',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-lxd-primary/20 text-lxd-primary [a&]:hover:bg-lxd-primary/30',
        secondary:
          'border-transparent bg-lxd-secondary/20 text-lxd-secondary [a&]:hover:bg-lxd-secondary/30',
        destructive:
          'border-transparent bg-error/20 text-error [a&]:hover:bg-error/30 focus-visible:ring-error/20 dark:focus-visible:ring-error/40',
        outline: 'border-border text-foreground [a&]:hover:bg-card [a&]:hover:shadow-glow-sm',
        success: 'border-transparent bg-success/20 text-success [a&]:hover:bg-success/30',
        warning: 'border-transparent bg-warning/20 text-warning [a&]:hover:bg-warning/30',
        caution: 'border-transparent bg-caution/20 text-caution [a&]:hover:bg-caution/30',
        info: 'border-transparent bg-info/20 text-info [a&]:hover:bg-info/30',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }): React.JSX.Element {
  const Comp = asChild ? Slot : 'span';

  return (
    <Comp data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
