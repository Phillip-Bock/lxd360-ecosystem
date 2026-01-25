'use client';

import { useEffect } from 'react';
import type shaka from 'shaka-player';
import { Media } from '@/components/limeplay/media';
import { useMediaStore } from '@/components/limeplay/media-provider';
import { ASSETS } from '@/components/linear-player/components/playlist';
import { logger } from '@/lib/logger';

const log = logger.scope('MediaElement');

export function MediaElement({
  config,
  src,
}: {
  config?: shaka.extern.PlayerConfiguration;
  src?: string;
}) {
  const player = useMediaStore((state) => state.player);
  const mediaRef = useMediaStore((state) => state.mediaRef);

  useEffect(() => {
    const mediaElement = mediaRef.current;
    let localSrc = src;
    let localConfig = config;

    if (!localSrc || !localConfig) {
      localSrc = ASSETS[0].src;
      localConfig = ASSETS[0].config;
    }

    if (player && mediaElement) {
      if (localSrc) {
        try {
          const parsedUrl = new URL(localSrc);

          if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
            throw new Error('Invalid URL protocol');
          }
        } catch (error) {
          log.error(
            'Invalid playback URL',
            error instanceof Error ? error : new Error(String(error)),
          );
        }
      }

      if (localConfig) {
        player.configure(localConfig);
      }

      if (localSrc) {
        void player
          .load(localSrc)
          .then(() => {
            // Media loaded successfully
          })
          .catch((error: unknown) => {
            log.error(
              'Error loading media',
              error instanceof Error ? error : new Error(String(error)),
            );
          });
      }
    }
  }, [player, mediaRef, src, config]);

  return <Media as="video" autoPlay={false} className="size-full object-cover" loop muted />;
}
