import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy | LXD360',
  description:
    'LXD360 Privacy Policy - How we collect, use, and protect your personal information.',
};

export default function PrivacyPolicyPage(): React.JSX.Element {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <nav className="mb-8">
        <Link href="/legal" className="text-brand-cyan hover:underline">
          &larr; Back to Legal
        </Link>
      </nav>

      <h1 className="text-4xl font-bold text-brand-primary mb-8">Privacy Policy</h1>

      <div className="prose prose-lg prose-invert max-w-none space-y-8">
        <p className="text-gray-300">
          <strong>Last Updated:</strong> January 2026
        </p>
        <p className="text-gray-300">
          <strong>Effective Date:</strong> January 2026
        </p>

        <section>
          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">1. Introduction</h2>
          <p className="text-gray-300">
            LXD360, LLC (&quot;LXD360,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;)
            respects your privacy and is committed to protecting your personal data. This Privacy
            Policy explains how we collect, use, disclose, and safeguard your information when you
            use our learning experience platform and related services.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">2. Information We Collect</h2>

          <h3 className="text-xl font-medium text-white mt-6 mb-3">2.1 Information You Provide</h3>
          <ul className="list-disc pl-6 text-gray-300 space-y-2">
            <li>Account information (name, email address, password)</li>
            <li>Profile information (job title, organization)</li>
            <li>Learning activity data (course progress, assessment scores)</li>
            <li>Content you create or upload</li>
            <li>Communications with us</li>
          </ul>

          <h3 className="text-xl font-medium text-white mt-6 mb-3">
            2.2 Information Collected Automatically
          </h3>
          <ul className="list-disc pl-6 text-gray-300 space-y-2">
            <li>Device information (browser type, operating system)</li>
            <li>Log data (IP address, access times, pages viewed)</li>
            <li>Learning analytics (xAPI statements, time spent on content)</li>
            <li>Cookies and similar technologies</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">
            3. How We Use Your Information
          </h2>
          <ul className="list-disc pl-6 text-gray-300 space-y-2">
            <li>Provide and maintain our services</li>
            <li>Personalize your learning experience</li>
            <li>Process transactions and send related information</li>
            <li>Send administrative information and updates</li>
            <li>Analyze usage to improve our services</li>
            <li>Detect, prevent, and address technical issues</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">
            4. Legal Basis for Processing (GDPR)
          </h2>
          <p className="text-gray-300">
            For users in the European Economic Area, we process personal data based on:
          </p>
          <ul className="list-disc pl-6 text-gray-300 space-y-2">
            <li>
              <strong>Contract Performance:</strong> To provide our services
            </li>
            <li>
              <strong>Consent:</strong> For optional features like marketing
            </li>
            <li>
              <strong>Legitimate Interests:</strong> To improve our services
            </li>
            <li>
              <strong>Legal Obligation:</strong> To comply with applicable laws
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">5. Your Rights</h2>

          <h3 className="text-xl font-medium text-white mt-6 mb-3">
            5.1 GDPR Rights (EU/EEA Users)
          </h3>
          <ul className="list-disc pl-6 text-gray-300 space-y-2">
            <li>Right to access your personal data</li>
            <li>Right to rectification of inaccurate data</li>
            <li>Right to erasure (&quot;right to be forgotten&quot;)</li>
            <li>Right to restrict processing</li>
            <li>Right to data portability</li>
            <li>Right to object to processing</li>
            <li>Right to withdraw consent</li>
          </ul>

          <h3 className="text-xl font-medium text-white mt-6 mb-3">
            5.2 CCPA Rights (California Residents)
          </h3>
          <ul className="list-disc pl-6 text-gray-300 space-y-2">
            <li>Right to know what personal information is collected</li>
            <li>Right to delete personal information</li>
            <li>Right to opt-out of the sale of personal information</li>
            <li>Right to non-discrimination for exercising rights</li>
          </ul>
          <p className="text-gray-300 mt-4">
            <strong>We do not sell your personal information.</strong>
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">6. Data Retention</h2>
          <p className="text-gray-300">
            We retain your personal data only as long as necessary to fulfill the purposes for which
            it was collected, including to satisfy legal, accounting, or reporting requirements.
            Learning records may be retained for compliance purposes as required by applicable
            regulations.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">7. Data Security</h2>
          <p className="text-gray-300">
            We implement appropriate technical and organizational measures to protect your personal
            data against unauthorized access, alteration, disclosure, or destruction. These include
            encryption in transit and at rest, access controls, and regular security assessments.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">
            8. International Transfers
          </h2>
          <p className="text-gray-300">
            Your information may be transferred to and processed in the United States. We ensure
            appropriate safeguards are in place for international transfers, including Standard
            Contractual Clauses where required.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">
            9. Children&apos;s Privacy
          </h2>
          <p className="text-gray-300">
            Our services are not directed to children under 13. We do not knowingly collect personal
            information from children under 13. If you believe we have collected information from a
            child under 13, please contact us immediately.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">10. Third-Party Services</h2>
          <p className="text-gray-300">
            We use third-party services to operate our platform, including Google Cloud Platform for
            infrastructure, Firebase for authentication, and Stripe for payment processing. These
            providers have their own privacy policies and are bound by data processing agreements.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">11. Contact Us</h2>
          <p className="text-gray-300">For privacy-related inquiries or to exercise your rights:</p>
          <ul className="list-none pl-0 text-gray-300 space-y-1 mt-4">
            <li>
              <strong>Email:</strong> privacy@lxd360.com
            </li>
            <li>
              <strong>Data Protection Officer:</strong> dpo@lxd360.com
            </li>
            <li>
              <strong>Address:</strong> LXD360, LLC
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">
            12. Changes to This Policy
          </h2>
          <p className="text-gray-300">
            We may update this Privacy Policy from time to time. We will notify you of any changes
            by posting the new Privacy Policy on this page and updating the &quot;Last Updated&quot;
            date.
          </p>
        </section>
      </div>
    </div>
  );
}
