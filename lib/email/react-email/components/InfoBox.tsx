import { Section, Text } from '@react-email/components';
import type * as React from 'react';
import { theme } from '../theme';

// ============================================================================
// TYPES
// ============================================================================

export type InfoBoxVariant = 'default' | 'success' | 'warning' | 'error' | 'info';

export interface InfoBoxProps {
  /** Content of the info box */
  children: React.ReactNode;
  /** Visual variant */
  variant?: InfoBoxVariant;
  /** Optional title */
  title?: string;
  /** Additional styles */
  style?: React.CSSProperties;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function InfoBox({ children, variant = 'default', title, style }: InfoBoxProps) {
  const variantStyles = theme.styles.infoBox[variant];

  return (
    <Section
      style={{
        ...variantStyles,
        ...style,
      }}
    >
      {title && (
        <Text
          style={{
            color: theme.colors.gray[800],
            fontFamily: theme.typography.fontFamily,
            fontSize: theme.typography.sizes.sm,
            fontWeight: theme.typography.weights.semibold,
            margin: `0 0 ${theme.spacing[2]} 0`,
          }}
        >
          {title}
        </Text>
      )}
      {typeof children === 'string' ? (
        <Text
          style={{
            color: theme.colors.gray[700],
            fontFamily: theme.typography.fontFamily,
            fontSize: theme.typography.sizes.sm,
            lineHeight: theme.typography.lineHeights.normal,
            margin: 0,
          }}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </Section>
  );
}

// ============================================================================
// INFO ROW COMPONENT
// ============================================================================

export interface InfoRowProps {
  /** Label for the row */
  label: string;
  /** Value for the row */
  value: React.ReactNode;
  /** Whether to show a divider below */
  showDivider?: boolean;
}

export function InfoRow({ label, value, showDivider = true }: InfoRowProps) {
  return (
    <Section
      style={{
        borderBottom: showDivider ? `1px solid ${theme.colors.gray[200]}` : 'none',
        padding: `${theme.spacing[2]} 0`,
      }}
    >
      <Text
        style={{
          color: theme.colors.gray[500],
          fontFamily: theme.typography.fontFamily,
          fontSize: theme.typography.sizes.sm,
          margin: `0 0 ${theme.spacing[1]} 0`,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          color: theme.colors.gray[900],
          fontFamily: theme.typography.fontFamily,
          fontSize: theme.typography.sizes.sm,
          fontWeight: theme.typography.weights.semibold,
          margin: 0,
        }}
      >
        {value}
      </Text>
    </Section>
  );
}

// ============================================================================
// HIGHLIGHT BOX COMPONENT
// ============================================================================

export interface HighlightBoxProps {
  /** Value to highlight (e.g., score, amount) */
  value: string | number;
  /** Optional label */
  label?: string;
  /** Color scheme */
  color?: 'primary' | 'success' | 'warning' | 'error';
}

export function HighlightBox({ value, label, color = 'primary' }: HighlightBoxProps) {
  const colorMap = {
    primary: theme.colors.primary,
    success: theme.colors.success,
    warning: theme.colors.warning,
    error: theme.colors.error,
  };

  return (
    <Section
      style={{
        backgroundColor: theme.colors.gray[50],
        borderRadius: theme.borders.radius.md,
        margin: `${theme.spacing[4]} 0`,
        padding: theme.spacing[4],
        textAlign: 'center',
      }}
    >
      <Text
        style={{
          color: colorMap[color],
          fontFamily: theme.typography.fontFamily,
          fontSize: theme.typography.sizes['2xl'],
          fontWeight: theme.typography.weights.bold,
          lineHeight: '1',
          margin: 0,
        }}
      >
        {value}
      </Text>
      {label && (
        <Text
          style={{
            color: theme.colors.gray[500],
            fontFamily: theme.typography.fontFamily,
            fontSize: theme.typography.sizes.sm,
            margin: `${theme.spacing[2]} 0 0 0`,
          }}
        >
          {label}
        </Text>
      )}
    </Section>
  );
}

export default InfoBox;
