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

export interface CourseAnnouncementEmailProps {
  /** User's first name */
  firstName: string;
  /** Course title */
  courseTitle: string;
  /** Course description */
  courseDescription: string;
  /** Course instructor name */
  instructorName?: string;
  /** Course duration (e.g., "6 weeks", "12 hours") */
  duration?: string;
  /** Course level (e.g., "Beginner", "Intermediate", "Advanced") */
  level?: string;
  /** Course start date */
  startDate?: string;
  /** Number of lessons or modules */
  lessonsCount?: number;
  /** Course thumbnail/image URL */
  thumbnailUrl?: string;
  /** URL to view course details */
  courseUrl: string;
  /** URL to enroll in course */
  enrollUrl: string;
  /** Optional unsubscribe URL */
  unsubscribeUrl?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function CourseAnnouncementEmail({
  firstName,
  courseTitle,
  courseDescription,
  instructorName,
  duration,
  level,
  startDate,
  lessonsCount,
  thumbnailUrl,
  courseUrl,
  enrollUrl,
  unsubscribeUrl,
}: CourseAnnouncementEmailProps) {
  const previewText = `New course available: ${courseTitle}`;

  return (
    <EmailLayout preview={previewText} unsubscribeUrl={unsubscribeUrl}>
      <H1>🎓 New Course Available</H1>

      <Paragraph>Hi {firstName},</Paragraph>

      <Paragraph>We're excited to announce a new course that's now available on LXD360!</Paragraph>

      <H2>{courseTitle}</H2>

      <Paragraph>{courseDescription}</Paragraph>

      {thumbnailUrl && (
        <div style={{ margin: '24px 0', textAlign: 'center' }}>
          <img
            src={thumbnailUrl}
            alt={courseTitle}
            style={{
              maxWidth: '100%',
              height: 'auto',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            }}
          />
        </div>
      )}

      <InfoBox variant="info">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {instructorName && (
            <div style={{ fontSize: '14px' }}>
              <strong>Instructor:</strong> {instructorName}
            </div>
          )}
          {level && (
            <div style={{ fontSize: '14px' }}>
              <strong>Level:</strong> {level}
            </div>
          )}
          {duration && (
            <div style={{ fontSize: '14px' }}>
              <strong>Duration:</strong> {duration}
            </div>
          )}
          {lessonsCount && (
            <div style={{ fontSize: '14px' }}>
              <strong>Lessons:</strong> {lessonsCount} modules
            </div>
          )}
          {startDate && (
            <div style={{ fontSize: '14px' }}>
              <strong>Starts:</strong> {startDate}
            </div>
          )}
        </div>
      </InfoBox>

      <EmailButton href={enrollUrl}>Enroll Now</EmailButton>

      <Divider />

      <Paragraph style={{ fontSize: '14px' }}>
        Want to learn more before enrolling?{' '}
        <a href={courseUrl} style={theme.styles.link}>
          View course details
        </a>
      </Paragraph>

      <MutedText>
        This course was curated based on your interests and learning goals. If you have unknown
        questions, feel free to reach out to our support team.
      </MutedText>
    </EmailLayout>
  );
}

// ============================================================================
// PREVIEW DATA (for development)
// ============================================================================

CourseAnnouncementEmail.PreviewProps = {
  firstName: 'Alex',
  courseTitle: 'Advanced Instructional Design with AI',
  courseDescription:
    'Master the art of creating engaging learning experiences using AI-powered tools and the latest instructional design methodologies.',
  instructorName: 'Dr. Sarah Johnson',
  duration: '8 weeks',
  level: 'Intermediate',
  startDate: 'January 15, 2025',
  lessonsCount: 24,
  thumbnailUrl: 'https://placehold.co/600x300/2563eb/ffffff?text=Course+Image',
  courseUrl: 'https://lxd360.com/courses/advanced-id-ai',
  enrollUrl: 'https://lxd360.com/courses/advanced-id-ai/enroll',
} as CourseAnnouncementEmailProps;

export default CourseAnnouncementEmail;
