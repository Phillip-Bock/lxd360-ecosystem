import React from 'react';
import { MediaElement } from '@/components/basic-player/components/media-element';
import { PlaybackStateControl } from '@/components/basic-player/components/playback-state-control';
import { PlayerHooks } from '@/components/basic-player/components/player-hooks';
import { FallbackPoster } from '@/components/limeplay/fallback-poster';
import { LimeplayLogo } from '@/components/limeplay/limeplay-logo';
import { MediaProvider } from '@/components/limeplay/media-provider';
import * as Layout from '@/components/limeplay/player-layout';
import { RootContainer } from '@/components/limeplay/root-container';
import { cn } from '@/lib/utils';

export interface BasicMediaPlayerProps extends React.ComponentPropsWithoutRef<'div'> {
  className?: string;
  debug?: boolean;
  src: string;
}

export const LimeplayMediaPlayer = React.forwardRef<HTMLDivElement, BasicMediaPlayerProps>(
  (props, ref) => {
    const { className, src, ...etc } = props;

    return (
      <MediaProvider>
        <RootContainer
          className={cn(
            `
            m-auto w-full
            md:min-w-80
          `,
            className,
          )}
          height={720}
          ref={ref}
          width={1280}
          {...etc}
        >
          <Layout.PlayerContainer>
            <FallbackPoster className="bg-black">
              <LimeplayLogo />
            </FallbackPoster>
            <MediaElement src={src} />
            <PlayerHooks />
            <Layout.ControlsOverlayContainer />
            <Layout.ControlsContainer>
              <Layout.ControlsBottomContainer>
                <PlaybackStateControl />
              </Layout.ControlsBottomContainer>
            </Layout.ControlsContainer>
          </Layout.PlayerContainer>
        </RootContainer>
      </MediaProvider>
    );
  },
);

LimeplayMediaPlayer.displayName = 'LimeplayMediaPlayer';
