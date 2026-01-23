'use client';

import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { getFirebaseAuth } from '@/lib/firebase/client';

export default function LoginForm() {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<string>('idle');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    const auth = getFirebaseAuth();
    if (!auth) {
      setStatus('System Error: Firebase config missing.');
      return;
    }

    try {
      await signInWithEmailAndPassword(
        auth,
        emailRef.current?.value || '',
        passwordRef.current?.value || '',
      );
      window.location.href = '/ignite/teach/courses';
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error(err);
      setStatus(`Login Failed: ${message}`);
    }
  };

  return (
    <div className="w-full max-w-md rounded border border-gray-800 bg-gray-950 p-8">
      <h1 className="mb-6 text-2xl font-bold">LXD360 Login</h1>

      {status !== 'idle' && status !== 'loading' && (
        <div className="mb-4 rounded border border-red-900 bg-gray-900 p-3 text-sm text-red-200">
          {status}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm text-gray-400">
            Email
          </label>
          <input
            ref={emailRef}
            id="email"
            type="email"
            aria-label="Email address"
            className="w-full rounded border border-gray-700 bg-gray-900 p-2 text-white outline-none focus:border-blue-500"
            placeholder="admin@lxd360.com"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm text-gray-400">
            Password
          </label>
          <input
            ref={passwordRef}
            id="password"
            type="password"
            aria-label="Password"
            className="w-full rounded border border-gray-700 bg-gray-900 p-2 text-white outline-none focus:border-blue-500"
            placeholder="••••••••"
          />
        </div>
        <Button
          type="submit"
          disabled={status === 'loading'}
          className="w-full"
          aria-label={status === 'loading' ? 'Signing in' : 'Sign in'}
        >
          {status === 'loading' ? 'Signing In...' : 'Sign In'}
        </Button>
      </form>
    </div>
  );
}
