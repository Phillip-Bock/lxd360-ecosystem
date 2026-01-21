import { AboutSection } from '@/components/coming-soon/about-section';
import { ComplianceSection } from '@/components/coming-soon/compliance-section';
import { CtaSection } from '@/components/coming-soon/cta-section';
import { FeaturesSection } from '@/components/coming-soon/features-section';
import { FooterSection } from '@/components/coming-soon/footer-section';
import { HeroSection } from '@/components/coming-soon/hero-section';
import { InitiativesSection } from '@/components/coming-soon/initiatives-section';
import { InspireFrameworkSection } from '@/components/coming-soon/inspire-framework-section';
import { ResultsSection } from '@/components/coming-soon/results-section';
import { TrainingCrisisSection } from '@/components/coming-soon/training-crisis-section';

export default function ComingSoonPage() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <AboutSection />
      <TrainingCrisisSection />
      <InspireFrameworkSection />
      <InitiativesSection />
      <FeaturesSection />
      <ComplianceSection />
      <ResultsSection />
      <CtaSection />
      <FooterSection />
    </main>
  );
}
