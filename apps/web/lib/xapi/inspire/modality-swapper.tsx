'use client';

// =============================================================================
// INSPIRE Modality Swapper
// =============================================================================
// Real-time content adaptation based on learner cognitive state.
// Listens to Firestore for AI recommendations and swaps content modality.
// Includes learner override capability for EU AI Act compliance.
// =============================================================================

import {
  type DocumentReference,
  doc,
  type Firestore,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { logger } from '@/lib/logger';

const log = logger.scope('INSPIREModalitySwapper');

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { Actor } from '../types';
import type { ConsentTier, Modality } from './extensions';
import { createModalitySwapStatement } from './recipes';

// =============================================================================
// Types
// =============================================================================

export interface ModalityRecommendation {
  contentBlockId: string;
  contentBlockName: string;
  skillId: string;
  fromModality: Modality;
  toModality: Modality;
  reason: string;
  confidence: number;
  modelVersion: string;
  explanationId: string;
  timestamp: string;
}

export interface LearnerProfile {
  learnerId: string;
  tenantId: string;

  // Current cognitive state
  currentCognitiveLoad: number;
  preferredModality: Modality;
  sessionDurationMinutes: number;

  // Active recommendation (if any)
  activeRecommendation: ModalityRecommendation | null;

  // Override tracking
  lastOverride: {
    contentBlockId: string;
    fromModality: Modality;
    toModality: Modality;
    reason: string;
    timestamp: string;
  } | null;

  // Metadata
  updatedAt: string;
}

export interface ModalitySwapperContextValue {
  // Current state
  learnerProfile: LearnerProfile | null;
  activeRecommendation: ModalityRecommendation | null;
  isLoading: boolean;
  error: Error | null;

  // Actions
  acceptRecommendation: () => Promise<void>;
  overrideRecommendation: (preferredModality: Modality, reason?: string) => Promise<void>;
  dismissRecommendation: () => Promise<void>;

  // Helpers
  getModalityForBlock: (blockId: string, defaultModality: Modality) => Modality;
  shouldShowSwapPrompt: (blockId: string) => boolean;
}

export interface ModalitySwapperProviderProps {
  children: ReactNode;

  // Firebase
  firestore: Firestore;

  // Learner
  learnerId: string;
  tenantId: string;
  actor: Actor;

  // Session
  sessionId: string;
  consentTier: ConsentTier;

  // xAPI endpoint (optional, defaults to /api/xapi/statements)
  xapiEndpoint?: string;

  // Callbacks
  onRecommendation?: (recommendation: ModalityRecommendation) => void;
  onSwap?: (fromModality: Modality, toModality: Modality, wasOverride: boolean) => void;
}

// =============================================================================
// Context
// =============================================================================

const ModalitySwapperContext = createContext<ModalitySwapperContextValue | null>(null);

/**
 * Hook to access modality swapper functionality
 */
export function useModalitySwapper(): ModalitySwapperContextValue {
  const context = useContext(ModalitySwapperContext);
  if (!context) {
    throw new Error('useModalitySwapper must be used within a ModalitySwapperProvider');
  }
  return context;
}

// =============================================================================
// Provider Component
// =============================================================================

/**
 * Provider component that manages modality swapping state
 *
 * @example
 * ```tsx
 * <ModalitySwapperProvider
 *   firestore={db}
 *   learnerId={user.uid}
 *   tenantId={org.id}
 *   actor={{ objectType: 'Agent', account: { homePage: 'https://lxd360.com', name: user.uid } }}
 *   sessionId={sessionId}
 *   consentTier={2}
 *   onSwap={(from, to, override) => handleModalitySwap(from, to)}
 * >
 *   <LearningContent />
 * </ModalitySwapperProvider>
 * ```
 */
export function ModalitySwapperProvider({
  children,
  firestore,
  learnerId,
  tenantId,
  actor,
  sessionId,
  consentTier,
  xapiEndpoint = '/api/xapi/statements',
  onRecommendation,
  onSwap,
}: ModalitySwapperProviderProps) {
  // State
  const [learnerProfile, setLearnerProfile] = useState<LearnerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Track active swaps per content block
  const [activeSwaps, setActiveSwaps] = useState<Map<string, Modality>>(new Map());

  // Document reference
  const profileRef: DocumentReference = useMemo(() => {
    return doc(firestore, 'tenants', tenantId, 'learner_profiles', learnerId);
  }, [firestore, tenantId, learnerId]);

  // Subscribe to Firestore updates
  useEffect(() => {
    setIsLoading(true);

    const unsubscribe = onSnapshot(
      profileRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as LearnerProfile;
          setLearnerProfile(data);

          // Notify if new recommendation
          if (data.activeRecommendation && onRecommendation) {
            onRecommendation(data.activeRecommendation);
          }
        } else {
          setLearnerProfile(null);
        }
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        log.error('Firestore subscription error', err);
        setError(err);
        setIsLoading(false);
      },
    );

    return () => unsubscribe();
  }, [profileRef, onRecommendation]);

  // Send xAPI statement
  const sendXAPIStatement = useCallback(
    async (statement: unknown) => {
      try {
        const response = await fetch(xapiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-tenant-id': tenantId,
          },
          body: JSON.stringify({ statements: [statement] }),
        });

        if (!response.ok) {
          log.error('Failed to send xAPI statement', { status: response.status });
        }
      } catch (err) {
        log.error('xAPI error', err);
      }
    },
    [xapiEndpoint, tenantId],
  );

  // Accept AI recommendation
  const acceptRecommendation = useCallback(async () => {
    const recommendation = learnerProfile?.activeRecommendation;
    if (!recommendation) return;

    // Track the swap
    setActiveSwaps((prev) => {
      const next = new Map(prev);
      next.set(recommendation.contentBlockId, recommendation.toModality);
      return next;
    });

    // Send xAPI statement
    const statement = createModalitySwapStatement({
      actor,
      contentBlockId: recommendation.contentBlockId,
      contentBlockName: recommendation.contentBlockName,
      skillId: recommendation.skillId,
      fromModality: recommendation.fromModality,
      toModality: recommendation.toModality,
      reason: recommendation.reason,
      aiModelVersion: recommendation.modelVersion,
      aiConfidence: recommendation.confidence,
      aiExplanationId: recommendation.explanationId,
      learnerOverride: false,
      sessionId,
      courseId: 'current', // TODO: Get from context
      tenantId,
      consentTier,
    });

    await sendXAPIStatement(statement);

    // Clear recommendation in Firestore
    await updateDoc(profileRef, {
      activeRecommendation: null,
      preferredModality: recommendation.toModality,
      updatedAt: serverTimestamp(),
    });

    // Callback
    if (onSwap) {
      onSwap(recommendation.fromModality, recommendation.toModality, false);
    }
  }, [
    learnerProfile,
    actor,
    sessionId,
    tenantId,
    consentTier,
    profileRef,
    sendXAPIStatement,
    onSwap,
  ]);

  // Override AI recommendation
  const overrideRecommendation = useCallback(
    async (preferredModality: Modality, reason?: string) => {
      const recommendation = learnerProfile?.activeRecommendation;
      if (!recommendation) return;

      // Track the swap with override
      setActiveSwaps((prev) => {
        const next = new Map(prev);
        next.set(recommendation.contentBlockId, preferredModality);
        return next;
      });

      // Send xAPI statement with override flag
      const statement = createModalitySwapStatement({
        actor,
        contentBlockId: recommendation.contentBlockId,
        contentBlockName: recommendation.contentBlockName,
        skillId: recommendation.skillId,
        fromModality: recommendation.fromModality,
        toModality: preferredModality,
        reason: recommendation.reason,
        aiModelVersion: recommendation.modelVersion,
        aiConfidence: recommendation.confidence,
        aiExplanationId: recommendation.explanationId,
        learnerOverride: true,
        overrideReason: reason,
        sessionId,
        courseId: 'current', // TODO: Get from context
        tenantId,
        consentTier,
      });

      await sendXAPIStatement(statement);

      // Update Firestore with override
      await updateDoc(profileRef, {
        activeRecommendation: null,
        preferredModality,
        lastOverride: {
          contentBlockId: recommendation.contentBlockId,
          fromModality: recommendation.fromModality,
          toModality: preferredModality,
          reason: reason || 'User preference',
          timestamp: new Date().toISOString(),
        },
        updatedAt: serverTimestamp(),
      });

      // Callback
      if (onSwap) {
        onSwap(recommendation.fromModality, preferredModality, true);
      }
    },
    [
      learnerProfile,
      actor,
      sessionId,
      tenantId,
      consentTier,
      profileRef,
      sendXAPIStatement,
      onSwap,
    ],
  );

  // Dismiss recommendation without accepting
  const dismissRecommendation = useCallback(async () => {
    if (!learnerProfile?.activeRecommendation) return;

    await updateDoc(profileRef, {
      activeRecommendation: null,
      updatedAt: serverTimestamp(),
    });
  }, [learnerProfile, profileRef]);

  // Get modality for a specific content block
  const getModalityForBlock = useCallback(
    (blockId: string, defaultModality: Modality): Modality => {
      // Check if we have an active swap for this block
      const swap = activeSwaps.get(blockId);
      if (swap) return swap;

      // Check if there's a pending recommendation for this block
      const recommendation = learnerProfile?.activeRecommendation;
      if (recommendation?.contentBlockId === blockId) {
        return recommendation.toModality;
      }

      // Use learner's preferred modality if set
      if (learnerProfile?.preferredModality) {
        return learnerProfile.preferredModality;
      }

      return defaultModality;
    },
    [activeSwaps, learnerProfile],
  );

  // Check if we should show swap prompt for a block
  const shouldShowSwapPrompt = useCallback(
    (blockId: string): boolean => {
      const recommendation = learnerProfile?.activeRecommendation;
      return recommendation?.contentBlockId === blockId && !activeSwaps.has(blockId);
    },
    [learnerProfile, activeSwaps],
  );

  // Context value
  const value: ModalitySwapperContextValue = useMemo(
    () => ({
      learnerProfile,
      activeRecommendation: learnerProfile?.activeRecommendation ?? null,
      isLoading,
      error,
      acceptRecommendation,
      overrideRecommendation,
      dismissRecommendation,
      getModalityForBlock,
      shouldShowSwapPrompt,
    }),
    [
      learnerProfile,
      isLoading,
      error,
      acceptRecommendation,
      overrideRecommendation,
      dismissRecommendation,
      getModalityForBlock,
      shouldShowSwapPrompt,
    ],
  );

  return (
    <ModalitySwapperContext.Provider value={value}>{children}</ModalitySwapperContext.Provider>
  );
}

// =============================================================================
// Swap Prompt Component
// =============================================================================

export interface ModalitySwapPromptProps {
  /** Custom class name */
  className?: string;
  /** Render as compact inline prompt */
  compact?: boolean;
  /** Custom accept button text */
  acceptText?: string;
  /** Custom dismiss button text */
  dismissText?: string;
  /** Show override options */
  showOverrideOptions?: boolean;
  /** Available modality options for override */
  modalityOptions?: Modality[];
}

/**
 * UI component for displaying modality swap recommendations
 *
 * @example
 * ```tsx
 * const { shouldShowSwapPrompt } = useModalitySwapper();
 *
 * return (
 *   <div>
 *     {shouldShowSwapPrompt(blockId) && (
 *       <ModalitySwapPrompt
 *         showOverrideOptions
 *         modalityOptions={['video', 'text', 'interactive']}
 *       />
 *     )}
 *     <ContentBlock id={blockId} />
 *   </div>
 * );
 * ```
 */
export function ModalitySwapPrompt({
  className = '',
  compact = false,
  acceptText = 'Switch Content',
  dismissText = 'Keep Current',
  showOverrideOptions = true,
  modalityOptions = ['video', 'audio', 'text', 'interactive'],
}: ModalitySwapPromptProps) {
  const {
    activeRecommendation,
    acceptRecommendation,
    overrideRecommendation,
    dismissRecommendation,
  } = useModalitySwapper();

  const [showOverride, setShowOverride] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');

  if (!activeRecommendation) return null;

  const handleOverride = async (modality: Modality) => {
    await overrideRecommendation(modality, overrideReason || undefined);
    setShowOverride(false);
    setOverrideReason('');
  };

  if (compact) {
    return (
      <div
        className={`inline-flex items-center gap-2 rounded-full bg-cyan-500/10 px-3 py-1 text-sm ${className}`}
      >
        <span className="text-cyan-400">💡 Try {activeRecommendation.toModality}?</span>
        <button
          type="button"
          onClick={acceptRecommendation}
          className="font-medium text-cyan-300 hover:text-cyan-200"
        >
          Yes
        </button>
        <button
          type="button"
          onClick={dismissRecommendation}
          className="text-gray-400 hover:text-gray-300"
        >
          No
        </button>
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 p-4 ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-cyan-500/20 p-2">
          <svg
            className="h-5 w-5 text-cyan-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
            role="img"
          >
            <title>Lightbulb</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
        </div>

        <div className="flex-1">
          <h4 className="font-medium text-white">Learning Recommendation</h4>
          <p className="mt-1 text-sm text-gray-300">{activeRecommendation.reason}</p>
          <p className="mt-2 text-xs text-gray-400">
            Confidence: {Math.round(activeRecommendation.confidence * 100)}%
          </p>

          {/* Glass Box: Explanation link */}
          <button
            type="button"
            className="mt-2 text-xs text-cyan-400 hover:text-cyan-300 underline"
          >
            Why this recommendation?
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={acceptRecommendation}
          className="rounded-md bg-cyan-500 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-900"
        >
          {acceptText}
        </button>

        <button
          type="button"
          onClick={dismissRecommendation}
          className="rounded-md bg-gray-700 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900"
        >
          {dismissText}
        </button>

        {showOverrideOptions && (
          <button
            type="button"
            onClick={() => setShowOverride(!showOverride)}
            className="rounded-md px-4 py-2 text-sm font-medium text-gray-400 hover:text-gray-300 focus:outline-none"
          >
            Choose Different Format
          </button>
        )}
      </div>

      {/* Override options */}
      {showOverride && (
        <div className="mt-4 rounded-md bg-gray-800/50 p-3">
          <p className="mb-2 text-sm text-gray-400">Select your preferred format:</p>
          <div className="flex flex-wrap gap-2">
            {modalityOptions
              .filter((m) => m !== activeRecommendation.fromModality)
              .map((modality) => (
                <button
                  key={modality}
                  type="button"
                  onClick={() => handleOverride(modality)}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                    modality === activeRecommendation.toModality
                      ? 'bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-500'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {modality.charAt(0).toUpperCase() + modality.slice(1)}
                </button>
              ))}
          </div>

          {/* Optional reason input */}
          <div className="mt-3">
            <input
              type="text"
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              placeholder="Why do you prefer this? (optional)"
              className="w-full rounded-md bg-gray-700 px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Utility Hook: Adaptive Content Loader
// =============================================================================

export interface AdaptiveContentOptions {
  blockId: string;
  defaultModality: Modality;
  contentVariants: Record<Modality, ReactNode>;
}

/**
 * Hook that returns the appropriate content variant based on modality
 *
 * @example
 * ```tsx
 * const content = useAdaptiveContent({
 *   blockId: 'intro-block',
 *   defaultModality: 'text',
 *   contentVariants: {
 *     text: <TextContent />,
 *     video: <VideoContent />,
 *     audio: <AudioContent />,
 *     interactive: <InteractiveContent />,
 *   },
 * });
 *
 * return <div>{content}</div>;
 * ```
 */
export function useAdaptiveContent({
  blockId,
  defaultModality,
  contentVariants,
}: AdaptiveContentOptions): {
  content: ReactNode;
  currentModality: Modality;
  showPrompt: boolean;
} {
  const { getModalityForBlock, shouldShowSwapPrompt } = useModalitySwapper();

  const currentModality = getModalityForBlock(blockId, defaultModality);
  const content = contentVariants[currentModality] || contentVariants[defaultModality];
  const showPrompt = shouldShowSwapPrompt(blockId);

  return { content, currentModality, showPrompt };
}
