import { EmailButton, EmailLayout, H1, InfoBox, MutedText, Paragraph } from '../../components';

// ============================================================================
// TYPES
// ============================================================================

export interface PasswordResetEmailProps {
  /** User's first name */
  firstName: string;
  /** Password reset URL */
  resetUrl: string;
  /** When the link expires (formatted string) */
  expiresAt: string;
  /** Optional unsubscribe URL */
  unsubscribeUrl?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function PasswordResetEmail({
  firstName,
  resetUrl,
  expiresAt,
  unsubscribeUrl,
}: PasswordResetEmailProps) {
  const previewText = `Reset your LXD360 password`;

  return (
    <EmailLayout preview={previewText} unsubscribeUrl={unsubscribeUrl}>
      <H1>Reset Your Password</H1>

      <Paragraph>Hi {firstName},</Paragraph>

      <Paragraph>
        We received a request to reset your password. Click the button below to create a new
        password:
      </Paragraph>

      <EmailButton href={resetUrl}>Reset Password</EmailButton>

      <InfoBox variant="warning">
        This link will expire on <strong>{expiresAt}</strong>. If you didn't request a password
        reset, you can safely ignore this email.
      </InfoBox>

      <MutedText>
        For security reasons, this link can only be used once. If you need to reset your password
        again, please request a new link from the login page.
      </MutedText>
    </EmailLayout>
  );
}

// ============================================================================
// PREVIEW DATA (for development)
// ============================================================================

PasswordResetEmail.PreviewProps = {
  firstName: 'Alex',
  resetUrl: 'https://lxd360.com/reset-password?token=abc123',
  expiresAt: 'December 7, 2024 at 3:00 PM',
} as PasswordResetEmailProps;

export default PasswordResetEmail;
