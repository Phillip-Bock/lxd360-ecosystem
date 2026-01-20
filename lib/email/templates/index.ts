/**
 * Brevo Email Templates
 *
 * Template IDs for transactional emails in Brevo.
 * Configure these IDs in Brevo Dashboard > Transactional > Email Templates
 *
 * @module lib/email/templates
 */

// =============================================================================
// Template IDs
// =============================================================================

/**
 * Email template IDs configured in Brevo Dashboard
 *
 * TODO(LXD-248): Update these IDs with actual Brevo template IDs after
 * templates are created in the Brevo Dashboard
 */
export const EMAIL_TEMPLATES = {
  /**
   * Welcome email sent after user registration
   * Template variables: {{ params.FIRSTNAME }}, {{ params.LOGIN_URL }}
   */
  WELCOME: Number(process.env.BREVO_TEMPLATE_WELCOME) || 1,

  /**
   * Email verification email
   * Template variables: {{ params.FIRSTNAME }}, {{ params.VERIFICATION_URL }}
   */
  VERIFICATION: Number(process.env.BREVO_TEMPLATE_VERIFICATION) || 2,

  /**
   * Password reset email
   * Template variables: {{ params.FIRSTNAME }}, {{ params.RESET_URL }}, {{ params.EXPIRY_TIME }}
   */
  PASSWORD_RESET: Number(process.env.BREVO_TEMPLATE_PASSWORD_RESET) || 3,

  /**
   * Course enrollment confirmation
   * Template variables: {{ params.FIRSTNAME }}, {{ params.COURSE_TITLE }}, {{ params.COURSE_URL }}
   */
  COURSE_ENROLLMENT: Number(process.env.BREVO_TEMPLATE_COURSE_ENROLLMENT) || 4,

  /**
   * Course completion congratulations
   * Template variables: {{ params.FIRSTNAME }}, {{ params.COURSE_TITLE }}, {{ params.CERTIFICATE_URL }}
   */
  COURSE_COMPLETION: Number(process.env.BREVO_TEMPLATE_COURSE_COMPLETION) || 5,

  /**
   * New lesson available notification
   * Template variables: {{ params.FIRSTNAME }}, {{ params.COURSE_TITLE }}, {{ params.LESSON_TITLE }}, {{ params.LESSON_URL }}
   */
  NEW_LESSON: Number(process.env.BREVO_TEMPLATE_NEW_LESSON) || 6,

  /**
   * Payment receipt / invoice
   * Template variables: {{ params.FIRSTNAME }}, {{ params.AMOUNT }}, {{ params.PLAN_NAME }}, {{ params.INVOICE_URL }}
   */
  PAYMENT_RECEIPT: Number(process.env.BREVO_TEMPLATE_PAYMENT_RECEIPT) || 7,

  /**
   * Subscription renewal reminder
   * Template variables: {{ params.FIRSTNAME }}, {{ params.PLAN_NAME }}, {{ params.RENEWAL_DATE }}, {{ params.BILLING_URL }}
   */
  SUBSCRIPTION_RENEWAL: Number(process.env.BREVO_TEMPLATE_SUBSCRIPTION_RENEWAL) || 8,

  /**
   * Organization invitation
   * Template variables: {{ params.INVITER_NAME }}, {{ params.ORG_NAME }}, {{ params.INVITE_URL }}
   */
  ORG_INVITATION: Number(process.env.BREVO_TEMPLATE_ORG_INVITATION) || 9,

  /**
   * Assignment notification
   * Template variables: {{ params.FIRSTNAME }}, {{ params.ASSIGNMENT_TITLE }}, {{ params.DUE_DATE }}, {{ params.ASSIGNMENT_URL }}
   */
  ASSIGNMENT_NOTIFICATION: Number(process.env.BREVO_TEMPLATE_ASSIGNMENT_NOTIFICATION) || 10,
} as const;

// =============================================================================
// Template Types
// =============================================================================

export type EmailTemplateKey = keyof typeof EMAIL_TEMPLATES;
export type EmailTemplateId = (typeof EMAIL_TEMPLATES)[EmailTemplateKey];

// =============================================================================
// Template Parameter Types
// =============================================================================

/**
 * Base type for email template parameters
 * All params must be strings, numbers, or booleans for Brevo compatibility
 */
export type EmailParams = Record<string, string | number | boolean | undefined>;

export interface WelcomeEmailParams extends EmailParams {
  FIRSTNAME: string;
  LOGIN_URL: string;
}

export interface VerificationEmailParams extends EmailParams {
  FIRSTNAME: string;
  VERIFICATION_URL: string;
}

export interface PasswordResetEmailParams extends EmailParams {
  FIRSTNAME: string;
  RESET_URL: string;
  EXPIRY_TIME: string;
}

export interface CourseEnrollmentEmailParams extends EmailParams {
  FIRSTNAME: string;
  COURSE_TITLE: string;
  COURSE_URL: string;
}

export interface CourseCompletionEmailParams extends EmailParams {
  FIRSTNAME: string;
  COURSE_TITLE: string;
  CERTIFICATE_URL?: string;
}

export interface NewLessonEmailParams extends EmailParams {
  FIRSTNAME: string;
  COURSE_TITLE: string;
  LESSON_TITLE: string;
  LESSON_URL: string;
}

export interface PaymentReceiptEmailParams extends EmailParams {
  FIRSTNAME: string;
  AMOUNT: string;
  PLAN_NAME: string;
  INVOICE_URL?: string;
}

export interface SubscriptionRenewalEmailParams extends EmailParams {
  FIRSTNAME: string;
  PLAN_NAME: string;
  RENEWAL_DATE: string;
  BILLING_URL: string;
}

export interface OrgInvitationEmailParams extends EmailParams {
  INVITER_NAME: string;
  ORG_NAME: string;
  INVITE_URL: string;
}

export interface AssignmentNotificationEmailParams extends EmailParams {
  FIRSTNAME: string;
  ASSIGNMENT_TITLE: string;
  DUE_DATE: string;
  ASSIGNMENT_URL: string;
}
