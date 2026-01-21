import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'AI Disclosure | LXD360',
  description:
    'LXD360 AI Disclosure - How we use artificial intelligence in our learning platform.',
};

export default function AIDisclosurePage(): React.JSX.Element {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <nav className="mb-8">
        <Link href="/legal" className="text-brand-cyan hover:underline">
          &larr; Back to Legal
        </Link>
      </nav>

      <h1 className="text-4xl font-bold text-brand-primary mb-8">AI Disclosure</h1>

      <div className="prose prose-lg prose-invert max-w-none space-y-8">
        <p className="text-gray-300">
          <strong>Last Updated:</strong> January 2026
        </p>

        <section>
          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">1. Introduction</h2>
          <p className="text-gray-300">
            LXD360 uses artificial intelligence (AI) and machine learning technologies to enhance
            the learning experience. This disclosure explains how AI is used in our platform, what
            data it processes, and your rights regarding AI-assisted decisions.
          </p>
          <p className="text-gray-300 mt-4">
            We are committed to responsible AI use in compliance with the EU AI Act and other
            applicable regulations.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">2. AI Systems Used</h2>

          <h3 className="text-xl font-medium text-white mt-6 mb-3">2.1 Adaptive Learning Engine</h3>
          <p className="text-gray-300">
            Our platform uses Bayesian Knowledge Tracing (BKT) to estimate learner mastery and
            provide personalized content recommendations. This system:
          </p>
          <ul className="list-disc pl-6 text-gray-300 space-y-2">
            <li>Analyzes your responses to assessments</li>
            <li>Estimates your knowledge level for each skill</li>
            <li>Recommends appropriate learning content</li>
            <li>Suggests when you&apos;re ready to advance</li>
          </ul>

          <h3 className="text-xl font-medium text-white mt-6 mb-3">2.2 Content Recommendations</h3>
          <p className="text-gray-300">
            We use AI to recommend learning content based on your progress, preferences, and
            learning goals. Recommendations are suggestions only and can be overridden.
          </p>

          <h3 className="text-xl font-medium text-white mt-6 mb-3">2.3 Learning State Detection</h3>
          <p className="text-gray-300">
            We analyze behavioral signals (response times, interaction patterns) to detect
            functional learning states such as &quot;focused,&quot; &quot;uncertain,&quot; or
            &quot;fatigued.&quot; These are NOT emotion detection systems. We do not use biometric
            data or facial recognition for this purpose.
          </p>

          <h3 className="text-xl font-medium text-white mt-6 mb-3">2.4 Content Generation</h3>
          <p className="text-gray-300">
            Our authoring tools may use generative AI (Google Gemini) to assist content creators.
            AI-generated content is always reviewed by humans before publication.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">3. Data Used by AI</h2>
          <p className="text-gray-300">Our AI systems process:</p>
          <ul className="list-disc pl-6 text-gray-300 space-y-2">
            <li>Assessment responses and scores</li>
            <li>Time spent on learning content</li>
            <li>Navigation patterns within courses</li>
            <li>Interaction events (clicks, scrolls, video plays)</li>
            <li>Self-reported confidence levels</li>
          </ul>
          <p className="text-gray-300 mt-4">We do NOT use AI to process:</p>
          <ul className="list-disc pl-6 text-gray-300 space-y-2">
            <li>Biometric data (face, voice, fingerprint)</li>
            <li>Emotion recognition from facial expressions</li>
            <li>Location data</li>
            <li>Data from external sources about you</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">4. Your Rights</h2>

          <h3 className="text-xl font-medium text-white mt-6 mb-3">4.1 Human Oversight</h3>
          <p className="text-gray-300">
            All AI decisions can be reviewed and overridden by human instructors or administrators.
            Important decisions (certification, progression) always involve human review.
          </p>

          <h3 className="text-xl font-medium text-white mt-6 mb-3">4.2 Learner Agency</h3>
          <p className="text-gray-300">You have the right to:</p>
          <ul className="list-disc pl-6 text-gray-300 space-y-2">
            <li>Skip or dismiss AI recommendations</li>
            <li>Override suggested learning paths</li>
            <li>Request human review of AI assessments</li>
            <li>Opt out of certain AI features</li>
          </ul>

          <h3 className="text-xl font-medium text-white mt-6 mb-3">4.3 Transparency</h3>
          <p className="text-gray-300">
            When AI influences a decision about you, we provide explanations through our &quot;Glass
            Box&quot; feature, showing:
          </p>
          <ul className="list-disc pl-6 text-gray-300 space-y-2">
            <li>What factors were considered</li>
            <li>How the recommendation was made</li>
            <li>Confidence level of the prediction</li>
            <li>How to request human review</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">5. Bias Prevention</h2>
          <p className="text-gray-300">
            We are committed to fair AI systems. We regularly audit our AI for:
          </p>
          <ul className="list-disc pl-6 text-gray-300 space-y-2">
            <li>Demographic parity in outcomes</li>
            <li>Equal accuracy across user groups</li>
            <li>Systematic disadvantages to any group</li>
          </ul>
          <p className="text-gray-300 mt-4">
            If you believe you have been unfairly affected by an AI decision, please contact us at
            ai-ethics@lxd360.com.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">
            6. AI Logging and Audit Trail
          </h2>
          <p className="text-gray-300">
            All AI decisions are logged with timestamps, inputs, outputs, and confidence scores.
            These logs are retained for compliance purposes and can be provided upon request.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">7. EU AI Act Compliance</h2>
          <p className="text-gray-300">
            Our AI systems in the education domain are classified as high-risk under the EU AI Act.
            We comply with requirements including:
          </p>
          <ul className="list-disc pl-6 text-gray-300 space-y-2">
            <li>Risk management and assessment (Article 9)</li>
            <li>Technical documentation (Article 11)</li>
            <li>Record-keeping and audit trails (Article 12)</li>
            <li>Transparency and information provision (Article 13)</li>
            <li>Human oversight mechanisms (Article 14)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">8. Contact</h2>
          <p className="text-gray-300">
            For questions about our AI use or to exercise your rights:
          </p>
          <ul className="list-none pl-0 text-gray-300 space-y-1 mt-4">
            <li>
              <strong>AI Ethics:</strong> ai-ethics@lxd360.com
            </li>
            <li>
              <strong>Privacy:</strong> privacy@lxd360.com
            </li>
            <li>
              <strong>General:</strong> support@lxd360.com
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">
            9. Updates to This Disclosure
          </h2>
          <p className="text-gray-300">
            We will update this disclosure as our AI systems evolve. Material changes will be
            communicated through the platform and by updating the &quot;Last Updated&quot; date.
          </p>
        </section>
      </div>
    </div>
  );
}
