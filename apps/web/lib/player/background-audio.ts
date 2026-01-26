'use client';

/**
 * Background Audio Service for Podcast Mode
 *
 * Manages audio playback that persists across navigation including:
 * - PWA Media Session API integration (lock screen controls)
 * - Background playback state management
 * - Event dispatching for UI synchronization
 */

export interface MediaMetadataInfo {
  title: string;
  artist?: string;
  album?: string;
  artwork?: Array<{
    src: string;
    sizes: string;
    type: string;
  }>;
}

export interface BackgroundAudioState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  buffered: number;
  volume: number;
  playbackRate: number;
  src: string | null;
  metadata: MediaMetadataInfo | null;
}

type AudioEventType =
  | 'play'
  | 'pause'
  | 'timeupdate'
  | 'ended'
  | 'loadedmetadata'
  | 'error'
  | 'volumechange'
  | 'ratechange';

type AudioEventCallback = (state: BackgroundAudioState) => void;

class BackgroundAudioService {
  private audio: HTMLAudioElement | null = null;
  private metadata: MediaMetadataInfo | null = null;
  private listeners: Map<AudioEventType, Set<AudioEventCallback>> = new Map();
  private initialized = false;

  /**
   * Initialize the audio element (lazy initialization)
   */
  private initAudio(): HTMLAudioElement {
    if (this.audio) return this.audio;

    if (typeof window === 'undefined') {
      throw new Error('BackgroundAudioService can only be used in browser environment');
    }

    this.audio = new Audio();
    this.audio.preload = 'metadata';

    // Attach event listeners
    this.audio.addEventListener('play', () => this.emit('play'));
    this.audio.addEventListener('pause', () => this.emit('pause'));
    this.audio.addEventListener('timeupdate', () => this.emit('timeupdate'));
    this.audio.addEventListener('ended', () => this.emit('ended'));
    this.audio.addEventListener('loadedmetadata', () => this.emit('loadedmetadata'));
    this.audio.addEventListener('error', () => this.emit('error'));
    this.audio.addEventListener('volumechange', () => this.emit('volumechange'));
    this.audio.addEventListener('ratechange', () => this.emit('ratechange'));

    this.initialized = true;
    return this.audio;
  }

  /**
   * Get current audio state
   */
  getState(): BackgroundAudioState {
    const audio = this.audio;

    if (!audio) {
      return {
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        buffered: 0,
        volume: 1,
        playbackRate: 1,
        src: null,
        metadata: null,
      };
    }

    // Calculate buffered amount
    let buffered = 0;
    if (audio.buffered.length > 0) {
      buffered = audio.buffered.end(audio.buffered.length - 1);
    }

    return {
      isPlaying: !audio.paused && !audio.ended,
      currentTime: audio.currentTime,
      duration: audio.duration || 0,
      buffered,
      volume: audio.volume,
      playbackRate: audio.playbackRate,
      src: audio.src || null,
      metadata: this.metadata,
    };
  }

  /**
   * Load audio source
   */
  load(src: string, metadata?: MediaMetadataInfo): void {
    const audio = this.initAudio();
    audio.src = src;
    audio.load();

    if (metadata) {
      this.setMetadata(metadata);
    }
  }

  /**
   * Play audio
   */
  async play(): Promise<void> {
    const audio = this.initAudio();

    try {
      await audio.play();
      this.updateMediaSession();
    } catch (error) {
      console.error('[BackgroundAudio] Play failed:', error);
      throw error;
    }
  }

  /**
   * Pause audio
   */
  pause(): void {
    if (this.audio) {
      this.audio.pause();
    }
  }

  /**
   * Toggle play/pause
   */
  async togglePlayPause(): Promise<void> {
    if (!this.audio || this.audio.paused) {
      await this.play();
    } else {
      this.pause();
    }
  }

  /**
   * Seek to position (in seconds)
   */
  seek(time: number): void {
    if (this.audio) {
      this.audio.currentTime = Math.max(0, Math.min(time, this.audio.duration || 0));
    }
  }

  /**
   * Seek relative to current position
   */
  seekRelative(delta: number): void {
    if (this.audio) {
      this.seek(this.audio.currentTime + delta);
    }
  }

  /**
   * Set volume (0-1)
   */
  setVolume(volume: number): void {
    if (this.audio) {
      this.audio.volume = Math.max(0, Math.min(1, volume));
    }
  }

  /**
   * Set playback rate
   */
  setPlaybackRate(rate: number): void {
    if (this.audio) {
      this.audio.playbackRate = Math.max(0.5, Math.min(2, rate));
    }
  }

  /**
   * Set media metadata for lock screen controls
   */
  setMetadata(metadata: MediaMetadataInfo): void {
    this.metadata = metadata;
    this.updateMediaSession();
  }

  /**
   * Update PWA Media Session API
   */
  private updateMediaSession(): void {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) {
      return;
    }

    if (this.metadata) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: this.metadata.title,
        artist: this.metadata.artist || 'LXD360',
        album: this.metadata.album || '',
        artwork: this.metadata.artwork || [],
      });
    }

    // Set action handlers
    navigator.mediaSession.setActionHandler('play', () => {
      this.play().catch(console.error);
    });

    navigator.mediaSession.setActionHandler('pause', () => {
      this.pause();
    });

    navigator.mediaSession.setActionHandler('seekbackward', (details) => {
      const skipTime = details.seekOffset || 10;
      this.seekRelative(-skipTime);
    });

    navigator.mediaSession.setActionHandler('seekforward', (details) => {
      const skipTime = details.seekOffset || 10;
      this.seekRelative(skipTime);
    });

    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (details.seekTime !== undefined) {
        this.seek(details.seekTime);
      }
    });

    navigator.mediaSession.setActionHandler('stop', () => {
      this.pause();
      this.seek(0);
    });

    // Update position state periodically
    if (this.audio) {
      this.updatePositionState();
    }
  }

  /**
   * Update Media Session position state
   */
  private updatePositionState(): void {
    if (
      typeof navigator === 'undefined' ||
      !('mediaSession' in navigator) ||
      !this.audio ||
      !this.audio.duration
    ) {
      return;
    }

    try {
      navigator.mediaSession.setPositionState({
        duration: this.audio.duration,
        playbackRate: this.audio.playbackRate,
        position: this.audio.currentTime,
      });
    } catch {
      // Position state update failed, not critical
    }
  }

  /**
   * Subscribe to audio events
   */
  on(event: AudioEventType, callback: AudioEventCallback): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    this.listeners.get(event)?.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  /**
   * Emit event to all listeners
   */
  private emit(event: AudioEventType): void {
    const state = this.getState();
    const callbacks = this.listeners.get(event);

    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(state);
        } catch (error) {
          console.error(`[BackgroundAudio] Event callback error for ${event}:`, error);
        }
      });
    }

    // Update position state on timeupdate
    if (event === 'timeupdate') {
      this.updatePositionState();
    }
  }

  /**
   * Stop and clean up
   */
  stop(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.audio.src = '';
    }
    this.metadata = null;
  }

  /**
   * Destroy the service
   */
  destroy(): void {
    this.stop();
    this.listeners.clear();
    this.audio = null;
    this.initialized = false;
  }

  /**
   * Check if audio is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }
}

// Singleton instance
export const backgroundAudio = new BackgroundAudioService();

// Export types for use in hooks
export type { AudioEventType, AudioEventCallback };
