import { FieldValue } from 'firebase-admin/firestore';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { canManageContent, validateRoles } from '@/lib/auth/rbac';
import type { Role } from '@/lib/auth/types';
import {
  AuthenticationError,
  AuthorizationError,
  handleAPIError,
  ValidationError,
} from '@/lib/errors/api-errors';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { logger } from '@/lib/logger';

const log = logger.child({ module: 'api-v1-courses' });

// =============================================================================
// Types
// =============================================================================

interface CourseDocument {
  id: string;
  tenantId: string;
  title: string;
  description: string;
  type: CourseType;
  instructor?: string;
  estimatedDurationMinutes?: number;
  status: 'draft' | 'published' | 'archived' | 'processing';
  createdBy: string;
  createdAt: FirebaseFirestore.FieldValue;
  updatedAt: FirebaseFirestore.FieldValue;
  // SCORM-specific fields
  packageUrl?: string;
  scormVersion?: '1.2' | '2004';
  processingStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  xapiWrapperStatus?: 'pending' | 'injected' | 'failed';
}

type CourseType = 'standard' | 'micro' | 'webinar' | 'ilt' | 'scorm';

// =============================================================================
// Validation Schema
// =============================================================================

const createCourseSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be 200 characters or less')
    .trim(),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(5000, 'Description must be 5000 characters or less')
    .trim(),
  instructor: z.string().max(100, 'Instructor name must be 100 characters or less').optional(),
  type: z.enum(['standard', 'micro', 'webinar', 'ilt', 'scorm'], {
    required_error: 'Course type is required',
    invalid_type_error: 'Course type must be one of: standard, micro, webinar, ilt, scorm',
  }),
  estimatedDurationMinutes: z
    .number()
    .int('Duration must be a whole number')
    .min(1, 'Duration must be at least 1 minute')
    .max(10080, 'Duration cannot exceed 10080 minutes (1 week)')
    .optional(),
  // SCORM-specific fields
  packageUrl: z.string().url('Package URL must be a valid URL').optional(),
  scormVersion: z.enum(['1.2', '2004']).optional(),
});

type CreateCourseInput = z.infer<typeof createCourseSchema>;

// =============================================================================
// Auth Helper
// =============================================================================

interface AuthenticatedUser {
  uid: string;
  email: string;
  tenantId: string;
  roles: Role[];
}

/**
 * Verify the Authorization header and return the authenticated user
 * Supports both ID tokens and session cookies
 */
async function verifyAuth(request: NextRequest): Promise<AuthenticatedUser> {
  // Try Authorization header first (for API clients)
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const idToken = authHeader.slice(7);
    try {
      const decodedToken = await adminAuth.verifyIdToken(idToken, true);

      const tenantId = decodedToken.tenantId as string | undefined;
      if (!tenantId) {
        throw new AuthorizationError('User is not associated with a tenant');
      }

      // Get user roles from custom claims or Firestore
      const roles = await getUserRoles(decodedToken.uid, tenantId);

      return {
        uid: decodedToken.uid,
        email: decodedToken.email || '',
        tenantId,
        roles,
      };
    } catch (error) {
      if (error instanceof AuthorizationError) {
        throw error;
      }
      log.warn('Invalid ID token', { error });
      throw new AuthenticationError('Invalid or expired token');
    }
  }

  // Try session cookie (for browser clients)
  const sessionCookie = request.cookies.get('__session')?.value;
  if (sessionCookie) {
    try {
      const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);

      const tenantId = decodedToken.tenantId as string | undefined;
      if (!tenantId) {
        throw new AuthorizationError('User is not associated with a tenant');
      }

      const roles = await getUserRoles(decodedToken.uid, tenantId);

      return {
        uid: decodedToken.uid,
        email: decodedToken.email || '',
        tenantId,
        roles,
      };
    } catch (error) {
      if (error instanceof AuthorizationError) {
        throw error;
      }
      log.warn('Invalid session cookie', { error });
      throw new AuthenticationError('Invalid or expired session');
    }
  }

  throw new AuthenticationError('No authentication credentials provided');
}

/**
 * Get user roles from Firestore user document
 */
async function getUserRoles(uid: string, tenantId: string): Promise<Role[]> {
  try {
    // Check tenant-specific user document first
    const tenantUserDoc = await adminDb
      .collection('tenants')
      .doc(tenantId)
      .collection('users')
      .doc(uid)
      .get();

    if (tenantUserDoc.exists) {
      const data = tenantUserDoc.data();
      const rawRoles = data?.roles || [];
      return validateRoles(Array.isArray(rawRoles) ? rawRoles : [rawRoles]);
    }

    // Fallback to global user document
    const globalUserDoc = await adminDb.collection('users').doc(uid).get();
    if (globalUserDoc.exists) {
      const data = globalUserDoc.data();
      const rawRoles = data?.roles || [];
      return validateRoles(Array.isArray(rawRoles) ? rawRoles : [rawRoles]);
    }

    return [];
  } catch (error) {
    log.error('Failed to get user roles', { uid, tenantId, error });
    return [];
  }
}

// =============================================================================
// Request ID Helper
// =============================================================================

function getRequestId(request: NextRequest): string {
  return request.headers.get('X-Request-ID') || crypto.randomUUID();
}

// =============================================================================
// POST /api/v1/courses - Create a new course
// =============================================================================

export async function POST(request: NextRequest): Promise<NextResponse> {
  const requestId = getRequestId(request);

  try {
    // 1. Authenticate the user
    const user = await verifyAuth(request);

    // 2. Authorize - check if user can create courses
    if (!canManageContent(user.roles)) {
      throw new AuthorizationError(
        'You do not have permission to create courses',
        'courses:create',
      );
    }

    // 3. Parse and validate request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw new ValidationError('Invalid JSON in request body');
    }

    const validationResult = createCourseSchema.safeParse(body);
    if (!validationResult.success) {
      throw ValidationError.fromZodError(validationResult.error);
    }

    const input: CreateCourseInput = validationResult.data;

    // 4. Additional business validation
    if (input.type === 'scorm') {
      if (!input.packageUrl) {
        throw new ValidationError('Package URL is required for SCORM courses', [
          { field: 'packageUrl', message: 'Package URL is required for SCORM courses' },
        ]);
      }
      if (!input.scormVersion) {
        throw new ValidationError('SCORM version is required for SCORM courses', [
          { field: 'scormVersion', message: 'SCORM version is required for SCORM courses' },
        ]);
      }
    }

    // 5. Create the course document
    const coursesRef = adminDb.collection('tenants').doc(user.tenantId).collection('courses');
    const courseRef = coursesRef.doc();

    // SCORM courses start in 'processing' status until the package is validated
    const isScormCourse = input.type === 'scorm';
    const initialStatus = isScormCourse ? 'processing' : 'draft';

    const courseDoc: CourseDocument = {
      id: courseRef.id,
      tenantId: user.tenantId,
      title: input.title,
      description: input.description,
      type: input.type,
      instructor: input.instructor,
      estimatedDurationMinutes: input.estimatedDurationMinutes,
      status: initialStatus,
      createdBy: user.uid,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      // SCORM-specific fields
      ...(input.packageUrl && { packageUrl: input.packageUrl }),
      ...(input.scormVersion && { scormVersion: input.scormVersion }),
      // Processing metadata for SCORM
      ...(isScormCourse && {
        processingStatus: 'pending',
        xapiWrapperStatus: 'pending',
      }),
    };

    await courseRef.set(courseDoc);

    log.info('Course created via API', {
      courseId: courseRef.id,
      tenantId: user.tenantId,
      createdBy: user.uid,
      type: input.type,
      requestId,
    });

    // 6. Return success response
    return NextResponse.json(
      {
        success: true,
        data: {
          id: courseRef.id,
          tenantId: user.tenantId,
          title: input.title,
          description: input.description,
          type: input.type,
          instructor: input.instructor,
          estimatedDurationMinutes: input.estimatedDurationMinutes,
          status: initialStatus,
          createdBy: user.uid,
          createdAt: new Date().toISOString(),
          ...(input.packageUrl && { packageUrl: input.packageUrl }),
          ...(input.scormVersion && { scormVersion: input.scormVersion }),
          ...(isScormCourse && {
            processingStatus: 'pending',
            xapiWrapperStatus: 'pending',
          }),
        },
        meta: {
          requestId,
        },
      },
      {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': requestId,
        },
      },
    );
  } catch (error) {
    return handleAPIError(error, { requestId, context: { endpoint: 'POST /api/v1/courses' } });
  }
}

// =============================================================================
// GET /api/v1/courses - List courses for the authenticated user's tenant
// =============================================================================

export async function GET(request: NextRequest): Promise<NextResponse> {
  const requestId = getRequestId(request);

  try {
    // 1. Authenticate the user
    const user = await verifyAuth(request);

    // 2. Parse query parameters for pagination/filtering
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const status = searchParams.get('status') as CourseDocument['status'] | null;
    const type = searchParams.get('type') as CourseType | null;

    // 3. Build query
    let query = adminDb
      .collection('tenants')
      .doc(user.tenantId)
      .collection('courses')
      .orderBy('createdAt', 'desc');

    if (status) {
      query = query.where('status', '==', status);
    }
    if (type) {
      query = query.where('type', '==', type);
    }

    // 4. Execute query with pagination
    const snapshot = await query.offset(offset).limit(limit).get();

    const courses = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        tenantId: data.tenantId,
        title: data.title,
        description: data.description,
        type: data.type,
        instructor: data.instructor,
        estimatedDurationMinutes: data.estimatedDurationMinutes,
        status: data.status,
        createdBy: data.createdBy,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
        publishedAt: data.publishedAt?.toDate?.()?.toISOString() || null,
        packageUrl: data.packageUrl,
        scormVersion: data.scormVersion,
        processingStatus: data.processingStatus,
        enrolledCount: data.enrolledCount || 0,
        completedCount: data.completedCount || 0,
        avgRating: data.avgRating,
      };
    });

    // 5. Get total count for pagination
    const countSnapshot = await adminDb
      .collection('tenants')
      .doc(user.tenantId)
      .collection('courses')
      .count()
      .get();
    const total = countSnapshot.data().count;

    log.info('Courses listed via API', {
      tenantId: user.tenantId,
      count: courses.length,
      total,
      requestId,
    });

    return NextResponse.json(
      {
        success: true,
        data: courses,
        meta: {
          requestId,
          pagination: {
            total,
            limit,
            offset,
            hasMore: offset + courses.length < total,
          },
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': requestId,
        },
      },
    );
  } catch (error) {
    return handleAPIError(error, { requestId, context: { endpoint: 'GET /api/v1/courses' } });
  }
}
