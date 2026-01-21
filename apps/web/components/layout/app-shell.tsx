'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

interface AppShellProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Sidebar content slot */
  sidebar?: React.ReactNode;
  /** Main content */
  children: React.ReactNode;
  /** Whether sidebar can be collapsed */
  collapsible?: boolean;
  /** Current collapsed state (controlled) */
  collapsed?: boolean;
  /** Callback when collapsed state changes */
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Sidebar width when expanded */
  sidebarWidth?: number;
  /** Sidebar width when collapsed */
  collapsedWidth?: number;
}

interface AppShellContextValue {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  collapsible: boolean;
  sidebarWidth: number;
  collapsedWidth: number;
}

// ============================================================================
// Context
// ============================================================================

const AppShellContext = React.createContext<AppShellContextValue | null>(null);

/**
 * Hook to access AppShell context.
 * Returns null if used outside of AppShell (for components that can work standalone).
 */
export function useAppShell(): AppShellContextValue | null {
  return React.useContext(AppShellContext);
}

/**
 * Hook to access AppShell context with required check.
 * Throws if used outside of AppShell.
 */
export function useRequiredAppShell(): AppShellContextValue {
  const context = React.useContext(AppShellContext);
  if (!context) {
    throw new Error('useRequiredAppShell must be used within an AppShell');
  }
  return context;
}

// ============================================================================
// Component
// ============================================================================

export const AppShell = React.forwardRef<HTMLDivElement, AppShellProps>(
  (
    {
      className,
      sidebar,
      children,
      collapsible = true,
      collapsed: controlledCollapsed,
      onCollapsedChange,
      sidebarWidth = 280,
      collapsedWidth = 72,
      ...props
    },
    ref,
  ) => {
    const [internalCollapsed, setInternalCollapsed] = React.useState(false);

    // Support both controlled and uncontrolled modes
    const isControlled = controlledCollapsed !== undefined;
    const collapsed = isControlled ? controlledCollapsed : internalCollapsed;

    const setCollapsed = React.useCallback(
      (value: boolean) => {
        if (isControlled) {
          onCollapsedChange?.(value);
        } else {
          setInternalCollapsed(value);
        }
      },
      [isControlled, onCollapsedChange],
    );

    const contextValue = React.useMemo(
      () => ({
        collapsed,
        setCollapsed,
        collapsible,
        sidebarWidth,
        collapsedWidth,
      }),
      [collapsed, setCollapsed, collapsible, sidebarWidth, collapsedWidth],
    );

    const currentWidth = collapsed ? collapsedWidth : sidebarWidth;

    return (
      <AppShellContext.Provider value={contextValue}>
        <div ref={ref} className={cn('flex min-h-screen bg-background', className)} {...props}>
          {/* Sidebar */}
          {sidebar && (
            <aside
              className={cn(
                'fixed inset-y-0 left-0 z-30 flex flex-col',
                'bg-lxd-primary-dark border-r border-border/50',
                'transition-all duration-300 ease-in-out',
                // Mobile: hidden by default, shown with overlay
                'max-lg:w-[280px] max-lg:-translate-x-full',
                collapsed && 'max-lg:translate-x-0',
              )}
              style={{ width: currentWidth }}
            >
              {sidebar}
            </aside>
          )}

          {/* Mobile overlay */}
          {sidebar && collapsed && (
            <div
              className="fixed inset-0 z-20 bg-background/80 backdrop-blur-xs lg:hidden"
              onClick={() => setCollapsed(false)}
              aria-hidden="true"
            />
          )}

          {/* Main content area */}
          <main
            className={cn(
              'flex-1 min-h-screen transition-all duration-300 ease-in-out',
              'bg-background',
            )}
            style={{
              marginLeft: sidebar ? currentWidth : 0,
            }}
          >
            {children}
          </main>
        </div>
      </AppShellContext.Provider>
    );
  },
);
AppShell.displayName = 'AppShell';
