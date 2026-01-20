import type React from 'react';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { getFooter } from '@/lib/content';

export default async function MaintenanceLayout({
  children,
}: {
  children: React.ReactNode;
}): Promise<React.JSX.Element> {
  const footer = await getFooter();

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Header />
      <main
        id="main-content"
        className="pt-20 min-h-screen bg-lxd-light-page dark:bg-lxd-dark-page"
      >
        {children}
      </main>
      <Footer data={footer} />
    </>
  );
}
