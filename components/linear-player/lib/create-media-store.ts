import { create } from 'zustand';

import type { CaptionsStore } from '@/hooks/limeplay/use-captions';
import { createCaptionsStore } from '@/hooks/limeplay/use-captions';
import type { PlaybackRateStore } from '@/hooks/limeplay/use-playback-rate';
import { createPlaybackRateStore } from '@/hooks/limeplay/use-playback-rate';
import type { PlayerStore } from '@/hooks/limeplay/use-player';
import { createPlayerStore } from '@/hooks/limeplay/use-player';
import type { TimelineStore } from '@/hooks/limeplay/use-timeline';
import { createTimelineStore } from '@/hooks/limeplay/use-timeline';
import type { VolumeStore } from '@/hooks/limeplay/use-volume';
import { createVolumeStore } from '@/hooks/limeplay/use-volume';

export interface CreateMediaStoreProps {
  debug?: boolean;
}

export type TypeMediaStore = CaptionsStore &
  PlaybackRateStore &
  PlayerStore &
  TimelineStore &
  VolumeStore;

export function createMediaStore(initProps?: Partial<CreateMediaStoreProps>) {
  const mediaStore = create<TypeMediaStore>()((...etc) => ({
    ...createPlayerStore(...etc),
    ...createVolumeStore(...etc),
    ...createTimelineStore(...etc),
    ...createCaptionsStore(...etc),
    ...createPlaybackRateStore(...etc),

    ...initProps,
  }));
  return mediaStore;
}
