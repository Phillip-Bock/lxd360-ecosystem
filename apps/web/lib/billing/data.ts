// TODO(LXD-301): Implement with Firestore

import type {
  Addon,
  BillingCustomer,
  BillingInterval,
  Coupon,
  Invoice,
  PaymentMethod,
  Price,
  Product,
  ProductWithPrices,
  Subscription,
  SubscriptionWithDetails,
  TokenBalance,
  TokenPackage,
  TokenTransaction,
} from './types';

// ============================================================================
// MIGRATION HELPER
// ============================================================================

/**
 * Throws a migration error for operations not yet implemented with Firestore
 */
function migrationError(operation: string): never {
  throw new Error(
    `${operation}: Database not configured - migration to Firestore in progress (LXD-301)`,
  );
}

// ============================================================================
// PRODUCTS
// ============================================================================

/**
 * Get all active products grouped by product line
 */
export async function getProducts(): Promise<{
  inspire_studio: ProductWithPrices[];
  lxp360: ProductWithPrices[];
  lxd360_bundle: ProductWithPrices[];
  consulting: ProductWithPrices[];
}> {
  migrationError('getProducts');
}

/**
 * Get a single product by slug
 */
export async function getProductBySlug(_slug: string): Promise<ProductWithPrices | null> {
  migrationError('getProductBySlug');
}

/**
 * Get a product by ID
 */
export async function getProductById(_id: string): Promise<ProductWithPrices | null> {
  migrationError('getProductById');
}

/**
 * Get prices for a product filtered by interval
 */
export async function getProductPrices(
  _productId: string,
  _interval?: BillingInterval,
): Promise<Price[]> {
  migrationError('getProductPrices');
}

// ============================================================================
// ADD-ONS
// ============================================================================

/**
 * Get all active add-ons
 */
export async function getAddons(): Promise<Addon[]> {
  migrationError('getAddons');
}

/**
 * Get add-ons compatible with a specific product
 */
export async function getAddonsForProduct(_productId: string): Promise<Addon[]> {
  migrationError('getAddonsForProduct');
}

// ============================================================================
// TOKEN PACKAGES
// ============================================================================

/**
 * Get all active token packages
 */
export async function getTokenPackages(): Promise<TokenPackage[]> {
  migrationError('getTokenPackages');
}

/**
 * Get a token package by ID
 */
export async function getTokenPackageById(_id: string): Promise<TokenPackage | null> {
  migrationError('getTokenPackageById');
}

// ============================================================================
// COUPONS
// ============================================================================

/**
 * Validate a coupon code
 */
export async function validateCoupon(
  _code: string,
  _productId?: string,
  _amount?: number,
): Promise<{
  valid: boolean;
  coupon?: Coupon;
  error?: string;
}> {
  migrationError('validateCoupon');
}

/**
 * Increment coupon redemption count
 */
export async function incrementCouponRedemption(_couponId: string): Promise<void> {
  migrationError('incrementCouponRedemption');
}

// ============================================================================
// CUSTOMERS
// ============================================================================

/**
 * Get or create billing customer for a user
 */
export async function getOrCreateBillingCustomer(
  _userId: string,
  _email: string,
  _name?: string,
  _tenantId?: string,
): Promise<BillingCustomer> {
  migrationError('getOrCreateBillingCustomer');
}

/**
 * Update billing customer
 */
export async function updateBillingCustomer(
  _customerId: string,
  _data: Partial<BillingCustomer>,
): Promise<BillingCustomer> {
  migrationError('updateBillingCustomer');
}

/**
 * Get billing customer by user ID
 */
export async function getBillingCustomerByUserId(_userId: string): Promise<BillingCustomer | null> {
  migrationError('getBillingCustomerByUserId');
}

// ============================================================================
// SUBSCRIPTIONS
// ============================================================================

/**
 * Get active subscription for a customer
 */
export async function getActiveSubscription(
  _customerId: string,
): Promise<SubscriptionWithDetails | null> {
  migrationError('getActiveSubscription');
}

/**
 * Get all subscriptions for a customer
 */
export async function getSubscriptions(_customerId: string): Promise<SubscriptionWithDetails[]> {
  migrationError('getSubscriptions');
}

/**
 * Create or update subscription from Stripe webhook
 */
export async function upsertSubscription(
  _subscription: Partial<Subscription> & { stripe_subscription_id: string },
): Promise<Subscription> {
  migrationError('upsertSubscription');
}

/**
 * Get subscriptions that are renewing soon (for reminder emails)
 */
export async function getSubscriptionsRenewingSoon(
  _daysBeforeRenewal: number,
): Promise<SubscriptionWithDetails[]> {
  migrationError('getSubscriptionsRenewingSoon');
}

// ============================================================================
// TOKEN BALANCES
// ============================================================================

/**
 * Get token balance for a tenant
 */
export async function getTokenBalance(_tenantId: string): Promise<TokenBalance | null> {
  migrationError('getTokenBalance');
}

/**
 * Get token transaction history
 */
export async function getTokenTransactions(
  _tenantId: string,
  _limit?: number,
  _offset?: number,
): Promise<TokenTransaction[]> {
  migrationError('getTokenTransactions');
}

/**
 * Add tokens to a tenant's balance
 */
export async function addTokens(
  _tenantId: string,
  _amount: number,
  _type: TokenTransaction['type'],
  _referenceType?: string,
  _referenceId?: string,
  _description?: string,
): Promise<number> {
  migrationError('addTokens');
}

/**
 * Use tokens (deduct from balance)
 */
export async function useTokens(
  _tenantId: string,
  _amount: number,
  _feature: string,
  _description?: string,
): Promise<boolean> {
  migrationError('useTokens');
}

// ============================================================================
// INVOICES
// ============================================================================

/**
 * Get invoices for a customer
 */
export async function getInvoices(
  _customerId: string,
  _limit?: number,
  _offset?: number,
): Promise<Invoice[]> {
  migrationError('getInvoices');
}

/**
 * Create invoice from Stripe webhook
 */
export async function createInvoice(
  _invoice: Omit<Invoice, 'id' | 'invoice_number' | 'created_at' | 'updated_at'>,
): Promise<Invoice> {
  migrationError('createInvoice');
}

// ============================================================================
// PAYMENT METHODS
// ============================================================================

/**
 * Get payment methods for a customer
 */
export async function getPaymentMethods(_customerId: string): Promise<PaymentMethod[]> {
  migrationError('getPaymentMethods');
}

// ============================================================================
// WEBHOOK EVENTS
// ============================================================================

/**
 * Check if a webhook event has been processed
 */
export async function isWebhookEventProcessed(
  _provider: 'stripe' | 'paypal',
  _eventId: string,
): Promise<boolean> {
  migrationError('isWebhookEventProcessed');
}

/**
 * Record a webhook event
 */
export async function recordWebhookEvent(
  _provider: 'stripe' | 'paypal',
  _eventId: string,
  _eventType: string,
  _payload: Record<string, unknown>,
  _error?: string,
): Promise<void> {
  migrationError('recordWebhookEvent');
}

// ============================================================================
// RENEWAL REMINDERS
// ============================================================================

/**
 * Check if a renewal reminder has been sent
 */
export async function hasReminderBeenSent(
  _subscriptionId: string,
  _daysBefore: number,
  _renewalDate: Date,
): Promise<boolean> {
  migrationError('hasReminderBeenSent');
}

/**
 * Record a sent renewal reminder
 */
export async function recordRenewalReminder(
  _subscriptionId: string,
  _daysBefore: number,
  _renewalDate: Date,
  _emailSentTo: string,
  _emailProviderId?: string,
): Promise<void> {
  migrationError('recordRenewalReminder');
}

// ============================================================================
// ADMIN FUNCTIONS
// ============================================================================

/**
 * Get all products (including inactive) for admin
 */
export async function getAllProductsAdmin(): Promise<ProductWithPrices[]> {
  migrationError('getAllProductsAdmin');
}

/**
 * Create or update product (admin)
 */
export async function upsertProduct(
  _product: Partial<Product> & { slug: string },
): Promise<Product> {
  migrationError('upsertProduct');
}

/**
 * Create or update price (admin)
 */
export async function upsertPrice(
  _price: Partial<Price> & { product_id: string; interval: BillingInterval },
): Promise<Price> {
  migrationError('upsertPrice');
}

/**
 * Get all coupons (admin)
 */
export async function getAllCouponsAdmin(): Promise<Coupon[]> {
  migrationError('getAllCouponsAdmin');
}

/**
 * Create or update coupon (admin)
 */
export async function upsertCoupon(_coupon: Partial<Coupon> & { code: string }): Promise<Coupon> {
  migrationError('upsertCoupon');
}

/**
 * Get all token packages (admin)
 */
export async function getAllTokenPackagesAdmin(): Promise<TokenPackage[]> {
  migrationError('getAllTokenPackagesAdmin');
}

/**
 * Upsert token package (admin)
 */
export async function upsertTokenPackage(_pkg: Partial<TokenPackage>): Promise<TokenPackage> {
  migrationError('upsertTokenPackage');
}
