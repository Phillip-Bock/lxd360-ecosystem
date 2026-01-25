'use client';

import {
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  type User,
  type UserCredential,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import { logger } from '@/lib/logger';
import { getFirebaseAuth, getFirebaseDb } from './client';

const log = logger.child({ module: 'useAuth' });

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  tenantId?: string;
  role?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UseAuthReturn {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: Error | null;
  signIn: (email: string, password: string) => Promise<UserCredential | null>;
  signUp: (email: string, password: string) => Promise<UserCredential | null>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<UserCredential | null>;
  resetPassword: (email: string) => Promise<void>;
  isAuthenticated: boolean;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadProfile = useCallback(async (firebaseUser: User) => {
    try {
      const db = getFirebaseDb();
      if (!db) {
        setProfile({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified,
        });
        return;
      }

      const userRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        setProfile({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: data.displayName || firebaseUser.displayName,
          photoURL: data.photoURL || firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified,
          tenantId: data.tenantId,
          role: data.role,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        });
      } else {
        const newProfile: Partial<UserProfile> = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified,
        };

        await setDoc(userRef, {
          ...newProfile,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        setProfile(newProfile as UserProfile);
      }
    } catch (err) {
      log.error('Failed to load user profile', { error: err, uid: firebaseUser.uid });
      setProfile({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        emailVerified: firebaseUser.emailVerified,
      });
    }
  }, []);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) {
      log.warn('Firebase auth not available');
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        setUser(firebaseUser);

        if (firebaseUser) {
          // Force refresh token on login to get latest custom claims
          try {
            await firebaseUser.getIdToken(true);
          } catch (err) {
            log.warn('Failed to refresh token on login', { error: err });
          }
          await loadProfile(firebaseUser);
        } else {
          setProfile(null);
        }

        setLoading(false);
      },
      (err) => {
        log.error('Auth state change error', { error: err });
        setError(err);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [loadProfile]);

  // Proactive token refresh - refresh every 55 minutes (before 1-hour expiry)
  useEffect(() => {
    if (!user) return;

    const REFRESH_INTERVAL = 55 * 60 * 1000; // 55 minutes in ms

    const refreshToken = async () => {
      try {
        await user.getIdToken(true);
        log.debug('Token refreshed proactively');
      } catch (err) {
        log.error('Proactive token refresh failed', { error: err });
      }
    };

    const interval = setInterval(refreshToken, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [user]);

  const signIn = useCallback(
    async (email: string, password: string): Promise<UserCredential | null> => {
      setError(null);
      const auth = getFirebaseAuth();
      if (!auth) {
        setError(new Error('Firebase not initialized'));
        return null;
      }

      try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        log.info('User signed in', { uid: result.user.uid });
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Sign in failed');
        setError(error);
        log.error('Sign in failed', { error, email });
        throw error;
      }
    },
    [],
  );

  const signUp = useCallback(
    async (email: string, password: string): Promise<UserCredential | null> => {
      setError(null);
      const auth = getFirebaseAuth();
      if (!auth) {
        setError(new Error('Firebase not initialized'));
        return null;
      }

      try {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        log.info('User signed up', { uid: result.user.uid });
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Sign up failed');
        setError(error);
        log.error('Sign up failed', { error, email });
        throw error;
      }
    },
    [],
  );

  const signOut = useCallback(async (): Promise<void> => {
    setError(null);
    const auth = getFirebaseAuth();
    if (!auth) {
      setError(new Error('Firebase not initialized'));
      return;
    }

    try {
      // Clear server-side session cookie
      await fetch('/api/auth/session', { method: 'DELETE' });

      // Sign out from Firebase
      await firebaseSignOut(auth);
      setProfile(null);
      log.info('User signed out');
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Sign out failed');
      setError(error);
      log.error('Sign out failed', { error });
      throw error;
    }
  }, []);

  const signInWithGoogle = useCallback(async (): Promise<UserCredential | null> => {
    setError(null);
    const auth = getFirebaseAuth();
    if (!auth) {
      setError(new Error('Firebase not initialized'));
      return null;
    }

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      log.info('User signed in with Google', { uid: result.user.uid });
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Google sign in failed');
      setError(error);
      log.error('Google sign in failed', { error });
      throw error;
    }
  }, []);

  const resetPassword = useCallback(async (email: string): Promise<void> => {
    setError(null);
    const auth = getFirebaseAuth();
    if (!auth) {
      setError(new Error('Firebase not initialized'));
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      log.info('Password reset email sent', { email });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Password reset failed');
      setError(error);
      log.error('Password reset failed', { error, email });
      throw error;
    }
  }, []);

  return {
    user,
    profile,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    resetPassword,
    isAuthenticated: !!user,
  };
}
