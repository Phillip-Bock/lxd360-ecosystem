import {
  EmailButton,
  EmailLayout,
  H1,
  InfoBox,
  InfoRow,
  MutedText,
  Paragraph,
} from '../../components';
import { theme } from '../../theme';

// ============================================================================
// TYPES
// ============================================================================

export interface SessionReminderEmailProps {
  /** Recipient's first name */
  firstName: string;
  /** Name of the session partner */
  partnerName: string;
  /** Session date (formatted string) */
  sessionDate: string;
  /** Session time (formatted string) */
  sessionTime: string;
  /** Session duration */
  duration?: string;
  /** Session topic/agenda */
  topic?: string;
  /** URL to join the meeting */
  meetingUrl?: string;
  /** URL to reschedule */
  rescheduleUrl: string;
  /** URL to cancel */
  cancelUrl?: string;
  /** Time until session (e.g., "1 hour", "30 minutes") */
  timeUntil?: string;
  /** Optional unsubscribe URL */
  unsubscribeUrl?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function SessionReminderEmail({
  firstName,
  partnerName,
  sessionDate,
  sessionTime,
  duration,
  topic,
  meetingUrl,
  rescheduleUrl,
  cancelUrl,
  timeUntil,
  unsubscribeUrl,
}: SessionReminderEmailProps) {
  const previewText = `Reminder: Session with ${partnerName} ${timeUntil ? `in ${timeUntil}` : `on ${sessionDate}`}`;

  return (
    <EmailLayout preview={previewText} unsubscribeUrl={unsubscribeUrl}>
      <H1>Upcoming Session Reminder</H1>

      <Paragraph>Hi {firstName},</Paragraph>

      <Paragraph>
        This is a reminder about your upcoming session with <strong>{partnerName}</strong>
        {timeUntil && ` in ${timeUntil}`}.
      </Paragraph>

      <InfoBox variant="info">
        <InfoRow label="Date" value={sessionDate} />
        <InfoRow label="Time" value={sessionTime} />
        {duration && <InfoRow label="Duration" value={duration} />}
        <InfoRow label="With" value={partnerName} showDivider={!!topic} />
        {topic && <InfoRow label="Topic" value={topic} showDivider={false} />}
      </InfoBox>

      {meetingUrl && <EmailButton href={meetingUrl}>Join Session</EmailButton>}

      <MutedText style={{ textAlign: 'center' }}>
        Need to change the time?{' '}
        <a href={rescheduleUrl} style={theme.styles.link}>
          Reschedule session
        </a>
        {cancelUrl && (
          <>
            {' | '}
            <a href={cancelUrl} style={{ ...theme.styles.link, color: theme.colors.gray[500] }}>
              Cancel
            </a>
          </>
        )}
      </MutedText>

      <MutedText>
        Please join the meeting a few minutes early to ensure everything is working properly.
      </MutedText>
    </EmailLayout>
  );
}

// ============================================================================
// PREVIEW DATA (for development)
// ============================================================================

SessionReminderEmail.PreviewProps = {
  firstName: 'Alex',
  partnerName: 'Sarah Johnson',
  sessionDate: 'December 10, 2024',
  sessionTime: '2:00 PM EST',
  duration: '30 minutes',
  topic: 'Career Development Discussion',
  meetingUrl: 'https://meet.lxd360.com/abc123',
  rescheduleUrl: 'https://lxd360.com/nexus/sessions/abc123/reschedule',
  cancelUrl: 'https://lxd360.com/nexus/sessions/abc123/cancel',
  timeUntil: '1 hour',
} as SessionReminderEmailProps;

export default SessionReminderEmail;
