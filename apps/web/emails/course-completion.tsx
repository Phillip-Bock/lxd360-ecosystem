/**
 * =============================================================================
 * LXP360-SaaS | Course Completion Email Template
 * =============================================================================
 *
 * Sent when a user completes a course
 */

import { Button, Column, Link, Row, Section, Text } from '@react-email/components';
import {
  BaseLayout,
  buttonPrimary,
  buttonSecondary,
  colors,
  heading,
  mutedParagraph,
  paragraph,
  successBox,
} from './components/base-layout';

interface CourseCompletionEmailProps {
  firstName: string;
  courseName: string;
  courseUrl: string;
  completionDate: string;
  certificateUrl?: string;
  finalScore?: number;
  timeSpent?: string;
  recommendedCourses?: Array<{
    name: string;
    url: string;
    thumbnail?: string;
  }>;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lxd360.com';

export function CourseCompletionEmail({
  firstName = 'there',
  courseName = 'Introduction to Learning Design',
  completionDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }),
  certificateUrl,
  finalScore,
  timeSpent = '12 hours',
  recommendedCourses = [
    {
      name: 'Advanced Instructional Design',
      url: `${baseUrl}/courses/advanced-id`,
    },
    {
      name: 'eLearning Development',
      url: `${baseUrl}/courses/elearning-dev`,
    },
  ],
}: CourseCompletionEmailProps) {
  return (
    <BaseLayout preview={`Congratulations! You've completed ${courseName}`}>
      <Section style={celebrationBanner}>
        <Text style={celebrationEmoji}>🎉</Text>
      </Section>

      <Text style={heading}>Congratulations, {firstName}!</Text>

      <Text style={paragraph}>
        You&apos;ve successfully completed <strong>{courseName}</strong>! This is a great
        achievement and we&apos;re proud of your dedication to learning.
      </Text>

      <Section style={successBox}>
        <Text style={successText}>
          <strong>Course Completed!</strong> You now have access to all course materials and can
          revisit them anytime.
        </Text>
      </Section>

      {/* Achievement Stats */}
      <Section style={statsSection}>
        <Row>
          <Column style={statColumn}>
            <Text style={statValue}>{completionDate}</Text>
            <Text style={statLabel}>Completed On</Text>
          </Column>
          {timeSpent && (
            <Column style={statColumn}>
              <Text style={statValue}>{timeSpent}</Text>
              <Text style={statLabel}>Time Invested</Text>
            </Column>
          )}
          {finalScore !== undefined && (
            <Column style={statColumn}>
              <Text style={statValue}>{finalScore}%</Text>
              <Text style={statLabel}>Final Score</Text>
            </Column>
          )}
        </Row>
      </Section>

      {/* Certificate Button */}
      {certificateUrl && (
        <Section style={certificateSection}>
          <Section style={certificateCard}>
            <Row>
              <Column style={certificateIconColumn}>
                <Text style={certificateIcon}>🏆</Text>
              </Column>
              <Column style={certificateContent}>
                <Text style={certificateTitle}>Your Certificate is Ready!</Text>
                <Text style={certificateDesc}>
                  Download your certificate of completion to share your achievement.
                </Text>
              </Column>
            </Row>
            <Section style={certificateButtonContainer}>
              <Button href={certificateUrl} style={buttonPrimary}>
                Download Certificate
              </Button>
            </Section>
          </Section>
        </Section>
      )}

      {/* Recommended Courses */}
      {recommendedCourses && recommendedCourses.length > 0 && (
        <Section style={recommendedSection}>
          <Text style={recommendedHeading}>Continue Your Learning Journey</Text>
          <Text style={recommendedDesc}>
            Based on your interests, we think you&apos;ll love these courses:
          </Text>

          {recommendedCourses.map((course, index) => (
            <Section key={index} style={recommendedCourse}>
              <Row>
                <Column style={recommendedCourseInfo}>
                  <Text style={recommendedCourseName}>{course.name}</Text>
                </Column>
                <Column style={recommendedCourseAction}>
                  <Link href={course.url} style={viewCourseLink}>
                    View →
                  </Link>
                </Column>
              </Row>
            </Section>
          ))}
        </Section>
      )}

      <Section style={buttonContainer}>
        <Button href={`${baseUrl}/courses`} style={buttonSecondary}>
          Explore More Courses
        </Button>
      </Section>

      <Text style={mutedParagraph}>
        Share your achievement! You can share your completion on LinkedIn and other social platforms
        directly from your{' '}
        <Link href={`${baseUrl}/dashboard/achievements`} style={link}>
          achievements page
        </Link>
        .
      </Text>

      <Text style={paragraph}>
        Keep up the great work!
        <br />
        The LXD360 Team
      </Text>
    </BaseLayout>
  );
}

// Additional styles
const celebrationBanner = {
  textAlign: 'center' as const,
  padding: '20px 0',
};

const celebrationEmoji = {
  fontSize: '48px',
  margin: '0',
};

const successText = {
  color: '#065F46',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0',
};

const statsSection = {
  backgroundColor: colors.lightCard,
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const statColumn = {
  textAlign: 'center' as const,
  padding: '0 8px',
};

const statValue = {
  color: colors.lxdBlue,
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 4px 0',
};

const statLabel = {
  color: colors.textDarkMuted,
  fontSize: '12px',
  margin: '0',
};

const certificateSection = {
  margin: '32px 0',
};

const certificateCard = {
  background: `linear-gradient(135deg, ${colors.lxdBlue} 0%, ${colors.lxdPurple} 100%)`,
  borderRadius: '12px',
  padding: '24px',
};

const certificateIconColumn = {
  width: '60px',
  verticalAlign: 'top' as const,
};

const certificateIcon = {
  fontSize: '40px',
  margin: '0',
};

const certificateContent = {
  paddingLeft: '12px',
  verticalAlign: 'top' as const,
};

const certificateTitle = {
  color: colors.white,
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 4px 0',
};

const certificateDesc = {
  color: 'rgba(255, 255, 255, 0.9)',
  fontSize: '14px',
  margin: '0',
};

const certificateButtonContainer = {
  marginTop: '16px',
};

const recommendedSection = {
  margin: '32px 0',
};

const recommendedHeading = {
  color: colors.textDarkHeading,
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 8px 0',
};

const recommendedDesc = {
  color: colors.textDarkSecondary,
  fontSize: '14px',
  margin: '0 0 16px 0',
};

const recommendedCourse = {
  backgroundColor: colors.lightPage,
  borderRadius: '6px',
  padding: '12px 16px',
  marginBottom: '8px',
};

const recommendedCourseInfo = {
  verticalAlign: 'middle' as const,
};

const recommendedCourseName = {
  color: colors.textDark,
  fontSize: '14px',
  fontWeight: '500',
  margin: '0',
};

const recommendedCourseAction = {
  textAlign: 'right' as const,
  verticalAlign: 'middle' as const,
  width: '60px',
};

const viewCourseLink = {
  color: colors.lxdBlue,
  fontSize: '14px',
  fontWeight: '500',
  textDecoration: 'none',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const link = {
  color: colors.lxdBlue,
  textDecoration: 'none',
};

export default CourseCompletionEmail;
