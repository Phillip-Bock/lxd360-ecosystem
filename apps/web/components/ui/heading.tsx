import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '@/lib/utils';

const headingVariants = cva('font-semibold tracking-tight', {
  variants: {
    level: {
      1: 'text-4xl lg:text-5xl',
      2: 'text-3xl',
      3: 'text-2xl',
      4: 'text-xl',
      5: 'text-lg',
      6: 'text-base',
    },
  },
  defaultVariants: {
    level: 1,
  },
});

interface HeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof headingVariants> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export function Heading({ className, level = 1, as, children, ...props }: HeadingProps) {
  const Tag = as || (`h${level}` as const);

  return React.createElement(
    Tag,
    { className: cn(headingVariants({ level }), className), ...props },
    children,
  );
}
