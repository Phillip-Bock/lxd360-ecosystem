/**
 * Marketing Email Services
 *
 * Service functions for managing contacts and email campaigns via Brevo.
 * These functions are used for marketing automation and contact list management.
 *
 * @module lib/email/services/marketing
 */

import {
  type AddContactToList,
  ContactsApi,
  ContactsApiApiKeys,
  type CreateContact,
  type CreateEmailCampaign,
  type CreateModel,
  EmailCampaignsApi,
  EmailCampaignsApiApiKeys,
  type RemoveContactFromList,
} from '@getbrevo/brevo';
import { logger } from '@/lib/logger';

const log = logger.scope('BrevoMarketing');

// =============================================================================
// Configuration
// =============================================================================

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL ?? 'noreply@lxd360.io';
const BREVO_SENDER_NAME = process.env.BREVO_SENDER_NAME ?? 'LXD360';

/**
 * Contact list IDs configured in Brevo Dashboard
 *
 * TODO(LXD-248): Update these IDs with actual Brevo list IDs after
 * lists are created in the Brevo Dashboard
 */
export const CONTACT_LISTS = {
  /** Main newsletter subscribers */
  NEWSLETTER: Number(process.env.BREVO_LIST_NEWSLETTER) || 1,
  /** Waitlist signups */
  WAITLIST: Number(process.env.BREVO_LIST_WAITLIST) || 2,
  /** Active users */
  ACTIVE_USERS: Number(process.env.BREVO_LIST_ACTIVE_USERS) || 3,
  /** Paying customers */
  CUSTOMERS: Number(process.env.BREVO_LIST_CUSTOMERS) || 4,
  /** Enterprise leads */
  ENTERPRISE_LEADS: Number(process.env.BREVO_LIST_ENTERPRISE_LEADS) || 5,
} as const;

export type ContactListKey = keyof typeof CONTACT_LISTS;
export type ContactListId = (typeof CONTACT_LISTS)[ContactListKey];

// =============================================================================
// API Client Initialization
// =============================================================================

let contactsApi: ContactsApi | null = null;
let emailCampaignsApi: EmailCampaignsApi | null = null;

function validateConfig(): void {
  if (!BREVO_API_KEY) {
    throw new Error('BREVO_API_KEY environment variable is required');
  }
}

function getContactsApi(): ContactsApi {
  validateConfig();

  if (!contactsApi) {
    contactsApi = new ContactsApi();
    contactsApi.setApiKey(ContactsApiApiKeys.apiKey, BREVO_API_KEY as string);
  }

  return contactsApi;
}

function getEmailCampaignsApi(): EmailCampaignsApi {
  validateConfig();

  if (!emailCampaignsApi) {
    emailCampaignsApi = new EmailCampaignsApi();
    emailCampaignsApi.setApiKey(EmailCampaignsApiApiKeys.apiKey, BREVO_API_KEY as string);
  }

  return emailCampaignsApi;
}

// =============================================================================
// Types
// =============================================================================

export interface ContactAttributes {
  FIRSTNAME?: string;
  LASTNAME?: string;
  COMPANY?: string;
  PLAN?: string;
  SIGNUP_DATE?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface AddContactResult {
  success: boolean;
  contactId?: number;
  error?: string;
}

export interface ListOperationResult {
  success: boolean;
  error?: string;
}

export interface CreateCampaignParams {
  name: string;
  subject: string;
  htmlContent?: string;
  templateId?: number;
  listIds: number[];
  scheduledAt?: Date;
  replyTo?: string;
  tags?: string[];
}

export interface CreateCampaignResult {
  success: boolean;
  campaignId?: number;
  error?: string;
}

export interface SendCampaignResult {
  success: boolean;
  error?: string;
}

// =============================================================================
// Contact Management
// =============================================================================

/**
 * Creates or updates a contact in Brevo
 *
 * @param email - Contact's email address
 * @param attributes - Contact attributes (FIRSTNAME, LASTNAME, etc.)
 * @param listIds - List IDs to add the contact to
 * @returns Promise resolving to add contact result
 */
export async function createContact(
  email: string,
  attributes?: ContactAttributes,
  listIds?: number[],
): Promise<AddContactResult> {
  try {
    const api = getContactsApi();

    const contactData: CreateContact = {
      email,
      attributes: attributes as object,
      listIds,
      updateEnabled: true, // Update if contact already exists
    };

    const response = await api.createContact(contactData);
    const body = response.body;

    return {
      success: true,
      contactId: body?.id,
    };
  } catch (error) {
    log.error('Failed to create contact:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Adds contacts to a specific list
 *
 * @param listId - Brevo list ID
 * @param emails - Array of email addresses to add
 * @returns Promise resolving to list operation result
 */
export async function addToContactList(
  listId: number,
  emails: string[],
): Promise<ListOperationResult> {
  try {
    const api = getContactsApi();

    const contactEmails: AddContactToList = {
      emails,
    };

    await api.addContactToList(listId, contactEmails);

    return { success: true };
  } catch (error) {
    log.error('Failed to add contacts to list:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Removes contacts from a specific list
 *
 * @param listId - Brevo list ID
 * @param emails - Array of email addresses to remove
 * @returns Promise resolving to list operation result
 */
export async function removeFromContactList(
  listId: number,
  emails: string[],
): Promise<ListOperationResult> {
  try {
    const api = getContactsApi();

    const contactEmails: RemoveContactFromList = {
      emails,
    };

    await api.removeContactFromList(listId, contactEmails);

    return { success: true };
  } catch (error) {
    log.error('Failed to remove contacts from list:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Adds a contact to the waitlist
 *
 * @param email - Contact's email address
 * @param firstName - Contact's first name (optional)
 * @param lastName - Contact's last name (optional)
 * @returns Promise resolving to add contact result
 */
export async function addToWaitlist(
  email: string,
  firstName?: string,
  lastName?: string,
): Promise<AddContactResult> {
  const attributes: ContactAttributes = {
    SIGNUP_DATE: new Date().toISOString(),
  };

  if (firstName) {
    attributes.FIRSTNAME = firstName;
  }

  if (lastName) {
    attributes.LASTNAME = lastName;
  }

  return createContact(email, attributes, [CONTACT_LISTS.WAITLIST]);
}

/**
 * Adds a contact to the newsletter list
 *
 * @param email - Contact's email address
 * @param firstName - Contact's first name (optional)
 * @returns Promise resolving to add contact result
 */
export async function subscribeToNewsletter(
  email: string,
  firstName?: string,
): Promise<AddContactResult> {
  const attributes: ContactAttributes = {
    SIGNUP_DATE: new Date().toISOString(),
  };

  if (firstName) {
    attributes.FIRSTNAME = firstName;
  }

  return createContact(email, attributes, [CONTACT_LISTS.NEWSLETTER]);
}

// =============================================================================
// Campaign Management
// =============================================================================

/**
 * Creates an email campaign in Brevo
 *
 * @param params - Campaign parameters
 * @returns Promise resolving to create campaign result
 */
export async function createCampaign(params: CreateCampaignParams): Promise<CreateCampaignResult> {
  try {
    const api = getEmailCampaignsApi();

    const campaignData: CreateEmailCampaign = {
      name: params.name,
      subject: params.subject,
      sender: {
        name: BREVO_SENDER_NAME,
        email: BREVO_SENDER_EMAIL,
      },
      recipients: {
        listIds: params.listIds,
      },
      replyTo: params.replyTo ?? BREVO_SENDER_EMAIL,
      scheduledAt: params.scheduledAt?.toISOString(),
      tag: params.tags?.join(','),
    };

    if (params.htmlContent) {
      campaignData.htmlContent = params.htmlContent;
    } else if (params.templateId) {
      campaignData.templateId = params.templateId;
    }

    const response = await api.createEmailCampaign(campaignData);
    const body = response.body as CreateModel;

    return {
      success: true,
      campaignId: body.id,
    };
  } catch (error) {
    log.error('Failed to create campaign:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Sends an existing campaign immediately
 *
 * @param campaignId - Brevo campaign ID
 * @returns Promise resolving to send campaign result
 */
export async function sendCampaign(campaignId: number): Promise<SendCampaignResult> {
  try {
    const api = getEmailCampaignsApi();

    await api.sendEmailCampaignNow(campaignId);

    return { success: true };
  } catch (error) {
    log.error('Failed to send campaign:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
