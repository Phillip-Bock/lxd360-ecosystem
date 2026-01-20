import { Heading, Hr, Link, Text } from '@react-email/components';
import type * as React from 'react';
import { theme } from '../theme';

// ============================================================================
// HEADING COMPONENTS
// ============================================================================

export interface HeadingProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export function H1({ children, style }: HeadingProps) {
  return (
    <Heading
      as="h1"
      style={{
        ...theme.styles.heading1,
        ...style,
      }}
    >
      {children}
    </Heading>
  );
}

export function H2({ children, style }: HeadingProps) {
  return (
    <Heading
      as="h2"
      style={{
        ...theme.styles.heading2,
        ...style,
      }}
    >
      {children}
    </Heading>
  );
}

export function H3({ children, style }: HeadingProps) {
  return (
    <Heading
      as="h3"
      style={{
        ...theme.styles.heading3,
        ...style,
      }}
    >
      {children}
    </Heading>
  );
}

// ============================================================================
// PARAGRAPH COMPONENT
// ============================================================================

export interface ParagraphProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  muted?: boolean;
}

export function Paragraph({ children, style, muted = false }: ParagraphProps) {
  const baseStyle = muted ? theme.styles.mutedText : theme.styles.paragraph;

  return (
    <Text
      style={{
        ...baseStyle,
        ...style,
      }}
    >
      {children}
    </Text>
  );
}

// Alias for muted text
export function MutedText({ children, style }: Omit<ParagraphProps, 'muted'>) {
  return (
    <Text
      style={{
        ...theme.styles.mutedText,
        ...style,
      }}
    >
      {children}
    </Text>
  );
}

// ============================================================================
// LINK COMPONENT
// ============================================================================

export interface EmailLinkProps {
  href: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export function EmailLink({ href, children, style }: EmailLinkProps) {
  return (
    <Link
      href={href}
      style={{
        ...theme.styles.link,
        ...style,
      }}
    >
      {children}
    </Link>
  );
}

// ============================================================================
// DIVIDER COMPONENT
// ============================================================================

export interface DividerProps {
  style?: React.CSSProperties;
}

export function Divider({ style }: DividerProps) {
  return (
    <Hr
      style={{
        ...theme.styles.divider,
        ...style,
      }}
    />
  );
}

// ============================================================================
// CODE COMPONENT
// ============================================================================

export interface CodeProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export function Code({ children, style }: CodeProps) {
  return (
    <code
      style={{
        ...theme.styles.code,
        ...style,
      }}
    >
      {children}
    </code>
  );
}

// ============================================================================
// PREFORMATTED TEXT
// ============================================================================

export interface PreProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export function Pre({ children, style }: PreProps) {
  return (
    <pre
      style={{
        backgroundColor: theme.colors.gray[100],
        borderRadius: theme.borders.radius.md,
        fontFamily: theme.typography.monoFontFamily,
        fontSize: theme.typography.sizes.sm,
        lineHeight: theme.typography.lineHeights.relaxed,
        margin: `${theme.spacing[4]} 0`,
        overflowX: 'auto',
        padding: theme.spacing[4],
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        ...style,
      }}
    >
      {children}
    </pre>
  );
}

// ============================================================================
// LIST COMPONENTS
// ============================================================================

export interface ListProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export function UnorderedList({ children, style }: ListProps) {
  return (
    <ul
      style={{
        color: theme.colors.gray[700],
        fontFamily: theme.typography.fontFamily,
        fontSize: theme.typography.sizes.base,
        lineHeight: theme.typography.lineHeights.relaxed,
        margin: `0 0 ${theme.spacing[4]} 0`,
        paddingLeft: theme.spacing[5],
        ...style,
      }}
    >
      {children}
    </ul>
  );
}

export function OrderedList({ children, style }: ListProps) {
  return (
    <ol
      style={{
        color: theme.colors.gray[700],
        fontFamily: theme.typography.fontFamily,
        fontSize: theme.typography.sizes.base,
        lineHeight: theme.typography.lineHeights.relaxed,
        margin: `0 0 ${theme.spacing[4]} 0`,
        paddingLeft: theme.spacing[5],
        ...style,
      }}
    >
      {children}
    </ol>
  );
}

export interface ListItemProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export function ListItem({ children, style }: ListItemProps) {
  return (
    <li
      style={{
        marginBottom: theme.spacing[2],
        ...style,
      }}
    >
      {children}
    </li>
  );
}
