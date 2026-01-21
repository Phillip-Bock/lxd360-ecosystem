import { EmailButton, EmailLayout, H1, MutedText, Paragraph, ProgressBar } from '../../components';

// ============================================================================
// TYPES
// ============================================================================

export interface ProgressReminderEmailProps {
  /** User's first name */
  firstName: string;
  /** Course name */
  courseName: string;
  /** Current progress percentage (0-100) */
  progress: number;
  /** URL to continue the course */
  continueUrl: string;
  /** Days since last activity */
  daysSinceActivity?: number;
  /** Next lesson/module name */
  nextLessonName?: string;
  /** Optional unsubscribe URL */
  unsubscribeUrl?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ProgressReminderEmail({
  firstName,
  courseName,
  progress,
  continueUrl,
  daysSinceActivity,
  nextLessonName,
  unsubscribeUrl,
}: ProgressReminderEmailProps) {
  const previewText = `Continue your progress in ${courseName} - ${progress}% complete`;

  // Determine the message based on progress
  let progressMessage: string;
  if (progress < 25) {
    progressMessage = "You've made a great start!";
  } else if (progress < 50) {
    progressMessage = "You're making good progress!";
  } else if (progress < 75) {
    progressMessage = "You're more than halfway there!";
  } else if (progress < 100) {
    progressMessage = "You're almost at the finish line!";
  } else {
    progressMessage = "Amazing! You've completed the course!";
  }

  return (
    <EmailLayout preview={previewText} unsubscribeUrl={unsubscribeUrl}>
      <H1>Continue Your Learning Journey</H1>

      <Paragraph>Hi {firstName},</Paragraph>

      <Paragraph>
        {daysSinceActivity
          ? `It's been ${daysSinceActivity} days since you last visited "${courseName}". `
          : ''}
        {progressMessage} You're <strong>{progress}%</strong> complete.
      </Paragraph>

      <ProgressBar
        value={progress}
        label={courseName}
        color={progress >= 75 ? 'success' : 'primary'}
      />

      {nextLessonName && (
        <Paragraph>
          <strong>Up next:</strong> {nextLessonName}
        </Paragraph>
      )}

      <Paragraph>Don't lose your momentum! Continue where you left off.</Paragraph>

      <EmailButton href={continueUrl}>Continue Learning</EmailButton>

      <MutedText>
        Consistent learning leads to better retention. Even 15 minutes a day can make a big
        difference!
      </MutedText>
    </EmailLayout>
  );
}

// ============================================================================
// PREVIEW DATA (for development)
// ============================================================================

ProgressReminderEmail.PreviewProps = {
  firstName: 'Alex',
  courseName: 'Introduction to Instructional Design',
  progress: 45,
  continueUrl: 'https://lxd360.com/courses/intro-id/continue',
  daysSinceActivity: 5,
  nextLessonName: 'Module 3: Writing Learning Objectives',
} as ProgressReminderEmailProps;

export default ProgressReminderEmail;
