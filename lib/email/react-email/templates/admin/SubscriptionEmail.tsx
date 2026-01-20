import {
  EmailButton,
  EmailLayout,
  H1,
  H2,
  InfoBox,
  InfoRow,
  MutedText,
  Paragraph,
} from '../../components';
import { theme } from '../../theme';

// ============================================================================
// SUBSCRIPTION CREATED EMAIL
// ============================================================================

export interface SubscriptionCreatedEmailProps {
  /** Customer's first name */
  firstName: string;
  /** Plan name */
  planName: string;
  /** Next billing date */
  nextBillingDate: string;
  /** Billing amount */
  amount?: number;
  /** Currency */
  currency?: string;
  /** Billing interval */
  billingInterval?: 'monthly' | 'yearly';
  /** Dashboard URL */
  dashboardUrl: string;
  /** Features included */
  features?: string[];
  /** Optional unsubscribe URL */
  unsubscribeUrl?: string;
}

export function SubscriptionCreatedEmail({
  firstName,
  planName,
  nextBillingDate,
  amount,
  currency = 'USD',
  billingInterval,
  dashboardUrl,
  features,
  unsubscribeUrl,
}: SubscriptionCreatedEmailProps) {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  });

  const previewText = `Welcome to ${planName}! Your subscription is now active.`;

  return (
    <EmailLayout preview={previewText} unsubscribeUrl={unsubscribeUrl}>
      <H1>Welcome to Your Subscription!</H1>

      <Paragraph>Hi {firstName},</Paragraph>

      <Paragraph>
        Your <strong>{planName}</strong> subscription is now active. Welcome aboard!
      </Paragraph>

      <InfoBox variant="success">
        <InfoRow label="Plan" value={planName} />
        {amount && (
          <InfoRow
            label="Amount"
            value={`${formatter.format(amount)}${billingInterval ? ` / ${billingInterval === 'monthly' ? 'month' : 'year'}` : ''}`}
          />
        )}
        <InfoRow label="Next Billing Date" value={nextBillingDate} showDivider={false} />
      </InfoBox>

      {features && features.length > 0 && (
        <>
          <H2>What's Included</H2>
          <ul
            style={{
              color: theme.colors.gray[700],
              lineHeight: theme.typography.lineHeights.relaxed,
              paddingLeft: theme.spacing[5],
            }}
          >
            {features.map((feature, index) => (
              <li key={index} style={{ marginBottom: theme.spacing[2] }}>
                {feature}
              </li>
            ))}
          </ul>
        </>
      )}

      <Paragraph>You now have access to all the features included in your plan.</Paragraph>

      <EmailButton href={dashboardUrl}>Go to Dashboard</EmailButton>
    </EmailLayout>
  );
}

// ============================================================================
// SUBSCRIPTION RENEWED EMAIL
// ============================================================================

export interface SubscriptionRenewedEmailProps {
  /** Customer's first name */
  firstName: string;
  /** Plan name */
  planName: string;
  /** Amount charged */
  amount: number;
  /** Currency */
  currency?: string;
  /** Next billing date */
  nextBillingDate: string;
  /** Receipt URL */
  receiptUrl?: string;
  /** Optional unsubscribe URL */
  unsubscribeUrl?: string;
}

export function SubscriptionRenewedEmail({
  firstName,
  planName,
  amount,
  currency = 'USD',
  nextBillingDate,
  receiptUrl,
  unsubscribeUrl,
}: SubscriptionRenewedEmailProps) {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  });

  const previewText = `Your ${planName} subscription has been renewed`;

  return (
    <EmailLayout preview={previewText} unsubscribeUrl={unsubscribeUrl}>
      <H1>Subscription Renewed</H1>

      <Paragraph>Hi {firstName},</Paragraph>

      <Paragraph>
        Your <strong>{planName}</strong> subscription has been successfully renewed.
      </Paragraph>

      <InfoBox variant="default">
        <InfoRow label="Plan" value={planName} />
        <InfoRow label="Amount Charged" value={formatter.format(amount)} />
        <InfoRow label="Next Billing Date" value={nextBillingDate} showDivider={false} />
      </InfoBox>

      <MutedText>Thank you for continuing to be a valued subscriber.</MutedText>

      {receiptUrl && (
        <MutedText style={{ textAlign: 'center' }}>
          <a href={receiptUrl} style={theme.styles.link}>
            View Receipt
          </a>
        </MutedText>
      )}
    </EmailLayout>
  );
}

// ============================================================================
// SUBSCRIPTION CANCELED EMAIL
// ============================================================================

export interface SubscriptionCanceledEmailProps {
  /** Customer's first name */
  firstName: string;
  /** Plan name */
  planName: string;
  /** Date access ends */
  endDate: string;
  /** URL to resubscribe */
  resubscribeUrl: string;
  /** URL for feedback */
  feedbackUrl?: string;
  /** Optional unsubscribe URL */
  unsubscribeUrl?: string;
}

export function SubscriptionCanceledEmail({
  firstName,
  planName,
  endDate,
  resubscribeUrl,
  feedbackUrl,
  unsubscribeUrl,
}: SubscriptionCanceledEmailProps) {
  const previewText = `Your ${planName} subscription has been canceled`;

  return (
    <EmailLayout preview={previewText} unsubscribeUrl={unsubscribeUrl}>
      <H1>Subscription Canceled</H1>

      <Paragraph>Hi {firstName},</Paragraph>

      <Paragraph>
        Your <strong>{planName}</strong> subscription has been canceled as requested.
      </Paragraph>

      <InfoBox variant="warning">
        You'll continue to have access until <strong>{endDate}</strong>. After that date, your
        access will be removed.
      </InfoBox>

      <Paragraph>
        We're sorry to see you go. If you change your mind, you can resubscribe at unknown time.
      </Paragraph>

      <EmailButton href={resubscribeUrl}>Resubscribe</EmailButton>

      {feedbackUrl && (
        <MutedText>
          We'd love to hear why you canceled.{' '}
          <a href={feedbackUrl} style={theme.styles.link}>
            Share your feedback
          </a>{' '}
          to help us improve.
        </MutedText>
      )}
    </EmailLayout>
  );
}

// ============================================================================
// SUBSCRIPTION EXPIRING EMAIL
// ============================================================================

export interface SubscriptionExpiringEmailProps {
  /** Customer's first name */
  firstName: string;
  /** Plan name */
  planName: string;
  /** Expiry date */
  expiryDate: string;
  /** Days until expiry */
  daysUntilExpiry: number;
  /** URL to renew */
  renewUrl: string;
  /** Optional unsubscribe URL */
  unsubscribeUrl?: string;
}

export function SubscriptionExpiringEmail({
  firstName,
  planName,
  expiryDate,
  daysUntilExpiry,
  renewUrl,
  unsubscribeUrl,
}: SubscriptionExpiringEmailProps) {
  const previewText = `Your ${planName} subscription expires in ${daysUntilExpiry} days`;

  return (
    <EmailLayout preview={previewText} unsubscribeUrl={unsubscribeUrl}>
      <H1>Your Subscription is Expiring Soon</H1>

      <Paragraph>Hi {firstName},</Paragraph>

      <Paragraph>
        Your <strong>{planName}</strong> subscription is set to expire on{' '}
        <strong>{expiryDate}</strong> ({daysUntilExpiry} days from now).
      </Paragraph>

      <InfoBox variant="warning">
        Renew now to keep uninterrupted access to all your features and content.
      </InfoBox>

      <EmailButton href={renewUrl}>Renew Subscription</EmailButton>

      <MutedText>
        If you've already renewed or have questions, please contact our support team.
      </MutedText>
    </EmailLayout>
  );
}

// ============================================================================
// PREVIEW DATA (for development)
// ============================================================================

SubscriptionCreatedEmail.PreviewProps = {
  firstName: 'Alex',
  planName: 'Professional Plan',
  nextBillingDate: 'January 6, 2025',
  amount: 29.99,
  currency: 'USD',
  billingInterval: 'monthly',
  dashboardUrl: 'https://lxd360.com/dashboard',
  features: [
    'Unlimited course access',
    'AI-powered learning recommendations',
    'Certificate generation',
    'Priority support',
  ],
} as SubscriptionCreatedEmailProps;

SubscriptionRenewedEmail.PreviewProps = {
  firstName: 'Alex',
  planName: 'Professional Plan',
  amount: 29.99,
  currency: 'USD',
  nextBillingDate: 'February 6, 2025',
  receiptUrl: 'https://lxd360.com/billing/receipts/abc123',
} as SubscriptionRenewedEmailProps;

SubscriptionCanceledEmail.PreviewProps = {
  firstName: 'Alex',
  planName: 'Professional Plan',
  endDate: 'January 6, 2025',
  resubscribeUrl: 'https://lxd360.com/pricing',
  feedbackUrl: 'https://lxd360.com/feedback',
} as SubscriptionCanceledEmailProps;

SubscriptionExpiringEmail.PreviewProps = {
  firstName: 'Alex',
  planName: 'Professional Plan',
  expiryDate: 'December 13, 2024',
  daysUntilExpiry: 7,
  renewUrl: 'https://lxd360.com/billing/renew',
} as SubscriptionExpiringEmailProps;
