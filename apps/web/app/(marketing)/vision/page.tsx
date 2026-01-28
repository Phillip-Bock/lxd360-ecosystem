/**
 * About Page (app/about/page.tsx)
 * ==================================
 * Company story, mission, values, and team.
 * Creative, tech-focused design with advanced animations.
 *
 * Sections:
 * 1. Hero - Three parallax sections with sticky images
 * 2. Founder Section
 * 3. Company Values (L.E.A.R.N. Framework)
 * 4. Services Section (Kloudexa)
 * 5. Results Section (Kloudexa)
 * 6. Features Section (Kloudexa)
 * 7. Integration Section (Kloudexa)
 * 8. FAQ Section (Kloudexa)
 * 9. Global Reach (3D Earth)
 * 10. CTA Section
 */

import type { Metadata } from 'next';
import { AboutCTASection } from '@/components/marketing/about/about-cta-section';
import { AboutFAQSection } from '@/components/marketing/about/about-faq-section';
import { AboutFeaturesSection } from '@/components/marketing/about/about-features-section';
import { AboutHero } from '@/components/marketing/about/about-hero';
import { AboutIntegrationSection } from '@/components/marketing/about/about-integration-section';
import { AboutResultsSection } from '@/components/marketing/about/about-results-section';
import { AboutServicesSection } from '@/components/marketing/about/about-services-section';
import { CompanyValuesSection } from '@/components/marketing/about/company-values-section';
import { FounderSection } from '@/components/marketing/about/founder-section';
import { GlobalReachSectionWrapper } from '@/components/marketing/about/global-reach-section-wrapper';
import { getAboutPage } from '@/lib/content';

export const metadata: Metadata = {
  title: 'About Us - The Architecture of Inspired Learning',
  description:
    'Transforming global L&D from static content and costly silos into a dynamic, learner-centric force for growth. Empathy meets neuroscience for limitless human potential.',
  openGraph: {
    title: 'About LXD360 - The Architecture of Inspired Learning',
    description:
      'Transforming global L&D from static content and costly silos into a dynamic, learner-centric force for growth.',
  },
};

export default async function AboutPage(): Promise<React.JSX.Element> {
  // Fetch About page data from content service
  const aboutData = await getAboutPage();

  return (
    <main className="min-h-screen">
      {/* Hero Section - Parallax sticky images with overlay text */}
      <AboutHero heroSections={aboutData?.heroSections} />

      {/* Founder Section */}
      <FounderSection
        badge={aboutData?.founderBadge}
        name={aboutData?.founderName}
        title={aboutData?.founderTitle}
        image={aboutData?.founderImage}
        bio={aboutData?.founderBio}
        socialLinks={aboutData?.founderSocialLinks}
        credentialIcons={aboutData?.founderCredentialIcons}
        credentialBadges={aboutData?.founderCredentialBadges}
      />

      {/* Company Values Section - L.E.A.R.N. Framework */}
      <CompanyValuesSection
        badge={aboutData?.valuesBadge}
        heading={aboutData?.valuesHeading}
        values={aboutData?.valuesItems}
      />

      {/* Services Section - 3 service cards with hover animations */}
      <AboutServicesSection
        badge={aboutData?.servicesBadge}
        headline={aboutData?.servicesHeadline}
        description={aboutData?.servicesDescription}
        services={aboutData?.servicesItems}
      />

      {/* Results Section - Feature list with connected result cards */}
      <AboutResultsSection
        badge={aboutData?.resultsBadge}
        headline={aboutData?.resultsHeadline}
        description={aboutData?.resultsDescription}
        features={aboutData?.resultsFeatures}
        resultCards={aboutData?.resultsCards}
      />

      {/* Features Section - 3 cards with rotating icon carousels */}
      <AboutFeaturesSection
        badge={aboutData?.featuresBadge}
        headline={aboutData?.featuresHeadline}
        description={aboutData?.featuresDescription}
        features={aboutData?.featuresCards}
      />

      {/* Integration Section - Process flow with numbered benefits */}
      <AboutIntegrationSection
        badge={aboutData?.integrationBadge}
        headline={aboutData?.integrationHeadline}
        description={aboutData?.integrationDescription}
        benefits={aboutData?.integrationBenefits}
        image={aboutData?.integrationImage?.asset?.url}
      />

      {/* FAQ Section - Accordion-style Q&A */}
      <AboutFAQSection
        badge={aboutData?.faqBadge}
        headline={aboutData?.faqHeadline}
        description={aboutData?.faqDescription}
        faqs={aboutData?.faqItems}
      />

      {/* Global Reach Section - 3D Earth */}
      <GlobalReachSectionWrapper />

      {/* CTA Section - Final call to action */}
      <AboutCTASection
        badge={aboutData?.ctaBadge}
        headline={aboutData?.ctaHeadline}
        subtitle={aboutData?.ctaSubtitle}
        description={aboutData?.ctaDescription}
        stats={aboutData?.ctaStats}
        trustIndicators={aboutData?.ctaTrustIndicators}
      />
    </main>
  );
}
