/**
 * =============================================================================
 * LXP360-SaaS | Email Templates Index
 * =============================================================================
 *
 * Export all email templates for use in the email service layer
 */

// Base Layout and shared components
export { BaseLayout, colors } from './components/base-layout';
export { CourseCompletionEmail, default as CourseCompletion } from './course-completion';
export { CourseEnrollmentEmail, default as CourseEnrollment } from './course-enrollment';
export { default as EmailVerification, EmailVerificationEmail } from './email-verification';
export { default as NotificationDigest, NotificationDigestEmail } from './notification-digest';
export { default as PasswordReset, PasswordResetEmail } from './password-reset';
export { default as TeamInvitation, TeamInvitationEmail } from './team-invitation';
// Email Templates
// Re-export default as named exports for convenience
export { default as Welcome, WelcomeEmail } from './welcome';
