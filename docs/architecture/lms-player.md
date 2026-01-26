# INSPIRE Ignite LMS Player Architecture

**Version:** 1.0
**Last Updated:** January 26, 2026
**Status:** Foundation Complete
**Author:** Claude Code (VS Code Instance)

---

## Overview

The INSPIRE Ignite LMS Player is a headless, multi-modal content delivery system designed to address four critical gaps in the LMS market:

| Gap | Problem | Solution |
|-----|---------|----------|
| **Podcast Mode** | Video requires screen-on | Audio extraction + background playback |
| **Offline Sync** | SCORM data loss on reconnect | Server-side parse → JSON → local queue → conflict resolution |
| **Social Learning** | Ghost town forums | Bi-directional Slack/Teams (Phase 2) |
| **Login Friction** | SSO redirect loops | Magic links + deep linking |

---

## Core Concepts

### Content Atoms

Content is NOT organized as "courses" — it's **atomic units** that can be assembled into playlists. This enables:

- JIT (Just-In-Time) content delivery
- Personalized learning paths via AI
- Multi-modality consumption (video, audio, text)
- Granular progress tracking

**Location:** [types/content/atom.ts](../../apps/web/types/content/atom.ts)

```typescript
interface ContentAtom {
  id: string;
  tenant_id: string;
  title: string;
  type: AtomType;
  duration_seconds: number;
  modalities: AtomModalities;
  learning_metadata: AtomLearningMetadata;
  xapi_activity_id: string;
  // ...
}
```

### Multi-Modality Support

Each atom can have multiple consumption modalities:

```typescript
interface AtomModalities {
  video_url?: string;      // Primary video (MP4, HLS)
  audio_url?: string;      // Extracted audio (Podcast Mode)
  transcript_url?: string; // VTT/SRT captions
  transcript_text?: string; // Plain text for search/RAG
  document_url?: string;   // PDF/slides
}
```

---

## Deep xAPI Profile

Standard xAPI lacks granularity for modern learning analytics. The Deep xAPI Profile adds:

**Location:** [types/xapi/deep-profile.ts](../../apps/web/types/xapi/deep-profile.ts)

### Hesitation Tracking (False Confidence Detection)

Tracks answer changes and timing to detect guessing vs. true mastery:

```typescript
interface HesitationData {
  answer_changes: number;
  time_to_first_answer_ms: number;
  time_to_final_answer_ms: number;
  confidence_indicator: 'mastery' | 'confident' | 'uncertain' | 'guessing';
}
```

**Confidence Algorithm:**

```typescript
function calculateConfidence(answerChanges, timeToAnswer, expectedTime) {
  const speedRatio = timeToAnswer / expectedTime;

  if (answerChanges === 0 && speedRatio < 0.5) return 'mastery';
  if (answerChanges <= 1 && speedRatio < 1.0) return 'confident';
  if (answerChanges <= 2 && speedRatio < 2.0) return 'uncertain';
  return 'guessing';
}
```

### Engagement Tracking

Detects skimming vs. deep engagement:

```typescript
interface EngagementData {
  scroll_velocity: number;
  focus_score: number;          // 0-100
  interaction_pattern: 'deep' | 'skimming' | 'clicking-through';
  mouse_idle_time_ms: number;
  tab_switches: number;
  window_blur_time_ms: number;
}
```

### Modality Tracking

Tracks how content is consumed (Podcast Mode support):

```typescript
interface ModalityData {
  consumption_mode: 'video' | 'audio' | 'text' | 'interactive';
  playback_speed: number;
  background_mode: boolean;
  screen_locked: boolean;
}
```

---

## Player State Machine

The player uses a finite state machine to prevent impossible states.

**Location:** [lib/player/machine.ts](../../apps/web/lib/player/machine.ts)

### State Diagram

```
┌─────────┐
│  idle   │
└────┬────┘
     │ LOAD
┌────▼────┐
│ loading │
└────┬────┘
     │ LOADED
┌────▼────┐
│  ready  │◄─────────────────┐
└────┬────┘                  │
     │ PLAY                  │
┌────▼────┐                  │
│ playing │◄──┐              │
└────┬────┘   │              │
     │        │ PLAY         │
┌────▼────┐   │              │
│ paused  ├───┘              │
└────┬────┘                  │
     │ ENDED                 │
┌────▼─────┐                 │
│completed │─────────────────┘
└──────────┘    SEEK/PLAY
```

### Valid Transitions

```typescript
const validTransitions = {
  idle: ['loading'],
  loading: ['ready', 'error'],
  ready: ['playing', 'seeking', 'error'],
  playing: ['paused', 'buffering', 'seeking', 'completed', 'error'],
  paused: ['playing', 'seeking', 'completed', 'error'],
  buffering: ['playing', 'paused', 'error'],
  seeking: ['playing', 'paused', 'buffering', 'ready', 'error'],
  completed: ['playing', 'seeking', 'idle'],
  error: ['loading', 'idle'],
};
```

### Usage

```typescript
import { createPlayerStore } from '@/lib/player';

// Create a player instance
const usePlayer = createPlayerStore({
  completionThreshold: 80,
  onComplete: (progress) => saveProgress(progress),
  onStatementQueued: (statement) => console.log('xAPI queued', statement),
});

// In component
const { state, play, pause, seek, switchMode } = usePlayer();

// Play content
play();

// Switch to Podcast Mode
switchMode('audio');
enterBackground();
```

---

## Firestore Schema

### Collection Structure

```
organizations/{tenantId}/
├── atoms/{atomId}                    # Content atoms
├── playlists/{playlistId}           # Assembled atom sequences
└── users/{userId}/
    ├── atom_progress/{atomId}       # Per-atom progress
    ├── playlist_progress/{playlistId}  # Per-playlist progress
    └── offline_queue/{itemId}       # Pending sync items
```

**Path Helpers:** [lib/firebase/collections.ts](../../apps/web/lib/firebase/collections.ts)

```typescript
import { COLLECTION_PATHS } from '@/lib/firebase/collections';

// Get atoms for tenant
const atomsPath = COLLECTION_PATHS.atoms('tenant-123');
// → "organizations/tenant-123/atoms"

// Get user progress
const progressPath = COLLECTION_PATHS.atomProgress('tenant-123', 'user-456');
// → "organizations/tenant-123/users/user-456/atom_progress"
```

### Security Rules

**Location:** [firestore.rules](../../firestore.rules)

| Collection | Read | Write | Delete |
|------------|------|-------|--------|
| atoms | Org members | Authors | Instructors |
| playlists | Org members | Authors | Instructors |
| atom_progress | Owner + Instructors | Owner | Org Admins |
| playlist_progress | Owner + Instructors | Owner | Org Admins |
| offline_queue | Owner only | Owner | Owner |

---

## Integration Points

### Existing Systems

| System | Integration | Status |
|--------|-------------|--------|
| BKT (Bayesian Knowledge Tracing) | `mastery_probability` in AtomProgress | Ready |
| SM-2 (Spaced Repetition) | `easiness_factor`, `next_review_at` | Ready |
| Existing Video Player | Wrap with player state machine | Planned |
| xAPI Provider | Queue statements through machine | Ready |

### Worker Task Distribution

| Worker | Task | Interface Dependency |
|--------|------|---------------------|
| Worker 1 | Player UI Component | `PlayerStore` types |
| Worker 2 | Podcast Mode Toggle | `AtomModalities`, `switchMode()` |
| Worker 3 | Progress Bar + Resume | `AtomProgress`, `seek()` |
| Worker 4 | xAPI Statement Emitter | `DeepXAPIStatement`, `queueStatement()` |
| Worker 5 | Offline Queue Service | `pendingStatements`, `syncStatements()` |

---

## File Manifest

| File | Purpose | Lines |
|------|---------|-------|
| `types/content/atom.ts` | Content Atom + Progress types | ~380 |
| `types/xapi/deep-profile.ts` | Deep xAPI extensions | ~450 |
| `lib/player/machine.ts` | Zustand state machine | ~600 |
| `lib/player/index.ts` | Module exports | ~25 |
| `lib/firebase/collections.ts` | Collection paths (updated) | +70 |
| `firestore.rules` | Security rules (updated) | +85 |

---

## Next Steps

### Phase 1: Foundation (Complete)
- [x] Content Atom types
- [x] Deep xAPI Profile types
- [x] Player state machine
- [x] Firestore schema + rules

### Phase 2: UI Components (Browser Claude Code Workers)
- [ ] Player UI component (video/audio/text modes)
- [ ] Podcast Mode toggle
- [ ] Progress bar with resume
- [ ] Modality switcher

### Phase 3: xAPI Integration
- [ ] Statement emitter service
- [ ] Offline queue sync
- [ ] BKT/SM-2 integration hooks

### Phase 4: Advanced Features
- [ ] Bi-directional Slack/Teams integration
- [ ] Magic link authentication
- [ ] Deep linking support

---

## Validation Checklist

| Check | Command | Expected |
|-------|---------|----------|
| TypeScript | `pnpm typecheck` | 0 errors |
| Lint | `pnpm lint` | 0 errors |
| Build | `pnpm build` | Success |

---

## References

- [xAPI 1.0.3 Specification](https://github.com/adlnet/xAPI-Spec)
- [ICAP Framework](https://www.sciencedirect.com/science/article/pii/S0959475214000590)
- [Bayesian Knowledge Tracing](https://www.cs.cmu.edu/~ggordon/yudelson-koedinger-gordon-individualized-bayesian-knowledge-tracing.pdf)
- [SM-2 Algorithm](https://www.supermemo.com/en/archives1990-2015/english/ol/sm2)
