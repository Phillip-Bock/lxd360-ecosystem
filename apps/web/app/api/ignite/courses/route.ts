import { FieldValue } from 'firebase-admin/firestore';
import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { logger } from '@/lib/logger';

const log = logger.child({ module: 'api-ignite-courses' });

// CV-005: Define personas that can manage courses (editors and above)
const COURSE_MANAGEMENT_PERSONAS = ['owner', 'editor'];

export async function POST(req: Request) {
  try {
    // 1. AUTHENTICATION (The Gatekeeper)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const userId = decodedToken.uid;

    // CV-005: RBAC Check - Only editors and owners can create courses
    const persona = decodedToken.persona || decodedToken.role || 'learner';
    if (!COURSE_MANAGEMENT_PERSONAS.includes(persona as string)) {
      log.warn('Forbidden: insufficient persona for course creation', { userId, persona });
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to create courses' },
        { status: 403 },
      );
    }

    // 2. PARSE BODY (Explicit Context)
    const body = await req.json();
    const { title, description, type, filePath, tenantId } = body;

    if (!title || !tenantId || !filePath) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 3. DATABASE WRITE (The Permanent Record)
    const courseData = {
      title,
      description,
      type, // 'SCORM'
      status: 'draft',
      version: '1.0',
      scormPackagePath: filePath,
      tenantId,
      authorId: userId,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      thumbnail: null,
      settings: {
        passMark: 80,
        attempts: 3,
      },
    };

    // Add to Firestore
    const docRef = await adminDb
      .collection('tenants')
      .doc(tenantId)
      .collection('courses')
      .add(courseData);

    log.info('Course created', { courseId: docRef.id, tenantId });

    return NextResponse.json({
      success: true,
      courseId: docRef.id,
      message: 'Course created successfully',
    });
  } catch (error: unknown) {
    log.error('Failed to create course', { error });
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    // 1. AUTH CHECK
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const userId = decodedToken.uid;

    // CV-005: RBAC Check - Only editors, managers, and owners can view courses
    // (Learners see courses through their own enrollment endpoints)
    const persona = decodedToken.persona || decodedToken.role || 'learner';
    if (persona === 'learner') {
      log.warn('Forbidden: learner attempted to access admin courses list', { userId });
      return NextResponse.json(
        { error: 'Forbidden: Learners should use the enrollment API' },
        { status: 403 },
      );
    }

    // DB-012: Get tenant ID from custom claims or request header (fallback for dev)
    const tenantId =
      (decodedToken.tenantId as string) || req.headers.get('x-tenant-id') || 'lxd360-dev'; // Fallback for development only

    // 3. FETCH
    const snapshot = await adminDb
      .collection('tenants')
      .doc(tenantId)
      .collection('courses')
      .orderBy('createdAt', 'desc')
      .get();

    const courses = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      // Convert Firestore timestamps to ISO strings for JSON serialization
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || null,
    }));

    log.info('Courses fetched', { count: courses.length, tenantId });

    return NextResponse.json({ courses });
  } catch (error: unknown) {
    log.error('Failed to fetch courses', { error });
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
