/**
 * =============================================================================
 * LXP360-SaaS | Welcome Email Template
 * =============================================================================
 *
 * Sent when a new user signs up
 */

import { Button, Column, Link, Row, Section, Text } from '@react-email/components';
import {
  BaseLayout,
  buttonPrimary,
  colors,
  heading,
  infoBox,
  mutedParagraph,
  paragraph,
} from './components/base-layout';

interface WelcomeEmailProps {
  firstName: string;
  email?: string;
  dashboardUrl?: string;
  gettingStartedUrl?: string;
  supportUrl?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lxd360.com';

export function WelcomeEmail({
  firstName = 'there',
  dashboardUrl = `${baseUrl}/dashboard`,
  gettingStartedUrl = `${baseUrl}/getting-started`,
  supportUrl = `${baseUrl}/support`,
}: WelcomeEmailProps) {
  return (
    <BaseLayout preview={`Welcome to LXD360, ${firstName}! Your account is ready.`}>
      <Text style={heading}>Welcome to LXD360! 🎉</Text>

      <Text style={paragraph}>Hi {firstName},</Text>

      <Text style={paragraph}>
        Thank you for joining LXD360! We&apos;re thrilled to have you on board. Your account has
        been created and you&apos;re ready to start exploring the platform.
      </Text>

      <Section style={infoBox}>
        <Text style={infoHeading}>What you can do with LXD360:</Text>
        <Text style={infoItem}>✓ Create engaging courses with INSPIRE Studio</Text>
        <Text style={infoItem}>✓ Track learning progress with our LMS/LRS</Text>
        <Text style={infoItem}>✓ Connect with mentors through LXD Nexus</Text>
        <Text style={infoItem}>✓ Use AI-powered content generation</Text>
      </Section>

      <Section style={buttonContainer}>
        <Button href={dashboardUrl} style={buttonPrimary}>
          Go to Dashboard
        </Button>
      </Section>

      <Text style={paragraph}>
        <strong>Quick Start Resources:</strong>
      </Text>

      <Row style={resourceRow}>
        <Column style={resourceColumn}>
          <Link href={gettingStartedUrl} style={resourceLink}>
            📚 Getting Started Guide
          </Link>
        </Column>
      </Row>
      <Row style={resourceRow}>
        <Column style={resourceColumn}>
          <Link href={`${baseUrl}/docs`} style={resourceLink}>
            📖 Documentation
          </Link>
        </Column>
      </Row>
      <Row style={resourceRow}>
        <Column style={resourceColumn}>
          <Link href={supportUrl} style={resourceLink}>
            💬 Contact Support
          </Link>
        </Column>
      </Row>

      <Text style={mutedParagraph}>
        If you have unknown questions or need help getting started, don&apos;t hesitate to reach out
        to our support team. We&apos;re here to help!
      </Text>

      <Text style={paragraph}>
        Welcome aboard,
        <br />
        The LXD360 Team
      </Text>
    </BaseLayout>
  );
}

// Additional styles
const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const infoHeading = {
  color: colors.textDarkHeading,
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 12px 0',
};

const infoItem = {
  color: colors.textDark,
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0 0 8px 0',
};

const resourceRow = {
  marginBottom: '8px',
};

const resourceColumn = {
  padding: '8px 0',
};

const resourceLink = {
  color: colors.lxdBlue,
  fontSize: '14px',
  textDecoration: 'none',
};

export default WelcomeEmail;
