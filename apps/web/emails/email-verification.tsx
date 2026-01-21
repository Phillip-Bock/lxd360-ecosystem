/**
 * =============================================================================
 * LXP360-SaaS | Email Verification Template
 * =============================================================================
 *
 * Sent to verify a user's email address
 */

import { Button, Section, Text } from '@react-email/components';
import {
  BaseLayout,
  buttonPrimary,
  colors,
  heading,
  infoBox,
  mutedParagraph,
  paragraph,
} from './components/base-layout';

interface EmailVerificationProps {
  firstName: string;
  verifyUrl: string;
  expiresIn?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lxd360.com';

export function EmailVerificationEmail({
  firstName = 'there',
  verifyUrl = `${baseUrl}/auth/callback?token=example`, // TODO(LXD-316): Update verification flow
  expiresIn = '24 hours',
}: EmailVerificationProps) {
  return (
    <BaseLayout preview="Verify your email address to complete your LXD360 account setup">
      <Text style={heading}>Verify Your Email Address</Text>

      <Text style={paragraph}>Hi {firstName},</Text>

      <Text style={paragraph}>
        Thanks for signing up for LXD360! To complete your account setup and access all features,
        please verify your email address by clicking the button below:
      </Text>

      <Section style={buttonContainer}>
        <Button href={verifyUrl} style={buttonPrimary}>
          Verify Email Address
        </Button>
      </Section>

      <Section style={infoBox}>
        <Text style={infoText}>
          <strong>📧 Why verify?</strong>
          <br />
          Verifying your email helps us keep your account secure and ensures you receive important
          notifications about your courses and account.
        </Text>
      </Section>

      <Text style={paragraph}>
        If the button above doesn&apos;t work, copy and paste this URL into your browser:
      </Text>

      <Section style={urlBox}>
        <code style={urlText}>{verifyUrl}</code>
      </Section>

      <Text style={mutedParagraph}>
        This verification link will expire in <strong>{expiresIn}</strong>. If the link expires, you
        can request a new one from your account settings.
      </Text>

      <Section style={helpSection}>
        <Text style={helpText}>
          <strong>Didn&apos;t create an account?</strong>
          <br />
          If you didn&apos;t sign up for LXD360, you can safely ignore this email. Someone may have
          entered your email address by mistake.
        </Text>
      </Section>
    </BaseLayout>
  );
}

// Additional styles
const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const infoText = {
  color: colors.textDark,
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

const helpSection = {
  backgroundColor: colors.lightPage,
  borderRadius: '8px',
  padding: '16px 20px',
  margin: '24px 0',
};

const helpText = {
  color: colors.textDarkSecondary,
  fontSize: '13px',
  lineHeight: '1.6',
  margin: '0',
};

export default EmailVerificationEmail;
