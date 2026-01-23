import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { SafeAuthProvider } from '@/providers/SafeAuthProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'LXD360 Learning Platform',
  description: 'AI-Powered Adaptive Learning',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-black text-white antialiased`}>
        {/* Restore Memory (Auth Persistence) */}
        <SafeAuthProvider>{children}</SafeAuthProvider>
      </body>
    </html>
  );
}
