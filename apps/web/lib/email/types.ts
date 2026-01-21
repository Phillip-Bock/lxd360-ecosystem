// ============================================================================
// EMAIL TEMPLATES
// ============================================================================

/**
 * All available email templates
 */
export const EmailTemplates = {
  // General / Auth
  WELCOME: 'welcome',
  CONTACT_CONFIRMATION: 'contact_confirmation',
  WAITLIST_WELCOME: 'waitlist_welcome',
  PASSWORD_RESET: 'password_reset',
  EMAIL_VERIFICATION: 'email_verification',

  // INSPIRE Studio
  PROJECT_INVITE: 'project_invite',
  REVIEW_REQUEST: 'review_request',
  PROJECT_PUBLISHED: 'project_published',
  COLLABORATION_ALERT: 'collaboration_alert',

  // LXP360 LMS-LRS
  COURSE_ENROLLED: 'course_enrolled',
  PROGRESS_REMINDER: 'progress_reminder',
  ASSESSMENT_COMPLETE: 'assessment_complete',
  CERTIFICATE_EARNED: 'certificate_earned',

  // LXD Nexus
  NEXUS_CONNECTION_REQUEST: 'nexus_connection_request',
  NEXUS_CONNECTION_ACCEPTED: 'nexus_connection_accepted',
  NEXUS_SESSION_REMINDER: 'nexus_session_reminder',
  NEXUS_NEW_MESSAGE: 'nexus_new_message',

  // Consultation Services
  CONSULTATION_RECEIVED: 'consultation_received',
  CONSULTATION_PROPOSAL: 'consultation_proposal',
  CONSULTATION_SCHEDULED: 'consultation_scheduled',

  // Ecommerce / Billing
  ORDER_CONFIRMATION: 'order_confirmation',
  INVOICE_RECEIPT: 'invoice_receipt',
  SUBSCRIPTION_CREATED: 'subscription_created',
  SUBSCRIPTION_RENEWED: 'subscription_renewed',
  SUBSCRIPTION_CANCELED: 'subscription_canceled',
  SUBSCRIPTION_EXPIRING: 'subscription_expiring',
  PAYMENT_FAILED: 'payment_failed',
  PAYMENT_METHOD_UPDATED: 'payment_method_updated',
} as const;

export type EmailTemplate = (typeof EmailTemplates)[keyof typeof EmailTemplates];

// ============================================================================
// SENDER TYPES
// ============================================================================

/**
 * Available sender addresses
 */
export const EmailSenders = {
  NOREPLY: 'noreply',
  HELLO: 'hello',
  SUPPORT: 'support',
  BILLING: 'billing',
} as const;

export type EmailSender = (typeof EmailSenders)[keyof typeof EmailSenders];

// ============================================================================
// EMAIL PAYLOAD
// ============================================================================

/**
 * Email attachment
 */
export interface EmailAttachment {
  /** Filename for the attachment */
  filename: string;
  /** Content as string (base64) or Buffer */
  content: string | Buffer;
  /** MIME type */
  contentType: string;
  /** Optional content ID for inline attachments */
  cid?: string;
}

/**
 * Email payload for sending
 */
export interface EmailPayload {
  /** Recipient email address(es) */
  to: string | string[];
  /** Email subject */
  subject: string;
  /** Template to use */
  template: EmailTemplate;
  /** Data to inject into template */
  data: Record<string, unknown>;
  /** Override default sender */
  from?: string;
  /** Reply-to address */
  replyTo?: string;
  /** CC recipients */
  cc?: string[];
  /** BCC recipients */
  bcc?: string[];
  /** File attachments */
  attachments?: EmailAttachment[];
  /** Schedule email for later */
  scheduledAt?: Date;
  /** Tags for categorization/analytics */
  tags?: string[];
}

/**
 * Email send result
 */
export interface EmailResult {
  /** Whether the email was successfully queued/sent */
  success: boolean;
  /** Email provider message ID */
  messageId?: string;
  /** Error message if failed */
  error?: string;
  /** Additional error details */
  errorCode?: string;
}

/**
 * Batch email result
 */
export interface BatchEmailResult {
  /** Total emails attempted */
  total: number;
  /** Number successfully sent */
  sent: number;
  /** Number failed */
  failed: number;
  /** Individual results */
  results: EmailResult[];
}

// ============================================================================
// EMAIL STATUS
// ============================================================================

/**
 * Email delivery status
 */
export const EmailStatus = {
  QUEUED: 'queued',
  SENT: 'sent',
  DELIVERED: 'delivered',
  OPENED: 'opened',
  CLICKED: 'clicked',
  BOUNCED: 'bounced',
  COMPLAINED: 'complained',
  FAILED: 'failed',
} as const;

export type EmailStatusType = (typeof EmailStatus)[keyof typeof EmailStatus];

// ============================================================================
// EMAIL LOG
// ============================================================================

/**
 * Email log entry for tracking
 */
export interface EmailLogEntry {
  /** Unique identifier */
  id: string;
  /** Recipient email */
  to: string;
  /** Template used */
  template: EmailTemplate;
  /** Email subject */
  subject: string;
  /** Current status */
  status: EmailStatusType;
  /** Email provider message ID */
  messageId?: string;
  /** Error if failed */
  error?: string;
  /** When the email was sent */
  sentAt: Date;
  /** When status was last updated */
  updatedAt?: Date;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

// ============================================================================
// TEMPLATE DATA TYPES
// ============================================================================

/**
 * Base template data (common to all templates)
 */
export interface BaseTemplateData {
  /** Recipient's first name */
  firstName?: string;
  /** Current year for copyright */
  year?: number;
  /** Unsubscribe URL */
  unsubscribeUrl?: string;
}

/**
 * Welcome email data
 */
export interface WelcomeEmailData extends BaseTemplateData {
  firstName: string;
  email: string;
  loginUrl: string;
}

/**
 * Contact confirmation email data
 */
export interface ContactConfirmationData extends BaseTemplateData {
  firstName: string;
  ticketId: string;
  subject: string;
  expectedResponse: string;
}

/**
 * Waitlist welcome email data
 */
export interface WaitlistWelcomeData extends BaseTemplateData {
  firstName: string;
  position?: number;
  referralLink?: string;
}

/**
 * Password reset email data
 */
export interface PasswordResetData extends BaseTemplateData {
  firstName: string;
  resetUrl: string;
  expiresAt: string;
}

/**
 * Course enrolled email data
 */
export interface CourseEnrolledData extends BaseTemplateData {
  firstName: string;
  courseName: string;
  courseUrl: string;
  instructorName?: string;
  startDate?: string;
  description?: string;
}

/**
 * Assessment complete email data
 */
export interface AssessmentCompleteData extends BaseTemplateData {
  firstName: string;
  assessmentName: string;
  courseName?: string;
  score: number;
  maxScore?: number;
  percentage?: number;
  passed: boolean;
  certificateUrl?: string;
  retakeUrl?: string;
}

/**
 * Order confirmation email data
 */
export interface OrderConfirmationData extends BaseTemplateData {
  firstName: string;
  orderId: string;
  orderDate: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  currency?: string;
  receiptUrl: string;
}

/**
 * Payment failed email data
 */
export interface PaymentFailedData extends BaseTemplateData {
  firstName: string;
  amount: number;
  currency?: string;
  reason: string;
  subscriptionName?: string;
  updatePaymentUrl: string;
  retryDate?: string;
}

/**
 * Nexus connection request data
 */
export interface NexusConnectionRequestData extends BaseTemplateData {
  firstName: string;
  requesterName: string;
  requesterTitle?: string;
  requesterBio?: string;
  profileUrl: string;
  acceptUrl: string;
  declineUrl: string;
}

/**
 * Nexus session reminder data
 */
export interface NexusSessionReminderData extends BaseTemplateData {
  firstName: string;
  partnerName: string;
  sessionDate: string;
  sessionTime: string;
  meetingUrl?: string;
  rescheduleUrl: string;
}

/**
 * Consultation received data
 */
export interface ConsultationReceivedData extends BaseTemplateData {
  firstName: string;
  serviceName: string;
  requestId: string;
  expectedResponse: string;
}

/**
 * Project invite data
 */
export interface ProjectInviteData extends BaseTemplateData {
  firstName: string;
  inviterName: string;
  projectName: string;
  projectDescription?: string;
  role: string;
  acceptUrl: string;
  declineUrl: string;
}

// ============================================================================
// WEBHOOK TYPES
// ============================================================================

/**
 * Email webhook event types
 */
export const WebhookEventTypes = {
  EMAIL_SENT: 'email.sent',
  EMAIL_DELIVERED: 'email.delivered',
  EMAIL_DELIVERY_DELAYED: 'email.delivery_delayed',
  EMAIL_COMPLAINED: 'email.complained',
  EMAIL_BOUNCED: 'email.bounced',
  EMAIL_OPENED: 'email.opened',
  EMAIL_CLICKED: 'email.clicked',
} as const;

export type WebhookEventType = (typeof WebhookEventTypes)[keyof typeof WebhookEventTypes];

/**
 * Email webhook payload
 */
export interface EmailWebhookPayload {
  type: WebhookEventType;
  created_at: string;
  data: {
    email_id: string;
    from: string;
    to: string[];
    subject: string;
    created_at: string;
    // Additional fields based on event type
    bounce?: {
      message: string;
      code?: string;
    };
    click?: {
      link: string;
      timestamp: string;
    };
  };
}

// ============================================================================
// TEMPLATE REGISTRY
// ============================================================================

/**
 * Template metadata
 */
export interface TemplateMetadata {
  /** Template identifier */
  id: EmailTemplate;
  /** Human-readable name */
  name: string;
  /** Description */
  description: string;
  /** Default subject line */
  defaultSubject: string;
  /** Default sender */
  defaultSender: EmailSender;
  /** Required data fields */
  requiredFields: string[];
  /** Category/product */
  category: string;
}

/**
 * All template metadata
 */
export const TEMPLATE_REGISTRY: Record<EmailTemplate, TemplateMetadata> = {
  welcome: {
    id: 'welcome',
    name: 'Welcome Email',
    description: 'Sent when a new user signs up',
    defaultSubject: 'Welcome to LXD360!',
    defaultSender: 'hello',
    requiredFields: ['firstName', 'email', 'loginUrl'],
    category: 'auth',
  },
  contact_confirmation: {
    id: 'contact_confirmation',
    name: 'Contact Confirmation',
    description: 'Sent when someone submits a contact form',
    defaultSubject: 'We received your message',
    defaultSender: 'noreply',
    requiredFields: ['firstName', 'ticketId', 'subject', 'expectedResponse'],
    category: 'general',
  },
  waitlist_welcome: {
    id: 'waitlist_welcome',
    name: 'Waitlist Welcome',
    description: 'Sent when someone joins the waitlist',
    defaultSubject: "You're on the list!",
    defaultSender: 'hello',
    requiredFields: ['firstName'],
    category: 'general',
  },
  password_reset: {
    id: 'password_reset',
    name: 'Password Reset',
    description: 'Sent when user requests password reset',
    defaultSubject: 'Reset your password',
    defaultSender: 'noreply',
    requiredFields: ['firstName', 'resetUrl', 'expiresAt'],
    category: 'auth',
  },
  email_verification: {
    id: 'email_verification',
    name: 'Email Verification',
    description: 'Sent to verify email address',
    defaultSubject: 'Verify your email address',
    defaultSender: 'noreply',
    requiredFields: ['firstName', 'verifyUrl'],
    category: 'auth',
  },
  project_invite: {
    id: 'project_invite',
    name: 'Project Invite',
    description: 'Sent when user is invited to a project',
    defaultSubject: "You've been invited to collaborate",
    defaultSender: 'noreply',
    requiredFields: ['firstName', 'inviterName', 'projectName', 'acceptUrl'],
    category: 'inspire',
  },
  review_request: {
    id: 'review_request',
    name: 'Review Request',
    description: 'Sent when content needs review',
    defaultSubject: 'Review requested',
    defaultSender: 'noreply',
    requiredFields: ['firstName', 'requesterName', 'projectName', 'reviewUrl'],
    category: 'inspire',
  },
  project_published: {
    id: 'project_published',
    name: 'Project Published',
    description: 'Sent when a project is published',
    defaultSubject: 'Your project is live!',
    defaultSender: 'noreply',
    requiredFields: ['firstName', 'projectName', 'projectUrl'],
    category: 'inspire',
  },
  collaboration_alert: {
    id: 'collaboration_alert',
    name: 'Collaboration Alert',
    description: 'Sent for collaboration updates',
    defaultSubject: 'New activity on your project',
    defaultSender: 'noreply',
    requiredFields: ['firstName', 'projectName', 'activityType'],
    category: 'inspire',
  },
  course_enrolled: {
    id: 'course_enrolled',
    name: 'Course Enrolled',
    description: 'Sent when user enrolls in a course',
    defaultSubject: 'Welcome to {courseName}',
    defaultSender: 'noreply',
    requiredFields: ['firstName', 'courseName', 'courseUrl'],
    category: 'lms',
  },
  progress_reminder: {
    id: 'progress_reminder',
    name: 'Progress Reminder',
    description: 'Sent to remind user to continue learning',
    defaultSubject: 'Continue your learning journey',
    defaultSender: 'noreply',
    requiredFields: ['firstName', 'courseName', 'progress', 'continueUrl'],
    category: 'lms',
  },
  assessment_complete: {
    id: 'assessment_complete',
    name: 'Assessment Complete',
    description: 'Sent after assessment completion',
    defaultSubject: 'Your assessment results',
    defaultSender: 'noreply',
    requiredFields: ['firstName', 'assessmentName', 'score', 'passed'],
    category: 'lms',
  },
  certificate_earned: {
    id: 'certificate_earned',
    name: 'Certificate Earned',
    description: 'Sent when user earns a certificate',
    defaultSubject: 'Congratulations! You earned a certificate',
    defaultSender: 'noreply',
    requiredFields: ['firstName', 'courseName', 'certificateUrl'],
    category: 'lms',
  },
  nexus_connection_request: {
    id: 'nexus_connection_request',
    name: 'Connection Request',
    description: 'Sent when someone requests to connect',
    defaultSubject: 'New connection request',
    defaultSender: 'noreply',
    requiredFields: ['firstName', 'requesterName', 'acceptUrl'],
    category: 'nexus',
  },
  nexus_connection_accepted: {
    id: 'nexus_connection_accepted',
    name: 'Connection Accepted',
    description: 'Sent when connection is accepted',
    defaultSubject: 'Your connection request was accepted',
    defaultSender: 'noreply',
    requiredFields: ['firstName', 'partnerName', 'profileUrl'],
    category: 'nexus',
  },
  nexus_session_reminder: {
    id: 'nexus_session_reminder',
    name: 'Session Reminder',
    description: 'Sent before scheduled sessions',
    defaultSubject: 'Upcoming session reminder',
    defaultSender: 'noreply',
    requiredFields: ['firstName', 'partnerName', 'sessionDate', 'sessionTime'],
    category: 'nexus',
  },
  nexus_new_message: {
    id: 'nexus_new_message',
    name: 'New Message',
    description: 'Sent when user receives a message',
    defaultSubject: 'You have a new message',
    defaultSender: 'noreply',
    requiredFields: ['firstName', 'senderName', 'messagePreview', 'viewUrl'],
    category: 'nexus',
  },
  consultation_received: {
    id: 'consultation_received',
    name: 'Consultation Received',
    description: 'Sent when consultation request is received',
    defaultSubject: 'We received your consultation request',
    defaultSender: 'noreply',
    requiredFields: ['firstName', 'serviceName', 'requestId', 'expectedResponse'],
    category: 'consultation',
  },
  consultation_proposal: {
    id: 'consultation_proposal',
    name: 'Consultation Proposal',
    description: 'Sent with consultation proposal',
    defaultSubject: 'Your consultation proposal is ready',
    defaultSender: 'noreply',
    requiredFields: ['firstName', 'serviceName', 'proposalUrl'],
    category: 'consultation',
  },
  consultation_scheduled: {
    id: 'consultation_scheduled',
    name: 'Consultation Scheduled',
    description: 'Sent when consultation is scheduled',
    defaultSubject: 'Your consultation is scheduled',
    defaultSender: 'noreply',
    requiredFields: ['firstName', 'consultantName', 'date', 'time', 'meetingUrl'],
    category: 'consultation',
  },
  order_confirmation: {
    id: 'order_confirmation',
    name: 'Order Confirmation',
    description: 'Sent after successful order',
    defaultSubject: 'Order Confirmation #{orderId}',
    defaultSender: 'billing',
    requiredFields: ['firstName', 'orderId', 'items', 'total', 'receiptUrl'],
    category: 'ecommerce',
  },
  invoice_receipt: {
    id: 'invoice_receipt',
    name: 'Invoice Receipt',
    description: 'Sent with invoice/receipt',
    defaultSubject: 'Your invoice from LXD360',
    defaultSender: 'billing',
    requiredFields: ['firstName', 'invoiceNumber', 'amount', 'invoiceUrl'],
    category: 'ecommerce',
  },
  subscription_created: {
    id: 'subscription_created',
    name: 'Subscription Created',
    description: 'Sent when subscription starts',
    defaultSubject: 'Welcome to your subscription',
    defaultSender: 'billing',
    requiredFields: ['firstName', 'planName', 'nextBillingDate'],
    category: 'ecommerce',
  },
  subscription_renewed: {
    id: 'subscription_renewed',
    name: 'Subscription Renewed',
    description: 'Sent when subscription renews',
    defaultSubject: 'Your subscription has been renewed',
    defaultSender: 'billing',
    requiredFields: ['firstName', 'planName', 'amount', 'nextBillingDate'],
    category: 'ecommerce',
  },
  subscription_canceled: {
    id: 'subscription_canceled',
    name: 'Subscription Canceled',
    description: 'Sent when subscription is canceled',
    defaultSubject: 'Your subscription has been canceled',
    defaultSender: 'billing',
    requiredFields: ['firstName', 'planName', 'endDate'],
    category: 'ecommerce',
  },
  subscription_expiring: {
    id: 'subscription_expiring',
    name: 'Subscription Expiring',
    description: 'Sent before subscription expires',
    defaultSubject: 'Your subscription is expiring soon',
    defaultSender: 'billing',
    requiredFields: ['firstName', 'planName', 'expiryDate', 'renewUrl'],
    category: 'ecommerce',
  },
  payment_failed: {
    id: 'payment_failed',
    name: 'Payment Failed',
    description: 'Sent when payment fails',
    defaultSubject: 'Payment failed - action required',
    defaultSender: 'billing',
    requiredFields: ['firstName', 'amount', 'reason', 'updatePaymentUrl'],
    category: 'ecommerce',
  },
  payment_method_updated: {
    id: 'payment_method_updated',
    name: 'Payment Method Updated',
    description: 'Sent when payment method is updated',
    defaultSubject: 'Your payment method has been updated',
    defaultSender: 'billing',
    requiredFields: ['firstName', 'last4'],
    category: 'ecommerce',
  },
};
