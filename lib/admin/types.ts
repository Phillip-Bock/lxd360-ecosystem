// =====================================================
// SUPPORT TICKETS
// =====================================================

export type TicketStatus = 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketSource = 'contact_form' | 'email' | 'chat' | 'phone' | 'internal';
export type MessageSenderType = 'customer' | 'agent' | 'system';

export interface TicketCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  priority_default: TicketPriority;
  auto_assign_to?: string;
  created_at: string;
}

export interface SupportTicket {
  id: string;
  ticket_number: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category_id?: string;
  category?: TicketCategory;

  // Submitter
  user_id?: string;
  tenant_id?: string;
  contact_email: string;
  contact_name?: string;
  contact_phone?: string;

  // Assignment
  assigned_to?: string;
  assigned_user?: {
    id: string;
    email: string;
    full_name?: string;
  };

  // Metadata
  source: TicketSource;
  tags?: string[];
  metadata?: Record<string, unknown>;

  // Timestamps
  created_at: string;
  updated_at: string;
  first_response_at?: string;
  resolved_at?: string;
  closed_at?: string;

  // Computed
  messages_count?: number;
}

export interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_type: MessageSenderType;
  sender_id?: string;
  sender_name?: string;
  sender_email?: string;
  message: string;
  is_internal: boolean;
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
  created_at: string;
}

export interface TicketActivity {
  id: string;
  ticket_id: string;
  user_id?: string;
  action: string;
  old_value?: string;
  new_value?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface CreateTicketInput {
  subject: string;
  description: string;
  priority?: TicketPriority;
  category_id?: string;
  contact_email: string;
  contact_name?: string;
  contact_phone?: string;
  source?: TicketSource;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface UpdateTicketInput {
  subject?: string;
  description?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  category_id?: string;
  assigned_to?: string | null;
  tags?: string[];
}

export interface CreateTicketMessageInput {
  ticket_id: string;
  message: string;
  sender_type: MessageSenderType;
  sender_id?: string;
  sender_name?: string;
  sender_email?: string;
  is_internal?: boolean;
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
}

// =====================================================
// ERROR LOGGING
// =====================================================

export type ErrorSeverity = 'debug' | 'info' | 'warning' | 'error' | 'critical';
export type ErrorStatus = 'new' | 'investigating' | 'identified' | 'resolved' | 'ignored';

export interface ErrorLog {
  id: string;
  error_type: string;
  error_message: string;
  error_stack?: string;
  error_code?: string;

  // Context
  user_id?: string;
  tenant_id?: string;
  request_url?: string;
  request_method?: string;
  request_body?: Record<string, unknown>;
  request_headers?: Record<string, unknown>;

  // Environment
  environment: string;
  service: string;
  version?: string;

  // Metadata
  fingerprint?: string;
  severity: ErrorSeverity;
  tags?: string[];
  metadata?: Record<string, unknown>;

  // Resolution
  status: ErrorStatus;
  resolved_by?: string;
  resolved_at?: string;
  resolution_notes?: string;

  // Timestamps
  occurred_at: string;
  created_at: string;

  // Computed
  occurrence_count?: number;
}

export interface ErrorOccurrence {
  id: string;
  error_log_id: string;
  user_id?: string;
  tenant_id?: string;
  metadata?: Record<string, unknown>;
  occurred_at: string;
}

export interface CreateErrorLogInput {
  error_type: string;
  error_message: string;
  error_stack?: string;
  error_code?: string;
  user_id?: string;
  tenant_id?: string;
  request_url?: string;
  request_method?: string;
  request_body?: Record<string, unknown>;
  request_headers?: Record<string, unknown>;
  environment?: string;
  service?: string;
  version?: string;
  severity?: ErrorSeverity;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

// =====================================================
// FEATURE FLAGS
// =====================================================

export interface FeatureFlag {
  id: string;
  name: string;
  slug: string;
  description?: string;

  // State
  enabled: boolean;
  rollout_percentage: number;

  // Targeting
  tenant_ids?: string[];
  user_ids?: string[];
  user_roles?: string[];

  // Schedule
  start_date?: string;
  end_date?: string;

  // Metadata
  category?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;

  // Audit
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateFeatureFlagInput {
  name: string;
  slug?: string;
  description?: string;
  enabled?: boolean;
  rollout_percentage?: number;
  tenant_ids?: string[];
  user_ids?: string[];
  user_roles?: string[];
  start_date?: string;
  end_date?: string;
  category?: string;
  tags?: string[];
}

export interface UpdateFeatureFlagInput {
  name?: string;
  description?: string;
  enabled?: boolean;
  rollout_percentage?: number;
  tenant_ids?: string[];
  user_ids?: string[];
  user_roles?: string[];
  start_date?: string;
  end_date?: string;
  category?: string;
  tags?: string[];
}

// =====================================================
// SYSTEM SETTINGS
// =====================================================

export interface SystemSetting {
  id: string;
  key: string;
  value: unknown;
  description?: string;
  category: string;
  is_sensitive: boolean;
  updated_by?: string;
  updated_at: string;
}

export interface APIKey {
  id: string;
  name: string;
  key_prefix: string;
  scopes: string[];
  rate_limit: number;
  last_used_at?: string;
  usage_count: number;
  is_active: boolean;
  expires_at?: string;
  created_by?: string;
  created_at: string;
}

export interface CreateAPIKeyInput {
  name: string;
  scopes?: string[];
  rate_limit?: number;
  expires_at?: string;
}

// =====================================================
// ADMIN AUDIT
// =====================================================

export interface AdminAuditLog {
  id: string;
  admin_id: string;
  admin?: {
    id: string;
    email: string;
    full_name?: string;
  };
  action: string;
  resource_type: string;
  resource_id?: string;
  details?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface ImpersonationLog {
  id: string;
  admin_id: string;
  admin?: {
    id: string;
    email: string;
    full_name?: string;
  };
  target_user_id: string;
  target_user?: {
    id: string;
    email: string;
    full_name?: string;
  };
  reason?: string;
  started_at: string;
  ended_at?: string;
  actions_taken?: Array<{
    action: string;
    timestamp: string;
  }>;
}

// =====================================================
// DASHBOARD STATS
// =====================================================

export interface SuperAdminStats {
  // Users
  total_users: number;
  active_users_today: number;
  new_users_this_week: number;
  new_users_this_month: number;

  // Tickets
  open_tickets: number;
  urgent_tickets: number;
  avg_response_time_hours: number;
  tickets_resolved_today: number;

  // Revenue
  mrr: number;
  arr: number;
  revenue_this_month: number;
  active_subscriptions: number;

  // Errors
  errors_today: number;
  critical_errors: number;
  error_rate: number;

  // System Health
  system_health: {
    database: 'healthy' | 'degraded' | 'down';
    stripe: 'healthy' | 'degraded' | 'down';
    email: 'healthy' | 'degraded' | 'down';
    storage: 'healthy' | 'degraded' | 'down';
  };
}

export interface UserWithDetails {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: string;
  tenant_id?: string;
  tenant?: {
    id: string;
    name: string;
    slug: string;
  };
  created_at: string;
  last_sign_in_at?: string;
  is_active: boolean;
  subscription?: {
    plan: string;
    status: string;
    current_period_end?: string;
  };
}
