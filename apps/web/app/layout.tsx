import type { Metadata } from 'next';
import { Inter, JetBrains_Mono, Plus_Jakarta_Sans } from 'next/font/google';
// Layout version: 2024-11-25-v2 - Public header/footer moved to (public) route group
import type React from 'react';
import { Suspense } from 'react';
import { CookieConsent } from '@/components/gdpr/CookieConsent';
import { ScrollToTop } from '@/components/shared/scroll-to-top';
import { ThemeProvider } from '@/components/shared/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { Providers } from '@/providers';
import { RoleProvider } from '@/providers/RoleContext';
import './globals.css';

// Configure Google Fonts with next/font for optimal loading
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-plus-jakarta-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export function generateMetadata(): Metadata {
  return {
    // Primary meta tags
    title: {
      default: 'LXD360 - Neuroscience-Informed Learning Experience Platform',
      template: '%s | LXD360',
    },
    description:
      "Transform workforce development with LXD360's unified learning ecosystem. AI-powered content creation, INSPIRE™ framework, VR/AR training, and verifiable ROI analytics in one cloud-native platform.",
    keywords: [
      'LMS',
      'LXP',
      'learning experience platform',
      'AI learning',
      'SCORM',
      'xAPI',
      'corporate training',
      'VR training',
      'AR training',
      'XR simulation',
      'neuroscience learning',
      'adaptive learning',
      'learning analytics',
      'ROI training',
      'compliance training',
      'SDVOSB',
      'FedRAMP',
      'workforce development',
    ],
    authors: [{ name: 'LXD360' }],
    creator: 'LXD360',
    publisher: 'LXD360',

    // Favicon and icons
    icons: {
      icon: [
        { url: '/icon.svg', type: 'image/svg+xml' },
        { url: '/icon.svg', type: 'image/svg+xml', sizes: 'unknown' },
      ],
      shortcut: '/icon.svg',
      apple: '/icon.svg',
    },

    // Open Graph for social sharing
    openGraph: {
      type: 'website',
      locale: 'en_US',
      siteName: 'LXD360',
      title: 'LXD360 - Neuroscience-Informed Learning Experience Platform',
      description:
        'Unify your LMS, LXP, and authoring tools. AI-powered learning with the INSPIRE™ framework for verifiable skill development and ROI.',
    },

    // Twitter card
    twitter: {
      card: 'summary_large_image',
      title: 'LXD360 - Neuroscience-Informed Learning Platform',
      description:
        'AI-powered learning ecosystem with VR/AR, adaptive pathways, and transparent analytics.',
    },

    // Robots
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },

    // Google Site Verification (set GOOGLE_SITE_VERIFICATION in environment)
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactElement {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${plusJakartaSans.variable} ${jetbrainsMono.variable}`}
    >
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          storageKey="lxp360-theme"
        >
          <RoleProvider>
            <Providers toastPosition="bottom-right">
              <ScrollToTop />
              <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
              <Toaster />
              <CookieConsent />
            </Providers>
          </RoleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
