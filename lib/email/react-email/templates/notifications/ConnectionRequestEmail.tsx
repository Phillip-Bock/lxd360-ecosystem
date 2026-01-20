import { EmailButton, EmailLayout, H1, InfoBox, MutedText, Paragraph } from '../../components';
import { theme } from '../../theme';

// ============================================================================
// TYPES
// ============================================================================

export interface ConnectionRequestEmailProps {
  /** Recipient's first name */
  firstName: string;
  /** Name of person requesting connection */
  requesterName: string;
  /** Requester's title/role */
  requesterTitle?: string;
  /** Requester's bio/about */
  requesterBio?: string;
  /** Requester's profile image URL */
  requesterImageUrl?: string;
  /** URL to view requester's profile */
  profileUrl: string;
  /** URL to accept the connection */
  acceptUrl: string;
  /** URL to decline the connection */
  declineUrl: string;
  /** Optional unsubscribe URL */
  unsubscribeUrl?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ConnectionRequestEmail({
  firstName,
  requesterName,
  requesterTitle,
  requesterBio,
  requesterImageUrl,
  profileUrl,
  acceptUrl,
  declineUrl,
  unsubscribeUrl,
}: ConnectionRequestEmailProps) {
  const previewText = `${requesterName} wants to connect with you on LXD Nexus`;

  return (
    <EmailLayout preview={previewText} unsubscribeUrl={unsubscribeUrl}>
      <H1>New Connection Request</H1>

      <Paragraph>Hi {firstName},</Paragraph>

      <Paragraph>
        <strong>{requesterName}</strong> wants to connect with you on LXD Nexus.
      </Paragraph>

      <InfoBox variant="default">
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          {requesterImageUrl && (
            <img
              src={requesterImageUrl}
              alt={requesterName}
              style={{
                borderRadius: theme.borders.radius.full,
                height: '60px',
                marginRight: theme.spacing[4],
                width: '60px',
              }}
            />
          )}
          <div>
            <div
              style={{
                color: theme.colors.gray[900],
                fontWeight: theme.typography.weights.semibold,
                marginBottom: theme.spacing[1],
              }}
            >
              {requesterName}
            </div>
            {requesterTitle && (
              <div
                style={{
                  color: theme.colors.gray[600],
                  fontSize: theme.typography.sizes.sm,
                  marginBottom: theme.spacing[2],
                }}
              >
                {requesterTitle}
              </div>
            )}
            {requesterBio && (
              <div
                style={{
                  color: theme.colors.gray[700],
                  fontSize: theme.typography.sizes.sm,
                  lineHeight: theme.typography.lineHeights.normal,
                }}
              >
                {requesterBio}
              </div>
            )}
          </div>
        </div>
      </InfoBox>

      <EmailButton href={acceptUrl}>Accept Connection</EmailButton>

      <MutedText style={{ textAlign: 'center' }}>
        <a href={profileUrl} style={theme.styles.link}>
          View full profile
        </a>
        {' | '}
        <a href={declineUrl} style={{ ...theme.styles.link, color: theme.colors.gray[500] }}>
          Decline request
        </a>
      </MutedText>
    </EmailLayout>
  );
}

// ============================================================================
// PREVIEW DATA (for development)
// ============================================================================

ConnectionRequestEmail.PreviewProps = {
  firstName: 'Alex',
  requesterName: 'Sarah Johnson',
  requesterTitle: 'Senior Instructional Designer at Acme Corp',
  requesterBio: 'Passionate about creating engaging learning experiences. 10+ years in L&D.',
  profileUrl: 'https://lxd360.com/nexus/profiles/sarah-johnson',
  acceptUrl: 'https://lxd360.com/nexus/connections/accept/abc123',
  declineUrl: 'https://lxd360.com/nexus/connections/decline/abc123',
} as ConnectionRequestEmailProps;

export default ConnectionRequestEmail;
