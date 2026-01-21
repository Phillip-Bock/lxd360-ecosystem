/**
 * useAudioContextualTab - Contextual tab for audio block editing
 * Provides Playback and Edit tool groups for audio manipulation
 */

import {
  FastForward,
  Music,
  Pause,
  Play,
  Rewind,
  Scissors,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import type { ContextualTab, UseContextualTabResult } from './types';

interface UseAudioContextualTabOptions {
  /** Current playback state */
  isPlaying?: boolean;
  /** Current mute state */
  isMuted?: boolean;
  /** Callback for play/pause toggle */
  onPlayPause?: () => void;
  /** Callback for mute toggle */
  onMuteToggle?: () => void;
  /** Callback to skip backward */
  onSkipBack?: () => void;
  /** Callback to skip forward */
  onSkipForward?: () => void;
  /** Callback to open trim tool */
  onOpenTrim?: () => void;
  /** Callback to open volume/fade controls */
  onOpenVolumeFades?: () => void;
  /** Callback to open full audio editor */
  onOpenFullEditor?: () => void;
}

/**
 * Hook that returns a contextual tab configuration for audio editing
 *
 * @example
 * ```tsx
 * const { tab } = useAudioContextualTab({
 *   isPlaying,
 *   onPlayPause: () => setIsPlaying(!isPlaying),
 *   onOpenFullEditor: () => setAudioEditorOpen(true),
 * });
 * ```
 */
export function useAudioContextualTab(
  options: UseAudioContextualTabOptions = {},
): UseContextualTabResult {
  const {
    isPlaying = false,
    isMuted = false,
    onPlayPause,
    onMuteToggle,
    onSkipBack,
    onSkipForward,
    onOpenTrim,
    onOpenVolumeFades,
    onOpenFullEditor,
  } = options;

  const [isActive] = useState(false);

  const tab = useMemo<ContextualTab>(
    () => ({
      id: 'audio-tools',
      label: 'Audio Tools',
      icon: Music,
      color: 'green',
      groups: [
        {
          id: 'playback',
          label: 'Playback',
          tools: [
            {
              id: 'skip-back',
              label: 'Skip Back',
              icon: SkipBack,
              onClick: onSkipBack,
            },
            {
              id: 'rewind',
              label: 'Rewind 10s',
              icon: Rewind,
              onClick: onSkipBack,
            },
            {
              id: 'play-pause',
              label: isPlaying ? 'Pause' : 'Play',
              icon: isPlaying ? Pause : Play,
              onClick: onPlayPause,
              variant: 'primary',
            },
            {
              id: 'fast-forward',
              label: 'Forward 10s',
              icon: FastForward,
              onClick: onSkipForward,
            },
            {
              id: 'skip-forward',
              label: 'Skip Forward',
              icon: SkipForward,
              onClick: onSkipForward,
            },
            {
              id: 'mute',
              label: isMuted ? 'Unmute' : 'Mute',
              icon: isMuted ? VolumeX : Volume2,
              onClick: onMuteToggle,
            },
          ],
        },
        {
          id: 'edit',
          label: 'Edit',
          tools: [
            {
              id: 'trim',
              label: 'Trim',
              icon: Scissors,
              onClick: onOpenTrim,
            },
            {
              id: 'volume-fades',
              label: 'Volume & Fades',
              icon: Volume2,
              onClick: onOpenVolumeFades,
            },
          ],
        },
      ],
      onOpenFullEditor,
    }),
    [
      isPlaying,
      isMuted,
      onPlayPause,
      onMuteToggle,
      onSkipBack,
      onSkipForward,
      onOpenTrim,
      onOpenVolumeFades,
      onOpenFullEditor,
    ],
  );

  return { tab, isActive };
}
