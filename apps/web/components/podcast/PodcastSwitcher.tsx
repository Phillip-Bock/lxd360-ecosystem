'use client';

import { Check, ChevronsUpDown } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const podcastPlatforms = [
  { value: 'spotify', label: 'Spotify', icon: '🎵' },
  { value: 'apple', label: 'Apple Podcasts', icon: '🍎' },
  { value: 'amazon', label: 'Amazon Music', icon: '📦' },
  { value: 'google', label: 'Google Podcasts', icon: '🔍' },
  { value: 'youtube', label: 'YouTube Music', icon: '▶️' },
  { value: 'overcast', label: 'Overcast', icon: '☁️' },
  { value: 'pocketcasts', label: 'Pocket Casts', icon: '📱' },
];

interface PodcastSwitcherProps {
  className?: string;
}

export function PodcastSwitcher({ className }: PodcastSwitcherProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('spotify');

  const selectedPlatform = podcastPlatforms.find((platform) => platform.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-[200px] justify-between bg-[var(--brand-surface)] border-[var(--brand-border)] text-[var(--brand-text-primary)]',
            className,
          )}
        >
          {selectedPlatform ? (
            <span className="flex items-center gap-2">
              <span>{selectedPlatform.icon}</span>
              {selectedPlatform.label}
            </span>
          ) : (
            'Select platform...'
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0 bg-[var(--brand-surface)] border-[var(--brand-border)]">
        <Command>
          <CommandInput placeholder="Search platform..." />
          <CommandList>
            <CommandEmpty>No platform found.</CommandEmpty>
            <CommandGroup>
              {podcastPlatforms.map((platform) => (
                <CommandItem
                  key={platform.value}
                  value={platform.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? '' : currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === platform.value ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  <span className="mr-2">{platform.icon}</span>
                  {platform.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
