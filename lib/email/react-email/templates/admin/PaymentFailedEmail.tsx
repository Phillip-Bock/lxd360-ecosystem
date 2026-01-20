import {
  EmailButton,
  EmailLayout,
  H1,
  InfoBox,
  InfoRow,
  MutedText,
  Paragraph,
} from '../../components';

// ============================================================================
// TYPES
// ============================================================================

export interface PaymentFailedEmailProps {
  /** Customer's first name */
  firstName: string;
  /** Amount that failed */
  amount: number;
  /** Currency code */
  currency?: string;
  /** Failure reason */
  reason: string;
  /** Subscription name (if applicable) */
  subscriptionName?: string;
  /** URL to update payment method */
  updatePaymentUrl: string;
  /** URL to contact support */
  supportUrl?: string;
  /** Date of next retry (if applicable) */
  retryDate?: string;
  /** Number of retry attempts remaining */
  retriesRemaining?: number;
  /** Optional unsubscribe URL */
  unsubscribeUrl?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function PaymentFailedEmail({
  firstName,
  amount,
  currency = 'USD',
  reason,
  subscriptionName,
  updatePaymentUrl,
  supportUrl,
  retryDate,
  retriesRemaining,
  unsubscribeUrl,
}: PaymentFailedEmailProps) {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  });

  const previewText = `Action required: Payment of ${formatter.format(amount)} failed`;

  return (
    <EmailLayout preview={previewText} unsubscribeUrl={unsubscribeUrl}>
      <H1>Payment Failed - Action Required</H1>

      <Paragraph>Hi {firstName},</Paragraph>

      <Paragraph>
        We were unable to process your payment of <strong>{formatter.format(amount)}</strong>
        {subscriptionName && ` for ${subscriptionName}`}.
      </Paragraph>

      <InfoBox variant="error">
        <InfoRow label="Amount" value={formatter.format(amount)} />
        <InfoRow label="Reason" value={reason} showDivider={false} />
      </InfoBox>

      <Paragraph>
        <strong>
          Please update your payment method to avoid unknown interruption to your service.
        </strong>
      </Paragraph>

      <EmailButton href={updatePaymentUrl}>Update Payment Method</EmailButton>

      {retryDate && (
        <InfoBox variant="warning">
          We'll automatically retry the payment on <strong>{retryDate}</strong>.
          {retriesRemaining !== undefined && <> ({retriesRemaining} retries remaining)</>}
        </InfoBox>
      )}

      {supportUrl && (
        <MutedText>
          If you believe this is an error or need assistance, please{' '}
          <a href={supportUrl}>contact our support team</a>.
        </MutedText>
      )}
    </EmailLayout>
  );
}

// ============================================================================
// PREVIEW DATA (for development)
// ============================================================================

PaymentFailedEmail.PreviewProps = {
  firstName: 'Alex',
  amount: 29.99,
  currency: 'USD',
  reason: 'Card declined - insufficient funds',
  subscriptionName: 'Professional Plan',
  updatePaymentUrl: 'https://lxd360.com/billing/payment-methods',
  supportUrl: 'https://lxd360.com/support',
  retryDate: 'December 9, 2024',
  retriesRemaining: 2,
} as PaymentFailedEmailProps;

export default PaymentFailedEmail;
