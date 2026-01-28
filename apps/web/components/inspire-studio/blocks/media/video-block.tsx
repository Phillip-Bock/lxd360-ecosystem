'use client';

import {
  FileText,
  Film,
  Link,
  Maximize,
  Pause,
  Play,
  Upload,
  Volume2,
  VolumeX,
  Youtube,
} from 'lucide-react';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { VideoBlockContent } from '@/types/blocks';
import type { BlockComponentProps } from '../block-renderer';

const VIDEO_TYPES = [
  { value: 'file', label: 'Upload', icon: Upload },
  { value: 'youtube', label: 'YouTube', icon: Youtube },
  { value: 'vimeo', label: 'Vimeo', icon: Film },
  { value: 'embed', label: 'Embed Code', icon: Link },
];

/**
 * VideoBlock - Video player with multiple source options
 */
export function VideoBlock({
  block,
  isEditing,
  onUpdate,
}: BlockComponentProps<VideoBlockContent>): React.JSX.Element {
  const content = block.content as VideoBlockContent;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(content.muted || false);
  const [showControls, setShowControls] = useState(true);
  const [urlInput, setUrlInput] = useState('');

  const videoType = content.type || 'file';

  // Extract video ID from YouTube/Vimeo URLs
  const getEmbedUrl = useCallback(
    (src: string, type: string) => {
      if (type === 'youtube') {
        const match = src.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&\s]+)/);
        const videoId = match?.[1];
        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}?${content.autoPlay ? 'autoplay=1&' : ''}rel=0`;
        }
      }
      if (type === 'vimeo') {
        const match = src.match(/vimeo\.com\/(\d+)/);
        const videoId = match?.[1];
        if (videoId) {
          return `https://player.vimeo.com/video/${videoId}?${content.autoPlay ? 'autoplay=1&' : ''}`;
        }
      }
      return src;
    },
    [content.autoPlay],
  );

  // Play/pause toggle
  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  // Seek to position
  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  // Format time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Update time from video
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleDurationChange = () => setDuration(video.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, []);

  // Handle URL submission
  const handleUrlSubmit = useCallback(() => {
    if (urlInput) {
      // Auto-detect video type
      let type = 'file';
      if (urlInput.includes('youtube.com') || urlInput.includes('youtu.be')) {
        type = 'youtube';
      } else if (urlInput.includes('vimeo.com')) {
        type = 'vimeo';
      }

      onUpdate({
        content: {
          ...content,
          src: urlInput,
          type: type as 'file' | 'youtube' | 'vimeo' | 'embed',
        },
      });
      setUrlInput('');
    }
  }, [content, urlInput, onUpdate]);

  // Render YouTube/Vimeo embed
  if ((videoType === 'youtube' || videoType === 'vimeo') && content.src) {
    const embedUrl = getEmbedUrl(content.src, videoType);

    return (
      <div className="space-y-4">
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
          <iframe
            src={embedUrl}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={content.title || 'Video'}
          />
        </div>

        {isEditing && (
          <div className="space-y-3 p-4 bg-studio-bg rounded-lg border border-studio-surface/30">
            <div>
              <label
                htmlFor={`video-url-${block.id}`}
                className="block text-sm text-studio-text-muted mb-1"
              >
                Video URL
              </label>
              <input
                id={`video-url-${block.id}`}
                type="url"
                value={content.src}
                onChange={(e) => onUpdate({ content: { ...content, src: e.target.value } })}
                className="w-full px-3 py-2 bg-studio-bg-dark border border-studio-surface/50 rounded-lg text-brand-primary"
              />
            </div>
            <div>
              <label
                htmlFor={`video-title-embed-${block.id}`}
                className="block text-sm text-studio-text-muted mb-1"
              >
                Title
              </label>
              <input
                id={`video-title-embed-${block.id}`}
                type="text"
                value={content.title || ''}
                onChange={(e) => onUpdate({ content: { ...content, title: e.target.value } })}
                className="w-full px-3 py-2 bg-studio-bg-dark border border-studio-surface/50 rounded-lg text-brand-primary"
                placeholder="Video title..."
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={content.autoPlay || false}
                onChange={(e) => onUpdate({ content: { ...content, autoPlay: e.target.checked } })}
                className="w-4 h-4 rounded border-studio-surface bg-studio-bg-dark text-studio-accent"
              />
              <span className="text-sm text-studio-text-muted">Auto-play</span>
            </label>
          </div>
        )}
      </div>
    );
  }

  // Render native video player
  if (videoType === 'file' && content.src) {
    return (
      <div className="space-y-4">
        {/* The onMouseEnter/Leave handlers manage control visibility for UX, not interactivity */}
        {/* biome-ignore lint/a11y/noStaticElementInteractions: Mouse handlers are for hover-based UX enhancement only */}
        <div
          className="relative aspect-video bg-black rounded-lg overflow-hidden group"
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => setShowControls(!isPlaying)}
        >
          <video
            ref={videoRef}
            src={content.src}
            poster={content.poster}
            loop={content.loop}
            muted={isMuted}
            className="w-full h-full object-contain"
            onClick={togglePlay}
          >
            <track kind="captions" />
          </video>

          {/* Play overlay */}
          {!isPlaying && (
            <button
              type="button"
              className="absolute inset-0 flex items-center justify-center cursor-pointer bg-transparent border-0"
              onClick={togglePlay}
              aria-label="Play video"
            >
              <span className="w-20 h-20 rounded-full bg-brand-surface/20 backdrop-blur-xs flex items-center justify-center">
                <Play
                  className="w-10 h-10 text-brand-primary ml-1"
                  fill="white"
                  aria-hidden="true"
                />
              </span>
            </button>
          )}

          {/* Controls */}
          {(showControls || !isPlaying) && content.controls !== false && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-linear-to-t from-black/80 to-transparent">
              {/* Progress bar */}
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1 mb-3 appearance-none bg-brand-surface/30 rounded-full cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-brand-surface [&::-webkit-slider-thumb]:rounded-full"
              />

              <div className="flex items-center gap-4">
                {/* Play/Pause */}
                <button
                  type="button"
                  onClick={togglePlay}
                  className="text-brand-primary hover:text-studio-accent transition-colors"
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                </button>

                {/* Time */}
                <span className="text-sm text-brand-primary/80 font-mono">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>

                <div className="flex-1" />

                {/* Volume */}
                <button
                  type="button"
                  onClick={toggleMute}
                  className="text-brand-primary hover:text-studio-accent transition-colors"
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>

                {/* Fullscreen */}
                <button
                  type="button"
                  onClick={() => videoRef.current?.requestFullscreen()}
                  className="text-brand-primary hover:text-studio-accent transition-colors"
                >
                  <Maximize className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Edit settings */}
        {isEditing && (
          <div className="space-y-3 p-4 bg-studio-bg rounded-lg border border-studio-surface/30">
            <div>
              <label
                htmlFor={`video-title-${block.id}`}
                className="block text-sm text-studio-text-muted mb-1"
              >
                Title
              </label>
              <input
                id={`video-title-${block.id}`}
                type="text"
                value={content.title || ''}
                onChange={(e) => onUpdate({ content: { ...content, title: e.target.value } })}
                className="w-full px-3 py-2 bg-studio-bg-dark border border-studio-surface/50 rounded-lg text-brand-primary"
                placeholder="Video title..."
              />
            </div>

            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={content.autoPlay || false}
                  onChange={(e) =>
                    onUpdate({ content: { ...content, autoPlay: e.target.checked } })
                  }
                  className="w-4 h-4 rounded border-studio-surface bg-studio-bg-dark text-studio-accent"
                />
                <span className="text-sm text-studio-text-muted">Auto-play</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={content.loop || false}
                  onChange={(e) => onUpdate({ content: { ...content, loop: e.target.checked } })}
                  className="w-4 h-4 rounded border-studio-surface bg-studio-bg-dark text-studio-accent"
                />
                <span className="text-sm text-studio-text-muted">Loop</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={content.muted || false}
                  onChange={(e) => onUpdate({ content: { ...content, muted: e.target.checked } })}
                  className="w-4 h-4 rounded border-studio-surface bg-studio-bg-dark text-studio-accent"
                />
                <span className="text-sm text-studio-text-muted">Muted</span>
              </label>
            </div>

            {/* Transcript */}
            <div>
              <label
                htmlFor={`video-transcript-${block.id}`}
                className="flex items-center gap-2 text-sm text-studio-text-muted mb-1"
              >
                <FileText className="w-4 h-4" aria-hidden="true" />
                Transcript
              </label>
              <textarea
                id={`video-transcript-${block.id}`}
                value={content.transcript || ''}
                onChange={(e) => onUpdate({ content: { ...content, transcript: e.target.value } })}
                className="w-full px-3 py-2 bg-studio-bg-dark border border-studio-surface/50 rounded-lg text-brand-primary resize-none"
                rows={4}
                placeholder="Add video transcript for accessibility..."
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Empty state / upload
  return (
    <div className="space-y-4">
      {/* Video type selector */}
      {isEditing && (
        <div className="flex gap-1">
          {VIDEO_TYPES.map((type) => (
            <button
              type="button"
              key={type.value}
              onClick={() => onUpdate({ content: { ...content, type: type.value as unknown } })}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-colors
                ${
                  videoType === type.value
                    ? 'bg-studio-accent text-brand-primary'
                    : 'bg-studio-surface/30 text-studio-text-muted hover:text-brand-primary'
                }
              `}
            >
              <type.icon className="w-3.5 h-3.5" />
              {type.label}
            </button>
          ))}
        </div>
      )}

      {/* Upload/URL area */}
      <div className="aspect-video bg-studio-bg border-2 border-dashed border-studio-surface rounded-lg flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-full bg-studio-surface/50 flex items-center justify-center">
          {videoType === 'file' ? (
            <Upload className="w-8 h-8 text-studio-text-muted" />
          ) : videoType === 'youtube' ? (
            <Youtube className="w-8 h-8 text-studio-text-muted" />
          ) : videoType === 'vimeo' ? (
            <Film className="w-8 h-8 text-studio-text-muted" />
          ) : (
            <Link className="w-8 h-8 text-studio-text-muted" />
          )}
        </div>

        {videoType === 'file' ? (
          <p className="text-studio-text font-medium">Drop a video file or click to upload</p>
        ) : (
          <div className="flex gap-2 w-full max-w-md px-4">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
              placeholder={
                videoType === 'youtube'
                  ? 'Paste YouTube URL...'
                  : videoType === 'vimeo'
                    ? 'Paste Vimeo URL...'
                    : 'Paste video URL or embed code...'
              }
              className="flex-1 px-3 py-2 bg-studio-bg-dark border border-studio-surface/50 rounded-lg text-brand-primary placeholder:text-studio-text-muted outline-hidden focus:border-studio-accent/50"
            />
            <button
              type="button"
              onClick={handleUrlSubmit}
              className="px-4 py-2 bg-studio-accent hover:bg-studio-accent-hover text-brand-primary rounded-lg transition-colors"
            >
              Add
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default VideoBlock;
