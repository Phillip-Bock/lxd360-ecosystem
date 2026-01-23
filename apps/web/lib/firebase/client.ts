import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// GLOBAL SINGLETONS (Prevents re-init loops)
let authInstance: ReturnType<typeof getAuth> | null = null;
let dbInstance: ReturnType<typeof getFirestore> | null = null;
let storageInstance: ReturnType<typeof getStorage> | null = null;

function getAppInstance() {
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

export const getFirebaseAuth = () => {
  if (!authInstance) {
    const app = getAppInstance();
    if (app) authInstance = getAuth(app);
  }
  return authInstance;
};

export const getFirebaseDb = () => {
  if (!dbInstance) {
    const app = getAppInstance();
    if (app) dbInstance = getFirestore(app);
  }
  return dbInstance;
};

export const getFirebaseStorage = () => {
  if (!storageInstance) {
    const app = getAppInstance();
    if (app) storageInstance = getStorage(app);
  }
  return storageInstance;
};
