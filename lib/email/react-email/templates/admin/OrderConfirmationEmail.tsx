import {
  EmailButton,
  EmailLayout,
  H1,
  H2,
  InfoBox,
  InfoRow,
  MutedText,
  OrderSummary,
  Paragraph,
} from '../../components';
import { theme } from '../../theme';

// ============================================================================
// TYPES
// ============================================================================

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface OrderConfirmationEmailProps {
  /** Customer's first name */
  firstName: string;
  /** Order ID */
  orderId: string;
  /** Order date (formatted) */
  orderDate: string;
  /** Order items */
  items: OrderItem[];
  /** Subtotal */
  subtotal: number;
  /** Tax amount */
  tax: number;
  /** Total amount */
  total: number;
  /** Currency code */
  currency?: string;
  /** URL to view receipt */
  receiptUrl: string;
  /** URL to download invoice */
  invoiceUrl?: string;
  /** Payment method last 4 digits */
  paymentMethodLast4?: string;
  /** Billing address */
  billingAddress?: string;
  /** Optional unsubscribe URL */
  unsubscribeUrl?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function OrderConfirmationEmail({
  firstName,
  orderId,
  orderDate,
  items,
  subtotal,
  tax,
  total,
  currency = 'USD',
  receiptUrl,
  invoiceUrl,
  paymentMethodLast4,
  billingAddress,
  unsubscribeUrl,
}: OrderConfirmationEmailProps) {
  const previewText = `Order Confirmation #${orderId} - Thank you for your purchase!`;

  return (
    <EmailLayout preview={previewText} unsubscribeUrl={unsubscribeUrl}>
      <H1>Order Confirmation #{orderId}</H1>

      <Paragraph>Hi {firstName},</Paragraph>

      <Paragraph>Thank you for your order! Here's a summary of your purchase:</Paragraph>

      <InfoBox variant="success">
        <strong>Order placed successfully!</strong> We've received your payment.
      </InfoBox>

      <InfoRow label="Order Date" value={orderDate} />

      <H2>Order Summary</H2>
      <OrderSummary items={items} subtotal={subtotal} tax={tax} total={total} currency={currency} />

      {(paymentMethodLast4 || billingAddress) && (
        <>
          <H2>Payment Details</H2>
          {paymentMethodLast4 && (
            <InfoRow label="Payment Method" value={`•••• ${paymentMethodLast4}`} />
          )}
          {billingAddress && (
            <InfoRow label="Billing Address" value={billingAddress} showDivider={false} />
          )}
        </>
      )}

      <EmailButton href={receiptUrl}>View Receipt</EmailButton>

      {invoiceUrl && (
        <MutedText style={{ textAlign: 'center' }}>
          <a href={invoiceUrl} style={theme.styles.link}>
            Download Invoice (PDF)
          </a>
        </MutedText>
      )}

      <MutedText>
        If you have unknown questions about your order, please contact our support team.
      </MutedText>
    </EmailLayout>
  );
}

// ============================================================================
// PREVIEW DATA (for development)
// ============================================================================

OrderConfirmationEmail.PreviewProps = {
  firstName: 'Alex',
  orderId: 'ORD-2024-001234',
  orderDate: 'December 6, 2024',
  items: [
    { name: 'Professional Plan (Annual)', quantity: 1, price: 299 },
    { name: 'Token Pack - 10,000 Tokens', quantity: 1, price: 49 },
  ],
  subtotal: 348,
  tax: 27.84,
  total: 375.84,
  currency: 'USD',
  receiptUrl: 'https://lxd360.com/billing/receipts/abc123',
  invoiceUrl: 'https://lxd360.com/billing/invoices/abc123.pdf',
  paymentMethodLast4: '4242',
  billingAddress: '123 Main St, Austin, TX 78701',
} as OrderConfirmationEmailProps;

export default OrderConfirmationEmail;
