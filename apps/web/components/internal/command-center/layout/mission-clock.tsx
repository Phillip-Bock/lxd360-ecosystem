'use client';

import { Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

export function MissionClock() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!time) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-(--background) border border-brand-accent/20 rounded-lg">
        <Clock className="w-4 h-4 text-brand-cyan" />
        <div className="font-mono">
          <span className="text-brand-primary text-sm">--:--:--</span>
          <span className="text-brand-cyan text-xs ml-2">---</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-(--background) border border-brand-accent/20 rounded-lg">
      <Clock className="w-4 h-4 text-brand-cyan" />
      <div className="font-mono">
        <span className="text-brand-primary text-sm">
          {time.toLocaleTimeString('en-US', { hour12: false })}
        </span>
        <span className="text-brand-cyan text-xs ml-2">
          {time.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      </div>
    </div>
  );
}
