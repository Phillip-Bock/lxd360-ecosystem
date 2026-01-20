'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { AppShell } from './app-shell';
import { type NavItem, Sidebar } from './sidebar';

// ============================================================================
// Types
// ============================================================================

interface BreadcrumbItem {
  /** Display label */
  label: string;
  /** Navigation href (optional - last item typically has no href) */
  href?: string;
}

interface DashboardLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Navigation items for sidebar */
  navItems: NavItem[];
  /** Logo content for sidebar */
  logo?: React.ReactNode;
  /** User menu content for sidebar */
  userMenu?: React.ReactNode;
  /** Header content (rendered above main content) */
  header?: React.ReactNode;
  /** Footer content (optional) */
  footer?: React.ReactNode;
  /** Breadcrumb items (optional - can also be passed via header) */
  breadcrumbs?: BreadcrumbItem[];
  /** Main content */
  children: React.ReactNode;
  /** Whether sidebar is collapsible */
  collapsible?: boolean;
  /** Default collapsed state */
  defaultCollapsed?: boolean;
}

// ============================================================================
// Sub-components
// ============================================================================

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

function Breadcrumbs({ items }: BreadcrumbsProps) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <React.Fragment key={item.label}>
            {index > 0 && <span className="text-muted-foreground/50">/</span>}
            {isLast || !item.href ? (
              <span
                className={cn(isLast ? 'text-foreground font-medium' : 'text-muted-foreground')}
              >
                {item.label}
              </span>
            ) : (
              <a
                href={item.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </a>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export const DashboardLayout = React.forwardRef<HTMLDivElement, DashboardLayoutProps>(
  (
    {
      className,
      navItems,
      logo,
      userMenu,
      header,
      footer,
      breadcrumbs,
      children,
      collapsible = true,
      defaultCollapsed = false,
      ...props
    },
    ref,
  ) => {
    const [collapsed, setCollapsed] = React.useState(defaultCollapsed);

    const sidebarContent = (
      <Sidebar items={navItems} logo={logo} user={userMenu} collapsed={collapsed} />
    );

    return (
      <AppShell
        ref={ref}
        sidebar={sidebarContent}
        collapsible={collapsible}
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        className={className}
        {...props}
      >
        <div className="flex min-h-screen flex-col">
          {/* Header with optional breadcrumbs */}
          {(header || breadcrumbs) && (
            <header className="sticky top-0 z-20 border-b border-border/50 bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60">
              <div className="p-6">
                {breadcrumbs && breadcrumbs.length > 0 && (
                  <div className="mb-2">
                    <Breadcrumbs items={breadcrumbs} />
                  </div>
                )}
                {header}
              </div>
            </header>
          )}

          {/* Main content */}
          <div className="flex-1 p-6">{children}</div>

          {/* Footer */}
          {footer && <footer className="border-t border-border/50 p-6">{footer}</footer>}
        </div>
      </AppShell>
    );
  },
);
DashboardLayout.displayName = 'DashboardLayout';

export type { BreadcrumbItem };
