'use client';

import { useCallback, useEffect, useRef } from 'react';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import {
  type BackgroundAudioState,
  backgroundAudio,
  type MediaMetadataInfo,
} from '@/lib/player/background-audio';

/**
 * Playback modality - Watch (video) or Listen (audio only)
 */
export type PlaybackModality = 'watch' | 'listen';

/**
 * Content atom information for the player
 */
export interface ContentAtom {
  id: string;
  title: string;
  courseTitle?: string;
  thumbnail?: string;
  audioSrc?: string;
  videoSrc?: string;
  duration?: number;
}

/**
 * Persistent player state
 */
export interface PersistentPlayerState {
  // Content
  contentAtom: ContentAtom | null;

  // Modality
  modality: PlaybackModality;

  // Playback state
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackRate: number;
  buffered: number;

  // UI state
  isMinimized: boolean;
  isVisible: boolean;

  // Actions
  setContentAtom: (atom: ContentAtom | null) => void;
  setModality: (modality: PlaybackModality) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  setPlaybackRate: (rate: number) => void;
  setBuffered: (buffered: number) => void;
  setIsMinimized: (minimized: boolean) => void;
  setIsVisible: (visible: boolean) => void;

  // Compound actions
  play: () => Promise<void>;
  pause: () => void;
  togglePlayPause: () => Promise<void>;
  seek: (time: number) => void;
  seekRelative: (delta: number) => void;
  switchModality: (modality: PlaybackModality) => void;
  loadContent: (atom: ContentAtom, modality?: PlaybackModality) => void;
  close: () => void;
}

/**
 * Persistent player Zustand store
 */
export const usePersistentPlayerStore = create<PersistentPlayerState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    contentAtom: null,
    modality: 'watch',
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    playbackRate: 1,
    buffered: 0,
    isMinimized: false,
    isVisible: false,

    // Basic setters
    setContentAtom: (atom) => set({ contentAtom: atom, isVisible: atom !== null }),
    setModality: (modality) => set({ modality }),
    setIsPlaying: (isPlaying) => set({ isPlaying }),
    setCurrentTime: (currentTime) => set({ currentTime }),
    setDuration: (duration) => set({ duration }),
    setVolume: (volume) => set({ volume }),
    setPlaybackRate: (playbackRate) => set({ playbackRate }),
    setBuffered: (buffered) => set({ buffered }),
    setIsMinimized: (isMinimized) => set({ isMinimized }),
    setIsVisible: (isVisible) => set({ isVisible }),

    // Play action
    play: async () => {
      const state = get();
      if (state.modality === 'listen' && state.contentAtom?.audioSrc) {
        await backgroundAudio.play();
      }
      set({ isPlaying: true });
    },

    // Pause action
    pause: () => {
      const state = get();
      if (state.modality === 'listen') {
        backgroundAudio.pause();
      }
      set({ isPlaying: false });
    },

    // Toggle play/pause
    togglePlayPause: async () => {
      const state = get();
      if (state.isPlaying) {
        state.pause();
      } else {
        await state.play();
      }
    },

    // Seek to specific time
    seek: (time) => {
      const state = get();
      if (state.modality === 'listen') {
        backgroundAudio.seek(time);
      }
      set({ currentTime: time });
    },

    // Seek relative to current time
    seekRelative: (delta) => {
      const state = get();
      const newTime = Math.max(0, Math.min(state.currentTime + delta, state.duration));
      state.seek(newTime);
    },

    // Switch between watch and listen modes
    switchModality: (newModality) => {
      const state = get();
      const currentTime = state.currentTime;
      const wasPlaying = state.isPlaying;

      // If switching to listen mode, load audio into background service
      if (newModality === 'listen' && state.contentAtom?.audioSrc) {
        const metadata: MediaMetadataInfo = {
          title: state.contentAtom.title,
          artist: 'LXD360',
          album: state.contentAtom.courseTitle,
          artwork: state.contentAtom.thumbnail
            ? [
                {
                  src: state.contentAtom.thumbnail,
                  sizes: '512x512',
                  type: 'image/png',
                },
              ]
            : [],
        };

        backgroundAudio.load(state.contentAtom.audioSrc, metadata);
        backgroundAudio.seek(currentTime);

        if (wasPlaying) {
          backgroundAudio.play().catch(console.error);
        }
      }

      // If switching away from listen mode, pause background audio
      if (state.modality === 'listen' && newModality === 'watch') {
        backgroundAudio.pause();
      }

      set({ modality: newModality });
    },

    // Load new content
    loadContent: (atom, modality = 'watch') => {
      const state = get();

      // Stop any existing playback
      if (state.modality === 'listen') {
        backgroundAudio.stop();
      }

      // Set new content
      set({
        contentAtom: atom,
        modality,
        isPlaying: false,
        currentTime: 0,
        duration: atom.duration || 0,
        isVisible: true,
        isMinimized: false,
      });

      // If starting in listen mode, load audio
      if (modality === 'listen' && atom.audioSrc) {
        const metadata: MediaMetadataInfo = {
          title: atom.title,
          artist: 'LXD360',
          album: atom.courseTitle,
          artwork: atom.thumbnail
            ? [
                {
                  src: atom.thumbnail,
                  sizes: '512x512',
                  type: 'image/png',
                },
              ]
            : [],
        };

        backgroundAudio.load(atom.audioSrc, metadata);
      }
    },

    // Close the player
    close: () => {
      const state = get();
      if (state.modality === 'listen') {
        backgroundAudio.stop();
      }
      set({
        contentAtom: null,
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        isVisible: false,
        isMinimized: false,
      });
    },
  })),
);

/**
 * Hook to sync background audio state with the store
 */
export function usePersistentPlayer() {
  const store = usePersistentPlayerStore();
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sync background audio state to store
  const syncAudioState = useCallback((audioState: BackgroundAudioState) => {
    usePersistentPlayerStore.setState({
      isPlaying: audioState.isPlaying,
      currentTime: audioState.currentTime,
      duration: audioState.duration || usePersistentPlayerStore.getState().duration,
      buffered: audioState.buffered,
      volume: audioState.volume,
      playbackRate: audioState.playbackRate,
    });
  }, []);

  // Set up listeners for background audio events
  useEffect(() => {
    const unsubPlay = backgroundAudio.on('play', syncAudioState);
    const unsubPause = backgroundAudio.on('pause', syncAudioState);
    const unsubTimeUpdate = backgroundAudio.on('timeupdate', syncAudioState);
    const unsubEnded = backgroundAudio.on('ended', (state) => {
      syncAudioState(state);
      usePersistentPlayerStore.setState({ isPlaying: false });
    });
    const unsubMetadata = backgroundAudio.on('loadedmetadata', syncAudioState);
    const unsubVolume = backgroundAudio.on('volumechange', syncAudioState);
    const unsubRate = backgroundAudio.on('ratechange', syncAudioState);

    return () => {
      unsubPlay();
      unsubPause();
      unsubTimeUpdate();
      unsubEnded();
      unsubMetadata();
      unsubVolume();
      unsubRate();
    };
  }, [syncAudioState]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, []);

  return {
    // State
    contentAtom: store.contentAtom,
    modality: store.modality,
    isPlaying: store.isPlaying,
    currentTime: store.currentTime,
    duration: store.duration,
    volume: store.volume,
    playbackRate: store.playbackRate,
    buffered: store.buffered,
    isMinimized: store.isMinimized,
    isVisible: store.isVisible,

    // Actions
    play: store.play,
    pause: store.pause,
    togglePlayPause: store.togglePlayPause,
    seek: store.seek,
    seekRelative: store.seekRelative,
    setVolume: (vol: number) => {
      store.setVolume(vol);
      backgroundAudio.setVolume(vol);
    },
    setPlaybackRate: (rate: number) => {
      store.setPlaybackRate(rate);
      backgroundAudio.setPlaybackRate(rate);
    },
    switchModality: store.switchModality,
    loadContent: store.loadContent,
    setIsMinimized: store.setIsMinimized,
    close: store.close,

    // Utility
    progress: store.duration > 0 ? (store.currentTime / store.duration) * 100 : 0,
    formattedCurrentTime: formatTime(store.currentTime),
    formattedDuration: formatTime(store.duration),
  };
}

/**
 * Format time in seconds to MM:SS or HH:MM:SS
 */
function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return '0:00';
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export { formatTime };
