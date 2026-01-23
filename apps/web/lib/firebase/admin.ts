import 'server-only';

import { type App, cert, getApps, initializeApp, type ServiceAccount } from 'firebase-admin/app';
import { type Auth, getAuth } from 'firebase-admin/auth';
import { type Firestore, getFirestore } from 'firebase-admin/firestore';
import { getStorage, type Storage } from 'firebase-admin/storage';
import { logger } from '@/lib/logger';

const log = logger.child({ module: 'firebase-admin' });

// Build-time detection: don't throw during next build
const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build';

/**
 * Get Firebase Admin credentials
 * Supports multiple credential sources with clear error handling:
 * 1. FIREBASE_SERVICE_ACCOUNT_KEY (JSON string) - Primary/recommended
 * 2. GOOGLE_CREDENTIALS (base64 or raw JSON)
 * 3. Individual env vars (FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY)
 * 4. Application Default Credentials (ADC) for Cloud Run
 *
 * @throws Error if no credentials available at runtime (not during build)
 */
function getCredentials(): ServiceAccount | undefined {
  // Option 1: FIREBASE_SERVICE_ACCOUNT_KEY (primary method per user requirements)
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (serviceAccountKey) {
    try {
      const parsed = JSON.parse(serviceAccountKey);
      if (parsed.project_id) {
        log.debug('Using FIREBASE_SERVICE_ACCOUNT_KEY credentials');
        return parsed as ServiceAccount;
      }
    } catch (error) {
      log.error('FIREBASE ADMIN INIT ERROR: Invalid JSON in FIREBASE_SERVICE_ACCOUNT_KEY', {
        error,
      });
      if (!isBuildTime) {
        throw new Error(
          'FIREBASE_SERVICE_ACCOUNT_KEY contains invalid JSON. Please check your environment configuration.',
        );
      }
    }
  }

  // Option 2: Full JSON credentials in GOOGLE_CREDENTIALS
  const googleCredentials = process.env.GOOGLE_CREDENTIALS;
  if (googleCredentials) {
    try {
      // Try base64 decode first
      const decoded = Buffer.from(googleCredentials, 'base64').toString('utf-8');
      const parsed = JSON.parse(decoded);
      if (parsed.project_id) {
        log.debug('Using GOOGLE_CREDENTIALS (base64) credentials');
        return parsed as ServiceAccount;
      }
    } catch {
      // Try raw JSON
      try {
        const parsed = JSON.parse(googleCredentials);
        if (parsed.project_id) {
          log.debug('Using GOOGLE_CREDENTIALS (raw JSON) credentials');
          return parsed as ServiceAccount;
        }
      } catch {
        log.warn('Failed to parse GOOGLE_CREDENTIALS');
      }
    }
  }

  // Option 3: Individual environment variables
  const projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (projectId && clientEmail && privateKey) {
    log.debug('Using individual environment variable credentials');
    return {
      projectId,
      clientEmail,
      privateKey,
    } as ServiceAccount;
  }

  // Option 4: Application Default Credentials (ADC) for Cloud Run
  // When running on Cloud Run, ADC are automatically available
  if (process.env.K_SERVICE || process.env.GOOGLE_CLOUD_PROJECT) {
    log.debug('Using Application Default Credentials (ADC)');
    return undefined;
  }

  // No credentials found - warn during build, throw at runtime
  if (isBuildTime) {
    log.warn(
      '⚠️ FIREBASE_SERVICE_ACCOUNT_KEY missing. Admin SDK initialized without credentials for build.',
    );
    return undefined;
  }

  // Runtime with no credentials - throw clear error
  throw new Error(
    'CRITICAL: Firebase Admin credentials not configured. ' +
      'Set FIREBASE_SERVICE_ACCOUNT_KEY or GOOGLE_CREDENTIALS environment variable.',
  );
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
