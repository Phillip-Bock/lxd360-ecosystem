'use client';

import { useCallback, useEffect, useState } from 'react';
import { type ContentBlock, renderContentBlock } from '@/components/content-blocks/registry';
import { type INSPIREPhase, PhaseIndicator } from '@/components/inspire/phase-indicator';

export interface LessonContentRendererProps {
  blocks: ContentBlock[];
  lessonId: string;
  inspirePhase: INSPIREPhase;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
  showPhaseIndicator?: boolean;
}

interface BlockProgress {
  blockKey: string;
  completed: boolean;
  timeSpent: number;
}

export function LessonContentRenderer({
  blocks,
  lessonId,
  inspirePhase,
  onProgress,
  onComplete,
  showPhaseIndicator = true,
}: LessonContentRendererProps): React.JSX.Element {
  const [blockProgress, setBlockProgress] = useState<Record<string, BlockProgress>>({});
  //   const [_startTime] = useState(Date.now())

  // Calculate overall progress
  const calculateProgress = useCallback((): number => {
    const completedBlocks = Object.values(blockProgress).filter((p) => p.completed).length;
    return blocks.length > 0 ? (completedBlocks / blocks.length) * 100 : 0;
  }, [blockProgress, blocks.length]);

  // xAPI tracking functions - defined before useEffects that depend on them
  const trackLessonStart = useCallback(async (): Promise<void> => {
    // Future: Integrate with actual xAPI service using lessonId
    void lessonId;
  }, [lessonId]);

  const trackLessonComplete = useCallback(async (): Promise<void> => {
    // Future: Integrate with actual xAPI service using lessonId
    void lessonId;
  }, [lessonId]);

  const trackBlockInteraction = useCallback(
    async (blockKey: string, interactionType: string): Promise<void> => {
      // Future: Integrate with actual xAPI service using blockKey and interactionType
      void blockKey;
      void interactionType;
    },
    [],
  );

  // Report progress when it changes
  useEffect(() => {
    const progress = calculateProgress();
    onProgress?.(progress);

    // Check for completion
    if (progress >= 100) {
      // Track xAPI completion
      trackLessonComplete();
      onComplete?.();
    }
  }, [calculateProgress, onProgress, onComplete, trackLessonComplete]);

  // Track xAPI statement for lesson start
  useEffect(() => {
    trackLessonStart();
  }, [trackLessonStart]);

  // Handle block completion
  const handleBlockComplete = useCallback(
    (blockKey: string): void => {
      setBlockProgress((prev) => ({
        ...prev,
        [blockKey]: {
          ...prev[blockKey],
          blockKey,
          completed: true,
          timeSpent: prev[blockKey]?.timeSpent || 0,
        },
      }));
      trackBlockInteraction(blockKey, 'completed');
    },
    [trackBlockInteraction],
  );

  // Handle block progress
  const handleBlockProgress = useCallback(
    (blockKey: string, progress: number): void => {
      setBlockProgress((prev) => ({
        ...prev,
        [blockKey]: {
          ...prev[blockKey],
          blockKey,
          completed: progress >= 100,
          timeSpent: prev[blockKey]?.timeSpent || 0,
        },
      }));

      if (progress > 0 && progress < 100) {
        trackBlockInteraction(blockKey, `progress:${progress}`);
      }
    },
    [trackBlockInteraction],
  );

  const overallProgress = calculateProgress();

  return (
    <div className="space-y-6">
      {/* INSPIRE Phase Indicator */}
      {showPhaseIndicator && (
        <div className="sticky top-0 z-10 bg-lxd-dark-page/95 backdrop-blur-xs py-4 -mx-4 px-4 border-b border-lxd-dark-surface">
          <PhaseIndicator currentPhase={inspirePhase} progress={overallProgress} showAllPhases />
        </div>
      )}

      {/* Progress bar */}
      <div className="bg-lxd-dark-surface rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-linear-to-r from-lxd-blue to-lxd-purple transition-all duration-500"
          style={{ width: `${overallProgress}%` }}
        />
      </div>

      {/* Content blocks */}
      <div className="space-y-8">
        {blocks.map((block, index) => (
          <div
            key={block._key}
            className="relative"
            data-block-index={index}
            data-block-type={block._type}
          >
            {/* Block indicator */}
            <div className="absolute -left-8 top-0 flex flex-col items-center">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  blockProgress[block._key]?.completed
                    ? 'bg-lxd-success text-lxd-dark-page'
                    : 'bg-lxd-dark-surface text-lxd-text-light-muted'
                }`}
              >
                {blockProgress[block._key]?.completed ? '✓' : index + 1}
              </div>
              {index < blocks.length - 1 && (
                <div className="w-0.5 h-full min-h-10 bg-lxd-dark-surface mt-2" />
              )}
            </div>

            {/* Render the content block */}
            {renderContentBlock(block, {
              id: block._key,
              onComplete: () => handleBlockComplete(block._key),
              onProgress: (progress) => handleBlockProgress(block._key, progress),
            })}
          </div>
        ))}
      </div>

      {/* Completion message */}
      {overallProgress >= 100 && (
        <div className="text-center py-8 bg-lxd-success/10 border border-lxd-success/30 rounded-lg">
          <div className="text-4xl mb-2">🎉</div>
          <h3 className="text-xl font-bold text-lxd-success">Lesson Complete!</h3>
          <p className="text-lxd-text-light-secondary mt-2">
            You&apos;ve completed all content in this lesson.
          </p>
        </div>
      )}
    </div>
  );
}
