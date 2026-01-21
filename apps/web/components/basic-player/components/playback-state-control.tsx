'use client';

import { Loader2, Pause, Play, Repeat } from 'lucide-react';
import { useMediaStore } from '@/components/limeplay/media-provider';
import { PlaybackControl } from '@/components/limeplay/playback-control';
import { Button } from '@/components/ui/button';

export function PlaybackStateControl() {
  const status = useMediaStore((state) => state.status);

  return (
    <Button asChild size="icon" variant="glass">
      <PlaybackControl>
        {status === 'playing' ? (
          <Pause className="h-[18px] w-[18px]" />
        ) : status === 'ended' ? (
          <Repeat className="h-[18px] w-[18px]" />
        ) : status === 'buffering' ? (
          <Loader2 className="h-[18px] w-[18px] animate-spin" />
        ) : (
          <Play className="h-[18px] w-[18px]" />
        )}
      </PlaybackControl>
    </Button>
  );
}
