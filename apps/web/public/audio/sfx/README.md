# Sound Effects Directory

This directory contains sound effect files for the LXD360 INSPIRE Ignite learning experience.

## Required Files

The following sound effects should be placed in this directory:

| Filename | Purpose | Format |
|----------|---------|--------|
| `success.mp3` | Played when learner completes a lesson or achievement | MP3, <100KB |
| `level-up.mp3` | Played when learner gains a level | MP3, <150KB |
| `streak.mp3` | Played when learner maintains/extends streak | MP3, <100KB |
| `notification.mp3` | Generic notification sound | MP3, <50KB |
| `error.mp3` | Played on validation errors | MP3, <50KB |

## Guidelines

- All audio files should be optimized for web (compressed, appropriate bitrate)
- Maximum file size: 150KB per file
- Format: MP3 (broad browser support)
- Duration: 0.5-2 seconds for feedback sounds
- Volume: Normalized to prevent jarring differences

## Usage

Sound effects are loaded by the `useSoundEffects` hook:

```typescript
import { useSoundEffects } from '@/hooks/useSoundEffects';

const { playSuccess, playLevelUp } = useSoundEffects();

// Play on achievement
playSuccess();
```

## Accessibility

- All sounds must respect user's `prefers-reduced-motion` setting
- Sounds should be optional and controlled via user preferences
- Visual feedback must accompany all audio feedback
