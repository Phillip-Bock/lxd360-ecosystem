'use client';

import { useEffect, useState } from 'react';

interface SystemStatusBarProps {
  uptime?: number;
  latency?: number;
  requestsPerMin?: number;
  environment?: 'production' | 'staging' | 'development';
  version?: string;
}

export function SystemStatusBar({
  uptime = 99.97,
  latency = 42,
  requestsPerMin = 1247,
  environment = 'production',
  version = '2.4.1',
}: SystemStatusBarProps) {
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    setLastUpdate(new Date());
    const interval = setInterval(() => setLastUpdate(new Date()), 5000);
    return () => clearInterval(interval);
  }, []);

  const envColors = {
    production: 'text-brand-warning',
    staging: 'text-brand-cyan',
    development: 'text-brand-success',
  };

  return (
    <footer className="fixed bottom-0 left-0 right-0 h-8 bg-(--background)/90 border-t border-brand-accent/20 flex items-center justify-between px-6 text-xs font-mono z-20 backdrop-blur-xs">
      <div className="flex items-center gap-6 text-brand-muted">
        <span>
          UPTIME: <span className="text-brand-success">{uptime}%</span>
        </span>
        <span>
          LATENCY: <span className="text-brand-cyan">{latency}ms</span>
        </span>
        <span>
          REQUESTS/MIN: <span className="text-brand-cyan">{requestsPerMin.toLocaleString()}</span>
        </span>
      </div>
      <div className="flex items-center gap-4 text-brand-muted">
        <span>
          ENV: <span className={envColors[environment]}>{environment.toUpperCase()}</span>
        </span>
        <span>
          VERSION: <span className="text-brand-muted">{version}</span>
        </span>
        <span>
          UPDATED:{' '}
          <span className="text-brand-cyan">{lastUpdate?.toLocaleTimeString() || '--:--:--'}</span>
        </span>
      </div>
    </footer>
  );
}
