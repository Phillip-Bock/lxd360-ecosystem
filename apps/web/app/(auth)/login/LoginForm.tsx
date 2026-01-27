'use client';

import { browserLocalPersistence, setPersistence, signInWithEmailAndPassword } from 'firebase/auth';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getFirebaseAuth } from '@/lib/firebase/client';
import { ForgotPasswordModal } from './ForgotPasswordModal';

export default function LoginForm() {
  const [status, setStatus] = useState<string>('idle');
  const router = useRouter();
  const isLoading = status === 'loading' || status.includes('Success');

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const auth = getFirebaseAuth();

    if (!auth) {
      setStatus('System Error: Firebase config missing.');
      return;
    }

    try {
      // 1. Force Persistence
      await setPersistence(auth, browserLocalPersistence);

      // 2. Sign In
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setStatus('Success! Setting up session...');

      // 3. Get ID token and set session cookie
      const idToken = await userCredential.user.getIdToken();

      // Try to set session cookie (non-blocking)
      try {
        await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken }),
          credentials: 'same-origin',
        });
      } catch {
        // Session cookie is optional - Firebase client auth is primary
      }

      setStatus('Success! Redirecting...');

      // 4. Navigate to dashboard
      // Use router.push for client-side navigation
      router.push('/ignite/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setStatus(`Login Failed: ${message}`);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6 rounded-lg border border-gray-800 bg-gray-950 p-8 shadow-xl">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-white">Welcome back</h1>
        <p className="text-sm text-gray-400">Enter your credentials to access the command center</p>
      </div>

      {status !== 'idle' && !status.includes('Success') && status !== 'loading' && (
        <div className="rounded-md bg-red-900/50 p-3 text-sm text-red-200 border border-red-900">
          {status}
        </div>
      )}

      {status.includes('Success') && (
        <div className="rounded-md bg-green-900/50 p-3 text-sm text-green-200 border border-green-900">
          {status}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="instructor@lxd360.com"
            required
            className="bg-gray-900 border-gray-800 focus:border-blue-500"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <ForgotPasswordModal />
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
            className="bg-gray-900 border-gray-800 focus:border-blue-500"
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-white text-black hover:bg-gray-200"
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading ? 'Verifying...' : 'Sign In'}
        </Button>
      </form>

      <div className="text-center text-sm text-gray-500">
        Don&apos;t have an account?{' '}
        <Link href="#" className="text-blue-500 hover:text-blue-400">
          Contact Admin
        </Link>
      </div>
    </div>
  );
}
