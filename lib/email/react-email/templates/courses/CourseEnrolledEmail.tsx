import {
  EmailButton,
  EmailLayout,
  H1,
  H2,
  InfoBox,
  InfoRow,
  MutedText,
  Paragraph,
} from '../../components';

// ============================================================================
// TYPES
// ============================================================================

export interface CourseEnrolledEmailProps {
  /** User's first name */
  firstName: string;
  /** Course name */
  courseName: string;
  /** URL to access the course */
  courseUrl: string;
  /** Instructor name */
  instructorName?: string;
  /** Course start date */
  startDate?: string;
  /** Course description */
  description?: string;
  /** Estimated duration */
  duration?: string;
  /** Optional unsubscribe URL */
  unsubscribeUrl?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function CourseEnrolledEmail({
  firstName,
  courseName,
  courseUrl,
  instructorName,
  startDate,
  description,
  duration,
  unsubscribeUrl,
}: CourseEnrolledEmailProps) {
  const previewText = `You're enrolled in ${courseName}!`;

  return (
    <EmailLayout preview={previewText} unsubscribeUrl={unsubscribeUrl}>
      <H1>Welcome to {courseName}!</H1>

      <Paragraph>Hi {firstName},</Paragraph>

      <Paragraph>
        You've been successfully enrolled in this course. We're excited to have you on this learning
        journey!
      </Paragraph>

      <InfoBox variant="default">
        {instructorName && <InfoRow label="Instructor" value={instructorName} />}
        {startDate && <InfoRow label="Start Date" value={startDate} />}
        {duration && <InfoRow label="Duration" value={duration} showDivider={false} />}
      </InfoBox>

      {description && (
        <>
          <H2>About This Course</H2>
          <Paragraph>{description}</Paragraph>
        </>
      )}

      <EmailButton href={courseUrl}>Start Learning</EmailButton>

      <MutedText>You can access your course anytime from your dashboard. Happy learning!</MutedText>
    </EmailLayout>
  );
}

// ============================================================================
// PREVIEW DATA (for development)
// ============================================================================

CourseEnrolledEmail.PreviewProps = {
  firstName: 'Alex',
  courseName: 'Introduction to Instructional Design',
  courseUrl: 'https://lxd360.com/courses/intro-id',
  instructorName: 'Dr. Sarah Johnson',
  startDate: 'December 15, 2024',
  duration: '8 weeks',
  description:
    'Learn the fundamentals of instructional design, including needs analysis, learning objectives, and assessment strategies.',
} as CourseEnrolledEmailProps;

export default CourseEnrolledEmail;
