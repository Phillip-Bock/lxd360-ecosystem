import 'server-only';

/**
 * =============================================================================
 * User Data Export Endpoint (GDPR Art. 20 - Right to Data Portability)
 * =============================================================================
 *
 * Implements GDPR Article 20 - Right to Data Portability.
 * Users can export all their personal data in a structured,
 * commonly used, and machine-readable format (JSON).
 *
 * @module app/api/users/[userId]/export/route
 * @version 1.0.0
 */

import { type NextRequest, NextResponse } from 'next/server';

import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { logger } from '@/lib/logger';

const log = logger.child({ module: 'api-user-export' });

/**
 * Firestore timestamp to ISO string converter
 */
function timestampToISO(timestamp: unknown): string | null {
  if (!timestamp) return null;
  if (typeof timestamp === 'string') return timestamp;
  if (timestamp && typeof timestamp === 'object' && 'toDate' in timestamp) {
    return (timestamp as { toDate: () => Date }).toDate().toISOString();
  }
  return null;
}

/**
 * Sanitize Firestore document data for export
 * Converts timestamps and removes internal fields
 */
function sanitizeDocument(data: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    // Skip internal fields
    if (key.startsWith('_')) continue;

    // Convert timestamps
    if (value && typeof value === 'object' && 'toDate' in value) {
      sanitized[key] = timestampToISO(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) =>
        typeof item === 'object' && item !== null
          ? sanitizeDocument(item as Record<string, unknown>)
          : item,
      );
    } else if (value && typeof value === 'object') {
      sanitized[key] = sanitizeDocument(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * GET /api/users/[userId]/export
 *
 * Exports all user data in JSON format.
 * Only the user themselves can export their data.
 *
 * GDPR Article 20 Requirements:
 * - Data must be in a structured, commonly used format
 * - Data must be machine-readable
 * - Should include all personal data processed based on consent or contract
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
): Promise<NextResponse> {
  try {
    const { userId } = await params;

    // 1. AUTHENTICATION
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const requestingUserId = decodedToken.uid;

    // 2. AUTHORIZATION
    // Users can only export their own data
    if (requestingUserId !== userId) {
      log.warn('Forbidden: cannot export other users data', {
        requestingUserId,
        targetUserId: userId,
      });
      return NextResponse.json(
        { error: 'Forbidden: You can only export your own data' },
        { status: 403 },
      );
    }

    // 3. FETCH USER PROFILE
    const userRef = adminDb.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 4. BUILD EXPORT DATA
    const exportData: Record<string, unknown> = {
      // Metadata
      _export: {
        version: '1.0',
        format: 'JSON',
        gdprArticle: '20',
        exportedAt: new Date().toISOString(),
        exportedBy: 'LXD360 Platform',
        dataController: 'LXD360, LLC',
        contact: 'privacy@lxd360.com',
      },

      // User profile
      profile: sanitizeDocument(userDoc.data() || {}),

      // Collections to export
      preferences: [] as Record<string, unknown>[],
      enrollments: [] as Record<string, unknown>[],
      progress: [] as Record<string, unknown>[],
      certificates: [] as Record<string, unknown>[],
      xapiStatements: [] as Record<string, unknown>[],
    };

    // 5. FETCH USER SUBCOLLECTIONS
    // Preferences
    const prefsSnapshot = await userRef.collection('preferences').get();
    exportData.preferences = prefsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...sanitizeDocument(doc.data()),
    }));

    // 6. FETCH ENROLLMENTS (across all tenants)
    const enrollmentsQuery = adminDb
      .collectionGroup('enrollments')
      .where('learnerId', '==', userId);
    const enrollmentsSnapshot = await enrollmentsQuery.get();
    exportData.enrollments = enrollmentsSnapshot.docs.map((doc) => ({
      id: doc.id,
      path: doc.ref.path,
      ...sanitizeDocument(doc.data()),
    }));

    // 7. FETCH PROGRESS RECORDS
    const progressQuery = adminDb.collectionGroup('progress').where('userId', '==', userId);
    const progressSnapshot = await progressQuery.get();
    exportData.progress = progressSnapshot.docs.map((doc) => ({
      id: doc.id,
      path: doc.ref.path,
      ...sanitizeDocument(doc.data()),
    }));

    // 8. FETCH CERTIFICATES
    const certsQuery = adminDb.collectionGroup('certificates').where('userId', '==', userId);
    const certsSnapshot = await certsQuery.get();
    exportData.certificates = certsSnapshot.docs.map((doc) => ({
      id: doc.id,
      path: doc.ref.path,
      ...sanitizeDocument(doc.data()),
    }));

    // 9. FETCH XAPI STATEMENTS (learning records)
    const xapiQuery = adminDb
      .collection('xapi_statements')
      .where('actor_id', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(10000); // Limit to prevent massive exports

    const xapiSnapshot = await xapiQuery.get();
    exportData.xapiStatements = xapiSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        timestamp: data.timestamp,
        verb: data.verb_id,
        object: data.object_id,
        statement: sanitizeDocument(data.statement || {}),
      };
    });

    // 10. LOG EXPORT FOR AUDIT
    await adminDb.collection('audit_log').add({
      action: 'data_export',
      targetType: 'user',
      targetId: userId,
      performedBy: userId,
      reason: 'GDPR Art. 20 - Right to Data Portability',
      timestamp: new Date(),
      metadata: {
        enrollmentsExported: enrollmentsSnapshot.size,
        progressRecordsExported: progressSnapshot.size,
        xapiStatementsExported: xapiSnapshot.size,
        certificatesExported: certsSnapshot.size,
      },
    });

    log.info('User data exported (GDPR Art. 20)', {
      userId,
      enrollments: enrollmentsSnapshot.size,
      progress: progressSnapshot.size,
      xapiStatements: xapiSnapshot.size,
    });

    // 11. RETURN AS DOWNLOADABLE JSON
    const jsonContent = JSON.stringify(exportData, null, 2);
    const shortUserId = userId.slice(0, 8);

    return new NextResponse(jsonContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="lxd360-data-export-${shortUserId}-${Date.now()}.json"`,
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error) {
    log.error('Failed to export user data', { error });

    // Don't expose internal error details
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 });
  }
}
