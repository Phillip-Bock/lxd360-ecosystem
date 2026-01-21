// TODO(LXD-301): Implement with Firestore - migration in progress

import type {
  AdminAuditLog,
  APIKey,
  CreateAPIKeyInput,
  CreateErrorLogInput,
  CreateFeatureFlagInput,
  CreateTicketInput,
  CreateTicketMessageInput,
  ErrorLog,
  ErrorStatus,
  FeatureFlag,
  ImpersonationLog,
  SuperAdminStats,
  SupportTicket,
  SystemSetting,
  TicketActivity,
  TicketCategory,
  TicketMessage,
  TicketPriority,
  TicketStatus,
  UpdateFeatureFlagInput,
  UpdateTicketInput,
  UserWithDetails,
} from './types';

// =============================================================================
// MIGRATION ERROR HELPER
// =============================================================================

/**
 * Throws a standardized migration error for all stub implementations.
 * TODO(LXD-301): Remove once Firestore migration is complete.
 */
function migrationError(operation: string): never {
  throw new Error(`${operation}: Database not configured - migration to Firestore in progress`);
}

// =============================================================================
// SUPPORT TICKETS
// =============================================================================

export async function getTicketCategories(): Promise<TicketCategory[]> {
  migrationError('getTicketCategories');
}

export async function getTickets(_options?: {
  status?: TicketStatus;
  priority?: TicketPriority;
  assigned_to?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<{ tickets: SupportTicket[]; total: number }> {
  migrationError('getTickets');
}

export async function getTicketById(_id: string): Promise<SupportTicket | null> {
  migrationError('getTicketById');
}

export async function getTicketByNumber(_ticketNumber: string): Promise<SupportTicket | null> {
  migrationError('getTicketByNumber');
}

export async function createTicket(
  _input: CreateTicketInput,
  _userId?: string,
  _tenantId?: string,
): Promise<SupportTicket> {
  migrationError('createTicket');
}

export async function updateTicket(_id: string, _input: UpdateTicketInput): Promise<SupportTicket> {
  migrationError('updateTicket');
}

export async function deleteTicket(_id: string): Promise<void> {
  migrationError('deleteTicket');
}

// Ticket Messages
export async function getTicketMessages(
  _ticketId: string,
  _includeInternal = true,
): Promise<TicketMessage[]> {
  migrationError('getTicketMessages');
}

export async function createTicketMessage(
  _input: CreateTicketMessageInput,
): Promise<TicketMessage> {
  migrationError('createTicketMessage');
}

// Ticket Activities
export async function getTicketActivities(_ticketId: string): Promise<TicketActivity[]> {
  migrationError('getTicketActivities');
}

export async function logTicketActivity(
  _ticketId: string,
  _userId: string | undefined,
  _action: string,
  _oldValue?: string,
  _newValue?: string,
  _metadata?: Record<string, unknown>,
): Promise<void> {
  migrationError('logTicketActivity');
}

// =============================================================================
// ERROR LOGGING
// =============================================================================

export async function getErrorLogs(_options?: {
  status?: ErrorStatus;
  severity?: string;
  service?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<{ errors: ErrorLog[]; total: number }> {
  migrationError('getErrorLogs');
}

export async function getErrorLogById(_id: string): Promise<ErrorLog | null> {
  migrationError('getErrorLogById');
}

export async function createErrorLog(_input: CreateErrorLogInput): Promise<ErrorLog> {
  migrationError('createErrorLog');
}

export async function updateErrorStatus(
  _id: string,
  _status: ErrorStatus,
  _resolvedBy?: string,
  _resolutionNotes?: string,
): Promise<ErrorLog> {
  migrationError('updateErrorStatus');
}

export async function getErrorStats(): Promise<{
  total: number;
  new: number;
  critical: number;
  by_service: Record<string, number>;
  by_severity: Record<string, number>;
}> {
  migrationError('getErrorStats');
}

// =============================================================================
// FEATURE FLAGS
// =============================================================================

export async function getFeatureFlags(): Promise<FeatureFlag[]> {
  migrationError('getFeatureFlags');
}

export async function getFeatureFlagBySlug(_slug: string): Promise<FeatureFlag | null> {
  migrationError('getFeatureFlagBySlug');
}

export async function createFeatureFlag(
  _input: CreateFeatureFlagInput,
  _createdBy: string,
): Promise<FeatureFlag> {
  migrationError('createFeatureFlag');
}

export async function updateFeatureFlag(
  _id: string,
  _input: UpdateFeatureFlagInput,
  _updatedBy: string,
): Promise<FeatureFlag> {
  migrationError('updateFeatureFlag');
}

export async function deleteFeatureFlag(_id: string): Promise<void> {
  migrationError('deleteFeatureFlag');
}

export async function isFeatureEnabled(
  _slug: string,
  _userId?: string,
  _tenantId?: string,
  _userRole?: string,
): Promise<boolean> {
  migrationError('isFeatureEnabled');
}

// =============================================================================
// SYSTEM SETTINGS
// =============================================================================

export async function getSystemSettings(): Promise<SystemSetting[]> {
  migrationError('getSystemSettings');
}

export async function getSystemSetting(_key: string): Promise<unknown> {
  migrationError('getSystemSetting');
}

export async function updateSystemSetting(
  _key: string,
  _value: unknown,
  _updatedBy: string,
): Promise<SystemSetting> {
  migrationError('updateSystemSetting');
}

// =============================================================================
// API KEYS
// =============================================================================

export async function getAPIKeys(): Promise<APIKey[]> {
  migrationError('getAPIKeys');
}

export async function createAPIKey(
  _input: CreateAPIKeyInput,
  _createdBy: string,
): Promise<{ key: APIKey; plainTextKey: string }> {
  migrationError('createAPIKey');
}

export async function revokeAPIKey(_id: string): Promise<void> {
  migrationError('revokeAPIKey');
}

export async function validateAPIKey(_plainTextKey: string): Promise<APIKey | null> {
  migrationError('validateAPIKey');
}

// =============================================================================
// ADMIN AUDIT
// =============================================================================

export async function logAdminAction(
  _adminId: string,
  _action: string,
  _resourceType: string,
  _resourceId?: string,
  _details?: Record<string, unknown>,
  _ipAddress?: string,
  _userAgent?: string,
): Promise<void> {
  migrationError('logAdminAction');
}

export async function getAdminAuditLogs(_options?: {
  adminId?: string;
  resourceType?: string;
  limit?: number;
  offset?: number;
}): Promise<{ logs: AdminAuditLog[]; total: number }> {
  migrationError('getAdminAuditLogs');
}

// =============================================================================
// IMPERSONATION
// =============================================================================

export async function startImpersonation(
  _adminId: string,
  _targetUserId: string,
  _reason?: string,
): Promise<ImpersonationLog> {
  migrationError('startImpersonation');
}

export async function endImpersonation(_id: string): Promise<void> {
  migrationError('endImpersonation');
}

export async function getImpersonationLogs(_options?: {
  adminId?: string;
  limit?: number;
  offset?: number;
}): Promise<{ logs: ImpersonationLog[]; total: number }> {
  migrationError('getImpersonationLogs');
}

// =============================================================================
// USER MANAGEMENT
// =============================================================================

export async function getUsers(_options?: {
  search?: string;
  role?: string;
  tenant_id?: string;
  limit?: number;
  offset?: number;
}): Promise<{ users: UserWithDetails[]; total: number }> {
  migrationError('getUsers');
}

export async function getUserById(_id: string): Promise<UserWithDetails | null> {
  migrationError('getUserById');
}

// =============================================================================
// DASHBOARD STATS
// =============================================================================

export async function getSuperAdminStats(): Promise<SuperAdminStats> {
  migrationError('getSuperAdminStats');
}
