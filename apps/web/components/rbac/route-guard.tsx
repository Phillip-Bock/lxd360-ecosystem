/**
 * RouteGuard — HARD BLOCK Pattern
 *
 * Security-critical route protection that redirects unauthorized users.
 * Use for routes containing sensitive data or actions that must be hidden.
 *
 * Examples:
 * - /settings/billing (Owner only - payment info)
 * - /settings/organization (Owner only - org settings)
 * - /ignite/manage/users (Manager+ - user management)
 *
 * @see CLAUDE.md Section 9 for persona definitions
 */

'use client';

import { useRouter } from 'next/navigation';
import { type ReactNode, useEffect } from 'react';
import { useRBAC } from '@/lib/hooks/useRBAC';
import { logger } from '@/lib/logger';

const log = logger.child({ module: 'RouteGuard' });

interface RouteGuardProps {
  /** Minimum level required (100=Owner, 75=Editor, 50=Manager, 25=Learner) */
  minLevel: number;
  /** Where to redirect unauthorized users (defaults to learner dashboard) */
  redirectTo?: string;
  /** Content to render when authorized */
  children: ReactNode;
  /** Content to render while loading (defaults to spinner) */
  loadingContent?: ReactNode;
}

/**
 * HARD BLOCK pattern - redirects unauthorized users
 *
 * Use for security-critical routes that should be completely hidden
 * from users without access (billing, org settings, user management)
 *
 * @example
 * ```tsx
 * // In layout.tsx for /settings/billing
 * export default function BillingLayout({ children }: { children: React.ReactNode }) {
 *   return (
 *     <RouteGuard minLevel={100}>
 *       {children}
 *     </RouteGuard>
 *   );
 * }
 * ```
 */
export function RouteGuard({
  minLevel,
  redirectTo = '/ignite/learn',
  children,
  loadingContent,
}: RouteGuardProps): ReactNode {
  const { hasLevel, loading, level, persona } = useRBAC();
  const router = useRouter();
  const allowed = hasLevel(minLevel);

  useEffect(() => {
    if (!loading && !allowed) {
      log.warn('Hard block: redirecting unauthorized user', {
        userLevel: level,
        userPersona: persona,
        requiredLevel: minLevel,
        redirectTo,
      });
      router.replace(redirectTo);
    }
  }, [loading, allowed, router, redirectTo, level, persona, minLevel]);

  // Show loading state
  if (loading) {
    return (
      loadingContent ?? (
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-lxd-primary)]" />
        </div>
      )
    );
  }

  // Don't render anything if not allowed (redirect is in progress)
  if (!allowed) {
    return null;
  }

  return <>{children}</>;
}
