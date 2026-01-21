import { Divider, EmailButton, EmailLayout, H1, H2, MutedText, Paragraph } from '../../components';
import { theme } from '../../theme';

// ============================================================================
// TYPES
// ============================================================================

export interface NewsletterSection {
  /** Section title */
  title: string;
  /** Section content/description */
  content: string;
  /** Optional image URL */
  imageUrl?: string;
  /** Optional CTA button text */
  ctaText?: string;
  /** Optional CTA URL */
  ctaUrl?: string;
}

export interface NewsletterEmailProps {
  /** User's first name */
  firstName: string;
  /** Newsletter title/headline */
  headline: string;
  /** Introduction paragraph */
  introduction: string;
  /** Array of newsletter sections */
  sections: NewsletterSection[];
  /** Optional featured section */
  featuredSection?: NewsletterSection;
  /** Footer message */
  footerMessage?: string;
  /** Optional unsubscribe URL */
  unsubscribeUrl?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function NewsletterEmail({
  firstName,
  headline,
  introduction,
  sections,
  featuredSection,
  footerMessage,
  unsubscribeUrl,
}: NewsletterEmailProps) {
  const previewText = `${headline} - LXD360 Newsletter`;

  return (
    <EmailLayout preview={previewText} unsubscribeUrl={unsubscribeUrl}>
      <H1>{headline}</H1>

      <Paragraph>Hi {firstName},</Paragraph>

      <Paragraph>{introduction}</Paragraph>

      <Divider />

      {/* Featured Section */}
      {featuredSection && (
        <>
          <div
            style={{
              backgroundColor: theme.colors.gray[50],
              borderRadius: '8px',
              padding: '24px',
              marginBottom: '32px',
            }}
          >
            {featuredSection.imageUrl && (
              <div style={{ marginBottom: '16px', textAlign: 'center' }}>
                <img
                  src={featuredSection.imageUrl}
                  alt={featuredSection.title}
                  style={{
                    maxWidth: '100%',
                    height: 'auto',
                    borderRadius: '6px',
                  }}
                />
              </div>
            )}
            <H2 style={{ marginTop: '0' }}>{featuredSection.title}</H2>
            <Paragraph>{featuredSection.content}</Paragraph>
            {featuredSection.ctaUrl && featuredSection.ctaText && (
              <EmailButton href={featuredSection.ctaUrl}>{featuredSection.ctaText}</EmailButton>
            )}
          </div>
          <Divider />
        </>
      )}

      {/* Regular Sections */}
      {sections.map((section, index) => (
        <div key={index} style={{ marginBottom: '32px' }}>
          {section.imageUrl && (
            <div style={{ marginBottom: '16px' }}>
              <img
                src={section.imageUrl}
                alt={section.title}
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  borderRadius: '6px',
                }}
              />
            </div>
          )}
          <H2>{section.title}</H2>
          <Paragraph>{section.content}</Paragraph>
          {section.ctaUrl && section.ctaText && (
            <a
              href={section.ctaUrl}
              style={{
                ...theme.styles.link,
                fontWeight: theme.typography.weights.semibold,
              }}
            >
              {section.ctaText} →
            </a>
          )}
          {index < sections.length - 1 && <Divider />}
        </div>
      ))}

      {footerMessage && (
        <>
          <Divider />
          <MutedText>{footerMessage}</MutedText>
        </>
      )}
    </EmailLayout>
  );
}

// ============================================================================
// PREVIEW DATA (for development)
// ============================================================================

NewsletterEmail.PreviewProps = {
  firstName: 'Alex',
  headline: "🚀 What's New at LXD360 - December 2024",
  introduction:
    "Welcome to this month's newsletter! We've been busy building new features and creating amazing content to help you excel in learning and development.",
  featuredSection: {
    title: 'Introducing INSPIRE Studio 2.0',
    content:
      "We're thrilled to announce the launch of INSPIRE Studio 2.0, featuring AI-powered content generation, enhanced collaboration tools, and a completely redesigned interface.",
    imageUrl: 'https://placehold.co/600x300/2563eb/ffffff?text=INSPIRE+Studio+2.0',
    ctaText: 'Learn More',
    ctaUrl: 'https://lxd360.com/inspire-studio',
  },
  sections: [
    {
      title: 'New Courses Added',
      content:
        "This month we've added 5 new courses covering advanced instructional design, accessibility in eLearning, and AI-powered content creation.",
      ctaText: 'Browse Courses',
      ctaUrl: 'https://lxd360.com/courses',
    },
    {
      title: 'Community Spotlight',
      content:
        'Meet our community member of the month, Sarah Chen, who has created over 50 courses and mentored 100+ learning professionals through LXD Nexus.',
      ctaText: 'Read Story',
      ctaUrl: 'https://lxd360.com/blog/community-spotlight-sarah',
    },
    {
      title: 'Upcoming Webinar',
      content:
        "Join us on December 20th for a live webinar on 'Designing for Neurodiversity' with Dr. James Martinez. Limited spots available!",
      ctaText: 'Register Now',
      ctaUrl: 'https://lxd360.com/webinars/neurodiversity',
    },
  ],
  footerMessage:
    "Thank you for being part of the LXD360 community. We're excited to continue this journey with you!",
} as NewsletterEmailProps;

export default NewsletterEmail;
