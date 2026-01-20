/**
 * Transactional Email Services
 *
 * Service functions for sending transactional emails via Brevo.
 * These emails are triggered by user actions (registration, password reset, etc.)
 *
 * @module lib/email/services/transactional
 */

import { type SendEmailResult, sendTemplateEmail } from '../brevo-client';
import {
  type CourseCompletionEmailParams,
  type CourseEnrollmentEmailParams,
  EMAIL_TEMPLATES,
  type OrgInvitationEmailParams,
  type PasswordResetEmailParams,
  type VerificationEmailParams,
  type WelcomeEmailParams,
} from '../templates';

// =============================================================================
// Configuration
// =============================================================================

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://lxd360.io';

// =============================================================================
// Authentication Emails
// =============================================================================

/**
 * Sends a welcome email to a newly registered user
 *
 * @param email - User's email address
 * @param firstName - User's first name
 * @returns Promise resolving to send result
 */
export async function sendWelcomeEmail(email: string, firstName: string): Promise<SendEmailResult> {
  const params: WelcomeEmailParams = {
    FIRSTNAME: firstName,
    LOGIN_URL: `${APP_URL}/login`,
  };

  return sendTemplateEmail({
    to: [{ email, name: firstName }],
    templateId: EMAIL_TEMPLATES.WELCOME,
    params,
    tags: ['welcome', 'authentication'],
  });
}

/**
 * Sends an email verification email
 *
 * @param email - User's email address
 * @param firstName - User's first name
 * @param verificationToken - Token for email verification
 * @returns Promise resolving to send result
 */
export async function sendVerificationEmail(
  email: string,
  firstName: string,
  verificationToken: string,
): Promise<SendEmailResult> {
  const params: VerificationEmailParams = {
    FIRSTNAME: firstName,
    VERIFICATION_URL: `${APP_URL}/verify-email?token=${encodeURIComponent(verificationToken)}`,
  };

  return sendTemplateEmail({
    to: [{ email, name: firstName }],
    templateId: EMAIL_TEMPLATES.VERIFICATION,
    params,
    tags: ['verification', 'authentication'],
  });
}

/**
 * Sends a password reset email
 *
 * @param email - User's email address
 * @param firstName - User's first name
 * @param resetToken - Token for password reset
 * @param expiryMinutes - How long the reset link is valid (default: 60 minutes)
 * @returns Promise resolving to send result
 */
export async function sendPasswordResetEmail(
  email: string,
  firstName: string,
  resetToken: string,
  expiryMinutes: number = 60,
): Promise<SendEmailResult> {
  const params: PasswordResetEmailParams = {
    FIRSTNAME: firstName,
    RESET_URL: `${APP_URL}/reset-password?token=${encodeURIComponent(resetToken)}`,
    EXPIRY_TIME: `${expiryMinutes} minutes`,
  };

  return sendTemplateEmail({
    to: [{ email, name: firstName }],
    templateId: EMAIL_TEMPLATES.PASSWORD_RESET,
    params,
    tags: ['password-reset', 'authentication'],
  });
}

// =============================================================================
// Course Emails
// =============================================================================

/**
 * Sends a course enrollment confirmation email
 *
 * @param email - User's email address
 * @param firstName - User's first name
 * @param courseId - ID of the enrolled course
 * @param courseTitle - Title of the enrolled course
 * @returns Promise resolving to send result
 */
export async function sendCourseEnrollmentEmail(
  email: string,
  firstName: string,
  courseId: string,
  courseTitle: string,
): Promise<SendEmailResult> {
  const params: CourseEnrollmentEmailParams = {
    FIRSTNAME: firstName,
    COURSE_TITLE: courseTitle,
    COURSE_URL: `${APP_URL}/lxp360/courses/${encodeURIComponent(courseId)}`,
  };

  return sendTemplateEmail({
    to: [{ email, name: firstName }],
    templateId: EMAIL_TEMPLATES.COURSE_ENROLLMENT,
    params,
    tags: ['course', 'enrollment'],
  });
}

/**
 * Sends a course completion congratulations email
 *
 * @param email - User's email address
 * @param firstName - User's first name
 * @param courseTitle - Title of the completed course
 * @param certificateUrl - Optional URL to the completion certificate
 * @returns Promise resolving to send result
 */
export async function sendCourseCompletionEmail(
  email: string,
  firstName: string,
  courseTitle: string,
  certificateUrl?: string,
): Promise<SendEmailResult> {
  const params: CourseCompletionEmailParams = {
    FIRSTNAME: firstName,
    COURSE_TITLE: courseTitle,
    CERTIFICATE_URL: certificateUrl ?? `${APP_URL}/lxp360/certificates`,
  };

  return sendTemplateEmail({
    to: [{ email, name: firstName }],
    templateId: EMAIL_TEMPLATES.COURSE_COMPLETION,
    params,
    tags: ['course', 'completion', 'achievement'],
  });
}

// =============================================================================
// Organization Emails
// =============================================================================

/**
 * Sends an organization invitation email
 *
 * @param email - Invitee's email address
 * @param inviterName - Name of the person sending the invitation
 * @param organizationName - Name of the organization
 * @param invitationToken - Token for accepting the invitation
 * @returns Promise resolving to send result
 */
export async function sendOrganizationInvitationEmail(
  email: string,
  inviterName: string,
  organizationName: string,
  invitationToken: string,
): Promise<SendEmailResult> {
  const params: OrgInvitationEmailParams = {
    INVITER_NAME: inviterName,
    ORG_NAME: organizationName,
    INVITE_URL: `${APP_URL}/invite?token=${encodeURIComponent(invitationToken)}`,
  };

  return sendTemplateEmail({
    to: [{ email }],
    templateId: EMAIL_TEMPLATES.ORG_INVITATION,
    params,
    tags: ['organization', 'invitation'],
  });
}
