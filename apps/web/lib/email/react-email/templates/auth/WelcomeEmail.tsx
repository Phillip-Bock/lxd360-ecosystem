import {
  EmailButton,
  EmailLayout,
  H1,
  ListItem,
  MutedText,
  Paragraph,
  UnorderedList,
} from '../../components';
import { theme } from '../../theme';

// ============================================================================
// TYPES
// ============================================================================

export interface WelcomeEmailProps {
  /** User's first name */
  firstName: string;
  /** User's email address */
  email: string;
  /** URL to log in */
  loginUrl: string;
  /** Optional unsubscribe URL */
  unsubscribeUrl?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function WelcomeEmail({ firstName, loginUrl, unsubscribeUrl }: WelcomeEmailProps) {
  const previewText = `Welcome to LXD360, ${firstName}! Your account is ready.`;

  return (
    <EmailLayout preview={previewText} unsubscribeUrl={unsubscribeUrl}>
      <H1>Welcome to LXD360, {firstName}!</H1>

      <Paragraph>
        We're thrilled to have you on board. Your account has been created successfully, and you're
        now ready to explore everything LXD360 has to offer.
      </Paragraph>

      <Paragraph>Here's what you can do next:</Paragraph>

      <UnorderedList>
        <ListItem>Complete your profile to get personalized recommendations</ListItem>
        <ListItem>Explore our learning catalog and discover courses</ListItem>
        <ListItem>Connect with other learning professionals on Nexus</ListItem>
        <ListItem>Try INSPIRE Studio to create engaging content</ListItem>
      </UnorderedList>

      <EmailButton href={loginUrl}>Get Started</EmailButton>

      <MutedText>
        If you have unknown questions, our support team is here to help. Just reply to this email or
        visit our{' '}
        <a href={theme.urls.support} style={theme.styles.link}>
          support center
        </a>
        .
      </MutedText>
    </EmailLayout>
  );
}

// ============================================================================
// PREVIEW DATA (for development)
// ============================================================================

WelcomeEmail.PreviewProps = {
  firstName: 'Alex',
  email: 'alex@example.com',
  loginUrl: 'https://lxd360.com/dashboard',
} as WelcomeEmailProps;

export default WelcomeEmail;
