'use client';

import { ChevronLeft, ChevronRight, Pause, Play, SkipBack, SkipForward } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { createTourSequencer, type TourStop } from '../spatial-utils';
import type { Hotspot, ThreeSixtyScene, TourState, Vector3 } from './types';

// =============================================================================
// Types
// =============================================================================

interface GuidedTourEngineProps {
  scene: ThreeSixtyScene;
  onPositionChange: (position: Vector3) => void;
  onStopReached: (hotspot: Hotspot | null, index: number) => void;
  onTourComplete: () => void;
  autoStart?: boolean;
  autoAdvance?: boolean;
  autoAdvanceDelay?: number;
  className?: string;
}

// =============================================================================
// Component
// =============================================================================

/**
 * GuidedTourEngine - Controls for guided tour playback through hotspots
 */
export function GuidedTourEngine({
  scene,
  onPositionChange,
  onStopReached,
  onTourComplete,
  autoStart = false,
  autoAdvance = true,
  autoAdvanceDelay = 5000,
  className,
}: GuidedTourEngineProps) {
  const [tourState, setTourState] = useState<TourState>({
    isPlaying: false,
    currentStopIndex: 0,
    totalStops: 0,
    autoAdvance,
    autoAdvanceDelay,
  });

  // Build tour stops from scene hotspots
  const tourStops = useMemo((): TourStop[] => {
    if (!scene.tourSequence || scene.tourSequence.length === 0) {
      // Use all hotspots in order if no sequence defined
      return scene.hotspots.map((hotspot) => ({
        id: hotspot.id,
        position: hotspot.position,
        duration: 2000, // Default 2s transition
        dwellTime: autoAdvanceDelay,
      }));
    }

    // Use defined sequence
    const stops: TourStop[] = [];
    for (const hotspotId of scene.tourSequence) {
      const hotspot = scene.hotspots.find((h) => h.id === hotspotId);
      if (hotspot) {
        stops.push({
          id: hotspot.id,
          position: hotspot.position,
          duration: 2000,
          dwellTime: autoAdvanceDelay,
        });
      }
    }
    return stops;
  }, [scene.hotspots, scene.tourSequence, autoAdvanceDelay]);

  // Create sequencer
  const sequencerRef = useMemo(() => {
    if (tourStops.length === 0) return null;

    return createTourSequencer({
      stops: tourStops,
      onPositionUpdate: onPositionChange,
      onStopReached: (stop, index) => {
        const hotspot = scene.hotspots.find((h) => h.id === stop.id) ?? null;
        setTourState((prev) => ({ ...prev, currentStopIndex: index }));
        onStopReached(hotspot, index);
      },
      onTourComplete: () => {
        setTourState((prev) => ({ ...prev, isPlaying: false }));
        onTourComplete();
      },
      autoAdvance,
    });
  }, [tourStops, scene.hotspots, autoAdvance, onPositionChange, onStopReached, onTourComplete]);

  // Update total stops
  useEffect(() => {
    setTourState((prev) => ({ ...prev, totalStops: tourStops.length }));
  }, [tourStops.length]);

  // Auto-start
  useEffect(() => {
    if (autoStart && sequencerRef && !tourState.isPlaying) {
      sequencerRef.play();
      setTourState((prev) => ({ ...prev, isPlaying: true }));
    }
  }, [autoStart, sequencerRef, tourState.isPlaying]);

  // Control handlers
  const handlePlayPause = useCallback(() => {
    if (!sequencerRef) return;

    if (tourState.isPlaying) {
      sequencerRef.pause();
      setTourState((prev) => ({ ...prev, isPlaying: false }));
    } else {
      sequencerRef.play();
      setTourState((prev) => ({ ...prev, isPlaying: true }));
    }
  }, [sequencerRef, tourState.isPlaying]);

  const handleNext = useCallback(() => {
    sequencerRef?.next();
  }, [sequencerRef]);

  const handlePrevious = useCallback(() => {
    sequencerRef?.previous();
  }, [sequencerRef]);

  const handleRestart = useCallback(() => {
    if (!sequencerRef) return;
    sequencerRef.stop();
    sequencerRef.play();
    setTourState((prev) => ({
      ...prev,
      isPlaying: true,
      currentStopIndex: 0,
    }));
  }, [sequencerRef]);

  const handleSkipToEnd = useCallback(() => {
    if (!sequencerRef || tourStops.length === 0) return;
    sequencerRef.goToStop(tourStops.length - 1);
  }, [sequencerRef, tourStops.length]);

  // Calculate progress
  const progress =
    tourState.totalStops > 0 ? ((tourState.currentStopIndex + 1) / tourState.totalStops) * 100 : 0;

  // Get current hotspot info
  const currentHotspot = useMemo(() => {
    if (tourStops.length === 0) return null;
    const currentStop = tourStops[tourState.currentStopIndex];
    if (!currentStop) return null;
    return scene.hotspots.find((h) => h.id === currentStop.id) ?? null;
  }, [tourStops, tourState.currentStopIndex, scene.hotspots]);

  if (tourStops.length === 0) {
    return (
      <div className={cn('bg-black/50 backdrop-blur rounded-lg p-3', className)}>
        <p className="text-sm text-white/70 text-center">
          No tour stops defined. Add hotspots to create a guided tour.
        </p>
      </div>
    );
  }

  return (
    <div className={cn('bg-black/50 backdrop-blur rounded-lg', className)}>
      {/* Current stop info */}
      {currentHotspot && (
        <div className="px-4 py-3 border-b border-white/10">
          <p className="text-sm font-medium text-white">
            {currentHotspot.label || `Stop ${tourState.currentStopIndex + 1}`}
          </p>
          {currentHotspot.description && (
            <p className="text-xs text-white/70 mt-1 line-clamp-2">{currentHotspot.description}</p>
          )}
        </div>
      )}

      {/* Progress bar */}
      <div className="px-4 py-2">
        <Progress value={progress} className="h-1" />
        <div className="flex justify-between mt-1">
          <span className="text-xs text-white/50">
            {tourState.currentStopIndex + 1} / {tourState.totalStops}
          </span>
          <span className="text-xs text-white/50">{Math.round(progress)}%</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-1 px-4 py-3">
        {/* Restart */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleRestart}
          className="h-8 w-8 text-white hover:bg-white/20"
          title="Restart tour"
        >
          <SkipBack className="h-4 w-4" />
        </Button>

        {/* Previous */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handlePrevious}
          disabled={tourState.currentStopIndex === 0}
          className="h-8 w-8 text-white hover:bg-white/20 disabled:opacity-30"
          title="Previous stop"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        {/* Play/Pause */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handlePlayPause}
          className="h-10 w-10 text-white hover:bg-white/20 bg-white/10 rounded-full"
          title={tourState.isPlaying ? 'Pause' : 'Play'}
        >
          {tourState.isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5 ml-0.5" />
          )}
        </Button>

        {/* Next */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleNext}
          disabled={tourState.currentStopIndex === tourState.totalStops - 1}
          className="h-8 w-8 text-white hover:bg-white/20 disabled:opacity-30"
          title="Next stop"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>

        {/* Skip to end */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleSkipToEnd}
          className="h-8 w-8 text-white hover:bg-white/20"
          title="Skip to end"
        >
          <SkipForward className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default GuidedTourEngine;
