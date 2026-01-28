import 'server-only';

/**
 * =============================================================================
 * Breach Notification Module (GDPR Art. 33-34)
 * =============================================================================
 *
 * Implements data breach notification procedures required by GDPR:
 * - Article 33: Notify supervisory authority within 72 hours
 * - Article 34: Notify affected data subjects without undue delay
 *
 * @module lib/security/breach-notification
 * @version 1.0.0
 */

import { logger } from '@/lib/logger';
import type {
  BreachEvent,
  BreachNotificationResult,
  BreachSeverity,
  CreateBreachEventInput,
} from '@/types/security/breach';

const log = logger.child({ module: 'breach-notification' });

/** GDPR Article 33 requires notification within 72 hours */
const AUTHORITY_DEADLINE_HOURS = 72;

/**
 * Log a data breach event to Firestore
 *
 * Creates an audit record of the breach for compliance purposes.
 * This should be called immediately upon discovering a breach.
 *
 * @param event - Breach event details (without id)
 * @returns The generated breach ID
 */
export async function logBreachEvent(event: CreateBreachEventInput): Promise<string> {
  const breachId = `breach-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  log.error('DATA BREACH LOGGED', {
    breachId,
    severity: event.severity,
    affectedUsers: event.affectedUserCount,
    dataTypes: event.affectedDataTypes,
    description: event.description,
    tenantId: event.tenantId,
  });

  // TODO(LXD-377): Implement Firestore write to /breaches collection
  // const { adminDb } = await import('@/lib/firebase/admin');
  // await adminDb.collection('breaches').doc(breachId).set({
  //   ...event,
  //   id: breachId,
  //   createdAt: new Date().toISOString(),
  //   updatedAt: new Date().toISOString(),
  // });

  return breachId;
}

/**
 * Notify supervisory authority of a data breach
 *
 * GDPR Article 33 requires notification within 72 hours of becoming
 * aware of a breach, unless the breach is unlikely to result in a
 * risk to the rights and freedoms of natural persons.
 *
 * @param breachId - ID of the breach event
 * @returns Success status
 */
export async function notifyAuthorities(breachId: string): Promise<boolean> {
  log.warn('AUTHORITY NOTIFICATION REQUIRED', {
    breachId,
    deadline: `${AUTHORITY_DEADLINE_HOURS} hours`,
    action: 'Contact Data Protection Authority',
  });

  // TODO(LXD-377): Implement actual notification
  // - Send email to configured DPA address
  // - Include: nature of breach, categories of data, approximate number of subjects
  // - Include: name and contact details of DPO
  // - Include: likely consequences and measures taken

  return true;
}

/**
 * Notify affected data subjects of a breach
 *
 * GDPR Article 34 requires notification to affected individuals
 * when a breach is likely to result in high risk to their rights
 * and freedoms.
 *
 * @param breachId - ID of the breach event
 * @param userIds - Array of affected user IDs to notify
 * @returns Count of successful and failed notifications
 */
export async function notifyAffectedUsers(
  breachId: string,
  userIds: string[],
): Promise<{ notified: number; failed: number }> {
  log.warn('USER NOTIFICATION REQUIRED', {
    breachId,
    userCount: userIds.length,
    action: 'Send notification emails to affected users',
  });

  // TODO(LXD-377): Implement user notification via Brevo
  // - Use clear, plain language
  // - Include: nature of breach, name/contact of DPO
  // - Include: likely consequences and measures taken
  // - Include: measures users can take to protect themselves

  return { notified: 0, failed: userIds.length };
}

/**
 * Determine if a breach severity requires automatic notification
 *
 * High and critical severity breaches should trigger automatic
 * notification to authorities and (for critical) affected users.
 *
 * @param severity - The breach severity level
 * @returns Whether automatic notification should be triggered
 */
export function shouldAutoNotify(severity: BreachSeverity): boolean {
  return severity === 'high' || severity === 'critical';
}

/**
 * Determine if users should be notified based on severity
 *
 * GDPR Article 34 requires user notification when breach is likely
 * to result in "high risk" to rights and freedoms.
 *
 * @param severity - The breach severity level
 * @returns Whether users should be notified
 */
export function shouldNotifyUsers(severity: BreachSeverity): boolean {
  return severity === 'critical';
}

/**
 * Calculate deadline for authority notification
 *
 * @param discoveredAt - When the breach was discovered
 * @returns ISO 8601 timestamp of notification deadline
 */
export function getAuthorityNotificationDeadline(discoveredAt: Date): string {
  const deadline = new Date(discoveredAt);
  deadline.setHours(deadline.getHours() + AUTHORITY_DEADLINE_HOURS);
  return deadline.toISOString();
}

/**
 * Handle a complete breach notification workflow
 *
 * This orchestrates the full breach response:
 * 1. Log the breach event
 * 2. Notify authorities if required
 * 3. Notify affected users if required
 *
 * @param event - Breach event details
 * @param affectedUserIds - Optional list of affected user IDs
 * @returns Result of the notification workflow
 */
export async function handleBreachNotification(
  event: CreateBreachEventInput,
  affectedUserIds?: string[],
): Promise<BreachNotificationResult> {
  try {
    // 1. Log the breach
    const breachId = await logBreachEvent(event);

    let notifiedAuthority = false;
    let notifiedUsers = 0;

    // 2. Notify authorities for high/critical breaches
    if (shouldAutoNotify(event.severity)) {
      notifiedAuthority = await notifyAuthorities(breachId);
    }

    // 3. Notify users for critical breaches
    if (shouldNotifyUsers(event.severity) && affectedUserIds?.length) {
      const result = await notifyAffectedUsers(breachId, affectedUserIds);
      notifiedUsers = result.notified;
    }

    log.info('Breach notification workflow completed', {
      breachId,
      notifiedAuthority,
      notifiedUsers,
    });

    return {
      success: true,
      breachId,
      notifiedAuthority,
      notifiedUsers,
    };
  } catch (error) {
    log.error('Breach notification workflow failed', { error });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get breach event by ID
 *
 * @param breachId - The breach ID to retrieve
 * @returns The breach event or null if not found
 */
export async function getBreachEvent(breachId: string): Promise<BreachEvent | null> {
  // TODO(LXD-377): Implement Firestore read
  log.debug('Get breach event', { breachId });
  return null;
}

/**
 * Update breach event status
 *
 * @param breachId - The breach ID to update
 * @param status - New status
 * @param updates - Additional fields to update
 * @returns Success status
 */
export async function updateBreachStatus(
  breachId: string,
  status: BreachEvent['status'],
  updates?: Partial<BreachEvent>,
): Promise<boolean> {
  log.info('Update breach status', { breachId, status, updates });

  // TODO(LXD-377): Implement Firestore update
  // const { adminDb } = await import('@/lib/firebase/admin');
  // await adminDb.collection('breaches').doc(breachId).update({
  //   status,
  //   ...updates,
  //   updatedAt: new Date().toISOString(),
  // });

  return true;
}
