/**
 * Playback Engine
 * Handles timeline playback, media synchronization, and cue point execution
 */

import type {
  CuePointAction,
  ObjectTrack,
  PlaybackEvent,
  PlaybackListener,
  TimelineMarker,
  TimelineState,
  TimeMs,
} from '@/types/studio/timeline';
import { getObjectPropertiesAtTime, propertiesToCSS } from './animation-engine';

// =============================================================================
// PLAYBACK ENGINE CLASS
// =============================================================================

export class PlaybackEngine {
  private state: TimelineState;
  private animationFrameId: number | null = null;
  private lastFrameTime: number = 0;
  private listeners: Set<PlaybackListener> = new Set();
  private mediaElements: Map<string, HTMLMediaElement> = new Map();
  private triggeredMarkers: Set<string> = new Set();

  // Callbacks for external systems
  private onObjectUpdate?: (objectId: string, styles: React.CSSProperties) => void;
  private onCuePointAction?: (action: CuePointAction) => Promise<void>;
  private onTimeUpdate?: (time: TimeMs) => void;

  constructor(
    initialState: TimelineState,
    options?: {
      onObjectUpdate?: (objectId: string, styles: React.CSSProperties) => void;
      onCuePointAction?: (action: CuePointAction) => Promise<void>;
      onTimeUpdate?: (time: TimeMs) => void;
    },
  ) {
    this.state = initialState;
    this.onObjectUpdate = options?.onObjectUpdate;
    this.onCuePointAction = options?.onCuePointAction;
    this.onTimeUpdate = options?.onTimeUpdate;
  }

  // ==========================================================================
  // STATE MANAGEMENT
  // ==========================================================================

  /**
   * Update the engine's state reference
   */
  setState(newState: TimelineState): void {
    this.state = newState;
  }

  /**
   * Get current state
   */
  getState(): TimelineState {
    return this.state;
  }

  /**
   * Get current playback time
   */
  getCurrentTime(): TimeMs {
    return this.state.currentTime;
  }

  /**
   * Get timeline duration
   */
  getDuration(): TimeMs {
    return this.state.config.duration;
  }

  /**
   * Check if currently playing
   */
  isPlaying(): boolean {
    return this.state.isPlaying && !this.state.isPaused;
  }

  // ==========================================================================
  // PLAYBACK CONTROL
  // ==========================================================================

  /**
   * Start playback
   */
  play(): void {
    if (this.state.isPlaying && !this.state.isPaused) return;

    this.state.isPlaying = true;
    this.state.isPaused = false;
    this.lastFrameTime = performance.now();
    this.triggeredMarkers.clear();

    this.emit({ type: 'play', time: this.state.currentTime });
    this.syncMediaElements('play');
    this.tick();
  }

  /**
   * Pause playback
   */
  pause(): void {
    if (!this.state.isPlaying || this.state.isPaused) return;

    this.state.isPaused = true;

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    this.emit({ type: 'pause', time: this.state.currentTime });
    this.syncMediaElements('pause');
  }

  /**
   * Stop playback and reset to beginning
   */
  stop(): void {
    this.state.isPlaying = false;
    this.state.isPaused = false;
    this.state.currentTime = 0;
    this.triggeredMarkers.clear();

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    this.emit({ type: 'stop', time: 0 });
    this.syncMediaElements('stop');
    this.updateAllObjects();
    this.onTimeUpdate?.(0);
  }

  /**
   * Seek to specific time
   */
  seek(time: TimeMs): void {
    const clampedTime = Math.max(0, Math.min(time, this.state.config.duration));
    const previousTime = this.state.currentTime;
    this.state.currentTime = clampedTime;

    // Reset triggered markers if seeking backward
    if (clampedTime < previousTime) {
      this.triggeredMarkers.clear();
      // Re-add markers that would have already triggered
      for (const marker of this.state.markerTrack.markers) {
        if (marker.time <= clampedTime) {
          this.triggeredMarkers.add(marker.id);
        }
      }
    }

    this.emit({ type: 'seek', time: clampedTime });
    this.syncMediaElements('seek', clampedTime);
    this.updateAllObjects();
    this.onTimeUpdate?.(clampedTime);
  }

  /**
   * Set playback rate
   */
  setPlaybackRate(rate: number): void {
    this.state.playbackRate = Math.max(0.1, Math.min(4, rate));
    this.syncMediaElements('rate', this.state.playbackRate);
  }

  /**
   * Toggle play/pause
   */
  togglePlayPause(): void {
    if (this.isPlaying()) {
      this.pause();
    } else {
      this.play();
    }
  }

  /**
   * Step forward by one frame
   */
  stepForward(): void {
    const frameDuration = 1000 / this.state.config.frameRate;
    this.seek(this.state.currentTime + frameDuration);
  }

  /**
   * Step backward by one frame
   */
  stepBackward(): void {
    const frameDuration = 1000 / this.state.config.frameRate;
    this.seek(this.state.currentTime - frameDuration);
  }

  /**
   * Jump to start
   */
  jumpToStart(): void {
    this.seek(0);
  }

  /**
   * Jump to end
   */
  jumpToEnd(): void {
    this.seek(this.state.config.duration);
  }

  // ==========================================================================
  // ANIMATION LOOP
  // ==========================================================================

  private tick = (): void => {
    if (!this.state.isPlaying || this.state.isPaused) return;

    const now = performance.now();
    const deltaTime = (now - this.lastFrameTime) * this.state.playbackRate;
    this.lastFrameTime = now;

    const previousTime = this.state.currentTime;
    this.state.currentTime += deltaTime;

    // Check for end of timeline
    if (this.state.currentTime >= this.state.config.duration) {
      this.state.currentTime = this.state.config.duration;
      this.updateAllObjects();
      this.emit({ type: 'ended', time: this.state.currentTime });
      this.stop();
      return;
    }

    // Check for markers/cue points in this frame
    this.checkMarkers(previousTime, this.state.currentTime);

    // Update all objects
    this.updateAllObjects();

    // Emit timeupdate
    this.emit({ type: 'timeupdate', time: this.state.currentTime });
    this.onTimeUpdate?.(this.state.currentTime);

    // Schedule next frame
    this.animationFrameId = requestAnimationFrame(this.tick);
  };

  // ==========================================================================
  // OBJECT UPDATES
  // ==========================================================================

  private updateAllObjects(): void {
    for (const track of this.state.objectTracks) {
      this.updateObject(track);
    }
  }

  private updateObject(track: ObjectTrack): void {
    if (!track.visible) return;

    const properties = getObjectPropertiesAtTime(track, this.state.currentTime, {});
    const styles = propertiesToCSS(properties);

    this.onObjectUpdate?.(track.objectId, styles);
  }

  /**
   * Force update all objects (useful after state changes)
   */
  forceUpdate(): void {
    this.updateAllObjects();
  }

  // ==========================================================================
  // MEDIA SYNCHRONIZATION
  // ==========================================================================

  /**
   * Register a media element for synchronization
   */
  registerMediaElement(trackId: string, element: HTMLMediaElement): void {
    this.mediaElements.set(trackId, element);

    // Set up event listeners for the media element
    element.addEventListener('ended', () => {
      const track = this.state.mediaTracks.find((t) => t.id === trackId);
      if (track?.loop) {
        element.currentTime = track.trimStart / 1000;
        element.play().catch(() => {});
      }
    });
  }

  /**
   * Unregister a media element
   */
  unregisterMediaElement(trackId: string): void {
    this.mediaElements.delete(trackId);
  }

  private syncMediaElements(
    action: 'play' | 'pause' | 'stop' | 'seek' | 'rate',
    value?: TimeMs | number,
  ): void {
    for (const mediaTrack of this.state.mediaTracks) {
      const element = this.mediaElements.get(mediaTrack.id);
      if (!element) continue;

      const effectiveDuration = mediaTrack.duration - mediaTrack.trimStart - mediaTrack.trimEnd;
      const isInRange =
        this.state.currentTime >= mediaTrack.startTime &&
        this.state.currentTime <= mediaTrack.startTime + effectiveDuration;

      const mediaTime =
        (this.state.currentTime - mediaTrack.startTime + mediaTrack.trimStart) / 1000;

      switch (action) {
        case 'play':
          if (isInRange) {
            element.currentTime = mediaTime;
            element.playbackRate = this.state.playbackRate * mediaTrack.playbackRate;
            element.volume = mediaTrack.volume;
            element.play().catch(() => {});
          }
          break;

        case 'pause':
          element.pause();
          break;

        case 'stop':
          element.pause();
          element.currentTime = mediaTrack.trimStart / 1000;
          break;

        case 'seek':
          if (isInRange) {
            element.currentTime = mediaTime;
            if (this.isPlaying()) {
              element.play().catch(() => {});
            }
          } else {
            element.pause();
          }
          break;

        case 'rate':
          if (typeof value === 'number') {
            element.playbackRate = value * mediaTrack.playbackRate;
          }
          break;
      }
    }
  }

  // ==========================================================================
  // MARKERS & CUE POINTS
  // ==========================================================================

  private checkMarkers(fromTime: TimeMs, toTime: TimeMs): void {
    for (const marker of this.state.markerTrack.markers) {
      // Check if marker is in range and hasn't been triggered
      if (
        marker.time > fromTime &&
        marker.time <= toTime &&
        !this.triggeredMarkers.has(marker.id)
      ) {
        this.triggeredMarkers.add(marker.id);
        this.emit({ type: 'marker', time: marker.time, data: marker });

        // Execute cue point actions
        if (marker.actions && marker.actions.length > 0) {
          this.executeCuePointActions(marker.actions);
        }
      }
    }
  }

  private async executeCuePointActions(actions: CuePointAction[]): Promise<void> {
    for (const action of actions) {
      // Apply delay if specified
      if (action.delay && action.delay > 0) {
        await new Promise((resolve) => setTimeout(resolve, action.delay));
      }

      // Handle built-in actions
      switch (action.type) {
        case 'go-to-time':
          if (action.config.targetTime !== undefined) {
            this.seek(action.config.targetTime);
          }
          break;

        case 'pause-timeline':
          this.pause();
          break;

        case 'play-media':
          if (action.config.targetObjectId) {
            const element = this.mediaElements.get(action.config.targetObjectId);
            element?.play().catch(() => {});
          }
          break;

        case 'pause-media':
          if (action.config.targetObjectId) {
            const element = this.mediaElements.get(action.config.targetObjectId);
            element?.pause();
          }
          break;

        case 'stop-media':
          if (action.config.targetObjectId) {
            const element = this.mediaElements.get(action.config.targetObjectId);
            if (element) {
              element.pause();
              element.currentTime = 0;
            }
          }
          break;

        default:
          // Execute via callback for external handling
          await this.onCuePointAction?.(action);
      }

      this.emit({ type: 'cuepoint', time: this.state.currentTime, data: action });
    }
  }

  /**
   * Get markers in a time range
   */
  getMarkersInRange(startTime: TimeMs, endTime: TimeMs): TimelineMarker[] {
    return this.state.markerTrack.markers.filter((m) => m.time >= startTime && m.time <= endTime);
  }

  /**
   * Get next marker from current time
   */
  getNextMarker(): TimelineMarker | null {
    const sorted = [...this.state.markerTrack.markers].sort((a, b) => a.time - b.time);
    return sorted.find((m) => m.time > this.state.currentTime) || null;
  }

  /**
   * Get previous marker from current time
   */
  getPreviousMarker(): TimelineMarker | null {
    const sorted = [...this.state.markerTrack.markers].sort((a, b) => b.time - a.time);
    return sorted.find((m) => m.time < this.state.currentTime) || null;
  }

  /**
   * Jump to next marker
   */
  jumpToNextMarker(): void {
    const next = this.getNextMarker();
    if (next) {
      this.seek(next.time);
    }
  }

  /**
   * Jump to previous marker
   */
  jumpToPreviousMarker(): void {
    const prev = this.getPreviousMarker();
    if (prev) {
      this.seek(prev.time);
    }
  }

  // ==========================================================================
  // EVENT SYSTEM
  // ==========================================================================

  /**
   * Subscribe to playback events
   */
  subscribe(listener: PlaybackListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Unsubscribe from playback events
   */
  unsubscribe(listener: PlaybackListener): void {
    this.listeners.delete(listener);
  }

  private emit(event: PlaybackEvent): void {
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (error) {
        console.error('Playback listener error:', error);
      }
    }
  }

  // ==========================================================================
  // CLEANUP
  // ==========================================================================

  /**
   * Destroy the engine and clean up resources
   */
  destroy(): void {
    this.stop();
    this.listeners.clear();
    this.mediaElements.clear();
    this.triggeredMarkers.clear();
  }
}

// =============================================================================
// FACTORY FUNCTION
// =============================================================================

/**
 * Create a new playback engine instance
 */
export function createPlaybackEngine(
  state: TimelineState,
  options?: {
    onObjectUpdate?: (objectId: string, styles: React.CSSProperties) => void;
    onCuePointAction?: (action: CuePointAction) => Promise<void>;
    onTimeUpdate?: (time: TimeMs) => void;
  },
): PlaybackEngine {
  return new PlaybackEngine(state, options);
}
