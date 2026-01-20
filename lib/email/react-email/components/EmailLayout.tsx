import { Body, Container, Head, Html, Preview, Section } from '@react-email/components';
import type * as React from 'react';
import { theme } from '../theme';
import { EmailFooter } from './EmailFooter';
import { EmailHeader } from './EmailHeader';

// ============================================================================
// TYPES
// ============================================================================

export interface EmailLayoutProps {
  /** Email preview text (shown in email client inbox) */
  preview?: string;
  /** Main content of the email */
  children: React.ReactNode;
  /** Optional custom header content (replaces default logo) */
  headerContent?: React.ReactNode;
  /** Optional unsubscribe URL for footer */
  unsubscribeUrl?: string;
  /** Whether to hide the footer */
  hideFooter?: boolean;
  /** Whether to hide the header */
  hideHeader?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function EmailLayout({
  preview,
  children,
  headerContent,
  unsubscribeUrl,
  hideFooter = false,
  hideHeader = false,
}: EmailLayoutProps) {
  const currentYear = new Date().getFullYear();

  return (
    <Html>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="color-scheme" content="light" />
        <meta name="supported-color-schemes" content="light" />
        <style>
          {`
            body {
              font-family: ${theme.typography.fontFamily};
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
            }
            a {
              color: ${theme.colors.primary};
            }
            a:hover {
              text-decoration: underline;
            }
            @media only screen and (max-width: 600px) {
              .container {
                width: 100% !important;
                padding: 16px !important;
              }
              .content {
                padding: 24px !important;
              }
              .button {
                display: block !important;
                width: 100% !important;
              }
            }
          `}
        </style>
      </Head>

      {preview && <Preview>{preview}</Preview>}

      <Body
        style={{
          backgroundColor: theme.colors.background,
          fontFamily: theme.typography.fontFamily,
          margin: 0,
          padding: 0,
        }}
      >
        <Container
          className="container"
          style={{
            margin: '0 auto',
            maxWidth: '600px',
            padding: theme.spacing[10],
          }}
        >
          <Section
            style={{
              backgroundColor: theme.colors.surface,
              borderRadius: theme.borders.radius.lg,
              boxShadow: theme.shadows.md,
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            {!hideHeader && <EmailHeader customContent={headerContent} />}

            {/* Main Content */}
            <Section
              className="content"
              style={{
                padding: theme.spacing[8],
              }}
            >
              {children}
            </Section>

            {/* Footer */}
            {!hideFooter && <EmailFooter year={currentYear} unsubscribeUrl={unsubscribeUrl} />}
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default EmailLayout;
