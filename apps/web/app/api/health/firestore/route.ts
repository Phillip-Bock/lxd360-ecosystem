import { getFirestore } from 'firebase-admin/firestore';
import { NextResponse } from 'next/server';
import { initializeFirebaseAdmin } from '@/lib/firebase/admin';

/**
 * Firestore health check endpoint
 * Performs actual read operation to verify database connectivity
 *
 * @route GET /api/health/firestore
 */
export async function GET() {
  const startTime = Date.now();

  try {
    // Initialize Firebase Admin if not already done
    initializeFirebaseAdmin();

    const db = getFirestore();

    // Perform a simple read operation to verify connectivity
    // Read from a known collection or use a health check document
    const healthRef = db.collection('_system').doc('health');

    // Try to read or write a timestamp
    await healthRef.set(
      {
        lastCheck: new Date().toISOString(),
        service: 'inspire-web',
      },
      { merge: true },
    );

    const latency = Date.now() - startTime;

    return NextResponse.json(
      {
        status: 'healthy',
        service: 'firestore',
        latency,
        timestamp: new Date().toISOString(),
        project: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'unknown',
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'X-Response-Time': `${latency}ms`,
        },
      },
    );
  } catch (error) {
    const latency = Date.now() - startTime;

    // Log the error for debugging
    console.error('[Health Check] Firestore error:', error);

    return NextResponse.json(
      {
        status: 'unhealthy',
        service: 'firestore',
        latency,
        error: error instanceof Error ? error.message : 'Connection failed',
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    );
  }
}
