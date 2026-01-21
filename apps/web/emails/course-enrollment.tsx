/**
 * =============================================================================
 * LXP360-SaaS | Course Enrollment Email Template
 * =============================================================================
 *
 * Sent when a user enrolls in a course
 */

import { Button, Column, Img, Link, Row, Section, Text } from '@react-email/components';
import {
  BaseLayout,
  buttonPrimary,
  colors,
  heading,
  mutedParagraph,
  paragraph,
} from './components/base-layout';

interface CourseEnrollmentEmailProps {
  firstName: string;
  courseName: string;
  courseDescription?: string;
  courseUrl: string;
  courseThumbnail?: string;
  instructorName?: string;
  instructorTitle?: string;
  instructorAvatar?: string;
  estimatedDuration?: string;
  modulesCount?: number;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lxd360.com';

export function CourseEnrollmentEmail({
  firstName = 'there',
  courseName = 'Introduction to Learning Design',
  courseDescription = 'Master the fundamentals of creating effective learning experiences.',
  courseUrl = `${baseUrl}/courses/example`,
  courseThumbnail = `${baseUrl}/images/course-placeholder.png`,
  instructorName = 'Dr. Sarah Johnson',
  instructorTitle = 'Learning Design Expert',
  instructorAvatar,
  estimatedDuration = '4 weeks',
  modulesCount = 8,
}: CourseEnrollmentEmailProps) {
  return (
    <BaseLayout preview={`You're enrolled! Start learning ${courseName}`}>
      <Text style={heading}>You&apos;re Enrolled! 🎓</Text>

      <Text style={paragraph}>Hi {firstName},</Text>

      <Text style={paragraph}>
        Great news! You&apos;ve been successfully enrolled in <strong>{courseName}</strong>. You can
        start learning right away.
      </Text>

      {/* Course Card */}
      <Section style={courseCard}>
        {courseThumbnail && (
          <Img
            src={courseThumbnail}
            width="536"
            height="200"
            alt={courseName}
            style={courseThumbnailStyle}
          />
        )}
        <Section style={courseContent}>
          <Text style={courseTitle}>{courseName}</Text>
          {courseDescription && <Text style={courseDesc}>{courseDescription}</Text>}

          <Row style={courseDetails}>
            {estimatedDuration && (
              <Column style={detailColumn}>
                <Text style={detailLabel}>Duration</Text>
                <Text style={detailValue}>📅 {estimatedDuration}</Text>
              </Column>
            )}
            {modulesCount && (
              <Column style={detailColumn}>
                <Text style={detailLabel}>Modules</Text>
                <Text style={detailValue}>📚 {modulesCount} modules</Text>
              </Column>
            )}
          </Row>
        </Section>
      </Section>

      {/* Instructor Info */}
      {instructorName && (
        <Section style={instructorSection}>
          <Row>
            <Column style={instructorAvatarColumn}>
              {instructorAvatar ? (
                <Img
                  src={instructorAvatar}
                  width="48"
                  height="48"
                  alt={instructorName}
                  style={instructorAvatarImg}
                />
              ) : (
                <Section style={instructorAvatarPlaceholder}>
                  <Text style={instructorInitial}>{instructorName.charAt(0)}</Text>
                </Section>
              )}
            </Column>
            <Column style={instructorInfo}>
              <Text style={instructorNameText}>Your Instructor</Text>
              <Text style={instructorFullName}>{instructorName}</Text>
              {instructorTitle && <Text style={instructorTitleText}>{instructorTitle}</Text>}
            </Column>
          </Row>
        </Section>
      )}

      <Section style={buttonContainer}>
        <Button href={courseUrl} style={buttonPrimary}>
          Start Learning
        </Button>
      </Section>

      <Section style={tipsSection}>
        <Text style={tipsHeading}>Tips for Success:</Text>
        <Text style={tipItem}>✓ Set aside dedicated learning time each day</Text>
        <Text style={tipItem}>✓ Complete each module before moving on</Text>
        <Text style={tipItem}>✓ Take notes and participate in discussions</Text>
        <Text style={tipItem}>✓ Reach out if you have questions</Text>
      </Section>

      <Text style={mutedParagraph}>
        Need help? Visit our{' '}
        <Link href={`${baseUrl}/support`} style={link}>
          support center
        </Link>{' '}
        or reply to this email.
      </Text>

      <Text style={paragraph}>
        Happy learning!
        <br />
        The LXD360 Team
      </Text>
    </BaseLayout>
  );
}

// Additional styles
const courseCard = {
  backgroundColor: colors.white,
  border: `1px solid ${colors.border}`,
  borderRadius: '8px',
  overflow: 'hidden' as const,
  margin: '24px 0',
};

const courseThumbnailStyle = {
  width: '100%',
  height: 'auto',
  maxHeight: '200px',
  objectFit: 'cover' as const,
};

const courseContent = {
  padding: '20px',
};

const courseTitle = {
  color: colors.textDarkHeading,
  fontSize: '18px',
  fontWeight: '600',
  lineHeight: '1.3',
  margin: '0 0 8px 0',
};

const courseDesc = {
  color: colors.textDarkSecondary,
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '0 0 16px 0',
};

const courseDetails = {
  marginTop: '12px',
};

const detailColumn = {
  width: '50%',
};

const detailLabel = {
  color: colors.textDarkMuted,
  fontSize: '12px',
  margin: '0 0 2px 0',
};

const detailValue = {
  color: colors.textDark,
  fontSize: '14px',
  fontWeight: '500',
  margin: '0',
};

const instructorSection = {
  backgroundColor: colors.lightCard,
  borderRadius: '8px',
  padding: '16px 20px',
  margin: '20px 0',
};

const instructorAvatarColumn = {
  width: '60px',
  verticalAlign: 'top' as const,
};

const instructorAvatarImg = {
  borderRadius: '50%',
};

const instructorAvatarPlaceholder = {
  width: '48px',
  height: '48px',
  backgroundColor: colors.lxdBlue,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const instructorInitial = {
  color: colors.white,
  fontSize: '20px',
  fontWeight: '600',
  textAlign: 'center' as const,
  lineHeight: '48px',
  margin: '0',
};

const instructorInfo = {
  paddingLeft: '12px',
  verticalAlign: 'top' as const,
};

const instructorNameText = {
  color: colors.textDarkMuted,
  fontSize: '12px',
  margin: '0 0 4px 0',
};

const instructorFullName = {
  color: colors.textDarkHeading,
  fontSize: '16px',
  fontWeight: '600',
  margin: '0',
};

const instructorTitleText = {
  color: colors.textDarkSecondary,
  fontSize: '13px',
  margin: '2px 0 0 0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const tipsSection = {
  backgroundColor: colors.lightPage,
  borderRadius: '8px',
  padding: '16px 20px',
  margin: '24px 0',
};

const tipsHeading = {
  color: colors.textDarkHeading,
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 12px 0',
};

const tipItem = {
  color: colors.textDark,
  fontSize: '13px',
  lineHeight: '1.5',
  margin: '0 0 6px 0',
};

const link = {
  color: colors.lxdBlue,
  textDecoration: 'none',
};

export default CourseEnrollmentEmail;
