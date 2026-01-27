'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

const tabs = [
  { id: 'terms', label: 'Terms of Service' },
  { id: 'privacy', label: 'Privacy Policy' },
  { id: 'ai-disclosure', label: 'AI Disclosure' },
] as const;

type TabId = (typeof tabs)[number]['id'];

export default function LegalPage(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<TabId>('terms');

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 max-w-5xl">
        <h1 className="text-4xl font-bold text-foreground mb-2">Legal</h1>
        <p className="text-muted-foreground mb-8">
          Review our policies, terms, and AI disclosure documentation.
        </p>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-border pb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-4 py-2 rounded-lg font-medium transition-colors',
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="prose prose-lg prose-invert max-w-none">
          {activeTab === 'terms' && <TermsContent />}
          {activeTab === 'privacy' && <PrivacyContent />}
          {activeTab === 'ai-disclosure' && <AIDisclosureContent />}
        </div>
      </div>
    </div>
  );
}

function TermsContent() {
  return (
    <div className="space-y-8">
      <div className="text-muted-foreground">
        <p>
          <strong>Last Updated:</strong> January 2026
        </p>
        <p>
          <strong>Effective Date:</strong> January 2026
        </p>
      </div>

      <section>
        <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">1. Acceptance of Terms</h2>
        <p className="text-muted-foreground">
          By accessing or using the LXD360 platform and services (&quot;Services&quot;), you agree
          to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these
          Terms, do not use our Services.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">
          2. Description of Services
        </h2>
        <p className="text-muted-foreground">
          LXD360 provides a learning experience platform that enables organizations to create,
          deliver, and track training and educational content. Our Services include content
          authoring tools, learning management features, analytics, and related functionality.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">
          3. Account Registration
        </h2>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
          <li>You must provide accurate and complete registration information</li>
          <li>You are responsible for maintaining the security of your account</li>
          <li>You must notify us immediately of any unauthorized access</li>
          <li>You may not share your account credentials with others</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">
          4. User Responsibilities
        </h2>
        <p className="text-muted-foreground">You agree to:</p>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
          <li>Use the Services only for lawful purposes</li>
          <li>Comply with all applicable laws and regulations</li>
          <li>Respect the intellectual property rights of others</li>
          <li>Not upload malicious content or interfere with the Services</li>
          <li>Not attempt to gain unauthorized access to any systems</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">
          5. Intellectual Property
        </h2>
        <h3 className="text-xl font-medium text-foreground mt-6 mb-3">5.1 LXD360 Content</h3>
        <p className="text-muted-foreground">
          The Services, including all software, design, text, and graphics, are owned by LXD360 and
          protected by intellectual property laws.
        </p>
        <h3 className="text-xl font-medium text-foreground mt-6 mb-3">5.2 Your Content</h3>
        <p className="text-muted-foreground">
          You retain ownership of content you create using our Services. By uploading content, you
          grant LXD360 a license to host, display, and process your content as necessary to provide
          the Services.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">6. Payment Terms</h2>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
          <li>Subscription fees are billed in advance</li>
          <li>All fees are non-refundable except as required by law</li>
          <li>We may change pricing with 30 days notice</li>
          <li>You are responsible for all applicable taxes</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">7. Termination</h2>
        <p className="text-muted-foreground">
          Either party may terminate the agreement at any time. Upon termination, you will lose
          access to the Services. We may retain certain data as required by law.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">8. Disclaimers</h2>
        <p className="text-muted-foreground uppercase text-sm">
          The services are provided &quot;as is&quot; without warranties of any kind, express or
          implied. We do not warrant that the services will be uninterrupted, error-free, or secure.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">
          9. Limitation of Liability
        </h2>
        <p className="text-muted-foreground uppercase text-sm">
          To the maximum extent permitted by law, LXD360 shall not be liable for any indirect,
          incidental, special, consequential, or punitive damages arising from your use of the
          services.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">10. Contact</h2>
        <p className="text-muted-foreground">For questions about these Terms:</p>
        <ul className="list-none pl-0 text-muted-foreground space-y-1 mt-4">
          <li>
            <strong>Email:</strong> legal@lxd360.com
          </li>
          <li>
            <strong>Address:</strong> LXD360, LLC
          </li>
        </ul>
      </section>
    </div>
  );
}

function PrivacyContent() {
  return (
    <div className="space-y-8">
      <div className="text-muted-foreground">
        <p>
          <strong>Last Updated:</strong> January 2026
        </p>
        <p>
          <strong>Effective Date:</strong> January 2026
        </p>
      </div>

      <section>
        <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">1. Introduction</h2>
        <p className="text-muted-foreground">
          LXD360, LLC respects your privacy and is committed to protecting your personal data. This
          Privacy Policy explains how we collect, use, disclose, and safeguard your information.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">
          2. Information We Collect
        </h2>
        <h3 className="text-xl font-medium text-foreground mt-6 mb-3">
          2.1 Information You Provide
        </h3>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
          <li>Account information (name, email address, password)</li>
          <li>Profile information (job title, organization)</li>
          <li>Learning activity data (course progress, assessment scores)</li>
          <li>Content you create or upload</li>
        </ul>

        <h3 className="text-xl font-medium text-foreground mt-6 mb-3">
          2.2 Information Collected Automatically
        </h3>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
          <li>Device information (browser type, operating system)</li>
          <li>Log data (IP address, access times, pages viewed)</li>
          <li>Learning analytics (xAPI statements, time spent on content)</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">3. Your Rights</h2>
        <h3 className="text-xl font-medium text-foreground mt-6 mb-3">
          3.1 GDPR Rights (EU/EEA Users)
        </h3>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
          <li>Right to access your personal data</li>
          <li>Right to rectification of inaccurate data</li>
          <li>Right to erasure (&quot;right to be forgotten&quot;)</li>
          <li>Right to restrict processing</li>
          <li>Right to data portability</li>
        </ul>

        <h3 className="text-xl font-medium text-foreground mt-6 mb-3">
          3.2 CCPA Rights (California Residents)
        </h3>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
          <li>Right to know what personal information is collected</li>
          <li>Right to delete personal information</li>
          <li>Right to opt-out of the sale of personal information</li>
        </ul>
        <p className="text-muted-foreground mt-4 font-semibold">
          We do not sell your personal information.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">4. Data Security</h2>
        <p className="text-muted-foreground">
          We implement appropriate technical and organizational measures to protect your personal
          data, including encryption in transit and at rest, access controls, and regular security
          assessments.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">5. Contact Us</h2>
        <ul className="list-none pl-0 text-muted-foreground space-y-1 mt-4">
          <li>
            <strong>Email:</strong> privacy@lxd360.com
          </li>
          <li>
            <strong>Data Protection Officer:</strong> dpo@lxd360.com
          </li>
        </ul>
      </section>
    </div>
  );
}

function AIDisclosureContent() {
  return (
    <div className="space-y-8">
      <div className="text-muted-foreground">
        <p>
          <strong>Last Updated:</strong> January 2026
        </p>
      </div>

      <section>
        <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">1. Introduction</h2>
        <p className="text-muted-foreground">
          LXD360 uses artificial intelligence (AI) and machine learning technologies to enhance the
          learning experience. We are committed to responsible AI use in compliance with the EU AI
          Act and other applicable regulations.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">2. AI Systems Used</h2>

        <h3 className="text-xl font-medium text-foreground mt-6 mb-3">
          2.1 Adaptive Learning Engine
        </h3>
        <p className="text-muted-foreground">
          Our platform uses Bayesian Knowledge Tracing (BKT) to estimate learner mastery and provide
          personalized content recommendations.
        </p>

        <h3 className="text-xl font-medium text-foreground mt-6 mb-3">2.2 Glass Box AI</h3>
        <p className="text-muted-foreground">
          All AI recommendations include transparent explanations showing what factors were
          considered, how the recommendation was made, and confidence levels.
        </p>

        <h3 className="text-xl font-medium text-foreground mt-6 mb-3">2.3 What We Do NOT Use</h3>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
          <li>Emotion recognition from facial expressions</li>
          <li>Biometric data (face, voice, fingerprint)</li>
          <li>External data sources about you</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">3. Your Rights</h2>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
          <li>Skip or dismiss AI recommendations</li>
          <li>Override suggested learning paths</li>
          <li>Request human review of AI assessments</li>
          <li>Opt out of certain AI features</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">
          4. EU AI Act Compliance
        </h2>
        <p className="text-muted-foreground">
          Our AI systems comply with EU AI Act requirements including risk management, technical
          documentation, record-keeping, transparency, and human oversight mechanisms.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">5. Contact</h2>
        <ul className="list-none pl-0 text-muted-foreground space-y-1 mt-4">
          <li>
            <strong>AI Ethics:</strong> ai-ethics@lxd360.com
          </li>
          <li>
            <strong>Privacy:</strong> privacy@lxd360.com
          </li>
        </ul>
      </section>
    </div>
  );
}
