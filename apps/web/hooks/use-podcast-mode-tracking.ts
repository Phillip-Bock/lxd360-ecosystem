'use client';

/**
 * =============================================================================
 * LXD360 | Podcast Mode Tracking Hook
 * =============================================================================
 *
 * Hook to connect persistent player modality switches to xAPI tracking.
 * Emits xAPI statements when users switch between Watch and Listen modes.
 *
 * @version 1.0.0
 * @updated 2026-01-27
 */

import { useEffect } from 'react';
import { getEmitter } from '@/lib/xapi/emitter';
import type { ActorOptions } from '@/lib/xapi/statement-builder';
import { type ModalitySwitchEvent, onModalitySwitch } from './use-persistent-player';

/**
 * Configuration for podcast mode tracking
 */
export interface PodcastModeTrackingConfig {
  /** Actor information for xAPI statements */
  actor: ActorOptions;
  /** Registration ID for the learning session */
  registration?: string;
  /** Whether tracking is enabled */
  enabled?: boolean;
}

/**
 * Map playback modality to xAPI modality string
 */
function mapModalityToXAPI(modality: 'watch' | 'listen'): string {
  return modality === 'watch' ? 'video' : 'audio';
}

/**
 * Hook to track podcast mode switches via xAPI
 *
 * @example
 * ```tsx
 * function CoursePlayer() {
 *   const { user } = useAuth();
 *
 *   usePodcastModeTracking({
 *     actor: {
 *       userId: user.id,
 *       name: user.displayName,
 *       email: user.email,
 *     },
 *     registration: courseEnrollmentId,
 *   });
 *
 *   return <PersistentPlayerBar />;
 * }
 * ```
 */
export function usePodcastModeTracking(config: PodcastModeTrackingConfig): void {
  const { actor, registration, enabled = true } = config;

  useEffect(() => {
    if (!enabled) return;

    const unsubscribe = onModalitySwitch((event: ModalitySwitchEvent) => {
      const emitter = getEmitter();

      // Build activity from content atom
      const activity = {
        id: event.contentAtom.id,
        name: event.contentAtom.title,
        type: 'http://adlnet.gov/expapi/activities/media' as const,
      };

      // Emit the modality switch statement
      emitter.emitModalitySwitched(
        actor,
        activity,
        mapModalityToXAPI(event.fromModality),
        mapModalityToXAPI(event.toModality),
        event.reason,
        registration,
      );
    });

    return unsubscribe;
  }, [actor, registration, enabled]);
}

export default usePodcastModeTracking;
