'use client';

/**
 * useOrganization - Hook for accessing organization context
 *
 * Provides the current organization ID from auth context.
 * All Firestore queries are scoped to the organization.
 */

import { useAuth } from '@/lib/firebase/useAuth';

export interface UseOrganizationReturn {
  /** Current organization ID (from tenant) */
  organizationId: string | null;
  /** Whether organization is loading */
  loading: boolean;
  /** Whether user has an organization */
  hasOrganization: boolean;
}

/**
 * Get the current organization ID from auth context.
 * Maps tenantId to organizationId for Firestore queries.
 */
export function useOrganization(): UseOrganizationReturn {
  const { profile, loading } = useAuth();

  return {
    organizationId: profile?.tenantId ?? null,
    loading,
    hasOrganization: !!profile?.tenantId,
  };
}
