/**
 * =============================================================================
 * LXP360-SaaS | Team Invitation Email Template
 * =============================================================================
 *
 * Sent when a user is invited to join an organization
 */

import { Button, Column, Img, Row, Section, Text } from '@react-email/components';
import {
  BaseLayout,
  buttonPrimary,
  colors,
  heading,
  infoBox,
  mutedParagraph,
  paragraph,
} from './components/base-layout';

interface TeamInvitationEmailProps {
  inviteeName: string;
  inviteeEmail: string;
  inviterName: string;
  inviterEmail?: string;
  inviterAvatar?: string;
  organizationName: string;
  organizationLogo?: string;
  role?: string;
  acceptUrl: string;
  expiresIn?: string;
  message?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lxd360.com';

export function TeamInvitationEmail({
  inviteeName = 'there',
  inviterName = 'John Doe',
  inviterEmail,
  inviterAvatar,
  organizationName = 'Acme Learning Co.',
  organizationLogo,
  role = 'Team Member',
  acceptUrl = `${baseUrl}/invite/accept?token=example`,
  expiresIn = '7 days',
  message,
}: TeamInvitationEmailProps) {
  return (
    <BaseLayout preview={`${inviterName} has invited you to join ${organizationName} on LXD360`}>
      <Text style={heading}>You&apos;re Invited! 🎉</Text>

      <Text style={paragraph}>Hi {inviteeName},</Text>

      <Text style={paragraph}>
        <strong>{inviterName}</strong> has invited you to join <strong>{organizationName}</strong>{' '}
        on LXD360.
      </Text>

      {/* Organization Card */}
      <Section style={orgCard}>
        <Row>
          <Column style={orgLogoColumn}>
            {organizationLogo ? (
              <Img
                src={organizationLogo}
                width="60"
                height="60"
                alt={organizationName}
                style={orgLogoImg}
              />
            ) : (
              <Section style={orgLogoPlaceholder}>
                <Text style={orgInitial}>{organizationName.charAt(0)}</Text>
              </Section>
            )}
          </Column>
          <Column style={orgInfo}>
            <Text style={orgName}>{organizationName}</Text>
            <Text style={roleText}>
              You&apos;re invited as: <strong>{role}</strong>
            </Text>
          </Column>
        </Row>
      </Section>

      {/* Inviter Info */}
      <Section style={inviterSection}>
        <Row>
          <Column style={inviterAvatarColumn}>
            {inviterAvatar ? (
              <Img
                src={inviterAvatar}
                width="40"
                height="40"
                alt={inviterName}
                style={inviterAvatarImg}
              />
            ) : (
              <Section style={inviterAvatarPlaceholder}>
                <Text style={inviterInitial}>{inviterName.charAt(0)}</Text>
              </Section>
            )}
          </Column>
          <Column style={inviterInfo}>
            <Text style={inviterLabel}>Invited by</Text>
            <Text style={inviterNameText}>{inviterName}</Text>
            {inviterEmail && <Text style={inviterEmailText}>{inviterEmail}</Text>}
          </Column>
        </Row>
      </Section>

      {/* Personal Message */}
      {message && (
        <Section style={messageBox}>
          <Text style={messageLabel}>Personal message from {inviterName}:</Text>
          <Text style={messageText}>&ldquo;{message}&rdquo;</Text>
        </Section>
      )}

      <Section style={buttonContainer}>
        <Button href={acceptUrl} style={buttonPrimary}>
          Accept Invitation
        </Button>
      </Section>

      <Section style={infoBox}>
        <Text style={infoText}>
          <strong>What happens next?</strong>
          <br />
          <br />
          When you accept this invitation, you&apos;ll:
        </Text>
        <Text style={benefitItem}>✓ Join {organizationName}&apos;s workspace</Text>
        <Text style={benefitItem}>✓ Access shared courses and resources</Text>
        <Text style={benefitItem}>✓ Collaborate with team members</Text>
        <Text style={benefitItem}>✓ Track your learning progress</Text>
      </Section>

      <Section style={expiryNotice}>
        <Text style={expiryText}>
          ⏰ This invitation expires in <strong>{expiresIn}</strong>. After that, you&apos;ll need
          to request a new invitation.
        </Text>
      </Section>

      <Text style={mutedParagraph}>
        If you don&apos;t want to join {organizationName} or didn&apos;t expect this invitation, you
        can simply ignore this email. No action is required.
      </Text>

      <Section style={helpSection}>
        <Text style={helpText}>
          <strong>Questions?</strong>
          <br />
          Contact {inviterName}
          {inviterEmail ? ` at ${inviterEmail}` : ''} or reach out to our support team.
        </Text>
      </Section>
    </BaseLayout>
  );
}

// Additional styles
const orgCard = {
  backgroundColor: colors.lightCard,
  borderRadius: '12px',
  padding: '20px',
  margin: '24px 0',
};

const orgLogoColumn = {
  width: '72px',
  verticalAlign: 'top' as const,
};

const orgLogoImg = {
  borderRadius: '12px',
};

const orgLogoPlaceholder = {
  width: '60px',
  height: '60px',
  backgroundColor: colors.lxdBlue,
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const orgInitial = {
  color: colors.white,
  fontSize: '24px',
  fontWeight: '600',
  textAlign: 'center' as const,
  lineHeight: '60px',
  margin: '0',
};

const orgInfo = {
  paddingLeft: '16px',
  verticalAlign: 'middle' as const,
};

const orgName = {
  color: colors.textDarkHeading,
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 4px 0',
};

const roleText = {
  color: colors.textDarkSecondary,
  fontSize: '14px',
  margin: '0',
};

const inviterSection = {
  padding: '16px 0',
};

const inviterAvatarColumn = {
  width: '52px',
  verticalAlign: 'top' as const,
};

const inviterAvatarImg = {
  borderRadius: '50%',
};

const inviterAvatarPlaceholder = {
  width: '40px',
  height: '40px',
  backgroundColor: colors.lxdPurple,
  borderRadius: '50%',
};

const inviterInitial = {
  color: colors.white,
  fontSize: '16px',
  fontWeight: '600',
  textAlign: 'center' as const,
  lineHeight: '40px',
  margin: '0',
};

const inviterInfo = {
  paddingLeft: '12px',
  verticalAlign: 'middle' as const,
};

const inviterLabel = {
  color: colors.textDarkMuted,
  fontSize: '12px',
  margin: '0',
};

const inviterNameText = {
  color: colors.textDark,
  fontSize: '14px',
  fontWeight: '500',
  margin: '2px 0 0 0',
};

const inviterEmailText = {
  color: colors.textDarkMuted,
  fontSize: '12px',
  margin: '0',
};

const messageBox = {
  backgroundColor: colors.lightPage,
  borderLeft: `4px solid ${colors.lxdBlue}`,
  borderRadius: '0 8px 8px 0',
  padding: '16px 20px',
  margin: '24px 0',
};

const messageLabel = {
  color: colors.textDarkMuted,
  fontSize: '12px',
  fontWeight: '500',
  margin: '0 0 8px 0',
};

const messageText = {
  color: colors.textDark,
  fontSize: '14px',
  fontStyle: 'italic' as const,
  lineHeight: '1.6',
  margin: '0',
};

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

const benefitItem = {
  color: colors.textDark,
  fontSize: '13px',
  lineHeight: '1.5',
  margin: '4px 0',
};

const expiryNotice = {
  backgroundColor: '#FEF3C7',
  borderRadius: '6px',
  padding: '12px 16px',
  margin: '24px 0',
};

const expiryText = {
  color: '#92400E',
  fontSize: '13px',
  lineHeight: '1.5',
  margin: '0',
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

export default TeamInvitationEmail;
