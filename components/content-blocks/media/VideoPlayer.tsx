'use client';

import { Maximize, Pause, Play, Settings, Volume2, VolumeX } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useXAPITracking } from '@/hooks/useXAPITracking';

interface VideoPlayerProps {
  /** Unique identifier for xAPI tracking */
  blockId?: string;
  /** Initial video URL */
  initialVideoUrl?: string;
  /** Initial title */
  initialTitle?: string;
  /** Initial description */
  initialDescription?: string;
  // TODO(LXD-309): Re-enable course context when xAPI tracking hook supports parentContext
  // /** Course context for xAPI */
  // courseContext?: {
  //   courseId?: string;
  //   courseName?: string;
  //   moduleId?: string;
  //   moduleName?: string;
  // };
  /** Whether to track xAPI events in development */
  trackInDev?: boolean;
}

export function VideoPlayer({
  blockId = 'video-player',
  initialVideoUrl = '',
  initialTitle = 'Video Title',
  initialDescription = 'Add a description for your video content here.',
  trackInDev = false,
}: VideoPlayerProps): React.JSX.Element {
  // TODO(LXD-309): courseContext is disabled until xAPI tracking hook supports parentContext
  const _courseContext = undefined;
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [videoUrl, setVideoUrl] = useState(initialVideoUrl);
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const hasCompletedRef = useRef(false);
  const playStartTimeRef = useRef<number | null>(null);

  // xAPI tracking hook
  // TODO(LXD-309): Add emitVideoEvent method to XAPITracker when implementing full xAPI support
  const { emitCompleted, isActive, trackInteraction } = useXAPITracking({
    activityId: blockId,
    activityName: title,
    activityType: 'video',
    activityDescription: description,
    // parentContext is not yet supported in the current xAPI tracking hook
  });

  // Placeholder video event tracking using generic interaction tracking
  const emitVideoEvent = useCallback(
    (eventType: string, data: Record<string, unknown>) => {
      trackInteraction(eventType, JSON.stringify(data));
    },
    [trackInteraction],
  );

  // Suppress unused variable warning
  void _courseContext;
  void trackInDev;

  // Track video duration (5:30 = 330 seconds for demo)
  const videoDuration = 330;

  // Calculate current time from progress
  const currentTimeSeconds = (progress / 100) * videoDuration;

  // Handle play/pause with xAPI tracking
  const handlePlayPause = useCallback(() => {
    const newIsPlaying = !isPlaying;
    setIsPlaying(newIsPlaying);

    if (isActive) {
      if (newIsPlaying) {
        playStartTimeRef.current = Date.now();
        emitVideoEvent('played', {
          time: currentTimeSeconds,
          progress: progress / 100,
          duration: videoDuration,
        });
      } else {
        emitVideoEvent('paused', {
          time: currentTimeSeconds,
          progress: progress / 100,
          duration: videoDuration,
        });
      }
    }
  }, [isPlaying, isActive, currentTimeSeconds, progress, emitVideoEvent]);

  // Handle seek with xAPI tracking
  const handleSeek = useCallback(
    (newProgress: number) => {
      const previousTime = currentTimeSeconds;
      setProgress(newProgress);
      const newTime = (newProgress / 100) * videoDuration;

      if (isActive) {
        emitVideoEvent('seeked', {
          time: newTime,
          seekFrom: previousTime,
          seekTo: newTime,
          duration: videoDuration,
        });
      }
    },
    [currentTimeSeconds, isActive, emitVideoEvent],
  );

  // Emit completion when progress reaches 100%
  useEffect(() => {
    if (progress >= 100 && !hasCompletedRef.current && isActive) {
      hasCompletedRef.current = true;
      const totalDuration = playStartTimeRef.current
        ? Math.floor((Date.now() - playStartTimeRef.current) / 1000)
        : videoDuration;
      emitCompleted({ duration: totalDuration });
    }
  }, [progress, isActive, emitCompleted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentTime = formatTime((progress / 100) * 330); // Assuming 5:30 = 330 seconds

  return (
    <Card className="p-6 bg-lxd-dark-page border-2 border-lxd-blue">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-lxd-text-light-heading">Video Player</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsEditing(!isEditing)}
          className="border-lxd-dark-surface text-lxd-text-light-secondary hover:bg-lxd-dark-surface"
        >
          {isEditing ? 'Done' : 'Edit'}
        </Button>
      </div>

      {isEditing && (
        <div className="space-y-3 mb-4 p-4 bg-lxd-dark-surface/30 rounded-lg border border-lxd-dark-surface">
          <div>
            <Label className="text-lxd-text-light-secondary">Video URL</Label>
            <Input
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="Enter video URL (YouTube, Vimeo, or direct link)"
              className="bg-lxd-dark-page border-lxd-dark-surface text-lxd-text-light-heading"
            />
          </div>
          <div>
            <Label className="text-lxd-text-light-secondary">Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Video title"
              className="bg-lxd-dark-page border-lxd-dark-surface text-lxd-text-light-heading"
            />
          </div>
          <div>
            <Label className="text-lxd-text-light-secondary">Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Video description"
              rows={2}
              className="bg-lxd-dark-page border-lxd-dark-surface text-lxd-text-light-heading resize-none"
            />
          </div>
        </div>
      )}

      <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
        {/* Video placeholder */}
        <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-lxd-dark-page to-lxd-dark-surface">
          <div className="text-center">
            <div className="w-20 h-20 bg-lxd-blue/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="w-10 h-10 text-lxd-blue" />
            </div>
            <p className="text-lxd-text-light-heading text-lg font-medium">{title}</p>
            <p className="text-lxd-text-light-muted text-sm mt-1">Click to play</p>
          </div>
        </div>

        {/* Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/90 to-transparent p-4">
          {/* Progress bar */}
          <div className="mb-3">
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => handleSeek(Number(e.target.value))}
              className="w-full h-1 bg-brand-surface/30 rounded-lg appearance-none cursor-pointer accent-lxd-blue"
            />
          </div>

          {/* Control buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handlePlayPause}
                className="text-lxd-text-light-heading hover:text-lxd-blue transition-colors"
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </button>
              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className="text-lxd-text-light-heading hover:text-lxd-blue transition-colors"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <span className="text-lxd-text-light-heading text-sm">{currentTime} / 5:30</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="text-lxd-text-light-heading hover:text-lxd-blue transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>
              <button
                type="button"
                className="text-lxd-text-light-heading hover:text-lxd-blue transition-colors"
              >
                <Maximize className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <h4 className="text-lg font-bold text-lxd-text-light-heading mb-2">{title}</h4>
        <p className="text-lxd-text-light-muted text-sm">{description}</p>
      </div>
    </Card>
  );
}
