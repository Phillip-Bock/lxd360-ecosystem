// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type {
  AssessmentCompleteData,
  // Template data types
  BaseTemplateData,
  BatchEmailResult,
  ConsultationReceivedData,
  ContactConfirmationData,
  CourseEnrolledData,
  EmailAttachment,
  EmailLogEntry,
  EmailPayload,
  EmailResult,
  EmailSender,
  EmailStatusType,
  // Email types
  EmailTemplate,
  EmailWebhookPayload,
  NexusConnectionRequestData,
  NexusSessionReminderData,
  OrderConfirmationData,
  PasswordResetData,
  PaymentFailedData,
  ProjectInviteData,
  // Template metadata
  TemplateMetadata,
  WaitlistWelcomeData,
  // Webhook types
  WebhookEventType,
  WelcomeEmailData,
} from './types';

// ============================================================================
// CONSTANTS
// ============================================================================

export {
  EmailSenders,
  EmailStatus,
  // Templates
  EmailTemplates,
  TEMPLATE_REGISTRY,
  WebhookEventTypes,
} from './types';

// ============================================================================
// CONFIGURATION
// ============================================================================

export {
  // URLs
  APP_BASE_URL,
  // Branding
  BRANDING,
  DEFAULT_REPLY_TO,
  DEFAULT_SENDER,
  // Template defaults
  DEFAULT_TEMPLATE_DATA,
  // Dev config
  DEV_CONFIG,
  // Full config object
  EMAIL_CONFIG,
  // Senders
  EMAIL_DOMAIN,
  // Rate limits
  EMAIL_RATE_LIMITS,
  EMAIL_URLS,
  getSender,
  isEmailEnabled,
  // Environment
  isProduction,
  // Retry
  RETRY_CONFIG,
  SENDERS,
  shouldInterceptEmail,
  shouldLogOnly,
  // Categories
  TEMPLATE_CATEGORIES,
  WEBHOOK_ENDPOINT,
  // Webhook
  WEBHOOK_SECRET,
} from './config';

// ============================================================================
// TEMPLATE RENDERING
// ============================================================================

export {
  getAvailableTemplates,
  renderTemplate,
  templateExists,
} from './templates/renderer';

// ============================================================================
// TESTING UTILITIES (for development/testing only)
// ============================================================================

export {
  assertEmailContains,
  assertEmailCount,
  // Assertions
  assertEmailSent,
  assertNoEmailsSent,
  clearSentEmails,
  // Utils object
  emailTestUtils,
  // Sample data
  generateSampleData,
  getEmailsByTemplate,
  getEmailsTo,
  getSentEmails,
  // Mock client
  mockSendEmail,
  setMockResultGenerator,
  testRenderAllTemplates,
  testTemplate,
  // Template testing
  validateTemplateData,
} from './testing';

// ============================================================================
// BREVO EMAIL SERVICES
// ============================================================================

// Brevo client and core functions
export {
  type EmailRecipient as BrevoEmailRecipient,
  getContactsApi,
  getTransactionalEmailsApi,
  type SendEmailParams as BrevoSendEmailParams,
  type SendEmailResult as BrevoSendEmailResult,
  type SendTemplateEmailParams as BrevoSendTemplateEmailParams,
  sendEmail as brevoSendEmail,
  sendTemplateEmail as brevoSendTemplateEmail,
} from './brevo-client';
// Brevo marketing services
export {
  type AddContactResult as BrevoAddContactResult,
  addToContactList as brevoAddToContactList,
  addToWaitlist as brevoAddToWaitlist,
  CONTACT_LISTS as BREVO_CONTACT_LISTS,
  type ContactAttributes as BrevoContactAttributes,
  type ContactListId as BrevoContactListId,
  type ContactListKey as BrevoContactListKey,
  type CreateCampaignParams as BrevoCreateCampaignParams,
  type CreateCampaignResult as BrevoCreateCampaignResult,
  createCampaign as brevoCreateCampaign,
  createContact as brevoCreateContact,
  type ListOperationResult as BrevoListOperationResult,
  removeFromContactList as brevoRemoveFromContactList,
  type SendCampaignResult as BrevoSendCampaignResult,
  sendCampaign as brevoSendCampaign,
  subscribeToNewsletter as brevoSubscribeToNewsletter,
} from './services/marketing';

// Brevo transactional email services
export {
  sendCourseCompletionEmail as brevoSendCourseCompletionEmail,
  sendCourseEnrollmentEmail as brevoSendCourseEnrollmentEmail,
  sendOrganizationInvitationEmail as brevoSendOrganizationInvitationEmail,
  sendPasswordResetEmail as brevoSendPasswordResetEmail,
  sendVerificationEmail as brevoSendVerificationEmail,
  sendWelcomeEmail as brevoSendWelcomeEmail,
} from './services/transactional';
// Brevo template constants
export {
  EMAIL_TEMPLATES as BREVO_TEMPLATES,
  type EmailTemplateId as BrevoTemplateId,
  type EmailTemplateKey as BrevoTemplateKey,
} from './templates';
