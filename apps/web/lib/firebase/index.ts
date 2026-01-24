// =============================================================================
// Client SDK
// =============================================================================

export type { FirebaseApp } from 'firebase/app';
// Re-export types from Firebase SDK
export type { User, UserCredential } from 'firebase/auth';
export type { FirebaseStorage, StorageReference } from 'firebase/storage';
export type {
  Auth,
  CollectionReference,
  DocumentData,
  DocumentReference,
  DocumentSnapshot,
  Firestore,
  Query,
  QuerySnapshot,
} from './client';

// Export client functions
export {
  getFirebaseAuth,
  getFirebaseDb,
  getFirebaseStorage,
  requireAuth,
  requireDb,
  requireStorage,
} from './client';

// =============================================================================
// Auth Context & Hooks
// =============================================================================

export { AuthProvider, useAuthContext, useOptionalAuth, useRequireAuth } from './auth-context';
export type { UserProfile } from './useAuth';
export { useAuth } from './useAuth';

// =============================================================================
// Firestore Data Layer
// =============================================================================

export type {
  FirestoreListResult,
  FirestorePaginatedResult,
  FirestoreResult,
  QueryConstraint,
} from './firestore-client';
export {
  collection,
  createDocument,
  deleteDocumentById,
  doc,
  // Query helpers (replaces .eq(), .select(), etc.)
  filters,
  // CRUD Operations
  getDocumentById,
  getDocumentsList,
  getDocumentsPaginated,
  limit,
  limitTo,
  orderBy,
  query,
  setDocumentById,
  sort,
  updateDocumentById,
  // Re-exported Firestore primitives
  where,
} from './firestore-client';

// =============================================================================
// Collections & Types
// =============================================================================

export {
  type AccessibilityPreferences,
  type AuditAction,
  type AuditLog,
  // Base types
  type BaseDocument,
  // Block types
  type Block,
  type BlockAccessibility,
  type BlockData,
  type BlockSettings,
  type BlockType,
  type BrandingSettings,
  type Certificate,
  COLLECTIONS,
  type CollectionName,
  // Course types
  type Course,
  type CourseMetadata,
  type CourseSettings,
  type CourseStatus,
  // Enrollment types
  type Enrollment,
  type EnrollmentStatus,
  type FeatureFlags,
  type Lesson,
  type Media,
  type MediaMetadata,
  type MediaType,
  // Module & Lesson types
  type Module,
  type Notification,
  type NotificationType,
  // Organization types
  type Organization,
  type OrganizationSettings,
  type SecuritySettings,
  type SoftDeletableDocument,
  type SubscriptionInfo,
  // User types
  type User as FirestoreUser,
  type UserPreferences,
  type UserRole,
  // Other types
  type WaitlistEntry,
  type WaitlistStatus,
  type XAPIActor,
  type XAPIContext,
  type XAPIObject,
  type XAPIResult,
  // xAPI types
  type XAPIStatement,
  type XAPIVerb,
} from './collections';

// =============================================================================
// Legacy Firestore Utilities (for backward compatibility)
// =============================================================================

export type { PaginatedResult } from './firestore';
export {
  deleteDocument,
  getDocument,
  getDocuments,
  orderByField,
  queryWithPagination,
  serverTimestamp,
  setDocument,
  subscribeToCollection,
  subscribeToDocument,
  updateDocument,
  whereEquals,
  whereOp,
} from './firestore';
