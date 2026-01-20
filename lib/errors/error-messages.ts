/**
 * User-friendly error messages for the application
 *
 * Centralized error messages for:
 * - Authentication errors
 * - Validation errors
 * - Resource errors
 * - Operation errors
 * - Network errors
 * - System errors
 */

// =============================================================================
// Types
// =============================================================================

export type ErrorCategory =
  | 'auth'
  | 'validation'
  | 'resources'
  | 'operations'
  | 'network'
  | 'system'
  | 'billing'
  | 'permissions';

export interface ErrorMessage {
  title: string;
  description: string;
  action?: string;
}

// =============================================================================
// Error Message Maps
// =============================================================================

/**
 * Authentication error messages
 */
export const authErrors: Record<string, ErrorMessage> = {
  INVALID_CREDENTIALS: {
    title: 'Invalid Credentials',
    description: 'The email or password you entered is incorrect.',
    action: 'Please check your credentials and try again.',
  },
  SESSION_EXPIRED: {
    title: 'Session Expired',
    description: 'Your session has expired for security reasons.',
    action: 'Please sign in again to continue.',
  },
  ACCOUNT_LOCKED: {
    title: 'Account Locked',
    description: 'Your account has been locked due to multiple failed login attempts.',
    action: 'Please contact support or reset your password.',
  },
  ACCOUNT_DISABLED: {
    title: 'Account Disabled',
    description: 'Your account has been disabled.',
    action: 'Please contact support for assistance.',
  },
  EMAIL_NOT_VERIFIED: {
    title: 'Email Not Verified',
    description: 'You need to verify your email address before signing in.',
    action: 'Check your inbox for a verification email.',
  },
  MFA_REQUIRED: {
    title: 'Two-Factor Authentication Required',
    description: 'Please enter your two-factor authentication code to continue.',
  },
  MFA_INVALID: {
    title: 'Invalid Code',
    description: 'The authentication code you entered is invalid or has expired.',
    action: 'Please enter a new code from your authenticator app.',
  },
  PASSWORD_RESET_EXPIRED: {
    title: 'Reset Link Expired',
    description: 'This password reset link has expired.',
    action: 'Please request a new password reset link.',
  },
  TOKEN_INVALID: {
    title: 'Invalid Token',
    description: 'The authentication token is invalid or has expired.',
    action: 'Please sign in again.',
  },
  UNAUTHORIZED: {
    title: 'Unauthorized',
    description: 'You need to be signed in to access this resource.',
    action: 'Please sign in to continue.',
  },
};

/**
 * Validation error messages
 */
export const validationErrors: Record<string, ErrorMessage> = {
  VALIDATION_FAILED: {
    title: 'Validation Error',
    description: 'Some fields have invalid values.',
    action: 'Please correct the highlighted fields and try again.',
  },
  REQUIRED_FIELD: {
    title: 'Required Field',
    description: 'This field is required.',
  },
  INVALID_EMAIL: {
    title: 'Invalid Email',
    description: 'Please enter a valid email address.',
  },
  INVALID_PASSWORD: {
    title: 'Invalid Password',
    description: 'Password must be at least 8 characters with uppercase, lowercase, and numbers.',
  },
  PASSWORD_MISMATCH: {
    title: 'Passwords Do Not Match',
    description: 'The passwords you entered do not match.',
  },
  INVALID_PHONE: {
    title: 'Invalid Phone Number',
    description: 'Please enter a valid phone number.',
  },
  INVALID_URL: {
    title: 'Invalid URL',
    description: 'Please enter a valid URL.',
  },
  FILE_TOO_LARGE: {
    title: 'File Too Large',
    description: 'The file exceeds the maximum allowed size.',
    action: 'Please upload a smaller file.',
  },
  INVALID_FILE_TYPE: {
    title: 'Invalid File Type',
    description: 'This file type is not supported.',
    action: 'Please upload a supported file format.',
  },
  DUPLICATE_ENTRY: {
    title: 'Duplicate Entry',
    description: 'An entry with this value already exists.',
  },
};

/**
 * Resource error messages
 */
export const resourceErrors: Record<string, ErrorMessage> = {
  NOT_FOUND: {
    title: 'Not Found',
    description: 'The requested resource could not be found.',
    action: 'It may have been moved or deleted.',
  },
  COURSE_NOT_FOUND: {
    title: 'Course Not Found',
    description: 'This course does not exist or has been removed.',
  },
  USER_NOT_FOUND: {
    title: 'User Not Found',
    description: 'This user account does not exist.',
  },
  FILE_NOT_FOUND: {
    title: 'File Not Found',
    description: 'The requested file could not be found.',
  },
  ALREADY_EXISTS: {
    title: 'Already Exists',
    description: 'A resource with this identifier already exists.',
  },
  RESOURCE_LOCKED: {
    title: 'Resource Locked',
    description: 'This resource is currently being edited by another user.',
    action: 'Please try again later.',
  },
  RESOURCE_ARCHIVED: {
    title: 'Resource Archived',
    description: 'This resource has been archived and cannot be modified.',
  },
};

/**
 * Operation error messages
 */
export const operationErrors: Record<string, ErrorMessage> = {
  OPERATION_FAILED: {
    title: 'Operation Failed',
    description: 'The requested operation could not be completed.',
    action: 'Please try again or contact support.',
  },
  SAVE_FAILED: {
    title: 'Save Failed',
    description: 'Your changes could not be saved.',
    action: 'Please try again.',
  },
  DELETE_FAILED: {
    title: 'Delete Failed',
    description: 'The item could not be deleted.',
    action: 'Please try again or contact support.',
  },
  UPLOAD_FAILED: {
    title: 'Upload Failed',
    description: 'The file could not be uploaded.',
    action: 'Please check your connection and try again.',
  },
  DOWNLOAD_FAILED: {
    title: 'Download Failed',
    description: 'The file could not be downloaded.',
    action: 'Please try again.',
  },
  EXPORT_FAILED: {
    title: 'Export Failed',
    description: 'The data could not be exported.',
    action: 'Please try again or use a different format.',
  },
  IMPORT_FAILED: {
    title: 'Import Failed',
    description: 'The data could not be imported.',
    action: 'Please check the file format and try again.',
  },
};

/**
 * Network error messages
 */
export const networkErrors: Record<string, ErrorMessage> = {
  NETWORK_ERROR: {
    title: 'Network Error',
    description: 'Unable to connect to the server.',
    action: 'Please check your internet connection and try again.',
  },
  TIMEOUT: {
    title: 'Request Timeout',
    description: 'The request took too long to complete.',
    action: 'Please try again.',
  },
  CONNECTION_LOST: {
    title: 'Connection Lost',
    description: 'Your connection to the server was interrupted.',
    action: 'Reconnecting...',
  },
  OFFLINE: {
    title: 'You Are Offline',
    description: 'No internet connection detected.',
    action: 'Please check your network settings.',
  },
};

/**
 * System error messages
 */
export const systemErrors: Record<string, ErrorMessage> = {
  INTERNAL_ERROR: {
    title: 'Something Went Wrong',
    description: 'An unexpected error occurred.',
    action: 'Please try again or contact support if the problem persists.',
  },
  SERVICE_UNAVAILABLE: {
    title: 'Service Unavailable',
    description: 'The service is temporarily unavailable.',
    action: 'Please try again in a few minutes.',
  },
  MAINTENANCE_MODE: {
    title: 'Maintenance in Progress',
    description: 'We are currently performing scheduled maintenance.',
    action: 'Please check back soon.',
  },
  RATE_LIMITED: {
    title: 'Too Many Requests',
    description: 'You have made too many requests in a short period.',
    action: 'Please wait a moment before trying again.',
  },
  FEATURE_DISABLED: {
    title: 'Feature Disabled',
    description: 'This feature is currently disabled.',
  },
};

/**
 * Billing error messages
 */
export const billingErrors: Record<string, ErrorMessage> = {
  PAYMENT_FAILED: {
    title: 'Payment Failed',
    description: 'Your payment could not be processed.',
    action: 'Please check your payment details and try again.',
  },
  SUBSCRIPTION_EXPIRED: {
    title: 'Subscription Expired',
    description: 'Your subscription has expired.',
    action: 'Please renew to continue using premium features.',
  },
  PLAN_LIMIT_REACHED: {
    title: 'Plan Limit Reached',
    description: 'You have reached the limit for your current plan.',
    action: 'Upgrade to access more features.',
  },
  INVALID_CARD: {
    title: 'Invalid Card',
    description: 'The card number you entered is invalid.',
    action: 'Please check your card details.',
  },
  CARD_DECLINED: {
    title: 'Card Declined',
    description: 'Your card was declined.',
    action: 'Please try a different payment method.',
  },
};

/**
 * Permission error messages
 */
export const permissionErrors: Record<string, ErrorMessage> = {
  ACCESS_DENIED: {
    title: 'Access Denied',
    description: 'You do not have permission to access this resource.',
    action: 'Contact your administrator for access.',
  },
  INSUFFICIENT_PERMISSIONS: {
    title: 'Insufficient Permissions',
    description: 'You do not have the required permissions for this action.',
  },
  ROLE_REQUIRED: {
    title: 'Role Required',
    description: 'This action requires a specific role.',
    action: 'Contact your administrator to upgrade your role.',
  },
  OWNER_ONLY: {
    title: 'Owner Access Required',
    description: 'Only the owner can perform this action.',
  },
};

// =============================================================================
// Combined Error Messages Map
// =============================================================================

export const errorMessages: Record<string, ErrorMessage> = {
  ...authErrors,
  ...validationErrors,
  ...resourceErrors,
  ...operationErrors,
  ...networkErrors,
  ...systemErrors,
  ...billingErrors,
  ...permissionErrors,
};

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get a user-friendly error message by code
 *
 * @example
 * ```ts
 * const message = getErrorMessage('INVALID_CREDENTIALS')
 * // { title: 'Invalid Credentials', description: '...', action: '...' }
 * ```
 */
export function getErrorMessage(code: string): ErrorMessage {
  return (
    errorMessages[code] || {
      title: 'Error',
      description: 'An unexpected error occurred.',
      action: 'Please try again.',
    }
  );
}

/**
 * Get error messages by category
 */
export function getErrorsByCategory(category: ErrorCategory): Record<string, ErrorMessage> {
  const categoryMaps: Record<ErrorCategory, Record<string, ErrorMessage>> = {
    auth: authErrors,
    validation: validationErrors,
    resources: resourceErrors,
    operations: operationErrors,
    network: networkErrors,
    system: systemErrors,
    billing: billingErrors,
    permissions: permissionErrors,
  };
  return categoryMaps[category] || {};
}

/**
 * Format an error message with dynamic values
 *
 * @example
 * ```ts
 * const message = formatErrorMessage('FILE_TOO_LARGE', { maxSize: '10MB' })
 * ```
 */
export function formatErrorMessage(
  code: string,
  variables?: Record<string, string | number>,
): ErrorMessage {
  const baseMessage = getErrorMessage(code);

  if (!variables) return baseMessage;

  const format = (text: string): string => {
    return Object.entries(variables).reduce((acc, [key, value]) => {
      return acc.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
    }, text);
  };

  return {
    title: format(baseMessage.title),
    description: format(baseMessage.description),
    action: baseMessage.action ? format(baseMessage.action) : undefined,
  };
}

/**
 * Get error title only
 */
export function getErrorTitle(code: string): string {
  return getErrorMessage(code).title;
}

/**
 * Get error description only
 */
export function getErrorDescription(code: string): string {
  return getErrorMessage(code).description;
}

// =============================================================================
// HTTP Status to Error Code Map
// =============================================================================

export const httpStatusToErrorCode: Record<number, string> = {
  400: 'VALIDATION_FAILED',
  401: 'UNAUTHORIZED',
  403: 'ACCESS_DENIED',
  404: 'NOT_FOUND',
  408: 'TIMEOUT',
  409: 'ALREADY_EXISTS',
  429: 'RATE_LIMITED',
  500: 'INTERNAL_ERROR',
  502: 'SERVICE_UNAVAILABLE',
  503: 'SERVICE_UNAVAILABLE',
  504: 'TIMEOUT',
};

/**
 * Get error message from HTTP status code
 */
export function getErrorFromHttpStatus(status: number): ErrorMessage {
  const code = httpStatusToErrorCode[status] || 'INTERNAL_ERROR';
  return getErrorMessage(code);
}

// =============================================================================
// Exports
// =============================================================================

const errorMessagesExport = {
  getErrorMessage,
  getErrorsByCategory,
  formatErrorMessage,
  getErrorTitle,
  getErrorDescription,
  getErrorFromHttpStatus,
  errorMessages,
  authErrors,
  validationErrors,
  resourceErrors,
  operationErrors,
  networkErrors,
  systemErrors,
  billingErrors,
  permissionErrors,
};

export default errorMessagesExport;
