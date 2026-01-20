import { ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

const defaultLinks: FooterLink[] = [
  { label: 'API Status', href: '/api/status' },
  { label: 'Developer Docs', href: '/docs', external: true },
  { label: 'Support', href: '/support' },
  { label: 'Twitter/X Updates', href: 'https://twitter.com/lxd360', external: true },
];

interface StatusFooterProps {
  links?: FooterLink[];
}

export function StatusFooter({ links = defaultLinks }: StatusFooterProps) {
  return (
    <footer className="border-t border-brand-default pt-8">
      <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
        <div className="flex flex-wrap justify-center gap-6">
          {links.map((link, idx) =>
            link.external ? (
              <a
                key={idx}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-brand-muted hover:text-[var(--brand-primary)]"
              >
                {link.label}
                <ExternalLink className="h-3 w-3" />
              </a>
            ) : (
              <Link
                key={idx}
                href={link.href}
                className="flex items-center gap-1 text-sm text-brand-muted hover:text-[var(--brand-primary)]"
              >
                {link.label}
              </Link>
            ),
          )}
        </div>
        <div className="text-center text-sm text-brand-muted sm:text-right">
          <div>Powered by LXD360 LLC</div>
          <Link href="/support" className="text-[var(--brand-primary)] hover:underline">
            Contact Support
          </Link>
        </div>
      </div>
    </footer>
  );
}
