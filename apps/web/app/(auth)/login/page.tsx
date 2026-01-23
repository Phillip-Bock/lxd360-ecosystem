'use client';

import dynamic from 'next/dynamic';

const LoginForm = dynamic(() => import('./LoginForm'), {
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
