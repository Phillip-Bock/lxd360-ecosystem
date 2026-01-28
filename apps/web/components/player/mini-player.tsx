'use client';

import {
  ChevronUp,
  Headphones,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import Image from 'next/image';
import * as React from 'react';
import { Slider } from '@/components/ui/slider';
import {
  type ContentAtom,
  type PlaybackModality,
  usePersistentPlayer,
} from '@/hooks/use-persistent-player';
import { cn } from '@/lib/utils';

interface MiniPlayerProps {
  /** Content atom to display */
  contentAtom?: ContentAtom | null;
  /** Current modality */
  modality?: PlaybackModality;
  /** Whether playing */
  isPlaying?: boolean;
  /** Current progress (0-100) */
  progress?: number;
  /** Current time formatted */
  currentTime?: string;
  /** Duration formatted */
  duration?: string;
  /** On play/pause click */
  onPlayPause?: () => void;
  /** On seek backward */
  onSeekBackward?: () => void;
  /** On seek forward */
  onSeekForward?: () => void;
  /** On expand click */
  onExpand?: () => void;
  /** On close click */
  onClose?: () => void;
  /** Additional class names */
  className?: string;
  /** Use internal store state */
  useStore?: boolean;
}

/**
 * Mini Player Component
 *
 * Compact player view showing thumbnail, title, progress, and basic controls.
 * Used in the persistent player bar when minimized.
 */
export function MiniPlayer({
  contentAtom: controlledContentAtom,
  modality: controlledModality,
  isPlaying: controlledIsPlaying,
  progress: controlledProgress,
  currentTime: controlledCurrentTime,
  duration: controlledDuration,
  onPlayPause,
  onSeekBackward,
  onSeekForward,
  onExpand,
  onClose,
  className,
  useStore = false,
}: MiniPlayerProps): React.JSX.Element | null {
  const player = usePersistentPlayer();
  const [isMuted, setIsMuted] = React.useState(false);
  const previousVolume = React.useRef(1);

  // Use store or controlled values
  const contentAtom = useStore ? player.contentAtom : controlledContentAtom;
  const modality = useStore ? player.modality : (controlledModality ?? 'watch');
  const isPlaying = useStore ? player.isPlaying : (controlledIsPlaying ?? false);
  const progress = useStore ? player.progress : (controlledProgress ?? 0);
  const currentTime = useStore ? player.formattedCurrentTime : (controlledCurrentTime ?? '0:00');
  const duration = useStore ? player.formattedDuration : (controlledDuration ?? '0:00');

  const handlePlayPause = React.useCallback(() => {
    if (useStore) {
      player.togglePlayPause();
    } else {
      onPlayPause?.();
    }
  }, [useStore, player, onPlayPause]);

  const handleSeekBackward = React.useCallback(() => {
    if (useStore) {
      player.seekRelative(-10);
    } else {
      onSeekBackward?.();
    }
  }, [useStore, player, onSeekBackward]);

  const handleSeekForward = React.useCallback(() => {
    if (useStore) {
      player.seekRelative(10);
    } else {
      onSeekForward?.();
    }
  }, [useStore, player, onSeekForward]);

  const handleClose = React.useCallback(() => {
    if (useStore) {
      player.close();
    } else {
      onClose?.();
    }
  }, [useStore, player, onClose]);

  const toggleMute = React.useCallback(() => {
    if (useStore) {
      if (isMuted) {
        player.setVolume(previousVolume.current);
      } else {
        previousVolume.current = player.volume;
        player.setVolume(0);
      }
    }
    setIsMuted(!isMuted);
  }, [useStore, player, isMuted]);

  if (!contentAtom) {
    return null;
  }

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg bg-black/90 backdrop-blur-xl p-2 shadow-2xl',
        'border border-white/10',
        className,
      )}
    >
      {/* Thumbnail */}
      <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-white/5">
        {contentAtom.thumbnail ? (
          <Image
            src={contentAtom.thumbnail}
            alt={contentAtom.title}
            fill
            className="object-cover"
            sizes="48px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-lxd-primary to-lxd-secondary">
            <Headphones className="h-6 w-6 text-white/80" aria-hidden="true" />
          </div>
        )}

        {/* Modality indicator */}
        {modality === 'listen' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <Headphones className="h-5 w-5 text-white" aria-hidden="true" />
          </div>
        )}
      </div>

      {/* Content info */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-sm font-medium text-white">{contentAtom.title}</span>
        <div className="flex items-center gap-2 text-xs text-white/60">
          <span>{currentTime}</span>
          <span>/</span>
          <span>{duration}</span>
        </div>
        {/* Progress bar */}
        <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-white/20">
          <div
            className="h-full rounded-full bg-gradient-to-r from-lxd-primary to-lxd-secondary transition-all duration-150"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Playback progress"
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1">
        {/* Skip backward */}
        <button
          type="button"
          onClick={handleSeekBackward}
          className="rounded-full p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Skip backward 10 seconds"
        >
          <SkipBack className="h-4 w-4" aria-hidden="true" />
        </button>

        {/* Play/Pause */}
        <button
          type="button"
          onClick={handlePlayPause}
          className="rounded-full bg-white p-2.5 text-black transition-transform hover:scale-105 active:scale-95"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Play className="h-4 w-4 translate-x-0.5" aria-hidden="true" />
          )}
        </button>

        {/* Skip forward */}
        <button
          type="button"
          onClick={handleSeekForward}
          className="rounded-full p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Skip forward 10 seconds"
        >
          <SkipForward className="h-4 w-4" aria-hidden="true" />
        </button>

        {/* Volume */}
        <button
          type="button"
          onClick={toggleMute}
          className="rounded-full p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? (
            <VolumeX className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Volume2 className="h-4 w-4" aria-hidden="true" />
          )}
        </button>

        {/* Expand */}
        {onExpand && (
          <button
            type="button"
            onClick={onExpand}
            className="rounded-full p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Expand player"
          >
            <ChevronUp className="h-4 w-4" aria-hidden="true" />
          </button>
        )}

        {/* Close */}
        <button
          type="button"
          onClick={handleClose}
          className="rounded-full p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Close player"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

/**
 * Mini player with volume slider (expanded variant)
 */
export function MiniPlayerExpanded({
  className,
  ...props
}: MiniPlayerProps): React.JSX.Element | null {
  const player = usePersistentPlayer();
  const contentAtom = props.useStore ? player.contentAtom : props.contentAtom;

  if (!contentAtom) {
    return null;
  }

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <MiniPlayer {...props} />

      {/* Volume slider */}
      <div className="flex items-center gap-3 px-2">
        <Volume2 className="h-4 w-4 text-white/60" aria-hidden="true" />
        <Slider
          value={[props.useStore ? player.volume * 100 : 100]}
          max={100}
          step={1}
          onValueChange={(value) => {
            if (props.useStore) {
              player.setVolume(value[0] / 100);
            }
          }}
          className="flex-1"
          aria-label="Volume"
        />
      </div>
    </div>
  );
}

MiniPlayer.displayName = 'MiniPlayer';
MiniPlayerExpanded.displayName = 'MiniPlayerExpanded';
