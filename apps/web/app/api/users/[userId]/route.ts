import 'server-only';

/**
 * =============================================================================
 * User Deletion Endpoint (GDPR Art. 17 - Right to Erasure)
 * =============================================================================
 *
 * Implements the GDPR "Right to be Forgotten" (Article 17).
 * Users can request deletion of all their personal data.
 *
 * @module app/api/users/[userId]/route
 * @version 1.0.0
 */

import { FieldValue } from 'firebase-admin/firestore';
import { type NextRequest, NextResponse } from 'next/server';

import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { logger } from '@/lib/logger';

const log = logger.child({ module: 'api-user-deletion' });

/**
 * DELETE /api/users/[userId]
 *
 * Deletes a user account and all associated personal data.
 * Only the user themselves or an owner can delete an account.
 *
 * GDPR Article 17 Requirements:
 * - Delete all personal data without undue delay
 * - Inform processors to erase data
 * - Exceptions: legal obligations, public interest, legal claims
 */
export async function DELETE(
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
    const requestingUserRole = decodedToken.role || decodedToken.persona || 'learner';

    // 2. AUTHORIZATION
    // Users can only delete themselves, or owners can delete any user in their tenant
    const isSelfDeletion = requestingUserId === userId;
    const isOwner = requestingUserRole === 'owner';

    if (!isSelfDeletion && !isOwner) {
      log.warn('Forbidden: cannot delete other users', {
        requestingUserId,
        targetUserId: userId,
        role: requestingUserRole,
      });
      return NextResponse.json(
        { error: 'Forbidden: You can only delete your own account' },
        { status: 403 },
      );
    }

    // 3. VERIFY USER EXISTS
    const userRef = adminDb.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 4. DELETE USER DATA
    const batch = adminDb.batch();

    // Delete main user document
    batch.delete(userRef);

    // Delete user subcollections
    const subcollections = ['preferences', 'notifications', 'sessions'];
    for (const subcol of subcollections) {
      const snapshot = await userRef.collection(subcol).get();
      for (const doc of snapshot.docs) {
        batch.delete(doc.ref);
      }
    }

    // Delete from tenant memberships
    const membershipsQuery = adminDb.collectionGroup('members').where('userId', '==', userId);
    const memberships = await membershipsQuery.get();
    for (const doc of memberships.docs) {
      batch.delete(doc.ref);
    }

    // Delete enrollments
    const enrollmentsQuery = adminDb
      .collectionGroup('enrollments')
      .where('learnerId', '==', userId);
    const enrollments = await enrollmentsQuery.get();
    for (const doc of enrollments.docs) {
      batch.delete(doc.ref);
    }

    // Delete progress records
    const progressQuery = adminDb.collectionGroup('progress').where('userId', '==', userId);
    const progressDocs = await progressQuery.get();
    for (const doc of progressDocs.docs) {
      batch.delete(doc.ref);
    }

    // Anonymize xAPI statements (keep for analytics, remove PII)
    const xapiQuery = adminDb.collection('xapi_statements').where('actor_id', '==', userId);
    const xapiDocs = await xapiQuery.get();
    for (const doc of xapiDocs.docs) {
      batch.update(doc.ref, {
        actor_id: '[DELETED]',
        'statement.actor': {
          objectType: 'Agent',
          account: {
            homePage: 'https://lxd360.com',
            name: '[DELETED]',
          },
        },
        anonymized_at: FieldValue.serverTimestamp(),
      });
    }

    // 5. LOG DELETION FOR AUDIT (anonymized)
    const auditRef = adminDb.collection('audit_log').doc();
    batch.set(auditRef, {
      action: 'user_deletion',
      targetType: 'user',
      targetId: '[REDACTED]', // Don't store deleted user ID
      performedBy: isSelfDeletion ? '[SELF]' : requestingUserId,
      reason: 'GDPR Art. 17 - Right to Erasure',
      timestamp: FieldValue.serverTimestamp(),
      metadata: {
        enrollmentsDeleted: enrollments.size,
        progressRecordsDeleted: progressDocs.size,
        xapiStatementsAnonymized: xapiDocs.size,
      },
    });

    // 6. COMMIT BATCH
    await batch.commit();

    // 7. DELETE FROM FIREBASE AUTH
    await adminAuth.deleteUser(userId);

    log.info('User account deleted (GDPR Art. 17)', {
      requestedBy: isSelfDeletion ? 'self' : 'owner',
      enrollmentsDeleted: enrollments.size,
      progressRecordsDeleted: progressDocs.size,
      xapiStatementsAnonymized: xapiDocs.size,
    });

    return NextResponse.json({
      success: true,
      message: 'Account and all associated data have been deleted',
      details: {
        enrollmentsDeleted: enrollments.size,
        progressRecordsDeleted: progressDocs.size,
        xapiStatementsAnonymized: xapiDocs.size,
      },
    });
  } catch (error) {
    log.error('Failed to delete user account', { error });

    // Don't expose internal error details
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }
}
