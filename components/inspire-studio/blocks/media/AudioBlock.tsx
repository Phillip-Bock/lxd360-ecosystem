'use client';

import { FastForward, FileText, Music, Pause, Play, Rewind, Volume2, VolumeX } from 'lucide-react';
import NextImage from 'next/image';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { AudioBlockContent } from '@/types/blocks';
import type { BlockComponentProps } from '../BlockRenderer';

const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

/**
 * AudioBlock - Audio player with waveform and transcript
 */
export function AudioBlock({
  block,
  isEditing,
  onUpdate,
}: BlockComponentProps<AudioBlockContent>): React.JSX.Element {
  const content = block.content as AudioBlockContent;
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Format time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Play/pause toggle
  const togglePlay = useCallback(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  }, [isPlaying]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  // Seek to position
  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  // Skip forward/backward
  const skip = useCallback(
    (seconds: number) => {
      if (audioRef.current) {
        audioRef.current.currentTime = Math.max(0, Math.min(duration, currentTime + seconds));
      }
    },
    [currentTime, duration],
  );

  // Change playback speed
  const changeSpeed = useCallback((speed: number) => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
      setShowSpeedMenu(false);
    }
  }, []);

  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, []);

  // Handle file upload
  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          onUpdate({
            content: {
              ...content,
              src: event.target?.result as string,
              title: file.name.replace(/\.[^/.]+$/, ''),
            },
          });
        };
        reader.readAsDataURL(file);
      }
    },
    [content, onUpdate],
  );

  // Handle URL submission
  const handleUrlSubmit = useCallback(() => {
    if (urlInput) {
      onUpdate({
        content: {
          ...content,
          src: urlInput,
        },
      });
      setUrlInput('');
    }
  }, [content, urlInput, onUpdate]);

  // Empty state
  if (!content.src) {
    return (
      <div className="space-y-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleFileUpload}
          className="hidden"
          aria-label="Upload audio file"
        />

        <button
          type="button"
          className="w-full p-8 bg-studio-bg border-2 border-dashed border-studio-surface rounded-xl flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-studio-accent/50 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="w-16 h-16 rounded-full bg-studio-surface/50 flex items-center justify-center">
            <Music className="w-8 h-8 text-studio-text-muted" aria-hidden="true" />
          </div>
          <div className="text-center">
            <p className="text-studio-text font-medium">Drop an audio file or click to upload</p>
            <p className="text-sm text-studio-text-muted mt-1">MP3, WAV, OGG, AAC up to 50MB</p>
          </div>
        </button>

        {isEditing && (
          <div className="flex gap-2 w-full max-w-md">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
              placeholder="Or paste audio URL..."
              aria-label="Audio URL"
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
    );
  }

  // Audio player
  return (
    <div className="space-y-4">
      <audio ref={audioRef} src={content.src} preload="metadata">
        <track kind="captions" srcLang="en" label="English captions" />
      </audio>

      <div className="bg-studio-bg border border-studio-surface/50 rounded-xl p-4">
        <div className="flex items-center gap-4">
          {/* Cover image */}
          <div className="w-16 h-16 rounded-lg bg-studio-surface/50 flex items-center justify-center shrink-0 overflow-hidden">
            {content.coverImage ? (
              <NextImage
                src={content.coverImage}
                alt=""
                width={64}
                height={64}
                className="w-full h-full object-cover"
                unoptimized
              />
            ) : (
              <Music className="w-8 h-8 text-studio-text-muted" aria-hidden="true" />
            )}
          </div>

          {/* Info and controls */}
          <div className="flex-1 min-w-0">
            {/* Title */}
            <h4 className="font-medium text-brand-primary truncate">{content.title || 'Audio'}</h4>
            {content.artist && (
              <p className="text-sm text-studio-text-muted truncate">{content.artist}</p>
            )}

            {/* Progress bar */}
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-studio-text-muted font-mono w-10">
                {formatTime(currentTime)}
              </span>
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                aria-label="Audio progress"
                aria-valuemin={0}
                aria-valuemax={duration || 100}
                aria-valuenow={currentTime}
                aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
                className="flex-1 h-1 appearance-none bg-studio-surface rounded-full cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-studio-accent [&::-webkit-slider-thumb]:rounded-full"
              />
              <span className="text-xs text-studio-text-muted font-mono w-10">
                {formatTime(duration)}
              </span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mt-4">
          {/* Skip back */}
          <button
            type="button"
            onClick={() => skip(-10)}
            className="p-2 text-studio-text-muted hover:text-brand-primary transition-colors"
            aria-label="Skip back 10 seconds"
          >
            <Rewind className="w-5 h-5" aria-hidden="true" />
          </button>

          {/* Play/Pause */}
          <button
            type="button"
            onClick={togglePlay}
            className="w-12 h-12 rounded-full bg-studio-accent hover:bg-studio-accent-hover flex items-center justify-center text-brand-primary transition-colors"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" aria-hidden="true" />
            ) : (
              <Play className="w-6 h-6 ml-0.5" aria-hidden="true" />
            )}
          </button>

          {/* Skip forward */}
          <button
            type="button"
            onClick={() => skip(10)}
            className="p-2 text-studio-text-muted hover:text-brand-primary transition-colors"
            aria-label="Skip forward 10 seconds"
          >
            <FastForward className="w-5 h-5" aria-hidden="true" />
          </button>

          <div className="w-px h-6 bg-studio-surface mx-2" />

          {/* Volume */}
          <button
            type="button"
            onClick={toggleMute}
            className="p-2 text-studio-text-muted hover:text-brand-primary transition-colors"
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5" aria-hidden="true" />
            ) : (
              <Volume2 className="w-5 h-5" aria-hidden="true" />
            )}
          </button>

          {/* Playback speed */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowSpeedMenu(!showSpeedMenu)}
              className="px-2 py-1 text-sm text-studio-text-muted hover:text-brand-primary transition-colors"
              aria-label={`Playback speed: ${playbackSpeed}x`}
              aria-haspopup="true"
              aria-expanded={showSpeedMenu}
            >
              {playbackSpeed}x
            </button>

            {showSpeedMenu && (
              <div
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-studio-bg-dark border border-studio-surface/50 rounded-lg shadow-xl py-1"
                role="menu"
                aria-label="Playback speed options"
              >
                {PLAYBACK_SPEEDS.map((speed) => (
                  <button
                    type="button"
                    key={speed}
                    onClick={() => changeSpeed(speed)}
                    role="menuitem"
                    aria-current={playbackSpeed === speed ? 'true' : undefined}
                    className={`
                      w-full px-4 py-1.5 text-sm transition-colors
                      ${
                        playbackSpeed === speed
                          ? 'bg-studio-accent/20 text-studio-accent'
                          : 'text-studio-text hover:bg-studio-surface/50'
                      }
                    `}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit settings */}
      {isEditing && (
        <div className="space-y-3 p-4 bg-studio-bg rounded-lg border border-studio-surface/30">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="audio-block-title"
                className="block text-sm text-studio-text-muted mb-1"
              >
                Title
              </label>
              <input
                id="audio-block-title"
                type="text"
                value={content.title || ''}
                onChange={(e) => onUpdate({ content: { ...content, title: e.target.value } })}
                className="w-full px-3 py-2 bg-studio-bg-dark border border-studio-surface/50 rounded-lg text-brand-primary"
                placeholder="Track title..."
              />
            </div>
            <div>
              <label
                htmlFor="audio-block-artist"
                className="block text-sm text-studio-text-muted mb-1"
              >
                Artist
              </label>
              <input
                id="audio-block-artist"
                type="text"
                value={content.artist || ''}
                onChange={(e) => onUpdate({ content: { ...content, artist: e.target.value } })}
                className="w-full px-3 py-2 bg-studio-bg-dark border border-studio-surface/50 rounded-lg text-brand-primary"
                placeholder="Artist name..."
              />
            </div>
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={content.autoPlay || false}
                onChange={(e) => onUpdate({ content: { ...content, autoPlay: e.target.checked } })}
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
          </div>

          {/* Transcript */}
          <div>
            <label
              htmlFor="audio-block-transcript"
              className="flex items-center gap-2 text-sm text-studio-text-muted mb-1"
            >
              <FileText className="w-4 h-4" aria-hidden="true" />
              Transcript
            </label>
            <textarea
              id="audio-block-transcript"
              value={content.transcript || ''}
              onChange={(e) => onUpdate({ content: { ...content, transcript: e.target.value } })}
              className="w-full px-3 py-2 bg-studio-bg-dark border border-studio-surface/50 rounded-lg text-brand-primary resize-none"
              rows={4}
              placeholder="Add audio transcript for accessibility..."
            />
          </div>
        </div>
      )}

      {/* Transcript display */}
      {!isEditing && content.transcript && (
        <details className="bg-studio-bg border border-studio-surface/30 rounded-lg">
          <summary className="px-4 py-3 cursor-pointer text-studio-text-muted hover:text-brand-primary transition-colors">
            <span className="ml-2">View Transcript</span>
          </summary>
          <div className="px-4 pb-4 text-studio-text text-sm whitespace-pre-wrap">
            {content.transcript}
          </div>
        </details>
      )}
    </div>
  );
}

export default AudioBlock;
