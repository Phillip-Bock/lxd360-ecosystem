// ============================================================================
// LEAD TYPES
// ============================================================================

export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'proposal'
  | 'negotiation'
  | 'won'
  | 'lost'
  | 'unqualified';

export type LeadActivityType =
  | 'created'
  | 'email_sent'
  | 'email_opened'
  | 'email_clicked'
  | 'email_replied'
  | 'call_made'
  | 'call_received'
  | 'meeting_scheduled'
  | 'meeting_completed'
  | 'note_added'
  | 'status_changed'
  | 'score_changed'
  | 'form_submitted'
  | 'page_visited'
  | 'document_viewed'
  | 'proposal_sent'
  | 'proposal_viewed'
  | 'converted'
  | 'unsubscribed';

export interface LeadSource {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Lead {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  company_name: string | null;
  job_title: string | null;
  phone: string | null;
  website: string | null;
  source_id: string | null;
  source_detail: string | null;
  status: LeadStatus;
  score: number;
  interested_products: string[] | null;
  estimated_value: number | null;
  notes: string | null;
  converted_at: string | null;
  converted_to_customer_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  referrer_url: string | null;
  landing_page: string | null;
  created_at: string;
  updated_at: string;
  last_contacted_at: string | null;
}

export interface LeadWithSource extends Lead {
  source?: LeadSource;
}

export interface LeadActivity {
  id: string;
  lead_id: string;
  activity_type: LeadActivityType;
  title: string;
  description: string | null;
  metadata: Record<string, unknown>;
  performed_by: string | null;
  created_at: string;
}

export interface CreateLeadInput {
  email: string;
  first_name?: string;
  last_name?: string;
  company_name?: string;
  job_title?: string;
  phone?: string;
  website?: string;
  source_id?: string;
  source_detail?: string;
  interested_products?: string[];
  estimated_value?: number;
  notes?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  referrer_url?: string;
  landing_page?: string;
  ip_address?: string;
  user_agent?: string;
}

export interface UpdateLeadInput {
  first_name?: string;
  last_name?: string;
  company_name?: string;
  job_title?: string;
  phone?: string;
  website?: string;
  source_id?: string;
  source_detail?: string;
  status?: LeadStatus;
  interested_products?: string[];
  estimated_value?: number;
  notes?: string;
}

// ============================================================================
// CUSTOMER ENRICHMENT TYPES
// ============================================================================

export interface CustomerTag {
  id: string;
  name: string;
  slug: string;
  color: string;
  description: string | null;
  created_at: string;
}

export interface CustomerTagAssignment {
  id: string;
  customer_id: string;
  tag_id: string;
  assigned_by: string | null;
  assigned_at: string;
  tag?: CustomerTag;
}

export interface CustomerNote {
  id: string;
  customer_id: string;
  content: string;
  is_pinned: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CustomerActivity {
  id: string;
  customer_id: string;
  activity_type: string;
  title: string;
  description: string | null;
  metadata: Record<string, unknown>;
  performed_by: string | null;
  created_at: string;
}

// ============================================================================
// SEGMENT TYPES
// ============================================================================

export interface SegmentFilters {
  subscription_status?: string[];
  products?: string[];
  billing_interval?: 'quarterly' | 'yearly';
  token_balance_min?: number;
  token_balance_max?: number;
  created_after?: string;
  created_before?: string;
  created_days_ago_max?: number;
  created_days_ago_min?: number;
  tags?: string[];
  has_tags?: boolean;
  total_spent_min?: number;
  total_spent_max?: number;
}

export interface CustomerSegment {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  filters: SegmentFilters;
  cached_count: number;
  last_calculated_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateSegmentInput {
  name: string;
  slug: string;
  description?: string;
  filters: SegmentFilters;
}

// ============================================================================
// EMAIL TEMPLATE TYPES
// ============================================================================

export type EmailTemplateCategory =
  | 'general'
  | 'marketing'
  | 'transactional'
  | 'newsletter'
  | 'announcement';

export interface EmailTemplate {
  id: string;
  name: string;
  slug: string;
  subject: string;
  preview_text: string | null;
  html_content: string;
  plain_text_content: string | null;
  variables: string[];
  category: EmailTemplateCategory;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateEmailTemplateInput {
  name: string;
  slug: string;
  subject: string;
  preview_text?: string;
  html_content: string;
  plain_text_content?: string;
  variables?: string[];
  category?: EmailTemplateCategory;
}

// ============================================================================
// CAMPAIGN TYPES
// ============================================================================

export type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled';

export interface EmailCampaign {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  subject: string;
  preview_text: string | null;
  html_content: string;
  plain_text_content: string | null;
  template_id: string | null;
  segment_id: string | null;
  target_leads: boolean;
  target_customers: boolean;
  status: CampaignStatus;
  scheduled_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  total_recipients: number;
  sent_count: number;
  delivered_count: number;
  opened_count: number;
  clicked_count: number;
  bounced_count: number;
  unsubscribed_count: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CampaignWithDetails extends EmailCampaign {
  segment?: CustomerSegment;
  template?: EmailTemplate;
}

export interface CampaignRecipient {
  id: string;
  campaign_id: string;
  lead_id: string | null;
  customer_id: string | null;
  email: string;
  first_name: string | null;
  last_name: string | null;
  status: string;
  sent_at: string | null;
  delivered_at: string | null;
  opened_at: string | null;
  opened_count: number;
  clicked_at: string | null;
  clicked_count: number;
  bounced_at: string | null;
  bounce_reason: string | null;
  unsubscribed_at: string | null;
  email_message_id: string | null;
  created_at: string;
}

export interface CreateCampaignInput {
  name: string;
  slug: string;
  description?: string;
  subject: string;
  preview_text?: string;
  html_content: string;
  plain_text_content?: string;
  template_id?: string;
  segment_id?: string;
  target_leads?: boolean;
  target_customers?: boolean;
  scheduled_at?: string;
}

// ============================================================================
// DRIP SEQUENCE TYPES
// ============================================================================

export type DripTrigger =
  | 'lead_created'
  | 'customer_created'
  | 'subscription_started'
  | 'subscription_cancelled'
  | 'trial_started'
  | 'trial_ending'
  | 'purchase_completed'
  | 'tag_added'
  | 'segment_entered'
  | 'manual';

export interface DripSequence {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  trigger_type: DripTrigger;
  trigger_config: Record<string, unknown>;
  segment_id: string | null;
  target_leads: boolean;
  target_customers: boolean;
  is_active: boolean;
  allow_re_enrollment: boolean;
  total_enrolled: number;
  total_completed: number;
  total_converted: number;
  created_at: string;
  updated_at: string;
}

export interface DripSequenceStep {
  id: string;
  sequence_id: string;
  step_order: number;
  name: string;
  delay_days: number;
  delay_hours: number;
  delay_minutes: number;
  subject: string;
  preview_text: string | null;
  html_content: string;
  plain_text_content: string | null;
  template_id: string | null;
  conditions: Record<string, unknown>;
  sent_count: number;
  opened_count: number;
  clicked_count: number;
  is_active: boolean;
  created_at: string;
}

export interface DripSequenceWithSteps extends DripSequence {
  steps: DripSequenceStep[];
}

export interface DripEnrollment {
  id: string;
  sequence_id: string;
  lead_id: string | null;
  customer_id: string | null;
  email: string;
  current_step: number;
  status: 'active' | 'completed' | 'paused' | 'unsubscribed' | 'converted';
  enrolled_at: string;
  next_step_at: string | null;
  completed_at: string | null;
  paused_at: string | null;
  emails_sent: number;
  emails_opened: number;
  emails_clicked: number;
  created_at: string;
  updated_at: string;
}

export interface DripEnrollmentStep {
  id: string;
  enrollment_id: string;
  step_id: string;
  status: 'pending' | 'sent' | 'skipped' | 'failed';
  scheduled_at: string | null;
  sent_at: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  email_message_id: string | null;
  error_message: string | null;
  created_at: string;
}

export interface CreateDripSequenceInput {
  name: string;
  slug: string;
  description?: string;
  trigger_type: DripTrigger;
  trigger_config?: Record<string, unknown>;
  segment_id?: string;
  target_leads?: boolean;
  target_customers?: boolean;
  allow_re_enrollment?: boolean;
}

export interface CreateDripStepInput {
  sequence_id: string;
  step_order: number;
  name: string;
  delay_days?: number;
  delay_hours?: number;
  delay_minutes?: number;
  subject: string;
  preview_text?: string;
  html_content: string;
  plain_text_content?: string;
  template_id?: string;
  conditions?: Record<string, unknown>;
}

// ============================================================================
// EMAIL PREFERENCES TYPES
// ============================================================================

export interface EmailPreferences {
  id: string;
  email: string;
  marketing_emails: boolean;
  product_updates: boolean;
  newsletter: boolean;
  unsubscribed: boolean;
  unsubscribed_at: string | null;
  unsubscribe_reason: string | null;
  lead_id: string | null;
  customer_id: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// FORM TYPES
// ============================================================================

export interface FormField {
  name: string;
  type: 'text' | 'email' | 'tel' | 'select' | 'textarea' | 'checkbox';
  label: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
}

export interface LeadCaptureForm {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  fields: FormField[];
  redirect_url: string | null;
  success_message: string;
  auto_assign_tags: string[];
  auto_enroll_drip_id: string | null;
  auto_assign_source_id: string | null;
  submissions_count: number;
  conversions_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FormSubmission {
  id: string;
  form_id: string;
  lead_id: string | null;
  data: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  referrer_url: string | null;
  created_at: string;
}

// ============================================================================
// API TYPES
// ============================================================================

export interface LeadsResponse {
  leads: LeadWithSource[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CampaignsResponse {
  campaigns: CampaignWithDetails[];
  total: number;
  page: number;
  pageSize: number;
}

export interface SegmentsResponse {
  segments: CustomerSegment[];
  total: number;
}

export interface DripSequencesResponse {
  sequences: DripSequenceWithSteps[];
  total: number;
}

// ============================================================================
// DASHBOARD STATS TYPES
// ============================================================================

export interface CRMDashboardStats {
  leads: {
    total: number;
    new: number;
    qualified: number;
    converted: number;
    thisMonth: number;
  };
  campaigns: {
    total: number;
    sent: number;
    scheduled: number;
    avgOpenRate: number;
    avgClickRate: number;
  };
  drips: {
    active: number;
    totalEnrolled: number;
    completed: number;
  };
  emailHealth: {
    deliveryRate: number;
    bounceRate: number;
    unsubscribeRate: number;
  };
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface LeadFilters extends PaginationParams {
  status?: LeadStatus | LeadStatus[];
  source_id?: string;
  search?: string;
  score_min?: number;
  score_max?: number;
  created_after?: string;
  created_before?: string;
}

export interface CampaignFilters extends PaginationParams {
  status?: CampaignStatus | CampaignStatus[];
  search?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getLeadStatusLabel(status: LeadStatus): string {
  const labels: Record<LeadStatus, string> = {
    new: 'New',
    contacted: 'Contacted',
    qualified: 'Qualified',
    proposal: 'Proposal',
    negotiation: 'Negotiation',
    won: 'Won',
    lost: 'Lost',
    unqualified: 'Unqualified',
  };
  return labels[status];
}

export function getLeadStatusColor(status: LeadStatus): string {
  const colors: Record<LeadStatus, string> = {
    new: 'bg-blue-100 text-blue-800',
    contacted: 'bg-yellow-100 text-yellow-800',
    qualified: 'bg-green-100 text-green-800',
    proposal: 'bg-purple-100 text-purple-800',
    negotiation: 'bg-orange-100 text-orange-800',
    won: 'bg-emerald-100 text-emerald-800',
    lost: 'bg-red-100 text-red-800',
    unqualified: 'bg-gray-100 text-gray-800',
  };
  return colors[status];
}

export function getCampaignStatusLabel(status: CampaignStatus): string {
  const labels: Record<CampaignStatus, string> = {
    draft: 'Draft',
    scheduled: 'Scheduled',
    sending: 'Sending',
    sent: 'Sent',
    paused: 'Paused',
    cancelled: 'Cancelled',
  };
  return labels[status];
}

export function getCampaignStatusColor(status: CampaignStatus): string {
  const colors: Record<CampaignStatus, string> = {
    draft: 'bg-gray-100 text-gray-800',
    scheduled: 'bg-blue-100 text-blue-800',
    sending: 'bg-yellow-100 text-yellow-800',
    sent: 'bg-green-100 text-green-800',
    paused: 'bg-orange-100 text-orange-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return colors[status];
}

export function formatLeadName(lead: Lead): string {
  if (lead.first_name && lead.last_name) {
    return `${lead.first_name} ${lead.last_name}`;
  }
  if (lead.first_name) {
    return lead.first_name;
  }
  if (lead.company_name) {
    return lead.company_name;
  }
  return lead.email;
}

export function calculateOpenRate(sent: number, opened: number): number {
  if (sent === 0) return 0;
  return Math.round((opened / sent) * 100);
}

export function calculateClickRate(sent: number, clicked: number): number {
  if (sent === 0) return 0;
  return Math.round((clicked / sent) * 100);
}
