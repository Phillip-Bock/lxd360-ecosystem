'use client';

import { Captions, CaptionsOff } from 'lucide-react';
import { CaptionsControl } from '@/components/limeplay/captions';
import { useMediaStore } from '@/components/limeplay/media-provider';
import { Button } from '@/components/ui/button';

export function CaptionsStateControl() {
  const textTrackVisible = useMediaStore((state) => state.textTrackVisible);

  return (
    <CaptionsControl asChild>
      <Button className="cursor-pointer" size="icon" variant="glass">
        {textTrackVisible ? <Captions className="h-4 w-4" /> : <CaptionsOff className="h-4 w-4" />}
      </Button>
    </CaptionsControl>
  );
}
