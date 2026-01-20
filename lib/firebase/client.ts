'use client';

import { type FirebaseApp, getApps, initializeApp } from 'firebase/app';
import { type Auth, getAuth } from 'firebase/auth';
import { type Firestore, getFirestore } from 'firebase/firestore';
import { type FirebaseStorage, getStorage } from 'firebase/storage';

/**
 * Firebase configuration from environment variables
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Lazy-initialized singletons
let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;
let _storage: FirebaseStorage | null = null;

/**
 * Get Firebase app instance (lazy initialization)
 * Only initializes when actually called at runtime
 */
export function getFirebaseApp(): FirebaseApp {
  if (!_app) {
    _app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  }
  return _app;
}

/**
 * Get Firebase Auth instance (lazy initialization)
 */
export function getFirebaseAuth(): Auth {
  if (!_auth) {
    _auth = getAuth(getFirebaseApp());
  }
  return _auth;
}

/**
 * Get Firestore instance (lazy initialization)
 */
export function getFirebaseDb(): Firestore {
  if (!_db) {
    _db = getFirestore(getFirebaseApp());
  }
  return _db;
}

/**
 * Get Cloud Storage instance (lazy initialization)
 */
export function getFirebaseStorage(): FirebaseStorage {
  if (!_storage) {
    _storage = getStorage(getFirebaseApp());
  }
  return _storage;
}

// Backwards compatibility - guarded by typeof window check
// Returns null during build, works at runtime in browser
export const app =
  typeof window !== 'undefined' ? getFirebaseApp() : (null as unknown as FirebaseApp);
export const auth = typeof window !== 'undefined' ? getFirebaseAuth() : (null as unknown as Auth);
export const db = typeof window !== 'undefined' ? getFirebaseDb() : (null as unknown as Firestore);
export const storage =
  typeof window !== 'undefined' ? getFirebaseStorage() : (null as unknown as FirebaseStorage);

// Re-export types
export type { FirebaseApp } from 'firebase/app';
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
