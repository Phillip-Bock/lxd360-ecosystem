export default function LegalPage(): React.JSX.Element {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-brand-primary mb-4">Legal</h1>
      <nav className="space-y-2">
        <a href="/legal/terms" className="block text-brand-cyan hover:underline">
          Terms of Service
        </a>
        <a href="/legal/privacy" className="block text-brand-cyan hover:underline">
          Privacy Policy
        </a>
      </nav>
    </div>
  );
}
