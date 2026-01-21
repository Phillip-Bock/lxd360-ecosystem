'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

// Animation CSS classes
export const ribbonAnimations = {
  // Tab content fade
  tabFadeIn: 'animate-in fade-in-0 duration-200',
  tabFadeOut: 'animate-out fade-out-0 duration-150',

  // Dropdown/popover
  popoverIn: 'animate-in fade-in-0 zoom-in-95 duration-200',
  popoverOut: 'animate-out fade-out-0 zoom-out-95 duration-150',

  // Slide variations
  slideDown: 'animate-in slide-in-from-top-2 duration-200',
  slideUp: 'animate-out slide-out-to-top-2 duration-150',

  // Button press
  buttonPress: 'active:scale-95 transition-transform duration-75',

  // Glow pulse (neural effect)
  glowPulse: 'animate-pulse-glow',

  // Ribbon expand/collapse
  ribbonExpand: 'animate-in slide-in-from-top duration-300 ease-out',
  ribbonCollapse: 'animate-out slide-out-to-top duration-200 ease-in',
} as const;

// Custom keyframes - add to globals.css
export const ribbonKeyframes = `
@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 0 0 var(--color-lxd-primary);
  }
  50% {
    box-shadow: 0 0 20px 4px color-mix(in oklch, var(--color-lxd-primary) 40%, transparent);
  }
}

@keyframes ribbon-shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}
`;

// Animated wrapper component
interface AnimatedPresenceProps {
  children: React.ReactNode;
  show: boolean;
  animation?: keyof typeof ribbonAnimations;
  className?: string;
}

export function AnimatedPresence({
  children,
  show,
  animation = 'tabFadeIn',
  className,
}: AnimatedPresenceProps) {
  const [shouldRender, setShouldRender] = React.useState(show);

  React.useEffect(() => {
    if (show) {
      setShouldRender(true);
    }
  }, [show]);

  const handleAnimationEnd = () => {
    if (!show) {
      setShouldRender(false);
    }
  };

  if (!shouldRender) return null;

  return (
    <div
      className={cn(show ? ribbonAnimations[animation] : ribbonAnimations.tabFadeOut, className)}
      onAnimationEnd={handleAnimationEnd}
    >
      {children}
    </div>
  );
}

// Staggered children animation
interface StaggeredListProps {
  children: React.ReactNode[];
  delay?: number;
  className?: string;
}

export function StaggeredList({ children, delay = 50, className }: StaggeredListProps) {
  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => (
        <div
          className="animate-in fade-in-0 slide-in-from-bottom-2"
          style={{ animationDelay: `${index * delay}ms` }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}

// Loading shimmer effect
interface ShimmerProps {
  className?: string;
}

export function Shimmer({ className }: ShimmerProps) {
  return (
    <div
      className={cn(
        'bg-linear-to-r from-transparent via-white/10 to-transparent',
        'bg-[length:200%_100%]',
        'animate-[ribbon-shimmer_1.5s_infinite]',
        className,
      )}
    />
  );
}
