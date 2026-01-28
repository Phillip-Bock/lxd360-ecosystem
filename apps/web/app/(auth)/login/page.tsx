'use client';

export const dynamic = 'force-dynamic';

import dynamicImport from 'next/dynamic';

const LoginForm = dynamicImport(() => import('./LoginForm'), {
  ssr: false,
  loading: () => <div className="text-white">Loading Secure Login...</div>,
});

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4 text-white">
      <LoginForm />
    </div>
  );
}
