/**
 * FeatureGate — SOFT GATE Pattern
 *
 * Feature discovery component that shows upgrade prompt for unauthorized users.
 * Use for features we want users to discover and potentially upgrade for.
 *
 * Examples:
 * - /inspire-studio (Editor+ - content authoring)
 * - /ignite/analytics (Manager+ - analytics dashboards)
 * - /ignite/lrs (Manager+ - learning record store)
 *
 * @see CLAUDE.md Section 9 for persona definitions
 */

'use client';

import { Lock } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { useRBAC } from '@/lib/hooks/useRBAC';

interface FeatureGateProps {
  /** Minimum level required (100=Owner, 75=Editor, 50=Manager, 25=Learner) */
  minLevel: number;
  /** CTA message shown to unauthorized users */
  upgradeCTA?: string;
  /** Link to upgrade/billing page */
  upgradeLink?: string;
  /** Content to render when authorized */
  children: ReactNode;
  /** Content to render while loading (defaults to spinner) */
  loadingContent?: ReactNode;
  /** Custom locked content (overrides default) */
  lockedContent?: ReactNode;
}

/**
 * SOFT GATE pattern - shows upgrade prompt for unauthorized users
 *
 * Use for features we want users to discover and upgrade for.
 * Unlike RouteGuard, this shows a friendly prompt instead of redirecting.
 *
 * @example
 * ```tsx
 * // In layout.tsx for /inspire-studio
 * export default function StudioLayout({ children }: { children: React.ReactNode }) {
 *   return (
 *     <FeatureGate
 *       minLevel={75}
 *       upgradeCTA="Upgrade to Editor to create learning content with INSPIRE Studio"
 *     >
 *       {children}
 *     </FeatureGate>
 *   );
 * }
 * ```
 */
export function FeatureGate({
  minLevel,
  upgradeCTA = 'Upgrade your plan to access this feature',
  upgradeLink = '/settings/billing',
  children,
  loadingContent,
  lockedContent,
}: FeatureGateProps): ReactNode {
  const { hasLevel, loading, personaLabel } = useRBAC();
  const allowed = hasLevel(minLevel);

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

  // Show locked content
  if (!allowed) {
    if (lockedContent) {
      return <>{lockedContent}</>;
    }

    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center">
        <div className="rounded-full bg-muted p-6 mb-6">
          <Lock className="h-12 w-12 text-muted-foreground" aria-hidden="true" />
        </div>
        <h2 className="text-2xl font-semibold mb-2">Feature Locked</h2>
        <p className="text-muted-foreground mb-4 max-w-md">{upgradeCTA}</p>
        <p className="text-sm text-muted-foreground mb-6">
          Your current role: <span className="font-medium">{personaLabel}</span>
        </p>
        <Button asChild>
          <Link href={upgradeLink}>View Upgrade Options</Link>
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
