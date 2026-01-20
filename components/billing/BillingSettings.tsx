/**
 * =============================================================================
 * LXP360-SaaS | Billing Settings Component
 * =============================================================================
 *
 * Complete billing management interface with subscription status,
 * plan selection, and invoice history.
 */

'use client';

import {
  AlertCircle,
  CheckCircle2,
  CreditCard,
  Download,
  ExternalLink,
  Loader2,
  Receipt,
  XCircle,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  cancelSubscription,
  createCheckoutAndRedirect,
  getSubscriptionData,
  redirectToCustomerPortal,
  resumeSubscription,
  type SubscriptionData,
} from '@/lib/stripe/client';
import { formatPrice, PLANS, type PlanType } from '@/lib/stripe/config';
import { cn } from '@/lib/utils';
import { PricingCard } from './PricingCard';

// =============================================================================
// COMPONENT
// =============================================================================

export function BillingSettings() {
  const [billingData, setBillingData] = useState<SubscriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnnual, setIsAnnual] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Fetch billing data function
  const fetchBillingData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getSubscriptionData();
      setBillingData(data);
    } catch (err) {
      setError('Failed to load billing information');
      console.error('Failed to fetch billing data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch billing data on mount
  useEffect(() => {
    fetchBillingData();
  }, [fetchBillingData]);

  const handleSelectPlan = async (planType: PlanType) => {
    setError(null);
    try {
      await createCheckoutAndRedirect(planType as 'professional' | 'enterprise');
    } catch (err) {
      setError('Failed to start checkout. Please try again.');
      console.error('Checkout error:', err);
    }
  };

  const handleManageBilling = async () => {
    setActionLoading('portal');
    setError(null);
    try {
      await redirectToCustomerPortal();
    } catch (err) {
      setError('Failed to open billing portal. Please try again.');
      console.error('Portal error:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelSubscription = async () => {
    setActionLoading('cancel');
    setError(null);
    try {
      await cancelSubscription();
      await fetchBillingData();
    } catch (err) {
      setError('Failed to cancel subscription. Please try again.');
      console.error('Cancel error:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleResumeSubscription = async () => {
    setActionLoading('resume');
    setError(null);
    try {
      await resumeSubscription();
      await fetchBillingData();
    } catch (err) {
      setError('Failed to resume subscription. Please try again.');
      console.error('Resume error:', err);
    } finally {
      setActionLoading(null);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid md:grid-cols-3 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  const currentPlan = (billingData?.plan || 'free') as PlanType;
  const subscription = billingData?.subscription;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <div className="space-y-8">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Current Plan Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Current Plan
          </CardTitle>
          <CardDescription>Manage your subscription and billing settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold">{PLANS[currentPlan].name}</p>
                <Badge variant={subscription?.status === 'active' ? 'default' : 'secondary'}>
                  {subscription?.status || 'Free'}
                </Badge>
              </div>
              {subscription && (
                <p className="text-sm text-muted-foreground mt-1">
                  {subscription.cancel_at_period_end
                    ? `Access until ${formatDate(subscription.current_period_end)}`
                    : `Renews on ${formatDate(subscription.current_period_end)}`}
                </p>
              )}
              {subscription?.trial_end && new Date(subscription.trial_end) > new Date() && (
                <p className="text-sm text-brand-blue mt-1">
                  Trial ends on {formatDate(subscription.trial_end)}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              {subscription && (
                <>
                  <Button
                    variant="outline"
                    onClick={handleManageBilling}
                    disabled={actionLoading === 'portal'}
                  >
                    {actionLoading === 'portal' && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Manage Billing
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                  {!subscription.cancel_at_period_end && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" disabled={actionLoading === 'cancel'}>
                          {actionLoading === 'cancel' && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Cancel
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to cancel your subscription? You will retain
                            access until the end of your billing period.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>No, keep subscription</AlertDialogCancel>
                          <AlertDialogAction onClick={handleCancelSubscription}>
                            Yes, cancel subscription
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Cancellation Notice */}
          {subscription?.cancel_at_period_end && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Subscription Canceling</AlertTitle>
              <AlertDescription className="flex items-center justify-between">
                <span>
                  Your subscription will end on {formatDate(subscription.current_period_end)}.
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResumeSubscription}
                  disabled={actionLoading === 'resume'}
                >
                  {actionLoading === 'resume' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Resume Subscription
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Pricing Plans */}
      <div>
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">Choose Your Plan</h2>
          <p className="text-muted-foreground mb-4">Select the plan that best fits your needs</p>

          {/* Billing period toggle */}
          <div className="inline-flex items-center gap-4 p-1 bg-muted rounded-lg">
            <button
              type="button"
              className={cn(
                'px-4 py-2 rounded-md text-sm font-medium transition',
                !isAnnual && 'bg-background shadow',
              )}
              onClick={() => setIsAnnual(false)}
            >
              Monthly
            </button>
            <button
              type="button"
              className={cn(
                'px-4 py-2 rounded-md text-sm font-medium transition',
                isAnnual && 'bg-background shadow',
              )}
              onClick={() => setIsAnnual(true)}
            >
              Annual
              <Badge variant="secondary" className="ml-2">
                Save 20%
              </Badge>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <PricingCard
            planType="free"
            currentPlan={currentPlan}
            onSelectPlan={handleSelectPlan}
            isAnnual={isAnnual}
          />
          <PricingCard
            planType="professional"
            currentPlan={currentPlan}
            onSelectPlan={handleSelectPlan}
            isAnnual={isAnnual}
            highlighted
          />
          <PricingCard
            planType="enterprise"
            currentPlan={currentPlan}
            onSelectPlan={handleSelectPlan}
            isAnnual={isAnnual}
          />
        </div>
      </div>

      {/* Invoice History */}
      {billingData?.invoices && billingData.invoices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Invoice History
            </CardTitle>
            <CardDescription>View and download your past invoices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {billingData.invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between py-3 border-b last:border-0"
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-medium">
                        {formatPrice(invoice.amount / 100, invoice.currency)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(invoice.date * 1000).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={invoice.status === 'paid' ? 'default' : 'secondary'}
                      className={cn(
                        invoice.status === 'paid' && 'bg-green-100 text-green-800',
                        invoice.status === 'open' && 'bg-yellow-100 text-yellow-800',
                      )}
                    >
                      {invoice.status === 'paid' && <CheckCircle2 className="mr-1 h-3 w-3" />}
                      {invoice.status === 'open' && <AlertCircle className="mr-1 h-3 w-3" />}
                      {invoice.status === 'void' && <XCircle className="mr-1 h-3 w-3" />}
                      {invoice.status}
                    </Badge>
                    {invoice.invoicePdf && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={invoice.invoicePdf} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    {invoice.hostedUrl && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={invoice.hostedUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Invoice */}
      {billingData?.upcomingInvoice && (
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">
                  {formatPrice(
                    billingData.upcomingInvoice.amount / 100,
                    billingData.upcomingInvoice.currency,
                  )}
                </p>
                {billingData.upcomingInvoice.dueDate && (
                  <p className="text-sm text-muted-foreground">
                    Due on{' '}
                    {new Date(billingData.upcomingInvoice.dueDate * 1000).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default BillingSettings;
