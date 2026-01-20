import {
  EmailButton,
  EmailLayout,
  H1,
  HighlightBox,
  InfoBox,
  MutedText,
  Paragraph,
} from '../../components';
import { theme } from '../../theme';

// ============================================================================
// TYPES
// ============================================================================

export interface AssessmentCompleteEmailProps {
  /** User's first name */
  firstName: string;
  /** Assessment name */
  assessmentName: string;
  /** Associated course name */
  courseName?: string;
  /** Score achieved */
  score: number;
  /** Maximum possible score */
  maxScore?: number;
  /** Percentage score */
  percentage?: number;
  /** Whether the user passed */
  passed: boolean;
  /** Passing threshold percentage */
  passingThreshold?: number;
  /** URL to view certificate (if passed) */
  certificateUrl?: string;
  /** URL to retake assessment (if failed) */
  retakeUrl?: string;
  /** URL to view results */
  resultsUrl?: string;
  /** Optional unsubscribe URL */
  unsubscribeUrl?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function AssessmentCompleteEmail({
  firstName,
  assessmentName,
  courseName,
  score,
  maxScore,
  percentage,
  passed,
  passingThreshold,
  certificateUrl,
  retakeUrl,
  resultsUrl,
  unsubscribeUrl,
}: AssessmentCompleteEmailProps) {
  const displayScore = maxScore ? `${score}/${maxScore}` : `${percentage || score}%`;

  const previewText = passed
    ? `Congratulations! You passed ${assessmentName}`
    : `Your ${assessmentName} results are ready`;

  return (
    <EmailLayout preview={previewText} unsubscribeUrl={unsubscribeUrl}>
      <H1>Assessment Results</H1>

      <Paragraph>Hi {firstName},</Paragraph>

      <Paragraph>
        You've completed the assessment "{assessmentName}"{courseName ? ` for ${courseName}` : ''}.
      </Paragraph>

      {/* Score Display */}
      <HighlightBox
        value={displayScore}
        label={passed ? 'PASSED' : 'NOT PASSED'}
        color={passed ? 'success' : 'error'}
      />

      {passingThreshold && (
        <MutedText style={{ textAlign: 'center' }}>Passing score: {passingThreshold}%</MutedText>
      )}

      {/* Result Message */}
      {passed ? (
        <InfoBox variant="success">
          <strong>Congratulations!</strong> You've successfully passed this assessment. Great work!
        </InfoBox>
      ) : (
        <InfoBox variant="warning">
          <strong>Don't give up!</strong> Review the material and try again. You can do this!
        </InfoBox>
      )}

      {/* Action Buttons */}
      {passed && certificateUrl && (
        <EmailButton href={certificateUrl}>View Certificate</EmailButton>
      )}

      {!passed && retakeUrl && (
        <>
          <Paragraph>
            Don't worry! You can retake this assessment after reviewing the course materials.
          </Paragraph>
          <EmailButton href={retakeUrl}>Retake Assessment</EmailButton>
        </>
      )}

      {resultsUrl && (
        <MutedText>
          <a href={resultsUrl} style={theme.styles.link}>
            View detailed results
          </a>
        </MutedText>
      )}
    </EmailLayout>
  );
}

// ============================================================================
// PREVIEW DATA (for development)
// ============================================================================

AssessmentCompleteEmail.PreviewProps = {
  firstName: 'Alex',
  assessmentName: 'Module 3 Quiz',
  courseName: 'Introduction to Instructional Design',
  score: 85,
  maxScore: 100,
  percentage: 85,
  passed: true,
  passingThreshold: 70,
  certificateUrl: 'https://lxd360.com/certificates/abc123',
  resultsUrl: 'https://lxd360.com/assessments/xyz/results',
} as AssessmentCompleteEmailProps;

export default AssessmentCompleteEmail;
