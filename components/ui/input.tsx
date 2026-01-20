import type * as React from 'react';

import { cn } from '@/lib/utils';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'file:text-foreground placeholder:text-muted-foreground selection:bg-lxd-primary selection:text-white bg-card border-border flex h-9 w-full min-w-0 rounded-lg border px-3 py-1 text-base shadow-xs transition-all duration-200 outline-hidden file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        'focus-visible:border-lxd-primary focus-visible:ring-2 focus-visible:ring-lxd-primary/50 focus-visible:shadow-glow-sm',
        'aria-invalid:ring-error/20 dark:aria-invalid:ring-error/40 aria-invalid:border-error',
        className,
      )}
      {...props}
    />
  );
}

export { Input };
