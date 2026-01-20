'use client';

/**
 * VROverlay - Phase 19
 * VR-specific UI overlay with menus and controls
 */

import { Headset, Home, Info, Loader2, Menu, Settings, Volume2, VolumeX, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import type { XRControllerState, XRSessionState } from '@/lib/threejs/xr-controller';
import { cn } from '@/lib/utils';

// =============================================================================
// TYPES
// =============================================================================

interface VROverlayProps {
  /** XR session state */
  sessionState: XRSessionState;
  /** Start VR session */
  onStartVR?: () => void;
  /** Exit VR session */
  onExitVR?: () => void;
  /** On menu item select */
  onMenuSelect?: (item: string) => void;
  /** Current lesson info */
  lessonInfo?: {
    title: string;
    currentSlide: number;
    totalSlides: number;
    progress: number;
  };
  /** Audio settings */
  audio?: {
    muted: boolean;
    volume: number;
    onMuteToggle: () => void;
    onVolumeChange: (volume: number) => void;
  };
  /** Show help */
  onShowHelp?: () => void;
  /** Show settings */
  onShowSettings?: () => void;
  /** Go home */
  onGoHome?: () => void;
}

// =============================================================================
// VR ENTRY BUTTON (2D UI)
// =============================================================================

interface VREntryButtonProps {
  isSupported: boolean;
  isLoading: boolean;
  onClick: () => void;
}

export function VREntryButton({ isSupported, isLoading, onClick }: VREntryButtonProps) {
  if (!isSupported) {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled
        className="gap-2 opacity-50"
        title="WebXR not supported in this browser"
      >
        <Headset className="h-4 w-4" />
        VR Not Available
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={isLoading}
      className="gap-2 border-primary/50 hover:bg-primary/10"
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Headset className="h-4 w-4" />}
      Enter VR
    </Button>
  );
}

// =============================================================================
// VR HUD (In-VR UI)
// =============================================================================

interface VRHUDProps {
  lessonInfo?: {
    title: string;
    currentSlide: number;
    totalSlides: number;
    progress: number;
  };
  controllerState?: XRControllerState;
}

export function VRHUD({ lessonInfo, controllerState }: VRHUDProps) {
  return (
    <div className="fixed pointer-events-none">
      {/* Progress Bar */}
      {lessonInfo && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-96">
          <div className="bg-black/70 backdrop-blur-sm rounded-lg p-3">
            <div className="flex justify-between text-sm text-white mb-2">
              <span className="truncate max-w-64">{lessonInfo.title}</span>
              <span>
                {lessonInfo.currentSlide}/{lessonInfo.totalSlides}
              </span>
            </div>
            <div className="h-1 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${lessonInfo.progress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Controller Indicators */}
      {controllerState?.connected && (
        <div className="absolute top-4 right-4">
          <div className="bg-black/50 rounded-full px-3 py-1 flex items-center gap-2">
            <div
              className={cn(
                'w-2 h-2 rounded-full',
                controllerState.hand === 'left' ? 'bg-blue-500' : 'bg-red-500',
              )}
            />
            <span className="text-xs text-white capitalize">{controllerState.hand}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// VR MENU PANEL (Floating 3D UI concept)
// =============================================================================

interface VRMenuPanelProps {
  isOpen: boolean;
  onClose: () => void;
  items: Array<{
    id: string;
    label: string;
    icon: React.ReactNode;
    action: () => void;
  }>;
}

export function VRMenuPanel({ isOpen, onClose, items }: VRMenuPanelProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-auto">
      <div className="bg-black/90 backdrop-blur-xl rounded-2xl p-6 w-80 border border-white/10 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Menu</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-left"
              onClick={item.action}
            >
              <span className="text-primary">{item.icon}</span>
              <span className="text-white">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// VR SETTINGS PANEL
// =============================================================================

interface VRSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  settings: {
    snapTurnAngle: number;
    onSnapTurnChange: (angle: number) => void;
    vignetteIntensity: number;
    onVignetteChange: (intensity: number) => void;
    seatedMode: boolean;
    onSeatedModeChange: (seated: boolean) => void;
  };
}

export function VRSettings({ isOpen, onClose, settings }: VRSettingsProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-auto">
      <div className="bg-black/90 backdrop-blur-xl rounded-2xl p-6 w-96 border border-white/10 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">VR Settings</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-6">
          {/* Snap Turn */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <label htmlFor="snap-turn-slider" className="text-sm text-white">
                Snap Turn Angle
              </label>
              <span className="text-sm text-zinc-500">{settings.snapTurnAngle}°</span>
            </div>
            <Slider
              id="snap-turn-slider"
              value={[settings.snapTurnAngle]}
              onValueChange={([v]) => settings.onSnapTurnChange(v)}
              min={15}
              max={90}
              step={15}
            />
          </div>

          {/* Vignette */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <label htmlFor="vignette-slider" className="text-sm text-white">
                Motion Vignette
              </label>
              <span className="text-sm text-zinc-500">
                {Math.round(settings.vignetteIntensity * 100)}%
              </span>
            </div>
            <Slider
              id="vignette-slider"
              value={[settings.vignetteIntensity * 100]}
              onValueChange={([v]) => settings.onVignetteChange(v / 100)}
              min={0}
              max={100}
              step={10}
            />
            <p className="text-[10px] text-zinc-500">Reduces motion sickness during movement</p>
          </div>

          {/* Seated Mode */}
          <div className="flex items-center justify-between">
            <div>
              <span id="seated-mode-label" className="text-sm text-white">
                Seated Mode
              </span>
              <p className="text-[10px] text-zinc-500">Adjust height for seated play</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings.seatedMode}
              aria-labelledby="seated-mode-label"
              className={cn(
                'w-12 h-6 rounded-full transition-colors relative',
                settings.seatedMode ? 'bg-primary' : 'bg-zinc-700',
              )}
              onClick={() => settings.onSeatedModeChange(!settings.seatedMode)}
            >
              <div
                className={cn(
                  'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                  settings.seatedMode ? 'translate-x-7' : 'translate-x-1',
                )}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// VR HELP PANEL
// =============================================================================

interface VRHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VRHelp({ isOpen, onClose }: VRHelpProps) {
  if (!isOpen) return null;

  const controls = [
    { action: 'Look Around', input: 'Move your head' },
    { action: 'Interact', input: 'Point and press trigger' },
    { action: 'Teleport', input: 'Hold trigger, aim, release' },
    { action: 'Turn', input: 'Thumbstick left/right' },
    { action: 'Menu', input: 'Press menu button' },
    { action: 'Grab Objects', input: 'Grip button' },
  ];

  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-auto">
      <div className="bg-black/90 backdrop-blur-xl rounded-2xl p-6 w-96 border border-white/10 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">VR Controls</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-3">
          {controls.map((control) => (
            <div
              key={control.action}
              className="flex justify-between items-center py-2 border-b border-white/5"
            >
              <span className="text-white">{control.action}</span>
              <span className="text-sm text-zinc-500">{control.input}</span>
            </div>
          ))}
        </div>

        <p className="text-xs text-zinc-500 mt-4 text-center">
          Point your controller at objects to interact with them
        </p>
      </div>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function VROverlay({
  sessionState,
  onStartVR,
  onExitVR,
  onMenuSelect: _onMenuSelect,
  lessonInfo,
  audio,
  onShowHelp: _onShowHelp,
  onShowSettings: _onShowSettings,
  onGoHome,
}: VROverlayProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const menuItems = [
    {
      id: 'home',
      label: 'Return to Menu',
      icon: <Home className="h-5 w-5" />,
      action: () => {
        setShowMenu(false);
        onGoHome?.();
      },
    },
    {
      id: 'settings',
      label: 'VR Settings',
      icon: <Settings className="h-5 w-5" />,
      action: () => {
        setShowMenu(false);
        setShowSettings(true);
      },
    },
    {
      id: 'help',
      label: 'Controls Help',
      icon: <Info className="h-5 w-5" />,
      action: () => {
        setShowMenu(false);
        setShowHelp(true);
      },
    },
    {
      id: 'exit',
      label: 'Exit VR',
      icon: <X className="h-5 w-5" />,
      action: () => {
        setShowMenu(false);
        onExitVR?.();
      },
    },
  ];

  // If in VR, show VR-specific UI
  if (sessionState.isPresenting) {
    return (
      <>
        <VRHUD lessonInfo={lessonInfo} controllerState={sessionState.controllers[0]} />

        <VRMenuPanel isOpen={showMenu} onClose={() => setShowMenu(false)} items={menuItems} />

        <VRSettings
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          settings={{
            snapTurnAngle: 45,
            onSnapTurnChange: () => {},
            vignetteIntensity: 0.5,
            onVignetteChange: () => {},
            seatedMode: false,
            onSeatedModeChange: () => {},
          }}
        />

        <VRHelp isOpen={showHelp} onClose={() => setShowHelp(false)} />

        {/* Floating menu button */}
        <div className="fixed bottom-8 right-8 pointer-events-auto">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowMenu(true)}
            className="h-12 w-12 rounded-full bg-black/70 border-white/20"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </>
    );
  }

  // 2D UI when not in VR
  return (
    <div className="flex items-center gap-2">
      {audio && (
        <Button variant="ghost" size="icon" onClick={audio.onMuteToggle} className="h-8 w-8">
          {audio.muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>
      )}

      <VREntryButton
        isSupported={sessionState.isSupported}
        isLoading={false}
        onClick={() => onStartVR?.()}
      />
    </div>
  );
}

export default VROverlay;
