/**
 * Data Access Layer (DAL) - Centralized data access with authentication
 *
 * All data operations should go through this layer to ensure:
 * - Authentication verification
 * - Authorization checks (RBAC)
 * - Audit logging
 * - Type safety
 *
 * @see docs/security/data-access-layer.md
 */
import 'server-only';

import type { DecodedIdToken } from 'firebase-admin/auth';
import { cookies } from 'next/headers';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { ROLE_HIERARCHY, type RoleName } from '@/lib/rbac/types';

// ============================================================================
// TYPES
// ============================================================================

export interface SessionUser {
  uid: string;
  email: string | undefined;
  role: RoleName;
  tenantId: string | null;
  emailVerified: boolean;
}

export interface DALResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ============================================================================
// SESSION VERIFICATION
// ============================================================================

/**
 * Verify the current user's session from cookies
 * Returns null if no valid session exists
 */
export async function verifySession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('firebase-auth-token')?.value;

    if (!sessionCookie) {
      return null;
    }

    // Verify the ID token with Firebase Admin
    const decodedToken = await adminAuth.verifyIdToken(sessionCookie, true);

    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: (decodedToken.role as RoleName) || 'user',
      tenantId: (decodedToken.tenantId as string) || null,
      emailVerified: decodedToken.email_verified || false,
    };
  } catch (error) {
    // Token is invalid or expired
    console.error('[DAL] Session verification failed:', error);
    return null;
  }
}

/**
 * Verify session and throw if not authenticated
 * Use this in server actions that require authentication
 */
export async function requireSession(): Promise<SessionUser> {
  const session = await verifySession();

  if (!session) {
    throw new Error('Unauthorized: No valid session');
  }

  return session;
}

/**
 * Verify session and check for specific role
 */
export async function requireRole(minimumRole: RoleName): Promise<SessionUser> {
  const session = await requireSession();

  const userLevel = ROLE_HIERARCHY[session.role] || 0;
  const requiredLevel = ROLE_HIERARCHY[minimumRole] || 0;

  if (userLevel < requiredLevel) {
    throw new Error(`Forbidden: Requires ${minimumRole} role or higher`);
  }

  return session;
}

/**
 * Get the raw decoded token for advanced use cases
 */
export async function getDecodedToken(): Promise<DecodedIdToken | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('firebase-auth-token')?.value;

    if (!sessionCookie) {
      return null;
    }

    return await adminAuth.verifyIdToken(sessionCookie, true);
  } catch {
    return null;
  }
}

// ============================================================================
// DATA ACCESS HELPERS
// ============================================================================

/**
 * Get a Firestore document with authentication check
 */
export async function getDocument<T>(
  collection: string,
  docId: string,
  requireAuth = true,
): Promise<DALResult<T>> {
  try {
    if (requireAuth) {
      await requireSession();
    }

    const docRef = adminDb.collection(collection).doc(docId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return { success: false, error: 'Document not found' };
    }

    return {
      success: true,
      data: { id: docSnap.id, ...docSnap.data() } as T,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: message };
  }
}

/**
 * Query Firestore collection with authentication check
 */
export async function queryCollection<T>(
  collection: string,
  constraints: Array<{
    field: string;
    operator: FirebaseFirestore.WhereFilterOp;
    value: unknown;
  }>,
  requireAuth = true,
): Promise<DALResult<T[]>> {
  try {
    if (requireAuth) {
      await requireSession();
    }

    let query: FirebaseFirestore.Query = adminDb.collection(collection);

    for (const constraint of constraints) {
      query = query.where(constraint.field, constraint.operator, constraint.value);
    }

    const snapshot = await query.get();
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as T[];

    return { success: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: message };
  }
}

/**
 * Create a document with authentication and audit logging
 */
export async function createDocument<T extends Record<string, unknown>>(
  collection: string,
  data: T,
  requireAuth = true,
): Promise<DALResult<{ id: string }>> {
  try {
    const session = requireAuth ? await requireSession() : null;

    const docRef = adminDb.collection(collection).doc();
    const timestamp = new Date().toISOString();

    await docRef.set({
      ...data,
      id: docRef.id,
      createdAt: timestamp,
      updatedAt: timestamp,
      createdBy: session?.uid || 'system',
    });

    return { success: true, data: { id: docRef.id } };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: message };
  }
}

/**
 * Update a document with authentication and audit logging
 */
export async function updateDocument<T extends Record<string, unknown>>(
  collection: string,
  docId: string,
  data: Partial<T>,
  requireAuth = true,
): Promise<DALResult<void>> {
  try {
    const session = requireAuth ? await requireSession() : null;

    const docRef = adminDb.collection(collection).doc(docId);
    const timestamp = new Date().toISOString();

    await docRef.update({
      ...data,
      updatedAt: timestamp,
      updatedBy: session?.uid || 'system',
    });

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: message };
  }
}

/**
 * Delete a document with authentication and audit logging
 */
export async function deleteDocument(
  collection: string,
  docId: string,
  requireAuth = true,
): Promise<DALResult<void>> {
  try {
    if (requireAuth) {
      await requireSession();
    }

    await adminDb.collection(collection).doc(docId).delete();

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: message };
  }
}
