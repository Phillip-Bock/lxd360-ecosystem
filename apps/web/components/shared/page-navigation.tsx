'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface PageNavigationProps {
  links?: { href: string; label: string }[];
  previousPage?: { href: string; label: string };
  nextPage?: { href: string; label: string };
}

export function PageNavigation({ links, previousPage, nextPage }: PageNavigationProps) {
  const pathname = usePathname();

  if (links) {
    return (
      <nav className="flex gap-4 mb-6">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`px-4 py-2 rounded ${
              pathname === link.href
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    );
  }

  if (previousPage || nextPage) {
    return (
      <nav className="flex justify-between gap-4 mb-6">
        {previousPage ? (
          <Link
            href={previousPage.href}
            className="px-4 py-2 rounded bg-secondary text-secondary-foreground hover:bg-secondary/80"
          >
            ← {previousPage.label}
          </Link>
        ) : (
          <div />
        )}
        {nextPage ? (
          <Link
            href={nextPage.href}
            className="px-4 py-2 rounded bg-secondary text-secondary-foreground hover:bg-secondary/80"
          >
            {nextPage.label} →
          </Link>
        ) : (
          <div />
        )}
      </nav>
    );
  }

  return null;
}
