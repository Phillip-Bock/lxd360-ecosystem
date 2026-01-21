import {
  Divider,
  EmailButton,
  EmailLayout,
  H1,
  H2,
  InfoBox,
  MutedText,
  Paragraph,
} from '../../components';
import { theme } from '../../theme';

// ============================================================================
// TYPES
// ============================================================================

export interface FeatureUpdate {
  /** Feature name */
  name: string;
  /** Feature description */
  description: string;
  /** Optional icon or emoji */
  icon?: string;
  /** Feature category (e.g., "New", "Improved", "Fixed") */
  category?: 'new' | 'improved' | 'fixed';
}

export interface ProductUpdateEmailProps {
  /** User's first name */
  firstName: string;
  /** Update title */
  updateTitle: string;
  /** Version number (optional) */
  version?: string;
  /** Release date */
  releaseDate?: string;
  /** Introduction/summary */
  introduction: string;
  /** Array of feature updates */
  features: FeatureUpdate[];
  /** Optional detailed changelog URL */
  changelogUrl?: string;
  /** Optional feedback URL */
  feedbackUrl?: string;
  /** Optional demo/video URL */
  demoUrl?: string;
  /** Optional unsubscribe URL */
  unsubscribeUrl?: string;
}

// ============================================================================
// HELPERS
// ============================================================================

function getCategoryBadge(category?: string) {
  switch (category) {
    case 'new':
      return {
        text: 'NEW',
        bg: theme.colors.success,
        color: theme.colors.white,
      };
    case 'improved':
      return {
        text: 'IMPROVED',
        bg: theme.colors.info,
        color: theme.colors.white,
      };
    case 'fixed':
      return {
        text: 'FIXED',
        bg: theme.colors.gray[600],
        color: theme.colors.white,
      };
    default:
      return null;
  }
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ProductUpdateEmail({
  firstName,
  updateTitle,
  version,
  releaseDate,
  introduction,
  features,
  changelogUrl,
  feedbackUrl,
  demoUrl,
  unsubscribeUrl,
}: ProductUpdateEmailProps) {
  const previewText = `${updateTitle}${version ? ` - Version ${version}` : ''}`;

  return (
    <EmailLayout preview={previewText} unsubscribeUrl={unsubscribeUrl}>
      <H1>{updateTitle}</H1>

      {(version || releaseDate) && (
        <div style={{ marginBottom: '16px' }}>
          {version && (
            <span
              style={{
                display: 'inline-block',
                backgroundColor: theme.colors.gray[100],
                padding: '4px 12px',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: theme.typography.weights.medium,
                marginRight: '8px',
              }}
            >
              Version {version}
            </span>
          )}
          {releaseDate && (
            <MutedText style={{ display: 'inline', fontSize: '14px' }}>
              Released {releaseDate}
            </MutedText>
          )}
        </div>
      )}

      <Paragraph>Hi {firstName},</Paragraph>

      <Paragraph>{introduction}</Paragraph>

      {demoUrl && (
        <div style={{ textAlign: 'center', margin: '24px 0' }}>
          <EmailButton href={demoUrl}>Watch Demo</EmailButton>
        </div>
      )}

      <Divider />

      <H2>✨ What's New</H2>

      <div style={{ marginBottom: '24px' }}>
        {features.map((feature, index) => {
          const badge = getCategoryBadge(feature.category);
          return (
            <div
              key={index}
              style={{
                marginBottom: '20px',
                paddingBottom: '20px',
                borderBottom:
                  index < features.length - 1 ? `1px solid ${theme.colors.gray[200]}` : 'none',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '8px',
                }}
              >
                {feature.icon && <span style={{ fontSize: '20px' }}>{feature.icon}</span>}
                <strong style={{ fontSize: '16px' }}>{feature.name}</strong>
                {badge && (
                  <span
                    style={{
                      display: 'inline-block',
                      backgroundColor: badge.bg,
                      color: badge.color,
                      fontSize: '10px',
                      fontWeight: theme.typography.weights.bold,
                      padding: '2px 6px',
                      borderRadius: '3px',
                      letterSpacing: '0.5px',
                    }}
                  >
                    {badge.text}
                  </span>
                )}
              </div>
              <Paragraph style={{ margin: '0', fontSize: '14px' }}>{feature.description}</Paragraph>
            </div>
          );
        })}
      </div>

      {changelogUrl && (
        <Paragraph>
          <a
            href={changelogUrl}
            style={{
              ...theme.styles.link,
              fontWeight: theme.typography.weights.semibold,
            }}
          >
            View full changelog →
          </a>
        </Paragraph>
      )}

      <Divider />

      <InfoBox variant="info">
        <Paragraph style={{ margin: '0', fontSize: '14px' }}>
          <strong>We value your feedback!</strong>
        </Paragraph>
        <Paragraph style={{ margin: '8px 0 0 0', fontSize: '14px' }}>
          {feedbackUrl ? (
            <>
              Help us improve by sharing your thoughts.{' '}
              <a href={feedbackUrl} style={theme.styles.link}>
                Send feedback
              </a>
            </>
          ) : (
            'Help us improve by replying to this email with your thoughts.'
          )}
        </Paragraph>
      </InfoBox>

      <MutedText>
        Thank you for being part of the LXD360 community. We're committed to continuously improving
        your experience.
      </MutedText>
    </EmailLayout>
  );
}

// ============================================================================
// PREVIEW DATA (for development)
// ============================================================================

ProductUpdateEmail.PreviewProps = {
  firstName: 'Alex',
  updateTitle: '🎉 INSPIRE Studio 2.0 is Here!',
  version: '2.0.0',
  releaseDate: 'December 11, 2024',
  introduction:
    "We're excited to announce the biggest update to INSPIRE Studio yet! This release includes powerful new features to help you create even more engaging learning experiences.",
  features: [
    {
      name: 'AI Content Generation',
      description:
        'Generate course outlines, learning objectives, and assessment questions using AI. Save hours of development time while maintaining quality.',
      icon: '🤖',
      category: 'new',
    },
    {
      name: 'Enhanced Collaboration',
      description:
        'Real-time co-editing, comments, and version history make it easier than ever to work with your team.',
      icon: '👥',
      category: 'new',
    },
    {
      name: 'Redesigned Interface',
      description:
        "A completely refreshed UI that's more intuitive and easier to navigate. Find what you need faster.",
      icon: '🎨',
      category: 'improved',
    },
    {
      name: 'Performance Improvements',
      description:
        'Load times reduced by 50% and overall performance optimizations throughout the platform.',
      icon: '⚡',
      category: 'improved',
    },
    {
      name: 'Critical Bug Fixes',
      description:
        'Resolved issues with media upload and fixed export functionality for large projects.',
      icon: '🔧',
      category: 'fixed',
    },
  ],
  changelogUrl: 'https://lxd360.com/changelog',
  feedbackUrl: 'https://lxd360.com/feedback',
  demoUrl: 'https://lxd360.com/demo/inspire-studio-2',
} as ProductUpdateEmailProps;

export default ProductUpdateEmail;
