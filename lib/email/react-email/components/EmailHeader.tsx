import { Img, Section } from '@react-email/components';
import type * as React from 'react';
import { theme } from '../theme';

// ============================================================================
// TYPES
// ============================================================================

export interface EmailHeaderProps {
  /** Optional custom content to replace the logo */
  customContent?: React.ReactNode;
  /** Logo URL override */
  logoUrl?: string;
  /** Logo alt text */
  logoAlt?: string;
  /** Logo width */
  logoWidth?: number;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function EmailHeader({
  customContent,
  logoUrl,
  logoAlt = theme.branding.logoAlt,
  logoWidth = 150,
}: EmailHeaderProps) {
  const logo = logoUrl || theme.urls.logo;

  return (
    <Section style={theme.styles.header}>
      {customContent || (
        <Img
          src={logo}
          alt={logoAlt}
          width={logoWidth}
          height="auto"
          style={{
            display: 'block',
            margin: '0 auto',
            maxWidth: '100%',
          }}
        />
      )}
    </Section>
  );
}

export default EmailHeader;
