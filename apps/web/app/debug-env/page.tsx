'use client';

export default function DebugEnvPage() {
  // Capture values at runtime to see what the browser actually gets
  const env = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  };

  const status = env.apiKey ? '✅ LOADED' : '❌ MISSING (Undefined)';
  const isMalformed = env.apiKey?.startsWith('"') || env.apiKey?.includes(' ');

  return (
    <div className="min-h-screen bg-black text-white p-10 font-mono">
      <h1 className="text-2xl font-bold mb-6 text-blue-500">ENVIRONMENT DIAGNOSTIC</h1>

      <div className="border border-gray-800 p-6 rounded bg-gray-900 space-y-4">
        <div>
          <span className="text-gray-400">Status:</span>
          <span className={`ml-2 font-bold ${env.apiKey ? 'text-green-400' : 'text-red-500'}`}>
            {status}
          </span>
        </div>

        {isMalformed && (
          <div className="bg-red-900/50 p-4 border border-red-500 text-red-200">
            ⚠️ WARNING: API Key appears malformed (contains quotes or spaces). Check .env.local and
            remove quotes around values.
          </div>
        )}

        <pre className="bg-black p-4 rounded text-xs text-gray-300 overflow-auto">
          {JSON.stringify(env, null, 2)}
        </pre>

        <div className="text-sm text-gray-500 pt-4">
          <p>
            1. If <strong>MISSING</strong>: Your `.env.local` is in the wrong folder or ignored.
          </p>
          <p>
            2. If <strong>LOADED</strong>: The keys are correct, and we can proceed to login.
          </p>
        </div>
      </div>
    </div>
  );
}
