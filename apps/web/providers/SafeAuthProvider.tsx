'use client';

import {
  browserLocalPersistence,
  onAuthStateChanged,
  setPersistence,
  type User,
} from 'firebase/auth';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getFirebaseAuth } from '@/lib/firebase/client';
import { getPersonaFromClaims, type Persona } from '@/lib/rbac/personas';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  persona: Persona | null;
  refreshPersona: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  persona: null,
  refreshPersona: async () => {},
});

export const useSafeAuth = () => useContext(AuthContext);

export function SafeAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [persona, setPersona] = useState<Persona | null>(null);

  // Function to load persona from user token (memoized to avoid dependency issues)
  const loadPersona = useCallback(async (currentUser: User | null) => {
    if (!currentUser) {
      setPersona(null);
      return;
    }

    try {
      const tokenResult = await currentUser.getIdTokenResult(true);
      const loadedPersona = getPersonaFromClaims(tokenResult.claims);
      setPersona(loadedPersona);
    } catch (error) {
      console.error('Failed to load persona:', error);
      // Default to learner on error (secure default)
      setPersona('learner');
    }
  }, []);

  // Public method to refresh persona (useful after admin changes claims)
  const refreshPersona = async () => {
    if (user) {
      await loadPersona(user);
    }
  };

  useEffect(() => {
    let mounted = true;
    const auth = getFirebaseAuth();

    if (!auth) {
      setLoading(false);
      return;
    }

    setPersistence(auth, browserLocalPersistence).catch(() => {
      // Persistence may fail in some environments, continue anyway
    });

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (mounted) {
        setUser(currentUser);
        await loadPersona(currentUser);
        // CRITICAL: Only set loading to false AFTER we get the first response
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [loadPersona]);

  return (
    <AuthContext.Provider value={{ user, loading, persona, refreshPersona }}>
      {children}
    </AuthContext.Provider>
  );
}
