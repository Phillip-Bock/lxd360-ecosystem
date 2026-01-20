import { EmailButton, EmailLayout, H1, H2, InfoBox, MutedText, Paragraph } from '../../components';
import { theme } from '../../theme';

// ============================================================================
// TYPES
// ============================================================================

export interface ProjectInviteEmailProps {
  /** Recipient's first name */
  firstName: string;
  /** Name of person sending the invite */
  inviterName: string;
  /** Project name */
  projectName: string;
  /** Project description */
  projectDescription?: string;
  /** Role being invited to */
  role: string;
  /** URL to accept the invitation */
  acceptUrl: string;
  /** URL to decline the invitation */
  declineUrl: string;
  /** URL to view the project */
  projectUrl?: string;
  /** Message from inviter */
  personalMessage?: string;
  /** Optional unsubscribe URL */
  unsubscribeUrl?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ProjectInviteEmail({
  firstName,
  inviterName,
  projectName,
  projectDescription,
  role,
  acceptUrl,
  declineUrl,
  projectUrl,
  personalMessage,
  unsubscribeUrl,
}: ProjectInviteEmailProps) {
  const previewText = `${inviterName} invited you to collaborate on "${projectName}"`;

  return (
    <EmailLayout preview={previewText} unsubscribeUrl={unsubscribeUrl}>
      <H1>You're Invited to Collaborate</H1>

      <Paragraph>Hi {firstName},</Paragraph>

      <Paragraph>
        <strong>{inviterName}</strong> has invited you to join the project "
        <strong>{projectName}</strong>" as a <strong>{role}</strong>.
      </Paragraph>

      {personalMessage && (
        <InfoBox variant="default">
          <div
            style={{
              fontStyle: 'italic',
              color: theme.colors.gray[700],
            }}
          >
            "{personalMessage}"
          </div>
          <div
            style={{
              color: theme.colors.gray[500],
              fontSize: theme.typography.sizes.sm,
              marginTop: theme.spacing[2],
            }}
          >
            — {inviterName}
          </div>
        </InfoBox>
      )}

      {projectDescription && (
        <>
          <H2>About This Project</H2>
          <Paragraph>{projectDescription}</Paragraph>
        </>
      )}

      <EmailButton href={acceptUrl}>Accept Invitation</EmailButton>

      <MutedText style={{ textAlign: 'center' }}>
        {projectUrl && (
          <>
            <a href={projectUrl} style={theme.styles.link}>
              View project details
            </a>
            {' | '}
          </>
        )}
        <a href={declineUrl} style={{ ...theme.styles.link, color: theme.colors.gray[500] }}>
          Decline invitation
        </a>
      </MutedText>
    </EmailLayout>
  );
}

// ============================================================================
// PREVIEW DATA (for development)
// ============================================================================

ProjectInviteEmail.PreviewProps = {
  firstName: 'Alex',
  inviterName: 'Sarah Johnson',
  projectName: 'Onboarding Course Redesign',
  projectDescription:
    "We're redesigning the new employee onboarding course to make it more engaging and interactive. Looking for an experienced ID to help with assessment design.",
  role: 'Collaborator',
  acceptUrl: 'https://lxd360.com/inspire/projects/abc123/accept',
  declineUrl: 'https://lxd360.com/inspire/projects/abc123/decline',
  projectUrl: 'https://lxd360.com/inspire/projects/abc123',
  personalMessage:
    'I loved your work on the compliance training. Would love to have you on this project!',
} as ProjectInviteEmailProps;

export default ProjectInviteEmail;
