import type React from 'react';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import { getFooter } from '@/lib/content';

/**
 * Public Pages Layout
 * -------------------
 * Shared layout for public-facing stub pages.
 * Uses the same Header/Footer as marketing pages for consistency.
 */
export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}): Promise<React.JSX.Element> {
  const footer = await getFooter();

  return (
    <>
      {/* WCAG 2.4.1: Skip link for keyboard navigation */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Header />
      <main
        id="main-content"
        className="pt-20 min-h-screen bg-lxd-light-page dark:bg-lxd-dark-page"
      >
        {/* Global Breadcrumb Navigation */}
        <div className="container mx-auto px-4 py-4">
          <BreadcrumbNav />
        </div>
        {children}
      </main>
      <Footer data={footer} />
    </>
  );
}
