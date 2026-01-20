/**
 * =============================================================================
 * LXP360-SaaS | Accessibility - Skip Links Component
 * =============================================================================
 *
 * @fileoverview Skip navigation links for keyboard and screen reader users
 *
 * @description
 * Provides skip links that allow users to bypass repetitive navigation
 * and jump directly to main content areas. Essential for WCAG 2.1 AA
 * compliance (Success Criterion 2.4.1 - Bypass Blocks).
 *
 * @usage
 * ```tsx
 * // In your root layout
 * import { SkipLinks } from '@/components/accessibility/SkipLinks'
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <SkipLinks />
 *         <header id="header">...</header>
 *         <nav id="navigation">...</nav>
 *         <main id="main-content">...</main>
 *       </body>
 *     </html>
 *   )
 * }
 * ```
 *
 * =============================================================================
 */

'use client';

import React, { useCallback, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

export interface SkipLinkTarget {
  /** Unique identifier matching the target element's id */
  id: string;
  /** Label for the skip link */
  label: string;
  /** Optional keyboard shortcut hint */
  shortcut?: string;
}

export interface SkipLinksProps {
  /** Custom skip link targets (overrides defaults) */
  targets?: SkipLinkTarget[];
  /** Additional CSS classes */
  className?: string;
  /** Container z-index */
  zIndex?: number;
}

// ============================================================================
// Default Skip Link Targets
// ============================================================================

const DEFAULT_TARGETS: SkipLinkTarget[] = [
  { id: 'main-content', label: 'Skip to main content', shortcut: 'Alt+1' },
  { id: 'navigation', label: 'Skip to navigation', shortcut: 'Alt+2' },
  { id: 'search', label: 'Skip to search' },
  { id: 'footer', label: 'Skip to footer' },
];

// ============================================================================
// Skip Link Component
// ============================================================================

interface SkipLinkProps {
  target: SkipLinkTarget;
  onActivate?: () => void;
}

function SkipLink({ target, onActivate }: SkipLinkProps) {
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      const element = document.getElementById(target.id);

      if (element) {
        // Ensure the element can receive focus
        if (!element.hasAttribute('tabindex')) {
          element.setAttribute('tabindex', '-1');
        }

        // Scroll to element and focus it
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        element.focus({ preventScroll: true });

        // Announce to screen readers
        announceToScreenReader(`Navigated to ${target.label.replace('Skip to ', '')}`);

        onActivate?.();
      }
    },
    [target, onActivate],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLAnchorElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleClick(e as unknown as React.MouseEvent<HTMLAnchorElement>);
      }
    },
    [handleClick],
  );

  return (
    <a
      href={`#${target.id}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        // Base styles - visually hidden but focusable
        'sr-only focus:not-sr-only',
        // Visible on focus
        'focus:fixed focus:top-4 focus:left-4 focus:z-[99999]',
        'focus:px-4 focus:py-2',
        'focus:bg-primary focus:text-primary-foreground',
        'focus:rounded-md focus:shadow-lg',
        'focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2',
        // Typography
        'font-medium text-sm',
        // Transition
        'transition-all duration-200',
      )}
      aria-label={target.shortcut ? `${target.label} (${target.shortcut})` : target.label}
    >
      {target.label}
      {target.shortcut && <span className="ml-2 text-xs opacity-75">({target.shortcut})</span>}
    </a>
  );
}

// ============================================================================
// Screen Reader Announcer
// ============================================================================

let announcerElement: HTMLDivElement | null = null;

function getAnnouncer(): HTMLDivElement {
  if (typeof document === 'undefined') {
    return null as unknown as HTMLDivElement;
  }

  if (!announcerElement) {
    announcerElement = document.createElement('div');
    announcerElement.setAttribute('aria-live', 'polite');
    announcerElement.setAttribute('aria-atomic', 'true');
    announcerElement.setAttribute('role', 'status');
    announcerElement.className = 'sr-only';
    announcerElement.id = 'skip-link-announcer';
    document.body.appendChild(announcerElement);
  }

  return announcerElement;
}

function announceToScreenReader(message: string): void {
  const announcer = getAnnouncer();
  if (!announcer) return;

  // Clear and set message (this triggers screen reader announcement)
  announcer.textContent = '';
  requestAnimationFrame(() => {
    announcer.textContent = message;
  });
}

// ============================================================================
// Main Component
// ============================================================================

export function SkipLinks({
  targets = DEFAULT_TARGETS,
  className,
  zIndex = 99999,
}: SkipLinksProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeTargets, setActiveTargets] = useState<SkipLinkTarget[]>([]);

  // Filter targets to only those that exist in the DOM
  React.useEffect(() => {
    const checkTargets = () => {
      const existing = targets.filter((target) => {
        const element = document.getElementById(target.id);
        return element !== null;
      });
      setActiveTargets(existing);
    };

    // Check on mount and when DOM changes
    checkTargets();

    // Re-check when navigation occurs (for SPAs)
    const observer = new MutationObserver(checkTargets);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [targets]);

  if (activeTargets.length === 0) {
    return null;
  }

  return (
    <nav
      ref={containerRef}
      aria-label="Skip links"
      className={cn('skip-links', className)}
      style={{ zIndex }}
    >
      {activeTargets.map((target) => (
        <SkipLink key={target.id} target={target} />
      ))}
    </nav>
  );
}

// ============================================================================
// Keyboard Shortcuts Handler
// ============================================================================

interface UseSkipLinkShortcutsOptions {
  /** Enable Alt+1 for main content */
  enableMainShortcut?: boolean;
  /** Enable Alt+2 for navigation */
  enableNavShortcut?: boolean;
  /** Custom shortcuts map: key -> element id */
  customShortcuts?: Record<string, string>;
}

export function useSkipLinkShortcuts({
  enableMainShortcut = true,
  enableNavShortcut = true,
  customShortcuts = {},
}: UseSkipLinkShortcutsOptions = {}) {
  React.useEffect(() => {
    const shortcuts: Record<string, string> = {
      ...(enableMainShortcut ? { '1': 'main-content' } : {}),
      ...(enableNavShortcut ? { '2': 'navigation' } : {}),
      ...customShortcuts,
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle Alt+number combinations
      if (!e.altKey || e.ctrlKey || e.metaKey) return;

      const targetId = shortcuts[e.key];
      if (targetId) {
        e.preventDefault();
        const element = document.getElementById(targetId);
        if (element) {
          if (!element.hasAttribute('tabindex')) {
            element.setAttribute('tabindex', '-1');
          }
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          element.focus({ preventScroll: true });
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [enableMainShortcut, enableNavShortcut, customShortcuts]);
}

// ============================================================================
// Exports
// ============================================================================

export default SkipLinks;
