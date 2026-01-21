'use client';

import { useCallback, useMemo, useState } from 'react';
import { type ExtendedWizardStep, WIZARD_STEPS } from '@/lib/inspire/types/wizard-config';
import { type MissionPhase, useMissionStore } from '@/store/inspire';

// ============================================================================
// TYPES
// ============================================================================

interface CoPilotSuggestion {
  id: string;
  type: 'tip' | 'warning' | 'action' | 'example';
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  actionLabel?: string;
  actionHandler?: () => void;
}

interface CoPilotMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface CoPilotState {
  /** Current context-aware suggestions */
  suggestions: CoPilotSuggestion[];

  /** Is AI thinking/loading */
  isLoading: boolean;

  /** Current conversation messages */
  messages: CoPilotMessage[];

  /** Current step's help content */
  helpContent: ExtendedWizardStep['helpContent'] | undefined;

  /** Industry-specific considerations */
  industryConsiderations: string | undefined;
}

interface CoPilotActions {
  /** Send a message to the AI */
  sendMessage: (content: string) => Promise<string>;

  /** Get AI-generated suggestion for current context */
  getSuggestion: (prompt: string) => Promise<string>;

  /** Clear conversation history */
  clearConversation: () => void;

  /** Apply a suggestion action */
  applySuggestion: (suggestionId: string) => void;

  /** Dismiss a suggestion */
  dismissSuggestion: (suggestionId: string) => void;

  /** Generate content based on current step */
  generateContent: (type: 'draft' | 'example' | 'improvement') => Promise<string>;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * useCoPilot - AI suggestion fetching and context-aware prompts
 *
 * Features:
 * - Context-aware suggestions based on current step
 * - AI message handling (stub for Vertex AI)
 * - Help content access
 * - Industry-specific considerations
 */
export function useCoPilot(): CoPilotState & CoPilotActions {
  const currentPhase = useMissionStore((state) => state.currentPhase);
  const currentStep = useMissionStore((state) => state.currentStep);
  const manifest = useMissionStore((state) => state.manifest);

  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<CoPilotMessage[]>([]);
  const [activeSuggestions, setActiveSuggestions] = useState<string[]>([]);

  // Calculate global step number
  const globalStepNumber = useMemo(() => {
    const phaseOffsets: Record<MissionPhase, number> = {
      encoding: 0,
      synthesization: 4,
      assimilation: 9,
      audit: 14,
    };
    return phaseOffsets[currentPhase] + currentStep;
  }, [currentPhase, currentStep]);

  // Get current step config
  const currentStepConfig = useMemo(() => {
    return WIZARD_STEPS.find((step) => step.stepNumber === globalStepNumber);
  }, [globalStepNumber]);

  // Get help content for current step
  const helpContent = useMemo(() => currentStepConfig?.helpContent, [currentStepConfig]);

  // Get industry-specific considerations
  const industryConsiderations = useMemo(() => {
    if (!currentStepConfig?.industryConsiderations) return undefined;

    const industry = manifest?.metadata?.industry?.toLowerCase();

    if (industry?.includes('health')) {
      return currentStepConfig.industryConsiderations.healthcare;
    }
    if (industry?.includes('aero')) {
      return currentStepConfig.industryConsiderations.aerospace;
    }
    if (industry?.includes('manufactur')) {
      return currentStepConfig.industryConsiderations.manufacturing;
    }

    return currentStepConfig.industryConsiderations.general;
  }, [currentStepConfig, manifest?.metadata?.industry]);

  // Generate context-aware suggestions
  const suggestions = useMemo<CoPilotSuggestion[]>(() => {
    const result: CoPilotSuggestion[] = [];

    if (!currentStepConfig) return result;

    // Add key questions as tips
    currentStepConfig.keyQuestions?.forEach((question, idx) => {
      if (!activeSuggestions.includes(`question-${idx}`)) {
        result.push({
          id: `question-${idx}`,
          type: 'tip',
          title: 'Key Question',
          content: question,
          priority: 'medium',
        });
      }
    });

    // Add common mistakes as warnings
    currentStepConfig.commonMistakes?.forEach((mistake, idx) => {
      if (!activeSuggestions.includes(`mistake-${idx}`)) {
        result.push({
          id: `mistake-${idx}`,
          type: 'warning',
          title: 'Avoid This Mistake',
          content: mistake,
          priority: 'high',
        });
      }
    });

    // Add success criteria as actions
    currentStepConfig.successCriteria?.forEach((criteria, idx) => {
      if (!activeSuggestions.includes(`criteria-${idx}`)) {
        result.push({
          id: `criteria-${idx}`,
          type: 'action',
          title: 'Success Criteria',
          content: criteria,
          priority: 'low',
        });
      }
    });

    // Add industry consideration if available
    if (industryConsiderations && !activeSuggestions.includes('industry')) {
      result.push({
        id: 'industry',
        type: 'tip',
        title: 'Industry Consideration',
        content: industryConsiderations,
        priority: 'medium',
      });
    }

    return result.slice(0, 5); // Limit to 5 suggestions
  }, [currentStepConfig, industryConsiderations, activeSuggestions]);

  // Send message to AI (stub for Vertex AI)
  const sendMessage = useCallback(
    async (content: string): Promise<string> => {
      setIsLoading(true);

      // Add user message
      const userMessage: CoPilotMessage = {
        id: `msg-${Date.now()}`,
        role: 'user',
        content,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);

      try {
        // Simulate API call to Vertex AI
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Generate contextual response based on current step
        let response = '';

        if (currentStepConfig) {
          if (content.toLowerCase().includes('help')) {
            response = currentStepConfig.helpContent?.overview ?? 'How can I assist you?';
          } else if (content.toLowerCase().includes('example')) {
            response =
              currentStepConfig.helpContent?.examples?.join('\n\n') ??
              'No examples available for this step.';
          } else if (
            content.toLowerCase().includes('mistake') ||
            content.toLowerCase().includes('avoid')
          ) {
            response =
              currentStepConfig.commonMistakes?.join('\n• ') ??
              'No common mistakes documented for this step.';
          } else {
            response = `For **${currentStepConfig.name}**:\n\n${currentStepConfig.helpContent?.overview ?? 'I can help you with this step.'}`;
          }
        } else {
          response =
            "I'm your INSPIRE Co-Pilot. Ask me about any step in the course creation process.";
        }

        // Add AI response
        const aiMessage: CoPilotMessage = {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: response,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);

        return response;
      } finally {
        setIsLoading(false);
      }
    },
    [currentStepConfig],
  );

  // Get AI suggestion (stub)
  const getSuggestion = useCallback(
    async (_prompt: string): Promise<string> => {
      setIsLoading(true);

      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Return contextual suggestion
        if (currentStepConfig) {
          return `Based on the ${currentStepConfig.name} step, I suggest focusing on: ${currentStepConfig.keyQuestions?.[0] ?? 'completing the required fields'}`;
        }

        return 'Please provide more context for a specific suggestion.';
      } finally {
        setIsLoading(false);
      }
    },
    [currentStepConfig],
  );

  // Clear conversation
  const clearConversation = useCallback(() => {
    setMessages([]);
    setActiveSuggestions([]);
  }, []);

  // Apply suggestion
  const applySuggestion = useCallback((suggestionId: string) => {
    setActiveSuggestions((prev) => [...prev, suggestionId]);
  }, []);

  // Dismiss suggestion
  const dismissSuggestion = useCallback((suggestionId: string) => {
    setActiveSuggestions((prev) => [...prev, suggestionId]);
  }, []);

  // Generate content (stub for AI content generation)
  const generateContent = useCallback(
    async (type: 'draft' | 'example' | 'improvement'): Promise<string> => {
      setIsLoading(true);

      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));

        switch (type) {
          case 'draft':
            return `Draft content for ${currentStepConfig?.name ?? 'this step'}...`;
          case 'example':
            return currentStepConfig?.helpContent?.examples?.[0] ?? 'Example content...';
          case 'improvement':
            return `Suggested improvements for ${currentStepConfig?.name ?? 'your content'}...`;
          default:
            return 'Generated content...';
        }
      } finally {
        setIsLoading(false);
      }
    },
    [currentStepConfig],
  );

  return {
    // State
    suggestions,
    isLoading,
    messages,
    helpContent,
    industryConsiderations,

    // Actions
    sendMessage,
    getSuggestion,
    clearConversation,
    applySuggestion,
    dismissSuggestion,
    generateContent,
  };
}
