'use client';

import {
  AlertTriangle,
  FileText,
  Grid3X3,
  Info,
  MapPin,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Video,
} from 'lucide-react';
import NextImage from 'next/image';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  type DocumentHotspot,
  type Hotspot,
  hotspotColors,
  type InfoHotspot,
  type PanoramaTourConfig,
  type VideoHotspot,
  type WarningHotspot,
} from './hotspot-types';
import { PanoramaBlock } from './panorama-block';

interface PanoramaTourProps {
  tour: PanoramaTourConfig;
  onComplete?: () => void;
  onSceneChange?: (sceneId: string) => void;
  className?: string;
}

export function PanoramaTour({
  tour,
  onComplete,
  onSceneChange,
  className = '',
}: PanoramaTourProps): React.JSX.Element {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(() => {
    const startIndex = tour.scenes.findIndex((s) => s.id === tour.startSceneId);
    return startIndex >= 0 ? startIndex : 0;
  });
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [showSceneGrid, setShowSceneGrid] = useState(false);
  const [showHotspotModal, setShowHotspotModal] = useState(false);
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);
  const [visitedScenes, setVisitedScenes] = useState<Set<string>>(new Set([tour.startSceneId]));
  const [isTransitioning, setIsTransitioning] = useState(false);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const navigateToSceneRef = useRef<((index: number) => void) | null>(null);

  const currentScene = tour.scenes[currentSceneIndex];
  const progress = (visitedScenes.size / tour.scenes.length) * 100;

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlaying && !isTransitioning) {
      autoPlayTimerRef.current = setTimeout(() => {
        if (currentSceneIndex < tour.scenes.length - 1) {
          navigateToSceneRef.current?.(currentSceneIndex + 1);
        } else {
          setIsAutoPlaying(false);
          onComplete?.();
        }
      }, 10000); // 10 seconds per scene
    }

    return () => {
      if (autoPlayTimerRef.current) {
        clearTimeout(autoPlayTimerRef.current);
      }
    };
  }, [isAutoPlaying, currentSceneIndex, isTransitioning, tour.scenes.length, onComplete]);

  const navigateToScene = useCallback(
    (index: number): void => {
      if (index < 0 || index >= tour.scenes.length) return;
      if (isTransitioning) return;

      setIsTransitioning(true);

      // Fade transition effect
      setTimeout((): void => {
        setCurrentSceneIndex(index);
        setVisitedScenes((prev) => new Set([...prev, tour.scenes[index].id]));
        onSceneChange?.(tour.scenes[index].id);
        setIsTransitioning(false);
      }, tour.fadeDuration || 500);
    },
    [tour.scenes, tour.fadeDuration, onSceneChange, isTransitioning],
  );

  // Update ref whenever navigateToScene changes
  navigateToSceneRef.current = navigateToScene;

  const navigateToSceneById = useCallback(
    (sceneId: string): void => {
      const index = tour.scenes.findIndex((s) => s.id === sceneId);
      if (index >= 0) {
        navigateToScene(index);
      }
    },
    [tour.scenes, navigateToScene],
  );

  const handleHotspotClick = useCallback((hotspot: Hotspot): void => {
    if (hotspot.type === 'scene') return; // Handled by onSceneNavigate

    setActiveHotspot(hotspot);
    setShowHotspotModal(true);
  }, []);

  const goToPrevious = (): void => {
    if (currentSceneIndex > 0) {
      navigateToScene(currentSceneIndex - 1);
    }
  };

  const goToNext = (): void => {
    if (currentSceneIndex < tour.scenes.length - 1) {
      navigateToScene(currentSceneIndex + 1);
    } else {
      onComplete?.();
    }
  };

  const toggleAutoPlay = (): void => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  const renderHotspotContent = (): React.JSX.Element | null => {
    if (!activeHotspot) return null;

    switch (activeHotspot.type) {
      case 'info': {
        const infoHotspot = activeHotspot as InfoHotspot;
        return (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: hotspotColors.info }}
              >
                <Info className="w-5 h-5 text-brand-primary" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-brand-primary">{infoHotspot.title}</h4>
                <p className="text-brand-muted mt-2 whitespace-pre-wrap">{infoHotspot.content}</p>
              </div>
            </div>
            {infoHotspot.image && (
              <div className="rounded-lg overflow-hidden">
                <NextImage
                  src={infoHotspot.image}
                  alt={infoHotspot.title}
                  width={800}
                  height={600}
                  className="w-full h-auto"
                  unoptimized
                />
              </div>
            )}
          </div>
        );
      }

      case 'video': {
        const videoHotspot = activeHotspot as VideoHotspot;
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: hotspotColors.video }}
              >
                <Video className="w-5 h-5 text-brand-primary" />
              </div>
              <h4 className="text-lg font-semibold text-brand-primary">{videoHotspot.title}</h4>
            </div>
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <video
                src={videoHotspot.videoUrl}
                controls
                autoPlay={videoHotspot.autoplay}
                className="w-full h-full"
              >
                <track kind="captions" srcLang="en" label="English captions" />
              </video>
            </div>
          </div>
        );
      }

      case 'document': {
        const docHotspot = activeHotspot as DocumentHotspot;
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: hotspotColors.document }}
              >
                <FileText className="w-5 h-5 text-brand-primary" />
              </div>
              <h4 className="text-lg font-semibold text-brand-primary">{docHotspot.title}</h4>
            </div>
            <div className="p-4 bg-(--lxd-blue-light)/30 rounded-lg border border-(--lxd-blue-light)">
              <p className="text-brand-muted mb-4">
                {docHotspot.documentType === 'pdf' ? 'PDF Document' : 'Document'}
              </p>
              <Button
                onClick={(): void => {
                  window.open(docHotspot.documentUrl, '_blank');
                }}
                className="bg-(--brand-primary) hover:bg-(--brand-primary)/80"
              >
                <FileText className="w-4 h-4 mr-2" />
                Open Document
              </Button>
            </div>
          </div>
        );
      }

      case 'warning': {
        const warningHotspot = activeHotspot as WarningHotspot;
        const severityColors = {
          low: 'border-brand-warning bg-brand-warning/10',
          medium: 'border-orange-500 bg-brand-warning/10',
          high: 'border-brand-error bg-brand-error/10',
          critical: 'border-red-700 bg-red-700/20',
        };
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: hotspotColors.warning }}
              >
                <AlertTriangle className="w-5 h-5 text-brand-primary" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-brand-primary">{warningHotspot.title}</h4>
                <Badge className={`mt-1 ${severityColors[warningHotspot.severity]}`}>
                  {warningHotspot.severity.toUpperCase()}
                </Badge>
              </div>
            </div>
            <div className={`p-4 rounded-lg border ${severityColors[warningHotspot.severity]}`}>
              <p className="text-brand-primary whitespace-pre-wrap">{warningHotspot.content}</p>
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Main Panorama View */}
      <div
        className={`transition-opacity duration-500 ${
          isTransitioning ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <PanoramaBlock
          scene={currentScene}
          onHotspotClick={handleHotspotClick}
          onSceneNavigate={navigateToSceneById}
          autoRotate={tour.autoRotate && !showSceneGrid}
          autoRotateSpeed={tour.autoRotateSpeed}
          showCompass={tour.showCompass}
          showControls={tour.showControls}
          enableVR={tour.enableVR}
        />
      </div>

      {/* Tour Navigation Overlay */}
      <Card className="absolute bottom-4 left-4 right-4 bg-(--lxd-blue-dark-700)/95 border-(--lxd-blue-light) backdrop-blur-xs">
        {/* Progress Bar */}
        <div className="px-4 pt-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-brand-muted">Tour Progress</span>
            <span className="text-xs text-(--color-lxd-success)">
              {visitedScenes.size} / {tour.scenes.length} scenes
            </span>
          </div>
          <Progress value={progress} className="h-1" />
        </div>

        {/* Controls */}
        <div className="p-3 flex items-center justify-between">
          {/* Scene Info */}
          <div className="flex items-center gap-3">
            <Button
              size="icon"
              variant="outline"
              onClick={(): void => setShowSceneGrid(true)}
              className="border-(--lxd-blue-light) text-brand-primary hover:bg-(--lxd-blue-light)"
              title="View all scenes"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <div>
              <p className="text-sm text-brand-primary font-medium">{currentScene.name}</p>
              <p className="text-xs text-brand-muted">
                Scene {currentSceneIndex + 1} of {tour.scenes.length}
              </p>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={goToPrevious}
              disabled={currentSceneIndex === 0 || isTransitioning}
              className="text-brand-primary hover:bg-(--lxd-blue-light) disabled:opacity-50"
            >
              <SkipBack className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              onClick={toggleAutoPlay}
              className={`border-(--lxd-blue-light) ${
                isAutoPlaying
                  ? 'bg-(--color-lxd-success) text-brand-primary'
                  : 'text-brand-primary hover:bg-(--lxd-blue-light)'
              }`}
            >
              {isAutoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={goToNext}
              disabled={isTransitioning}
              className="text-brand-primary hover:bg-(--lxd-blue-light) disabled:opacity-50"
            >
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>

          {/* Scene Dots */}
          <div className="flex items-center gap-1.5">
            {tour.scenes.map((scene, index) => (
              <button
                type="button"
                key={scene.id}
                onClick={(): void => navigateToScene(index)}
                disabled={isTransitioning}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  index === currentSceneIndex
                    ? 'bg-(--brand-primary) scale-125'
                    : visitedScenes.has(scene.id)
                      ? 'bg-(--color-lxd-success)'
                      : 'bg-(--lxd-blue-light) hover:bg-gray-500 dark:hover:bg-gray-400'
                }`}
                title={scene.name}
              />
            ))}
          </div>
        </div>
      </Card>

      {/* Scene Grid Modal */}
      <Dialog open={showSceneGrid} onOpenChange={setShowSceneGrid}>
        <DialogContent className="max-w-4xl bg-(--lxd-blue-dark-700) border-(--lxd-blue-light)">
          <DialogHeader>
            <DialogTitle className="text-brand-primary flex items-center gap-2">
              <MapPin className="w-5 h-5 text-(--brand-primary)" />
              {tour.name}
            </DialogTitle>
          </DialogHeader>
          {tour.description && <p className="text-brand-muted text-sm">{tour.description}</p>}
          <ScrollArea className="h-[500px]">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-1">
              {tour.scenes.map((scene, index) => (
                <Card
                  key={scene.id}
                  className={`overflow-hidden cursor-pointer transition-all hover:ring-2 hover:ring-(--brand-primary) ${
                    index === currentSceneIndex
                      ? 'ring-2 ring-(--brand-primary)'
                      : 'border-(--lxd-blue-light)'
                  }`}
                  onClick={(): void => {
                    navigateToScene(index);
                    setShowSceneGrid(false);
                  }}
                >
                  <div className="aspect-video bg-(--lxd-blue-light) relative">
                    {scene.thumbnail ? (
                      <NextImage
                        src={scene.thumbnail}
                        alt={scene.name}
                        width={400}
                        height={225}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <MapPin className="w-8 h-8 text-brand-muted" />
                      </div>
                    )}
                    {visitedScenes.has(scene.id) && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-(--color-lxd-success) text-brand-primary text-xs">
                          Visited
                        </Badge>
                      </div>
                    )}
                    {index === currentSceneIndex && (
                      <div className="absolute inset-0 bg-(--brand-primary)/20 flex items-center justify-center">
                        <Badge className="bg-(--brand-primary)">Current</Badge>
                      </div>
                    )}
                  </div>
                  <div className="p-3 bg-(--lxd-blue-dark-700)">
                    <h4 className="text-sm font-medium text-brand-primary truncate">
                      {scene.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant="outline"
                        className="text-xs border-(--lxd-blue-light) text-brand-muted"
                      >
                        {scene.hotspots.length} hotspots
                      </Badge>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Hotspot Content Modal */}
      <Dialog open={showHotspotModal} onOpenChange={setShowHotspotModal}>
        <DialogContent className="max-w-lg bg-(--lxd-blue-dark-700) border-(--lxd-blue-light)">
          <DialogHeader>
            <DialogTitle className="text-brand-primary sr-only">Hotspot Details</DialogTitle>
          </DialogHeader>
          {renderHotspotContent()}
        </DialogContent>
      </Dialog>

      {/* Transition Overlay */}
      {isTransitioning && (
        <div className="absolute inset-0 bg-(--lxd-blue-dark-700) flex items-center justify-center z-50 animate-pulse">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-(--brand-primary) border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-brand-muted mt-4">Loading next scene...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default PanoramaTour;
