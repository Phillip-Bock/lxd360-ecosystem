'use client';

/**
 * useTimeline - Hook for managing timeline state and playback
 * Provides state management, keyframe operations, and playback control
 */

import { useCallback, useEffect, useReducer, useRef } from 'react';
import { PlaybackEngine } from '@/lib/studio/playback-engine';
import type {
  AnimatableProperty,
  CuePointAction,
  EasingFunction,
  Keyframe,
  MediaTrack,
  ObjectTrack,
  PropertyTrack,
  TimelineAction,
  TimelineConfig,
  TimelineMarker,
  TimelineState,
  TimeMs,
} from '@/types/studio/timeline';
import {
  DEFAULT_EASING,
  DEFAULT_TIMELINE_CONFIG,
  formatTime as formatTimeUtil,
} from '@/types/studio/timeline';

// =============================================================================
// INITIAL STATE FACTORY
// =============================================================================

function createInitialState(config?: Partial<TimelineConfig>): TimelineState {
  return {
    config: {
      ...DEFAULT_TIMELINE_CONFIG,
      ...config,
    },
    objectTracks: [],
    mediaTracks: [],
    markerTrack: { id: 'markers', markers: [] },
    isPlaying: false,
    isPaused: false,
    currentTime: 0,
    playbackRate: 1,
    selectedTrackIds: [],
    selectedKeyframeIds: [],
    selectedMarkerIds: [],
    isDragging: false,
    dragType: null,
    copyBuffer: null,
  };
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function generateId(prefix: string = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// =============================================================================
// REDUCER
// =============================================================================

function timelineReducer(state: TimelineState, action: TimelineAction): TimelineState {
  switch (action.type) {
    // =========================================================================
    // PLAYBACK
    // =========================================================================
    case 'PLAY':
      return { ...state, isPlaying: true, isPaused: false };

    case 'PAUSE':
      return { ...state, isPaused: true };

    case 'STOP':
      return { ...state, isPlaying: false, isPaused: false, currentTime: 0 };

    case 'SEEK':
      return {
        ...state,
        currentTime: Math.max(0, Math.min(action.time, state.config.duration)),
      };

    case 'SET_PLAYBACK_RATE':
      return { ...state, playbackRate: Math.max(0.1, Math.min(4, action.rate)) };

    case 'SET_CURRENT_TIME':
      return {
        ...state,
        currentTime: Math.max(0, Math.min(action.time, state.config.duration)),
      };

    // =========================================================================
    // KEYFRAMES
    // =========================================================================
    case 'ADD_KEYFRAME': {
      const trackIndex = state.objectTracks.findIndex((t) => t.id === action.trackId);
      if (trackIndex === -1) return state;

      const propTrackIndex = state.objectTracks[trackIndex].propertyTracks.findIndex(
        (pt) => pt.id === action.propertyTrackId,
      );
      if (propTrackIndex === -1) return state;

      const newKeyframe: Keyframe = {
        ...action.keyframe,
        id: generateId('kf'),
      };

      const newObjectTracks = [...state.objectTracks];
      const newPropertyTracks = [...newObjectTracks[trackIndex].propertyTracks];
      newPropertyTracks[propTrackIndex] = {
        ...newPropertyTracks[propTrackIndex],
        keyframes: [...newPropertyTracks[propTrackIndex].keyframes, newKeyframe],
      };
      newObjectTracks[trackIndex] = {
        ...newObjectTracks[trackIndex],
        propertyTracks: newPropertyTracks,
      };

      return { ...state, objectTracks: newObjectTracks };
    }

    case 'UPDATE_KEYFRAME': {
      const newObjectTracks = state.objectTracks.map((track) => ({
        ...track,
        propertyTracks: track.propertyTracks.map((pt) => ({
          ...pt,
          keyframes: pt.keyframes.map((kf) =>
            kf.id === action.keyframeId ? { ...kf, ...action.updates } : kf,
          ),
        })),
      }));
      return { ...state, objectTracks: newObjectTracks };
    }

    case 'DELETE_KEYFRAME': {
      const newObjectTracks = state.objectTracks.map((track) => ({
        ...track,
        propertyTracks: track.propertyTracks.map((pt) => ({
          ...pt,
          keyframes: pt.keyframes.filter((kf) => kf.id !== action.keyframeId),
        })),
      }));
      return {
        ...state,
        objectTracks: newObjectTracks,
        selectedKeyframeIds: state.selectedKeyframeIds.filter((id) => id !== action.keyframeId),
      };
    }

    case 'MOVE_KEYFRAME': {
      const snappedTime = state.config.snapToGrid
        ? Math.round(action.newTime / state.config.gridSize) * state.config.gridSize
        : action.newTime;

      const clampedTime = Math.max(0, Math.min(snappedTime, state.config.duration));

      const newObjectTracks = state.objectTracks.map((track) => ({
        ...track,
        propertyTracks: track.propertyTracks.map((pt) => ({
          ...pt,
          keyframes: pt.keyframes.map((kf) =>
            kf.id === action.keyframeId ? { ...kf, time: clampedTime } : kf,
          ),
        })),
      }));
      return { ...state, objectTracks: newObjectTracks };
    }

    case 'COPY_KEYFRAMES': {
      const keyframesToCopy: Keyframe[] = [];
      for (const track of state.objectTracks) {
        for (const pt of track.propertyTracks) {
          for (const kf of pt.keyframes) {
            if (action.keyframeIds.includes(kf.id)) {
              keyframesToCopy.push(kf);
            }
          }
        }
      }
      return { ...state, copyBuffer: keyframesToCopy };
    }

    case 'PASTE_KEYFRAMES': {
      if (!state.copyBuffer || state.copyBuffer.length === 0) return state;

      const trackIndex = state.objectTracks.findIndex((t) => t.id === action.trackId);
      if (trackIndex === -1) return state;

      const propTrackIndex = state.objectTracks[trackIndex].propertyTracks.findIndex(
        (pt) => pt.id === action.propertyTrackId,
      );
      if (propTrackIndex === -1) return state;

      // Find the earliest keyframe time to calculate offset
      const minTime = Math.min(...state.copyBuffer.map((kf) => kf.time));
      const timeOffset = action.time - minTime;

      const newKeyframes = state.copyBuffer.map((kf) => ({
        ...kf,
        id: generateId('kf'),
        time: kf.time + timeOffset,
      }));

      const newObjectTracks = [...state.objectTracks];
      const newPropertyTracks = [...newObjectTracks[trackIndex].propertyTracks];
      newPropertyTracks[propTrackIndex] = {
        ...newPropertyTracks[propTrackIndex],
        keyframes: [...newPropertyTracks[propTrackIndex].keyframes, ...newKeyframes],
      };
      newObjectTracks[trackIndex] = {
        ...newObjectTracks[trackIndex],
        propertyTracks: newPropertyTracks,
      };

      return { ...state, objectTracks: newObjectTracks };
    }

    // =========================================================================
    // OBJECT TRACKS
    // =========================================================================
    case 'ADD_OBJECT_TRACK': {
      const newTrack: ObjectTrack = {
        id: generateId('track'),
        objectId: action.objectId,
        objectName: action.objectName,
        objectType: action.objectType,
        expanded: false,
        visible: true,
        locked: false,
        startTime: 0,
        endTime: state.config.duration,
        propertyTracks: [],
      };
      return { ...state, objectTracks: [...state.objectTracks, newTrack] };
    }

    case 'REMOVE_OBJECT_TRACK':
      return {
        ...state,
        objectTracks: state.objectTracks.filter((t) => t.id !== action.trackId),
        selectedTrackIds: state.selectedTrackIds.filter((id) => id !== action.trackId),
      };

    case 'TOGGLE_TRACK_VISIBILITY':
      return {
        ...state,
        objectTracks: state.objectTracks.map((t) =>
          t.id === action.trackId ? { ...t, visible: !t.visible } : t,
        ),
      };

    case 'TOGGLE_TRACK_LOCK':
      return {
        ...state,
        objectTracks: state.objectTracks.map((t) =>
          t.id === action.trackId ? { ...t, locked: !t.locked } : t,
        ),
      };

    case 'EXPAND_TRACK':
      return {
        ...state,
        objectTracks: state.objectTracks.map((t) =>
          t.id === action.trackId ? { ...t, expanded: true } : t,
        ),
      };

    case 'COLLAPSE_TRACK':
      return {
        ...state,
        objectTracks: state.objectTracks.map((t) =>
          t.id === action.trackId ? { ...t, expanded: false } : t,
        ),
      };

    case 'REORDER_TRACKS': {
      const tracks = [...state.objectTracks];
      const [moved] = tracks.splice(action.fromIndex, 1);
      tracks.splice(action.toIndex, 0, moved);
      return { ...state, objectTracks: tracks };
    }

    case 'SET_TRACK_TIME_RANGE':
      return {
        ...state,
        objectTracks: state.objectTracks.map((t) =>
          t.id === action.trackId
            ? { ...t, startTime: action.startTime, endTime: action.endTime }
            : t,
        ),
      };

    // =========================================================================
    // PROPERTY TRACKS
    // =========================================================================
    case 'ADD_PROPERTY_TRACK': {
      const newPropertyTrack: PropertyTrack = {
        id: generateId('prop'),
        property: action.property,
        keyframes: [],
        enabled: true,
        locked: false,
      };

      return {
        ...state,
        objectTracks: state.objectTracks.map((t) =>
          t.id === action.objectTrackId
            ? { ...t, propertyTracks: [...t.propertyTracks, newPropertyTrack] }
            : t,
        ),
      };
    }

    case 'REMOVE_PROPERTY_TRACK': {
      return {
        ...state,
        objectTracks: state.objectTracks.map((t) => ({
          ...t,
          propertyTracks: t.propertyTracks.filter((pt) => pt.id !== action.propertyTrackId),
        })),
      };
    }

    case 'TOGGLE_PROPERTY_TRACK': {
      return {
        ...state,
        objectTracks: state.objectTracks.map((t) => ({
          ...t,
          propertyTracks: t.propertyTracks.map((pt) =>
            pt.id === action.propertyTrackId ? { ...pt, enabled: !pt.enabled } : pt,
          ),
        })),
      };
    }

    // =========================================================================
    // MEDIA TRACKS
    // =========================================================================
    case 'ADD_MEDIA_TRACK': {
      const newMediaTrack: MediaTrack = {
        ...action.media,
        id: generateId('media'),
      };
      return { ...state, mediaTracks: [...state.mediaTracks, newMediaTrack] };
    }

    case 'UPDATE_MEDIA_TRACK':
      return {
        ...state,
        mediaTracks: state.mediaTracks.map((t) =>
          t.id === action.trackId ? { ...t, ...action.updates } : t,
        ),
      };

    case 'REMOVE_MEDIA_TRACK':
      return {
        ...state,
        mediaTracks: state.mediaTracks.filter((t) => t.id !== action.trackId),
      };

    case 'TRIM_MEDIA':
      return {
        ...state,
        mediaTracks: state.mediaTracks.map((t) =>
          t.id === action.trackId
            ? { ...t, trimStart: action.trimStart, trimEnd: action.trimEnd }
            : t,
        ),
      };

    // =========================================================================
    // MARKERS
    // =========================================================================
    case 'ADD_MARKER': {
      const newMarker: TimelineMarker = {
        ...action.marker,
        id: generateId('marker'),
      };
      return {
        ...state,
        markerTrack: {
          ...state.markerTrack,
          markers: [...state.markerTrack.markers, newMarker],
        },
      };
    }

    case 'UPDATE_MARKER':
      return {
        ...state,
        markerTrack: {
          ...state.markerTrack,
          markers: state.markerTrack.markers.map((m) =>
            m.id === action.markerId ? { ...m, ...action.updates } : m,
          ),
        },
      };

    case 'DELETE_MARKER':
      return {
        ...state,
        markerTrack: {
          ...state.markerTrack,
          markers: state.markerTrack.markers.filter((m) => m.id !== action.markerId),
        },
        selectedMarkerIds: state.selectedMarkerIds.filter((id) => id !== action.markerId),
      };

    case 'ADD_CUE_ACTION': {
      const newAction: CuePointAction = {
        ...action.action,
        id: generateId('cue'),
      };
      return {
        ...state,
        markerTrack: {
          ...state.markerTrack,
          markers: state.markerTrack.markers.map((m) =>
            m.id === action.markerId ? { ...m, actions: [...(m.actions || []), newAction] } : m,
          ),
        },
      };
    }

    case 'REMOVE_CUE_ACTION':
      return {
        ...state,
        markerTrack: {
          ...state.markerTrack,
          markers: state.markerTrack.markers.map((m) =>
            m.id === action.markerId
              ? { ...m, actions: (m.actions || []).filter((a) => a.id !== action.actionId) }
              : m,
          ),
        },
      };

    // =========================================================================
    // SELECTION
    // =========================================================================
    case 'SELECT_KEYFRAMES':
      return {
        ...state,
        selectedKeyframeIds: action.addToSelection
          ? [...new Set([...state.selectedKeyframeIds, ...action.keyframeIds])]
          : action.keyframeIds,
      };

    case 'SELECT_TRACK':
      return { ...state, selectedTrackIds: [action.trackId] };

    case 'SELECT_MARKER':
      return { ...state, selectedMarkerIds: [action.markerId] };

    case 'CLEAR_SELECTION':
      return {
        ...state,
        selectedTrackIds: [],
        selectedKeyframeIds: [],
        selectedMarkerIds: [],
      };

    // =========================================================================
    // CONFIG
    // =========================================================================
    case 'SET_DURATION':
      return {
        ...state,
        config: { ...state.config, duration: Math.max(1000, action.duration) },
      };

    case 'SET_ZOOM':
      return {
        ...state,
        config: { ...state.config, zoom: Math.max(0.1, Math.min(10, action.zoom)) },
      };

    case 'SET_SCROLL':
      return {
        ...state,
        config: {
          ...state.config,
          scrollPosition: Math.max(0, Math.min(action.position, state.config.duration)),
        },
      };

    case 'TOGGLE_SNAP':
      return {
        ...state,
        config: { ...state.config, snapToGrid: !state.config.snapToGrid },
      };

    case 'SET_GRID_SIZE':
      return {
        ...state,
        config: { ...state.config, gridSize: Math.max(10, action.size) },
      };

    // =========================================================================
    // DRAG STATE
    // =========================================================================
    case 'START_DRAG':
      return { ...state, isDragging: true, dragType: action.dragType };

    case 'END_DRAG':
      return { ...state, isDragging: false, dragType: null };

    default:
      return state;
  }
}

// =============================================================================
// HOOK INTERFACE
// =============================================================================

interface UseTimelineOptions {
  slideId: string;
  initialConfig?: Partial<TimelineConfig>;
  onObjectUpdate?: (objectId: string, styles: React.CSSProperties) => void;
  onCuePointAction?: (action: CuePointAction) => Promise<void>;
}

interface UseTimelineReturn {
  // State
  state: TimelineState;
  currentTime: TimeMs;
  duration: TimeMs;
  isPlaying: boolean;
  isPaused: boolean;
  playbackRate: number;

  // Playback
  play: () => void;
  pause: () => void;
  stop: () => void;
  seek: (time: TimeMs) => void;
  setPlaybackRate: (rate: number) => void;
  togglePlayPause: () => void;
  stepForward: () => void;
  stepBackward: () => void;
  jumpToStart: () => void;
  jumpToEnd: () => void;

  // Keyframes
  addKeyframe: (
    trackId: string,
    propertyTrackId: string,
    time: TimeMs,
    value: number | string,
    easing?: EasingFunction,
  ) => void;
  updateKeyframe: (keyframeId: string, updates: Partial<Keyframe>) => void;
  deleteKeyframe: (keyframeId: string) => void;
  moveKeyframe: (keyframeId: string, newTime: TimeMs) => void;
  copyKeyframes: (keyframeIds: string[]) => void;
  pasteKeyframes: (trackId: string, propertyTrackId: string, time: TimeMs) => void;

  // Tracks
  addObjectTrack: (objectId: string, objectName: string, objectType: string) => void;
  removeObjectTrack: (trackId: string) => void;
  addPropertyTrack: (objectTrackId: string, property: AnimatableProperty) => void;
  removePropertyTrack: (propertyTrackId: string) => void;
  toggleTrackVisibility: (trackId: string) => void;
  toggleTrackLock: (trackId: string) => void;
  expandTrack: (trackId: string) => void;
  collapseTrack: (trackId: string) => void;
  setTrackTimeRange: (trackId: string, startTime: TimeMs, endTime: TimeMs) => void;

  // Media
  addMediaTrack: (media: Omit<MediaTrack, 'id'>) => void;
  updateMediaTrack: (trackId: string, updates: Partial<MediaTrack>) => void;
  removeMediaTrack: (trackId: string) => void;
  trimMedia: (trackId: string, trimStart: TimeMs, trimEnd: TimeMs) => void;
  registerMediaElement: (trackId: string, element: HTMLMediaElement) => void;
  unregisterMediaElement: (trackId: string) => void;

  // Markers
  addMarker: (marker: Omit<TimelineMarker, 'id'>) => void;
  updateMarker: (markerId: string, updates: Partial<TimelineMarker>) => void;
  deleteMarker: (markerId: string) => void;
  addCueAction: (markerId: string, action: Omit<CuePointAction, 'id'>) => void;
  removeCueAction: (markerId: string, actionId: string) => void;
  jumpToNextMarker: () => void;
  jumpToPreviousMarker: () => void;

  // Selection
  selectKeyframes: (keyframeIds: string[], addToSelection?: boolean) => void;
  selectTrack: (trackId: string) => void;
  selectMarker: (markerId: string) => void;
  clearSelection: () => void;

  // Config
  setDuration: (duration: TimeMs) => void;
  setZoom: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  setScroll: (position: TimeMs) => void;
  toggleSnap: () => void;
  setGridSize: (size: TimeMs) => void;

  // Drag state
  startDrag: (dragType: TimelineState['dragType']) => void;
  endDrag: () => void;

  // Utils
  timeToPixels: (time: TimeMs) => number;
  pixelsToTime: (pixels: number) => TimeMs;
  formatTime: (time: TimeMs) => string;
  snapTime: (time: TimeMs) => TimeMs;
}

// =============================================================================
// HOOK IMPLEMENTATION
// =============================================================================

export function useTimeline(options: UseTimelineOptions): UseTimelineReturn {
  const { initialConfig, onObjectUpdate, onCuePointAction } = options;

  const [state, dispatch] = useReducer(timelineReducer, initialConfig, createInitialState);

  const engineRef = useRef<PlaybackEngine | null>(null);

  // Initialize playback engine
  useEffect(() => {
    engineRef.current = new PlaybackEngine(state, {
      onObjectUpdate,
      onCuePointAction,
      onTimeUpdate: (time) => {
        dispatch({ type: 'SET_CURRENT_TIME', time });
      },
    });

    return () => {
      engineRef.current?.destroy();
    };
  }, [onCuePointAction, onObjectUpdate, state]);

  // Sync engine state when state changes
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setState(state);
    }
  }, [state.objectTracks, state.mediaTracks, state.markerTrack, state.config, state]);

  // ==========================================================================
  // PLAYBACK CONTROLS
  // ==========================================================================

  const play = useCallback(() => {
    dispatch({ type: 'PLAY' });
    engineRef.current?.play();
  }, []);

  const pause = useCallback(() => {
    dispatch({ type: 'PAUSE' });
    engineRef.current?.pause();
  }, []);

  const stop = useCallback(() => {
    dispatch({ type: 'STOP' });
    engineRef.current?.stop();
  }, []);

  const seek = useCallback((time: TimeMs) => {
    dispatch({ type: 'SEEK', time });
    engineRef.current?.seek(time);
  }, []);

  const setPlaybackRate = useCallback((rate: number) => {
    dispatch({ type: 'SET_PLAYBACK_RATE', rate });
    engineRef.current?.setPlaybackRate(rate);
  }, []);

  const togglePlayPause = useCallback(() => {
    if (state.isPlaying && !state.isPaused) {
      pause();
    } else {
      play();
    }
  }, [state.isPlaying, state.isPaused, play, pause]);

  const stepForward = useCallback(() => {
    engineRef.current?.stepForward();
  }, []);

  const stepBackward = useCallback(() => {
    engineRef.current?.stepBackward();
  }, []);

  const jumpToStart = useCallback(() => {
    seek(0);
  }, [seek]);

  const jumpToEnd = useCallback(() => {
    seek(state.config.duration);
  }, [seek, state.config.duration]);

  // ==========================================================================
  // KEYFRAME CONTROLS
  // ==========================================================================

  const addKeyframe = useCallback(
    (
      trackId: string,
      propertyTrackId: string,
      time: TimeMs,
      value: number | string,
      easing: EasingFunction = DEFAULT_EASING,
    ) => {
      dispatch({
        type: 'ADD_KEYFRAME',
        trackId,
        propertyTrackId,
        keyframe: { time, value, easing },
      });
    },
    [],
  );

  const updateKeyframe = useCallback((keyframeId: string, updates: Partial<Keyframe>) => {
    dispatch({ type: 'UPDATE_KEYFRAME', keyframeId, updates });
  }, []);

  const deleteKeyframe = useCallback((keyframeId: string) => {
    dispatch({ type: 'DELETE_KEYFRAME', keyframeId });
  }, []);

  const moveKeyframe = useCallback((keyframeId: string, newTime: TimeMs) => {
    dispatch({ type: 'MOVE_KEYFRAME', keyframeId, newTime });
  }, []);

  const copyKeyframes = useCallback((keyframeIds: string[]) => {
    dispatch({ type: 'COPY_KEYFRAMES', keyframeIds });
  }, []);

  const pasteKeyframes = useCallback((trackId: string, propertyTrackId: string, time: TimeMs) => {
    dispatch({ type: 'PASTE_KEYFRAMES', trackId, propertyTrackId, time });
  }, []);

  // ==========================================================================
  // TRACK CONTROLS
  // ==========================================================================

  const addObjectTrack = useCallback((objectId: string, objectName: string, objectType: string) => {
    dispatch({ type: 'ADD_OBJECT_TRACK', objectId, objectName, objectType });
  }, []);

  const removeObjectTrack = useCallback((trackId: string) => {
    dispatch({ type: 'REMOVE_OBJECT_TRACK', trackId });
  }, []);

  const addPropertyTrack = useCallback((objectTrackId: string, property: AnimatableProperty) => {
    dispatch({ type: 'ADD_PROPERTY_TRACK', objectTrackId, property });
  }, []);

  const removePropertyTrack = useCallback((propertyTrackId: string) => {
    dispatch({ type: 'REMOVE_PROPERTY_TRACK', propertyTrackId });
  }, []);

  const toggleTrackVisibility = useCallback((trackId: string) => {
    dispatch({ type: 'TOGGLE_TRACK_VISIBILITY', trackId });
  }, []);

  const toggleTrackLock = useCallback((trackId: string) => {
    dispatch({ type: 'TOGGLE_TRACK_LOCK', trackId });
  }, []);

  const expandTrack = useCallback((trackId: string) => {
    dispatch({ type: 'EXPAND_TRACK', trackId });
  }, []);

  const collapseTrack = useCallback((trackId: string) => {
    dispatch({ type: 'COLLAPSE_TRACK', trackId });
  }, []);

  const setTrackTimeRange = useCallback((trackId: string, startTime: TimeMs, endTime: TimeMs) => {
    dispatch({ type: 'SET_TRACK_TIME_RANGE', trackId, startTime, endTime });
  }, []);

  // ==========================================================================
  // MEDIA CONTROLS
  // ==========================================================================

  const addMediaTrack = useCallback((media: Omit<MediaTrack, 'id'>) => {
    dispatch({ type: 'ADD_MEDIA_TRACK', media });
  }, []);

  const updateMediaTrack = useCallback((trackId: string, updates: Partial<MediaTrack>) => {
    dispatch({ type: 'UPDATE_MEDIA_TRACK', trackId, updates });
  }, []);

  const removeMediaTrack = useCallback((trackId: string) => {
    dispatch({ type: 'REMOVE_MEDIA_TRACK', trackId });
  }, []);

  const trimMedia = useCallback((trackId: string, trimStart: TimeMs, trimEnd: TimeMs) => {
    dispatch({ type: 'TRIM_MEDIA', trackId, trimStart, trimEnd });
  }, []);

  const registerMediaElement = useCallback((trackId: string, element: HTMLMediaElement) => {
    engineRef.current?.registerMediaElement(trackId, element);
  }, []);

  const unregisterMediaElement = useCallback((trackId: string) => {
    engineRef.current?.unregisterMediaElement(trackId);
  }, []);

  // ==========================================================================
  // MARKER CONTROLS
  // ==========================================================================

  const addMarker = useCallback((marker: Omit<TimelineMarker, 'id'>) => {
    dispatch({ type: 'ADD_MARKER', marker });
  }, []);

  const updateMarker = useCallback((markerId: string, updates: Partial<TimelineMarker>) => {
    dispatch({ type: 'UPDATE_MARKER', markerId, updates });
  }, []);

  const deleteMarker = useCallback((markerId: string) => {
    dispatch({ type: 'DELETE_MARKER', markerId });
  }, []);

  const addCueAction = useCallback((markerId: string, action: Omit<CuePointAction, 'id'>) => {
    dispatch({ type: 'ADD_CUE_ACTION', markerId, action });
  }, []);

  const removeCueAction = useCallback((markerId: string, actionId: string) => {
    dispatch({ type: 'REMOVE_CUE_ACTION', markerId, actionId });
  }, []);

  const jumpToNextMarker = useCallback(() => {
    engineRef.current?.jumpToNextMarker();
  }, []);

  const jumpToPreviousMarker = useCallback(() => {
    engineRef.current?.jumpToPreviousMarker();
  }, []);

  // ==========================================================================
  // SELECTION
  // ==========================================================================

  const selectKeyframes = useCallback((keyframeIds: string[], addToSelection?: boolean) => {
    dispatch({ type: 'SELECT_KEYFRAMES', keyframeIds, addToSelection });
  }, []);

  const selectTrack = useCallback((trackId: string) => {
    dispatch({ type: 'SELECT_TRACK', trackId });
  }, []);

  const selectMarker = useCallback((markerId: string) => {
    dispatch({ type: 'SELECT_MARKER', markerId });
  }, []);

  const clearSelection = useCallback(() => {
    dispatch({ type: 'CLEAR_SELECTION' });
  }, []);

  // ==========================================================================
  // CONFIG
  // ==========================================================================

  const setDuration = useCallback((duration: TimeMs) => {
    dispatch({ type: 'SET_DURATION', duration });
  }, []);

  const setZoom = useCallback((zoom: number) => {
    dispatch({ type: 'SET_ZOOM', zoom });
  }, []);

  const zoomIn = useCallback(() => {
    dispatch({ type: 'SET_ZOOM', zoom: state.config.zoom * 1.25 });
  }, [state.config.zoom]);

  const zoomOut = useCallback(() => {
    dispatch({ type: 'SET_ZOOM', zoom: state.config.zoom / 1.25 });
  }, [state.config.zoom]);

  const setScroll = useCallback((position: TimeMs) => {
    dispatch({ type: 'SET_SCROLL', position });
  }, []);

  const toggleSnap = useCallback(() => {
    dispatch({ type: 'TOGGLE_SNAP' });
  }, []);

  const setGridSize = useCallback((size: TimeMs) => {
    dispatch({ type: 'SET_GRID_SIZE', size });
  }, []);

  // ==========================================================================
  // DRAG STATE
  // ==========================================================================

  const startDrag = useCallback((dragType: TimelineState['dragType']) => {
    dispatch({ type: 'START_DRAG', dragType });
  }, []);

  const endDrag = useCallback(() => {
    dispatch({ type: 'END_DRAG' });
  }, []);

  // ==========================================================================
  // UTILITIES
  // ==========================================================================

  const PIXELS_PER_SECOND = 100; // Base scale

  const timeToPixels = useCallback(
    (time: TimeMs) => {
      return (time / 1000) * PIXELS_PER_SECOND * state.config.zoom;
    },
    [state.config.zoom],
  );

  const pixelsToTime = useCallback(
    (pixels: number) => {
      return (pixels / (PIXELS_PER_SECOND * state.config.zoom)) * 1000;
    },
    [state.config.zoom],
  );

  const formatTime = useCallback((time: TimeMs) => {
    return formatTimeUtil(time);
  }, []);

  const snapTime = useCallback(
    (time: TimeMs) => {
      if (!state.config.snapToGrid) return time;
      return Math.round(time / state.config.gridSize) * state.config.gridSize;
    },
    [state.config.snapToGrid, state.config.gridSize],
  );

  // ==========================================================================
  // RETURN
  // ==========================================================================

  return {
    // State
    state,
    currentTime: state.currentTime,
    duration: state.config.duration,
    isPlaying: state.isPlaying,
    isPaused: state.isPaused,
    playbackRate: state.playbackRate,

    // Playback
    play,
    pause,
    stop,
    seek,
    setPlaybackRate,
    togglePlayPause,
    stepForward,
    stepBackward,
    jumpToStart,
    jumpToEnd,

    // Keyframes
    addKeyframe,
    updateKeyframe,
    deleteKeyframe,
    moveKeyframe,
    copyKeyframes,
    pasteKeyframes,

    // Tracks
    addObjectTrack,
    removeObjectTrack,
    addPropertyTrack,
    removePropertyTrack,
    toggleTrackVisibility,
    toggleTrackLock,
    expandTrack,
    collapseTrack,
    setTrackTimeRange,

    // Media
    addMediaTrack,
    updateMediaTrack,
    removeMediaTrack,
    trimMedia,
    registerMediaElement,
    unregisterMediaElement,

    // Markers
    addMarker,
    updateMarker,
    deleteMarker,
    addCueAction,
    removeCueAction,
    jumpToNextMarker,
    jumpToPreviousMarker,

    // Selection
    selectKeyframes,
    selectTrack,
    selectMarker,
    clearSelection,

    // Config
    setDuration,
    setZoom,
    zoomIn,
    zoomOut,
    setScroll,
    toggleSnap,
    setGridSize,

    // Drag state
    startDrag,
    endDrag,

    // Utils
    timeToPixels,
    pixelsToTime,
    formatTime,
    snapTime,
  };
}

export default useTimeline;
