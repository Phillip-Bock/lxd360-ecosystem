'use client';

import React from 'react';

import { useCaptionsStates } from '@/hooks/limeplay/use-captions';
import { usePlaybackRateStates } from '@/hooks/limeplay/use-playback-rate';
import { usePlayerStates } from '@/hooks/limeplay/use-player';
import { useShakaPlayer } from '@/hooks/limeplay/use-shaka-player';
import { useTimelineStates } from '@/hooks/limeplay/use-timeline';
import { useVolumeStates } from '@/hooks/limeplay/use-volume';

export const PlayerHooks = React.memo(() => {
  useShakaPlayer();
  usePlayerStates();
  useTimelineStates();
  useVolumeStates();
  useCaptionsStates();
  usePlaybackRateStates();

  return null;
});

PlayerHooks.displayName = 'PlayerHooks';
