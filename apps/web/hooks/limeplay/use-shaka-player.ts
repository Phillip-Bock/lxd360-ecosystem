'use client';

import React, { useRef } from 'react';
import type shaka from 'shaka-player';

import { useMediaStore } from '@/components/limeplay/media-provider';
import { logger } from '@/lib/logger';

const log = logger.scope('useShakaPlayer');

declare global {
  interface HTMLMediaElement {
    player: null | shaka.Player;
  }
  interface Window {
    shaka: {
      Player: typeof shaka.Player;
    };
  }
}

export function useShakaPlayer() {
  const setPlayer = useMediaStore((state) => state.setPlayer);
  const mediaRef = useMediaStore((state) => state.mediaRef);
  const debug = useMediaStore((state) => state.debug);
  const isServer = typeof window === 'undefined';
  const playerInstance = useRef<null | shaka.Player>(null);

  React.useEffect(() => {
    if (isServer) {
      log.warn('Skipping shaka load on server');
      return;
    }

    const mediaElement = mediaRef.current;

    async function loadPlayer() {
      const shakaLib = debug
        ? await import('shaka-player/dist/shaka-player.compiled.debug')
        : await import('shaka-player');

      if (!mediaElement) {
        return;
      }

      // Access default export for shaka player
      const shakaModule = 'default' in shakaLib ? shakaLib.default : shakaLib;
      const ShakaPlayer = (shakaModule as typeof shaka).Player;
      playerInstance.current = new ShakaPlayer();
      setPlayer(playerInstance.current);

      if (playerInstance.current) {
        await playerInstance.current.attach(mediaElement);
      }

      mediaElement.player = playerInstance.current;
      window.shaka = { Player: ShakaPlayer };
    }

    void loadPlayer();

    return () => {
      if (playerInstance.current) {
        if (mediaElement) {
          mediaElement.pause();
        }
        void playerInstance.current.destroy();
      }
    };
  }, [isServer, mediaRef, debug, setPlayer]);

  return playerInstance.current;
}
