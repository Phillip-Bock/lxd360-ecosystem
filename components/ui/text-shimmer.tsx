'use client';

import { cn } from '@/lib/utils';

export type TextShimmerProps = {
  duration?: number;
  spread?: number;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLSpanElement>;

export function TextShimmer({
  className,
  duration = 4,
  spread = 20,
  children,
  ...props
}: TextShimmerProps): React.JSX.Element {
  const dynamicSpread = Math.min(Math.max(spread, 5), 45);

  return (
    <span
      className={cn(
        'bg-size-[200%_auto] bg-clip-text font-medium text-transparent',
        'animate-[shimmer_4s_infinite_linear]',
        className,
      )}
      style={{
        backgroundImage: `linear-gradient(to right, var(--muted-foreground) ${50 - dynamicSpread}%, var(--foreground) 50%, var(--muted-foreground) ${50 + dynamicSpread}%)`,
        animationDuration: `${duration}s`,
      }}
      {...props}
    >
      {children}
    </span>
  );
}
