/**
 * Brevo Email Client
 *
 * Server-side email client for transactional and marketing emails.
 * Uses @getbrevo/brevo SDK.
 *
 * @module lib/email/brevo-client
 */

import {
  ContactsApi,
  ContactsApiApiKeys,
  CreateSmtpEmail,
  SendSmtpEmail,
  TransactionalEmailsApi,
  TransactionalEmailsApiApiKeys,
} from '@getbrevo/brevo';

// =============================================================================
// Configuration
// =============================================================================

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL ?? 'noreply@lxd360.io';
const BREVO_SENDER_NAME = process.env.BREVO_SENDER_NAME ?? 'LXD360';

/**
 * Validates that required environment variables are set
 */
function validateConfig(): void {
  if (!BREVO_API_KEY) {
    throw new Error('BREVO_API_KEY environment variable is required');
  }
}

// =============================================================================
// API Client Initialization
// =============================================================================

let transactionalEmailsApi: TransactionalEmailsApi | null = null;
let contactsApi: ContactsApi | null = null;

/**
 * Gets the TransactionalEmailsApi instance (singleton)
 */
export function getTransactionalEmailsApi(): TransactionalEmailsApi {
  validateConfig();

  if (!transactionalEmailsApi) {
    transactionalEmailsApi = new TransactionalEmailsApi();
    transactionalEmailsApi.setApiKey(TransactionalEmailsApiApiKeys.apiKey, BREVO_API_KEY as string);
  }

  return transactionalEmailsApi;
}

/**
 * Gets the ContactsApi instance (singleton)
 */
export function getContactsApi(): ContactsApi {
  validateConfig();

  if (!contactsApi) {
    contactsApi = new ContactsApi();
    contactsApi.setApiKey(ContactsApiApiKeys.apiKey, BREVO_API_KEY as string);
  }

  return contactsApi;
}

// =============================================================================
// Types
// =============================================================================

export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface SendEmailParams {
  to: EmailRecipient[];
  subject: string;
  htmlContent: string;
  textContent?: string;
  cc?: EmailRecipient[];
  bcc?: EmailRecipient[];
  replyTo?: EmailRecipient;
  tags?: string[];
  params?: Record<string, string | number | boolean | undefined>;
}

export interface SendTemplateEmailParams {
  to: EmailRecipient[];
  templateId: number;
  params?: Record<string, string | number | boolean | undefined>;
  cc?: EmailRecipient[];
  bcc?: EmailRecipient[];
  replyTo?: EmailRecipient;
  tags?: string[];
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// =============================================================================
// Email Sending Functions
// =============================================================================

/**
 * Sends a transactional email with custom HTML content
 *
 * @param params - Email parameters
 * @returns Promise resolving to send result
 */
export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
  try {
    const api = getTransactionalEmailsApi();

    const emailData: SendSmtpEmail = {
      sender: {
        email: BREVO_SENDER_EMAIL,
        name: BREVO_SENDER_NAME,
      },
      to: params.to.map((recipient) => ({
        email: recipient.email,
        name: recipient.name,
      })),
      subject: params.subject,
      htmlContent: params.htmlContent,
      textContent: params.textContent,
      tags: params.tags,
      params: params.params,
    };

    if (params.cc && params.cc.length > 0) {
      emailData.cc = params.cc.map((recipient) => ({
        email: recipient.email,
        name: recipient.name,
      }));
    }

    if (params.bcc && params.bcc.length > 0) {
      emailData.bcc = params.bcc.map((recipient) => ({
        email: recipient.email,
        name: recipient.name,
      }));
    }

    if (params.replyTo) {
      emailData.replyTo = {
        email: params.replyTo.email,
        name: params.replyTo.name,
      };
    }

    const response = await api.sendTransacEmail(emailData);
    const body = response.body as CreateSmtpEmail;

    return {
      success: true,
      messageId: body.messageId,
    };
  } catch (error) {
    console.error('Failed to send email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Sends a transactional email using a Brevo template
 *
 * @param params - Template email parameters
 * @returns Promise resolving to send result
 */
export async function sendTemplateEmail(params: SendTemplateEmailParams): Promise<SendEmailResult> {
  try {
    const api = getTransactionalEmailsApi();

    const emailData: SendSmtpEmail = {
      sender: {
        email: BREVO_SENDER_EMAIL,
        name: BREVO_SENDER_NAME,
      },
      to: params.to.map((recipient) => ({
        email: recipient.email,
        name: recipient.name,
      })),
      templateId: params.templateId,
      params: params.params,
      tags: params.tags,
    };

    if (params.cc && params.cc.length > 0) {
      emailData.cc = params.cc.map((recipient) => ({
        email: recipient.email,
        name: recipient.name,
      }));
    }

    if (params.bcc && params.bcc.length > 0) {
      emailData.bcc = params.bcc.map((recipient) => ({
        email: recipient.email,
        name: recipient.name,
      }));
    }

    if (params.replyTo) {
      emailData.replyTo = {
        email: params.replyTo.email,
        name: params.replyTo.name,
      };
    }

    const response = await api.sendTransacEmail(emailData);
    const body = response.body as CreateSmtpEmail;

    return {
      success: true,
      messageId: body.messageId,
    };
  } catch (error) {
    console.error('Failed to send template email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// =============================================================================
// Exports
// =============================================================================

export { SendSmtpEmail, CreateSmtpEmail };
