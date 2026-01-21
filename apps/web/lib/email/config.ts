import type { EmailSender, EmailTemplate } from './types';

// ============================================================================
// ENVIRONMENT CONFIGURATION
// ============================================================================

/**
 * Check if we're in production
 */
export const isProduction = process.env.NODE_ENV === 'production';

/**
 * Check if email sending is enabled
 */
export const isEmailEnabled = process.env.BREVO_API_KEY !== undefined;

// ============================================================================
// SENDER CONFIGURATION
// ============================================================================

/**
 * Domain for all email addresses
 */
export const EMAIL_DOMAIN = process.env.EMAIL_DOMAIN || 'lxd360.com';

/**
 * Sender configurations by type
 */
export const SENDERS: Record<EmailSender, { name: string; address: string }> = {
  noreply: {
    name: 'LXD360',
    address: `noreply@${EMAIL_DOMAIN}`,
  },
  hello: {
    name: 'LXD360',
    address: `hello@${EMAIL_DOMAIN}`,
  },
  support: {
    name: 'LXD360 Support',
    address: `support@${EMAIL_DOMAIN}`,
  },
  billing: {
    name: 'LXD360 Billing',
    address: `billing@${EMAIL_DOMAIN}`,
  },
};

/**
 * Get formatted sender string
 */
export function getSender(sender: EmailSender): string {
  const config = SENDERS[sender];
  return `${config.name} <${config.address}>`;
}

/**
 * Default sender for emails
 */
export const DEFAULT_SENDER = getSender('noreply');

/**
 * Default reply-to address
 */
export const DEFAULT_REPLY_TO = SENDERS.support.address;

// ============================================================================
// URL CONFIGURATION
// ============================================================================

/**
 * Base application URL
 */
export const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://lxd360.com';

/**
 * URL builders for common links
 */
export const EMAIL_URLS = {
  /** Login page */
  login: `${APP_BASE_URL}/login`,

  /** Dashboard */
  dashboard: `${APP_BASE_URL}/dashboard`,

  /** Unsubscribe base URL (needs token appended) */
  unsubscribe: `${APP_BASE_URL}/unsubscribe`,

  /** Email preferences */
  preferences: `${APP_BASE_URL}/settings/notifications`,

  /** Support */
  support: `${APP_BASE_URL}/support`,

  /** Terms of service */
  terms: `${APP_BASE_URL}/terms`,

  /** Privacy policy */
  privacy: `${APP_BASE_URL}/privacy`,

  /** Build URL with path */
  build: (path: string) => `${APP_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`,
};

// ============================================================================
// TEMPLATE CONFIGURATION
// ============================================================================

/**
 * Default template data added to all emails
 */
export const DEFAULT_TEMPLATE_DATA = {
  /** Company name */
  companyName: 'LXD360',

  /** Company address for CAN-SPAM compliance */
  companyAddress: '1234 Main Street, Suite 100, Austin, TX 78701',

  /** Support email */
  supportEmail: SENDERS.support.address,

  /** Current year */
  year: new Date().getFullYear(),

  /** Base URL */
  baseUrl: APP_BASE_URL,

  /** Unsubscribe URL (placeholder - should be replaced per user) */
  unsubscribeUrl: EMAIL_URLS.unsubscribe,

  /** Privacy URL */
  privacyUrl: EMAIL_URLS.privacy,

  /** Terms URL */
  termsUrl: EMAIL_URLS.terms,
};

// ============================================================================
// RATE LIMITING
// ============================================================================

/**
 * Email rate limits by category
 */
export const EMAIL_RATE_LIMITS = {
  /** Standard emails per hour per user */
  standardPerHour: 20,

  /** Transactional emails (auth, orders) per hour per user */
  transactionalPerHour: 50,

  /** Marketing/newsletter emails per day */
  marketingPerDay: 5,

  /** Batch email maximum recipients */
  batchMaxRecipients: 100,

  /** Minimum delay between emails to same recipient (seconds) */
  minDelaySeconds: 10,
};

// ============================================================================
// WEBHOOK CONFIGURATION
// ============================================================================

/**
 * Email webhook signing secret
 */
export const WEBHOOK_SECRET = process.env.BREVO_WEBHOOK_SECRET;

/**
 * Webhook endpoint URL
 */
export const WEBHOOK_ENDPOINT = `${APP_BASE_URL}/api/webhooks/email`;

// ============================================================================
// RETRY CONFIGURATION
// ============================================================================

/**
 * Email retry configuration
 */
export const RETRY_CONFIG = {
  /** Maximum retry attempts */
  maxAttempts: 3,

  /** Initial delay in milliseconds */
  initialDelayMs: 1000,

  /** Multiplier for exponential backoff */
  backoffMultiplier: 2,

  /** Maximum delay in milliseconds */
  maxDelayMs: 30000,

  /** Errors that should trigger retry */
  retryableErrors: ['ETIMEDOUT', 'ECONNRESET', 'ECONNREFUSED', 'EAI_AGAIN', 'rate_limit_exceeded'],
};

// ============================================================================
// TEMPLATE CATEGORIES
// ============================================================================

/**
 * Template categories for organization
 */
export const TEMPLATE_CATEGORIES = {
  auth: {
    name: 'Authentication',
    description: 'Account and authentication related emails',
    templates: ['welcome', 'email_verification', 'password_reset'] as EmailTemplate[],
  },
  general: {
    name: 'General',
    description: 'General platform communications',
    templates: ['contact_confirmation', 'waitlist_welcome'] as EmailTemplate[],
  },
  inspire: {
    name: 'INSPIRE Studio',
    description: 'Project and collaboration emails',
    templates: [
      'project_invite',
      'review_request',
      'project_published',
      'collaboration_alert',
    ] as EmailTemplate[],
  },
  lms: {
    name: 'LXP360 LMS',
    description: 'Learning and assessment emails',
    templates: [
      'course_enrolled',
      'progress_reminder',
      'assessment_complete',
      'certificate_earned',
    ] as EmailTemplate[],
  },
  nexus: {
    name: 'LXD Nexus',
    description: 'Networking and mentorship emails',
    templates: [
      'nexus_connection_request',
      'nexus_connection_accepted',
      'nexus_session_reminder',
      'nexus_new_message',
    ] as EmailTemplate[],
  },
  consultation: {
    name: 'Consultation',
    description: 'Consultation service emails',
    templates: [
      'consultation_received',
      'consultation_proposal',
      'consultation_scheduled',
    ] as EmailTemplate[],
  },
  ecommerce: {
    name: 'Ecommerce',
    description: 'Billing and subscription emails',
    templates: [
      'order_confirmation',
      'invoice_receipt',
      'subscription_created',
      'subscription_renewed',
      'subscription_canceled',
      'subscription_expiring',
      'payment_failed',
      'payment_method_updated',
    ] as EmailTemplate[],
  },
};

// ============================================================================
// DEVELOPMENT & TESTING
// ============================================================================

/**
 * Test/development configuration
 */
export const DEV_CONFIG = {
  /** Intercept all emails and send to this address in development */
  interceptEmail: process.env.DEV_EMAIL_INTERCEPT,

  /** Log email content to console instead of sending */
  logOnly: process.env.EMAIL_LOG_ONLY === 'true',

  /** Preview URL for email templates */
  previewUrl: `${APP_BASE_URL}/api/dev/email-preview`,

  /** Test recipient for development */
  testRecipient: process.env.DEV_EMAIL_RECIPIENT || 'test@example.com',
};

/**
 * Check if email should be intercepted (development mode)
 */
export function shouldInterceptEmail(): boolean {
  return !isProduction && !!DEV_CONFIG.interceptEmail;
}

/**
 * Check if email should be logged only (no actual sending)
 */
export function shouldLogOnly(): boolean {
  return DEV_CONFIG.logOnly || (!isProduction && !isEmailEnabled);
}

// ============================================================================
// BRANDING CONFIGURATION
// ============================================================================

/**
 * Email branding configuration
 */
export const BRANDING = {
  /** Logo URL for emails */
  logoUrl: `${APP_BASE_URL}/images/logo.png`,

  /** Logo alt text */
  logoAlt: 'LXD360',

  /** Primary brand color */
  primaryColor: '#2563eb',

  /** Secondary color */
  secondaryColor: '#1e40af',

  /** Background color */
  backgroundColor: '#f3f4f6',

  /** Text color */
  textColor: '#1f2937',

  /** Muted text color */
  mutedTextColor: '#6b7280',

  /** Link color */
  linkColor: '#2563eb',

  /** Button background */
  buttonBackground: '#2563eb',

  /** Button text color */
  buttonTextColor: '#ffffff',

  /** Border color */
  borderColor: '#e5e7eb',

  /** Social media links */
  socialLinks: {
    twitter: 'https://twitter.com/lxd360',
    linkedin: 'https://linkedin.com/company/lxd360',
    facebook: 'https://facebook.com/lxd360',
  },
};

// ============================================================================
// EMAIL CONFIGURATION OBJECT
// ============================================================================

/**
 * Complete email configuration
 */
export const EMAIL_CONFIG = {
  /** Environment settings */
  isProduction,
  isEmailEnabled,

  /** Sender settings */
  senders: SENDERS,
  defaultSender: DEFAULT_SENDER,
  defaultReplyTo: DEFAULT_REPLY_TO,
  domain: EMAIL_DOMAIN,

  /** URL settings */
  baseUrl: APP_BASE_URL,
  urls: EMAIL_URLS,

  /** Template settings */
  defaultTemplateData: DEFAULT_TEMPLATE_DATA,
  categories: TEMPLATE_CATEGORIES,

  /** Rate limiting */
  rateLimits: EMAIL_RATE_LIMITS,

  /** Retry settings */
  retry: RETRY_CONFIG,

  /** Webhook settings */
  webhookSecret: WEBHOOK_SECRET,
  webhookEndpoint: WEBHOOK_ENDPOINT,

  /** Development settings */
  dev: DEV_CONFIG,

  /** Branding */
  branding: BRANDING,

  /** Helper functions */
  getSender,
  shouldInterceptEmail,
  shouldLogOnly,
};

export default EMAIL_CONFIG;
