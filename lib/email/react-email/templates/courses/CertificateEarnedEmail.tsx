import { EmailButton, EmailLayout, H1, InfoBox, MutedText, Paragraph } from '../../components';
import { theme } from '../../theme';

// ============================================================================
// TYPES
// ============================================================================

export interface CertificateEarnedEmailProps {
  /** User's first name */
  firstName: string;
  /** Course name */
  courseName: string;
  /** URL to view/download certificate */
  certificateUrl: string;
  /** Date certificate was earned */
  earnedDate?: string;
  /** Certificate ID */
  certificateId?: string;
  /** Credential verification URL */
  verificationUrl?: string;
  /** LinkedIn share URL */
  linkedInShareUrl?: string;
  /** Optional unsubscribe URL */
  unsubscribeUrl?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function CertificateEarnedEmail({
  firstName,
  courseName,
  certificateUrl,
  earnedDate,
  certificateId,
  verificationUrl,
  linkedInShareUrl,
  unsubscribeUrl,
}: CertificateEarnedEmailProps) {
  const previewText = `Congratulations! You've earned your certificate for ${courseName}`;

  return (
    <EmailLayout preview={previewText} unsubscribeUrl={unsubscribeUrl}>
      <H1>Congratulations! You've Earned a Certificate</H1>

      <Paragraph>Way to go, {firstName}!</Paragraph>

      <Paragraph>
        You've successfully completed "<strong>{courseName}</strong>" and earned your certificate of
        completion.
      </Paragraph>

      <InfoBox variant="success">
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontSize: theme.typography.sizes['3xl'],
              marginBottom: theme.spacing[2],
            }}
          >
            🏆
          </div>
          <div
            style={{
              color: theme.colors.gray[900],
              fontWeight: theme.typography.weights.semibold,
            }}
          >
            Certificate of Completion
          </div>
          <div
            style={{
              color: theme.colors.gray[600],
              fontSize: theme.typography.sizes.sm,
              marginTop: theme.spacing[1],
            }}
          >
            {courseName}
          </div>
          {earnedDate && (
            <div
              style={{
                color: theme.colors.gray[500],
                fontSize: theme.typography.sizes.xs,
                marginTop: theme.spacing[2],
              }}
            >
              Earned on {earnedDate}
            </div>
          )}
          {certificateId && (
            <div
              style={{
                color: theme.colors.gray[500],
                fontSize: theme.typography.sizes.xs,
                marginTop: theme.spacing[1],
              }}
            >
              Certificate ID: {certificateId}
            </div>
          )}
        </div>
      </InfoBox>

      <Paragraph>
        This achievement demonstrates your commitment to professional growth. Share it with your
        network!
      </Paragraph>

      <EmailButton href={certificateUrl}>View Certificate</EmailButton>

      {linkedInShareUrl && (
        <MutedText style={{ textAlign: 'center' }}>
          <a href={linkedInShareUrl} style={theme.styles.link}>
            Share on LinkedIn
          </a>
        </MutedText>
      )}

      {verificationUrl && (
        <MutedText>
          Others can verify your credential at:{' '}
          <a href={verificationUrl} style={theme.styles.link}>
            {verificationUrl}
          </a>
        </MutedText>
      )}
    </EmailLayout>
  );
}

// ============================================================================
// PREVIEW DATA (for development)
// ============================================================================

CertificateEarnedEmail.PreviewProps = {
  firstName: 'Alex',
  courseName: 'Introduction to Instructional Design',
  certificateUrl: 'https://lxd360.com/certificates/abc123',
  earnedDate: 'December 6, 2024',
  certificateId: 'LXD360-2024-ABC123',
  verificationUrl: 'https://lxd360.com/verify/abc123',
  linkedInShareUrl: 'https://linkedin.com/shareArticle?url=...',
} as CertificateEarnedEmailProps;

export default CertificateEarnedEmail;
