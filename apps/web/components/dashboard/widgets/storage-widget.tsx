'use client';

import { Cloud } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ACCOUNT_STORAGE_LIMITS, formatStorageSize } from '@/types/library';
import WidgetWrapper from './widget-wrapper';

// Mock data - replace with real storage calculation
const mockStorageUsed = 1.2 * 1024 * 1024 * 1024; // 1.2 GB
const accountTier: keyof typeof ACCOUNT_STORAGE_LIMITS = 'free';
const storageLimit = ACCOUNT_STORAGE_LIMITS[accountTier];

export default function StorageWidget() {
  const usedPercentage = (mockStorageUsed / storageLimit) * 100;
  const isWarning = usedPercentage >= 80;
  const isCritical = usedPercentage >= 95;

  return (
    <WidgetWrapper title="Storage" size={1}>
      <div className="flex flex-col items-center">
        {/* Circular Progress */}
        <div className="relative w-20 h-20 mb-2">
          <svg aria-hidden="true" className="w-full h-full -rotate-90">
            {/* Background circle */}
            <circle
              cx="40"
              cy="40"
              r="36"
              fill="none"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="6"
            />
            {/* Progress circle */}
            <circle
              cx="40"
              cy="40"
              r="36"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              strokeLinecap="round"
              className={cn(
                'transition-all duration-300',
                isCritical ? 'text-red-500' : isWarning ? 'text-amber-500' : 'text-primary',
              )}
              strokeDasharray={`${2 * Math.PI * 36}`}
              strokeDashoffset={`${2 * Math.PI * 36 * (1 - usedPercentage / 100)}`}
            />
          </svg>
          {/* Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Cloud
              className={cn(
                'w-6 h-6',
                isCritical ? 'text-red-500' : isWarning ? 'text-amber-500' : 'text-white/70',
              )}
            />
          </div>
        </div>

        {/* Usage Text */}
        <p className="text-sm font-medium text-white">{formatStorageSize(mockStorageUsed)}</p>
        <p className="text-xs text-white/70">of {formatStorageSize(storageLimit)}</p>

        {/* Warning Message */}
        {isWarning && (
          <p
            className={cn(
              'text-xs mt-2 text-center',
              isCritical ? 'text-red-600' : 'text-amber-600',
            )}
          >
            {isCritical ? 'Storage almost full!' : 'Running low on space'}
          </p>
        )}

        {/* Upgrade Link */}
        <Link href="/settings/billing" className="text-xs text-white hover:underline mt-2">
          {isWarning ? 'Upgrade now' : 'Manage storage'}
        </Link>
      </div>
    </WidgetWrapper>
  );
}
