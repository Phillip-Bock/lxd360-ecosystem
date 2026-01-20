'use client';

import { Loader2, Pause, Play, Repeat } from 'lucide-react';
import { useMediaStore } from '@/components/limeplay/media-provider';
import { PlaybackControl } from '@/components/limeplay/playback-control';
import { Button } from '@/components/ui/button';

export function PlaybackStateControl() {
  const status = useMediaStore((state) => state.status);

  return (
    <PlaybackControl asChild>
      <Button className="cursor-pointer" size="icon" variant="glass">
        {status === 'playing' ? (
          <Pause className="h-4 w-4" />
        ) : status === 'ended' ? (
          <Repeat className="h-4 w-4" />
        ) : status === 'buffering' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </Button>
    </PlaybackControl>
  );
}
