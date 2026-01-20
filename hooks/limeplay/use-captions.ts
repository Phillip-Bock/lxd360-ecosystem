'use client';

import { useCallback, useEffect } from 'react';
import type shaka from 'shaka-player';
import type { StateCreator } from 'zustand';
import { useGetStore, useMediaStore } from '@/components/limeplay/media-provider';
import type { PlayerStore } from '@/hooks/limeplay/use-player';
import { getDeviceLanguage, off, on } from '@/lib/utils';

export interface CaptionsStore {
  activeTextTrack: null | shaka.extern.TextTrack;
  setTextTrackContainerElement: (ref: HTMLDivElement | null) => void;
  textTrackContainerElement: HTMLDivElement | null;
  textTracks?: shaka.extern.TextTrack[];
  textTrackVisible: boolean;
}

export const createCaptionsStore: StateCreator<
  CaptionsStore & PlayerStore,
  [],
  [],
  CaptionsStore
> = (set) => ({
  activeTextTrack: null,
  setTextTrackContainerElement: (element: HTMLDivElement | null) => {
    set({
      textTrackContainerElement: element,
    });
  },
  textTrackContainerElement: null,
  textTracks: undefined,
  textTrackVisible: false,
});

export function useCaptions() {
  const store = useGetStore();
  const player = useMediaStore((s) => s.player);
  const activeTextTrack = useMediaStore((s) => s.activeTextTrack);
  const textTracks = useMediaStore((s) => s.textTracks);

  const findDefaultTrack = useCallback(() => {
    if (!textTracks) {
      console.warn('No text tracks found');
      return;
    }

    if (textTracks.length === 1) {
      return textTracks[0];
    }

    const deviceLanguage = getDeviceLanguage();

    const regionalTrack = textTracks.find((track) => track.language === deviceLanguage);

    if (regionalTrack) {
      return regionalTrack;
    }

    return textTracks[0];
  }, [textTracks]);

  const selectTrack = useCallback(
    (track: shaka.extern.TextTrack): boolean => {
      if (!player || !textTracks) {
        return false;
      }

      player.selectTextTrack(track);

      const activeTextTrack = player.getTextTracks().find((t: shaka.extern.TextTrack) => t.active);

      store.setState({ activeTextTrack });

      return true;
    },
    [player, textTracks, store],
  );

  const toggleCaptionVisibility = () => {
    if (!player) {
      return;
    }

    if (!activeTextTrack) {
      const defaultTrack = findDefaultTrack();
      if (defaultTrack) {
        const isSuccess = selectTrack(defaultTrack);

        if (!isSuccess) {
          console.error('Failed to select default text track');
          return;
        }
      }
    }

    const isVisible = store.getState().textTrackVisible;
    player.setTextTrackVisibility(!isVisible);
  };

  return {
    toggleCaptionVisibility,
  };
}

export function useCaptionsStates() {
  const store = useGetStore();
  const player = useMediaStore((s) => s.player);
  const containerElement = useMediaStore((s) => s.textTrackContainerElement);
  const mediaRef = useMediaStore((state) => state.mediaRef);
  const canPlay = useMediaStore((state) => state.canPlay);

  useEffect(() => {
    if (!player || !containerElement) {
      return;
    }

    player.setVideoContainer(containerElement);
  }, [containerElement, player]);

  useEffect(() => {
    if (!mediaRef.current || !player) return;

    const onTextTrackChanged = (): void => {
      if (!player) {
        return;
      }

      const activeTextTrack = player.getTextTracks().find((t: shaka.extern.TextTrack) => t.active);

      store.setState({ activeTextTrack });
    };

    const onTracksChanged = (): void => {
      if (!player) {
        return;
      }

      const tracks = player.getTextTracks();
      store.setState({ textTracks: tracks });
    };

    const onTextTrackVisibility = (): void => {
      if (!player) {
        return;
      }

      const isVisible = player.isTextTrackVisible();

      store.setState({ textTrackVisible: isVisible });
    };

    if (canPlay) {
      onTracksChanged();
    }

    on(player, 'textchanged', onTextTrackChanged);
    on(player, 'trackschanged', onTracksChanged);
    on(player, 'loading', onTracksChanged);
    on(player, 'texttrackvisibility', onTextTrackVisibility);

    return () => {
      off(player, 'textchanged', onTextTrackChanged);
      off(player, 'trackschanged', onTracksChanged);
      off(player, 'loading', onTracksChanged);
      off(player, 'texttrackvisibility', onTextTrackVisibility);
    };
  }, [mediaRef, player, canPlay, store]);
}
