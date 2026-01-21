'use client';

import React from 'react';

import { usePlayerStates } from '@/hooks/limeplay/use-player';
import { useShakaPlayer } from '@/hooks/limeplay/use-shaka-player';

export const PlayerHooks = React.memo(() => {
  useShakaPlayer();
  usePlayerStates();

  return null;
});

PlayerHooks.displayName = 'PlayerHooks';
