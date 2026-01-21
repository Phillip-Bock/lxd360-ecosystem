'use client';

import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { type MissionPhase, useMissionStore } from '@/store/inspire';

// ============================================================================
// TYPES
// ============================================================================

interface ResumeUrlState {
  /** Generated resume URL */
  resumeUrl: string;

  /** Short URL (if generated) */
  shortUrl: string | null;

  /** Is URL copied to clipboard */
  isCopied: boolean;

  /** Has restored from URL params */
  hasRestored: boolean;
}

interface ResumeUrlActions {
  /** Generate resume URL for current state */
  generateResumeUrl: () => string;

  /** Copy URL to clipboard */
  copyToClipboard: () => Promise<boolean>;

  /** Restore state from URL params */
  restoreFromUrl: () => boolean;

  /** Create a shareable short URL (stub) */
  createShortUrl: () => Promise<string | null>;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const URL_PARAMS = {
  PHASE: 'phase',
  STEP: 'step',
  MISSION: 'mission',
} as const;

// ============================================================================
// HOOK
// ============================================================================

/**
 * useResumeUrl - Manages URL-based state persistence for resuming work
 *
 * Features:
 * - Generates unique URL with encoded state
 * - Parses URL params to restore position
 * - Clipboard copy functionality
 * - Short URL generation (stub for future API)
 */
export function useResumeUrl(): ResumeUrlState & ResumeUrlActions {
  const searchParams = useSearchParams();
  const currentPhase = useMissionStore((state) => state.currentPhase);
  const currentStep = useMissionStore((state) => state.currentStep);
  const manifest = useMissionStore((state) => state.manifest);
  const setPhase = useMissionStore((state) => state.setPhase);
  const setStep = useMissionStore((state) => state.setStep);

  const [isCopied, setIsCopied] = useState(false);
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const [hasRestored, setHasRestored] = useState(false);

  // Generate resume URL
  const generateResumeUrl = useCallback(() => {
    if (typeof window === 'undefined') return '';

    const params = new URLSearchParams();
    params.set(URL_PARAMS.PHASE, currentPhase);
    params.set(URL_PARAMS.STEP, String(currentStep));

    if (manifest?.metadata?.id) {
      params.set(URL_PARAMS.MISSION, manifest.metadata.id);
    }

    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?${params.toString()}`;
  }, [currentPhase, currentStep, manifest?.metadata?.id]);

  // Current resume URL
  const resumeUrl = useMemo(() => generateResumeUrl(), [generateResumeUrl]);

  // Copy to clipboard
  const copyToClipboard = useCallback(async (): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(resumeUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      return true;
    } catch {
      // Fallback for older browsers
      try {
        const textArea = document.createElement('textarea');
        textArea.value = resumeUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
        return true;
      } catch {
        return false;
      }
    }
  }, [resumeUrl]);

  // Restore from URL params
  const restoreFromUrl = useCallback((): boolean => {
    const phaseParam = searchParams.get(URL_PARAMS.PHASE);
    const stepParam = searchParams.get(URL_PARAMS.STEP);

    if (!phaseParam || !stepParam) {
      return false;
    }

    // Validate phase
    const validPhases: MissionPhase[] = ['encoding', 'synthesization', 'assimilation', 'audit'];
    if (!validPhases.includes(phaseParam as MissionPhase)) {
      return false;
    }

    // Validate step
    const stepNum = parseInt(stepParam, 10);
    if (Number.isNaN(stepNum) || stepNum < 1 || stepNum > 5) {
      return false;
    }

    // Restore state
    setPhase(phaseParam as MissionPhase);
    setStep(stepNum);
    setHasRestored(true);

    return true;
  }, [searchParams, setPhase, setStep]);

  // Create short URL (stub for future API integration)
  const createShortUrl = useCallback(async (): Promise<string | null> => {
    // In a real implementation, this would call an API to create a short URL
    // For now, we just return null
    // await fetch('/api/short-url', { method: 'POST', body: JSON.stringify({ url: resumeUrl }) })

    // Stub implementation - could use a service like bit.ly, tinyurl, or custom shortener
    setShortUrl(null);
    return null;
  }, []);

  // Auto-restore from URL on mount (if params present)
  useEffect(() => {
    if (!hasRestored) {
      const phaseParam = searchParams.get(URL_PARAMS.PHASE);
      const stepParam = searchParams.get(URL_PARAMS.STEP);

      if (phaseParam && stepParam) {
        restoreFromUrl();
      }
    }
  }, [hasRestored, searchParams, restoreFromUrl]);

  return {
    // State
    resumeUrl,
    shortUrl,
    isCopied,
    hasRestored,

    // Actions
    generateResumeUrl,
    copyToClipboard,
    restoreFromUrl,
    createShortUrl,
  };
}
