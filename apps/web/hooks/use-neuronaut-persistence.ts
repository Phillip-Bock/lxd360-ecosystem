'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { logger } from '@/lib/logger';
import {
  addMessage,
  createSession,
  downloadTranscript,
  getRecentSession,
  getSessionMessages,
  type NeuronautMessage,
  type NeuronautSession,
} from '@/lib/neuronaut/session-persistence';

const log = logger.scope('useNeuronautPersistence');

// ============================================================================
// TYPES
// ============================================================================

export interface UseNeuronautPersistenceOptions {
  /** User ID (required for persistence) */
  userId?: string;
  /** Tenant ID (optional) */
  tenantId?: string;
  /** Course ID for context */
  courseId?: string;
  /** Course name for display */
  courseName?: string;
  /** Auto-create session if none exists */
  autoCreateSession?: boolean;
  /** Auto-save messages (with debounce) */
  autoSave?: boolean;
  /** Debounce delay for auto-save (ms) */
  debounceMs?: number;
}

export interface UseNeuronautPersistenceReturn {
  /** Current session (null if not started) */
  session: NeuronautSession | null;
  /** Messages from the session */
  messages: NeuronautMessage[];
  /** Whether session is loading */
  isLoading: boolean;
  /** Error message if any */
  error: string | null;
  /** Start or resume a session */
  startSession: () => Promise<void>;
  /** Add a message to the session */
  saveMessage: (message: Omit<NeuronautMessage, 'id' | 'timestamp'>) => Promise<void>;
  /** Download transcript */
  exportTranscript: () => void;
  /** Clear local state (does not delete from Firestore) */
  clearLocal: () => void;
  /** Whether persistence is available */
  isAvailable: boolean;
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

/**
 * Hook for Neuro-naut session persistence
 *
 * Manages session lifecycle, message persistence, and transcript export.
 * Integrates with Firestore for cross-device persistence.
 *
 * @example
 * ```tsx
 * function NeuronautChat() {
 *   const { session, messages, saveMessage, startSession } = useNeuronautPersistence({
 *     userId: user.uid,
 *     courseId: currentCourse.id,
 *     autoCreateSession: true,
 *   });
 *
 *   const handleSend = async (text: string) => {
 *     await saveMessage({ role: 'user', content: text });
 *     const response = await getAIResponse(text);
 *     await saveMessage({ role: 'assistant', content: response });
 *   };
 *
 *   return (
 *     <ChatMessages messages={messages} />
 *   );
 * }
 * ```
 */
export function useNeuronautPersistence(
  options: UseNeuronautPersistenceOptions = {},
): UseNeuronautPersistenceReturn {
  const {
    userId,
    tenantId,
    courseId,
    courseName,
    autoCreateSession = true,
    autoSave = true,
    debounceMs = 500,
  } = options;

  const [session, setSession] = useState<NeuronautSession | null>(null);
  const [messages, setMessages] = useState<NeuronautMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pendingMessagesRef = useRef<Omit<NeuronautMessage, 'id' | 'timestamp'>[]>([]);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isAvailable = !!userId;

  /**
   * Flush pending messages to Firestore
   */
  const flushPendingMessages = useCallback(async () => {
    if (!userId || !session || pendingMessagesRef.current.length === 0) {
      return;
    }

    const messagesToSave = [...pendingMessagesRef.current];
    pendingMessagesRef.current = [];

    try {
      for (const msg of messagesToSave) {
        const savedMessage = await addMessage({
          userId,
          sessionId: session.id,
          message: msg,
        });
        setMessages((prev) => [...prev, savedMessage]);
      }
    } catch (err) {
      log.error('Failed to save messages', err instanceof Error ? err : new Error(String(err)));
      // Re-add failed messages to pending queue
      pendingMessagesRef.current = [...messagesToSave, ...pendingMessagesRef.current];
    }
  }, [userId, session]);

  /**
   * Start or resume a session
   */
  const startSession = useCallback(async () => {
    if (!userId) {
      setError('User ID required for session persistence');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Try to get recent session for this course
      let existingSession = await getRecentSession({ userId, courseId });

      // Check if session is still "active" (started within last 24 hours and not ended)
      if (existingSession) {
        const sessionAge = Date.now() - existingSession.startedAt.getTime();
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours

        if (existingSession.endedAt || sessionAge > maxAge) {
          existingSession = null; // Session expired, create new one
        }
      }

      if (existingSession) {
        // Resume existing session
        setSession(existingSession);
        const existingMessages = await getSessionMessages({
          userId,
          sessionId: existingSession.id,
        });
        setMessages(existingMessages);
        log.info('Resumed session', { sessionId: existingSession.id });
      } else if (autoCreateSession) {
        // Create new session
        const newSession = await createSession({
          userId,
          tenantId,
          courseId,
          courseName,
        });
        setSession(newSession);
        setMessages([]);
        log.info('Created new session', { sessionId: newSession.id });
      }
    } catch (err) {
      log.error('Failed to start session', err instanceof Error ? err : new Error(String(err)));
      setError('Failed to start session');
    } finally {
      setIsLoading(false);
    }
  }, [userId, tenantId, courseId, courseName, autoCreateSession]);

  /**
   * Save a message to the session
   */
  const saveMessage = useCallback(
    async (message: Omit<NeuronautMessage, 'id' | 'timestamp'>) => {
      if (!autoSave || !userId || !session) {
        // If not auto-saving, just add to local state
        setMessages((prev) => [
          ...prev,
          { ...message, id: `local-${Date.now()}`, timestamp: new Date() },
        ]);
        return;
      }

      // Add to pending queue
      pendingMessagesRef.current.push(message);

      // Debounce the save
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        flushPendingMessages();
      }, debounceMs);
    },
    [autoSave, userId, session, debounceMs, flushPendingMessages],
  );

  /**
   * Export transcript
   */
  const exportTranscript = useCallback(() => {
    if (!session) {
      log.warn('No session to export');
      return;
    }
    downloadTranscript(session, messages);
  }, [session, messages]);

  /**
   * Clear local state
   */
  const clearLocal = useCallback(() => {
    setMessages([]);
    pendingMessagesRef.current = [];
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
  }, []);

  // Auto-start session on mount if userId is available
  useEffect(() => {
    if (userId && autoCreateSession && !session && !isLoading) {
      startSession();
    }
  }, [userId, autoCreateSession, session, isLoading, startSession]);

  // Flush pending messages before unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      // Attempt to save any pending messages
      if (pendingMessagesRef.current.length > 0) {
        flushPendingMessages();
      }
    };
  }, [flushPendingMessages]);

  return {
    session,
    messages,
    isLoading,
    error,
    startSession,
    saveMessage,
    exportTranscript,
    clearLocal,
    isAvailable,
  };
}

export default useNeuronautPersistence;
