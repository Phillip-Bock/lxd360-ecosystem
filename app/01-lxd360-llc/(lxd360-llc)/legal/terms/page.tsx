import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service | LXD360',
  description:
    'LXD360 Terms of Service - Terms and conditions for using our learning experience platform.',
};

export default function TermsOfServicePage(): React.JSX.Element {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <nav className="mb-8">
        <Link href="/legal" className="text-brand-cyan hover:underline">
          &larr; Back to Legal
        </Link>
      </nav>

      <h1 className="text-4xl font-bold text-brand-primary mb-8">Terms of Service</h1>

      <div className="prose prose-lg prose-invert max-w-none space-y-8">
        <p className="text-gray-300">
          <strong>Last Updated:</strong> January 2026
        </p>
        <p className="text-gray-300">
          <strong>Effective Date:</strong> January 2026
        </p>

        <section>
          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">1. Acceptance of Terms</h2>
          <p className="text-gray-300">
            By accessing or using the LXD360 platform and services (&quot;Services&quot;), you agree
            to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these
            Terms, do not use our Services.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">
            2. Description of Services
          </h2>
          <p className="text-gray-300">
            LXD360 provides a learning experience platform that enables organizations to create,
            deliver, and track training and educational content. Our Services include content
            authoring tools, learning management features, analytics, and related functionality.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">3. Account Registration</h2>
          <ul className="list-disc pl-6 text-gray-300 space-y-2">
            <li>You must provide accurate and complete registration information</li>
            <li>You are responsible for maintaining the security of your account</li>
            <li>You must notify us immediately of any unauthorized access</li>
            <li>You may not share your account credentials with others</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">4. User Responsibilities</h2>
          <p className="text-gray-300">You agree to:</p>
          <ul className="list-disc pl-6 text-gray-300 space-y-2">
            <li>Use the Services only for lawful purposes</li>
            <li>Comply with all applicable laws and regulations</li>
            <li>Respect the intellectual property rights of others</li>
            <li>Not upload malicious content or interfere with the Services</li>
            <li>Not attempt to gain unauthorized access to any systems</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">5. Intellectual Property</h2>

          <h3 className="text-xl font-medium text-white mt-6 mb-3">5.1 LXD360 Content</h3>
          <p className="text-gray-300">
            The Services, including all software, design, text, and graphics, are owned by LXD360
            and protected by intellectual property laws. You may not copy, modify, or distribute our
            content without permission.
          </p>

          <h3 className="text-xl font-medium text-white mt-6 mb-3">5.2 Your Content</h3>
          <p className="text-gray-300">
            You retain ownership of content you create using our Services. By uploading content, you
            grant LXD360 a license to host, display, and process your content as necessary to
            provide the Services.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">6. Payment Terms</h2>
          <ul className="list-disc pl-6 text-gray-300 space-y-2">
            <li>Subscription fees are billed in advance</li>
            <li>All fees are non-refundable except as required by law</li>
            <li>We may change pricing with 30 days notice</li>
            <li>You are responsible for all applicable taxes</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">7. Termination</h2>
          <p className="text-gray-300">
            Either party may terminate the agreement at any time. Upon termination, you will lose
            access to the Services. We may retain certain data as required by law or for legitimate
            business purposes.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">8. Disclaimers</h2>
          <p className="text-gray-300">
            THE SERVICES ARE PROVIDED &quot;AS IS&quot; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR
            IMPLIED. WE DO NOT WARRANT THAT THE SERVICES WILL BE UNINTERRUPTED, ERROR-FREE, OR
            SECURE.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">
            9. Limitation of Liability
          </h2>
          <p className="text-gray-300">
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, LXD360 SHALL NOT BE LIABLE FOR ANY INDIRECT,
            INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE
            SERVICES.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">10. Indemnification</h2>
          <p className="text-gray-300">
            You agree to indemnify and hold harmless LXD360 from any claims, damages, or expenses
            arising from your use of the Services or violation of these Terms.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">11. Governing Law</h2>
          <p className="text-gray-300">
            These Terms shall be governed by the laws of the United States. Any disputes shall be
            resolved in the courts of competent jurisdiction.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">12. Changes to Terms</h2>
          <p className="text-gray-300">
            We may modify these Terms at any time. We will notify you of material changes by posting
            the updated Terms and updating the &quot;Last Updated&quot; date. Continued use of the
            Services constitutes acceptance of the modified Terms.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">13. Contact</h2>
          <p className="text-gray-300">For questions about these Terms:</p>
          <ul className="list-none pl-0 text-gray-300 space-y-1 mt-4">
            <li>
              <strong>Email:</strong> legal@lxd360.com
            </li>
            <li>
              <strong>Address:</strong> LXD360, LLC
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
