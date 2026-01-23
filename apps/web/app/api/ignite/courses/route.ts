import { FieldValue } from 'firebase-admin/firestore';
import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { logger } from '@/lib/logger';

const log = logger.child({ module: 'api-ignite-courses' });

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
