'use client';

import type { User, UserCredential } from 'firebase/auth';
import { createContext, type ReactNode, useContext } from 'react';
import { type UserProfile, useAuth } from './useAuth';

/**
 * Auth context type - mirrors UseAuthReturn from useAuth hook
 */
interface AuthContextType {
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

/**
 * Auth context with undefined default to enforce provider usage
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Auth provider props
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider component
 *
 * Wraps the application with Firebase authentication context.
 * Should be placed near the root of the application, inside any
 * theme or other UI providers but outside route-specific content.
 *
 * @example
 * ```tsx
 * // In app/layout.tsx or providers/index.tsx
 * import { AuthProvider } from '@/lib/firebase/auth-context';
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <AuthProvider>
 *           {children}
 *         </AuthProvider>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export function AuthProvider({ children }: AuthProviderProps): React.JSX.Element {
  const auth = useAuth();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

/**
 * Hook to consume auth context
 *
 * Provides access to Firebase authentication state and methods.
 * Must be used within an AuthProvider.
 *
 * @throws Error if used outside of AuthProvider
 *
 * @example
 * ```tsx
 * function ProfilePage() {
 *   const { user, profile, loading, signOut } = useAuthContext();
 *
 *   if (loading) return <Spinner />;
 *   if (!user) return <Redirect to="/login" />;
 *
 *   return (
 *     <div>
 *       <h1>Welcome, {profile?.displayName || user.email}</h1>
 *       <button onClick={signOut}>Sign Out</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }

  return context;
}

/**
 * Hook for components that require authentication
 *
 * Returns user data or null if not authenticated.
 * Useful for conditional rendering without throwing errors.
 *
 * @example
 * ```tsx
 * function NavBar() {
 *   const { user, isAuthenticated } = useOptionalAuth();
 *
 *   return (
 *     <nav>
 *       {isAuthenticated ? (
 *         <UserMenu user={user} />
 *       ) : (
 *         <LoginButton />
 *       )}
 *     </nav>
 *   );
 * }
 * ```
 */
export function useOptionalAuth(): AuthContextType | null {
  const context = useContext(AuthContext);
  return context ?? null;
}

/**
 * Hook that throws if user is not authenticated
 *
 * Use in protected pages/components that should redirect
 * unauthenticated users.
 *
 * @throws Error if not authenticated (use in combination with redirect logic)
 *
 * @example
 * ```tsx
 * function DashboardPage() {
 *   const { user, profile, loading } = useRequireAuth();
 *
 *   if (loading) return <Spinner />;
 *
 *   // At this point, user is guaranteed to exist
 *   return <Dashboard user={user} profile={profile} />;
 * }
 * ```
 */
export function useRequireAuth(): AuthContextType & { user: User } {
  const context = useAuthContext();

  if (!context.loading && !context.user) {
    throw new Error('Authentication required');
  }

  return context as AuthContextType & { user: User };
}
