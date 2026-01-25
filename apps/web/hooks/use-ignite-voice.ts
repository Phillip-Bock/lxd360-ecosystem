'use client';

import { useCallback, useRef, useState } from 'react';
import { logger } from '@/lib/logger';

const log = logger.scope('useIgniteVoice');

// ============================================================================
// USE IGNITE VOICE HOOK
// Handles audio playback from Base64-encoded audio data
// ============================================================================

export interface UseIgniteVoiceReturn {
  /** Play audio from a Base64-encoded string */
  playAudio: (base64Audio: string) => Promise<void>;
  /** Stop currently playing audio */
  stopAudio: () => void;
  /** Whether audio is currently playing */
  isSpeaking: boolean;
  /** Whether audio is loading/buffering */
  isLoading: boolean;
  /** Error message if playback failed */
  error: string | null;
}

/**
 * Hook for playing Ignite Coach voice audio
 *
 * Converts Base64-encoded MP3 audio to a playable blob and manages playback state.
 * Tracks speaking state for avatar lip-sync animation.
 *
 * @example
 * ```tsx
 * function IgniteCoach() {
 *   const { playAudio, isSpeaking } = useIgniteVoice();
 *
 *   const handleResponse = async (data) => {
 *     if (data.audio) {
 *       await playAudio(data.audio);
 *     }
 *   };
 *
 *   return <AvatarStage animationState={isSpeaking ? 'talking' : 'idle'} />;
 * }
 * ```
 */
export function useIgniteVoice(): UseIgniteVoiceReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Keep reference to current audio element for cleanup
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  /**
   * Clean up audio resources
   */
  const cleanup = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  /**
   * Stop currently playing audio
   */
  const stopAudio = useCallback(() => {
    cleanup();
    setIsSpeaking(false);
    setIsLoading(false);
  }, [cleanup]);

  /**
   * Play audio from Base64-encoded string
   */
  const playAudio = useCallback(
    async (base64Audio: string): Promise<void> => {
      // Stop any currently playing audio
      stopAudio();
      setError(null);
      setIsLoading(true);

      try {
        // Validate input
        if (!base64Audio || typeof base64Audio !== 'string') {
          throw new Error('Invalid audio data');
        }

        // Convert Base64 to Blob
        const binaryString = atob(base64Audio);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'audio/mp3' });

        // Create object URL
        const url = URL.createObjectURL(blob);
        objectUrlRef.current = url;

        // Create and configure audio element
        const audio = new Audio(url);
        audioRef.current = audio;

        // Set up event handlers
        audio.onplay = () => {
          setIsSpeaking(true);
          setIsLoading(false);
        };

        audio.onended = () => {
          setIsSpeaking(false);
          cleanup();
        };

        audio.onerror = (e) => {
          log.error('Audio playback error', new Error(String(e)));
          setError('Failed to play audio');
          setIsSpeaking(false);
          setIsLoading(false);
          cleanup();
        };

        audio.onpause = () => {
          // Only set speaking to false if audio has ended
          // (pause can be called during cleanup)
          if (audio.ended) {
            setIsSpeaking(false);
          }
        };

        // Start playback
        await audio.play();
      } catch (err) {
        log.error('Error playing audio', err instanceof Error ? err : new Error(String(err)));
        setError(err instanceof Error ? err.message : 'Failed to play audio');
        setIsSpeaking(false);
        setIsLoading(false);
        cleanup();
      }
    },
    [cleanup, stopAudio],
  );

  return {
    playAudio,
    stopAudio,
    isSpeaking,
    isLoading,
    error,
  };
}

export default useIgniteVoice;
