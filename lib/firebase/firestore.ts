'use client';

import {
  addDoc,
  collection,
  type DocumentData,
  type DocumentReference,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  type OrderByDirection,
  onSnapshot,
  orderBy,
  type QueryConstraint,
  query,
  serverTimestamp,
  setDoc,
  startAfter,
  type Unsubscribe,
  updateDoc,
  type WhereFilterOp,
  where,
} from 'firebase/firestore';
import { logger } from '@/lib/logger';
import { db } from './client';

const log = logger.child({ module: 'firestore' });

/**
 * Base document with common fields
 */
export interface BaseDocument {
  id: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Pagination result
 */
export interface PaginatedResult<T> {
  data: T[];
  hasMore: boolean;
  lastDoc: DocumentData | null;
}

// ============================================================================
// CRUD Operations
// ============================================================================

/**
 * Get a single document by ID
 * @param collectionName - The collection name
 * @param id - The document ID
 * @returns The document data or null if not found
 */
export async function getDocument<T extends BaseDocument>(
  collectionName: string,
  id: string,
): Promise<T | null> {
  try {
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return {
      id: docSnap.id,
      ...docSnap.data(),
      createdAt: docSnap.data().createdAt?.toDate(),
      updatedAt: docSnap.data().updatedAt?.toDate(),
    } as T;
  } catch (error) {
    log.error('Failed to get document', { collection: collectionName, id, error });
    throw error;
  }
}

/**
 * Get all documents from a collection
 * @param collectionName - The collection name
 * @param constraints - Optional query constraints
 * @returns Array of documents
 */
export async function getDocuments<T extends BaseDocument>(
  collectionName: string,
  constraints: QueryConstraint[] = [],
): Promise<T[]> {
  try {
    const collectionRef = collection(db, collectionName);
    const q = query(collectionRef, ...constraints);
    const querySnap = await getDocs(q);

    return querySnap.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
      createdAt: docSnap.data().createdAt?.toDate(),
      updatedAt: docSnap.data().updatedAt?.toDate(),
    })) as T[];
  } catch (error) {
    log.error('Failed to get documents', { collection: collectionName, error });
    throw error;
  }
}

/**
 * Create a new document with auto-generated ID
 * @param collectionName - The collection name
 * @param data - The document data
 * @returns The created document reference
 */
export async function createDocument<T extends Omit<BaseDocument, 'id'>>(
  collectionName: string,
  data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<DocumentReference> {
  try {
    const collectionRef = collection(db, collectionName);
    const docRef = await addDoc(collectionRef, {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    log.debug('Document created', { collection: collectionName, id: docRef.id });
    return docRef;
  } catch (error) {
    log.error('Failed to create document', { collection: collectionName, error });
    throw error;
  }
}

/**
 * Create or update a document with a specific ID
 * @param collectionName - The collection name
 * @param id - The document ID
 * @param data - The document data
 * @param merge - Whether to merge with existing data
 */
export async function setDocument<T extends BaseDocument>(
  collectionName: string,
  id: string,
  data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>,
  merge = true,
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, id);
    await setDoc(
      docRef,
      {
        ...data,
        updatedAt: serverTimestamp(),
        ...(merge ? {} : { createdAt: serverTimestamp() }),
      },
      { merge },
    );

    log.debug('Document set', { collection: collectionName, id, merge });
  } catch (error) {
    log.error('Failed to set document', { collection: collectionName, id, error });
    throw error;
  }
}

/**
 * Update specific fields in a document
 * @param collectionName - The collection name
 * @param id - The document ID
 * @param data - The fields to update
 */
export async function updateDocument(
  collectionName: string,
  id: string,
  data: Partial<DocumentData>,
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });

    log.debug('Document updated', { collection: collectionName, id });
  } catch (error) {
    log.error('Failed to update document', { collection: collectionName, id, error });
    throw error;
  }
}

/**
 * Delete a document
 * @param collectionName - The collection name
 * @param id - The document ID
 */
export async function deleteDocument(collectionName: string, id: string): Promise<void> {
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);

    log.debug('Document deleted', { collection: collectionName, id });
  } catch (error) {
    log.error('Failed to delete document', { collection: collectionName, id, error });
    throw error;
  }
}

// ============================================================================
// Query Helpers
// ============================================================================

/**
 * Query documents with pagination
 * @param collectionName - The collection name
 * @param pageSize - Number of documents per page
 * @param lastDocument - Last document from previous page
 * @param constraints - Additional query constraints
 */
export async function queryWithPagination<T extends BaseDocument>(
  collectionName: string,
  pageSize: number,
  lastDocument: DocumentData | null = null,
  constraints: QueryConstraint[] = [],
): Promise<PaginatedResult<T>> {
  try {
    const collectionRef = collection(db, collectionName);
    const queryConstraints = [...constraints, limit(pageSize + 1)];

    if (lastDocument) {
      queryConstraints.push(startAfter(lastDocument));
    }

    const q = query(collectionRef, ...queryConstraints);
    const querySnap = await getDocs(q);

    const docs = querySnap.docs;
    const hasMore = docs.length > pageSize;

    if (hasMore) {
      docs.pop(); // Remove the extra document
    }

    const data = docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
      createdAt: docSnap.data().createdAt?.toDate(),
      updatedAt: docSnap.data().updatedAt?.toDate(),
    })) as T[];

    return {
      data,
      hasMore,
      lastDoc: docs[docs.length - 1] || null,
    };
  } catch (error) {
    log.error('Failed to query with pagination', { collection: collectionName, error });
    throw error;
  }
}

/**
 * Create a where constraint
 */
export function whereEquals(field: string, value: unknown): QueryConstraint {
  return where(field, '==', value);
}

/**
 * Create a where constraint with custom operator
 */
export function whereOp(field: string, op: WhereFilterOp, value: unknown): QueryConstraint {
  return where(field, op, value);
}

/**
 * Create an orderBy constraint
 */
export function orderByField(field: string, direction: OrderByDirection = 'asc'): QueryConstraint {
  return orderBy(field, direction);
}

/**
 * Create a limit constraint
 */
export function limitTo(count: number): QueryConstraint {
  return limit(count);
}

// ============================================================================
// Real-time Subscriptions
// ============================================================================

/**
 * Subscribe to a single document
 * @param collectionName - The collection name
 * @param id - The document ID
 * @param callback - Callback when document changes
 * @returns Unsubscribe function
 */
export function subscribeToDocument<T extends BaseDocument>(
  collectionName: string,
  id: string,
  callback: (data: T | null) => void,
): Unsubscribe {
  const docRef = doc(db, collectionName, id);

  return onSnapshot(
    docRef,
    (docSnap) => {
      if (!docSnap.exists()) {
        callback(null);
        return;
      }

      callback({
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate(),
        updatedAt: docSnap.data().updatedAt?.toDate(),
      } as T);
    },
    (error) => {
      log.error('Document subscription error', { collection: collectionName, id, error });
    },
  );
}

/**
 * Subscribe to a collection or query
 * @param collectionName - The collection name
 * @param callback - Callback when collection changes
 * @param constraints - Optional query constraints
 * @returns Unsubscribe function
 */
export function subscribeToCollection<T extends BaseDocument>(
  collectionName: string,
  callback: (data: T[]) => void,
  constraints: QueryConstraint[] = [],
): Unsubscribe {
  const collectionRef = collection(db, collectionName);
  const q = query(collectionRef, ...constraints);

  return onSnapshot(
    q,
    (querySnap) => {
      const data = querySnap.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate(),
        updatedAt: docSnap.data().updatedAt?.toDate(),
      })) as T[];

      callback(data);
    },
    (error) => {
      log.error('Collection subscription error', { collection: collectionName, error });
    },
  );
}

// ============================================================================
// Exports
// ============================================================================

export { serverTimestamp, collection, doc, query, where, orderBy, limit };
