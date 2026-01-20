import { EmailButton, EmailLayout, H1, InfoBox, MutedText, Paragraph } from '../../components';
import { theme } from '../../theme';

// ============================================================================
// TYPES
// ============================================================================

export interface NewMessageEmailProps {
  /** Recipient's first name */
  firstName: string;
  /** Name of the message sender */
  senderName: string;
  /** Sender's profile image URL */
  senderImageUrl?: string;
  /** Message preview (truncated) */
  messagePreview: string;
  /** URL to view the full message */
  viewUrl: string;
  /** URL to reply directly */
  replyUrl?: string;
  /** When the message was sent */
  sentAt?: string;
  /** Optional unsubscribe URL */
  unsubscribeUrl?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function NewMessageEmail({
  firstName,
  senderName,
  senderImageUrl,
  messagePreview,
  viewUrl,
  replyUrl,
  sentAt,
  unsubscribeUrl,
}: NewMessageEmailProps) {
  const previewText = `New message from ${senderName}`;

  return (
    <EmailLayout preview={previewText} unsubscribeUrl={unsubscribeUrl}>
      <H1>New Message</H1>

      <Paragraph>Hi {firstName},</Paragraph>

      <Paragraph>
        You have a new message from <strong>{senderName}</strong>:
      </Paragraph>

      <InfoBox variant="default">
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          {senderImageUrl && (
            <img
              src={senderImageUrl}
              alt={senderName}
              style={{
                borderRadius: theme.borders.radius.full,
                height: '40px',
                marginRight: theme.spacing[3],
                width: '40px',
              }}
            />
          )}
          <div style={{ flex: 1 }}>
            <div
              style={{
                color: theme.colors.gray[900],
                fontWeight: theme.typography.weights.semibold,
                marginBottom: theme.spacing[1],
              }}
            >
              {senderName}
              {sentAt && (
                <span
                  style={{
                    color: theme.colors.gray[500],
                    fontWeight: theme.typography.weights.normal,
                    fontSize: theme.typography.sizes.sm,
                    marginLeft: theme.spacing[2],
                  }}
                >
                  {sentAt}
                </span>
              )}
            </div>
            <div
              style={{
                color: theme.colors.gray[700],
                fontStyle: 'italic',
                lineHeight: theme.typography.lineHeights.normal,
              }}
            >
              "{messagePreview}..."
            </div>
          </div>
        </div>
      </InfoBox>

      <EmailButton href={viewUrl}>View Message</EmailButton>

      {replyUrl && (
        <MutedText style={{ textAlign: 'center' }}>
          <a href={replyUrl} style={theme.styles.link}>
            Reply directly
          </a>
        </MutedText>
      )}
    </EmailLayout>
  );
}

// ============================================================================
// PREVIEW DATA (for development)
// ============================================================================

NewMessageEmail.PreviewProps = {
  firstName: 'Alex',
  senderName: 'Sarah Johnson',
  messagePreview:
    'Hey! I wanted to follow up on our conversation about the project. Do you have time this week to discuss the next steps',
  viewUrl: 'https://lxd360.com/messages/abc123',
  replyUrl: 'https://lxd360.com/messages/abc123/reply',
  sentAt: '2 hours ago',
} as NewMessageEmailProps;

export default NewMessageEmail;
