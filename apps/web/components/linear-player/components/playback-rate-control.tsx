'use client';

import * as PlaybackRate from '@/components/limeplay/playback-rate';
import { Button } from '@/components/ui/button';
import { SelectContent } from '@/components/ui/select';

export function PlaybackRateControl() {
  return (
    <PlaybackRate.SelectRoot>
      <Button asChild size="icon" variant="ghost">
        <PlaybackRate.SelectTrigger
          className={`
            border-none bg-transparent px-8 shadow-none
            hover:bg-foreground/10
            dark:bg-transparent dark:shadow-none
          `}
          size="sm"
        />
      </Button>
      <SelectContent
        align="start"
        className={`
          z-100 min-w-24 backdrop-blur-md
          dark:bg-accent
        `}
      >
        <PlaybackRate.SelectGroup className={`tracking-wider`} />
      </SelectContent>
    </PlaybackRate.SelectRoot>
  );
}
