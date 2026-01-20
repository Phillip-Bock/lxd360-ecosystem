'use client';

import { Volume1, Volume2, VolumeX } from 'lucide-react';
import { useMediaStore } from '@/components/limeplay/media-provider';
import { MuteControl } from '@/components/limeplay/mute-control';
import { Button } from '@/components/ui/button';

export function VolumeStateControl() {
  const muted = useMediaStore((state) => state.muted);
  const volume = useMediaStore((state) => state.volume);

  return (
    <MuteControl asChild>
      <Button className="cursor-pointer" size="icon" variant="glass">
        {muted || volume === 0 ? (
          <VolumeX className="h-4 w-4" />
        ) : volume < 0.5 ? (
          <Volume1 className="h-4 w-4" />
        ) : (
          <Volume2 className="h-4 w-4" />
        )}
      </Button>
    </MuteControl>
  );
}
