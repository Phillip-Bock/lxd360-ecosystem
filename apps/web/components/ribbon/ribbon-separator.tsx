'use client';

import type * as React from 'react';
import { cn } from '@/lib/utils';

interface RibbonSeparatorProps extends React.HTMLAttributes<HTMLHRElement> {
  orientation?: 'horizontal' | 'vertical';
}

export function RibbonSeparator({
  orientation = 'vertical',
  className,
  ...props
}: RibbonSeparatorProps) {
  return (
    <hr
      data-slot="ribbon-separator"
      aria-orientation={orientation}
      className={cn(
        'border-none bg-(--ribbon-border)',
        orientation === 'vertical' ? 'mx-1 h-8 w-px' : 'my-1 h-px w-full',
        className,
      )}
      {...props}
    />
  );
}
