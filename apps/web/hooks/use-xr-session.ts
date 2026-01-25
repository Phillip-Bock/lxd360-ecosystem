'use client';

/**
 * useXRSession - Phase 19
 * React hook for WebXR session management
 */

import { useCallback, useEffect, useState } from 'react';
import { logger } from '@/lib/logger';

const log = logger.scope('useXRSession');

// =============================================================================
// TYPES
// =============================================================================

interface XRSessionConfig {
  /** Enable VR mode */
  enableVR?: boolean;
  /** Enable AR mode */
  enableAR?: boolean;
  /** Required WebXR features */
  requiredFeatures?: string[];
  /** Optional WebXR features */
  optionalFeatures?: string[];
  /** Reference space type */
  referenceSpaceType?: XRReferenceSpaceType;
  /** Comfort settings */
  comfortSettings?: {
    seatedMode?: boolean;
    snapTurn?: boolean;
    snapTurnAngle?: number;
    vignette?: boolean;
  };
}

interface XRControllerState {
  hand: 'left' | 'right';
  connected: boolean;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number; w: number };
  buttons: {
    trigger: boolean;
    grip: boolean;
    thumbstick: boolean;
    a: boolean;
    b: boolean;
  };
  axes: { x: number; y: number };
}

interface UseXRSessionOptions {
  /** XR configuration */
  config?: Partial<XRSessionConfig>;
  /** Callback when session starts */
  onSessionStart?: () => void;
  /** Callback when session ends */
  onSessionEnd?: () => void;
  /** Callback on controller event */
  onControllerEvent?: (
    event: 'select' | 'squeeze' | 'connected' | 'disconnected',
    controller: XRControllerState,
  ) => void;
  /** Callback on teleport */
  onTeleport?: (position: { x: number; y: number; z: number }) => void;
  /** Auto-detect VR support on mount */
  autoDetect?: boolean;
}

interface UseXRSessionReturn {
  /** Whether currently in a VR session */
  isPresenting: boolean;
  /** Whether VR is supported */
  isSupported: boolean;
  /** Whether currently checking support */
  isChecking: boolean;
  /** Current error if any */
  error: string | null;
  /** Connected controllers */
  controllers: XRControllerState[];
  /** Start VR session */
  startSession: () => Promise<void>;
  /** End VR session */
  endSession: () => Promise<void>;
  /** Toggle VR session */
  toggleSession: () => Promise<void>;
  /** Update configuration */
  updateConfig: (config: Partial<XRSessionConfig>) => void;
  /** Get controller state */
  getController: (hand: 'left' | 'right') => XRControllerState | undefined;
  /** Trigger haptic feedback */
  triggerHaptics: (hand: 'left' | 'right', intensity?: number, duration?: number) => void;
  /** Reset VR position */
  resetPosition: () => void;
}

// =============================================================================
// DEFAULT CONFIG
// =============================================================================

const DEFAULT_CONFIG: XRSessionConfig = {
  enableVR: true,
  enableAR: false,
  requiredFeatures: [],
  optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking', 'layers'],
  referenceSpaceType: 'local-floor',
  comfortSettings: {
    seatedMode: false,
    snapTurn: true,
    snapTurnAngle: 45,
    vignette: true,
  },
};

// =============================================================================
// HOOK IMPLEMENTATION
// =============================================================================

export function useXRSession(options: UseXRSessionOptions = {}): UseXRSessionReturn {
  const {
    config: initialConfig,
    onSessionStart,
    onSessionEnd,
    onControllerEvent,
    autoDetect = true,
  } = options;

  // State
  const [isPresenting, setIsPresenting] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [controllers, setControllers] = useState<XRControllerState[]>([]);
  const [session, setSession] = useState<XRSession | null>(null);
  const [referenceSpace, setReferenceSpace] = useState<XRReferenceSpace | null>(null);
  const [config, setConfig] = useState<XRSessionConfig>({
    ...DEFAULT_CONFIG,
    ...initialConfig,
  });

  // Check VR support
  const checkSupport = useCallback(async () => {
    setIsChecking(true);
    setError(null);

    try {
      if (!navigator.xr) {
        setIsSupported(false);
        return false;
      }

      const vrSupported = await navigator.xr.isSessionSupported('immersive-vr');
      setIsSupported(vrSupported);
      return vrSupported;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check VR support');
      setIsSupported(false);
      return false;
    } finally {
      setIsChecking(false);
    }
  }, []);

  // Setup controller tracking
  const setupControllers = useCallback(
    (xrSession: XRSession) => {
      const updateController = (source: XRInputSource, connected: boolean): XRControllerState => {
        const hand = source.handedness === 'left' ? 'left' : 'right';
        return {
          hand,
          connected,
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0, w: 1 },
          buttons: {
            trigger: false,
            grip: false,
            thumbstick: false,
            a: false,
            b: false,
          },
          axes: { x: 0, y: 0 },
        };
      };

      xrSession.addEventListener('inputsourceschange', (event: XRInputSourcesChangeEvent) => {
        const newControllers: XRControllerState[] = [];

        for (const source of event.added) {
          const controller = updateController(source, true);
          newControllers.push(controller);
          onControllerEvent?.('connected', controller);
        }

        for (const source of event.removed) {
          const controller = updateController(source, false);
          onControllerEvent?.('disconnected', controller);
        }

        // Update active controllers
        for (const source of xrSession.inputSources) {
          const existing = newControllers.find(
            (c) => c.hand === (source.handedness === 'left' ? 'left' : 'right'),
          );
          if (!existing) {
            newControllers.push(updateController(source, true));
          }
        }

        setControllers(newControllers);
      });

      // Select events (trigger press)
      xrSession.addEventListener('select', (event: XRInputSourceEvent) => {
        const hand = event.inputSource.handedness === 'left' ? 'left' : 'right';
        const controller = controllers.find((c) => c.hand === hand);
        if (controller) {
          onControllerEvent?.('select', controller);
        }
      });

      // Squeeze events (grip press)
      xrSession.addEventListener('squeeze', (event: XRInputSourceEvent) => {
        const hand = event.inputSource.handedness === 'left' ? 'left' : 'right';
        const controller = controllers.find((c) => c.hand === hand);
        if (controller) {
          onControllerEvent?.('squeeze', controller);
        }
      });
    },
    [controllers, onControllerEvent],
  );

  // Start VR session
  const startSession = useCallback(async () => {
    if (!isSupported) {
      setError('VR is not supported on this device');
      return;
    }

    if (isPresenting) {
      return;
    }

    setError(null);

    try {
      if (!navigator.xr) {
        throw new Error('WebXR not available');
      }

      // Request session
      const xrSession = await navigator.xr.requestSession('immersive-vr', {
        requiredFeatures: config.requiredFeatures,
        optionalFeatures: config.optionalFeatures,
      });

      // Get reference space
      const refSpace = await xrSession.requestReferenceSpace(
        config.comfortSettings?.seatedMode ? 'local' : config.referenceSpaceType || 'local-floor',
      );

      // Update state
      setSession(xrSession);
      setReferenceSpace(refSpace);
      setIsPresenting(true);

      // Session end handler
      xrSession.addEventListener('end', () => {
        setIsPresenting(false);
        setSession(null);
        setReferenceSpace(null);
        setControllers([]);
        onSessionEnd?.();
      });

      // Setup controllers
      setupControllers(xrSession);

      onSessionStart?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start VR session');
    }
  }, [isSupported, isPresenting, config, onSessionStart, onSessionEnd, setupControllers]);

  // End VR session
  const endSession = useCallback(async () => {
    if (!session) {
      return;
    }

    try {
      await session.end();
    } catch (err) {
      // Session may already be ended
      log.error('Error ending session', err instanceof Error ? err : new Error(String(err)));
    }
  }, [session]);

  // Toggle session
  const toggleSession = useCallback(async () => {
    if (isPresenting) {
      await endSession();
    } else {
      await startSession();
    }
  }, [isPresenting, startSession, endSession]);

  // Update configuration
  const updateConfig = useCallback((newConfig: Partial<XRSessionConfig>) => {
    setConfig((prev) => ({
      ...prev,
      ...newConfig,
      comfortSettings: {
        ...prev.comfortSettings,
        ...(newConfig.comfortSettings || {}),
      },
    }));
  }, []);

  // Get controller by hand
  const getController = useCallback(
    (hand: 'left' | 'right') => {
      return controllers.find((c) => c.hand === hand);
    },
    [controllers],
  );

  // Trigger haptic feedback
  const triggerHaptics = useCallback(
    (hand: 'left' | 'right', intensity = 0.5, duration = 100) => {
      if (!session) return;

      for (const source of session.inputSources) {
        if (source.handedness === hand && source.gamepad?.hapticActuators?.[0]) {
          // Haptic actuator API varies by browser
          (
            source.gamepad.hapticActuators[0] as {
              pulse: (intensity: number, duration: number) => void;
            }
          ).pulse(intensity, duration);
        }
      }
    },
    [session],
  );

  // Reset VR position
  const resetPosition = useCallback(() => {
    if (!session || !referenceSpace) return;

    // Request a new reference space to reset position
    session
      .requestReferenceSpace(
        config.comfortSettings?.seatedMode ? 'local' : config.referenceSpaceType || 'local-floor',
      )
      .then((space) => {
        setReferenceSpace(space);
      })
      .catch(console.error);
  }, [session, referenceSpace, config.comfortSettings?.seatedMode, config.referenceSpaceType]);

  // Auto-detect VR support on mount
  useEffect(() => {
    if (autoDetect) {
      checkSupport();
    }
  }, [autoDetect, checkSupport]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (session) {
        session.end().catch(console.error);
      }
    };
  }, [session]);

  return {
    isPresenting,
    isSupported,
    isChecking,
    error,
    controllers,
    startSession,
    endSession,
    toggleSession,
    updateConfig,
    getController,
    triggerHaptics,
    resetPosition,
  };
}

export default useXRSession;
