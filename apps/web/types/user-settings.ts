/**
 * User Settings Types
 *
 * Zod schemas and TypeScript types for user profile and settings.
 * Used for form validation and Firestore document structure.
 */

import { z } from 'zod';

// ============================================================================
// PROFILE SCHEMA
// ============================================================================

export const profileSchema = z.object({
  displayName: z
    .string()
    .min(1, 'Display name is required')
    .max(100, 'Display name must be 100 characters or less'),
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name must be 50 characters or less'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be 50 characters or less'),
  phone: z
    .string()
    .max(20, 'Phone number must be 20 characters or less')
    .optional()
    .or(z.literal('')),
  jobTitle: z
    .string()
    .max(100, 'Job title must be 100 characters or less')
    .optional()
    .or(z.literal('')),
  department: z.string().optional().or(z.literal('')),
  bio: z.string().max(500, 'Bio must be 500 characters or less').optional().or(z.literal('')),
  location: z
    .string()
    .max(100, 'Location must be 100 characters or less')
    .optional()
    .or(z.literal('')),
  timezone: z.string().optional().or(z.literal('')),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

// ============================================================================
// NOTIFICATION PREFERENCES SCHEMA
// ============================================================================

export const notificationPreferencesSchema = z.object({
  emailNotifications: z.boolean(),
  courseAssignments: z.boolean(),
  dueDateReminders: z.boolean(),
  completionCertificates: z.boolean(),
  weeklyDigest: z.boolean(),
  managerApprovals: z.boolean(),
  teamUpdates: z.boolean(),
});

export type NotificationPreferences = z.infer<typeof notificationPreferencesSchema>;

// ============================================================================
// ACCESSIBILITY PREFERENCES SCHEMA
// ============================================================================

export const accessibilityPreferencesSchema = z.object({
  reduceMotion: z.boolean(),
  highContrast: z.boolean(),
  fontSize: z.enum(['small', 'medium', 'large', 'xlarge']),
  screenReaderOptimized: z.boolean(),
  alwaysShowCaptions: z.boolean(),
});

export type AccessibilityPreferences = z.infer<typeof accessibilityPreferencesSchema>;

// ============================================================================
// APPEARANCE PREFERENCES SCHEMA
// ============================================================================

export const appearancePreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
});

export type AppearancePreferences = z.infer<typeof appearancePreferencesSchema>;

// ============================================================================
// COMBINED USER SETTINGS
// ============================================================================

export interface UserSettings {
  profile: ProfileFormData & {
    email: string;
    avatarUrl?: string;
  };
  notifications: NotificationPreferences;
  accessibility: AccessibilityPreferences;
  appearance: AppearancePreferences;
  updatedAt?: Date;
}

// ============================================================================
// DEPARTMENT OPTIONS
// ============================================================================

export const DEPARTMENT_OPTIONS = [
  { value: '', label: 'Select department...' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'design', label: 'Design' },
  { value: 'product', label: 'Product' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'sales', label: 'Sales' },
  { value: 'customer_success', label: 'Customer Success' },
  { value: 'human_resources', label: 'Human Resources' },
  { value: 'finance', label: 'Finance' },
  { value: 'operations', label: 'Operations' },
  { value: 'legal', label: 'Legal' },
  { value: 'learning_development', label: 'Learning & Development' },
  { value: 'other', label: 'Other' },
] as const;

// ============================================================================
// TIMEZONE OPTIONS
// ============================================================================

export const TIMEZONE_OPTIONS = [
  { value: '', label: 'Select timezone...' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HT)' },
  { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
  { value: 'Europe/Paris', label: 'Central European Time (CET)' },
  { value: 'Europe/Berlin', label: 'Central European Time (CET)' },
  { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' },
  { value: 'Asia/Shanghai', label: 'China Standard Time (CST)' },
  { value: 'Asia/Kolkata', label: 'India Standard Time (IST)' },
  { value: 'Australia/Sydney', label: 'Australian Eastern Time (AET)' },
  { value: 'UTC', label: 'Coordinated Universal Time (UTC)' },
] as const;

// ============================================================================
// FONT SIZE OPTIONS
// ============================================================================

export const FONT_SIZE_OPTIONS = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium (Default)' },
  { value: 'large', label: 'Large' },
  { value: 'xlarge', label: 'Extra Large' },
] as const;

// ============================================================================
// DEFAULT VALUES
// ============================================================================

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  emailNotifications: true,
  courseAssignments: true,
  dueDateReminders: true,
  completionCertificates: true,
  weeklyDigest: true,
  managerApprovals: false,
  teamUpdates: false,
};

export const DEFAULT_ACCESSIBILITY_PREFERENCES: AccessibilityPreferences = {
  reduceMotion: false,
  highContrast: false,
  fontSize: 'medium',
  screenReaderOptimized: false,
  alwaysShowCaptions: false,
};

export const DEFAULT_APPEARANCE_PREFERENCES: AppearancePreferences = {
  theme: 'system',
};
