'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/lib/utils';
import { useRibbon } from './ribbon-context';

interface RibbonMinimizeProps {
  className?: string;
}

export function RibbonMinimizeButton({ className }: RibbonMinimizeProps) {
  const { collapsed, setCollapsed } = useRibbon();

  return (
    <button
      type="button"
      onClick={() => setCollapsed(!collapsed)}
      className={cn(
        'absolute right-2 top-1',
        'flex items-center justify-center w-6 h-6 rounded',
        'text-white/40 hover:text-white hover:bg-white/10',
        'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-(--ribbon-accent)',
        'transition-colors',
        className,
      )}
      aria-label={collapsed ? 'Expand ribbon' : 'Minimize ribbon'}
      aria-expanded={!collapsed}
    >
      {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
    </button>
  );
}

// Wrapper that handles minimize animation
interface RibbonContentWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function RibbonContentWrapper({ children, className }: RibbonContentWrapperProps) {
  const { collapsed } = useRibbon();
  const [height, setHeight] = React.useState<number | 'auto'>('auto');
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (contentRef.current) {
      if (collapsed) {
        setHeight(0);
      } else {
        setHeight(contentRef.current.scrollHeight);
      }
    }
  }, [collapsed]);

  return (
    <div
      className={cn('overflow-hidden transition-all duration-300 ease-out', className)}
      style={{ height: collapsed ? 0 : height }}
    >
      <div ref={contentRef}>{children}</div>
    </div>
  );
}

// Hook for double-click minimize
export function useDoubleClickMinimize() {
  const { setCollapsed, collapsed } = useRibbon();
  const lastClickTime = React.useRef(0);

  const handleTabClick = React.useCallback(() => {
    const now = Date.now();
    if (now - lastClickTime.current < 300) {
      // Double click detected
      setCollapsed(!collapsed);
    }
    lastClickTime.current = now;
  }, [collapsed, setCollapsed]);

  return handleTabClick;
}
