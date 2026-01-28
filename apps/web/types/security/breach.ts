/**
 * =============================================================================
 * Breach Notification Types (GDPR Art. 33-34)
 * =============================================================================
 *
 * Type definitions for data breach events and notifications.
 * Implements GDPR Article 33 (notification to authority) and
 * Article 34 (notification to data subjects).
 *
 * @module types/security/breach
 * @version 1.0.0
 */

import type { Timestamp } from 'firebase/firestore';

/**
 * Severity levels for breach events
 * - low: Minor incident, no personal data exposed
 * - medium: Limited personal data exposure
 * - high: Significant personal data exposure, requires DPA notification
 * - critical: Mass data exposure, requires immediate user notification
 */
export type BreachSeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * Status of breach investigation and response
 */
export type BreachStatus = 'detected' | 'investigating' | 'contained' | 'resolved';

/**
 * Categories of personal data that may be affected
 */
export type AffectedDataType =
  | 'email'
  | 'name'
  | 'password_hash'
  | 'learning_records'
  | 'assessment_scores'
  | 'financial_data'
  | 'location_data'
  | 'biometric_data'
  | 'health_data'
  | 'other';

/**
 * Data breach event record
 * Stored in Firestore for compliance audit trail
 */
export interface BreachEvent {
  /** Unique identifier for the breach */
  id: string;

  /** Severity classification */
  severity: BreachSeverity;

  /** Estimated number of affected users */
  affectedUserCount: number;

  /** Types of personal data affected */
  affectedDataTypes: AffectedDataType[];

  /** When the breach was discovered */
  discoveredAt: Timestamp;

  /** When supervisory authority was notified (GDPR Art. 33: within 72 hours) */
  reportedToAuthorityAt?: Timestamp;

  /** When affected users were notified (GDPR Art. 34) */
  usersNotifiedAt?: Timestamp;

  /** Human-readable description of the breach */
  description: string;

  /** Root cause analysis (if known) */
  rootCause?: string;

  /** Steps taken to remediate */
  remediation: string;

  /** Current status of the breach response */
  status: BreachStatus;

  /** User ID of person who logged the breach */
  createdBy: string;

  /** Tenant/organization affected */
  tenantId: string;

  /** ISO 8601 timestamp of record creation */
  createdAt?: string;

  /** ISO 8601 timestamp of last update */
  updatedAt?: string;
}

/**
 * Configuration for breach notification automation
 */
export interface BreachNotificationConfig {
  /** Email address for supervisory authority (Data Protection Authority) */
  authorityEmail?: string;

  /** Template ID for user notification emails (Brevo) */
  notificationTemplateId?: string;

  /** Minimum severity that triggers automatic notification */
  autoNotifyThreshold: BreachSeverity;

  /** Whether to automatically notify affected users for high/critical breaches */
  autoNotifyUsers?: boolean;

  /** Contact email for DPO (Data Protection Officer) */
  dpoEmail?: string;
}

/**
 * Input for creating a new breach event
 */
export type CreateBreachEventInput = Omit<BreachEvent, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Response from breach notification operations
 */
export interface BreachNotificationResult {
  success: boolean;
  breachId?: string;
  notifiedAuthority?: boolean;
  notifiedUsers?: number;
  error?: string;
}
