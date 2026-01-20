import { EmailButton, EmailLayout, H1, InfoBox, MutedText, Paragraph } from '../../components';
import { theme } from '../../theme';

// ============================================================================
// TYPES
// ============================================================================

export interface MagicLinkEmailProps {
  /** User's email address */
  email: string;
  /** Magic link URL */
  magicLinkUrl: string;
  /** When the link expires */
  expiresIn: string;
  /** Optional: OTP code if using code-based auth */
  otpCode?: string;
  /** Optional unsubscribe URL */
  unsubscribeUrl?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function MagicLinkEmail({
  email,
  magicLinkUrl,
  expiresIn,
  otpCode,
  unsubscribeUrl,
}: MagicLinkEmailProps) {
  const previewText = `Sign in to your LXD360 account`;

  return (
    <EmailLayout preview={previewText} unsubscribeUrl={unsubscribeUrl}>
      <H1>Sign In to LXD360</H1>

      <Paragraph>
        Click the button below to sign in to your account. This link will expire in {expiresIn}.
      </Paragraph>

      <EmailButton href={magicLinkUrl}>Sign In</EmailButton>

      {otpCode && (
        <>
          <Paragraph style={{ textAlign: 'center', marginTop: theme.spacing[6] }}>
            Or enter this code:
          </Paragraph>
          <InfoBox variant="default">
            <div
              style={{
                fontFamily: theme.typography.monoFontFamily,
                fontSize: theme.typography.sizes['2xl'],
                fontWeight: theme.typography.weights.bold,
                letterSpacing: '0.5em',
                textAlign: 'center',
              }}
            >
              {otpCode}
            </div>
          </InfoBox>
        </>
      )}

      <MutedText>
        If you didn't request this email, you can safely ignore it. Your account is secure.
      </MutedText>

      <MutedText>
        This sign-in link was requested for <strong>{email}</strong>. For security reasons, this
        link can only be used once.
      </MutedText>
    </EmailLayout>
  );
}

// ============================================================================
// PREVIEW DATA (for development)
// ============================================================================

MagicLinkEmail.PreviewProps = {
  email: 'alex@example.com',
  magicLinkUrl: 'https://lxd360.com/auth/magic-link?token=abc123',
  expiresIn: '15 minutes',
  otpCode: '123456',
} as MagicLinkEmailProps;

export default MagicLinkEmail;
