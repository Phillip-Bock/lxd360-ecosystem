import type Stripe from 'stripe';

// ============================================================================
// PLAN & PRICING TYPES
// ============================================================================

/**
 * Subscription plan identifiers matching Stripe Product IDs
 */
export type PlanType = 'free' | 'essentials' | 'professional' | 'enterprise';

/**
 * Billing intervals supported by the platform
 */
export type BillingInterval = 'month' | 'year';

/**
 * Feature flags available per plan
 */
export interface FeatureFlags {
  /** Access to AI-powered recommendations */
  aiRecommendations: boolean;
  /** Access to xAPI analytics dashboard */
  xapiAnalytics: boolean;
  /** Custom branding/white-labeling */
  customBranding: boolean;
  /** API access for integrations */
  apiAccess: boolean;
  /** SSO/SAML authentication */
  ssoEnabled: boolean;
  /** Priority support access */
  prioritySupport: boolean;
  /** XR/VR content capabilities */
  xrContent: boolean;
  /** Advanced reporting features */
  advancedReporting: boolean;
  /** Dedicated success manager */
  dedicatedSuccessManager: boolean;
  /** Custom integrations support */
  customIntegrations: boolean;
  /** SLA guarantee */
  slaGuarantee: boolean;
}

/**
 * Usage limits per subscription plan
 */
export interface PlanLimits {
  /** Maximum number of users/learners */
  maxUsers: number;
  /** Maximum number of courses */
  maxCourses: number;
  /** Maximum storage in bytes */
  maxStorageBytes: number;
  /** Maximum monthly API calls (-1 for unlimited) */
  maxApiCalls: number;
  /** Maximum number of organizations */
  maxOrganizations: number;
  /** Maximum number of instructors */
  maxInstructors: number;
  /** Feature availability flags */
  features: FeatureFlags;
}

/**
 * Complete subscription plan definition
 */
export interface SubscriptionPlan {
  /** Internal plan identifier */
  id: PlanType;
  /** Display name for the plan */
  name: string;
  /** Short description of the plan */
  description: string;
  /** Stripe Price ID for monthly billing */
  monthlyPriceId: string;
  /** Stripe Price ID for yearly billing (optional) */
  yearlyPriceId?: string;
  /** Current billing interval */
  interval: BillingInterval;
  /** Price amount in cents */
  amount: number;
  /** Currency code (ISO 4217) */
  currency: string;
  /** Marketing feature list */
  marketingFeatures: string[];
  /** Technical limits */
  limits: PlanLimits;
  /** Whether plan is currently available */
  isActive: boolean;
  /** Display order in pricing table */
  sortOrder: number;
  /** Badge text (e.g., "Most Popular") */
  badge?: string;
}

/**
 * Plan limits configuration lookup
 */
export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  free: {
    maxUsers: 100,
    maxCourses: 3,
    maxStorageBytes: 100 * 1024 * 1024, // 100MB
    maxApiCalls: 1000,
    maxOrganizations: 1,
    maxInstructors: 1,
    features: {
      aiRecommendations: false,
      xapiAnalytics: false,
      customBranding: false,
      apiAccess: false,
      ssoEnabled: false,
      prioritySupport: false,
      xrContent: false,
      advancedReporting: false,
      dedicatedSuccessManager: false,
      customIntegrations: false,
      slaGuarantee: false,
    },
  },
  essentials: {
    maxUsers: 500,
    maxCourses: 25,
    maxStorageBytes: 5 * 1024 * 1024 * 1024, // 5GB
    maxApiCalls: 10000,
    maxOrganizations: 1,
    maxInstructors: 5,
    features: {
      aiRecommendations: false,
      xapiAnalytics: true,
      customBranding: false,
      apiAccess: false,
      ssoEnabled: false,
      prioritySupport: false,
      xrContent: false,
      advancedReporting: false,
      dedicatedSuccessManager: false,
      customIntegrations: false,
      slaGuarantee: false,
    },
  },
  professional: {
    maxUsers: 1000,
    maxCourses: -1, // Unlimited
    maxStorageBytes: 50 * 1024 * 1024 * 1024, // 50GB
    maxApiCalls: 100000,
    maxOrganizations: 3,
    maxInstructors: 25,
    features: {
      aiRecommendations: true,
      xapiAnalytics: true,
      customBranding: true,
      apiAccess: true,
      ssoEnabled: false,
      prioritySupport: true,
      xrContent: true,
      advancedReporting: true,
      dedicatedSuccessManager: false,
      customIntegrations: false,
      slaGuarantee: false,
    },
  },
  enterprise: {
    maxUsers: -1, // Unlimited
    maxCourses: -1, // Unlimited
    maxStorageBytes: -1, // Unlimited
    maxApiCalls: -1, // Unlimited
    maxOrganizations: -1, // Unlimited
    maxInstructors: -1, // Unlimited
    features: {
      aiRecommendations: true,
      xapiAnalytics: true,
      customBranding: true,
      apiAccess: true,
      ssoEnabled: true,
      prioritySupport: true,
      xrContent: true,
      advancedReporting: true,
      dedicatedSuccessManager: true,
      customIntegrations: true,
      slaGuarantee: true,
    },
  },
};

// ============================================================================
// CUSTOMER & SUBSCRIPTION TYPES
// ============================================================================

/**
 * Subscription status values from Stripe
 */
export type SubscriptionStatus =
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'trialing'
  | 'unpaid'
  | 'paused';

/**
 * Payment method summary for display
 */
export interface PaymentMethodSummary {
  /** Payment method ID */
  id: string;
  /** Type of payment method */
  type: 'card' | 'bank_account' | 'sepa_debit' | 'us_bank_account';
  /** Card brand (if card) */
  brand?: string;
  /** Last 4 digits */
  last4: string;
  /** Expiration month (if card) */
  expMonth?: number;
  /** Expiration year (if card) */
  expYear?: number;
  /** Whether this is the default payment method */
  isDefault: boolean;
}

/**
 * Complete customer data structure
 */
export interface CustomerData {
  /** Stripe Customer ID */
  stripeCustomerId: string;
  /** Customer email */
  email: string;
  /** Customer name */
  name?: string;
  /** Associated user ID in our system */
  userId: string;
  /** Associated organization ID */
  organizationId?: string;
  /** Active subscription ID (if any) */
  stripeSubscriptionId: string | null;
  /** Current subscription status */
  subscriptionStatus: SubscriptionStatus | null;
  /** Current plan details */
  currentPlan: SubscriptionPlan | null;
  /** Default payment method */
  defaultPaymentMethod: PaymentMethodSummary | null;
  /** All payment methods on file */
  paymentMethods: PaymentMethodSummary[];
  /** Customer metadata */
  metadata: Record<string, string>;
  /** Account creation date */
  createdAt: Date;
  /** Last update timestamp */
  updatedAt: Date;
}

/**
 * Subscription details with full metadata
 */
export interface SubscriptionDetails {
  /** Subscription ID */
  id: string;
  /** Stripe Subscription ID */
  stripeSubscriptionId: string;
  /** Stripe Customer ID */
  stripeCustomerId: string;
  /** Stripe Price ID */
  stripePriceId: string;
  /** Plan type */
  planType: PlanType;
  /** Current status */
  status: SubscriptionStatus;
  /** Billing interval */
  interval: BillingInterval;
  /** Current period start */
  currentPeriodStart: Date;
  /** Current period end */
  currentPeriodEnd: Date;
  /** Whether subscription cancels at period end */
  cancelAtPeriodEnd: boolean;
  /** Date subscription was canceled (if applicable) */
  canceledAt?: Date;
  /** Trial end date (if in trial) */
  trialEnd?: Date;
  /** Latest invoice ID */
  latestInvoiceId?: string;
  /** Subscription metadata */
  metadata: Record<string, string>;
}

// ============================================================================
// CHECKOUT & BILLING PORTAL TYPES
// ============================================================================

/**
 * Parameters for creating a checkout session
 */
export interface CreateCheckoutParams {
  /** Stripe Price ID */
  priceId: string;
  /** Existing Stripe Customer ID (optional) */
  customerId?: string;
  /** User ID in our system */
  userId: string;
  /** Organization ID (optional) */
  organizationId?: string;
  /** Success redirect URL */
  successUrl: string;
  /** Cancel redirect URL */
  cancelUrl: string;
  /** Trial period in days (optional) */
  trialPeriodDays?: number;
  /** Allow promotion codes */
  allowPromotionCodes?: boolean;
  /** Collect tax IDs */
  collectTaxId?: boolean;
  /** Additional metadata */
  metadata?: Record<string, string>;
}

/**
 * Checkout session result
 */
export interface CheckoutSessionResult {
  /** Session ID */
  sessionId: string;
  /** Checkout URL to redirect user */
  url: string;
}

/**
 * Parameters for creating a billing portal session
 */
export interface CreatePortalParams {
  /** Stripe Customer ID */
  customerId: string;
  /** Return URL after portal session */
  returnUrl: string;
  /** Configuration ID for portal customization */
  configurationId?: string;
}

/**
 * Billing portal session result
 */
export interface PortalSessionResult {
  /** Portal session URL */
  url: string;
}

// ============================================================================
// INVOICE & PAYMENT TYPES
// ============================================================================

/**
 * Invoice status values
 */
export type InvoiceStatus = 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';

/**
 * Invoice line item
 */
export interface InvoiceLineItem {
  /** Line item ID */
  id: string;
  /** Description */
  description: string;
  /** Quantity */
  quantity: number;
  /** Unit amount in cents */
  unitAmount: number;
  /** Total amount in cents */
  amount: number;
  /** Currency */
  currency: string;
  /** Period start */
  periodStart: Date;
  /** Period end */
  periodEnd: Date;
}

/**
 * Invoice summary
 */
export interface InvoiceSummary {
  /** Invoice ID */
  id: string;
  /** Stripe Invoice ID */
  stripeInvoiceId: string;
  /** Invoice number */
  number: string;
  /** Invoice status */
  status: InvoiceStatus;
  /** Subtotal in cents */
  subtotal: number;
  /** Tax amount in cents */
  tax: number;
  /** Total amount in cents */
  total: number;
  /** Amount paid in cents */
  amountPaid: number;
  /** Amount due in cents */
  amountDue: number;
  /** Currency */
  currency: string;
  /** Invoice date */
  invoiceDate: Date;
  /** Due date */
  dueDate?: Date;
  /** Paid date */
  paidAt?: Date;
  /** PDF download URL */
  invoicePdfUrl?: string;
  /** Hosted invoice URL */
  hostedInvoiceUrl?: string;
  /** Line items */
  lineItems: InvoiceLineItem[];
}

/**
 * Payment intent status
 */
export type PaymentIntentStatus =
  | 'requires_payment_method'
  | 'requires_confirmation'
  | 'requires_action'
  | 'processing'
  | 'requires_capture'
  | 'canceled'
  | 'succeeded';

/**
 * Payment record in database
 */
export interface PaymentRecord {
  /** Internal payment ID */
  id: string;
  /** Associated subscription ID */
  subscriptionId: string;
  /** Stripe Invoice ID */
  stripeInvoiceId: string;
  /** Stripe Payment Intent ID */
  stripePaymentIntentId: string;
  /** Amount in cents */
  amount: number;
  /** Currency */
  currency: string;
  /** Payment status */
  status: PaymentIntentStatus;
  /** Payment method used */
  paymentMethod?: PaymentMethodSummary;
  /** Failure reason (if failed) */
  failureReason?: string;
  /** Payment timestamp */
  createdAt: Date;
}

// ============================================================================
// WEBHOOK TYPES
// ============================================================================

/**
 * Stripe webhook event types we handle
 */
export type StripeEventType =
  | 'checkout.session.completed'
  | 'checkout.session.expired'
  | 'customer.created'
  | 'customer.updated'
  | 'customer.deleted'
  | 'customer.subscription.created'
  | 'customer.subscription.updated'
  | 'customer.subscription.deleted'
  | 'customer.subscription.paused'
  | 'customer.subscription.resumed'
  | 'customer.subscription.trial_will_end'
  | 'invoice.created'
  | 'invoice.finalized'
  | 'invoice.paid'
  | 'invoice.payment_failed'
  | 'invoice.payment_action_required'
  | 'invoice.upcoming'
  | 'payment_intent.succeeded'
  | 'payment_intent.payment_failed'
  | 'payment_method.attached'
  | 'payment_method.detached'
  | 'price.created'
  | 'price.updated'
  | 'product.created'
  | 'product.updated';

/**
 * Webhook event data union type
 */
export type WebhookEventData =
  | Stripe.Checkout.Session
  | Stripe.Customer
  | Stripe.Subscription
  | Stripe.Invoice
  | Stripe.PaymentIntent
  | Stripe.PaymentMethod
  | Stripe.Price
  | Stripe.Product;

/**
 * Parsed webhook event
 */
export interface WebhookEvent<T extends WebhookEventData = WebhookEventData> {
  /** Event ID */
  id: string;
  /** Event type */
  type: StripeEventType;
  /** Event data */
  data: {
    object: T;
    previous_attributes?: Partial<T>;
  };
  /** API version */
  apiVersion: string;
  /** Event creation timestamp */
  created: number;
  /** Whether this is a live mode event */
  livemode: boolean;
  /** Number of pending webhooks for this event */
  pendingWebhooks: number;
  /** Idempotency key for request */
  request: {
    id: string | null;
    idempotencyKey: string | null;
  };
}

/**
 * Webhook handler function signature
 */
export type WebhookHandler<T extends WebhookEventData> = (event: WebhookEvent<T>) => Promise<void>;

/**
 * Webhook handler registry
 */
export type WebhookHandlerRegistry = {
  [K in StripeEventType]?: WebhookHandler<WebhookEventData>;
};

// ============================================================================
// USAGE & METERING TYPES
// ============================================================================

/**
 * Actions that consume plan limits
 */
export type UsageAction =
  | 'create_course'
  | 'add_learner'
  | 'upload_file'
  | 'api_call'
  | 'add_instructor'
  | 'create_organization';

/**
 * Current usage metrics
 */
export interface UsageMetrics {
  /** Total courses created */
  courseCount: number;
  /** Total active learners */
  learnerCount: number;
  /** Total storage used in bytes */
  storageUsedBytes: number;
  /** API calls this billing period */
  apiCallsThisPeriod: number;
  /** Total instructors */
  instructorCount: number;
  /** Total organizations */
  organizationCount: number;
  /** Last calculated timestamp */
  calculatedAt: Date;
}

/**
 * Usage limit check result
 */
export interface UsageLimitCheckResult {
  /** Whether the action is allowed */
  allowed: boolean;
  /** Current usage for this metric */
  currentUsage: number;
  /** Maximum allowed for this metric (-1 for unlimited) */
  limit: number;
  /** Percentage of limit used */
  percentageUsed: number;
  /** User-friendly message */
  message?: string;
  /** Upgrade suggestion if limit reached */
  upgradeSuggestion?: {
    planType: PlanType;
    newLimit: number;
  };
}

// ============================================================================
// ERROR TYPES
// ============================================================================

/**
 * Stripe-specific error codes
 */
export type StripeErrorCode =
  | 'card_declined'
  | 'expired_card'
  | 'incorrect_cvc'
  | 'processing_error'
  | 'incorrect_number'
  | 'invalid_expiry_month'
  | 'invalid_expiry_year'
  | 'insufficient_funds'
  | 'customer_not_found'
  | 'subscription_not_found'
  | 'webhook_signature_invalid'
  | 'idempotency_error'
  | 'rate_limit_exceeded'
  | 'api_connection_error'
  | 'authentication_error';

/**
 * Billing error structure
 */
export interface BillingError {
  /** Error code */
  code: StripeErrorCode | string;
  /** User-friendly message */
  message: string;
  /** Detailed error information */
  details?: Record<string, unknown>;
  /** Whether this is a retryable error */
  retryable: boolean;
  /** Suggested action for the user */
  suggestedAction?: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

/**
 * Standard billing API response
 */
export interface BillingApiResponse<T> {
  /** Whether the request succeeded */
  success: boolean;
  /** Response data */
  data?: T;
  /** Error information */
  error?: BillingError;
}

/**
 * Subscription update request
 */
export interface UpdateSubscriptionRequest {
  /** New price ID */
  priceId?: string;
  /** Cancel at period end */
  cancelAtPeriodEnd?: boolean;
  /** Resume canceled subscription */
  resume?: boolean;
  /** Update payment method */
  paymentMethodId?: string;
  /** Proration behavior */
  prorationBehavior?: 'create_prorations' | 'none' | 'always_invoice';
}

/**
 * Subscription update response
 */
export interface UpdateSubscriptionResponse {
  /** Updated subscription details */
  subscription: SubscriptionDetails;
  /** Proration invoice (if applicable) */
  prorationInvoice?: InvoiceSummary;
}

// ============================================================================
// HELPER TYPES
// ============================================================================

/**
 * Type guard for checking plan type
 */
export function isPlanType(value: string): value is PlanType {
  return ['free', 'essentials', 'professional', 'enterprise'].includes(value);
}

/**
 * Type guard for checking subscription status
 */
export function isActiveSubscription(status: SubscriptionStatus): boolean {
  return ['active', 'trialing'].includes(status);
}

/**
 * Type guard for subscription details
 */
export function hasActiveSubscription(
  customer: CustomerData,
): customer is CustomerData & { currentPlan: SubscriptionPlan } {
  return (
    customer.currentPlan !== null &&
    customer.subscriptionStatus !== null &&
    isActiveSubscription(customer.subscriptionStatus)
  );
}

/**
 * Format amount from cents to display string
 */
export function formatAmount(amountCents: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amountCents / 100);
}

/**
 * Check if a limit value represents unlimited
 */
export function isUnlimited(limit: number): boolean {
  return limit === -1;
}

// ============================================================================
// EXPORTS
// ============================================================================

export type { Stripe };
