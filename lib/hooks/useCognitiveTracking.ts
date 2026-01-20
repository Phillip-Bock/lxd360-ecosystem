/**
 * Cognitive Load Tracking Hook
 *
 * Collects behavioral signals and calculates real-time cognitive load.
 * Sends metrics to the API at configurable intervals.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { logger } from '@/lib/logger';

const log = logger.child({ module: 'hooks-cognitive-tracking' });

interface BehavioralSignals {
  tabSwitches: number;
  scrollVelocity: 'slow' | 'moderate' | 'fast';
  rereadCount: number;
  timeOnElement: number;
  pauseCount: number;
  copyEvents: number;
  mouseIdleTime: number;
  clickFrequency: number;
}

interface CognitiveMetrics {
  cognitiveLoadIndex: number;
  cognitiveLoadLevel: 'low' | 'optimal' | 'high' | 'overload';
  intrinsicLoad: number;
  extraneousLoad: number;
  germaneLoad: number;
  engagementScore: number;
  attentionScore: number;
}

interface UseCognitiveTrackingOptions {
  sessionId?: string;
  contentId?: string;
  contentType?: string;
  sendInterval?: number; // ms between API calls
  enabled?: boolean;
}

interface UseCognitiveTrackingReturn {
  metrics: CognitiveMetrics;
  signals: BehavioralSignals;
  isTracking: boolean;
  startTracking: () => void;
  stopTracking: () => void;
  recordInteraction: (type: string) => void;
}

const DEFAULT_METRICS: CognitiveMetrics = {
  cognitiveLoadIndex: 25,
  cognitiveLoadLevel: 'optimal',
  intrinsicLoad: 15,
  extraneousLoad: 10,
  germaneLoad: 5,
  engagementScore: 70,
  attentionScore: 75,
};

const DEFAULT_SIGNALS: BehavioralSignals = {
  tabSwitches: 0,
  scrollVelocity: 'moderate',
  rereadCount: 0,
  timeOnElement: 0,
  pauseCount: 0,
  copyEvents: 0,
  mouseIdleTime: 0,
  clickFrequency: 0,
};

export function useCognitiveTracking(
  options: UseCognitiveTrackingOptions = {},
): UseCognitiveTrackingReturn {
  const {
    sessionId,
    contentId,
    contentType,
    sendInterval = 30000, // 30 seconds default
    enabled = true,
  } = options;

  const [isTracking, setIsTracking] = useState(false);
  const [metrics, setMetrics] = useState<CognitiveMetrics>(DEFAULT_METRICS);
  const [signals, setSignals] = useState<BehavioralSignals>(DEFAULT_SIGNALS);

  const signalsRef = useRef<BehavioralSignals>(DEFAULT_SIGNALS);
  const lastScrollY = useRef(0);
  const lastScrollTime = useRef(Date.now());
  const lastMouseMove = useRef(Date.now());
  const sessionStart = useRef(Date.now());
  const clickTimestamps = useRef<number[]>([]);
  const _visibleElements = useRef<Map<string, number>>(new Map());
  void _visibleElements; // Reserved for future element visibility tracking
  const sendIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate CLI from behavioral signals
  const calculateCLI = useCallback((sigs: BehavioralSignals): CognitiveMetrics => {
    // Base intrinsic load from content complexity (estimated)
    const intrinsicLoad = 20;

    // Extraneous load from distractions and friction
    let extraneousLoad = 0;
    extraneousLoad += sigs.tabSwitches * 3; // Tab switches indicate distraction
    extraneousLoad +=
      sigs.scrollVelocity === 'fast' ? 8 : sigs.scrollVelocity === 'moderate' ? 4 : 0;
    extraneousLoad += Math.min(10, sigs.mouseIdleTime / 10000); // Long idle = confusion
    extraneousLoad = Math.min(40, extraneousLoad);

    // Germane load reduction from effective engagement
    let germaneLoad = 0;
    germaneLoad += Math.min(5, sigs.rereadCount); // Rereading = trying to understand
    germaneLoad += sigs.copyEvents * 2; // Copying = active learning
    germaneLoad += Math.min(8, sigs.clickFrequency); // Interaction = engagement
    germaneLoad = Math.min(20, germaneLoad);

    // Calculate CLI
    const cli = Math.max(0, Math.min(100, intrinsicLoad + extraneousLoad - germaneLoad));

    // Determine level
    let level: CognitiveMetrics['cognitiveLoadLevel'];
    if (cli < 15) level = 'low';
    else if (cli < 40) level = 'optimal';
    else if (cli < 70) level = 'high';
    else level = 'overload';

    // Engagement score based on interaction patterns
    const timeSinceStart = (Date.now() - sessionStart.current) / 1000;
    const interactionRate =
      (sigs.clickFrequency + sigs.copyEvents + sigs.rereadCount) / Math.max(1, timeSinceStart / 60);
    const engagementScore = Math.min(
      100,
      Math.round(50 + interactionRate * 10 - sigs.tabSwitches * 5),
    );

    // Attention score based on focus patterns
    const attentionScore = Math.min(
      100,
      Math.round(80 - sigs.tabSwitches * 8 - sigs.mouseIdleTime / 5000 + sigs.timeOnElement / 1000),
    );

    return {
      cognitiveLoadIndex: Math.round(cli),
      cognitiveLoadLevel: level,
      intrinsicLoad: Math.round(intrinsicLoad),
      extraneousLoad: Math.round(extraneousLoad),
      germaneLoad: Math.round(germaneLoad),
      engagementScore: Math.max(0, engagementScore),
      attentionScore: Math.max(0, attentionScore),
    };
  }, []);

  // Send metrics to API
  const sendMetrics = useCallback(
    async (metricsData: CognitiveMetrics, signalsData: BehavioralSignals) => {
      try {
        await fetch('/api/cognitive/metrics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            contentId,
            contentType,
            cognitiveLoadIndex: metricsData.cognitiveLoadIndex,
            intrinsicLoad: metricsData.intrinsicLoad,
            extraneousLoad: metricsData.extraneousLoad,
            germaneLoad: metricsData.germaneLoad,
            engagementScore: metricsData.engagementScore,
            attentionScore: metricsData.attentionScore,
            signals: signalsData,
            timeOnTask: (Date.now() - sessionStart.current) / 1000,
          }),
        });
      } catch (error) {
        log.error('Failed to send cognitive metrics', { error });
      }
    },
    [sessionId, contentId, contentType],
  );

  // Handle scroll events
  const handleScroll = useCallback(() => {
    const now = Date.now();
    const deltaY = Math.abs(window.scrollY - lastScrollY.current);
    const deltaTime = now - lastScrollTime.current;

    if (deltaTime > 0) {
      const velocity = deltaY / deltaTime;
      let scrollVelocity: BehavioralSignals['scrollVelocity'];
      if (velocity < 0.5) scrollVelocity = 'slow';
      else if (velocity < 2) scrollVelocity = 'moderate';
      else scrollVelocity = 'fast';

      signalsRef.current = { ...signalsRef.current, scrollVelocity };
    }

    // Detect rereading (scrolling back up)
    if (window.scrollY < lastScrollY.current - 100) {
      signalsRef.current = {
        ...signalsRef.current,
        rereadCount: signalsRef.current.rereadCount + 1,
      };
    }

    lastScrollY.current = window.scrollY;
    lastScrollTime.current = now;
  }, []);

  // Handle visibility change (tab switches)
  const handleVisibilityChange = useCallback(() => {
    if (document.hidden) {
      signalsRef.current = {
        ...signalsRef.current,
        tabSwitches: signalsRef.current.tabSwitches + 1,
      };
    }
  }, []);

  // Handle mouse movement (idle detection)
  const handleMouseMove = useCallback(() => {
    const now = Date.now();
    const idleTime = now - lastMouseMove.current;
    signalsRef.current = {
      ...signalsRef.current,
      mouseIdleTime: signalsRef.current.mouseIdleTime + Math.min(idleTime, 5000),
    };
    lastMouseMove.current = now;
  }, []);

  // Handle click events
  const handleClick = useCallback(() => {
    const now = Date.now();
    clickTimestamps.current.push(now);
    // Keep only clicks from last 60 seconds
    clickTimestamps.current = clickTimestamps.current.filter((t) => now - t < 60000);
    signalsRef.current = {
      ...signalsRef.current,
      clickFrequency: clickTimestamps.current.length,
    };
  }, []);

  // Handle copy events
  const handleCopy = useCallback(() => {
    signalsRef.current = {
      ...signalsRef.current,
      copyEvents: signalsRef.current.copyEvents + 1,
    };
  }, []);

  // Record custom interaction
  const recordInteraction = useCallback((type: string) => {
    switch (type) {
      case 'pause':
        signalsRef.current = {
          ...signalsRef.current,
          pauseCount: signalsRef.current.pauseCount + 1,
        };
        break;
      case 'elementView':
        signalsRef.current = {
          ...signalsRef.current,
          timeOnElement: signalsRef.current.timeOnElement + 1000,
        };
        break;
    }
  }, []);

  // Start tracking
  const startTracking = useCallback(() => {
    if (!enabled) return;

    setIsTracking(true);
    sessionStart.current = Date.now();
    signalsRef.current = { ...DEFAULT_SIGNALS };

    // Add event listeners
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('click', handleClick);
    document.addEventListener('copy', handleCopy);

    // Start periodic metric calculation and sending
    sendIntervalRef.current = setInterval(() => {
      const currentSignals = { ...signalsRef.current };
      const currentMetrics = calculateCLI(currentSignals);
      setSignals(currentSignals);
      setMetrics(currentMetrics);
      sendMetrics(currentMetrics, currentSignals);
    }, sendInterval);
  }, [
    enabled,
    sendInterval,
    handleScroll,
    handleVisibilityChange,
    handleMouseMove,
    handleClick,
    handleCopy,
    calculateCLI,
    sendMetrics,
  ]);

  // Stop tracking
  const stopTracking = useCallback(() => {
    setIsTracking(false);

    // Remove event listeners
    window.removeEventListener('scroll', handleScroll);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('click', handleClick);
    document.removeEventListener('copy', handleCopy);

    // Clear interval
    if (sendIntervalRef.current) {
      clearInterval(sendIntervalRef.current);
      sendIntervalRef.current = null;
    }

    // Send final metrics
    const finalSignals = { ...signalsRef.current };
    const finalMetrics = calculateCLI(finalSignals);
    sendMetrics(finalMetrics, finalSignals);
  }, [
    handleScroll,
    handleVisibilityChange,
    handleMouseMove,
    handleClick,
    handleCopy,
    calculateCLI,
    sendMetrics,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isTracking) {
        stopTracking();
      }
    };
  }, [isTracking, stopTracking]);

  // Auto-start if enabled
  useEffect(() => {
    if (enabled && !isTracking) {
      startTracking();
    }
    return () => {
      if (isTracking) {
        stopTracking();
      }
    };
  }, [enabled, isTracking, startTracking, stopTracking]);

  return {
    metrics,
    signals,
    isTracking,
    startTracking,
    stopTracking,
    recordInteraction,
  };
}
