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
import { auth, db } from './client';

const log = logger.child({ module: 'useAuth' });

/**
 * User profile stored in Firestore
 */
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

/**
 * Auth hook return type
 */
interface UseAuthReturn {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: Error | null;
  signIn: (email: string, password: string) => Promise<UserCredential>;
  signUp: (email: string, password: string) => Promise<UserCredential>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<UserCredential>;
  resetPassword: (email: string) => Promise<void>;
  isAuthenticated: boolean;
}

/**
 * Firebase authentication hook
 *
 * @example
 * ```tsx
 * function LoginComponent() {
 *   const { user, loading, signIn, signOut, isAuthenticated } = useAuth();
 *
 *   if (loading) return <Spinner />;
 *
 *   if (isAuthenticated) {
 *     return (
 *       <div>
 *         <p>Welcome, {user?.email}</p>
 *         <button onClick={signOut}>Sign Out</button>
 *       </div>
 *     );
 *   }
 *
 *   return <LoginForm onSubmit={(email, password) => signIn(email, password)} />;
 * }
 * ```
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load user profile from Firestore
  const loadProfile = useCallback(async (firebaseUser: User) => {
    try {
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
        // Create profile if it doesn't exist
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
      // Set basic profile even if Firestore fails
      setProfile({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        emailVerified: firebaseUser.emailVerified,
      });
    }
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        setUser(firebaseUser);

        if (firebaseUser) {
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

  // Sign in with email/password
  const signIn = useCallback(async (email: string, password: string) => {
    setError(null);
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
  }, []);

  // Sign up with email/password
  const signUp = useCallback(async (email: string, password: string) => {
    setError(null);
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
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    setError(null);
    try {
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

  // Sign in with Google
  const signInWithGoogle = useCallback(async () => {
    setError(null);
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

  // Reset password
  const resetPassword = useCallback(async (email: string) => {
    setError(null);
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
