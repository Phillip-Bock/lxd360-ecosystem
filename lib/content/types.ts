// ============================================================================
// Image Types
// ============================================================================

export interface ImageAsset {
  _ref?: string;
  _type?: string;
  url?: string;
}

export interface ContentImage {
  _type?: 'image';
  asset?: ImageAsset;
  hotspot?: {
    x: number;
    y: number;
    height: number;
    width: number;
  };
  crop?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

export interface ImageWithAlt {
  image?: ContentImage;
  alt?: string;
}

// ============================================================================
// Portable Text Types
// ============================================================================

export interface PortableTextBlock {
  _type: 'block';
  _key: string;
  style?: string;
  children?: Array<{
    _type: string;
    _key: string;
    text?: string;
    marks?: string[];
  }>;
  markDefs?: Array<{
    _type: string;
    _key: string;
    href?: string;
  }>;
}

// ============================================================================
// Marketing Content Types
// ============================================================================

export interface FeatureCard {
  _key?: string;
  title?: string;
  description?: string;
  icon?: string;
  image?: ImageWithAlt;
}

export interface Testimonial {
  _key?: string;
  quote?: string;
  author?: string;
  role?: string;
  company?: string;
  avatar?: ImageWithAlt;
  rating?: number;
}

export interface PartnerLogo {
  _key?: string;
  name?: string;
  logo?: ImageWithAlt;
  url?: string;
}

export interface IntegrationLogo {
  _key?: string;
  name?: string;
  logo?: ImageWithAlt;
  category?: string;
}

export interface FeaturedPost {
  _id?: string;
  title?: string;
  slug?: string;
  excerpt?: string;
  featuredImage?: ImageWithAlt;
  category?: string;
  publishedAt?: string;
}

// ============================================================================
// Page Types
// ============================================================================

export interface HeroSection {
  _key?: string;
  badge?: string;
  headline?: string;
  subheadline?: string;
  description?: string;
  heroImage?: ImageWithAlt;
  ctaText?: string;
  ctaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  // Legacy fields from AboutHero
  titleText?: string;
  oneliner?: string;
  paragraph?: string;
  imageAlt?: string;
  image?: { asset?: { url?: string } };
}

export interface PolicyPage {
  _id?: string;
  title?: string;
  slug?: string;
  lastUpdated?: string;
  effectiveDate?: string;
  heroSubtitle?: string;
  content?: PortableTextBlock[];
  body?: PortableTextBlock[];
  showCta?: boolean;
  ctaBadge?: string;
  ctaHeadline?: string;
  ctaDescription?: string;
}

// ============================================================================
// Footer Types
// ============================================================================

export interface FooterLink {
  _key?: string;
  label?: string;
  href?: string;
  external?: boolean;
}

export interface FooterColumn {
  _key?: string;
  title?: string;
  links?: FooterLink[];
}

export interface SocialLink {
  _key?: string;
  platform:
    | 'twitter'
    | 'linkedin'
    | 'github'
    | 'youtube'
    | 'facebook'
    | 'instagram'
    | 'x'
    | 'reddit'
    | 'medium';
  url: string;
}

export interface FooterData {
  columns?: FooterColumn[];
  socialLinks?: SocialLink[];
  copyright?: string;
  bottomLinks?: FooterLink[];
}

// ============================================================================
// Course Types
// ============================================================================

export interface CourseListItem {
  _id?: string;
  title?: string;
  slug?: string;
  description?: string;
  thumbnail?: ImageWithAlt;
  duration?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  category?: string;
  instructor?: {
    name?: string;
    avatar?: ImageWithAlt;
  };
  enrollmentCount?: number;
  rating?: number;
}

export interface Course extends CourseListItem {
  content?: PortableTextBlock[];
  modules?: Array<{
    _key?: string;
    title?: string;
    lessons?: Array<{
      _key?: string;
      title?: string;
      duration?: string;
      type?: 'video' | 'text' | 'quiz' | 'assignment';
    }>;
  }>;
}

// ============================================================================
// Site Settings Types
// ============================================================================

export interface SiteSettings {
  siteName?: string;
  siteDescription?: string;
  seoDescription?: string;
  logo?: ImageWithAlt;
  favicon?: ImageWithAlt;
  ogImage?: ImageWithAlt;
  socialLinks?: SocialLink[];
}

// ============================================================================
// Home Page Types
// ============================================================================

/** How It Works tab item for interactive section */
export interface HowItWorksTab {
  _key?: string;
  title: string;
  description: string;
  icon: string;
  videoUrl?: string;
  image?: ImageWithAlt;
}

/** Card with image asset for StreamlineWorkflow and Transform sections (CMS data) */
export interface WorkflowCardCMS {
  _key?: string;
  title: string;
  description: string;
  icon: string;
  image?: ContentImage;
}

/** Card with resolved image URL for StreamlineWorkflowSection */
export interface WorkflowCard {
  _key?: string;
  title: string;
  description: string;
  icon: string;
  image?: string;
}

/** Card with image for TransformBusinessSection (CMS data) */
export interface TransformCardCMS {
  _key?: string;
  title: string;
  description: string;
  icon: string;
  image?: ContentImage;
}

/** Card with resolved image URL for TransformBusinessSection */
export interface TransformCard {
  _key?: string;
  title: string;
  description: string;
  icon: string;
  image?: string;
}

/** Feature item with icon for BetterResultSection */
export interface FeatureItem {
  _key?: string;
  title: string;
  description: string;
  icon: string;
}

/** Pillar item for SmartStorageSection */
export interface CapabilityPillar {
  _key?: string;
  title: string;
  description: string;
  icon: string;
}

/** Use case item for UseCasesSection (CMS data) */
export interface UseCaseCMS {
  _key?: string;
  title: string;
  description: string;
  icon: string;
  image?: ContentImage;
}

/** Use case item with resolved image URL for UseCasesSection */
export interface UseCase {
  _key?: string;
  title: string;
  description: string;
  icon: string;
  image?: string;
}

export interface HomePage {
  // Legacy nested fields
  hero?: HeroSection;
  features?: FeatureCard[];
  testimonials?: Testimonial[];
  partners?: PartnerLogo[];
  integrations?: IntegrationLogo[];
  blogPosts?: FeaturedPost[];

  // Hero Section
  heroBadge?: string;
  heroHeadline?: string;
  heroDescription?: string;
  heroImage?: ImageWithAlt;
  heroCta1?: string;
  heroCta1Link?: string;
  heroCta2?: string;
  heroCta2Link?: string;

  // Trusted Partners Section
  partnersBadge?: string;
  partnersHeading?: string;
  partnerLogos?: PartnerLogo[];

  // Key Features Section
  featuresBadge?: string;
  featuresHeading?: string;
  featuresSubheading?: string;
  featureCards?: FeatureCard[];

  // How It Works Section
  howItWorksBadge?: string;
  howItWorksHeading?: string;
  howItWorksTabs?: HowItWorksTab[];

  // Testimonials Section
  testimonialsBadge?: string;
  testimonialsHeading?: string;

  // Podcast Section
  podcastBadge?: string;
  podcastHeading?: string;
  podcastSubheading?: string;

  // Integrations Section
  integrationsBadge?: string;
  integrationsHeading?: string;
  integrationsSubheading?: string;
  integrationLogos?: IntegrationLogo[];

  // Blog Section
  blogBadge?: string;
  blogHeading?: string;
  blogSubheading?: string;
  featuredPosts?: FeaturedPost[];

  // Infinite Scale Section
  infiniteScaleBadge?: string;
  infiniteScaleHeadline?: string;
  infiniteScaleDescription?: string;
  infiniteScaleImage?: ContentImage;

  // Streamline Workflow Section
  streamlineBadge?: string;
  streamlineHeadline?: string;
  streamlineDescription?: string;
  streamlineCards?: WorkflowCardCMS[];

  // Better Result Section
  betterResultBadge?: string;
  betterResultHeadline?: string;
  betterResultDescription?: string;
  betterResultFeatures?: FeatureItem[];

  // Transform Business Section
  transformBadge?: string;
  transformHeadline?: string;
  transformDescription?: string;
  transformCards?: TransformCardCMS[];

  // Smart Storage Section
  smartStorageBadge?: string;
  smartStorageHeadline?: string;
  smartStorageDescription?: string;
  smartStoragePillars?: CapabilityPillar[];

  // Use Cases Section
  useCasesBadge?: string;
  useCasesHeadline?: string;
  useCasesDescription?: string;
  useCasesItems?: UseCaseCMS[];

  // CTA Section
  ctaBadge?: string;
  ctaHeadline?: string;
  ctaDescription?: string;
  ctaButton1?: string;
  ctaButton1Link?: string;
  ctaButton2?: string;
  ctaButton2Link?: string;
  ctaTrustIndicators?: string[];
}

// ============================================================================
// About Page Types
// ============================================================================

/** Hero section item for about page parallax hero */
export interface AboutHeroSection {
  _key?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  image?: ImageWithAlt;
}

/** Service image type matching component expectations */
export interface ServiceImage {
  asset?: { url: string };
}

/** Service item for about services section - matches ServiceCard in component */
export interface AboutServiceCard {
  _key?: string;
  title: string;
  description: string;
  icon: string;
  image?: string | ServiceImage;
}

/** Result feature for about results section */
export interface ResultFeature {
  _key?: string;
  title: string;
  description: string;
}

/** Result card for about results section */
export interface ResultCard {
  _key?: string;
  title?: string;
  label?: string;
  value: string;
  icon: string;
}

/** Feature icon for rotating carousel */
export interface AboutFeatureIcon {
  _key?: string;
  icon: string;
  label?: string;
}

/** Feature card for about features section */
export interface AboutFeatureCard {
  _key?: string;
  title: string;
  description: string;
  icon?: string;
  icons?: AboutFeatureIcon[];
}

/** Integration benefit for about integration section */
export interface IntegrationBenefit {
  _key?: string;
  number: string;
  title: string;
  description: string;
}

/** FAQ item for about FAQ section */
export interface FAQItem {
  _key?: string;
  question: string;
  answer: string;
}

/** Stat item for about CTA section */
export interface AboutStat {
  _key: string;
  value: string;
  label: string;
}

/** Social link for founder section */
export interface FounderSocialLink {
  _key: string;
  platform: string;
  url: string;
}

/** Credential icon for founder section */
export interface FounderCredentialIcon {
  _key: string;
  name: string;
  icon?: { asset?: { url?: string } };
}

/** Credential badge for founder section */
export interface FounderCredentialBadge {
  _key: string;
  value: string;
  label: string;
}

/** Value item for company values section - matches ValueItem in component */
export interface ValueItem {
  _key?: string;
  id?: string | number;
  title: string;
  subtitle?: string;
  description: string;
  iconImage?: { asset?: { url?: string } };
  backgroundImage?: { asset?: { url?: string } };
}

export interface AboutPage {
  // Legacy fields
  hero?: HeroSection;
  mission?: PortableTextBlock[];
  values?: Array<{
    _key?: string;
    title?: string;
    description?: string;
    icon?: string;
  }>;
  team?: Array<{
    _key?: string;
    name?: string;
    role?: string;
    bio?: string;
    avatar?: ImageWithAlt;
  }>;

  // Global Reach Section
  globalReachEarthModel?: ContentImage;

  // Hero Section - Parallax sections
  heroSections?: AboutHeroSection[];

  // Founder Section
  founderBadge?: string;
  founderName?: string;
  founderTitle?: string;
  founderImage?: { asset?: { url?: string } };
  founderBio?: string[];
  founderSocialLinks?: FounderSocialLink[];
  founderCredentialIcons?: FounderCredentialIcon[];
  founderCredentialBadges?: FounderCredentialBadge[];

  // Values Section
  valuesBadge?: string;
  valuesHeading?: string;
  valuesItems?: ValueItem[];

  // Services Section
  servicesBadge?: string;
  servicesHeadline?: string;
  servicesDescription?: string;
  servicesItems?: AboutServiceCard[];

  // Results Section
  resultsBadge?: string;
  resultsHeadline?: string;
  resultsDescription?: string;
  resultsFeatures?: ResultFeature[];
  resultsCards?: ResultCard[];

  // Features Section
  featuresBadge?: string;
  featuresHeadline?: string;
  featuresDescription?: string;
  featuresCards?: AboutFeatureCard[];

  // Integration Section
  integrationBadge?: string;
  integrationHeadline?: string;
  integrationDescription?: string;
  integrationBenefits?: IntegrationBenefit[];
  integrationImage?: ContentImage;

  // FAQ Section
  faqBadge?: string;
  faqHeadline?: string;
  faqDescription?: string;
  faqItems?: FAQItem[];

  // CTA Section
  ctaBadge?: string;
  ctaHeadline?: string;
  ctaSubtitle?: string;
  ctaDescription?: string;
  ctaStats?: AboutStat[];
  ctaTrustIndicators?: string[];
}

// ============================================================================
// Extended Footer Types (for legacy compatibility)
// ============================================================================

export interface PolicyContent {
  _key: string;
  title: string;
  slug: string;
}

export interface ComplianceLink {
  _key: string;
  label: string;
  href: string;
  icon?: string;
}

export interface Link {
  _key: string;
  label: string;
  href: string;
  isExternal?: boolean;
}

export interface Footer {
  columns?: FooterColumn[];
  socialLinks?: SocialLink[];
  copyright?: string;
  bottomLinks?: FooterLink[];
  policies?: PolicyContent[];
  complianceLinks?: ComplianceLink[];
  legal?: PolicyContent[];
  quickLinks?: Link[];
  // Newsletter section
  newsletterTitle?: string;
  newsletterDescription?: string;
  newsletterButtonText?: string;
  // Brand section
  brandDescription?: string;
  copyrightText?: string;
}
