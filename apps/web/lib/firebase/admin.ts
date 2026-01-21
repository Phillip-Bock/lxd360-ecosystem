import { type App, cert, getApps, initializeApp, type ServiceAccount } from 'firebase-admin/app';
import { type Auth, getAuth } from 'firebase-admin/auth';
import { type Firestore, getFirestore } from 'firebase-admin/firestore';
import { getStorage, type Storage } from 'firebase-admin/storage';
import { logger } from '@/lib/logger';

const log = logger.child({ module: 'firebase-admin' });

/**
 * Get Firebase Admin credentials
 * Supports both JSON string and individual environment variables
 */
function getCredentials(): ServiceAccount | undefined {
  // Option 1: Full JSON credentials in GOOGLE_CREDENTIALS
  const googleCredentials = process.env.GOOGLE_CREDENTIALS;
  if (googleCredentials) {
    try {
      // Try base64 decode first
      const decoded = Buffer.from(googleCredentials, 'base64').toString('utf-8');
      const parsed = JSON.parse(decoded);
      if (parsed.project_id) {
        return parsed as ServiceAccount;
      }
    } catch {
      // Try raw JSON
      try {
        const parsed = JSON.parse(googleCredentials);
        if (parsed.project_id) {
          return parsed as ServiceAccount;
        }
      } catch {
        log.warn('Failed to parse GOOGLE_CREDENTIALS');
      }
    }
  }

  // Option 2: Individual environment variables
  const projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (projectId && clientEmail && privateKey) {
    return {
      projectId,
      clientEmail,
      privateKey,
    } as ServiceAccount;
  }

  // Option 3: Default credentials (Cloud Run automatically provides these)
  // When running on Cloud Run, ADC (Application Default Credentials) are available
  log.debug('Using Application Default Credentials');
  return undefined;
}

/**
 * Initialize Firebase Admin app (singleton pattern)
 */
function getFirebaseAdminApp(): App {
  if (getApps().length === 0) {
    const credentials = getCredentials();

    if (credentials) {
      return initializeApp({
        credential: cert(credentials),
        projectId: (credentials.projectId as string) || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
    }

    // Initialize without credentials (relies on ADC)
    return initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
  }
  return getApps()[0];
}

// Initialize Firebase Admin app
const adminApp = getFirebaseAdminApp();

/**
 * Firebase Admin Auth instance
 * Use for verifying tokens and managing users
 */
export const adminAuth: Auth = getAuth(adminApp);

/**
 * Firebase Admin Firestore instance
 * Use for server-side database operations
 */
export const adminDb: Firestore = getFirestore(adminApp);

/**
 * Firebase Admin Storage instance
 * Use for server-side storage operations
 */
export const adminStorage: Storage = getStorage(adminApp);

/**
 * Firebase Admin app instance
 */
export { adminApp };

/**
 * Verify a Firebase ID token
 * @param idToken - The ID token to verify
 * @returns The decoded token claims, or null if invalid
 */
export async function verifyIdToken(idToken: string) {
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    log.error('Failed to verify ID token', { error });
    return null;
  }
}

/**
 * Get user by ID
 * @param uid - The user's Firebase UID
 * @returns The user record, or null if not found
 */
export async function getUserById(uid: string) {
  try {
    const userRecord = await adminAuth.getUser(uid);
    return userRecord;
  } catch (error) {
    log.error('Failed to get user', { uid, error });
    return null;
  }
}

/**
 * Get user by email
 * @param email - The user's email address
 * @returns The user record, or null if not found
 */
export async function getUserByEmail(email: string) {
  try {
    const userRecord = await adminAuth.getUserByEmail(email);
    return userRecord;
  } catch (error) {
    log.error('Failed to get user by email', { email, error });
    return null;
  }
}

// Re-export types
export type { App } from 'firebase-admin/app';
export type { Auth, DecodedIdToken, UserRecord } from 'firebase-admin/auth';
export type {
  CollectionReference,
  DocumentData,
  DocumentReference,
  DocumentSnapshot,
  FieldValue,
  Firestore,
  Query,
  QuerySnapshot,
  Timestamp,
} from 'firebase-admin/firestore';
