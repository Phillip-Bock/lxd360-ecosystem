'use client';

import Link from 'next/link';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';

export function NotFoundContent() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: 'var(--lxd-blue-dark-700)' }}
    >
      {/* Full Brand Header */}
      <Header />

      {/* Main Content Section */}
      <main className="flex-1 relative overflow-hidden">
        {/* Background 404 Numbers - Fixed to viewport center */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
          aria-hidden="true"
        >
          <span
            className="text-[40vw] md:text-[35vw] lg:text-[30vw] font-black leading-none tracking-tighter whitespace-nowrap"
            style={{
              color: 'rgba(26, 104, 255, 0.2)',
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            404
          </span>
        </div>

        {/* Centered Card - Use min-height to account for header */}
        <div className="relative z-10 min-h-[calc(100vh-200px)] flex items-center justify-center px-4 pt-40">
          <div className="w-full max-w-md">
            <div
              className="rounded-2xl p-8 shadow-2xl"
              style={{ backgroundColor: '#111c2e', borderColor: '#1e3a5f', borderWidth: '1px' }}
            >
              {/* Search Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-12 h-12 rounded-full bg-studio-surface flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-muted-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>

              {/* Heading */}
              <h1 className="text-2xl md:text-3xl font-bold text-brand-primary text-center mb-4">
                Oops! Page not found
              </h1>

              {/* Description */}
              <p className="text-muted-foreground text-center mb-8 text-sm leading-relaxed">
                The page you are looking for might have been removed, had its name changed, or is
                temporarily unavailable.
              </p>

              {/* Go Home Button */}
              <Link
                href="/"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-semibold rounded-full text-brand-primary transition-all bg-[var(--brand-primary)] hover:bg-[#0066d6]"
              >
                Go back home
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Full Brand Footer */}
      <Footer />
    </div>
  );
}
