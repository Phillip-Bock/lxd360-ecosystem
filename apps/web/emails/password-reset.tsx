/**
 * =============================================================================
 * LXP360-SaaS | Password Reset Email Template
 * =============================================================================
 *
 * Sent when a user requests a password reset
 */

import { Button, Section, Text } from '@react-email/components';
import {
  BaseLayout,
  buttonPrimary,
  colors,
  heading,
  mutedParagraph,
  paragraph,
  warningBox,
} from './components/base-layout';

interface PasswordResetEmailProps {
  firstName: string;
  resetUrl: string;
  expiresIn?: string;
  ipAddress?: string;
  userAgent?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lxd360.com';

export function PasswordResetEmail({
  firstName = 'there',
  resetUrl = `${baseUrl}/auth/reset-password?token=example`,
  expiresIn = '1 hour',
  ipAddress,
  userAgent,
}: PasswordResetEmailProps) {
  return (
    <BaseLayout preview={`Reset your LXD360 password - Link expires in ${expiresIn}`}>
      <Text style={heading}>Reset Your Password</Text>

      <Text style={paragraph}>Hi {firstName},</Text>

      <Text style={paragraph}>
        We received a request to reset the password for your LXD360 account. Click the button below
        to create a new password:
      </Text>

      <Section style={buttonContainer}>
        <Button href={resetUrl} style={buttonPrimary}>
          Reset Password
        </Button>
      </Section>

      <Section style={warningBox}>
        <Text style={warningText}>
          <strong>⏰ This link expires in {expiresIn}.</strong>
          <br />
          For security reasons, password reset links are only valid for a limited time.
        </Text>
      </Section>

      <Text style={paragraph}>
        If the button above doesn&apos;t work, copy and paste this URL into your browser:
      </Text>

      <Section style={urlBox}>
        <code style={urlText}>{resetUrl}</code>
      </Section>

      <Section style={securitySection}>
        <Text style={securityHeading}>Didn&apos;t request this?</Text>
        <Text style={securityText}>
          If you didn&apos;t request a password reset, you can safely ignore this email. Your
          password will remain unchanged and no one else can access your account.
        </Text>
        <Text style={securityText}>
          If you&apos;re concerned about your account security, please{' '}
          <a href={`${baseUrl}/support`} style={link}>
            contact our support team
          </a>
          .
        </Text>

        {(ipAddress || userAgent) && (
          <Section style={requestDetails}>
            <Text style={detailsHeading}>Request Details:</Text>
            {ipAddress && <Text style={detailsText}>IP Address: {ipAddress}</Text>}
            {userAgent && <Text style={detailsText}>Device: {userAgent}</Text>}
          </Section>
        )}
      </Section>

      <Text style={mutedParagraph}>
        For your security, never share this link with anyone. Our team will never ask you for your
        password.
      </Text>
    </BaseLayout>
  );
}

// Additional styles
const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const warningText = {
  color: '#92400E',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0',
};

const urlBox = {
  backgroundColor: colors.lightPage,
  borderRadius: '6px',
  padding: '12px 16px',
  margin: '16px 0',
  overflow: 'auto' as const,
};

const urlText = {
  color: colors.textDark,
  fontSize: '12px',
  lineHeight: '1.4',
  wordBreak: 'break-all' as const,
};

const securitySection = {
  backgroundColor: colors.lightPage,
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const securityHeading = {
  color: colors.textDarkHeading,
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 8px 0',
};

const securityText = {
  color: colors.textDarkSecondary,
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0 0 8px 0',
};

const link = {
  color: colors.lxdBlue,
  textDecoration: 'none',
};

const requestDetails = {
  marginTop: '16px',
  paddingTop: '16px',
  borderTop: `1px solid ${colors.border}`,
};

const detailsHeading = {
  color: colors.textDarkMuted,
  fontSize: '12px',
  fontWeight: '600',
  margin: '0 0 4px 0',
};

const detailsText = {
  color: colors.textDarkMuted,
  fontSize: '12px',
  lineHeight: '1.4',
  margin: '0',
};

export default PasswordResetEmail;
