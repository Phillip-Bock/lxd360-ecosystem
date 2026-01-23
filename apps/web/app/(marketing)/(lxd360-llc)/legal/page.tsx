import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Legal | LXD360',
  description:
    'LXD360 legal documents including Terms of Service, Privacy Policy, and AI Disclosure.',
};

export default function LegalPage(): React.JSX.Element {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold text-brand-primary mb-8">Legal</h1>
      <p className="text-gray-300 mb-8">
        Welcome to the LXD360 legal documentation. Please review our policies and terms below.
      </p>
      <nav className="space-y-4">
        <Link
          href="/legal/terms"
          className="block p-4 bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <h2 className="text-xl font-semibold text-brand-cyan">Terms of Service</h2>
          <p className="text-gray-400 mt-1">Terms and conditions for using our platform</p>
        </Link>
        <Link
          href="/legal/privacy"
          className="block p-4 bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <h2 className="text-xl font-semibold text-brand-cyan">Privacy Policy</h2>
          <p className="text-gray-400 mt-1">How we collect, use, and protect your personal data</p>
        </Link>
        <Link
          href="/legal/ai-disclosure"
          className="block p-4 bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <h2 className="text-xl font-semibold text-brand-cyan">AI Disclosure</h2>
          <p className="text-gray-400 mt-1">How we use artificial intelligence in our platform</p>
        </Link>
      </nav>
    </div>
  );
}
