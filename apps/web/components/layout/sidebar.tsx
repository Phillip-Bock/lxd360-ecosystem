'use client';

import { ChevronDown, PanelLeft, PanelLeftClose } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { useAppShell } from './app-shell';

// ============================================================================
// Types
// ============================================================================

export interface NavItem {
  /** Display label */
  label: string;
  /** Navigation href */
  href?: string;
  /** Icon component */
  icon?: React.ComponentType<{ className?: string }>;
  /** Badge text */
  badge?: string;
  /** Child items for grouping */
  children?: NavItem[];
  /** Whether group is expanded by default */
  defaultExpanded?: boolean;
  /** Click handler for non-link items */
  onClick?: () => void;
}

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Navigation items */
  items: NavItem[];
  /** Logo slot content */
  logo?: React.ReactNode;
  /** User menu slot content */
  user?: React.ReactNode;
  /** Whether sidebar is collapsed (falls back to AppShell context) */
  collapsed?: boolean;
}

// ============================================================================
// Sub-components
// ============================================================================

interface NavItemProps {
  item: NavItem;
  collapsed: boolean;
  depth?: number;
}

function SidebarNavItem({ item, collapsed, depth = 0 }: NavItemProps) {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = React.useState(item.defaultExpanded ?? false);

  const isActive = item.href ? pathname === item.href : false;
  const hasChildren = item.children && item.children.length > 0;
  const Icon = item.icon;

  // Base styles for all nav items
  const itemClasses = cn(
    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium',
    'transition-all duration-200',
    'text-sidebar-foreground/80 hover:text-sidebar-foreground',
    'hover:bg-card/50',
    isActive && 'bg-card/80 text-sidebar-foreground shadow-glow-sm',
    depth > 0 && 'ml-4 text-xs',
  );

  // Render as collapsible group
  if (hasChildren) {
    return (
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger
          className={cn(itemClasses, 'w-full justify-between', collapsed && 'justify-center px-2')}
        >
          <span className="flex items-center gap-3">
            {Icon && <Icon className="h-5 w-5 shrink-0" />}
            {!collapsed && <span>{item.label}</span>}
          </span>
          {!collapsed && (
            <ChevronDown
              className={cn(
                'h-4 w-4 shrink-0 transition-transform duration-200',
                isExpanded && 'rotate-180',
              )}
            />
          )}
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-1 pt-1">
          {item.children?.map((child, index) => (
            <SidebarNavItem
              key={child.href ?? index}
              item={child}
              collapsed={collapsed}
              depth={depth + 1}
            />
          ))}
        </CollapsibleContent>
      </Collapsible>
    );
  }

  // Render as link
  if (item.href) {
    return (
      <Link
        href={item.href}
        className={cn(itemClasses, collapsed && 'justify-center px-2')}
        title={collapsed ? item.label : undefined}
      >
        {Icon && <Icon className="h-5 w-5 shrink-0" />}
        {!collapsed && (
          <>
            <span className="flex-1">{item.label}</span>
            {item.badge && (
              <span className="rounded-full bg-lxd-primary/20 px-2 py-0.5 text-xs font-medium text-lxd-primary">
                {item.badge}
              </span>
            )}
          </>
        )}
      </Link>
    );
  }

  // Render as button (for onClick handlers)
  return (
    <button
      type="button"
      onClick={item.onClick}
      className={cn(itemClasses, collapsed && 'justify-center px-2', 'w-full')}
      title={collapsed ? item.label : undefined}
    >
      {Icon && <Icon className="h-5 w-5 shrink-0" />}
      {!collapsed && (
        <>
          <span className="flex-1 text-left">{item.label}</span>
          {item.badge && (
            <span className="rounded-full bg-lxd-primary/20 px-2 py-0.5 text-xs font-medium text-lxd-primary">
              {item.badge}
            </span>
          )}
        </>
      )}
    </button>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ className, items, logo, user, collapsed: propCollapsed, ...props }, ref) => {
    // Get AppShell context (returns null if not within AppShell)
    const appShell = useAppShell();

    // Derive values from context or fall back to props
    const collapsed = propCollapsed ?? appShell?.collapsed ?? false;
    const setCollapsed = appShell?.setCollapsed;
    const collapsible = appShell?.collapsible ?? true;

    return (
      <div ref={ref} className={cn('flex h-full flex-col', className)} {...props}>
        {/* Logo slot */}
        {logo && (
          <div
            className={cn(
              'flex h-16 items-center border-b border-border/30 px-4',
              collapsed && 'justify-center px-2',
            )}
          >
            {logo}
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-1">
            {items.map((item, index) => (
              <SidebarNavItem
                key={item.href ?? item.label ?? index}
                item={item}
                collapsed={collapsed}
              />
            ))}
          </div>
        </nav>

        {/* Collapse toggle */}
        {collapsible && setCollapsed && (
          <div className="border-t border-border/30 px-3 py-2">
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium',
                'text-sidebar-foreground/60 hover:text-sidebar-foreground',
                'hover:bg-card/50 transition-colors',
                collapsed && 'justify-center px-2',
              )}
            >
              {collapsed ? (
                <PanelLeft className="h-5 w-5" />
              ) : (
                <>
                  <PanelLeftClose className="h-5 w-5" />
                  <span>Collapse</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* User menu slot */}
        {user && (
          <div className={cn('border-t border-border/30 px-3 py-3', collapsed && 'px-2')}>
            {user}
          </div>
        )}
      </div>
    );
  },
);
Sidebar.displayName = 'Sidebar';
