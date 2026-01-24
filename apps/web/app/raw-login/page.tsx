'use client';

import { signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import { getFirebaseAuth } from '@/lib/firebase/client';

export default function RawLoginPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const addLog = (msg: string) =>
    setLogs((prev) => [...prev, `${new Date().toISOString().split('T')[1]} - ${msg}`]);

  const handleManualLogin = async () => {
    addLog('🟢 Starting Login Process...');

    if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
      addLog('🔴 CRITICAL: Missing API Key in process.env');
      return;
    }

    addLog('🟡 Initializing Firebase Auth...');
    const auth = getFirebaseAuth();

    if (!auth) {
      addLog('🔴 Failed to get Auth instance.');
      return;
    }
    addLog('🟢 Auth Instance Ready.');

    try {
      addLog(`🟡 Attempting SignIn for ${email}...`);

      const loginPromise = signInWithEmailAndPassword(auth, email, password);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('TIMEOUT: Firebase took too long')), 10000),
      );

      await Promise.race([loginPromise, timeoutPromise]);

      addLog('🟢 LOGIN SUCCESSFUL! Redirecting...');

      window.location.href = '/ignite/dashboard';
    } catch (err: unknown) {
      const error = err as Error & { code?: string };
      console.error(err);
      addLog(`🔴 ERROR: ${error.message}`);
      if (error.code === 'auth/network-request-failed') {
        addLog('⚠️ Network Error: Check your internet connection or Firewall.');
      }
    }
  };

  return (
    <div
      style={{
        padding: '40px',
        backgroundColor: '#000',
        color: '#fff',
        minHeight: '100vh',
        fontFamily: 'monospace',
      }}
    >
      <h1 style={{ color: 'red', fontSize: '24px', marginBottom: '20px' }}>BARE METAL LOGIN</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '400px' }}>
        <div>
          <label htmlFor="raw-email" style={{ display: 'block', marginBottom: '5px' }}>
            Email:
          </label>
          <input
            id="raw-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '10px', color: 'black' }}
            placeholder="phill+teach@lxd360.com"
          />
        </div>

        <div>
          <label htmlFor="raw-password" style={{ display: 'block', marginBottom: '5px' }}>
            Password:
          </label>
          <input
            id="raw-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '10px', color: 'black' }}
            placeholder="LXD360-Dev!"
          />
        </div>

        <button
          type="button"
          onClick={handleManualLogin}
          style={{
            padding: '15px',
            backgroundColor: 'blue',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 'bold',
            marginTop: '10px',
          }}
        >
          FORCE SIGN IN
        </button>
      </div>

      <div style={{ marginTop: '40px', borderTop: '1px solid #333', paddingTop: '20px' }}>
        <h3>LIVE DEBUG LOGS:</h3>
        {logs.map((log, i) => (
          <div
            key={i}
            style={{
              color: log.includes('🔴') ? 'red' : log.includes('🟢') ? 'lightgreen' : '#ccc',
            }}
          >
            {log}
          </div>
        ))}
      </div>
    </div>
  );
}
