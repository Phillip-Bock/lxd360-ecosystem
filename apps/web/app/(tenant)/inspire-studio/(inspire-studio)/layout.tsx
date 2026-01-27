import type { ReactNode } from 'react';
import { FeatureGate } from '@/components/rbac';

/**
 * INSPIRE Studio Layout - Editor+ access required
 *
 * Uses SOFT GATE pattern to show upgrade prompt for users
 * who don't have Editor access (level 75+)
 */
export default function InspireStudioLayout({ children }: { children: ReactNode }) {
  return (
    <FeatureGate
      minLevel={75}
      upgradeCTA="Upgrade to Editor to create learning content with INSPIRE Studio"
    >
      {children}
    </FeatureGate>
  );
}
