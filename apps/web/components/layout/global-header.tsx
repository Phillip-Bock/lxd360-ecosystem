'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useChatStore } from '@/store/chat-store';

interface GlobalHeaderProps {
  extraActions?: React.ReactNode;
}

function formatDateTime(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  const dateStr = date.toLocaleDateString('en-US', options);
  const timeStr = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  return `${dateStr} • ${timeStr}`;
}

export default function GlobalHeader({ extraActions }: GlobalHeaderProps) {
  const [dateTime, setDateTime] = useState<string>('');
  const { setOpen, tokensUsed, tokenLimit } = useChatStore();

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDateTime(formatDateTime(new Date()));
    }, 0);

    const interval = setInterval(() => {
      setDateTime(formatDateTime(new Date()));
    }, 1000);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  const tokensRemaining = tokenLimit - tokensUsed;

  return (
    <header className="h-16 bg-(--inspire-header-bg) border-b border-(--inspire-separator) shrink-0">
      <div className="h-full flex items-center justify-between px-4">
        {/* Left: Logo (larger) */}
        <div className="flex items-center gap-4">
          <Image
            src="/INSPIRE-Studios Transparent Logo Primary.png"
            alt="INSPIRE Studios"
            width={240}
            height={60}
            style={{ width: 'auto', height: 48 }}
            priority
          />

          {extraActions}
        </div>

        {/* Center: Date/Time and Token Counter */}
        <div className="flex items-center gap-8">
          <span className="text-white/90 text-sm">{dateTime}</span>
          <div className="h-6 w-px bg-white/30" />
          <span className="text-white/70 text-sm">
            {tokensRemaining.toLocaleString()} of {tokenLimit.toLocaleString()} tokens remaining
          </span>
        </div>

        {/* Right: Neuro Avatar */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 group"
          >
            <span className="text-white text-sm group-hover:text-cyan-400 transition-colors">
              Neuro
            </span>
            <div className="rounded-full bg-white p-0.5">
              <div className="relative h-8 w-8 rounded-full overflow-hidden">
                <Image
                  src="/Neuronaut e-mentor head.png"
                  alt="Neuro - AI Assistant"
                  fill
                  className="object-cover"
                  sizes="32px"
                />
              </div>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
