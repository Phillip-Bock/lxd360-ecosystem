import { EmailButton, EmailLayout, H1, MutedText, Paragraph } from '../../components';

// ============================================================================
// TYPES
// ============================================================================

export interface EmailVerificationEmailProps {
  /** User's first name */
  firstName: string;
  /** Email verification URL */
  verifyUrl: string;
  /** Optional: When the link expires */
  expiresAt?: string;
  /** Optional unsubscribe URL */
  unsubscribeUrl?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function EmailVerificationEmail({
  firstName,
  verifyUrl,
  expiresAt,
  unsubscribeUrl,
}: EmailVerificationEmailProps) {
  const previewText = `Verify your email address to complete your LXD360 account setup`;

  return (
    <EmailLayout preview={previewText} unsubscribeUrl={unsubscribeUrl}>
      <H1>Verify Your Email Address</H1>

      <Paragraph>Hi {firstName},</Paragraph>

      <Paragraph>
        Please verify your email address to complete your account setup and ensure you receive
        important updates about your courses, connections, and projects.
      </Paragraph>

      <EmailButton href={verifyUrl}>Verify Email</EmailButton>

      {expiresAt && <MutedText>This verification link will expire on {expiresAt}.</MutedText>}

      <MutedText>
        If you didn't create an account with LXD360, you can safely ignore this email.
      </MutedText>
    </EmailLayout>
  );
}

// ============================================================================
// PREVIEW DATA (for development)
// ============================================================================

EmailVerificationEmail.PreviewProps = {
  firstName: 'Alex',
  verifyUrl: 'https://lxd360.com/verify-email?token=abc123',
  expiresAt: 'December 8, 2024',
} as EmailVerificationEmailProps;

export default EmailVerificationEmail;
