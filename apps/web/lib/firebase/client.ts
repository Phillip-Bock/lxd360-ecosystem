import { type FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { type Auth, getAuth } from 'firebase/auth';
import { type Firestore, getFirestore } from 'firebase/firestore';
import { type FirebaseStorage, getStorage } from 'firebase/storage';

export type { FirebaseApp } from 'firebase/app';
// Re-export Firebase types for consumers
export type { Auth, User, UserCredential } from 'firebase/auth';
export type {
  CollectionReference,
  DocumentData,
  DocumentReference,
  DocumentSnapshot,
  Firestore,
  Query,
  QuerySnapshot,
} from 'firebase/firestore';
export type { FirebaseStorage, StorageReference } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// GLOBAL SINGLETONS (Prevents re-init loops)
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;
let storageInstance: FirebaseStorage | null = null;

function getAppInstance(): FirebaseApp | null {
  if (typeof window === 'undefined') return null;
  if (!getApps().length) {
    try {
      return initializeApp(firebaseConfig);
    } catch (e) {
      console.error('Firebase Init Error:', e);
      return null;
    }
  }
  return getApp();
}

/**
 * Get Firebase Auth instance (may return null on server)
 */
export const getFirebaseAuth = (): Auth | null => {
  if (!authInstance) {
    const app = getAppInstance();
    if (app) authInstance = getAuth(app);
  }
  return authInstance;
};

/**
 * Get Firebase Auth instance with guarantee (throws on server/failure)
 */
export const requireAuth = (): Auth => {
  const auth = getFirebaseAuth();
  if (!auth) {
    throw new Error('Firebase Auth not initialized. Are you on the server?');
  }
  return auth;
};

/**
 * Get Firestore instance (may return null on server)
 */
export const getFirebaseDb = (): Firestore | null => {
  if (!dbInstance) {
    const app = getAppInstance();
    if (app) dbInstance = getFirestore(app);
  }
  return dbInstance;
};

/**
 * Get Firestore instance with guarantee (throws on server/failure)
 */
export const requireDb = (): Firestore => {
  const db = getFirebaseDb();
  if (!db) {
    throw new Error('Firestore not initialized. Are you on the server?');
  }
  return db;
};

/**
 * Get Firebase Storage instance (may return null on server)
 */
export const getFirebaseStorage = (): FirebaseStorage | null => {
  if (!storageInstance) {
    const app = getAppInstance();
    if (app) storageInstance = getStorage(app);
  }
  return storageInstance;
};

/**
 * Get Firebase Storage instance with guarantee (throws on server/failure)
 */
export const requireStorage = (): FirebaseStorage => {
  const storage = getFirebaseStorage();
  if (!storage) {
    throw new Error('Firebase Storage not initialized. Are you on the server?');
  }
  return storage;
};
