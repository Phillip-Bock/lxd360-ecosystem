import { Column, Link, Row, Section, Text } from '@react-email/components';
import { theme } from '../theme';

// ============================================================================
// TYPES
// ============================================================================

export interface EmailFooterProps {
  /** Current year for copyright */
  year?: number;
  /** Optional unsubscribe URL */
  unsubscribeUrl?: string;
  /** Whether to show social links */
  showSocial?: boolean;
  /** Custom support email */
  supportEmail?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function EmailFooter({
  year = new Date().getFullYear(),
  unsubscribeUrl,
  showSocial = true,
  supportEmail = 'support@lxd360.com',
}: EmailFooterProps) {
  const baseUrl = theme.urls.base;

  return (
    <Section style={theme.styles.footer}>
      {/* Social Links */}
      {showSocial && (
        <Row style={{ marginBottom: theme.spacing[4] }}>
          <Column align="center">
            <Link
              href={theme.branding.social.twitter}
              style={{
                display: 'inline-block',
                margin: `0 ${theme.spacing[2]}`,
              }}
            >
              <img
                src={`${baseUrl}/images/social/twitter.png`}
                alt="Twitter"
                width="24"
                height="24"
                style={{ display: 'block' }}
              />
            </Link>
            <Link
              href={theme.branding.social.linkedin}
              style={{
                display: 'inline-block',
                margin: `0 ${theme.spacing[2]}`,
              }}
            >
              <img
                src={`${baseUrl}/images/social/linkedin.png`}
                alt="LinkedIn"
                width="24"
                height="24"
                style={{ display: 'block' }}
              />
            </Link>
          </Column>
        </Row>
      )}

      {/* Copyright */}
      <Text
        style={{
          color: theme.colors.gray[500],
          fontFamily: theme.typography.fontFamily,
          fontSize: theme.typography.sizes.xs,
          lineHeight: theme.typography.lineHeights.normal,
          margin: `0 0 ${theme.spacing[2]} 0`,
        }}
      >
        &copy; {year} {theme.branding.companyName}. All rights reserved.
      </Text>

      {/* Address */}
      <Text
        style={{
          color: theme.colors.gray[500],
          fontFamily: theme.typography.fontFamily,
          fontSize: theme.typography.sizes.xs,
          lineHeight: theme.typography.lineHeights.normal,
          margin: `0 0 ${theme.spacing[3]} 0`,
        }}
      >
        {theme.branding.address}
      </Text>

      {/* Links */}
      <Text
        style={{
          color: theme.colors.gray[500],
          fontFamily: theme.typography.fontFamily,
          fontSize: theme.typography.sizes.xs,
          lineHeight: theme.typography.lineHeights.normal,
          margin: 0,
        }}
      >
        <Link
          href={theme.urls.privacy}
          style={{ color: theme.colors.gray[500], textDecoration: 'none' }}
        >
          Privacy Policy
        </Link>
        {' | '}
        <Link
          href={theme.urls.terms}
          style={{ color: theme.colors.gray[500], textDecoration: 'none' }}
        >
          Terms of Service
        </Link>
        {' | '}
        <Link
          href={`mailto:${supportEmail}`}
          style={{ color: theme.colors.gray[500], textDecoration: 'none' }}
        >
          Contact Support
        </Link>
        {unsubscribeUrl && (
          <>
            {' | '}
            <Link
              href={unsubscribeUrl}
              style={{ color: theme.colors.gray[500], textDecoration: 'none' }}
            >
              Unsubscribe
            </Link>
          </>
        )}
      </Text>
    </Section>
  );
}

export default EmailFooter;
