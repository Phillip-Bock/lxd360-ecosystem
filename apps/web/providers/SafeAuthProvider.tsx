'use client';

import {
  browserLocalPersistence,
  onAuthStateChanged,
  setPersistence,
  type User,
} from 'firebase/auth';
import { createContext, useContext, useEffect, useState } from 'react';
import { getFirebaseAuth } from '@/lib/firebase/client';

type AuthContextType = {
  user: User | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const useSafeAuth = () => useContext(AuthContext);

export function SafeAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (mounted) {
        setUser(currentUser);
        // CRITICAL: Only set loading to false AFTER we get the first response
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
}
