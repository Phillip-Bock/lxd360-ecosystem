/**
 * =============================================================================
 * LXP360-SaaS | Pricing Card Component
 * =============================================================================
 *
 * Displays a plan's pricing and features for subscription selection.
 */

'use client';

import { Check, Loader2 } from 'lucide-react';
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
import { formatPrice, PLANS, type PlanType } from '@/lib/stripe/config';
import { cn } from '@/lib/utils';

// =============================================================================
// TYPES
// =============================================================================

interface PricingCardProps {
  planType: PlanType;
  currentPlan?: PlanType;
  onSelectPlan: (planType: PlanType) => Promise<void>;
  isAnnual?: boolean;
  highlighted?: boolean;
  className?: string;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function PricingCard({
  planType,
  currentPlan,
  onSelectPlan,
  isAnnual = true,
  highlighted = false,
  className,
}: PricingCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const plan = PLANS[planType];
  const isCurrentPlan = currentPlan === planType;
  const isFree = planType === 'free';
  const isEnterprise = planType === 'enterprise';

  // Calculate display price
  const displayPrice = isAnnual
    ? plan.annualPrice !== null
      ? Math.round(plan.annualPrice / 12)
      : null
    : plan.monthlyPrice;

  const handleSelect = async () => {
    if (isCurrentPlan || isFree) return;

    setIsLoading(true);
    try {
      await onSelectPlan(planType);
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonText = () => {
    if (isLoading) return 'Processing...';
    if (isCurrentPlan) return 'Current Plan';
    if (isFree) return 'Free Forever';
    if (isEnterprise) return 'Contact Sales';
    if (currentPlan === 'free') return 'Start Free Trial';
    return 'Upgrade';
  };

  return (
    <Card
      className={cn(
        'relative flex flex-col',
        highlighted && 'border-primary shadow-lg scale-[1.02]',
        isCurrentPlan && 'ring-2 ring-primary',
        className,
      )}
    >
      {/* Popular badge */}
      {highlighted && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2" variant="default">
          Most Popular
        </Badge>
      )}

      {/* Current plan badge */}
      {isCurrentPlan && (
        <Badge className="absolute -top-3 right-4" variant="secondary">
          Current
        </Badge>
      )}

      <CardHeader>
        <CardTitle className="text-xl">{plan.name}</CardTitle>
        <CardDescription>{plan.description}</CardDescription>
      </CardHeader>

      <CardContent className="flex-1">
        {/* Price display */}
        <div className="mb-6">
          {displayPrice !== null ? (
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold">{formatPrice(displayPrice)}</span>
              <span className="text-muted-foreground">/month</span>
            </div>
          ) : (
            <div className="text-2xl font-bold">Custom Pricing</div>
          )}

          {isAnnual && plan.annualPrice !== null && (
            <p className="text-sm text-muted-foreground mt-1">
              Billed annually ({formatPrice(plan.annualPrice)}/year)
            </p>
          )}

          {isAnnual && plan.monthlyPrice !== null && plan.annualPrice !== null && (
            <Badge variant="secondary" className="mt-2">
              Save {Math.round((1 - plan.annualPrice / (plan.monthlyPrice * 12)) * 100)}%
            </Badge>
          )}
        </div>

        {/* Features list */}
        <ul className="space-y-3">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          variant={highlighted ? 'default' : 'outline'}
          size="lg"
          disabled={isCurrentPlan || isLoading || (isFree && currentPlan !== 'free')}
          onClick={handleSelect}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {getButtonText()}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default PricingCard;
