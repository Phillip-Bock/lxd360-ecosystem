/**
 * =============================================================================
 * LXP360-SaaS | Accessible Navigation Components
 * =============================================================================
 *
 * @fileoverview Accessible navigation patterns for WCAG 2.1 AA compliance
 *
 * @description
 * Provides accessible navigation components with:
 * - Proper ARIA landmarks and roles
 * - Keyboard navigation with roving tabindex
 * - Current page indication
 * - Mobile menu with focus management
 * - Breadcrumb navigation
 * - Expandable menu items
 *
 * WCAG Compliance:
 * - 2.1.1 Keyboard (Level A)
 * - 2.4.1 Bypass Blocks (Level A)
 * - 2.4.4 Link Purpose (Level A)
 * - 2.4.5 Multiple Ways (Level AA)
 * - 2.4.8 Location (Level AAA - Breadcrumbs)
 * - 4.1.2 Name, Role, Value (Level A)
 *
 * =============================================================================
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';
import {
  announce,
  createFocusTrap,
  type FocusTrap,
  setupRovingTabindex,
} from '@/lib/accessibility/focus-management';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

export interface NavItem {
  /** Link href */
  href: string;
  /** Display label */
  label: string;
  /** Optional icon */
  icon?: React.ReactNode;
  /** Child items for dropdown */
  children?: NavItem[];
  /** Whether item is disabled */
  disabled?: boolean;
  /** External link */
  external?: boolean;
  /** Description for screen readers */
  description?: string;
}

export interface AccessibleNavProps {
  /** Navigation items */
  items: NavItem[];
  /** Navigation label for screen readers */
  label?: string;
  /** Show as mobile menu */
  mobileBreakpoint?: number;
  /** Additional CSS classes */
  className?: string;
  /** ID for the navigation landmark */
  id?: string;
}

export interface BreadcrumbItem {
  /** Link href */
  href: string;
  /** Display label */
  label: string;
  /** Whether this is the current page */
  current?: boolean;
}

export interface BreadcrumbsProps {
  /** Breadcrumb items */
  items: BreadcrumbItem[];
  /** Label for screen readers */
  label?: string;
  /** Separator between items */
  separator?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// Nav Link Component
// ============================================================================

interface NavLinkProps {
  item: NavItem;
  isActive: boolean;
  className?: string;
}

function NavLink({ item, isActive, className }: NavLinkProps): React.JSX.Element {
  const linkProps = item.external
    ? {
        target: '_blank',
        rel: 'noopener noreferrer',
      }
    : {};

  return (
    <Link
      href={item.href}
      aria-current={isActive ? 'page' : undefined}
      aria-disabled={item.disabled}
      aria-describedby={item.description ? `${item.label}-desc` : undefined}
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium',
        'transition-colors focus-visible:outline-hidden focus-visible:ring-2',
        'focus-visible:ring-ring focus-visible:ring-offset-2',
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
        item.disabled && 'pointer-events-none opacity-50',
        className,
      )}
      {...linkProps}
    >
      {item.icon}
      <span>{item.label}</span>
      {item.external && (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-4 h-4"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z"
              clipRule="evenodd"
            />
            <path
              fillRule="evenodd"
              d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z"
              clipRule="evenodd"
            />
          </svg>
          <span className="sr-only">(opens in new tab)</span>
        </>
      )}
      {item.description && (
        <span id={`${item.label}-desc`} className="sr-only">
          {item.description}
        </span>
      )}
    </Link>
  );
}

// ============================================================================
// Dropdown Menu Component
// ============================================================================

interface DropdownMenuProps {
  trigger: NavItem;
  isActive: boolean;
  className?: string;
}

function DropdownMenu({ trigger, isActive, className }: DropdownMenuProps): React.JSX.Element {
  const [isOpen, setIsOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const menuId = React.useId();

  // Handle keyboard navigation
  React.useEffect(() => {
    if (!isOpen || !menuRef.current) return;

    const cleanup = setupRovingTabindex(menuRef.current, 'a[role="menuitem"]', {
      orientation: 'vertical',
      wrap: true,
    });

    return cleanup;
  }, [isOpen]);

  // Close on outside click
  React.useEffect(() => {
    if (!isOpen) return;

    const handleClick = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        buttonRef.current.focus();
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [isOpen]);

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent): void => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        buttonRef.current?.focus();
        break;
    }
  };

  return (
    <div className={cn('relative', className)}>
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className={cn(
          'flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium',
          'transition-colors focus-visible:outline-hidden focus-visible:ring-2',
          'focus-visible:ring-ring focus-visible:ring-offset-2',
          isActive
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
        )}
      >
        {trigger.icon}
        <span>{trigger.label}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={cn('w-4 h-4 transition-transform', isOpen && 'rotate-180')}
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && trigger.children && (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label={`${trigger.label} submenu`}
          className={cn(
            'absolute left-0 mt-1 w-48 rounded-md bg-popover shadow-lg',
            'border p-1 z-50',
          )}
        >
          {trigger.children.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              role="menuitem"
              tabIndex={-1}
              onClick={() => setIsOpen(false)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 text-sm rounded-md',
                'focus:bg-accent focus:text-accent-foreground focus:outline-hidden',
                'hover:bg-accent hover:text-accent-foreground',
              )}
            >
              {child.icon}
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Mobile Menu Component
// ============================================================================

interface MobileMenuProps {
  items: NavItem[];
  isOpen: boolean;
  onClose: () => void;
  label: string;
}

function MobileMenu({ items, isOpen, onClose, label }: MobileMenuProps): React.JSX.Element | null {
  const menuRef = React.useRef<HTMLDivElement>(null);
  const focusTrapRef = React.useRef<FocusTrap | null>(null);
  const pathname = usePathname();

  // Set up focus trap
  React.useEffect(() => {
    if (!menuRef.current) return;

    focusTrapRef.current = createFocusTrap(menuRef.current, {
      escapeDeactivates: true,
      onEscape: onClose,
      returnFocus: true,
    });

    if (isOpen) {
      focusTrapRef.current.activate();
      announce('Navigation menu opened');
    } else {
      focusTrapRef.current.deactivate();
    }

    return () => {
      focusTrapRef.current?.deactivate();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs" role="presentation">
      <div
        ref={menuRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className="fixed inset-y-0 right-0 w-full max-w-xs bg-background shadow-xl"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <span className="font-semibold">Menu</span>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-md hover:bg-accent focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Close menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-6 h-6"
              aria-hidden="true"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav aria-label={label} className="p-4">
          <ul className="space-y-1">
            {items.map((item) => (
              <li key={item.href}>
                <NavLink
                  item={item}
                  isActive={pathname === item.href}
                  className="w-full justify-start"
                />
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}

// ============================================================================
// Main Navigation Component
// ============================================================================

export function AccessibleNav({
  items,
  label = 'Main navigation',
  mobileBreakpoint = 768,
  className,
  id = 'navigation',
}: AccessibleNavProps): React.JSX.Element {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const pathname = usePathname();
  const navRef = React.useRef<HTMLElement>(null);

  // Handle responsive behavior
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < mobileBreakpoint);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [mobileBreakpoint]);

  // Close mobile menu on route change
  React.useEffect(() => {
    setIsMobileMenuOpen(false);
  }, []);

  // Set up roving tabindex for desktop nav
  React.useEffect(() => {
    if (isMobile || !navRef.current) return;

    const cleanup = setupRovingTabindex(navRef.current, '[role="menuitem"], a', {
      orientation: 'horizontal',
      wrap: true,
    });

    return cleanup;
  }, [isMobile]);

  return (
    <>
      <nav ref={navRef} id={id} aria-label={label} className={cn('relative', className)}>
        {isMobile ? (
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className={cn(
              'p-2 rounded-md hover:bg-accent',
              'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring',
            )}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label="Open navigation menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-6 h-6"
              aria-hidden="true"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        ) : (
          <ul className="flex items-center gap-1">
            {items.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.children?.some((child) => pathname === child.href) ?? false);

              return (
                <li key={item.href} role="none">
                  {item.children ? (
                    <DropdownMenu trigger={item} isActive={isActive} />
                  ) : (
                    <NavLink item={item} isActive={isActive} />
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </nav>

      <MobileMenu
        items={items}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        label={label}
      />
    </>
  );
}

// ============================================================================
// Breadcrumbs Component
// ============================================================================

export function Breadcrumbs({
  items,
  label = 'Breadcrumb',
  separator = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="w-4 h-4 text-muted-foreground"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
        clipRule="evenodd"
      />
    </svg>
  ),
  className,
}: BreadcrumbsProps): React.JSX.Element {
  return (
    <nav aria-label={label} className={cn('flex items-center', className)}>
      <ol className="flex items-center gap-1">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={item.href} className="flex items-center gap-1">
              {index > 0 && separator}
              {item.current || isLast ? (
                <span aria-current="page" className="text-sm font-medium text-foreground">
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    'text-sm text-muted-foreground hover:text-foreground',
                    'focus-visible:outline-hidden focus-visible:ring-2',
                    'focus-visible:ring-ring focus-visible:rounded-sm',
                  )}
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// ============================================================================
// Sidebar Navigation Component
// ============================================================================

export interface SidebarNavItem extends NavItem {
  /** Badge count */
  badge?: number;
  /** Badge color */
  badgeColor?: 'default' | 'primary' | 'destructive' | 'warning';
}

export interface SidebarNavProps {
  /** Navigation items */
  items: SidebarNavItem[];
  /** Section title */
  title?: string;
  /** Whether nav is collapsed */
  collapsed?: boolean;
  /** Label for screen readers */
  label?: string;
  /** Additional CSS classes */
  className?: string;
}

export function SidebarNav({
  items,
  title,
  collapsed = false,
  label = 'Sidebar navigation',
  className,
}: SidebarNavProps): React.JSX.Element {
  const pathname = usePathname();

  const badgeColors = {
    default: 'bg-muted text-muted-foreground',
    primary: 'bg-primary text-primary-foreground',
    destructive: 'bg-destructive text-destructive-foreground',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  };

  return (
    <nav aria-label={label} className={cn('space-y-2', className)}>
      {title && (
        <h2
          className={cn(
            'px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground',
            collapsed && 'sr-only',
          )}
        >
          {title}
        </h2>
      )}
      <ul className="space-y-1">
        {items.map((item) => {
          const isActive = pathname === item.href;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                aria-disabled={item.disabled}
                title={collapsed ? item.label : undefined}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm',
                  'transition-colors focus-visible:outline-hidden focus-visible:ring-2',
                  'focus-visible:ring-ring focus-visible:ring-offset-2',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  item.disabled && 'pointer-events-none opacity-50',
                  collapsed && 'justify-center px-2',
                )}
              >
                {item.icon && (
                  <span className="shrink-0" aria-hidden="true">
                    {item.icon}
                  </span>
                )}
                {!collapsed && <span className="flex-1">{item.label}</span>}
                {collapsed && <span className="sr-only">{item.label}</span>}
                {item.badge !== undefined && !collapsed && (
                  <output
                    className={cn(
                      'ml-auto text-xs px-2 py-0.5 rounded-full',
                      badgeColors[item.badgeColor || 'default'],
                    )}
                    aria-label={`${item.badge} items`}
                  >
                    {item.badge}
                  </output>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

// ============================================================================
// Exports
// ============================================================================

export default AccessibleNav;
