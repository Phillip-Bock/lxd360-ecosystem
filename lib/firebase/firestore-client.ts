import {
  collection,
  type DocumentData,
  type DocumentSnapshot,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  type OrderByDirection,
  orderBy,
  type QueryConstraint,
  query,
  setDoc,
  startAfter,
  updateDoc,
  type WhereFilterOp,
  where,
} from 'firebase/firestore';
import { db } from './client';

// =============================================================================
// Types
// =============================================================================

/**
 * Standard result type for single document operations
 */
export interface FirestoreResult<T> {
  data: T | null;
  error: Error | null;
}

/**
 * Standard result type for list operations
 */
export interface FirestoreListResult<T> {
  data: T[];
  error: Error | null;
  count: number;
}

/**
 * Paginated result type
 */
export interface FirestorePaginatedResult<T> {
  data: T[];
  error: Error | null;
  count: number;
  hasMore: boolean;
  lastDoc: DocumentSnapshot<DocumentData> | null;
}

// =============================================================================
// Generic CRUD Operations
// =============================================================================

/**
 * Get a single document by ID
 *
 * @example
 * ```typescript
 * const { data, error } = await getDocument<User>('users', 'user-123');
 * if (error) console.error(error);
 * if (data) console.error(data.displayName);
 * ```
 */
export async function getDocumentById<T>(
  collectionName: string,
  documentId: string,
): Promise<FirestoreResult<T>> {
  try {
    const docRef = doc(db, collectionName, documentId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        data: { id: docSnap.id, ...docSnap.data() } as T,
        error: null,
      };
    }

    return { data: null, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

/**
 * Get multiple documents with optional filtering
 *
 * @example
 * ```typescript
 * const { data, error } = await getDocumentsList<Course>('courses', [
 *   filters.eq('organizationId', 'org-123'),
 *   filters.eq('status', 'published'),
 *   orderBy('createdAt', 'desc'),
 * ]);
 * ```
 */
export async function getDocumentsList<T>(
  collectionName: string,
  constraints: QueryConstraint[] = [],
): Promise<FirestoreListResult<T>> {
  try {
    const collectionRef = collection(db, collectionName);
    const q = query(collectionRef, ...constraints);
    const querySnapshot = await getDocs(q);

    const data = querySnapshot.docs.map(
      (docSnap) =>
        ({
          id: docSnap.id,
          ...docSnap.data(),
        }) as T,
    );

    return { data, error: null, count: data.length };
  } catch (error) {
    return { data: [], error: error as Error, count: 0 };
  }
}

/**
 * Get paginated documents
 *
 * @example
 * ```typescript
 * const { data, hasMore, lastDoc } = await getDocumentsPaginated<Course>(
 *   'courses',
 *   [filters.eq('status', 'published')],
 *   10,
 *   previousLastDoc
 * );
 * ```
 */
export async function getDocumentsPaginated<T>(
  collectionName: string,
  constraints: QueryConstraint[] = [],
  pageSize: number = 20,
  lastDocument?: DocumentSnapshot<DocumentData> | null,
): Promise<FirestorePaginatedResult<T>> {
  try {
    const collectionRef = collection(db, collectionName);
    const baseConstraints = [...constraints, limit(pageSize + 1)];

    if (lastDocument) {
      baseConstraints.push(startAfter(lastDocument));
    }

    const q = query(collectionRef, ...baseConstraints);
    const querySnapshot = await getDocs(q);

    const docs = querySnapshot.docs;
    const hasMore = docs.length > pageSize;
    const resultDocs = hasMore ? docs.slice(0, pageSize) : docs;

    const data = resultDocs.map(
      (docSnap) =>
        ({
          id: docSnap.id,
          ...docSnap.data(),
        }) as T,
    );

    return {
      data,
      error: null,
      count: data.length,
      hasMore,
      lastDoc: resultDocs[resultDocs.length - 1] ?? null,
    };
  } catch (error) {
    return {
      data: [],
      error: error as Error,
      count: 0,
      hasMore: false,
      lastDoc: null,
    };
  }
}

/**
 * Create a new document with auto-generated ID
 *
 * @example
 * ```typescript
 * const { data, error } = await createDocument<Course>('courses', {
 *   title: 'New Course',
 *   organizationId: 'org-123',
 *   status: 'draft',
 * });
 * ```
 */
export async function createDocument<T extends Record<string, unknown>>(
  collectionName: string,
  data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<FirestoreResult<T>> {
  try {
    const documentId = crypto.randomUUID();
    const now = new Date().toISOString();

    const docRef = doc(db, collectionName, documentId);
    const documentData = {
      ...data,
      id: documentId,
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(docRef, documentData);

    return { data: documentData as unknown as T, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

/**
 * Create or overwrite a document with a specific ID
 *
 * @example
 * ```typescript
 * const { data, error } = await setDocumentById<User>('users', 'user-123', {
 *   email: 'user@example.com',
 *   displayName: 'John Doe',
 * });
 * ```
 */
export async function setDocumentById<T extends Record<string, unknown>>(
  collectionName: string,
  documentId: string,
  data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<FirestoreResult<T>> {
  try {
    const now = new Date().toISOString();
    const docRef = doc(db, collectionName, documentId);

    const documentData = {
      ...data,
      id: documentId,
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(docRef, documentData);

    return { data: documentData as unknown as T, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

/**
 * Update specific fields in a document
 *
 * @example
 * ```typescript
 * const { data, error } = await updateDocumentById<Course>('courses', 'course-123', {
 *   title: 'Updated Title',
 *   status: 'published',
 * });
 * ```
 */
export async function updateDocumentById<T>(
  collectionName: string,
  documentId: string,
  updates: Partial<T>,
): Promise<FirestoreResult<T>> {
  try {
    const docRef = doc(db, collectionName, documentId);

    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await updateDoc(docRef, updateData as DocumentData);

    // Return the updates (caller should refetch if they need full doc)
    return { data: { id: documentId, ...updateData } as T, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

/**
 * Delete a document
 *
 * @example
 * ```typescript
 * const { error } = await deleteDocumentById('courses', 'course-123');
 * if (error) console.error('Failed to delete:', error);
 * ```
 */
export async function deleteDocumentById(
  collectionName: string,
  documentId: string,
): Promise<{ error: Error | null }> {
  try {
    const docRef = doc(db, collectionName, documentId);
    await deleteDoc(docRef);
    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
}

// =============================================================================
// Query Helpers
// =============================================================================

/**
 * Filter helpers for Firestore queries
 *
 * @example
 * ```typescript
 * // Firestore: filters.eq('status', 'published')
 *
 * const { data } = await getDocumentsList<Course>('courses', [
 *   filters.eq('organizationId', orgId),
 *   filters.eq('status', 'published'),
 *   filters.inArray('tags', ['featured', 'new']),
 * ]);
 * ```
 */
export const filters = {
  /** Equals (==) */
  eq: (field: string, value: unknown) => where(field, '==', value),

  /** Not equals (!=) */
  neq: (field: string, value: unknown) => where(field, '!=', value),

  /** Greater than (>) */
  gt: (field: string, value: unknown) => where(field, '>', value),

  /** Greater than or equal (>=) */
  gte: (field: string, value: unknown) => where(field, '>=', value),

  /** Less than (<) */
  lt: (field: string, value: unknown) => where(field, '<', value),

  /** Less than or equal (<=) */
  lte: (field: string, value: unknown) => where(field, '<=', value),

  /** In array - value is in the provided array */
  inArray: (field: string, values: unknown[]) => where(field, 'in', values),

  /** Not in array - value is not in the provided array */
  notInArray: (field: string, values: unknown[]) => where(field, 'not-in', values),

  /** Array contains - array field contains the value */
  contains: (field: string, value: unknown) => where(field, 'array-contains', value),

  /** Array contains any - array field contains any of the values */
  containsAny: (field: string, values: unknown[]) => where(field, 'array-contains-any', values),

  /** Custom where clause for advanced queries */
  custom: (field: string, operator: WhereFilterOp, value: unknown) => where(field, operator, value),
};

/**
 * Order by helper
 *
 * @example
 * ```typescript
 * const { data } = await getDocumentsList<Course>('courses', [
 *   filters.eq('status', 'published'),
 *   sort('createdAt', 'desc'),
 *   limitTo(10),
 * ]);
 * ```
 */
export function sort(field: string, direction: OrderByDirection = 'asc') {
  return orderBy(field, direction);
}

/**
 * Limit helper
 */
export function limitTo(count: number) {
  return limit(count);
}

// =============================================================================
// Re-exports for convenience
// =============================================================================

export { collection, doc, limit, orderBy, query, where } from 'firebase/firestore';
export type { QueryConstraint, DocumentSnapshot, DocumentData };
