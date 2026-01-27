import {
  addDoc,
  collection,
  type DocumentData,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  type Timestamp,
  where,
} from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase/client';
import { logger } from '@/lib/logger';

const log = logger.scope('NeuronautPersistence');

// ============================================================================
// TYPES
// ============================================================================

export type MessageRole = 'user' | 'assistant';

export interface NeuronautMessage {
  id: string;
  role: MessageRole;
  content: string;
  audio?: string; // Base64 audio or URL
  transcript?: string; // STT transcript
  animation?: string; // Avatar animation directive
  timestamp: Date;
  tokenUsage?: number;
}

export interface NeuronautSession {
  id: string;
  userId: string;
  tenantId?: string;
  courseId?: string;
  courseName?: string;
  startedAt: Date;
  endedAt?: Date;
  messageCount: number;
  lastUpdated: Date;
}

export interface SessionWithMessages extends NeuronautSession {
  messages: NeuronautMessage[];
}

// ============================================================================
// FIRESTORE HELPERS
// ============================================================================

/**
 * Convert Firestore timestamp to Date
 */
function toDate(timestamp: Timestamp | Date | undefined): Date {
  if (!timestamp) return new Date();
  if (timestamp instanceof Date) return timestamp;
  return timestamp.toDate();
}

/**
 * Convert Firestore document to NeuronautSession
 */
function docToSession(docData: DocumentData, docId: string): NeuronautSession {
  return {
    id: docId,
    userId: docData.userId,
    tenantId: docData.tenantId,
    courseId: docData.courseId,
    courseName: docData.courseName,
    startedAt: toDate(docData.startedAt),
    endedAt: docData.endedAt ? toDate(docData.endedAt) : undefined,
    messageCount: docData.messageCount || 0,
    lastUpdated: toDate(docData.lastUpdated),
  };
}

/**
 * Convert Firestore document to NeuronautMessage
 */
function docToMessage(docData: DocumentData, docId: string): NeuronautMessage {
  return {
    id: docId,
    role: docData.role,
    content: docData.content,
    audio: docData.audio,
    transcript: docData.transcript,
    animation: docData.animation,
    timestamp: toDate(docData.timestamp),
    tokenUsage: docData.tokenUsage,
  };
}

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

/**
 * Create a new Neuro-naut session
 */
export async function createSession(params: {
  userId: string;
  tenantId?: string;
  courseId?: string;
  courseName?: string;
}): Promise<NeuronautSession> {
  const { userId, tenantId, courseId, courseName } = params;

  try {
    const db = getFirebaseDb();
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const sessionsRef = collection(db, 'users', userId, 'neuronaut_sessions');
    const sessionData = {
      userId,
      tenantId: tenantId || null,
      courseId: courseId || null,
      courseName: courseName || null,
      startedAt: serverTimestamp(),
      messageCount: 0,
      lastUpdated: serverTimestamp(),
    };

    const docRef = await addDoc(sessionsRef, sessionData);
    log.info('Created Neuro-naut session', { sessionId: docRef.id, userId });

    return {
      id: docRef.id,
      userId,
      tenantId,
      courseId,
      courseName,
      startedAt: new Date(),
      messageCount: 0,
      lastUpdated: new Date(),
    };
  } catch (error) {
    log.error(
      'Failed to create session',
      error instanceof Error ? error : new Error(String(error)),
    );
    throw error;
  }
}

/**
 * Get the most recent session for a user (optionally filtered by course)
 */
export async function getRecentSession(params: {
  userId: string;
  courseId?: string;
}): Promise<NeuronautSession | null> {
  const { userId, courseId } = params;

  try {
    const db = getFirebaseDb();
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const sessionsRef = collection(db, 'users', userId, 'neuronaut_sessions');
    let q = query(sessionsRef, orderBy('lastUpdated', 'desc'), limit(1));

    if (courseId) {
      q = query(
        sessionsRef,
        where('courseId', '==', courseId),
        orderBy('lastUpdated', 'desc'),
        limit(1),
      );
    }

    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return null;
    }

    const docSnap = snapshot.docs[0];
    return docToSession(docSnap.data(), docSnap.id);
  } catch (error) {
    log.error(
      'Failed to get recent session',
      error instanceof Error ? error : new Error(String(error)),
    );
    return null;
  }
}

/**
 * Get all sessions for a user
 */
export async function getUserSessions(params: {
  userId: string;
  maxResults?: number;
}): Promise<NeuronautSession[]> {
  const { userId, maxResults = 20 } = params;

  try {
    const db = getFirebaseDb();
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const sessionsRef = collection(db, 'users', userId, 'neuronaut_sessions');
    const q = query(sessionsRef, orderBy('lastUpdated', 'desc'), limit(maxResults));

    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => docToSession(docSnap.data(), docSnap.id));
  } catch (error) {
    log.error(
      'Failed to get user sessions',
      error instanceof Error ? error : new Error(String(error)),
    );
    return [];
  }
}

/**
 * End a session (set endedAt timestamp)
 */
export async function endSession(params: { userId: string; sessionId: string }): Promise<void> {
  const { userId, sessionId } = params;

  try {
    const db = getFirebaseDb();
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const sessionRef = doc(db, 'users', userId, 'neuronaut_sessions', sessionId);
    await setDoc(
      sessionRef,
      {
        endedAt: serverTimestamp(),
        lastUpdated: serverTimestamp(),
      },
      { merge: true },
    );

    log.info('Ended Neuro-naut session', { sessionId, userId });
  } catch (error) {
    log.error('Failed to end session', error instanceof Error ? error : new Error(String(error)));
  }
}

// ============================================================================
// MESSAGE MANAGEMENT
// ============================================================================

/**
 * Add a message to a session
 */
export async function addMessage(params: {
  userId: string;
  sessionId: string;
  message: Omit<NeuronautMessage, 'id' | 'timestamp'>;
}): Promise<NeuronautMessage> {
  const { userId, sessionId, message } = params;

  try {
    const db = getFirebaseDb();
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const messagesRef = collection(
      db,
      'users',
      userId,
      'neuronaut_sessions',
      sessionId,
      'messages',
    );

    const messageData = {
      ...message,
      timestamp: serverTimestamp(),
    };

    const docRef = await addDoc(messagesRef, messageData);

    // Update session message count and lastUpdated
    const sessionRef = doc(db, 'users', userId, 'neuronaut_sessions', sessionId);
    const sessionSnap = await getDoc(sessionRef);
    const currentCount = sessionSnap.exists() ? sessionSnap.data().messageCount || 0 : 0;

    await setDoc(
      sessionRef,
      {
        messageCount: currentCount + 1,
        lastUpdated: serverTimestamp(),
      },
      { merge: true },
    );

    log.debug('Added message to session', { sessionId, messageId: docRef.id });

    return {
      id: docRef.id,
      ...message,
      timestamp: new Date(),
    };
  } catch (error) {
    log.error('Failed to add message', error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
}

/**
 * Get messages from a session
 */
export async function getSessionMessages(params: {
  userId: string;
  sessionId: string;
  maxMessages?: number;
}): Promise<NeuronautMessage[]> {
  const { userId, sessionId, maxMessages = 50 } = params;

  try {
    const db = getFirebaseDb();
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const messagesRef = collection(
      db,
      'users',
      userId,
      'neuronaut_sessions',
      sessionId,
      'messages',
    );

    const q = query(messagesRef, orderBy('timestamp', 'asc'), limit(maxMessages));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((docSnap) => docToMessage(docSnap.data(), docSnap.id));
  } catch (error) {
    log.error(
      'Failed to get session messages',
      error instanceof Error ? error : new Error(String(error)),
    );
    return [];
  }
}

/**
 * Get a full session with messages
 */
export async function getSessionWithMessages(params: {
  userId: string;
  sessionId: string;
}): Promise<SessionWithMessages | null> {
  const { userId, sessionId } = params;

  try {
    const db = getFirebaseDb();
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const sessionRef = doc(db, 'users', userId, 'neuronaut_sessions', sessionId);
    const sessionSnap = await getDoc(sessionRef);

    if (!sessionSnap.exists()) {
      return null;
    }

    const session = docToSession(sessionSnap.data(), sessionSnap.id);
    const messages = await getSessionMessages({ userId, sessionId });

    return {
      ...session,
      messages,
    };
  } catch (error) {
    log.error(
      'Failed to get session with messages',
      error instanceof Error ? error : new Error(String(error)),
    );
    return null;
  }
}

// ============================================================================
// TRANSCRIPT EXPORT
// ============================================================================

/**
 * Generate a transcript text from session messages
 */
export function generateTranscriptText(
  session: NeuronautSession,
  messages: NeuronautMessage[],
): string {
  const lines: string[] = [
    '='.repeat(60),
    'NEURO-NAUT CONVERSATION TRANSCRIPT',
    '='.repeat(60),
    '',
    `Session ID: ${session.id}`,
    `Date: ${session.startedAt.toLocaleDateString()} ${session.startedAt.toLocaleTimeString()}`,
    session.courseName ? `Course: ${session.courseName}` : '',
    `Messages: ${messages.length}`,
    '',
    '-'.repeat(60),
    '',
  ];

  for (const msg of messages) {
    const speaker = msg.role === 'user' ? 'You' : 'Neuro-naut';
    const time = msg.timestamp.toLocaleTimeString();
    lines.push(`[${time}] ${speaker}:`);
    lines.push(msg.content);
    lines.push('');
  }

  lines.push('-'.repeat(60));
  lines.push('');
  lines.push('Generated by LXD360 INSPIRE Platform');
  lines.push(`Export time: ${new Date().toISOString()}`);

  return lines.filter((line) => line !== undefined).join('\n');
}

/**
 * Download transcript as a text file
 */
export function downloadTranscript(session: NeuronautSession, messages: NeuronautMessage[]): void {
  const transcript = generateTranscriptText(session, messages);
  const blob = new Blob([transcript], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `neuronaut-transcript-${session.id.slice(0, 8)}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
