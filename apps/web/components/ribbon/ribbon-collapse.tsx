'use client';

import * as PopoverPrimitive from '@radix-ui/react-popover';
import { MoreHorizontal } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/lib/utils';

interface RibbonCollapseProps {
  children: React.ReactNode;
  breakpoint?: number;
  className?: string;
}

export function RibbonCollapse({ children, breakpoint = 600, className }: RibbonCollapseProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setIsCollapsed(entry.contentRect.width < breakpoint);
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [breakpoint]);

  return (
    <div ref={containerRef} className={cn('flex items-stretch', className)}>
      {isCollapsed ? (
        <PopoverPrimitive.Root>
          <PopoverPrimitive.Trigger asChild>
            <button
              type="button"
              className={cn(
                'flex items-center justify-center px-3',
                'text-(--ribbon-text-muted) hover:text-(--ribbon-text) hover:bg-(--ribbon-hover)',
                'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-(--ribbon-accent)',
              )}
              aria-label="Show more options"
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </PopoverPrimitive.Trigger>

          <PopoverPrimitive.Portal>
            <PopoverPrimitive.Content
              className={cn(
                'z-50 rounded-lg',
                'bg-(--ribbon-bg) border border-(--ribbon-border)',
                'p-2 shadow-xl shadow-black/30',
                'animate-in fade-in-0 zoom-in-95',
              )}
              sideOffset={8}
              align="end"
            >
              <div className="flex flex-wrap gap-2 max-w-75">{children}</div>
              <PopoverPrimitive.Arrow className="fill-(--ribbon-border)" />
            </PopoverPrimitive.Content>
          </PopoverPrimitive.Portal>
        </PopoverPrimitive.Root>
      ) : (
        children
      )}
    </div>
  );
}
