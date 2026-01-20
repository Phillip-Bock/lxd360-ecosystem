'use client';

/**
 * RestrictedModeToggle - Content restriction level selector
 * Filters AI-generated content based on audience type
 */

import {
  AlertTriangle,
  Baby,
  Briefcase,
  Check,
  ChevronDown,
  Shield,
  ShieldCheck,
  ShieldOff,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

type RestrictionLevel = 'unrestricted' | 'workplace' | 'k12' | 'coppa';

interface RestrictedModeToggleProps {
  level: RestrictionLevel;
  onChange: (level: RestrictionLevel) => void;
  disabled?: boolean;
}

interface LevelConfig {
  id: RestrictionLevel;
  label: string;
  shortLabel: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  restrictions: string[];
}

const LEVELS: LevelConfig[] = [
  {
    id: 'unrestricted',
    label: 'Unrestricted',
    shortLabel: 'Open',
    description: 'No content restrictions applied',
    icon: <ShieldOff className="h-4 w-4" />,
    color: 'text-zinc-400',
    bgColor: 'bg-zinc-500/10',
    restrictions: [],
  },
  {
    id: 'workplace',
    label: 'Workplace Safe',
    shortLabel: 'Work',
    description: 'Professional environment standards',
    icon: <Briefcase className="h-4 w-4" />,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    restrictions: [
      'Filters explicit language',
      'Blocks adult content references',
      'Professional tone in AI responses',
    ],
  },
  {
    id: 'k12',
    label: 'K-12 Safe',
    shortLabel: 'K-12',
    description: 'Educational environment for minors',
    icon: <ShieldCheck className="h-4 w-4" />,
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    restrictions: [
      'Age-appropriate language only',
      'No violence or mature themes',
      'Educational content focus',
      'Blocks external links',
    ],
  },
  {
    id: 'coppa',
    label: 'COPPA Compliant',
    shortLabel: 'COPPA',
    description: 'Children under 13 - strictest filtering',
    icon: <Baby className="h-4 w-4" />,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    restrictions: [
      'No data collection',
      'No external media',
      'Simple, child-safe language',
      'No user-generated content',
      'Parental consent required',
    ],
  },
];

/**
 * RestrictedModeToggle - Dropdown for selecting content restriction level
 */
export function RestrictedModeToggle({
  level,
  onChange,
  disabled = false,
}: RestrictedModeToggleProps) {
  const [isOpen, setIsOpen] = useState(false);

  const currentLevel = LEVELS.find((l) => l.id === level) || LEVELS[0];
  const isRestricted = level !== 'unrestricted';

  return (
    <TooltipProvider>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  'h-8 gap-2 border-white/10',
                  isRestricted && currentLevel.bgColor,
                  isRestricted && 'border-transparent',
                )}
                disabled={disabled}
              >
                <span className={currentLevel.color}>{currentLevel.icon}</span>
                <span
                  className={cn('text-xs', isRestricted ? currentLevel.color : 'text-zinc-400')}
                >
                  {currentLevel.shortLabel}
                </span>
                <ChevronDown
                  className={cn(
                    'h-3 w-3 text-zinc-500 transition-transform',
                    isOpen && 'rotate-180',
                  )}
                />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p className="font-medium">{currentLevel.label}</p>
            <p className="text-xs text-zinc-400">{currentLevel.description}</p>
          </TooltipContent>
        </Tooltip>

        <DropdownMenuContent
          className="w-72 bg-[#1a1a2e] border-white/10"
          align="end"
          sideOffset={8}
        >
          <DropdownMenuLabel className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <span>Content Restrictions</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-white/10" />

          {LEVELS.map((levelOption) => (
            <DropdownMenuItem
              key={levelOption.id}
              className={cn(
                'flex flex-col items-start p-3 cursor-pointer',
                'focus:bg-white/5',
                level === levelOption.id && levelOption.bgColor,
              )}
              onClick={() => {
                onChange(levelOption.id);
                setIsOpen(false);
              }}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <span className={levelOption.color}>{levelOption.icon}</span>
                  <span className={cn('font-medium text-sm', levelOption.color)}>
                    {levelOption.label}
                  </span>
                </div>
                {level === levelOption.id && <Check className="h-4 w-4 text-primary" />}
              </div>
              <p className="text-xs text-zinc-500 mt-1 ml-6">{levelOption.description}</p>

              {/* Restrictions List */}
              {levelOption.restrictions.length > 0 && (
                <div className="mt-2 ml-6 space-y-1">
                  {levelOption.restrictions.slice(0, 3).map((restriction, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                      <div className="h-1 w-1 rounded-full bg-zinc-600" />
                      {restriction}
                    </div>
                  ))}
                  {levelOption.restrictions.length > 3 && (
                    <div className="text-[10px] text-zinc-500">
                      +{levelOption.restrictions.length - 3} more
                    </div>
                  )}
                </div>
              )}
            </DropdownMenuItem>
          ))}

          {/* Warning Note */}
          {isRestricted && (
            <>
              <DropdownMenuSeparator className="bg-white/10" />
              <div className="px-3 py-2 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-[10px] text-zinc-400">
                  Restricted mode filters AI-generated content and may limit certain features. Some
                  existing content may be flagged for review.
                </p>
              </div>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  );
}

export default RestrictedModeToggle;
