'use client';

/**
 * VideoBlock - Video player with controls and captions
 */

import { CheckCircle, PlayCircle, Video } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import type { VideoConfig, VideoContent } from '@/types/blocks';
import { BlockWrapper } from '../block-wrapper';

interface VideoBlockProps {
  id: string;
  content: VideoContent;
  config: VideoConfig;
  isSelected?: boolean;
  isEditing?: boolean;
  onSelect?: () => void;
  onContentChange?: (content: VideoContent) => void;
  onStartEditing?: () => void;
  onStopEditing?: () => void;
  onXAPIEvent?: (verb: string, data?: Record<string, unknown>) => void;
}

export function VideoBlock({
  id,
  content,
  config,
  isSelected = false,
  isEditing = false,
  onSelect,
  onContentChange,
  onStartEditing,
  onXAPIEvent,
}: VideoBlockProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [watchedPercentage, setWatchedPercentage] = useState(0);
  const lastPositionRef = useRef<number>(0);
  const watchSegmentsRef = useRef<Array<{ start: number; end: number }>>([]);
  const currentSegmentStartRef = useRef<number | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const percentage = (video.currentTime / video.duration) * 100;
      setWatchedPercentage(Math.max(watchedPercentage, percentage));
      lastPositionRef.current = video.currentTime;
    };

    const handlePlay = () => {
      setIsPlaying(true);
      currentSegmentStartRef.current = video.currentTime;
      onXAPIEvent?.('played', {
        currentTime: video.currentTime,
        duration: video.duration || 0,
        progress: video.duration ? video.currentTime / video.duration : 0,
      });
    };

    const handlePause = () => {
      setIsPlaying(false);
      // Record the watched segment
      if (currentSegmentStartRef.current !== null) {
        watchSegmentsRef.current.push({
          start: currentSegmentStartRef.current,
          end: video.currentTime,
        });
        currentSegmentStartRef.current = null;
      }
      onXAPIEvent?.('paused', {
        currentTime: video.currentTime,
        duration: video.duration || 0,
        progress: video.duration ? video.currentTime / video.duration : 0,
      });
    };

    const handleEnded = () => {
      setIsPlaying(false);
      // Record final segment
      if (currentSegmentStartRef.current !== null) {
        watchSegmentsRef.current.push({
          start: currentSegmentStartRef.current,
          end: video.duration,
        });
        currentSegmentStartRef.current = null;
      }
      // Calculate unique watch time
      const uniqueWatchTime = calculateUniqueWatchTime(watchSegmentsRef.current);
      const progress = video.duration ? Math.min(1, uniqueWatchTime / video.duration) : 1;
      onXAPIEvent?.('completed', {
        duration: video.duration || 0,
        watchedDuration: uniqueWatchTime,
        progress,
        completed: progress >= (config.requiredWatchPercentage || 80) / 100,
      });
    };

    const handleSeeked = () => {
      const fromTime = lastPositionRef.current;
      const toTime = video.currentTime;
      // End current segment and start new one if playing
      if (currentSegmentStartRef.current !== null) {
        watchSegmentsRef.current.push({
          start: currentSegmentStartRef.current,
          end: fromTime,
        });
        currentSegmentStartRef.current = toTime;
      }
      onXAPIEvent?.('seeked', {
        fromTime,
        toTime,
        duration: video.duration || 0,
      });
      lastPositionRef.current = toTime;
    };

    // Helper to calculate unique watch time from segments
    function calculateUniqueWatchTime(segments: Array<{ start: number; end: number }>): number {
      if (segments.length === 0) return 0;
      const sorted = [...segments].sort((a, b) => a.start - b.start);
      const merged: Array<{ start: number; end: number }> = [sorted[0]];
      for (let i = 1; i < sorted.length; i++) {
        const current = sorted[i];
        const last = merged[merged.length - 1];
        if (current.start <= last.end) {
          last.end = Math.max(last.end, current.end);
        } else {
          merged.push(current);
        }
      }
      return merged.reduce((total, seg) => total + (seg.end - seg.start), 0);
    }

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('seeked', handleSeeked);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('seeked', handleSeeked);
    };
  }, [onXAPIEvent, watchedPercentage, config.requiredWatchPercentage]);

  const getEmbedUrl = () => {
    if (content.provider === 'youtube') {
      const videoId = content.src.match(
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/,
      )?.[1];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
    }
    if (content.provider === 'vimeo') {
      const videoId = content.src.match(/vimeo\.com\/(\d+)/)?.[1];
      return videoId ? `https://player.vimeo.com/video/${videoId}` : '';
    }
    if (content.provider === 'loom') {
      const videoId = content.src.match(/loom\.com\/share\/([^?]+)/)?.[1];
      return videoId ? `https://www.loom.com/embed/${videoId}` : '';
    }
    return '';
  };

  const isEmbed = content.provider !== 'upload';
  const embedUrl = getEmbedUrl();

  return (
    <BlockWrapper
      id={id}
      type="Video"
      isSelected={isSelected}
      isEditing={isEditing}
      onClick={onSelect}
      onDoubleClick={onStartEditing}
    >
      <div className="relative">
        {content.src ? (
          isEmbed ? (
            // Embed player (YouTube, Vimeo, Loom)
            <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
              {embedUrl ? (
                <iframe
                  src={embedUrl}
                  title={content.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                  Invalid video URL
                </div>
              )}
            </div>
          ) : (
            // Native video player
            <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
              <video
                ref={videoRef}
                src={content.src}
                poster={content.poster}
                controls={config.controls}
                autoPlay={config.autoplay}
                loop={config.loop}
                muted={config.muted || config.autoplay}
                className="w-full h-full object-contain"
              >
                {content.captions?.map((track) => (
                  <track
                    key={track.language}
                    kind="captions"
                    src={track.src}
                    srcLang={track.language}
                    label={track.label}
                    default={track.default}
                  />
                ))}
              </video>

              {/* Custom play overlay (if controls hidden) */}
              {!config.controls && !isPlaying && (
                <button
                  type="button"
                  onClick={() => videoRef.current?.play()}
                  className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors"
                >
                  <PlayCircle className="w-20 h-20 text-white" />
                </button>
              )}
            </div>
          )
        ) : (
          // Empty state
          <button
            type="button"
            onClick={() => isEditing && onStartEditing?.()}
            className={cn(
              'flex flex-col items-center justify-center py-16 w-full',
              'bg-card/50 border-2 border-dashed border-border rounded-lg',
              isEditing && 'cursor-pointer hover:border-cyan-500 hover:bg-card/80',
            )}
            disabled={!isEditing}
          >
            <Video className="w-12 h-12 text-muted-foreground mb-2" />
            <p className="text-muted-foreground text-sm">
              {isEditing ? 'Click to add video' : 'No video selected'}
            </p>
          </button>
        )}

        {/* Progress indicator for required videos */}
        {config.required && content.src && !isEmbed && (
          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <div className="flex-1 h-1 bg-border rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full transition-all',
                  watchedPercentage >= (config.requiredWatchPercentage || 80)
                    ? 'bg-green-500'
                    : 'bg-cyan-500',
                )}
                style={{ width: `${watchedPercentage}%` }}
              />
            </div>
            <span className="flex items-center gap-1">
              {watchedPercentage >= (config.requiredWatchPercentage || 80) ? (
                <>
                  <CheckCircle className="h-4 w-4 inline" /> Complete
                </>
              ) : (
                `${Math.round(watchedPercentage)}% watched`
              )}
            </span>
          </div>
        )}

        {/* Editor panel */}
        {isEditing && (
          <div className="mt-3 p-3 bg-card/50 rounded-lg border border-border space-y-3">
            <div>
              <label
                htmlFor={`${id}-video-source`}
                className="block text-xs font-medium text-muted-foreground mb-1"
              >
                Video Source
              </label>
              <select
                id={`${id}-video-source`}
                value={content.provider}
                onChange={(e) =>
                  onContentChange?.({
                    ...content,
                    provider: e.target.value as VideoContent['provider'],
                  })
                }
                className="w-full bg-background px-3 py-2 rounded border border-border text-sm"
              >
                <option value="upload">Upload</option>
                <option value="youtube">YouTube</option>
                <option value="vimeo">Vimeo</option>
                <option value="loom">Loom</option>
              </select>
            </div>
            <div>
              <label
                htmlFor={`${id}-video-url`}
                className="block text-xs font-medium text-muted-foreground mb-1"
              >
                {content.provider === 'upload' ? 'Video URL' : 'Video Link'}
              </label>
              <input
                id={`${id}-video-url`}
                type="text"
                value={content.src}
                onChange={(e) => onContentChange?.({ ...content, src: e.target.value })}
                placeholder={
                  content.provider === 'upload'
                    ? '/videos/intro.mp4'
                    : 'https://youtube.com/watch?v=...'
                }
                className="w-full bg-background px-3 py-2 rounded border border-border text-sm"
              />
            </div>
            <div>
              <label
                htmlFor={`${id}-video-title`}
                className="block text-xs font-medium text-muted-foreground mb-1"
              >
                Title (for accessibility)
              </label>
              <input
                id={`${id}-video-title`}
                type="text"
                value={content.title}
                onChange={(e) => onContentChange?.({ ...content, title: e.target.value })}
                placeholder="Video title..."
                className="w-full bg-background px-3 py-2 rounded border border-border text-sm"
              />
            </div>
          </div>
        )}
      </div>
    </BlockWrapper>
  );
}
