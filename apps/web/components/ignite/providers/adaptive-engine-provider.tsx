'use client';

import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from 'react';

// Functional learning states (EU AI Act compliant - NOT emotions)
export type FunctionalState =
  | 'focused'
  | 'uncertain'
  | 'struggling'
  | 'fatigued'
  | 'disengaged'
  | 'neutral';

// Content modalities
export type ContentModality = 'text' | 'video' | 'audio' | 'interactive' | 'simulation' | 'quiz';

// Mastery levels
export type MasteryLevel = 'novice' | 'developing' | 'proficient' | 'mastered';

interface CognitiveLoadState {
  total: number; // 0-10
  intrinsic: number;
  extraneous: number;
  germane: number;
}

interface SkillMastery {
  skillId: string;
  skillName: string;
  mastery: number; // 0-1 (BKT p(L_n))
  masteryLevel: MasteryLevel;
  lastUpdated: string;
}

interface AdaptiveRecommendation {
  id: string;
  type: 'modality_swap' | 'scaffolding' | 'break' | 'review' | 'challenge';
  reason: string;
  suggestedModality?: ContentModality;
  suggestedBlockId?: string;
  confidence: number;
  timestamp: string;
}

interface AdaptiveEngineState {
  // Current learner state
  functionalState: FunctionalState;
  cognitiveLoad: CognitiveLoadState;
  preferredModality: ContentModality;

  // Mastery tracking
  skillMasteries: SkillMastery[];

  // Recommendations
  currentRecommendation: AdaptiveRecommendation | null;
  recommendationHistory: AdaptiveRecommendation[];

  // Session metrics
  sessionDuration: number;
  hesitationCount: number;
  interactionCount: number;
}

interface AdaptiveEngineContextValue extends AdaptiveEngineState {
  // State updates
  updateFunctionalState: (state: FunctionalState) => void;
  updateCognitiveLoad: (load: Partial<CognitiveLoadState>) => void;
  setPreferredModality: (modality: ContentModality) => void;

  // Mastery tracking
  updateSkillMastery: (skillId: string, success: boolean) => void;
  getSkillMastery: (skillId: string) => SkillMastery | undefined;

  // Behavioral signals
  recordHesitation: () => void;
  recordInteraction: () => void;

  // Recommendations
  generateRecommendation: () => AdaptiveRecommendation | null;
  acceptRecommendation: (id: string) => void;
  dismissRecommendation: (id: string) => void;

  // Glass Box (Explainability)
  getExplanation: () => string;
}

const AdaptiveEngineContext = createContext<AdaptiveEngineContextValue | null>(null);

// BKT Parameters (defaults, can be tuned per skill)
const BKT_DEFAULTS = {
  pLearn: 0.3, // Probability of learning from an opportunity
  pGuess: 0.2, // Probability of guessing correctly
  pSlip: 0.1, // Probability of slipping (knowing but getting wrong)
  pInit: 0.3, // Initial probability of knowing
};

function getMasteryLevel(mastery: number): MasteryLevel {
  if (mastery < 0.3) return 'novice';
  if (mastery < 0.6) return 'developing';
  if (mastery < 0.85) return 'proficient';
  return 'mastered';
}

function updateBKTMastery(currentMastery: number, correct: boolean, params = BKT_DEFAULTS): number {
  const { pLearn, pGuess, pSlip } = params;

  if (correct) {
    // P(L_n | correct) = P(L_n-1) * (1 - pSlip) / P(correct)
    const pCorrect = currentMastery * (1 - pSlip) + (1 - currentMastery) * pGuess;
    const pMasteryGivenCorrect = (currentMastery * (1 - pSlip)) / pCorrect;
    // Add learning
    return pMasteryGivenCorrect + (1 - pMasteryGivenCorrect) * pLearn;
  }
  // P(L_n | incorrect) = P(L_n-1) * pSlip / P(incorrect)
  const pIncorrect = currentMastery * pSlip + (1 - currentMastery) * (1 - pGuess);
  const pMasteryGivenIncorrect = (currentMastery * pSlip) / pIncorrect;
  // Add learning
  return pMasteryGivenIncorrect + (1 - pMasteryGivenIncorrect) * pLearn;
}

interface AdaptiveEngineProviderProps {
  children: ReactNode;
  initialSkills?: SkillMastery[];
}

/**
 * AdaptiveEngineProvider - Manages adaptive learning state and recommendations
 *
 * Features:
 * - BKT (Bayesian Knowledge Tracing) for mastery estimation
 * - Cognitive load monitoring
 * - Functional state tracking (EU AI Act compliant)
 * - Modality recommendations
 * - Glass Box explainability
 */
export function AdaptiveEngineProvider({
  children,
  initialSkills = [],
}: AdaptiveEngineProviderProps) {
  const [state, setState] = useState<AdaptiveEngineState>({
    functionalState: 'neutral',
    cognitiveLoad: { total: 5, intrinsic: 3, extraneous: 1, germane: 1 },
    preferredModality: 'text',
    skillMasteries: initialSkills,
    currentRecommendation: null,
    recommendationHistory: [],
    sessionDuration: 0,
    hesitationCount: 0,
    interactionCount: 0,
  });

  const updateFunctionalState = useCallback((newState: FunctionalState) => {
    setState((prev) => ({ ...prev, functionalState: newState }));
  }, []);

  const updateCognitiveLoad = useCallback((load: Partial<CognitiveLoadState>) => {
    setState((prev) => ({
      ...prev,
      cognitiveLoad: {
        ...prev.cognitiveLoad,
        ...load,
        total:
          (load.intrinsic ?? prev.cognitiveLoad.intrinsic) +
          (load.extraneous ?? prev.cognitiveLoad.extraneous) +
          (load.germane ?? prev.cognitiveLoad.germane),
      },
    }));
  }, []);

  const setPreferredModality = useCallback((modality: ContentModality) => {
    setState((prev) => ({ ...prev, preferredModality: modality }));
  }, []);

  const updateSkillMastery = useCallback((skillId: string, success: boolean) => {
    setState((prev) => {
      const existingIndex = prev.skillMasteries.findIndex((s) => s.skillId === skillId);

      if (existingIndex >= 0) {
        const existing = prev.skillMasteries[existingIndex];
        const newMastery = updateBKTMastery(existing.mastery, success);
        const updated = [...prev.skillMasteries];
        updated[existingIndex] = {
          ...existing,
          mastery: newMastery,
          masteryLevel: getMasteryLevel(newMastery),
          lastUpdated: new Date().toISOString(),
        };
        return { ...prev, skillMasteries: updated };
      }

      // New skill
      const newMastery = updateBKTMastery(BKT_DEFAULTS.pInit, success);
      return {
        ...prev,
        skillMasteries: [
          ...prev.skillMasteries,
          {
            skillId,
            skillName: skillId, // Would be resolved from skill catalog
            mastery: newMastery,
            masteryLevel: getMasteryLevel(newMastery),
            lastUpdated: new Date().toISOString(),
          },
        ],
      };
    });
  }, []);

  const getSkillMastery = useCallback(
    (skillId: string) => state.skillMasteries.find((s) => s.skillId === skillId),
    [state.skillMasteries],
  );

  const recordHesitation = useCallback(() => {
    setState((prev) => ({
      ...prev,
      hesitationCount: prev.hesitationCount + 1,
      // Multiple hesitations may indicate uncertainty
      functionalState: prev.hesitationCount >= 2 ? 'uncertain' : prev.functionalState,
    }));
  }, []);

  const recordInteraction = useCallback(() => {
    setState((prev) => ({
      ...prev,
      interactionCount: prev.interactionCount + 1,
    }));
  }, []);

  const generateRecommendation = useCallback((): AdaptiveRecommendation | null => {
    const { functionalState, cognitiveLoad, hesitationCount, sessionDuration } = state;

    let recommendation: AdaptiveRecommendation | null = null;

    // High cognitive load -> suggest modality swap or scaffolding
    if (cognitiveLoad.total > 7) {
      recommendation = {
        id: `rec-${Date.now()}`,
        type: 'modality_swap',
        reason: 'High cognitive load detected. A different content format may help.',
        suggestedModality: 'video', // Could be more intelligent based on history
        confidence: 0.75,
        timestamp: new Date().toISOString(),
      };
    }
    // Struggling state -> suggest scaffolding
    else if (functionalState === 'struggling') {
      recommendation = {
        id: `rec-${Date.now()}`,
        type: 'scaffolding',
        reason: 'You seem to be having difficulty. Would you like some additional support?',
        confidence: 0.8,
        timestamp: new Date().toISOString(),
      };
    }
    // Uncertain with hesitations -> suggest review
    else if (functionalState === 'uncertain' && hesitationCount > 3) {
      recommendation = {
        id: `rec-${Date.now()}`,
        type: 'review',
        reason: 'It might help to review the previous material before continuing.',
        confidence: 0.7,
        timestamp: new Date().toISOString(),
      };
    }
    // Long session -> suggest break
    else if (sessionDuration > 45 * 60 * 1000) {
      // 45 minutes
      recommendation = {
        id: `rec-${Date.now()}`,
        type: 'break',
        reason: "You've been learning for a while. A short break can improve retention.",
        confidence: 0.85,
        timestamp: new Date().toISOString(),
      };
    }

    if (recommendation) {
      setState((prev) => ({
        ...prev,
        currentRecommendation: recommendation,
        recommendationHistory: [recommendation, ...prev.recommendationHistory].slice(0, 20),
      }));
    }

    return recommendation;
  }, [state]);

  const acceptRecommendation = useCallback((id: string) => {
    setState((prev) => {
      if (prev.currentRecommendation?.id !== id) return prev;
      // Log acceptance for analytics
      return { ...prev, currentRecommendation: null };
    });
  }, []);

  const dismissRecommendation = useCallback((id: string) => {
    setState((prev) => {
      if (prev.currentRecommendation?.id !== id) return prev;
      // Log dismissal for analytics
      return { ...prev, currentRecommendation: null };
    });
  }, []);

  const getExplanation = useCallback((): string => {
    const { functionalState, cognitiveLoad, currentRecommendation } = state;

    const parts: string[] = [
      `Current learning state: ${functionalState}`,
      `Cognitive load: ${cognitiveLoad.total.toFixed(1)}/10`,
    ];

    if (currentRecommendation) {
      parts.push(`Recommendation: ${currentRecommendation.reason}`);
      parts.push(`Confidence: ${(currentRecommendation.confidence * 100).toFixed(0)}%`);
    }

    return parts.join('\n');
  }, [state]);

  const value = useMemo<AdaptiveEngineContextValue>(
    () => ({
      ...state,
      updateFunctionalState,
      updateCognitiveLoad,
      setPreferredModality,
      updateSkillMastery,
      getSkillMastery,
      recordHesitation,
      recordInteraction,
      generateRecommendation,
      acceptRecommendation,
      dismissRecommendation,
      getExplanation,
    }),
    [
      state,
      updateFunctionalState,
      updateCognitiveLoad,
      setPreferredModality,
      updateSkillMastery,
      getSkillMastery,
      recordHesitation,
      recordInteraction,
      generateRecommendation,
      acceptRecommendation,
      dismissRecommendation,
      getExplanation,
    ],
  );

  return <AdaptiveEngineContext.Provider value={value}>{children}</AdaptiveEngineContext.Provider>;
}

/**
 * Hook to access adaptive learning engine
 */
export function useAdaptiveEngine() {
  const context = useContext(AdaptiveEngineContext);
  if (!context) {
    throw new Error('useAdaptiveEngine must be used within an AdaptiveEngineProvider');
  }
  return context;
}
