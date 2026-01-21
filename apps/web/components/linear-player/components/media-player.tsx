import React from 'react';
import { CaptionsContainer } from '@/components/limeplay/captions';
import { FallbackPoster } from '@/components/limeplay/fallback-poster';
import { LimeplayLogo } from '@/components/limeplay/limeplay-logo';
import { MediaProvider } from '@/components/limeplay/media-provider';
import * as Layout from '@/components/limeplay/player-layout';
import { RootContainer } from '@/components/limeplay/root-container';
import { BottomControls } from '@/components/linear-player/components/bottom-controls';
import { MediaElement } from '@/components/linear-player/components/media-element';
import { PlayerHooks } from '@/components/linear-player/components/player-hooks';
import { cn } from '@/lib/utils';

export interface LinearMediaPlayerProps {
  className?: string;
  debug?: boolean;
  src?: string;
}

export const LinearMediaPlayer = React.forwardRef<HTMLDivElement, LinearMediaPlayerProps>(
  ({ className, debug = false }, ref) => {
    return (
      <MediaProvider debug={debug}>
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
        >
          <Layout.PlayerContainer>
            <FallbackPoster className="bg-black">
              <LimeplayLogo />
            </FallbackPoster>
            <MediaElement />
            <PlayerHooks />
            <Layout.ControlsOverlayContainer />
            <Layout.ControlsContainer className="pb-6">
              <CaptionsContainer />
              <BottomControls />
            </Layout.ControlsContainer>
          </Layout.PlayerContainer>
        </RootContainer>
      </MediaProvider>
    );
  },
);

LinearMediaPlayer.displayName = 'LinearMediaPlayer';
