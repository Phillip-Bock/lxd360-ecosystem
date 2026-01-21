/**
 * INSPIRE Studio - Timeline & Animation Types
 * Full timeline system with keyframe animations, media sync, cue points, and playback engine
 */

// =============================================================================
// TIME & DURATION
// =============================================================================

/** Time in milliseconds */
export type TimeMs = number;

/** Frames per second for timeline */
export type FrameRate = 24 | 30 | 60;

export interface TimeRange {
  start: TimeMs;
  end: TimeMs;
}

export interface TimelineConfig {
  duration: TimeMs;
  frameRate: FrameRate;
  snapToGrid: boolean;
  gridSize: TimeMs; // Snap increment (e.g., 100ms)
  zoom: number; // 1 = 100%, 0.5 = zoomed out, 2 = zoomed in
  scrollPosition: TimeMs;
}

// =============================================================================
// KEYFRAMES
// =============================================================================

/** Keyframe value can be number or string (for colors) */
export type KeyframeValue = number | string;

export interface Keyframe<T = KeyframeValue> {
  id: string;
  time: TimeMs;
  value: T;
  easing: EasingFunction;
  handles?: BezierHandles; // For custom cubic-bezier
}

export interface BezierHandles {
  in: { x: number; y: number };
  out: { x: number; y: number };
}

export type EasingFunction =
  | 'linear'
  | 'ease'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out'
  | 'ease-in-quad'
  | 'ease-out-quad'
  | 'ease-in-out-quad'
  | 'ease-in-cubic'
  | 'ease-out-cubic'
  | 'ease-in-out-cubic'
  | 'ease-in-quart'
  | 'ease-out-quart'
  | 'ease-in-out-quart'
  | 'ease-in-quint'
  | 'ease-out-quint'
  | 'ease-in-out-quint'
  | 'ease-in-expo'
  | 'ease-out-expo'
  | 'ease-in-out-expo'
  | 'ease-in-circ'
  | 'ease-out-circ'
  | 'ease-in-out-circ'
  | 'ease-in-back'
  | 'ease-out-back'
  | 'ease-in-out-back'
  | 'ease-in-elastic'
  | 'ease-out-elastic'
  | 'ease-in-out-elastic'
  | 'ease-out-bounce'
  | 'spring'
  | { type: 'cubic-bezier'; values: [number, number, number, number] }
  | { type: 'spring'; stiffness: number; damping: number; mass: number };

// =============================================================================
// ANIMATABLE PROPERTIES
// =============================================================================

/** Properties that can be keyframed */
export interface AnimatableProperties {
  // Transform
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  skewX: number;
  skewY: number;
  anchorX: number;
  anchorY: number;

  // Appearance
  opacity: number;
  blur: number;
  brightness: number;
  contrast: number;
  saturate: number;
  hueRotate: number;

  // Colors (interpolated as RGB)
  backgroundColor: string;
  borderColor: string;
  color: string;

  // Borders
  borderWidth: number;
  borderRadius: number;

  // Shadows
  shadowOffsetX: number;
  shadowOffsetY: number;
  shadowBlur: number;
  shadowSpread: number;
  shadowColor: string;

  // Typography
  fontSize: number;
  letterSpacing: number;
  lineHeight: number;

  // Clip/Mask
  clipTop: number;
  clipRight: number;
  clipBottom: number;
  clipLeft: number;

  // 3D (for future use)
  rotateX: number;
  rotateY: number;
  perspective: number;
  translateZ: number;
}

export type AnimatableProperty = keyof AnimatableProperties;

// =============================================================================
// TRACKS
// =============================================================================

export interface PropertyTrack<T = KeyframeValue> {
  id: string;
  property: AnimatableProperty;
  keyframes: Keyframe<T>[];
  enabled: boolean;
  locked: boolean;
}

export interface ObjectTrack {
  id: string;
  objectId: string;
  objectName: string;
  objectType: string;
  expanded: boolean;
  visible: boolean;
  locked: boolean;
  startTime: TimeMs;
  endTime: TimeMs;
  propertyTracks: PropertyTrack[];
}

export interface MediaTrack {
  id: string;
  type: 'audio' | 'video';
  objectId: string;
  name: string;
  src: string;
  duration: TimeMs;
  startTime: TimeMs; // When media starts playing in timeline
  trimStart: TimeMs; // Trim from beginning of media file
  trimEnd: TimeMs; // Trim from end of media file
  volume: number;
  playbackRate: number;
  loop: boolean;
  waveformData?: Float32Array; // For audio visualization
}

export interface MarkerTrack {
  id: string;
  markers: TimelineMarker[];
}

// =============================================================================
// MARKERS & CUE POINTS
// =============================================================================

export interface TimelineMarker {
  id: string;
  time: TimeMs;
  type: 'marker' | 'cue-point' | 'chapter' | 'sync-point';
  label: string;
  color: string;
  actions?: CuePointAction[];
}

export interface CuePointAction {
  id: string;
  type: CuePointActionType;
  config: CuePointActionConfig;
  delay?: TimeMs;
}

export type CuePointActionType =
  | 'go-to-state'
  | 'go-to-slide'
  | 'go-to-time'
  | 'play-media'
  | 'pause-media'
  | 'stop-media'
  | 'show-object'
  | 'hide-object'
  | 'enable-object'
  | 'disable-object'
  | 'emit-xapi'
  | 'trigger-animation'
  | 'pause-timeline'
  | 'execute-javascript'
  | 'open-url'
  | 'open-lightbox';

export interface CuePointActionConfig {
  // Target
  targetObjectId?: string;
  targetSlideId?: string;
  targetStateId?: string;
  targetTime?: TimeMs;

  // Media
  mediaAction?: 'play' | 'pause' | 'stop' | 'seek';
  seekTime?: TimeMs;

  // xAPI
  xapiVerb?: string;
  xapiObject?: object;
  xapiResult?: object;

  // URL
  url?: string;
  urlTarget?: '_self' | '_blank' | '_lightbox';

  // JavaScript (advanced)
  script?: string;
}

// =============================================================================
// TIMELINE STATE
// =============================================================================

export interface TimelineState {
  config: TimelineConfig;
  objectTracks: ObjectTrack[];
  mediaTracks: MediaTrack[];
  markerTrack: MarkerTrack;

  // Playback state
  isPlaying: boolean;
  isPaused: boolean;
  currentTime: TimeMs;
  playbackRate: number;

  // Selection state
  selectedTrackIds: string[];
  selectedKeyframeIds: string[];
  selectedMarkerIds: string[];

  // Edit state
  isDragging: boolean;
  dragType: 'keyframe' | 'track' | 'trim' | 'scrub' | null;
  copyBuffer: Keyframe[] | null;
}

// =============================================================================
// TIMELINE ACTIONS
// =============================================================================

export type TimelineAction =
  // Playback
  | { type: 'PLAY' }
  | { type: 'PAUSE' }
  | { type: 'STOP' }
  | { type: 'SEEK'; time: TimeMs }
  | { type: 'SET_PLAYBACK_RATE'; rate: number }
  | { type: 'SET_CURRENT_TIME'; time: TimeMs }

  // Keyframes
  | {
      type: 'ADD_KEYFRAME';
      trackId: string;
      propertyTrackId: string;
      keyframe: Omit<Keyframe, 'id'>;
    }
  | { type: 'UPDATE_KEYFRAME'; keyframeId: string; updates: Partial<Keyframe> }
  | { type: 'DELETE_KEYFRAME'; keyframeId: string }
  | { type: 'MOVE_KEYFRAME'; keyframeId: string; newTime: TimeMs }
  | { type: 'COPY_KEYFRAMES'; keyframeIds: string[] }
  | { type: 'PASTE_KEYFRAMES'; trackId: string; propertyTrackId: string; time: TimeMs }

  // Tracks
  | { type: 'ADD_OBJECT_TRACK'; objectId: string; objectName: string; objectType: string }
  | { type: 'REMOVE_OBJECT_TRACK'; trackId: string }
  | { type: 'TOGGLE_TRACK_VISIBILITY'; trackId: string }
  | { type: 'TOGGLE_TRACK_LOCK'; trackId: string }
  | { type: 'EXPAND_TRACK'; trackId: string }
  | { type: 'COLLAPSE_TRACK'; trackId: string }
  | { type: 'REORDER_TRACKS'; fromIndex: number; toIndex: number }
  | { type: 'SET_TRACK_TIME_RANGE'; trackId: string; startTime: TimeMs; endTime: TimeMs }

  // Property tracks
  | { type: 'ADD_PROPERTY_TRACK'; objectTrackId: string; property: AnimatableProperty }
  | { type: 'REMOVE_PROPERTY_TRACK'; propertyTrackId: string }
  | { type: 'TOGGLE_PROPERTY_TRACK'; propertyTrackId: string }

  // Media tracks
  | { type: 'ADD_MEDIA_TRACK'; media: Omit<MediaTrack, 'id'> }
  | { type: 'UPDATE_MEDIA_TRACK'; trackId: string; updates: Partial<MediaTrack> }
  | { type: 'REMOVE_MEDIA_TRACK'; trackId: string }
  | { type: 'TRIM_MEDIA'; trackId: string; trimStart: TimeMs; trimEnd: TimeMs }

  // Markers
  | { type: 'ADD_MARKER'; marker: Omit<TimelineMarker, 'id'> }
  | { type: 'UPDATE_MARKER'; markerId: string; updates: Partial<TimelineMarker> }
  | { type: 'DELETE_MARKER'; markerId: string }
  | { type: 'ADD_CUE_ACTION'; markerId: string; action: Omit<CuePointAction, 'id'> }
  | { type: 'REMOVE_CUE_ACTION'; markerId: string; actionId: string }

  // Selection
  | { type: 'SELECT_KEYFRAMES'; keyframeIds: string[]; addToSelection?: boolean }
  | { type: 'SELECT_TRACK'; trackId: string }
  | { type: 'SELECT_MARKER'; markerId: string }
  | { type: 'CLEAR_SELECTION' }

  // Config
  | { type: 'SET_DURATION'; duration: TimeMs }
  | { type: 'SET_ZOOM'; zoom: number }
  | { type: 'SET_SCROLL'; position: TimeMs }
  | { type: 'TOGGLE_SNAP' }
  | { type: 'SET_GRID_SIZE'; size: TimeMs }

  // Drag state
  | { type: 'START_DRAG'; dragType: TimelineState['dragType'] }
  | { type: 'END_DRAG' };

// =============================================================================
// PLAYBACK EVENTS
// =============================================================================

export type PlaybackEventType =
  | 'play'
  | 'pause'
  | 'stop'
  | 'seek'
  | 'timeupdate'
  | 'ended'
  | 'cuepoint'
  | 'marker';

export interface PlaybackEvent {
  type: PlaybackEventType;
  time: TimeMs;
  data?: TimelineMarker | CuePointAction;
}

export type PlaybackListener = (event: PlaybackEvent) => void;

// =============================================================================
// DEFAULTS
// =============================================================================

export const DEFAULT_TIMELINE_CONFIG: TimelineConfig = {
  duration: 10000, // 10 seconds
  frameRate: 30,
  snapToGrid: true,
  gridSize: 100, // 100ms
  zoom: 1,
  scrollPosition: 0,
};

export const DEFAULT_EASING: EasingFunction = 'ease-out';

export const EASING_OPTIONS: Array<{ value: EasingFunction; label: string; category: string }> = [
  // Linear
  { value: 'linear', label: 'Linear', category: 'Basic' },

  // Basic ease
  { value: 'ease', label: 'Ease', category: 'Basic' },
  { value: 'ease-in', label: 'Ease In', category: 'Basic' },
  { value: 'ease-out', label: 'Ease Out', category: 'Basic' },
  { value: 'ease-in-out', label: 'Ease In Out', category: 'Basic' },

  // Quad
  { value: 'ease-in-quad', label: 'Ease In Quad', category: 'Polynomial' },
  { value: 'ease-out-quad', label: 'Ease Out Quad', category: 'Polynomial' },
  { value: 'ease-in-out-quad', label: 'Ease In Out Quad', category: 'Polynomial' },

  // Cubic
  { value: 'ease-in-cubic', label: 'Ease In Cubic', category: 'Polynomial' },
  { value: 'ease-out-cubic', label: 'Ease Out Cubic', category: 'Polynomial' },
  { value: 'ease-in-out-cubic', label: 'Ease In Out Cubic', category: 'Polynomial' },

  // Quart
  { value: 'ease-in-quart', label: 'Ease In Quart', category: 'Polynomial' },
  { value: 'ease-out-quart', label: 'Ease Out Quart', category: 'Polynomial' },
  { value: 'ease-in-out-quart', label: 'Ease In Out Quart', category: 'Polynomial' },

  // Quint
  { value: 'ease-in-quint', label: 'Ease In Quint', category: 'Polynomial' },
  { value: 'ease-out-quint', label: 'Ease Out Quint', category: 'Polynomial' },
  { value: 'ease-in-out-quint', label: 'Ease In Out Quint', category: 'Polynomial' },

  // Expo
  { value: 'ease-in-expo', label: 'Ease In Expo', category: 'Exponential' },
  { value: 'ease-out-expo', label: 'Ease Out Expo', category: 'Exponential' },
  { value: 'ease-in-out-expo', label: 'Ease In Out Expo', category: 'Exponential' },

  // Circ
  { value: 'ease-in-circ', label: 'Ease In Circ', category: 'Circular' },
  { value: 'ease-out-circ', label: 'Ease Out Circ', category: 'Circular' },
  { value: 'ease-in-out-circ', label: 'Ease In Out Circ', category: 'Circular' },

  // Back (overshoot)
  { value: 'ease-in-back', label: 'Ease In Back', category: 'Overshoot' },
  { value: 'ease-out-back', label: 'Ease Out Back', category: 'Overshoot' },
  { value: 'ease-in-out-back', label: 'Ease In Out Back', category: 'Overshoot' },

  // Elastic
  { value: 'ease-in-elastic', label: 'Ease In Elastic', category: 'Elastic' },
  { value: 'ease-out-elastic', label: 'Ease Out Elastic', category: 'Elastic' },
  { value: 'ease-in-out-elastic', label: 'Ease In Out Elastic', category: 'Elastic' },

  // Bounce
  { value: 'ease-out-bounce', label: 'Ease Out Bounce', category: 'Bounce' },

  // Spring
  { value: 'spring', label: 'Spring', category: 'Physics' },
];

// =============================================================================
// UTILITY TYPES
// =============================================================================

export interface TimelineValidationError {
  field: string;
  message: string;
  trackId?: string;
  keyframeId?: string;
  markerId?: string;
}

/**
 * Validate timeline configuration
 */
export function validateTimelineConfig(state: TimelineState): TimelineValidationError[] {
  const errors: TimelineValidationError[] = [];

  if (state.config.duration <= 0) {
    errors.push({ field: 'duration', message: 'Duration must be greater than 0' });
  }

  if (state.config.zoom <= 0) {
    errors.push({ field: 'zoom', message: 'Zoom must be greater than 0' });
  }

  // Check for overlapping keyframes at same time
  for (const track of state.objectTracks) {
    for (const propTrack of track.propertyTracks) {
      const times = propTrack.keyframes.map((k) => k.time);
      const uniqueTimes = new Set(times);
      if (times.length !== uniqueTimes.size) {
        errors.push({
          field: 'keyframes',
          message: `Duplicate keyframe times in property ${propTrack.property}`,
          trackId: track.id,
        });
      }
    }
  }

  // Check markers
  for (const marker of state.markerTrack.markers) {
    if (marker.time < 0 || marker.time > state.config.duration) {
      errors.push({
        field: 'markers',
        message: `Marker "${marker.label}" is outside timeline bounds`,
        markerId: marker.id,
      });
    }
  }

  return errors;
}

/**
 * Format time in milliseconds to display string
 */
export function formatTime(timeMs: TimeMs): string {
  const totalSeconds = Math.floor(timeMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const ms = Math.floor((timeMs % 1000) / 10);

  if (minutes > 0) {
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  }
  return `${seconds}.${ms.toString().padStart(2, '0')}`;
}

/**
 * Parse time string to milliseconds
 */
export function parseTime(timeStr: string): TimeMs {
  const parts = timeStr.split(':');
  if (parts.length === 2) {
    const [minutes, rest] = parts;
    const [seconds, ms] = rest.split('.');
    return (
      Number.parseInt(minutes, 10) * 60000 +
      Number.parseInt(seconds, 10) * 1000 +
      Number.parseInt(ms || '0', 10) * 10
    );
  }
  const [seconds, ms] = timeStr.split('.');
  return Number.parseInt(seconds, 10) * 1000 + Number.parseInt(ms || '0', 10) * 10;
}
