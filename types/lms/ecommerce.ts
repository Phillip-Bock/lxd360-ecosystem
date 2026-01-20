/**
 * E-commerce and monetization type definitions
 */

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'refunded'
  | 'cancelled';
export type SubscriptionStatus =
  | 'active'
  | 'cancelled'
  | 'past_due'
  | 'unpaid'
  | 'trialing'
  | 'paused';
export type PayoutStatus = 'pending' | 'processing' | 'completed' | 'failed';

// ============================================
// Products
// ============================================

export interface Product {
  id: string;
  type: 'course' | 'bundle' | 'path' | 'subscription' | 'certification';
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  // References
  courseId?: string;
  pathId?: string;
  courseIds?: string[];
  // Pricing
  pricing: ProductPricing;
  // Display
  thumbnail: string;
  featured: boolean;
  order: number;
  // Categories
  category?: string;
  tags: string[];
  // Access
  accessDuration?: number; // days, null = lifetime
  // Stats
  totalSales: number;
  totalRevenue: number;
  rating: number;
  reviewCount: number;
  // Status
  isActive: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductPricing {
  currency: string;
  price: number;
  salePrice?: number;
  saleStartDate?: string;
  saleEndDate?: string;
  // Subscription pricing
  isRecurring?: boolean;
  interval?: 'monthly' | 'quarterly' | 'yearly';
  trialDays?: number;
  // Tiered pricing
  tiers?: PricingTier[];
  // Volume discounts
  volumeDiscounts?: VolumeDiscount[];
}

export interface PricingTier {
  name: string;
  price: number;
  features: string[];
  isPopular?: boolean;
}

export interface VolumeDiscount {
  minQuantity: number;
  maxQuantity?: number;
  discountPercent: number;
}

// ============================================
// Orders
// ============================================

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerEmail: string;
  customerName: string;
  // Items
  items: OrderItem[];
  // Pricing
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  currency: string;
  // Coupon
  couponCode?: string;
  couponDiscount?: number;
  // Payment
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  paymentIntentId?: string;
  // Status
  status: 'pending' | 'processing' | 'completed' | 'refunded' | 'cancelled';
  // Metadata
  notes?: string;
  ipAddress?: string;
  userAgent?: string;
  // Dates
  createdAt: string;
  completedAt?: string;
  refundedAt?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productType: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discount?: number;
  // Access
  courseId?: string;
  pathId?: string;
  enrollmentId?: string;
}

// ============================================
// Subscriptions
// ============================================

export interface Subscription {
  id: string;
  customerId: string;
  customerEmail: string;
  // Plan
  planId: string;
  planName: string;
  // Pricing
  price: number;
  currency: string;
  interval: 'monthly' | 'quarterly' | 'yearly';
  // Status
  status: SubscriptionStatus;
  // Dates
  startDate: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialStart?: string;
  trialEnd?: string;
  cancelledAt?: string;
  endedAt?: string;
  // Payment
  paymentMethodId?: string;
  stripeSubscriptionId?: string;
  // Usage (for metered billing)
  usage?: {
    learners: number;
    maxLearners: number;
    storage: number;
    maxStorage: number;
  };
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  // Pricing
  monthlyPrice: number;
  yearlyPrice: number;
  currency: string;
  // Features
  features: PlanFeature[];
  limits: PlanLimits;
  // Display
  isPopular: boolean;
  order: number;
  badge?: string;
  // Stripe
  stripeMonthlyPriceId?: string;
  stripeYearlyPriceId?: string;
}

export interface PlanFeature {
  name: string;
  included: boolean;
  limit?: number | string;
  tooltip?: string;
}

export interface PlanLimits {
  maxLearners: number | null;
  maxCourses: number | null;
  maxStorageGb: number | null;
  maxAdmins: number | null;
}

// ============================================
// Coupons
// ============================================

export interface Coupon {
  id: string;
  code: string;
  name: string;
  description?: string;
  // Discount
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxDiscount?: number;
  // Applicability
  applicableTo: 'all' | 'specific';
  productIds?: string[];
  categoryIds?: string[];
  // Usage
  usageLimit?: number;
  usageLimitPerUser?: number;
  usedCount: number;
  // Requirements
  minOrderAmount?: number;
  firstPurchaseOnly: boolean;
  newUsersOnly: boolean;
  // Validity
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  // Metadata
  createdAt: string;
  createdBy: string;
}

export interface CouponUsage {
  id: string;
  couponId: string;
  couponCode: string;
  orderId: string;
  customerId: string;
  discountAmount: number;
  usedAt: string;
}

// ============================================
// Affiliates
// ============================================

export interface Affiliate {
  id: string;
  userId: string;
  // Profile
  name: string;
  email: string;
  website?: string;
  // Code
  affiliateCode: string;
  customLink?: string;
  // Commission
  commissionRate: number; // percentage
  commissionType: 'percentage' | 'fixed';
  // Stats
  totalClicks: number;
  totalConversions: number;
  totalRevenue: number;
  totalEarnings: number;
  totalPaid: number;
  pendingEarnings: number;
  conversionRate: number;
  // Payment
  payoutMethod: 'paypal' | 'bank' | 'stripe';
  payoutDetails?: Record<string, string>;
  minPayoutAmount: number;
  // Status
  status: 'pending' | 'active' | 'suspended';
  // Dates
  createdAt: string;
  approvedAt?: string;
}

export interface AffiliateClick {
  id: string;
  affiliateId: string;
  affiliateCode: string;
  visitorId: string;
  // Source
  sourceUrl?: string;
  landingPage: string;
  // Device
  ipAddress: string;
  userAgent: string;
  device: 'desktop' | 'mobile' | 'tablet';
  // Location
  country?: string;
  region?: string;
  // Conversion
  converted: boolean;
  orderId?: string;
  conversionValue?: number;
  commission?: number;
  // Dates
  clickedAt: string;
  convertedAt?: string;
}

export interface AffiliateCommission {
  id: string;
  affiliateId: string;
  orderId: string;
  orderAmount: number;
  commissionRate: number;
  commissionAmount: number;
  status: 'pending' | 'approved' | 'paid' | 'cancelled';
  // Dates
  createdAt: string;
  approvedAt?: string;
  paidAt?: string;
  payoutId?: string;
}

// ============================================
// Payouts (Instructor Revenue Share)
// ============================================

export interface InstructorPayout {
  id: string;
  instructorId: string;
  instructorName: string;
  instructorEmail: string;
  // Amount
  amount: number;
  currency: string;
  // Details
  periodStart: string;
  periodEnd: string;
  sales: PayoutSale[];
  totalSales: number;
  platformFee: number;
  netAmount: number;
  // Payment
  payoutMethod: string;
  payoutDetails?: Record<string, string>;
  // Status
  status: PayoutStatus;
  processedAt?: string;
  failureReason?: string;
  // Transaction
  transactionId?: string;
  // Dates
  createdAt: string;
}

export interface PayoutSale {
  orderId: string;
  productId: string;
  productName: string;
  saleDate: string;
  saleAmount: number;
  revenueShare: number;
  instructorAmount: number;
}

// ============================================
// Shopping Cart
// ============================================

export interface Cart {
  id: string;
  customerId?: string;
  sessionId: string;
  items: CartItem[];
  // Totals
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  currency: string;
  // Coupon
  couponCode?: string;
  couponDiscount?: number;
  // Dates
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
}

export interface CartItem {
  id: string;
  productId: string;
  productType: string;
  productName: string;
  productThumbnail: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  addedAt: string;
}

// ============================================
// Checkout
// ============================================

export interface CheckoutSession {
  id: string;
  cartId: string;
  customerId?: string;
  customerEmail?: string;
  // Billing
  billingAddress?: Address;
  // Payment
  paymentMethodId?: string;
  stripeSessionId?: string;
  // Status
  status: 'pending' | 'processing' | 'completed' | 'abandoned' | 'failed';
  // URLs
  successUrl: string;
  cancelUrl: string;
  // Dates
  createdAt: string;
  completedAt?: string;
  expiresAt: string;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

// ============================================
// B2B / Enterprise Sales
// ============================================

export interface B2BQuote {
  id: string;
  quoteNumber: string;
  // Customer
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  // Items
  items: B2BQuoteItem[];
  // Pricing
  subtotal: number;
  discount: number;
  total: number;
  currency: string;
  // Terms
  validUntil: string;
  paymentTerms: string;
  notes?: string;
  // Status
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  // Sales
  salesRepId?: string;
  // Dates
  createdAt: string;
  sentAt?: string;
  acceptedAt?: string;
}

export interface B2BQuoteItem {
  productId: string;
  productName: string;
  seats: number;
  pricePerSeat: number;
  discount?: number;
  total: number;
}

export interface SiteLicense {
  id: string;
  organizationId: string;
  organizationName: string;
  // License
  licenseType: 'seats' | 'unlimited';
  maxSeats?: number;
  usedSeats: number;
  // Products
  productIds: string[];
  includeAllCourses: boolean;
  // Validity
  startDate: string;
  endDate: string;
  // Pricing
  totalPrice: number;
  currency: string;
  // Status
  status: 'active' | 'expired' | 'cancelled';
  // Contract
  contractId?: string;
  poNumber?: string;
  // Dates
  createdAt: string;
}

// ============================================
// Analytics
// ============================================

export interface RevenueAnalytics {
  timeRange: {
    start: string;
    end: string;
  };
  // Overview
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  conversionRate: number;
  // Trends
  revenueByDay: { date: string; revenue: number; orders: number }[];
  // Breakdown
  revenueByProduct: { productId: string; productName: string; revenue: number; sales: number }[];
  revenueByCategory: { category: string; revenue: number; percentage: number }[];
  // Customers
  newCustomers: number;
  returningCustomers: number;
  // Refunds
  totalRefunds: number;
  refundRate: number;
}
