'use client';

/**
 * useAchievements - Hooks for fetching badges and certificates
 *
 * Wraps the achievements Firestore service to provide React-friendly
 * state management with loading, error, and data states.
 */

import { useCallback, useEffect, useState } from 'react';
import {
  getBadges,
  getBadgesByCategory,
  getBadgesByType,
  getLearnerBadges,
  getLearnerCertificates,
  getRecentBadges,
  hasEarnedBadge,
} from '@/lib/firestore/services/achievements';
import type { AchievementType, Badge, Certificate, EarnedBadge } from '@/types/lms/achievement';
import { useOrganization } from './use-organization';

// =============================================================================
// TYPES
// =============================================================================

export interface UseBadgesState {
  /** List of badges */
  badges: Badge[];
  /** Loading state */
  loading: boolean;
  /** Error message */
  error: string | null;
}

export interface UseBadgesActions {
  /** Refresh the badges list */
  refresh: () => Promise<void>;
}

export type UseBadgesReturn = UseBadgesState & UseBadgesActions;

// =============================================================================
// HOOK: useBadges (all available badges)
// =============================================================================

export function useBadges(): UseBadgesReturn {
  const { organizationId, loading: orgLoading } = useOrganization();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBadges = useCallback(async () => {
    if (!organizationId) {
      setBadges([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getBadges(organizationId);
      setBadges(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch badges';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    if (!orgLoading) {
      fetchBadges();
    }
  }, [orgLoading, fetchBadges]);

  const refresh = useCallback(async () => {
    await fetchBadges();
  }, [fetchBadges]);

  return {
    badges,
    loading: loading || orgLoading,
    error,
    refresh,
  };
}

// =============================================================================
// HOOK: useBadgesByCategory
// =============================================================================

export function useBadgesByCategory(category: string | null): UseBadgesReturn {
  const { organizationId, loading: orgLoading } = useOrganization();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBadges = useCallback(async () => {
    if (!organizationId || !category) {
      setBadges([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getBadgesByCategory(organizationId, category);
      setBadges(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch badges';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [organizationId, category]);

  useEffect(() => {
    if (!orgLoading) {
      fetchBadges();
    }
  }, [orgLoading, fetchBadges]);

  const refresh = useCallback(async () => {
    await fetchBadges();
  }, [fetchBadges]);

  return {
    badges,
    loading: loading || orgLoading,
    error,
    refresh,
  };
}

// =============================================================================
// HOOK: useBadgesByType
// =============================================================================

export function useBadgesByType(type: AchievementType | null): UseBadgesReturn {
  const { organizationId, loading: orgLoading } = useOrganization();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBadges = useCallback(async () => {
    if (!organizationId || !type) {
      setBadges([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getBadgesByType(organizationId, type);
      setBadges(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch badges';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [organizationId, type]);

  useEffect(() => {
    if (!orgLoading) {
      fetchBadges();
    }
  }, [orgLoading, fetchBadges]);

  const refresh = useCallback(async () => {
    await fetchBadges();
  }, [fetchBadges]);

  return {
    badges,
    loading: loading || orgLoading,
    error,
    refresh,
  };
}

// =============================================================================
// HOOK: useLearnerBadges (earned badges)
// =============================================================================

export interface UseEarnedBadgesState {
  /** List of earned badges */
  badges: EarnedBadge[];
  /** Loading state */
  loading: boolean;
  /** Error message */
  error: string | null;
}

export interface UseEarnedBadgesActions {
  /** Refresh the badges list */
  refresh: () => Promise<void>;
}

export type UseEarnedBadgesReturn = UseEarnedBadgesState & UseEarnedBadgesActions;

export function useLearnerBadges(learnerId: string | null): UseEarnedBadgesReturn {
  const { organizationId, loading: orgLoading } = useOrganization();
  const [badges, setBadges] = useState<EarnedBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBadges = useCallback(async () => {
    if (!organizationId || !learnerId) {
      setBadges([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getLearnerBadges(organizationId, learnerId);
      setBadges(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch learner badges';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [organizationId, learnerId]);

  useEffect(() => {
    if (!orgLoading) {
      fetchBadges();
    }
  }, [orgLoading, fetchBadges]);

  const refresh = useCallback(async () => {
    await fetchBadges();
  }, [fetchBadges]);

  return {
    badges,
    loading: loading || orgLoading,
    error,
    refresh,
  };
}

// =============================================================================
// HOOK: useRecentBadges
// =============================================================================

export function useRecentBadges(learnerId: string | null, count = 5): UseEarnedBadgesReturn {
  const { organizationId, loading: orgLoading } = useOrganization();
  const [badges, setBadges] = useState<EarnedBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBadges = useCallback(async () => {
    if (!organizationId || !learnerId) {
      setBadges([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getRecentBadges(organizationId, learnerId, count);
      setBadges(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch recent badges';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [organizationId, learnerId, count]);

  useEffect(() => {
    if (!orgLoading) {
      fetchBadges();
    }
  }, [orgLoading, fetchBadges]);

  const refresh = useCallback(async () => {
    await fetchBadges();
  }, [fetchBadges]);

  return {
    badges,
    loading: loading || orgLoading,
    error,
    refresh,
  };
}

// =============================================================================
// HOOK: useHasEarnedBadge
// =============================================================================

export interface UseHasEarnedBadgeReturn {
  hasEarned: boolean;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useHasEarnedBadge(
  learnerId: string | null,
  badgeId: string | null,
): UseHasEarnedBadgeReturn {
  const { organizationId, loading: orgLoading } = useOrganization();
  const [hasEarned, setHasEarned] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkBadge = useCallback(async () => {
    if (!organizationId || !learnerId || !badgeId) {
      setHasEarned(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await hasEarnedBadge(organizationId, learnerId, badgeId);
      setHasEarned(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to check badge';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [organizationId, learnerId, badgeId]);

  useEffect(() => {
    if (!orgLoading) {
      checkBadge();
    }
  }, [orgLoading, checkBadge]);

  const refresh = useCallback(async () => {
    await checkBadge();
  }, [checkBadge]);

  return {
    hasEarned,
    loading: loading || orgLoading,
    error,
    refresh,
  };
}

// =============================================================================
// HOOK: useLearnerCertificates
// =============================================================================

export interface UseCertificatesState {
  /** List of certificates */
  certificates: Certificate[];
  /** Loading state */
  loading: boolean;
  /** Error message */
  error: string | null;
}

export interface UseCertificatesActions {
  /** Refresh the certificates list */
  refresh: () => Promise<void>;
}

export type UseCertificatesReturn = UseCertificatesState & UseCertificatesActions;

export function useLearnerCertificates(learnerId: string | null): UseCertificatesReturn {
  const { organizationId, loading: orgLoading } = useOrganization();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCertificates = useCallback(async () => {
    if (!organizationId || !learnerId) {
      setCertificates([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getLearnerCertificates(organizationId, learnerId);
      setCertificates(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch certificates';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [organizationId, learnerId]);

  useEffect(() => {
    if (!orgLoading) {
      fetchCertificates();
    }
  }, [orgLoading, fetchCertificates]);

  const refresh = useCallback(async () => {
    await fetchCertificates();
  }, [fetchCertificates]);

  return {
    certificates,
    loading: loading || orgLoading,
    error,
    refresh,
  };
}
