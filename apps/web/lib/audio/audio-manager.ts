'use client';

import type { Howl } from 'howler';

/**
 * Audio Manager with graceful fallback
 * - Uses Howler.js if audio files exist
 * - Falls back to Web Audio API synthesized tones
 */

export type SFXType = 'click' | 'send' | 'receive' | 'error' | 'success' | 'thinking';

interface AudioConfig {
  enabled: boolean;
  volume: number;
  useFiles: boolean;
}

class AudioManager {
  private config: AudioConfig = {
    enabled: true,
    volume: 0.5,
    useFiles: false,
  };
  private audioContext: AudioContext | null = null;
  private howls: Map<SFXType, Howl> = new Map();
  private thinkingOscillator: OscillatorNode | null = null;
  private initialized = false;

  /**
   * Initialize audio system
   * Checks if audio files exist, falls back to Web Audio if not
   */
  async init(): Promise<void> {
    if (this.initialized || typeof window === 'undefined') return;

    // Check if audio files exist
    const testFile = '/audio/sfx/ui-click.mp3';
    try {
      const response = await fetch(testFile, { method: 'HEAD' });
      this.config.useFiles = response.ok;
    } catch {
      this.config.useFiles = false;
    }

    if (this.config.useFiles) {
      await this.initHowler();
    } else {
      this.initWebAudio();
    }

    this.initialized = true;
  }

  private async initHowler(): Promise<void> {
    const { Howl } = await import('howler');

    const sounds: Record<SFXType, { src: string[]; volume: number; loop?: boolean }> = {
      click: { src: ['/audio/sfx/ui-click.mp3'], volume: 0.3 },
      send: { src: ['/audio/sfx/ui-send.mp3'], volume: 0.4 },
      receive: { src: ['/audio/sfx/ui-receive.mp3'], volume: 0.35 },
      error: { src: ['/audio/sfx/ui-error.mp3'], volume: 0.5 },
      success: { src: ['/audio/sfx/ui-success.mp3'], volume: 0.4 },
      thinking: { src: ['/audio/sfx/ai-thinking.mp3'], volume: 0.2, loop: true },
    };

    for (const [key, soundConfig] of Object.entries(sounds)) {
      this.howls.set(
        key as SFXType,
        new Howl({
          src: soundConfig.src,
          volume: soundConfig.volume * this.config.volume,
          loop: soundConfig.loop || false,
          preload: true,
        }),
      );
    }
  }

  private initWebAudio(): void {
    this.audioContext = new AudioContext();
  }

  private getAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    return this.audioContext;
  }

  /**
   * Play a sound effect
   */
  play(type: SFXType): void {
    if (!this.config.enabled) return;
    if (!this.initialized) {
      this.init();
    }

    if (this.config.useFiles) {
      const howl = this.howls.get(type);
      howl?.play();
    } else {
      this.playWebAudioTone(type);
    }
  }

  /**
   * Stop a sound (mainly for looping sounds like 'thinking')
   */
  stop(type: SFXType): void {
    if (this.config.useFiles) {
      const howl = this.howls.get(type);
      howl?.stop();
    } else if (type === 'thinking' && this.thinkingOscillator) {
      this.thinkingOscillator.stop();
      this.thinkingOscillator = null;
    }
  }

  /**
   * Synthesize tones using Web Audio API
   */
  private playWebAudioTone(type: SFXType): void {
    const ctx = this.getAudioContext();
    const now = ctx.currentTime;

    switch (type) {
      case 'click': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain).connect(ctx.destination);
        osc.frequency.setValueAtTime(1000, now);
        gain.gain.setValueAtTime(this.config.volume * 0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
        break;
      }

      case 'send': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain).connect(ctx.destination);
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
        gain.gain.setValueAtTime(this.config.volume * 0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
        break;
      }

      case 'receive': {
        // Two-tone chime
        [800, 1000].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain).connect(ctx.destination);
          osc.frequency.setValueAtTime(freq, now + i * 0.1);
          gain.gain.setValueAtTime(this.config.volume * 0.3, now + i * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.15);
          osc.start(now + i * 0.1);
          osc.stop(now + i * 0.1 + 0.15);
        });
        break;
      }

      case 'error': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain).connect(ctx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.2);
        gain.gain.setValueAtTime(this.config.volume * 0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
        break;
      }

      case 'success': {
        // Ascending arpeggio
        [523, 659, 784].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain).connect(ctx.destination);
          osc.frequency.setValueAtTime(freq, now + i * 0.08);
          gain.gain.setValueAtTime(this.config.volume * 0.3, now + i * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.2);
          osc.start(now + i * 0.08);
          osc.stop(now + i * 0.08 + 0.2);
        });
        break;
      }

      case 'thinking': {
        // Looping subtle hum
        if (this.thinkingOscillator) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();

        lfo.frequency.setValueAtTime(2, now);
        lfoGain.gain.setValueAtTime(20, now);
        lfo.connect(lfoGain).connect(osc.frequency);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, now);
        gain.gain.setValueAtTime(this.config.volume * 0.1, now);

        osc.connect(gain).connect(ctx.destination);
        lfo.start(now);
        osc.start(now);

        this.thinkingOscillator = osc;
        break;
      }
    }
  }

  /**
   * Play TTS audio from URL
   */
  async playTTS(audioUrl: string, onEnd?: () => void): Promise<void> {
    if (this.config.useFiles) {
      const { Howl } = await import('howler');
      const tts = new Howl({
        src: [audioUrl],
        format: ['mp3'],
        volume: this.config.volume,
        onend: onEnd,
      });
      tts.play();
    } else {
      // Fallback: use HTML5 Audio
      const audio = new Audio(audioUrl);
      audio.volume = this.config.volume;
      audio.onended = () => onEnd?.();
      audio.play();
    }
  }

  setVolume(volume: number): void {
    this.config.volume = Math.max(0, Math.min(1, volume));
  }

  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    if (!enabled) {
      this.stop('thinking');
    }
  }

  isEnabled(): boolean {
    return this.config.enabled;
  }
}

// Singleton
export const audioManager = new AudioManager();

// React hook
export function useAudio() {
  return {
    init: () => audioManager.init(),
    play: (type: SFXType) => audioManager.play(type),
    stop: (type: SFXType) => audioManager.stop(type),
    playTTS: (url: string, onEnd?: () => void) => audioManager.playTTS(url, onEnd),
    setVolume: (v: number) => audioManager.setVolume(v),
    setEnabled: (e: boolean) => audioManager.setEnabled(e),
    isEnabled: () => audioManager.isEnabled(),
  };
}
