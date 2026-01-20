'use client';

import { useEffect } from 'react';
import type { StateCreator } from 'zustand';
import { useGetStore, useMediaStore } from '@/components/limeplay/media-provider';
import type { PlayerStore } from '@/hooks/limeplay/use-player';
import { off, on } from '@/lib/utils';

export interface PlaybackRateStore {
  playbackRate: number;
  playbackRates: number[];
}

export function usePlaybackRateStates() {
  const store = useGetStore();
  const player = useMediaStore((state) => state.player);
  const mediaRef = useMediaStore((state) => state.mediaRef);
  const canPlay = useMediaStore((state) => state.canPlay);

  useEffect(() => {
    if (!mediaRef.current || !player) return;

    const media = mediaRef.current;

    const onPlaybackRateChange = () => {
      if (!player) return;

      const rate = player.getPlaybackRate();

      store.setState({
        playbackRate: rate === 0 ? 1 : rate,
      });
    };

    if (canPlay) {
      onPlaybackRateChange();
    }

    on(player, 'loading', onPlaybackRateChange);
    on(player, 'ratechange', onPlaybackRateChange);
    on(media, 'ratechange', onPlaybackRateChange);

    return () => {
      off(player, 'loading', onPlaybackRateChange);
      off(player, 'ratechange', onPlaybackRateChange);
      off(media, 'ratechange', onPlaybackRateChange);
    };
  }, [player, mediaRef, canPlay, store]);
}

export const createPlaybackRateStore: StateCreator<
  PlaybackRateStore & PlayerStore,
  [],
  [],
  PlaybackRateStore
> = () => ({
  playbackRate: 1,
  playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
});

export function usePlaybackRate() {
  const mediaRef = useMediaStore((state) => state.mediaRef);
  const player = useMediaStore((state) => state.player);

  function setPlaybackRate(playbackRate: number) {
    if (!mediaRef.current) return;

    const media = mediaRef.current;
    media.playbackRate = playbackRate;
  }

  function setTrickplayRate(playbackRate: number, forced: boolean = false) {
    if (!player) return;

    player.trickPlay(playbackRate, forced);
  }

  return {
    setPlaybackRate,
    setTrickplayRate,
  };
}
