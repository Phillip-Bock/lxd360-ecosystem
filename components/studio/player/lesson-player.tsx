'use client';

/**
 * =============================================================================
 * INSPIRE Studio - Lesson Player Component
 * =============================================================================
 *
 * Main container component for lesson playback. Handles keyboard navigation,
 * touch/swipe gestures, and coordinates slide rendering with controls.
 *
 * @module components/studio/player/lesson-player
 * @version 1.0.0
 */

import {
  type KeyboardEvent as ReactKeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { cn } from '@/lib/utils';
import { PlayerProvider, usePlayerContext } from '@/providers/player-provider';
import type { PlayerConfig, PlayerLesson } from '@/types/studio/player';
import { DebugOverlay } from './debug-overlay';
import { PlayerControls } from './player-controls';
import { ProgressBar } from './progress-bar';
import { SlideRenderer } from './slide-renderer';

// =============================================================================
// COMPONENT PROPS
// =============================================================================

interface LessonPlayerProps {
  lesson: PlayerLesson;
  config?: Partial<PlayerConfig>;
  className?: string;
  onReady?: () => void;
  onComplete?: () => void;
  onError?: (error: string) => void;
  onSlideChange?: (slideIndex: number, slideId: string) => void;
  autoSaveProgress?: boolean;
  saveProgressKey?: string;
}

// =============================================================================
// INNER PLAYER COMPONENT
// =============================================================================

function LessonPlayerInner({ className }: { className?: string }) {
  const player = usePlayerContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Touch handling for swipe navigation
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // Fullscreen handling (declared before handleKeyDown which uses them)
  const enterFullscreen = useCallback(() => {
    if (containerRef.current?.requestFullscreen) {
      containerRef.current.requestFullscreen();
    }
  }, []);

  const exitFullscreen = useCallback(() => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (isFullscreen) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  }, [isFullscreen, enterFullscreen, exitFullscreen]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent) => {
      if (!player.state.lesson?.settings.enableKeyboardNav) return;

      switch (event.key) {
        case 'ArrowRight':
        case 'PageDown':
          event.preventDefault();
          if (player.canGoNext) {
            player.nextSlide();
          }
          break;

        case 'ArrowLeft':
        case 'PageUp':
          event.preventDefault();
          if (player.canGoPrev) {
            player.prevSlide();
          }
          break;

        case 'Home':
          event.preventDefault();
          player.goToFirstSlide();
          break;

        case 'End':
          event.preventDefault();
          player.goToLastSlide();
          break;

        case ' ': // Space
          event.preventDefault();
          player.togglePlayPause();
          break;

        case 'f':
        case 'F':
          event.preventDefault();
          toggleFullscreen();
          break;

        case 'Escape':
          if (isFullscreen) {
            event.preventDefault();
            exitFullscreen();
          }
          break;
      }
    },
    [player, isFullscreen, toggleFullscreen, exitFullscreen],
  );

  // Touch handlers
  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    if (event.touches.length === 1) {
      touchStartRef.current = {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY,
      };
    }
  }, []);

  const handleTouchEnd = useCallback(
    (event: React.TouchEvent) => {
      if (!touchStartRef.current || !player.state.lesson?.settings.enableSwipeNav) {
        return;
      }

      const touch = event.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;

      // Only handle horizontal swipes (swipe distance > 50px, more horizontal than vertical)
      if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 0 && player.canGoPrev) {
          player.prevSlide();
        } else if (deltaX < 0 && player.canGoNext) {
          player.nextSlide();
        }
      }

      touchStartRef.current = null;
    },
    [player],
  );

  // Mouse wheel navigation
  const handleWheel = useCallback(
    (event: React.WheelEvent) => {
      if (!player.state.lesson?.settings.enableWheelNav) return;

      // Debounce wheel events
      const now = Date.now();
      const lastWheel =
        (containerRef.current as HTMLDivElement & { __lastWheel?: number })?.__lastWheel || 0;
      if (now - lastWheel < 500) return;
      if (containerRef.current) {
        (containerRef.current as HTMLDivElement & { __lastWheel?: number }).__lastWheel = now;
      }

      if (event.deltaY > 0 && player.canGoNext) {
        player.nextSlide();
      } else if (event.deltaY < 0 && player.canGoPrev) {
        player.prevSlide();
      }
    },
    [player],
  );

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Auto-hide controls
  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);

    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    if (player.isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [player.isPlaying]);

  const handleMouseMove = useCallback(() => {
    showControlsTemporarily();
  }, [showControlsTemporarily]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  // Get mode and config
  const mode = player.state.mode;
  const showProgress = player.state.lesson?.settings.showProgress ?? true;
  const showDebug = mode === 'preview' && player.state.debugInfo;

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative flex flex-col bg-black text-white',
        'focus:outline-none',
        isFullscreen ? 'fixed inset-0 z-50' : 'w-full h-full',
        className,
      )}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
      onMouseMove={handleMouseMove}
      role="application"
      aria-label="Lesson player"
    >
      {/* Slide Content */}
      <div className="relative flex-1 overflow-hidden">
        {player.currentSlide ? (
          <SlideRenderer
            slide={player.currentSlide}
            mode={mode}
            onBlockInteraction={(blockId, eventType, data) => {
              // Emit interaction event
              player.emit({
                type: 'triggerExecute',
                timestamp: Date.now(),
                data: { blockId, eventType, ...data },
              });
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No slide to display</p>
          </div>
        )}

        {/* Layer Overlays */}
        {player.state.lesson?.slides[player.state.currentSlideIndex]?.layers && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Layers would be rendered here */}
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {showProgress && (
        <div
          className={cn(
            'absolute top-0 left-0 right-0 z-10 transition-opacity duration-300',
            showControls ? 'opacity-100' : 'opacity-0',
          )}
        >
          <ProgressBar />
        </div>
      )}

      {/* Player Controls */}
      <div
        className={cn(
          'absolute bottom-0 left-0 right-0 z-10 transition-opacity duration-300',
          showControls ? 'opacity-100' : 'opacity-0',
        )}
      >
        <PlayerControls isFullscreen={isFullscreen} onToggleFullscreen={toggleFullscreen} />
      </div>

      {/* Debug Overlay (Preview Mode) */}
      {showDebug && (
        <div className="absolute top-4 right-4 z-20">
          <DebugOverlay />
        </div>
      )}

      {/* Error Display */}
      {player.state.error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-30">
          <div className="bg-destructive/20 border border-destructive rounded-lg p-6 max-w-md">
            <h3 className="text-lg font-semibold text-destructive mb-2">Playback Error</h3>
            <p className="text-sm text-muted-foreground">{player.state.error}</p>
            <button
              type="button"
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-sm hover:bg-primary/90"
              onClick={() => player.reset()}
            >
              Restart
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {player.isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-30">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// MAIN EXPORT
// =============================================================================

export function LessonPlayer({
  lesson,
  config,
  className,
  onReady,
  onComplete,
  onError,
  onSlideChange,
  autoSaveProgress,
  saveProgressKey,
}: LessonPlayerProps) {
  return (
    <PlayerProvider
      lesson={lesson}
      config={config}
      onReady={onReady}
      onComplete={onComplete}
      onError={onError}
      onSlideChange={onSlideChange}
      autoSaveProgress={autoSaveProgress}
      saveProgressKey={saveProgressKey}
    >
      <LessonPlayerInner className={className} />
    </PlayerProvider>
  );
}

export default LessonPlayer;
