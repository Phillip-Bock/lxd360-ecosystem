'use client';

import { useEffect } from 'react';

import { Media } from '@/components/limeplay/media';
import { useMediaStore } from '@/components/limeplay/media-provider';
import { logger } from '@/lib/logger';

const log = logger.scope('MediaElement');

export function MediaElement({ src }: { src: string }) {
  const player = useMediaStore((state) => state.player);
  const mediaRef = useMediaStore((state) => state.mediaRef);

  useEffect(() => {
    const mediaElement = mediaRef.current;

    if (player && mediaElement) {
      if (src) {
        try {
          const parsedUrl = new URL(src);

          if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
            throw new Error('Invalid URL protocol');
          }
        } catch (error) {
          log.error(
            'Invalid playback URL',
            error instanceof Error ? error : new Error('Unknown error'),
          );
        }
      }

      void player
        .load(src)
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
  }, [player, mediaRef, src]);

  return (
    <Media
      as="video"
      autoPlay={false}
      className="size-full bg-background object-cover"
      loop
      muted
    />
  );
}
