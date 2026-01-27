/**
 * Shared Authentication Logic
 * Used by both web and mobile apps
 */

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  tenantId: string | null;
  role: 'owner' | 'editor' | 'manager' | 'learner' | null;
}

export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials extends LoginCredentials {
  displayName: string;
  tenantId?: string;
}

/**
 * Parse Firebase user to our AuthUser type
 */
export function parseFirebaseUser(firebaseUser: unknown): AuthUser | null {
  if (!firebaseUser || typeof firebaseUser !== 'object') {
    return null;
  }

  const user = firebaseUser as Record<string, unknown>;

  return {
    uid: String(user.uid ?? ''),
    email: user.email ? String(user.email) : null,
    displayName: user.displayName ? String(user.displayName) : null,
    photoURL: user.photoURL ? String(user.photoURL) : null,
    emailVerified: Boolean(user.emailVerified),
    tenantId: null, // Set from custom claims
    role: null, // Set from custom claims
  };
}

/**
 * Get initial auth state
 */
export function getInitialAuthState(): AuthState {
  return {
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  };
}
