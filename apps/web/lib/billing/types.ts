// ============================================================================
// ENUMS (matching database)
// ============================================================================

export type BillingInterval = 'quarterly' | 'yearly' | 'one_time';

export type SubscriptionStatus =
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'unpaid'
  | 'paused';

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'refunded'
  | 'canceled';

export type PaymentProvider = 'stripe' | 'paypal';

export type CouponType = 'percentage' | 'fixed_amount';

export type CouponDuration = 'once' | 'repeating' | 'forever';

// ============================================================================
// DATABASE MODELS
// ============================================================================

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  product_line: 'inspire_studio' | 'lxp360' | 'lxd360_bundle' | 'consulting';
  tier: string;
  display_order: number;
  is_active: boolean;
  is_featured: boolean;
  features: string[];
  seat_based: boolean;
  min_seats: number;
  max_seats: number | null;
  learner_based: boolean;
  min_learners: number;
  max_learners: number | null;
  included_tokens: number;
  stripe_product_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Price {
  id: string;
  product_id: string;
  amount: number; // cents
  currency: string;
  interval: BillingInterval;
  nickname: string | null;
  unit_amount: number | null;
  trial_days: number;
  stripe_price_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductWithPrices extends Product {
  prices: Price[];
}

export interface Addon {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  amount: number;
  currency: string;
  interval: BillingInterval;
  compatible_products: string[];
  stripe_product_id: string | null;
  stripe_price_id: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface TokenPackage {
  id: string;
  name: string;
  description: string | null;
  token_amount: number;
  amount: number; // cents
  currency: string;
  bonus_tokens: number;
  savings_percent: number | null;
  stripe_product_id: string | null;
  stripe_price_id: string | null;
  is_active: boolean;
  is_featured: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: CouponType;
  amount: number;
  currency: string;
  duration: CouponDuration;
  duration_months: number | null;
  max_redemptions: number | null;
  current_redemptions: number;
  expires_at: string | null;
  applicable_products: string[];
  minimum_amount: number | null;
  stripe_coupon_id: string | null;
  internal_name: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BillingCustomer {
  id: string;
  user_id: string;
  tenant_id: string | null;
  stripe_customer_id: string | null;
  paypal_customer_id: string | null;
  email: string | null;
  name: string | null;
  phone: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  tax_id: string | null;
  tax_exempt: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  customer_id: string;
  tenant_id: string | null;
  product_id: string;
  price_id: string;
  stripe_subscription_id: string | null;
  status: SubscriptionStatus;
  quantity: number;
  current_period_start: string | null;
  current_period_end: string | null;
  trial_start: string | null;
  trial_end: string | null;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  cancellation_reason: string | null;
  pause_collection: Record<string, unknown> | null;
  coupon_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionWithDetails extends Subscription {
  product: Product;
  price: Price;
  customer: BillingCustomer;
  items: SubscriptionItem[];
}

export interface SubscriptionItem {
  id: string;
  subscription_id: string;
  addon_id: string | null;
  stripe_subscription_item_id: string | null;
  quantity: number;
  unit_amount: number;
  created_at: string;
  updated_at: string;
  addon?: Addon;
}

export interface TokenBalance {
  id: string;
  tenant_id: string;
  balance: number;
  total_purchased: number;
  total_used: number;
  total_gifted: number;
  low_balance_threshold: number;
  low_balance_notified_at: string | null;
  updated_at: string;
}

export interface TokenTransaction {
  id: string;
  tenant_id: string;
  type: 'purchase' | 'subscription_grant' | 'usage' | 'refund' | 'adjustment';
  amount: number;
  balance_after: number;
  reference_type: string | null;
  reference_id: string | null;
  feature_used: string | null;
  description: string | null;
  performed_by: string | null;
  created_at: string;
}

export interface Payment {
  id: string;
  customer_id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider: PaymentProvider;
  provider_payment_id: string | null;
  provider_charge_id: string | null;
  subscription_id: string | null;
  invoice_id: string | null;
  payment_method_type: string | null;
  payment_method_last4: string | null;
  payment_method_brand: string | null;
  failure_code: string | null;
  failure_message: string | null;
  refunded_amount: number;
  refund_reason: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  customer_id: string;
  subscription_id: string | null;
  invoice_number: string;
  stripe_invoice_id: string | null;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  invoice_date: string;
  due_date: string | null;
  paid_at: string | null;
  period_start: string | null;
  period_end: string | null;
  lines: InvoiceLine[];
  invoice_pdf_url: string | null;
  hosted_invoice_url: string | null;
  coupon_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface InvoiceLine {
  description: string;
  quantity: number;
  unit_amount: number;
  amount: number;
  product_id?: string;
  price_id?: string;
}

export interface PaymentMethod {
  id: string;
  customer_id: string;
  provider: PaymentProvider;
  provider_payment_method_id: string;
  type: 'card' | 'bank_account' | 'paypal';
  brand: string | null;
  last4: string | null;
  exp_month: number | null;
  exp_year: number | null;
  bank_name: string | null;
  account_type: string | null;
  is_default: boolean;
  billing_address: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

export interface CreateCheckoutSessionRequest {
  priceId: string;
  quantity?: number;
  addons?: { addonId: string; quantity: number }[];
  tokenPackageId?: string;
  couponCode?: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CreateCheckoutSessionResponse {
  sessionId: string;
  url: string;
}

export interface ValidateCouponRequest {
  code: string;
  productId?: string;
  amount?: number;
}

export interface ValidateCouponResponse {
  valid: boolean;
  coupon?: Coupon;
  discountAmount?: number;
  errorMessage?: string;
}

export interface CreateBillingPortalRequest {
  returnUrl: string;
}

export interface CreateBillingPortalResponse {
  url: string;
}

export interface PurchaseTokensRequest {
  packageId: string;
  successUrl: string;
  cancelUrl: string;
}

export interface UpgradeSubscriptionRequest {
  subscriptionId: string;
  newPriceId: string;
  newQuantity?: number;
  prorationBehavior?: 'create_prorations' | 'none' | 'always_invoice';
}

export interface CancelSubscriptionRequest {
  subscriptionId: string;
  cancelImmediately?: boolean;
  reason?: string;
}

// ============================================================================
// CHECKOUT FLOW TYPES
// ============================================================================

export interface CheckoutState {
  step: 'plan' | 'addons' | 'tokens' | 'payment';
  selectedProduct: ProductWithPrices | null;
  selectedPrice: Price | null;
  quantity: number;
  selectedAddons: { addon: Addon; quantity: number }[];
  selectedTokenPackage: TokenPackage | null;
  couponCode: string;
  appliedCoupon: Coupon | null;
  billingInterval: BillingInterval;
}

export interface CheckoutSummary {
  subtotal: number;
  addonsTotal: number;
  tokensTotal: number;
  discount: number;
  total: number;
  currency: string;
  interval: BillingInterval;
  items: {
    name: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
}

// ============================================================================
// ADMIN TYPES
// ============================================================================

export interface AdminProductFormData {
  name: string;
  slug: string;
  description: string;
  product_line: Product['product_line'];
  tier: string;
  display_order: number;
  is_active: boolean;
  is_featured: boolean;
  features: string[];
  seat_based: boolean;
  min_seats: number;
  max_seats: number | null;
  learner_based: boolean;
  min_learners: number;
  max_learners: number | null;
  included_tokens: number;
}

export interface AdminPriceFormData {
  product_id: string;
  amount: number;
  currency: string;
  interval: BillingInterval;
  nickname: string;
  unit_amount: number | null;
  trial_days: number;
  is_active: boolean;
}

export interface AdminCouponFormData {
  code: string;
  type: CouponType;
  amount: number;
  currency: string;
  duration: CouponDuration;
  duration_months: number | null;
  max_redemptions: number | null;
  expires_at: string | null;
  applicable_products: string[];
  minimum_amount: number | null;
  internal_name: string;
  is_active: boolean;
}

export interface AdminTokenPackageFormData {
  name: string;
  description: string;
  token_amount: number;
  amount: number;
  bonus_tokens: number;
  savings_percent: number | null;
  is_active: boolean;
  is_featured: boolean;
  display_order: number;
}

// ============================================================================
// WEBHOOK TYPES
// ============================================================================

export interface WebhookEvent {
  id: string;
  provider: PaymentProvider;
  event_id: string;
  event_type: string;
  processed_at: string | null;
  processing_error: string | null;
  payload: Record<string, unknown>;
  created_at: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export function formatCurrency(amount: number, currency = 'usd'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

export function formatInterval(interval: BillingInterval): string {
  switch (interval) {
    case 'quarterly':
      return 'per quarter';
    case 'yearly':
      return 'per year';
    case 'one_time':
      return 'one-time';
    default:
      return interval;
  }
}

export function getIntervalMonths(interval: BillingInterval): number {
  switch (interval) {
    case 'quarterly':
      return 3;
    case 'yearly':
      return 12;
    case 'one_time':
      return 0;
    default:
      return 1;
  }
}
