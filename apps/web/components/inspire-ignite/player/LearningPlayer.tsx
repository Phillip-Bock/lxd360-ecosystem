'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useCognitiveTracking } from '@/lib/hooks/useCognitiveTracking';
import { useXAPITracking } from '@/lib/hooks/useXAPITracking';
import type { ContentBlock } from '@/lib/inspire/types/contentBlocks';
import { logger } from '@/lib/logger';
import { CognitiveMeter } from './CognitiveMeter';

const log = logger.scope('LearningPlayer');

import { ContentRenderer } from './ContentRenderer';
import { PlayerControls } from './PlayerControls';

interface LearningPlayerProps {
  courseId: string;
  courseName: string;
  lessonId: string;
  lessonTitle: string;
  moduleId?: string;
  moduleName?: string;
  blocks: ContentBlock[];
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface LearnerState {
  currentBlockIndex: number;
  completedBlocks: string[];
  startedAt: string;
  lastAccessedAt: string;
}

export function LearningPlayer({
  courseId,
  courseName,
  lessonId,
  lessonTitle,
  moduleId,
  moduleName,
  blocks,
  user,
}: LearningPlayerProps): React.JSX.Element {
  const router = useRouter();
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [completedBlocks, setCompletedBlocks] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // Cognitive tracking
  const { metrics } = useCognitiveTracking({
    sessionId: `${lessonId}-${Date.now()}`,
    contentId: lessonId,
    contentType: 'lesson',
    sendInterval: 15000, // Send metrics every 15 seconds
    enabled: true,
  });

  // xAPI tracking
  const { sendStatement, trackProgress, saveState, loadState } = useXAPITracking({
    actor: {
      objectType: 'Agent',
      name: user.name,
      mbox: `mailto:${user.email}`,
    },
    courseId,
    courseName,
    moduleId,
    moduleName,
  });

  // Calculate progress
  const progress = blocks.length > 0 ? ((currentBlockIndex + 1) / blocks.length) * 100 : 0;

  // Load saved state on mount
  useEffect(() => {
    const loadSavedState = async (): Promise<void> => {
      try {
        const state = (await loadState(`lesson-${lessonId}`)) as LearnerState | null;
        if (state) {
          setCurrentBlockIndex(state.currentBlockIndex);
          setCompletedBlocks(new Set(state.completedBlocks));
        }
        setIsLoading(false);

        // Send initialized/resumed statement
        await sendStatement(
          state ? 'resumed' : 'initialized',
          `lessons/${lessonId}`,
          lessonTitle,
          'lesson',
        );
      } catch (error) {
        log.error(
          'Failed to load state',
          error instanceof Error ? error : new Error(String(error)),
        );
        setIsLoading(false);
      }
    };

    loadSavedState();
  }, [lessonId, lessonTitle, loadState, sendStatement]);

  // Save state periodically and on navigation
  const saveCurrentState = useCallback(async () => {
    const state: LearnerState = {
      currentBlockIndex,
      completedBlocks: Array.from(completedBlocks),
      startedAt: new Date().toISOString(),
      lastAccessedAt: new Date().toISOString(),
    };
    await saveState(`lesson-${lessonId}`, state);
  }, [currentBlockIndex, completedBlocks, lessonId, saveState]);

  // Auto-save state every 30 seconds
  useEffect(() => {
    const interval = setInterval(saveCurrentState, 30000);
    return (): void => clearInterval(interval);
  }, [saveCurrentState]);

  // Save state on unmount
  useEffect(() => {
    return (): void => {
      saveCurrentState();
    };
  }, [saveCurrentState]);

  // Handle block completion
  const handleBlockComplete = useCallback((blockId: string) => {
    setCompletedBlocks((prev) => {
      const next = new Set(prev);
      next.add(blockId);
      return next;
    });
  }, []);

  // Handle block interactions
  const handleInteraction = useCallback(
    async (type: string, blockId: string, data?: unknown) => {
      await sendStatement(
        'interacted',
        `blocks/${blockId}`,
        type,
        'interaction',
        data ? { response: JSON.stringify(data) } : undefined,
        metrics.cognitiveLoadIndex,
      );
    },
    [sendStatement, metrics.cognitiveLoadIndex],
  );

  // Navigate to previous block
  const handlePrevious = useCallback(() => {
    if (currentBlockIndex > 0) {
      setCurrentBlockIndex((prev) => prev - 1);
      saveCurrentState();
    }
  }, [currentBlockIndex, saveCurrentState]);

  // Navigate to next block
  const handleNext = useCallback(async () => {
    if (currentBlockIndex < blocks.length - 1) {
      setCurrentBlockIndex((prev) => prev + 1);
      await trackProgress(progress);
      saveCurrentState();
    } else {
      // Complete lesson
      await sendStatement(
        'completed',
        `lessons/${lessonId}`,
        lessonTitle,
        'lesson',
        { completion: true },
        metrics.cognitiveLoadIndex,
      );
      router.push(`/learn/${courseId}/complete?lesson=${lessonId}`);
    }
  }, [
    currentBlockIndex,
    blocks.length,
    progress,
    trackProgress,
    saveCurrentState,
    sendStatement,
    lessonId,
    lessonTitle,
    metrics.cognitiveLoadIndex,
    router,
    courseId,
  ]);

  // Navigate to specific block
  const handleNavigate = useCallback(
    (index: number) => {
      setCurrentBlockIndex(index);
      saveCurrentState();
    },
    [saveCurrentState],
  );

  // Exit lesson
  const handleExit = useCallback(async () => {
    await sendStatement(
      'suspended',
      `lessons/${lessonId}`,
      lessonTitle,
      'lesson',
      undefined,
      metrics.cognitiveLoadIndex,
    );
    await saveCurrentState();
    router.push(`/dashboard/courses/${courseId}`);
  }, [
    sendStatement,
    lessonId,
    lessonTitle,
    metrics.cognitiveLoadIndex,
    saveCurrentState,
    router,
    courseId,
  ]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-lxd-light-card">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-lxd-light-card pt-16 pb-20">
      {/* Player Controls */}
      <PlayerControls
        currentIndex={currentBlockIndex}
        totalBlocks={blocks.length}
        progress={progress}
        lessonTitle={lessonTitle}
        moduleTitle={moduleName}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onNavigate={handleNavigate}
        onExit={handleExit}
        blocks={blocks}
      />

      {/* Cognitive Meter - Fixed position */}
      <div className="fixed left-4 top-20 z-40 w-64 hidden lg:block">
        <CognitiveMeter
          cognitiveLoadIndex={metrics.cognitiveLoadIndex}
          cognitiveLoadLevel={metrics.cognitiveLoadLevel}
          engagementScore={metrics.engagementScore}
          attentionScore={metrics.attentionScore}
          showDetails
        />
      </div>

      {/* Mobile Cognitive Meter - Compact */}
      <div className="lg:hidden fixed left-4 top-16 z-40">
        <CognitiveMeter
          cognitiveLoadIndex={metrics.cognitiveLoadIndex}
          cognitiveLoadLevel={metrics.cognitiveLoadLevel}
          engagementScore={metrics.engagementScore}
          attentionScore={metrics.attentionScore}
          compact
        />
      </div>

      {/* Content */}
      <main className="lg:ml-72">
        <ContentRenderer
          blocks={blocks}
          currentBlockIndex={currentBlockIndex}
          onBlockComplete={handleBlockComplete}
          onInteraction={handleInteraction}
        />
      </main>
    </div>
  );
}
