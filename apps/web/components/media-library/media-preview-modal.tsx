'use client';

import {
  Box,
  ChevronLeft,
  ChevronRight,
  Download,
  File,
  FileText,
  Film,
  Image as ImageIcon,
  type LucideIcon,
  Maximize2,
  Minimize2,
  Music,
  Pause,
  Play,
  RotateCw,
  Volume2,
  VolumeX,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { formatDuration, type MediaAsset, type MediaAssetType } from '@/types/media-library';

interface MediaPreviewModalProps {
  asset: MediaAsset;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}

const TYPE_ICONS: Record<MediaAssetType, LucideIcon> = {
  image: ImageIcon,
  video: Film,
  audio: Music,
  document: FileText,
  '3d': Box,
  other: File,
};

export function MediaPreviewModal({
  asset,
  onClose,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}: MediaPreviewModalProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const TypeIcon = TYPE_ICONS[asset.type];

  // Video/Audio controls
  const togglePlayPause = useCallback(() => {
    const media = videoRef.current || audioRef.current;
    if (!media) return;

    if (media.paused) {
      media.play();
      setIsPlaying(true);
    } else {
      media.pause();
      setIsPlaying(false);
    }
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          if (hasPrev) onPrev();
          break;
        case 'ArrowRight':
          if (hasNext) onNext();
          break;
        case '+':
        case '=':
          setZoom((z) => Math.min(z + 0.25, 5));
          break;
        case '-':
          setZoom((z) => Math.max(z - 0.25, 0.25));
          break;
        case 'r':
          setRotation((r) => (r + 90) % 360);
          break;
        case ' ':
          e.preventDefault();
          if (asset.type === 'video' || asset.type === 'audio') {
            togglePlayPause();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onPrev, onNext, hasPrev, hasNext, asset.type, togglePlayPause]);

  // Reset state when asset changes
  useEffect(() => {
    setZoom(1);
    setRotation(0);
    setIsPlaying(false);
    setCurrentTime(0);
  }, []);

  // Fullscreen handling
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleMute = useCallback(() => {
    const media = videoRef.current || audioRef.current;
    if (!media) return;

    media.muted = !media.muted;
    setIsMuted(!isMuted);
  }, [isMuted]);

  const handleSeek = useCallback((value: number[]) => {
    const media = videoRef.current || audioRef.current;
    if (!media) return;

    media.currentTime = value[0];
    setCurrentTime(value[0]);
  }, []);

  const handleTimeUpdate = useCallback(() => {
    const media = videoRef.current || audioRef.current;
    if (!media) return;

    setCurrentTime(media.currentTime);
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    const media = videoRef.current || audioRef.current;
    if (!media) return;

    setDuration(media.duration);
  }, []);

  const handleMediaEnded = useCallback(() => {
    setIsPlaying(false);
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 z-50 bg-black/95 flex flex-col">
      {/* Backdrop button for click-outside */}
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-transparent border-none -z-10"
        onClick={onClose}
        aria-label="Close preview"
        tabIndex={-1}
      />
      {/* Header */}
      <div className="flex items-center justify-between p-4 shrink-0">
        <div className="flex items-center gap-3">
          <TypeIcon className="w-5 h-5 text-brand-primary/70" />
          <span className="text-brand-primary font-medium">{asset.title}</span>
        </div>

        <div className="flex items-center gap-2">
          {asset.type === 'image' && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="text-brand-primary/70 hover:text-brand-primary hover:bg-brand-surface/10"
                onClick={() => setZoom((z) => Math.max(z - 0.25, 0.25))}
              >
                <ZoomOut className="w-5 h-5" />
              </Button>
              <span className="text-brand-primary/70 text-sm w-12 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="text-brand-primary/70 hover:text-brand-primary hover:bg-brand-surface/10"
                onClick={() => setZoom((z) => Math.min(z + 0.25, 5))}
              >
                <ZoomIn className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-brand-primary/70 hover:text-brand-primary hover:bg-brand-surface/10"
                onClick={() => setRotation((r) => (r + 90) % 360)}
              >
                <RotateCw className="w-5 h-5" />
              </Button>
              <div className="w-px h-6 bg-brand-surface/20 mx-2" />
            </>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="text-brand-primary/70 hover:text-brand-primary hover:bg-brand-surface/10"
            onClick={() => window.open(asset.url, '_blank')}
          >
            <Download className="w-5 h-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="text-brand-primary/70 hover:text-brand-primary hover:bg-brand-surface/10"
            onClick={toggleFullscreen}
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="text-brand-primary/70 hover:text-brand-primary hover:bg-brand-surface/10"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
        {/* Previous button */}
        <button
          type="button"
          onClick={onPrev}
          disabled={!hasPrev}
          className={cn(
            'absolute left-4 z-10 p-2 rounded-full bg-black/50 text-brand-primary transition-all',
            hasPrev ? 'hover:bg-black/70 cursor-pointer' : 'opacity-30 cursor-not-allowed',
          )}
        >
          <ChevronLeft className="w-8 h-8" />
        </button>

        {/* Next button */}
        <button
          type="button"
          onClick={onNext}
          disabled={!hasNext}
          className={cn(
            'absolute right-4 z-10 p-2 rounded-full bg-black/50 text-brand-primary transition-all',
            hasNext ? 'hover:bg-black/70 cursor-pointer' : 'opacity-30 cursor-not-allowed',
          )}
        >
          <ChevronRight className="w-8 h-8" />
        </button>

        {/* Image Preview */}
        {asset.type === 'image' && asset.thumbnailUrl && (
          <div
            className="relative transition-transform duration-200"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
            }}
          >
            <Image
              src={asset.url || asset.thumbnailUrl}
              alt={asset.altText || asset.title}
              width={asset.width || 800}
              height={asset.height || 600}
              className="max-h-[80vh] w-auto object-contain"
              priority
            />
          </div>
        )}

        {/* Video Preview */}
        {asset.type === 'video' && (
          <div className="relative max-w-full max-h-[80vh]">
            <video
              ref={videoRef}
              src={asset.url}
              className="max-h-[80vh] max-w-full"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={handleMediaEnded}
              onClick={togglePlayPause}
            >
              <track kind="captions" srcLang="en" label="English captions" />
            </video>

            {/* Play overlay */}
            {!isPlaying && (
              <button
                type="button"
                onClick={togglePlayPause}
                className="absolute inset-0 flex items-center justify-center bg-black/30"
              >
                <div className="p-4 rounded-full bg-brand-surface/90">
                  <Play className="w-12 h-12 text-foreground" fill="currentColor" />
                </div>
              </button>
            )}
          </div>
        )}

        {/* Audio Preview */}
        {asset.type === 'audio' && (
          <div className="bg-card rounded-xl p-8 max-w-md w-full">
            <audio
              ref={audioRef}
              src={asset.url}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={handleMediaEnded}
            >
              <track kind="captions" srcLang="en" label="English captions" />
            </audio>

            <div className="flex flex-col items-center gap-6">
              <div className="w-32 h-32 rounded-full bg-linear-to-br from-primary to-primary/50 flex items-center justify-center">
                <Music className="w-16 h-16 text-primary-foreground" />
              </div>

              <div className="text-center">
                <h3 className="text-lg font-semibold text-foreground">{asset.title}</h3>
                {asset.description && (
                  <p className="text-sm text-muted-foreground mt-1">{asset.description}</p>
                )}
              </div>

              <div className="w-full space-y-2">
                <Slider
                  value={[currentTime]}
                  min={0}
                  max={duration || 100}
                  step={0.1}
                  onValueChange={handleSeek}
                  className="cursor-pointer"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatDuration(currentTime)}</span>
                  <span>{formatDuration(duration)}</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={toggleMute}>
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </Button>

                <Button size="lg" className="rounded-full w-14 h-14" onClick={togglePlayPause}>
                  {isPlaying ? (
                    <Pause className="w-6 h-6" fill="currentColor" />
                  ) : (
                    <Play className="w-6 h-6" fill="currentColor" />
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => window.open(asset.url, '_blank')}
                >
                  <Download className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Document Preview */}
        {asset.type === 'document' && (
          <div className="bg-card rounded-xl p-8 max-w-md w-full text-center">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <FileText className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">{asset.title}</h3>
            <p className="text-sm text-muted-foreground mb-6">{asset.mimeType}</p>
            <Button onClick={() => window.open(asset.url, '_blank')} className="gap-2">
              <Download className="w-4 h-4" />
              Download to View
            </Button>
          </div>
        )}

        {/* 3D Preview */}
        {asset.type === '3d' && (
          <div className="bg-card rounded-xl p-8 max-w-md w-full text-center">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Box className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">{asset.title}</h3>
            <p className="text-sm text-muted-foreground mb-6">3D Model Viewer Coming Soon</p>
            <Button onClick={() => window.open(asset.url, '_blank')} className="gap-2">
              <Download className="w-4 h-4" />
              Download Model
            </Button>
          </div>
        )}

        {/* Fallback */}
        {(asset.type === 'other' || (!asset.thumbnailUrl && asset.type === 'image')) && (
          <div className="bg-card rounded-xl p-8 max-w-md w-full text-center">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <File className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">{asset.title}</h3>
            <p className="text-sm text-muted-foreground mb-6">{asset.mimeType}</p>
            <Button onClick={() => window.open(asset.url, '_blank')} className="gap-2">
              <Download className="w-4 h-4" />
              Download File
            </Button>
          </div>
        )}
      </div>

      {/* Video Controls */}
      {asset.type === 'video' && (
        <div className="p-4 shrink-0">
          <div className="max-w-3xl mx-auto space-y-2">
            <Slider
              value={[currentTime]}
              min={0}
              max={duration || 100}
              step={0.1}
              onValueChange={handleSeek}
              className="cursor-pointer"
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-brand-primary/70 hover:text-brand-primary hover:bg-brand-surface/10"
                  onClick={togglePlayPause}
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="text-brand-primary/70 hover:text-brand-primary hover:bg-brand-surface/10"
                  onClick={toggleMute}
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </Button>

                <span className="text-brand-primary/70 text-sm">
                  {formatDuration(currentTime)} / {formatDuration(duration)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
