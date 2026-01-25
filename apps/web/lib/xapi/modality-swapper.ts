/**
 * INSPIRE Modality Swapper Hook
 *
 * Real-time content adaptation based on learner cognitive state.
 * Listens to Firestore learner_profiles for AI-driven modality recommendations
 * and triggers UI content swaps within 60 seconds of state change detection.
 *
 * @module lib/xapi/modality-swapper
 *
 * @example
 * ```tsx
 * const { recommendedModality, shouldSwap, explanation, acceptSwap, rejectSwap } =
 *   useModalitySwapper({
 *     learnerId: 'user-123',
 *     skillId: 'skill-456',
 *     contentId: 'content-789',
 *     availableModalities: ['video', 'text', 'interactive'],
 *   });
 *
 * if (shouldSwap) {
 *   return <ModalitySwapPrompt
 *     recommendation={recommendedModality}
 *     explanation={explanation}
 *     onAccept={acceptSwap}
 *     onReject={rejectSwap}
 *   />;
 * }
 * ```
 */

'use client';

import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { useCallback, useEffect, useRef, useState } from 'react';
import { requireDb } from '@/lib/firebase/client';
import { logger } from '@/lib/logger';

const log = logger.scope('ModalitySwapper');

import {
  ContentModality,
  type ContentModalityType,
  type FunctionalLearningStateType,
} from './inspire-extensions';

// ============================================================================
// TYPES
// ============================================================================

export interface ModalitySwapperConfig {
  /** Learner identifier */
  learnerId: string;
  /** Current skill being practiced */
  skillId: string;
  /** Current content identifier */
  contentId?: string;
  /** Currently displayed modality */
  currentModality?: ContentModalityType;
  /** Available modalities for this content */
  availableModalities?: ContentModalityType[];
  /** Tenant ID for multi-tenant isolation */
  tenantId?: string;
  /** Minimum confidence threshold to trigger swap prompt (0-1) */
  confidenceThreshold?: number;
  /** Whether to auto-accept recommendations (for testing) */
  autoAccept?: boolean;
  /** Callback when modality changes */
  onModalityChange?: (newModality: ContentModalityType) => void;
  /** Callback when swap is rejected */
  onSwapRejected?: (reason?: string) => void;
}

export interface ModalityRecommendation {
  modality: ContentModalityType;
  confidence: number;
  functionalState: FunctionalLearningStateType;
  timestamp: Date;
}

export interface ModalitySwapperState {
  /** Current recommended modality (may differ from displayed) */
  recommendedModality: ContentModalityType | null;
  /** Whether a swap should be prompted to the user */
  shouldSwap: boolean;
  /** Confidence in the recommendation (0-1) */
  confidence: number;
  /** Detected functional learning state */
  functionalState: FunctionalLearningStateType | null;
  /** Glass Box explanation for the recommendation */
  explanation: {
    primaryReason: string;
    supportingFactors: string[];
  } | null;
  /** Whether currently loading */
  isLoading: boolean;
  /** Any error that occurred */
  error: Error | null;
  /** Accept the modality swap */
  acceptSwap: () => void;
  /** Reject the modality swap with optional reason */
  rejectSwap: (reason?: string) => void;
  /** Request a fresh prediction from the API */
  refreshPrediction: () => Promise<void>;
}

// ============================================================================
// FIRESTORE PATHS
// ============================================================================

function getModalityRecommendationPath(
  tenantId: string,
  learnerId: string,
  skillId: string,
): string {
  return `tenants/${tenantId}/modality_recommendations/${learnerId}_${skillId}`;
}

// ============================================================================
// PREDICTION API
// ============================================================================

interface PredictionResponse {
  success: boolean;
  prediction?: {
    recommendedModality: ContentModalityType;
    confidence: number;
    functionalState: FunctionalLearningStateType;
    shouldSwap: boolean;
  };
  explanation?: {
    primaryReason: string;
    supportingFactors: string[];
  };
  error?: {
    code: string;
    message: string;
  };
}

async function fetchPrediction(
  tenantId: string,
  learnerId: string,
  skillId: string,
  currentModality?: ContentModalityType,
  availableModalities?: ContentModalityType[],
): Promise<PredictionResponse> {
  const response = await fetch('/api/xapi/predict', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Tenant-ID': tenantId,
    },
    body: JSON.stringify({
      learnerId,
      skillId,
      currentModality,
      availableModalities,
    }),
  });

  return response.json();
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

export function useModalitySwapper(config: ModalitySwapperConfig): ModalitySwapperState {
  const {
    learnerId,
    skillId,
    contentId: _contentId,
    currentModality,
    availableModalities = Object.values(ContentModality),
    tenantId = 'default',
    confidenceThreshold = 0.6,
    autoAccept = false,
    onModalityChange,
    onSwapRejected,
  } = config;

  // State
  const [recommendedModality, setRecommendedModality] = useState<ContentModalityType | null>(null);
  const [shouldSwap, setShouldSwap] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [functionalState, setFunctionalState] = useState<FunctionalLearningStateType | null>(null);
  const [explanation, setExplanation] = useState<{
    primaryReason: string;
    supportingFactors: string[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Refs for cleanup
  const unsubscribeRef = useRef<(() => void) | null>(null);

  /**
   * Accept the modality swap
   */
  const acceptSwap = useCallback(() => {
    if (recommendedModality) {
      // Log acceptance to Firestore
      const recommendationPath = getModalityRecommendationPath(tenantId, learnerId, skillId);
      const db = requireDb();
      setDoc(
        doc(db, recommendationPath),
        {
          learnerAccepted: true,
          acceptedAt: serverTimestamp(),
        },
        { merge: true },
      ).catch((err) => log.error('Failed to log swap acceptance', err));

      // Trigger callback
      onModalityChange?.(recommendedModality);

      // Reset swap prompt
      setShouldSwap(false);
    }
  }, [recommendedModality, tenantId, learnerId, skillId, onModalityChange]);

  /**
   * Reject the modality swap
   */
  const rejectSwap = useCallback(
    (reason?: string) => {
      // Log rejection to Firestore (EU AI Act: learner override tracking)
      const recommendationPath = getModalityRecommendationPath(tenantId, learnerId, skillId);
      const db = requireDb();
      setDoc(
        doc(db, recommendationPath),
        {
          learnerOverride: true,
          overrideReason: reason || 'User declined',
          overrideAt: serverTimestamp(),
        },
        { merge: true },
      ).catch((err) => log.error('Failed to log swap rejection', err));

      // Trigger callback
      onSwapRejected?.(reason);

      // Reset swap prompt
      setShouldSwap(false);
    },
    [tenantId, learnerId, skillId, onSwapRejected],
  );

  /**
   * Fetch fresh prediction from API
   */
  const refreshPrediction = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchPrediction(
        tenantId,
        learnerId,
        skillId,
        currentModality,
        availableModalities,
      );

      if (response.success && response.prediction) {
        setRecommendedModality(response.prediction.recommendedModality);
        setConfidence(response.prediction.confidence);
        setFunctionalState(response.prediction.functionalState);
        setExplanation(response.explanation || null);

        // Determine if we should prompt for swap
        const shouldPrompt =
          response.prediction.shouldSwap &&
          response.prediction.confidence >= confidenceThreshold &&
          response.prediction.recommendedModality !== currentModality;

        setShouldSwap(shouldPrompt);

        // Auto-accept if configured (for testing)
        if (shouldPrompt && autoAccept) {
          onModalityChange?.(response.prediction.recommendedModality);
        }
      } else if (response.error) {
        setError(new Error(response.error.message));
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch prediction'));
    } finally {
      setIsLoading(false);
    }
  }, [
    tenantId,
    learnerId,
    skillId,
    currentModality,
    availableModalities,
    confidenceThreshold,
    autoAccept,
    onModalityChange,
  ]);

  /**
   * Subscribe to Firestore for real-time updates
   */
  useEffect(() => {
    // Clean up previous subscription
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }

    // Subscribe to modality recommendations
    const recommendationPath = getModalityRecommendationPath(tenantId, learnerId, skillId);
    const db = requireDb();
    const recommendationRef = doc(db, recommendationPath);

    unsubscribeRef.current = onSnapshot(
      recommendationRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();

          // Check if this is a new recommendation we haven't processed
          if (data.recommendedModality && !data.learnerAccepted && !data.learnerOverride) {
            setRecommendedModality(data.recommendedModality);
            setConfidence(data.confidence || 0);
            setFunctionalState(data.functionalState || null);
            setExplanation(
              data.explanation || {
                primaryReason: 'AI recommendation based on your learning patterns',
                supportingFactors: [],
              },
            );

            // Determine if we should prompt
            const shouldPrompt =
              data.shouldSwap &&
              (data.confidence || 0) >= confidenceThreshold &&
              data.recommendedModality !== currentModality;

            setShouldSwap(shouldPrompt);

            if (shouldPrompt && autoAccept) {
              onModalityChange?.(data.recommendedModality);
            }
          }
        }
        setIsLoading(false);
      },
      (err) => {
        log.error('Firestore subscription error', err);
        setError(err);
        setIsLoading(false);
      },
    );

    // Initial prediction fetch
    refreshPrediction();

    // Cleanup on unmount
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [
    tenantId,
    learnerId,
    skillId,
    currentModality,
    confidenceThreshold,
    autoAccept,
    onModalityChange,
    refreshPrediction,
  ]);

  return {
    recommendedModality,
    shouldSwap,
    confidence,
    functionalState,
    explanation,
    isLoading,
    error,
    acceptSwap,
    rejectSwap,
    refreshPrediction,
  };
}

// ============================================================================
// UTILITY COMPONENTS
// ============================================================================

export interface ModalitySwapPromptProps {
  recommendation: ContentModalityType;
  explanation: {
    primaryReason: string;
    supportingFactors: string[];
  };
  onAccept: () => void;
  onReject: (reason?: string) => void;
}

/**
 * Helper to get human-readable modality names
 */
export function getModalityDisplayName(modality: ContentModalityType): string {
  const names: Record<ContentModalityType, string> = {
    [ContentModality.VIDEO]: 'Video',
    [ContentModality.AUDIO]: 'Audio',
    [ContentModality.TEXT]: 'Text',
    [ContentModality.INTERACTIVE]: 'Interactive',
    [ContentModality.SIMULATION]: 'Simulation',
    [ContentModality.INFOGRAPHIC]: 'Infographic',
    [ContentModality.ANIMATION]: 'Animation',
    [ContentModality.QUIZ]: 'Quiz',
    [ContentModality.FLASHCARD]: 'Flashcards',
    [ContentModality.SCENARIO]: 'Scenario',
    [ContentModality.VR]: 'Virtual Reality',
    [ContentModality.AR]: 'Augmented Reality',
  };
  return names[modality] || modality;
}

/**
 * Helper to get modality icon
 */
export function getModalityIcon(modality: ContentModalityType): string {
  const icons: Record<ContentModalityType, string> = {
    [ContentModality.VIDEO]: '🎬',
    [ContentModality.AUDIO]: '🎧',
    [ContentModality.TEXT]: '📄',
    [ContentModality.INTERACTIVE]: '🎮',
    [ContentModality.SIMULATION]: '🔬',
    [ContentModality.INFOGRAPHIC]: '📊',
    [ContentModality.ANIMATION]: '✨',
    [ContentModality.QUIZ]: '❓',
    [ContentModality.FLASHCARD]: '🃏',
    [ContentModality.SCENARIO]: '🎭',
    [ContentModality.VR]: '🥽',
    [ContentModality.AR]: '📱',
  };
  return icons[modality] || '📚';
}
