'use client';

/**
 * =============================================================================
 * INSPIRE Studio - Debug Overlay Component
 * =============================================================================
 *
 * Debug information overlay for preview mode. Shows player state,
 * trigger executions, timeline info, and performance metrics.
 *
 * @module components/studio/player/debug-overlay
 * @version 1.0.0
 */

import { Activity, Bug, ChevronDown, ChevronUp, Clock, Layers, Variable, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { usePlayerContext } from '@/providers/player-provider';

// =============================================================================
// COMPONENT PROPS
// =============================================================================

interface DebugOverlayProps {
  className?: string;
  defaultExpanded?: boolean;
}

// =============================================================================
// COLLAPSIBLE SECTION
// =============================================================================

interface DebugSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function DebugSection({ title, icon, children, defaultOpen = false }: DebugSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-white/10 last:border-0">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 hover:bg-white/5"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-xs font-medium">{title}</span>
        </div>
        {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>
      {isOpen && <div className="px-3 pb-2 text-xs text-white/70">{children}</div>}
    </div>
  );
}

// =============================================================================
// DEBUG OVERLAY COMPONENT
// =============================================================================

export function DebugOverlay({ className, defaultExpanded = false }: DebugOverlayProps) {
  const player = usePlayerContext();
  const [isVisible, setIsVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const debugInfo = player.state.debugInfo;
  const state = player.state;

  // Format variables for display
  const variablesDisplay = useMemo(() => {
    const entries: Array<[string, unknown]> = [];
    state.variables.forEach((value, key) => {
      entries.push([key, value]);
    });
    return entries;
  }, [state.variables]);

  // Format object states for display
  const statesDisplay = useMemo(() => {
    const entries: Array<[string, string]> = [];
    state.objectStates.forEach((value, key) => {
      entries.push([key, value]);
    });
    return entries;
  }, [state.objectStates]);

  // Format active layers for display
  const layersDisplay = useMemo(() => {
    return Array.from(state.activeLayers);
  }, [state.activeLayers]);

  if (!isVisible) {
    return (
      <button
        type="button"
        onClick={() => setIsVisible(true)}
        className={cn(
          'p-2 bg-black/80 backdrop-blur-sm rounded-sm text-white/70 hover:text-white',
          className,
        )}
        title="Show debug overlay"
      >
        <Bug className="w-4 h-4" />
      </button>
    );
  }

  if (!isExpanded) {
    return (
      <div
        className={cn(
          'flex items-center gap-2 px-3 py-2 bg-black/80 backdrop-blur-sm rounded-sm',
          className,
        )}
      >
        <Bug className="w-4 h-4 text-yellow-500" />
        <span className="text-xs text-white/70">Preview Mode</span>
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          className="p-1 hover:bg-white/10 rounded-sm"
          title="Expand debug panel"
        >
          <ChevronDown className="w-3 h-3" />
        </button>
        <button
          type="button"
          onClick={() => setIsVisible(false)}
          className="p-1 hover:bg-white/10 rounded-sm"
          title="Hide debug overlay"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'w-72 bg-black/90 backdrop-blur-sm rounded-sm shadow-xl overflow-hidden',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-yellow-500/20 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Bug className="w-4 h-4 text-yellow-500" />
          <span className="text-xs font-semibold text-white">Debug Panel</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsExpanded(false)}
            className="p-1 hover:bg-white/10 rounded-sm"
            title="Collapse"
          >
            <ChevronUp className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() => setIsVisible(false)}
            className="p-1 hover:bg-white/10 rounded-sm"
            title="Close"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-h-96 overflow-y-auto">
        {/* Player State */}
        <DebugSection title="Player State" icon={<Activity className="w-3 h-3" />} defaultOpen>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Mode:</span>
              <span className="text-white">{state.mode}</span>
            </div>
            <div className="flex justify-between">
              <span>Playback:</span>
              <span className="text-white">{state.playbackState}</span>
            </div>
            <div className="flex justify-between">
              <span>Slide:</span>
              <span className="text-white">
                {state.currentSlideIndex + 1} / {state.lesson?.slides.length || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Progress:</span>
              <span className="text-white">{Math.round(state.progress.percentComplete)}%</span>
            </div>
          </div>
        </DebugSection>

        {/* Timeline */}
        <DebugSection title="Timeline" icon={<Clock className="w-3 h-3" />}>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Playing:</span>
              <span className="text-white">{state.timelineState.isPlaying ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex justify-between">
              <span>Current:</span>
              <span className="text-white">{Math.round(state.timelineState.currentTime)}ms</span>
            </div>
            <div className="flex justify-between">
              <span>Duration:</span>
              <span className="text-white">{Math.round(state.timelineState.duration)}ms</span>
            </div>
            <div className="flex justify-between">
              <span>Rate:</span>
              <span className="text-white">{state.timelineState.playbackRate}x</span>
            </div>
          </div>
        </DebugSection>

        {/* Variables */}
        <DebugSection
          title={`Variables (${variablesDisplay.length})`}
          icon={<Variable className="w-3 h-3" />}
        >
          {variablesDisplay.length === 0 ? (
            <span className="text-white/50">No variables</span>
          ) : (
            <div className="space-y-1">
              {variablesDisplay.map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="truncate max-w-[100px]">{key}:</span>
                  <span className="text-white truncate max-w-[100px]">{JSON.stringify(value)}</span>
                </div>
              ))}
            </div>
          )}
        </DebugSection>

        {/* Object States */}
        <DebugSection
          title={`Object States (${statesDisplay.length})`}
          icon={<Activity className="w-3 h-3" />}
        >
          {statesDisplay.length === 0 ? (
            <span className="text-white/50">No object states</span>
          ) : (
            <div className="space-y-1">
              {statesDisplay.map(([objectId, stateId]) => (
                <div key={objectId} className="flex justify-between">
                  <span className="truncate max-w-[100px]">{objectId}:</span>
                  <span className="text-white">{stateId}</span>
                </div>
              ))}
            </div>
          )}
        </DebugSection>

        {/* Active Layers */}
        <DebugSection
          title={`Layers (${layersDisplay.length})`}
          icon={<Layers className="w-3 h-3" />}
        >
          {layersDisplay.length === 0 ? (
            <span className="text-white/50">No active layers</span>
          ) : (
            <div className="flex flex-wrap gap-1">
              {layersDisplay.map((layerId) => (
                <span key={layerId} className="px-2 py-0.5 bg-white/10 rounded-sm text-white">
                  {layerId}
                </span>
              ))}
            </div>
          )}
        </DebugSection>

        {/* Performance (if available) */}
        {debugInfo && (
          <DebugSection title="Performance" icon={<Activity className="w-3 h-3" />}>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>FPS:</span>
                <span className="text-white">{debugInfo.fps}</span>
              </div>
              <div className="flex justify-between">
                <span>Memory:</span>
                <span className="text-white">{debugInfo.memoryUsage}MB</span>
              </div>
              <div className="flex justify-between">
                <span>Render:</span>
                <span className="text-white">{debugInfo.renderTime}ms</span>
              </div>
              <div className="flex justify-between">
                <span>Timelines:</span>
                <span className="text-white">{debugInfo.activeTimelines}</span>
              </div>
              <div className="flex justify-between">
                <span>Triggers:</span>
                <span className="text-white">{debugInfo.activeTriggers}</span>
              </div>
            </div>
          </DebugSection>
        )}

        {/* Recent Logs */}
        {debugInfo && debugInfo.logs.length > 0 && (
          <DebugSection
            title={`Logs (${debugInfo.logs.length})`}
            icon={<Bug className="w-3 h-3" />}
          >
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {debugInfo.logs
                .slice(-10)
                .reverse()
                .map((log, index) => (
                  <div
                    key={index}
                    className={cn(
                      'text-xs p-1 rounded-sm',
                      log.level === 'error' && 'bg-red-500/20 text-red-400',
                      log.level === 'warn' && 'bg-yellow-500/20 text-yellow-400',
                      log.level === 'info' && 'text-white/70',
                      log.level === 'debug' && 'text-white/50',
                    )}
                  >
                    <span className="opacity-50">
                      [{new Date(log.timestamp).toLocaleTimeString()}]
                    </span>{' '}
                    {log.message}
                  </div>
                ))}
            </div>
          </DebugSection>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-2 bg-white/5 border-t border-white/10 text-xs text-white/50">
        Session: {state.sessionId.slice(0, 8)}...
      </div>
    </div>
  );
}

export default DebugOverlay;
