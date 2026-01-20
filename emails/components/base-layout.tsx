/**
 * =============================================================================
 * LXP360-SaaS | Base Email Layout
 * =============================================================================
 *
 * @fileoverview Base layout component for all email templates
 *
 * Uses LXD360 brand colors and styling
 */

import {
  Body,
  Column,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components';
import type * as React from 'react';

// LXD360 Brand Colors
export const colors = {
  // Primary Brand Blues
  lxdBlue: '#0056B8',
  lxdBlueLight: '#479DFF',
  lxdBlueDark: '#004494',
  lxdBlueBright: '#00D4FF',

  // Accent Purples
  lxdPurple: '#BA23FB',
  lxdPurpleDark: '#43025F',
  lxdPurpleLight: '#D580FF',

  // Backgrounds
  lightPage: '#F5F5F5',
  lightCard: '#EBF8FF',
  darkPage: '#0F172A',
  darkSurface: '#1E293B',

  // Text
  textDark: '#333333',
  textDarkHeading: '#232323',
  textDarkSecondary: '#5C5C5C',
  textDarkMuted: '#666666',
  textLight: '#F5F5F5',

  // Semantic
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#0056B8',

  // Other
  border: '#E5E7EB',
  white: '#FFFFFF',
};

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lxd360.com';

interface BaseLayoutProps {
  preview: string;
  children: React.ReactNode;
  showFooter?: boolean;
}

export function BaseLayout({ preview, children, showFooter = true }: BaseLayoutProps) {
  const currentYear = new Date().getFullYear();

  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header with Logo */}
          <Section style={header}>
            <Img
              src={`${baseUrl}/images/logo.png`}
              width="150"
              height="40"
              alt="LXD360"
              style={logo}
            />
          </Section>

          {/* Main Content */}
          <Section style={content}>{children}</Section>

          {/* Footer */}
          {showFooter && (
            <>
              <Hr style={divider} />
              <Section style={footer}>
                <Row>
                  <Column align="center">
                    <Text style={footerLinks}>
                      <Link href={`${baseUrl}/terms`} style={footerLink}>
                        Terms
                      </Link>
                      {' • '}
                      <Link href={`${baseUrl}/privacy`} style={footerLink}>
                        Privacy
                      </Link>
                      {' • '}
                      <Link href={`${baseUrl}/support`} style={footerLink}>
                        Support
                      </Link>
                    </Text>
                  </Column>
                </Row>
                <Text style={footerText}>© {currentYear} LXD360. All rights reserved.</Text>
                <Text style={addressText}>1234 Main Street, Suite 100, Austin, TX 78701</Text>
              </Section>
            </>
          )}
        </Container>
      </Body>
    </Html>
  );
}

// Shared Styles
const main = {
  backgroundColor: colors.lightPage,
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};

const container = {
  backgroundColor: colors.white,
  margin: '0 auto',
  padding: '0',
  maxWidth: '600px',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
};

const header = {
  backgroundColor: colors.lxdBlue,
  padding: '24px 32px',
  borderRadius: '8px 8px 0 0',
  textAlign: 'center' as const,
};

const logo = {
  margin: '0 auto',
};

const content = {
  padding: '32px',
};

const divider = {
  borderTop: `1px solid ${colors.border}`,
  margin: '0',
};

const footer = {
  padding: '24px 32px',
  backgroundColor: colors.lightPage,
  borderRadius: '0 0 8px 8px',
};

const footerLinks = {
  color: colors.textDarkMuted,
  fontSize: '12px',
  lineHeight: '1.5',
  textAlign: 'center' as const,
  margin: '0 0 12px 0',
};

const footerLink = {
  color: colors.lxdBlue,
  textDecoration: 'none',
};

const footerText = {
  color: colors.textDarkMuted,
  fontSize: '12px',
  lineHeight: '1.5',
  textAlign: 'center' as const,
  margin: '0 0 4px 0',
};

const addressText = {
  color: colors.textDarkMuted,
  fontSize: '11px',
  lineHeight: '1.5',
  textAlign: 'center' as const,
  margin: '0',
};

// Exported shared component styles
export const heading = {
  color: colors.textDarkHeading,
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '1.3',
  margin: '0 0 16px 0',
};

export const paragraph = {
  color: colors.textDark,
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 16px 0',
};

export const mutedParagraph = {
  color: colors.textDarkMuted,
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0 0 16px 0',
};

export const buttonPrimary = {
  backgroundColor: colors.lxdBlue,
  borderRadius: '6px',
  color: colors.white,
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: '600',
  padding: '14px 28px',
  textDecoration: 'none',
  textAlign: 'center' as const,
};

export const buttonSecondary = {
  backgroundColor: 'transparent',
  border: `2px solid ${colors.lxdBlueLight}`,
  borderRadius: '6px',
  color: colors.lxdBlue,
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: '600',
  padding: '12px 26px',
  textDecoration: 'none',
  textAlign: 'center' as const,
};

export const infoBox = {
  backgroundColor: colors.lightCard,
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

export const warningBox = {
  backgroundColor: '#FEF3C7',
  borderLeft: `4px solid ${colors.warning}`,
  borderRadius: '0 8px 8px 0',
  padding: '16px 20px',
  margin: '24px 0',
};

export const successBox = {
  backgroundColor: '#D1FAE5',
  borderLeft: `4px solid ${colors.success}`,
  borderRadius: '0 8px 8px 0',
  padding: '16px 20px',
  margin: '24px 0',
};

export const link = {
  color: colors.lxdBlue,
  textDecoration: 'none',
};

export default BaseLayout;
