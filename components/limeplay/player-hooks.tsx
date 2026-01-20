'use client';

import React from 'react';

import { useShakaPlayer } from '@/hooks/limeplay/use-shaka-player';

export const PlayerHooks = React.memo(() => {
  useShakaPlayer();

  return null;
});

PlayerHooks.displayName = 'PlayerHooks';
