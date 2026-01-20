// CRM Data Access Layer
// TODO(LXD-301): Replace with Firestore implementation
import { logger } from '@/lib/logger';

const log = logger.child({ module: 'crm-data' });

import type {
  CampaignFilters,
  CampaignRecipient,
  CampaignWithDetails,
  CRMDashboardStats,
  CreateCampaignInput,
  CreateDripSequenceInput,
  CreateDripStepInput,
  CreateEmailTemplateInput,
  CreateLeadInput,
  CreateSegmentInput,
  CustomerActivity,
  CustomerNote,
  CustomerSegment,
  CustomerTag,
  CustomerTagAssignment,
  DripEnrollment,
  DripEnrollmentStep,
  DripSequence,
  DripSequenceStep,
  DripSequenceWithSteps,
  EmailCampaign,
  EmailPreferences,
  EmailTemplate,
  FormSubmission,
  Lead,
  LeadActivity,
  LeadActivityType,
  LeadCaptureForm,
  LeadFilters,
  LeadSource,
  LeadStatus,
  LeadWithSource,
  UpdateLeadInput,
} from './types';

// Custom error class for CRM operations
class CRMDataError extends Error {
  constructor(
    message: string,
    public readonly operation: string,
    public readonly originalError?: unknown,
  ) {
    super(message);
    this.name = 'CRMDataError';
  }
}

// Log migration status once at module load
log.warn('CRM data layer: Database not configured - migration to Firestore in progress');

// Helper to create migration error
function migrationError(operation: string): never {
  throw new CRMDataError(
    `${operation}: Database not configured - migration to Firestore in progress`,
    operation,
  );
}

// ============================================================================
// LEAD SOURCES
// ============================================================================

export async function getLeadSources(): Promise<LeadSource[]> {
  migrationError('getLeadSources');
}

export async function getLeadSourceBySlug(_slug: string): Promise<LeadSource | null> {
  migrationError('getLeadSourceBySlug');
}

// ============================================================================
// LEADS
// ============================================================================

export async function getLeads(_filters: LeadFilters = {}): Promise<{
  leads: LeadWithSource[];
  total: number;
}> {
  migrationError('getLeads');
}

export async function getLeadById(_id: string): Promise<LeadWithSource | null> {
  migrationError('getLeadById');
}

export async function getLeadByEmail(_email: string): Promise<Lead | null> {
  migrationError('getLeadByEmail');
}

export async function createLead(_input: CreateLeadInput): Promise<Lead> {
  migrationError('createLead');
}

export async function updateLead(_id: string, _input: UpdateLeadInput): Promise<Lead> {
  migrationError('updateLead');
}

export async function updateLeadStatus(_id: string, _status: LeadStatus): Promise<Lead> {
  migrationError('updateLeadStatus');
}

export async function convertLead(_leadId: string, _customerId: string): Promise<Lead> {
  migrationError('convertLead');
}

export async function deleteLead(_id: string): Promise<void> {
  migrationError('deleteLead');
}

// ============================================================================
// LEAD ACTIVITIES
// ============================================================================

export async function getLeadActivities(_leadId: string): Promise<LeadActivity[]> {
  migrationError('getLeadActivities');
}

export async function createLeadActivity(
  _leadId: string,
  _activityType: LeadActivityType,
  _title: string,
  _metadata: Record<string, unknown> = {},
  _description?: string,
  _performedBy?: string,
): Promise<LeadActivity> {
  migrationError('createLeadActivity');
}

// ============================================================================
// CUSTOMER TAGS
// ============================================================================

export async function getCustomerTags(): Promise<CustomerTag[]> {
  migrationError('getCustomerTags');
}

export async function createCustomerTag(
  _name: string,
  _slug: string,
  _color?: string,
  _description?: string,
): Promise<CustomerTag> {
  migrationError('createCustomerTag');
}

export async function getCustomerTagAssignments(
  _customerId: string,
): Promise<CustomerTagAssignment[]> {
  migrationError('getCustomerTagAssignments');
}

export async function assignTagToCustomer(
  _customerId: string,
  _tagId: string,
  _assignedBy?: string,
): Promise<CustomerTagAssignment> {
  migrationError('assignTagToCustomer');
}

export async function removeTagFromCustomer(_customerId: string, _tagId: string): Promise<void> {
  migrationError('removeTagFromCustomer');
}

// ============================================================================
// CUSTOMER NOTES
// ============================================================================

export async function getCustomerNotes(_customerId: string): Promise<CustomerNote[]> {
  migrationError('getCustomerNotes');
}

export async function createCustomerNote(
  _customerId: string,
  _content: string,
  _createdBy?: string,
): Promise<CustomerNote> {
  migrationError('createCustomerNote');
}

export async function updateCustomerNote(
  _id: string,
  _content: string,
  _isPinned?: boolean,
): Promise<CustomerNote> {
  migrationError('updateCustomerNote');
}

export async function deleteCustomerNote(_id: string): Promise<void> {
  migrationError('deleteCustomerNote');
}

// ============================================================================
// CUSTOMER ACTIVITIES
// ============================================================================

export async function getCustomerActivities(_customerId: string): Promise<CustomerActivity[]> {
  migrationError('getCustomerActivities');
}

export async function createCustomerActivity(
  _customerId: string,
  _activityType: string,
  _title: string,
  _metadata: Record<string, unknown> = {},
  _description?: string,
  _performedBy?: string,
): Promise<CustomerActivity> {
  migrationError('createCustomerActivity');
}

// ============================================================================
// CUSTOMER SEGMENTS
// ============================================================================

export async function getSegments(): Promise<CustomerSegment[]> {
  migrationError('getSegments');
}

export async function getSegmentById(_id: string): Promise<CustomerSegment | null> {
  migrationError('getSegmentById');
}

export async function getSegmentBySlug(_slug: string): Promise<CustomerSegment | null> {
  migrationError('getSegmentBySlug');
}

export async function createSegment(_input: CreateSegmentInput): Promise<CustomerSegment> {
  migrationError('createSegment');
}

export async function updateSegment(
  _id: string,
  _input: Partial<CreateSegmentInput>,
): Promise<CustomerSegment> {
  migrationError('updateSegment');
}

export async function deleteSegment(_id: string): Promise<void> {
  migrationError('deleteSegment');
}

export async function getSegmentCustomers(_segmentId: string): Promise<string[]> {
  migrationError('getSegmentCustomers');
}

// ============================================================================
// EMAIL TEMPLATES
// ============================================================================

export async function getEmailTemplates(): Promise<EmailTemplate[]> {
  migrationError('getEmailTemplates');
}

export async function getEmailTemplateById(_id: string): Promise<EmailTemplate | null> {
  migrationError('getEmailTemplateById');
}

export async function getEmailTemplateBySlug(_slug: string): Promise<EmailTemplate | null> {
  migrationError('getEmailTemplateBySlug');
}

export async function createEmailTemplate(
  _input: CreateEmailTemplateInput,
): Promise<EmailTemplate> {
  migrationError('createEmailTemplate');
}

export async function updateEmailTemplate(
  _id: string,
  _input: Partial<CreateEmailTemplateInput>,
): Promise<EmailTemplate> {
  migrationError('updateEmailTemplate');
}

export async function deleteEmailTemplate(_id: string): Promise<void> {
  migrationError('deleteEmailTemplate');
}

// ============================================================================
// EMAIL CAMPAIGNS
// ============================================================================

export async function getCampaigns(_filters: CampaignFilters = {}): Promise<{
  campaigns: CampaignWithDetails[];
  total: number;
}> {
  migrationError('getCampaigns');
}

export async function getCampaignById(_id: string): Promise<CampaignWithDetails | null> {
  migrationError('getCampaignById');
}

export async function createCampaign(_input: CreateCampaignInput): Promise<EmailCampaign> {
  migrationError('createCampaign');
}

export async function updateCampaign(
  _id: string,
  _input: Partial<
    CreateCampaignInput & { status: string; started_at?: string; completed_at?: string }
  >,
): Promise<EmailCampaign> {
  migrationError('updateCampaign');
}

export async function deleteCampaign(_id: string): Promise<void> {
  migrationError('deleteCampaign');
}

// ============================================================================
// CAMPAIGN RECIPIENTS
// ============================================================================

export async function getCampaignRecipients(_campaignId: string): Promise<CampaignRecipient[]> {
  migrationError('getCampaignRecipients');
}

export async function addCampaignRecipient(
  _campaignId: string,
  _email: string,
  _firstName?: string,
  _lastName?: string,
  _leadId?: string,
  _customerId?: string,
): Promise<CampaignRecipient> {
  migrationError('addCampaignRecipient');
}

export async function updateCampaignRecipientStatus(
  _id: string,
  _status: string,
  _metadata: {
    sent_at?: string;
    delivered_at?: string;
    opened_at?: string;
    clicked_at?: string;
    bounced_at?: string;
    bounce_reason?: string;
    unsubscribed_at?: string;
    email_message_id?: string;
  } = {},
): Promise<void> {
  migrationError('updateCampaignRecipientStatus');
}

// ============================================================================
// DRIP SEQUENCES
// ============================================================================

export async function getDripSequences(): Promise<DripSequenceWithSteps[]> {
  migrationError('getDripSequences');
}

export async function getDripSequenceById(_id: string): Promise<DripSequenceWithSteps | null> {
  migrationError('getDripSequenceById');
}

export async function createDripSequence(_input: CreateDripSequenceInput): Promise<DripSequence> {
  migrationError('createDripSequence');
}

export async function updateDripSequence(
  _id: string,
  _input: Partial<CreateDripSequenceInput & { is_active: boolean }>,
): Promise<DripSequence> {
  migrationError('updateDripSequence');
}

export async function deleteDripSequence(_id: string): Promise<void> {
  migrationError('deleteDripSequence');
}

// ============================================================================
// DRIP SEQUENCE STEPS
// ============================================================================

export async function createDripStep(_input: CreateDripStepInput): Promise<DripSequenceStep> {
  migrationError('createDripStep');
}

export async function updateDripStep(
  _id: string,
  _input: Partial<CreateDripStepInput>,
): Promise<DripSequenceStep> {
  migrationError('updateDripStep');
}

export async function deleteDripStep(_id: string): Promise<void> {
  migrationError('deleteDripStep');
}

// ============================================================================
// DRIP ENROLLMENTS
// ============================================================================

export async function getDripEnrollments(_sequenceId: string): Promise<DripEnrollment[]> {
  migrationError('getDripEnrollments');
}

export async function getPendingDripEnrollments(): Promise<DripEnrollment[]> {
  migrationError('getPendingDripEnrollments');
}

export async function enrollInDrip(
  _sequenceId: string,
  _email: string,
  _leadId?: string,
  _customerId?: string,
): Promise<DripEnrollment> {
  migrationError('enrollInDrip');
}

export async function updateDripEnrollment(
  _id: string,
  _input: {
    current_step?: number;
    status?: string;
    next_step_at?: string | null;
    completed_at?: string | null;
    paused_at?: string | null;
    emails_sent?: number;
    emails_opened?: number;
    emails_clicked?: number;
  },
): Promise<DripEnrollment> {
  migrationError('updateDripEnrollment');
}

// ============================================================================
// DRIP ENROLLMENT STEPS
// ============================================================================

export async function createDripEnrollmentStep(
  _enrollmentId: string,
  _stepId: string,
  _scheduledAt: string,
): Promise<DripEnrollmentStep> {
  migrationError('createDripEnrollmentStep');
}

export async function updateDripEnrollmentStep(
  _id: string,
  _input: {
    status?: string;
    sent_at?: string;
    opened_at?: string;
    clicked_at?: string;
    email_message_id?: string;
    error_message?: string;
  },
): Promise<void> {
  migrationError('updateDripEnrollmentStep');
}

// ============================================================================
// EMAIL PREFERENCES
// ============================================================================

export async function getEmailPreferences(_email: string): Promise<EmailPreferences | null> {
  migrationError('getEmailPreferences');
}

export async function updateEmailPreferences(
  _email: string,
  _preferences: {
    marketing_emails?: boolean;
    product_updates?: boolean;
    newsletter?: boolean;
    unsubscribed?: boolean;
    unsubscribe_reason?: string;
  },
): Promise<EmailPreferences> {
  migrationError('updateEmailPreferences');
}

export async function isUnsubscribed(_email: string): Promise<boolean> {
  migrationError('isUnsubscribed');
}

// ============================================================================
// LEAD CAPTURE FORMS
// ============================================================================

export async function getLeadCaptureForms(): Promise<LeadCaptureForm[]> {
  migrationError('getLeadCaptureForms');
}

export async function getLeadCaptureFormBySlug(_slug: string): Promise<LeadCaptureForm | null> {
  migrationError('getLeadCaptureFormBySlug');
}

export async function submitLeadCaptureForm(
  _formId: string,
  _formData: Record<string, unknown>,
  _metadata: {
    ip_address?: string;
    user_agent?: string;
    referrer_url?: string;
  } = {},
): Promise<{ submission: FormSubmission; lead: Lead }> {
  migrationError('submitLeadCaptureForm');
}

// ============================================================================
// DASHBOARD STATS
// ============================================================================

export async function getCRMDashboardStats(): Promise<CRMDashboardStats> {
  migrationError('getCRMDashboardStats');
}
