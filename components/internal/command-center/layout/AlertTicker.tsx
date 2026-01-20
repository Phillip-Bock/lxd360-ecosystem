'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';

export interface AlertItem {
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

interface AlertTickerProps {
  alerts: AlertItem[];
}

export function AlertTicker({ alerts }: AlertTickerProps) {
  const icons = {
    info: Info,
    success: CheckCircle,
    warning: AlertTriangle,
    error: XCircle,
  };

  const colors = {
    info: 'text-brand-cyan',
    success: 'text-brand-success',
    warning: 'text-brand-warning',
    error: 'text-brand-error',
  };

  // Triple the alerts for seamless loop
  const repeatedAlerts = [...alerts, ...alerts, ...alerts];

  return (
    <div className="h-8 bg-(--background)/60 border-b border-brand-accent/10 overflow-hidden relative">
      <motion.div
        className="flex items-center gap-12 h-full whitespace-nowrap absolute"
        animate={{ x: ['0%', '-33.33%'] }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        {repeatedAlerts.map((alert, i) => {
          const Icon = icons[alert.type];
          return (
            <div key={i} className="flex items-center gap-2 px-4">
              <Icon className={`w-4 h-4 ${colors[alert.type]} shrink-0`} />
              <span className="text-xs text-brand-muted">{alert.message}</span>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
