'use client';

import { Check, CreditCard, Download, FileText, HelpCircle, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

/**
 * Billing Page - Subscription Management & Invoices
 *
 * Based on BillingSDK patterns from https://billingsdk.com
 * Integrates with Stripe for payment processing
 *
 * TODO(LXD-311): Connect to Stripe API for real subscription data
 */

// =============================================================================
// TYPES
// =============================================================================

interface PricingTier {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  highlighted?: boolean;
  badge?: string;
}

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  description: string;
}

// =============================================================================
// MOCK DATA — Replace with Stripe API calls
// =============================================================================

const PRICING_TIERS: PricingTier[] = [
  {
    id: 'ignite-essentials',
    name: 'IGNITE Essentials',
    description: 'Perfect for small teams getting started with learning',
    monthlyPrice: 299,
    yearlyPrice: 2990,
    features: [
      'Up to 50 learners',
      'Unlimited courses',
      'Basic analytics',
      'Email support',
      'SCORM 1.2/2004 support',
      'Mobile responsive',
    ],
  },
  {
    id: 'ignite-professional',
    name: 'IGNITE Professional',
    description: 'Advanced features for growing organizations',
    monthlyPrice: 799,
    yearlyPrice: 7990,
    highlighted: true,
    badge: 'Most Popular',
    features: [
      'Up to 250 learners',
      'Everything in Essentials',
      'Advanced analytics & reporting',
      'xAPI/cmi5 support',
      'Priority support',
      'Custom branding',
      'API access',
      'SSO integration',
    ],
  },
  {
    id: 'ignite-enterprise',
    name: 'IGNITE Enterprise',
    description: 'Full platform for large organizations',
    monthlyPrice: 1999,
    yearlyPrice: 19990,
    features: [
      'Unlimited learners',
      'Everything in Professional',
      'Dedicated success manager',
      'Custom integrations',
      'SLA guarantee',
      'On-premise option',
      'Advanced security',
      'Multi-tenant support',
    ],
  },
];

const MOCK_INVOICES: Invoice[] = [
  {
    id: 'inv_001',
    date: '2026-01-15',
    amount: 799,
    status: 'paid',
    description: 'IGNITE Professional - January 2026',
  },
  {
    id: 'inv_002',
    date: '2025-12-15',
    amount: 799,
    status: 'paid',
    description: 'IGNITE Professional - December 2025',
  },
  {
    id: 'inv_003',
    date: '2025-11-15',
    amount: 799,
    status: 'paid',
    description: 'IGNITE Professional - November 2025',
  },
];

// =============================================================================
// COMPONENTS
// =============================================================================

interface PricingCardProps {
  tier: PricingTier;
  billingCycle: 'monthly' | 'yearly';
  currentPlan?: boolean;
  onSelect: (tierId: string) => void;
}

function PricingCard({ tier, billingCycle, currentPlan, onSelect }: PricingCardProps) {
  const price = billingCycle === 'monthly' ? tier.monthlyPrice : tier.yearlyPrice;
  const period = billingCycle === 'monthly' ? '/mo' : '/yr';
  const savings =
    billingCycle === 'yearly'
      ? Math.round((1 - tier.yearlyPrice / (tier.monthlyPrice * 12)) * 100)
      : 0;

  return (
    <Card
      className={cn(
        'relative flex flex-col transition-all duration-200',
        tier.highlighted && 'border-lxd-primary shadow-lg shadow-lxd-primary/10',
        currentPlan && 'ring-2 ring-lxd-primary',
      )}
    >
      {tier.badge && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-lxd-primary text-white">
          {tier.badge}
        </Badge>
      )}

      <CardHeader className="text-center pb-2">
        <CardTitle className="text-xl">{tier.name}</CardTitle>
        <CardDescription className="min-h-[40px]">{tier.description}</CardDescription>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="text-center mb-6">
          <span className="text-4xl font-bold text-foreground">${price.toLocaleString()}</span>
          <span className="text-muted-foreground">{period}</span>
          {savings > 0 && (
            <Badge
              variant="secondary"
              className="ml-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
            >
              Save {savings}%
            </Badge>
          )}
        </div>

        <ul className="space-y-3">
          {tier.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2 text-sm">
              <Check className="h-4 w-4 text-lxd-primary shrink-0 mt-0.5" />
              <span className="text-muted-foreground">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        {currentPlan ? (
          <Button type="button" disabled className="w-full">
            Current Plan
          </Button>
        ) : (
          <Button
            type="button"
            onClick={() => onSelect(tier.id)}
            variant={tier.highlighted ? 'default' : 'outline'}
            className={cn('w-full', tier.highlighted && 'bg-lxd-primary hover:bg-lxd-primary/90')}
          >
            {tier.monthlyPrice > 799 ? 'Contact Sales' : 'Upgrade'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

function InvoiceRow({ invoice }: { invoice: Invoice }) {
  const statusColors = {
    paid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };

  return (
    <div className="flex items-center justify-between py-4 border-b border-border last:border-0">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
          <FileText className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <p className="font-medium text-foreground">{invoice.description}</p>
          <p className="text-sm text-muted-foreground">
            {new Date(invoice.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Badge className={statusColors[invoice.status]}>
          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
        </Badge>
        <span className="font-medium text-foreground w-20 text-right">
          ${invoice.amount.toLocaleString()}
        </span>
        <Button type="button" variant="ghost" size="icon" aria-label="Download invoice">
          <Download className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// =============================================================================
// PAGE COMPONENT
// =============================================================================

export default function BillingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  // TODO(LXD-311): Fetch real subscription data from Stripe
  const currentPlanId = 'ignite-professional';
  const invoices = MOCK_INVOICES;

  const handlePlanSelect = (tierId: string) => {
    // TODO(LXD-311): Implement Stripe checkout session creation
    // For enterprise, open contact form
    if (tierId === 'ignite-enterprise') {
      window.open('mailto:sales@lxd360.com?subject=Enterprise%20Inquiry', '_blank');
    }
    // Non-enterprise plans will redirect to Stripe checkout when implemented
  };

  const handleManageSubscription = () => {
    // TODO(LXD-311): Open Stripe Customer Portal
    // Will redirect to Stripe Customer Portal when implemented
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Billing & Subscription
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your subscription, payment methods, and invoices.
        </p>
      </div>

      {/* Current Plan Summary */}
      <Card className="bg-gradient-to-r from-lxd-primary/10 to-lxd-secondary/10 border-lxd-primary/20">
        <CardContent className="flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-lxd-primary/20 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-lxd-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Current Plan</p>
              <p className="text-xl font-bold text-foreground">IGNITE Professional</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Next billing date</p>
              <p className="font-medium text-foreground">February 15, 2026</p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleManageSubscription}
              className="border-lxd-primary text-lxd-primary hover:bg-lxd-primary/10"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Manage
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Plans and Invoices */}
      <Tabs defaultValue="plans" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="plans">Plans & Pricing</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
        </TabsList>

        {/* Plans Tab */}
        <TabsContent value="plans" className="space-y-6">
          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4">
            <span
              className={cn(
                'text-sm font-medium',
                billingCycle === 'monthly' ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              Monthly
            </span>
            <button
              type="button"
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className={cn(
                'relative h-6 w-11 rounded-full transition-colors',
                billingCycle === 'yearly' ? 'bg-lxd-primary' : 'bg-muted',
              )}
              aria-label="Toggle billing cycle"
            >
              <span
                className={cn(
                  'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform',
                  billingCycle === 'yearly' && 'translate-x-5',
                )}
              />
            </button>
            <span
              className={cn(
                'text-sm font-medium',
                billingCycle === 'yearly' ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              Yearly
              <Badge
                variant="secondary"
                className="ml-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              >
                Save up to 17%
              </Badge>
            </span>
          </div>

          {/* Pricing Cards */}
          <div className="grid gap-6 md:grid-cols-3">
            {PRICING_TIERS.map((tier) => (
              <PricingCard
                key={tier.id}
                tier={tier}
                billingCycle={billingCycle}
                currentPlan={tier.id === currentPlanId}
                onSelect={handlePlanSelect}
              />
            ))}
          </div>

          {/* Enterprise CTA */}
          <Card className="bg-muted/50">
            <CardContent className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <HelpCircle className="h-6 w-6 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">Need a custom solution?</p>
                  <p className="text-sm text-muted-foreground">
                    Contact our sales team for custom pricing and enterprise features.
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => window.open('mailto:sales@lxd360.com', '_blank')}
              >
                Contact Sales
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Invoice History</CardTitle>
              <CardDescription>Download past invoices and view payment history.</CardDescription>
            </CardHeader>
            <CardContent>
              {invoices.length > 0 ? (
                <div>
                  {invoices.map((invoice) => (
                    <InvoiceRow key={invoice.id} invoice={invoice} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No invoices yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
