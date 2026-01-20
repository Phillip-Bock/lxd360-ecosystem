/**
 * Home Page (app/page.tsx)
 * ========================
 * The main landing page for LXD360/LXP360.
 * Content is dynamically loaded from Firestore.
 *
 * Section Order:
 * 1. HeroSection - Main banner with animated headline, CTAs, hero image with 3D tilt
 * 2. TrustedPartnersSection - Double-row infinite scrolling logo carousel (36 logos)
 * 3. KeyFeaturesSection - Bento grid of 4 cards with 3D tilt hover animation
 * 4. HowItWorksSection - 6-tab interactive section with flippable video cards
 * 5. TestimonialsSection - Auto-advancing testimonial carousel with progress bars
 * 6. PodcastSection - INSPIRE 4 Ever podcast preview with featured episodes
 * 7. IntegrationsSection - 360° visualization with floating orbs and electric arcs
 * 8. BlogSection - Featured articles carousel (3 posts)
 * 9. InfiniteScaleSection - "AI-Powered Databases Built for Infinite Scale"
 * 10. StreamlineWorkflowSection - 4 bento cards with 3D tilt
 * 11. BetterResultSection - 6-card feature grid with icons
 * 12. TransformBusinessSection - Parallax scroll with 3 cards
 * 13. SmartStorageSection - 4 capability pillars with animated underlines
 * 14. UseCasesSection - 5 tabbed use cases with transitions
 * 15. CTASection - Final call-to-action with bubble text
 *
 * Pricing sections moved to dedicated pages:
 * - /inspire-studio - INSPIRE Studio AI Authoring pricing
 * - /lxp360 - LXP360 SaaS headless LXP pricing
 * - /lxd-ecosystem - LXD360 Ecosystem bundle pricing
 * - /solutions - Consulting Services pricing
 *
 */

import { BetterResultSection } from '@/components/marketing/home/BetterResultSection';
import { BlogSection } from '@/components/marketing/home/BlogSection';
import { CTASection } from '@/components/marketing/home/CTASection';
import { HeroSection } from '@/components/marketing/home/HeroSection';
import { HowItWorksSection } from '@/components/marketing/home/HowItWorksSection';
import { InfiniteScaleSection } from '@/components/marketing/home/InfiniteScaleSection';
import { IntegrationsSection } from '@/components/marketing/home/IntegrationsSection';
import { KeyFeaturesSection } from '@/components/marketing/home/KeyFeaturesSection';
import { PodcastSection } from '@/components/marketing/home/PodcastSection';
import { SmartStorageSection } from '@/components/marketing/home/SmartStorageSection';
import { StreamlineWorkflowSection } from '@/components/marketing/home/StreamlineWorkflowSection';
import { TestimonialsSection } from '@/components/marketing/home/TestimonialsSection';
import { TransformBusinessSection } from '@/components/marketing/home/TransformBusinessSection';
import { TrustedPartnersSection } from '@/components/marketing/home/TrustedPartnersSection';
import { UseCasesSection } from '@/components/marketing/home/UseCasesSection';
import { OrganizationSchema, SoftwareApplicationSchema } from '@/components/seo/JsonLd';
import { getHomePage, getSiteSettings } from '@/lib/content';

export default async function HomePage() {
  // Fetch content from Firestore (server-side with ISR revalidation)
  const [homeData, siteSettings] = await Promise.all([getHomePage(), getSiteSettings()]);
  return (
    <main className="min-h-screen">
      {/* Structured Data for SEO - uses Firestore data with fallbacks */}
      <OrganizationSchema
        name={siteSettings?.siteName || 'LXD360'}
        description={
          siteSettings?.seoDescription ||
          "Transform workforce development with LXD360's unified learning ecosystem. AI-powered content creation, INSPIRE™ framework, VR/AR training, and verifiable ROI analytics."
        }
        url="https://lxd360.com"
        logo="https://lxd360.com/icon.svg"
        sameAs={['https://www.linkedin.com/company/lxd360', 'https://twitter.com/lxd360']}
      />
      <SoftwareApplicationSchema
        name="LXP360"
        description="AI-driven learning experience platform with LMS, LXP, authoring tools, and analytics for guaranteed skill transfer."
        applicationCategory="BusinessApplication"
        operatingSystem="Web"
        offers={{
          price: '49',
          priceCurrency: 'USD',
        }}
      />

      {/* =================================================================
          HERO SECTION
          Content from Firestore: heroBadge, heroHeadline, heroDescription,
          heroCta1, heroCta2, heroImage
      ================================================================= */}
      <HeroSection
        badge={homeData?.heroBadge}
        headline={homeData?.heroHeadline}
        description={homeData?.heroDescription}
        heroImage={homeData?.heroImage}
      />

      {/* =================================================================
          TRUSTED PARTNERS SECTION
          Content from Firestore: partnersHeading, partnerLogos
      ================================================================= */}
      <TrustedPartnersSection
        badge={homeData?.partnersBadge}
        heading={homeData?.partnersHeading}
        logos={homeData?.partnerLogos}
      />

      {/* =================================================================
          KEY FEATURES SECTION
          Content from Firestore: featuresHeading, featuresSubheading, featureCards
      ================================================================= */}
      <KeyFeaturesSection
        badge={homeData?.featuresBadge}
        heading={homeData?.featuresHeading}
        subheading={homeData?.featuresSubheading}
        cards={homeData?.featureCards}
      />

      {/* =================================================================
          HOW IT WORKS SECTION
          Content from Firestore: howItWorksHeading, howItWorksTabs
      ================================================================= */}
      <HowItWorksSection
        badge={homeData?.howItWorksBadge}
        heading={homeData?.howItWorksHeading}
        tabs={homeData?.howItWorksTabs}
      />

      {/* =================================================================
          TESTIMONIALS SECTION
          Content from Firestore: testimonialsHeading, testimonials
      ================================================================= */}
      <TestimonialsSection
        badge={homeData?.testimonialsBadge}
        heading={homeData?.testimonialsHeading}
        testimonials={homeData?.testimonials}
      />

      {/* =================================================================
          PODCAST SECTION
          INSPIRE 4 Ever Podcast preview with featured episodes
      ================================================================= */}
      <PodcastSection
        badge={homeData?.podcastBadge}
        heading={homeData?.podcastHeading}
        subheading={homeData?.podcastSubheading}
      />

      {/* =================================================================
          INTEGRATIONS SECTION
          Content from Firestore: integrationsHeading, integrationsSubheading,
          integrationLogos
      ================================================================= */}
      <IntegrationsSection
        badge={homeData?.integrationsBadge}
        heading={homeData?.integrationsHeading}
        subheading={homeData?.integrationsSubheading}
        logos={homeData?.integrationLogos}
      />

      {/* =================================================================
          BLOG SECTION
          Content from Firestore: blogHeading, blogSubheading, featuredPosts
      ================================================================= */}
      <BlogSection
        badge={homeData?.blogBadge}
        heading={homeData?.blogHeading}
        subheading={homeData?.blogSubheading}
        posts={homeData?.featuredPosts}
      />

      {/* =================================================================
          DATALOG-STYLE SECTIONS
          New sections adapted from Datalog template with animations
      ================================================================= */}

      {/* INFINITE SCALE SECTION */}
      <InfiniteScaleSection
        badge={homeData?.infiniteScaleBadge}
        headline={homeData?.infiniteScaleHeadline}
        description={homeData?.infiniteScaleDescription}
        image={homeData?.infiniteScaleImage?.asset?.url}
      />

      {/* STREAMLINE WORKFLOW SECTION */}
      <StreamlineWorkflowSection
        badge={homeData?.streamlineBadge}
        headline={homeData?.streamlineHeadline}
        description={homeData?.streamlineDescription}
        cards={homeData?.streamlineCards?.map((card) => ({
          ...card,
          image: card.image?.asset?.url,
        }))}
      />

      {/* BETTER RESULT SECTION */}
      <BetterResultSection
        badge={homeData?.betterResultBadge}
        headline={homeData?.betterResultHeadline}
        description={homeData?.betterResultDescription}
        features={homeData?.betterResultFeatures}
      />

      {/* TRANSFORM BUSINESS SECTION (Parallax Scroll) */}
      <TransformBusinessSection
        badge={homeData?.transformBadge}
        headline={homeData?.transformHeadline}
        description={homeData?.transformDescription}
        cards={homeData?.transformCards?.map((card) => ({
          ...card,
          image: card.image?.asset?.url,
        }))}
      />

      {/* SMART STORAGE SECTION */}
      <SmartStorageSection
        badge={homeData?.smartStorageBadge}
        headline={homeData?.smartStorageHeadline}
        description={homeData?.smartStorageDescription}
        pillars={homeData?.smartStoragePillars}
      />

      {/* USE CASES SECTION */}
      <UseCasesSection
        badge={homeData?.useCasesBadge}
        headline={homeData?.useCasesHeadline}
        description={homeData?.useCasesDescription}
        useCases={homeData?.useCasesItems?.map((item) => ({
          ...item,
          image: item.image?.asset?.url,
        }))}
      />

      {/* =================================================================
          CTA SECTION
          Content from Firestore: ctaBadge, ctaHeadline, ctaDescription,
          ctaButton1, ctaButton2, ctaTrustIndicators
      ================================================================= */}
      <CTASection
        badge={homeData?.ctaBadge}
        headline={homeData?.ctaHeadline}
        description={homeData?.ctaDescription}
        trustIndicators={homeData?.ctaTrustIndicators}
      />
    </main>
  );
}
