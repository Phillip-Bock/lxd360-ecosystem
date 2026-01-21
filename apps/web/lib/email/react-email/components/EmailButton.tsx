import { Button, Section } from '@react-email/components';
import type * as React from 'react';
import { theme } from '../theme';

// ============================================================================
// TYPES
// ============================================================================

export interface EmailButtonProps {
  /** Button text */
  children: React.ReactNode;
  /** Link URL */
  href: string;
  /** Button variant */
  variant?: 'primary' | 'secondary';
  /** Full width button */
  fullWidth?: boolean;
  /** Additional inline styles */
  style?: React.CSSProperties;
  /** Center the button */
  centered?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function EmailButton({
  children,
  href,
  variant = 'primary',
  fullWidth = false,
  style,
  centered = true,
}: EmailButtonProps) {
  const buttonStyle =
    variant === 'primary' ? theme.styles.button.primary : theme.styles.button.secondary;

  const mergedStyle: React.CSSProperties = {
    ...buttonStyle,
    ...(fullWidth && { display: 'block', width: '100%' }),
    ...style,
  };

  const button = (
    <Button href={href} className="button" style={mergedStyle}>
      {children}
    </Button>
  );

  if (centered) {
    return (
      <Section style={{ textAlign: 'center', margin: `${theme.spacing[6]} 0` }}>{button}</Section>
    );
  }

  return button;
}

// ============================================================================
// BUTTON GROUP
// ============================================================================

export interface EmailButtonGroupProps {
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right';
}

export function EmailButtonGroup({ children, align = 'center' }: EmailButtonGroupProps) {
  return (
    <Section
      style={{
        textAlign: align,
        margin: `${theme.spacing[6]} 0`,
      }}
    >
      {children}
    </Section>
  );
}

export default EmailButton;
