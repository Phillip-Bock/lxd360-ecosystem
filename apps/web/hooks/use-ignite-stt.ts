'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { logger } from '@/lib/logger';

const log = logger.scope('useIgniteSTT');

// ============================================================================
// WEB SPEECH API TYPES
// ============================================================================

// Extend Window interface for Speech Recognition API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((ev: Event) => void) | null;
  onend: ((ev: Event) => void) | null;
  onresult: ((ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((ev: SpeechRecognitionErrorEvent) => void) | null;
  onspeechstart: ((ev: Event) => void) | null;
  onspeechend: ((ev: Event) => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

// ============================================================================
// HOOK TYPES
// ============================================================================

export type STTStatus = 'idle' | 'listening' | 'processing' | 'error';

export interface UseIgniteSTTOptions {
  /** Language for speech recognition (default: 'en-US') */
  language?: string;
  /** Enable continuous listening mode */
  continuous?: boolean;
  /** Include interim (partial) results */
  interimResults?: boolean;
  /** Callback when final transcript is ready */
  onTranscript?: (transcript: string) => void;
  /** Callback for interim transcript updates */
  onInterimTranscript?: (transcript: string) => void;
  /** Callback when error occurs */
  onError?: (error: string) => void;
}

export interface UseIgniteSTTReturn {
  /** Start listening for speech */
  startListening: () => void;
  /** Stop listening */
  stopListening: () => void;
  /** Current transcript (final) */
  transcript: string;
  /** Current interim transcript (partial) */
  interimTranscript: string;
  /** Current status */
  status: STTStatus;
  /** Whether currently listening */
  isListening: boolean;
  /** Error message if any */
  error: string | null;
  /** Whether STT is supported in this browser */
  isSupported: boolean;
  /** Clear the transcript */
  clearTranscript: () => void;
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

/**
 * Hook for Speech-to-Text using Web Speech API
 *
 * Provides real-time transcription of user speech with support for
 * interim results, error handling, and accessibility features.
 *
 * @example
 * ```tsx
 * function VoiceInput() {
 *   const { startListening, stopListening, transcript, isListening, isSupported } =
 *     useIgniteSTT({
 *       onTranscript: (text) => handleSubmit(text),
 *     });
 *
 *   if (!isSupported) {
 *     return <p>Speech recognition not supported</p>;
 *   }
 *
 *   return (
 *     <button onClick={isListening ? stopListening : startListening}>
 *       {isListening ? 'Stop' : 'Start'} Listening
 *     </button>
 *   );
 * }
 * ```
 */
export function useIgniteSTT(options: UseIgniteSTTOptions = {}): UseIgniteSTTReturn {
  const {
    language = 'en-US',
    continuous = false,
    interimResults = true,
    onTranscript,
    onInterimTranscript,
    onError,
  } = options;

  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [status, setStatus] = useState<STTStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const onTranscriptRef = useRef(onTranscript);
  const onInterimTranscriptRef = useRef(onInterimTranscript);
  const onErrorRef = useRef(onError);

  // Keep callback refs updated
  useEffect(() => {
    onTranscriptRef.current = onTranscript;
    onInterimTranscriptRef.current = onInterimTranscript;
    onErrorRef.current = onError;
  }, [onTranscript, onInterimTranscript, onError]);

  // Check for browser support on mount
  useEffect(() => {
    const SpeechRecognitionAPI =
      typeof window !== 'undefined'
        ? window.SpeechRecognition || window.webkitSpeechRecognition
        : null;

    setIsSupported(!!SpeechRecognitionAPI);

    if (!SpeechRecognitionAPI) {
      log.warn('Speech Recognition API not supported in this browser');
    }
  }, []);

  /**
   * Initialize speech recognition instance
   */
  const initRecognition = useCallback(() => {
    if (typeof window === 'undefined') return null;

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      return null;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.lang = language;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      log.info('Speech recognition started');
      setStatus('listening');
      setError(null);
    };

    recognition.onend = () => {
      log.info('Speech recognition ended');
      setStatus('idle');
      setInterimTranscript('');
    };

    recognition.onspeechstart = () => {
      log.debug('Speech detected');
    };

    recognition.onspeechend = () => {
      log.debug('Speech ended');
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimText = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimText += result[0].transcript;
        }
      }

      if (interimText) {
        setInterimTranscript(interimText);
        onInterimTranscriptRef.current?.(interimText);
      }

      if (finalTranscript) {
        const cleanedTranscript = finalTranscript.trim();
        setTranscript((prev) => {
          const newTranscript = prev ? `${prev} ${cleanedTranscript}` : cleanedTranscript;
          return newTranscript;
        });
        setInterimTranscript('');
        onTranscriptRef.current?.(cleanedTranscript);
        log.info('Final transcript received', { transcript: cleanedTranscript });
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      let errorMessage: string;

      switch (event.error) {
        case 'not-allowed':
        case 'permission-denied':
          errorMessage = 'Microphone permission denied. Please allow microphone access.';
          break;
        case 'no-speech':
          errorMessage = 'No speech detected. Please try again.';
          break;
        case 'audio-capture':
          errorMessage = 'No microphone found. Please check your device.';
          break;
        case 'network':
          errorMessage = 'Network error. Please check your connection.';
          break;
        case 'aborted':
          errorMessage = 'Speech recognition aborted.';
          break;
        default:
          errorMessage = `Speech recognition error: ${event.error}`;
      }

      log.error('Speech recognition error', new Error(errorMessage));
      setError(errorMessage);
      setStatus('error');
      onErrorRef.current?.(errorMessage);
    };

    return recognition;
  }, [continuous, interimResults, language]);

  /**
   * Start listening for speech
   */
  const startListening = useCallback(() => {
    if (!isSupported) {
      const msg = 'Speech recognition is not supported in this browser';
      setError(msg);
      onErrorRef.current?.(msg);
      return;
    }

    // Stop any existing recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // Ignore abort errors
      }
    }

    // Create new instance
    const recognition = initRecognition();
    if (!recognition) {
      const msg = 'Failed to initialize speech recognition';
      setError(msg);
      onErrorRef.current?.(msg);
      return;
    }

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (err) {
      log.error(
        'Failed to start speech recognition',
        err instanceof Error ? err : new Error(String(err)),
      );
      setError('Failed to start speech recognition');
      setStatus('error');
    }
  }, [isSupported, initRecognition]);

  /**
   * Stop listening
   */
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore stop errors
      }
      recognitionRef.current = null;
    }
    setStatus('idle');
    setInterimTranscript('');
  }, []);

  /**
   * Clear the transcript
   */
  const clearTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // Ignore cleanup errors
        }
      }
    };
  }, []);

  return {
    startListening,
    stopListening,
    transcript,
    interimTranscript,
    status,
    isListening: status === 'listening',
    error,
    isSupported,
    clearTranscript,
  };
}

export default useIgniteSTT;
