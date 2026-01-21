'use client';

/**
 * FormatSelector - Export format selection component
 *
 * Displays available export formats with descriptions and recommended
 * formats for different LMS platforms.
 */

import { Globe, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ExportFormat } from '@/types/studio/publishing';

// =============================================================================
// TYPES
// =============================================================================

interface FormatOption {
  id: ExportFormat;
  name: string;
  description: string;
  icon: React.ReactNode;
  recommended?: string[];
  available: boolean;
}

interface FormatSelectorProps {
  value: ExportFormat;
  onChange: (format: ExportFormat) => void;
}

// =============================================================================
// FORMAT OPTIONS
// =============================================================================

const FORMAT_OPTIONS: FormatOption[] = [
  {
    id: 'scorm_12',
    name: 'SCORM 1.2',
    description:
      'Most compatible format. Works with Moodle, Cornerstone, Litmos, and older LMS platforms.',
    icon: <Package className="h-5 w-5" />,
    recommended: ['Moodle', 'Cornerstone', 'Litmos'],
    available: true,
  },
  {
    id: 'scorm_2004_3rd',
    name: 'SCORM 2004 (3rd Ed)',
    description:
      'Enhanced sequencing and navigation. Recommended for Canvas, Brightspace, and Absorb.',
    icon: <Package className="h-5 w-5" />,
    recommended: ['Canvas', 'Brightspace', 'Absorb'],
    available: true,
  },
  {
    id: 'scorm_2004_4th',
    name: 'SCORM 2004 (4th Ed)',
    description:
      'Latest SCORM standard with improved data model. Best for Blackboard and SuccessFactors.',
    icon: <Package className="h-5 w-5" />,
    recommended: ['Blackboard', 'SuccessFactors'],
    available: true,
  },
  {
    id: 'xapi',
    name: 'xAPI (Tin Can)',
    description:
      'Modern tracking standard with detailed analytics. Works with Docebo, Workday, and LRS systems.',
    icon: <Globe className="h-5 w-5" />,
    recommended: ['Docebo', 'Workday', 'LRS'],
    available: true,
  },
];

// =============================================================================
// COMPONENT
// =============================================================================

export function FormatSelector({ value, onChange }: FormatSelectorProps) {
  return (
    <div className="space-y-3" role="radiogroup" aria-labelledby="format-selector-label">
      <span id="format-selector-label" className="text-sm font-medium text-zinc-300">
        Export Format
      </span>
      <div className="grid gap-3">
        {FORMAT_OPTIONS.filter((f) => f.available).map((format) => (
          <button
            type="button"
            key={format.id}
            onClick={() => onChange(format.id)}
            className={cn(
              'flex items-start gap-4 p-4 rounded-lg border text-left transition-all',
              value === format.id
                ? 'border-primary bg-primary/10 ring-1 ring-primary'
                : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10',
            )}
          >
            <div
              className={cn(
                'mt-0.5 p-2 rounded-md',
                value === format.id ? 'bg-primary/20 text-primary' : 'bg-white/10 text-zinc-400',
              )}
            >
              {format.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'font-medium',
                    value === format.id ? 'text-primary' : 'text-zinc-200',
                  )}
                >
                  {format.name}
                </span>
              </div>
              <p className="mt-1 text-sm text-zinc-400">{format.description}</p>
              {format.recommended && format.recommended.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {format.recommended.map((lms) => (
                    <span
                      key={lms}
                      className="inline-flex items-center px-2 py-0.5 text-xs rounded-sm bg-white/5 text-zinc-500"
                    >
                      {lms}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div
              className={cn(
                'mt-1 w-4 h-4 rounded-full border-2 flex items-center justify-center',
                value === format.id ? 'border-primary' : 'border-zinc-600',
              )}
            >
              {value === format.id && <div className="w-2 h-2 rounded-full bg-primary" />}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
