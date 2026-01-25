'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowLeft,
  ExternalLink,
  Play,
  RefreshCw,
  Volume2,
  VolumeX,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useXAPIBridge } from '@/lib/xapi/bridge';
import { storeStatement } from '@/lib/xapi/service';
import { IgniteCoach } from './IgniteCoach';

// ============================================================================
// TYPES
// ============================================================================

export interface CoursePlayerProps {
  /** Course ID */
  courseId: string;
  /** URL to launch (index.html of unzipped SCORM package) */
  launchUrl: string;
  /** Course title */
  title: string;
  /** Course description */
  description?: string;
  /** Learner's name */
  learnerName: string;
  /** Learner's email */
  learnerEmail: string;
  /** Tenant ID */
  tenantId: string;
  /** Whether to show the AI coach */
  showCoach?: boolean;
  /** Callback when course completes */
  onComplete?: (passed: boolean, score?: number) => void;
  /** Callback when progress updates */
  onProgress?: (progress: number) => void;
  /** Additional class name */
  className?: string;
}

type PlayerState = 'loading' | 'ready' | 'playing' | 'error' | 'completed';

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * CoursePlayer - Secure SCORM/xAPI Content Player
 *
 * Displays course content in a sandboxed iframe with:
 * - xAPI/SCORM bridge for tracking
 * - Ignite AI Coach integration
 * - Loading and error states
 * - Progress tracking
 *
 * @example
 * ```tsx
 * <CoursePlayer
 *   courseId="abc123"
 *   launchUrl="/scorm/abc123/index.html"
 *   title="Leadership Fundamentals"
 *   learnerName="John Doe"
 *   learnerEmail="john@example.com"
 *   tenantId="tenant-1"
 *   onComplete={(passed, score) => handleComplete(passed, score)}
 * />
 * ```
 */
export function CoursePlayer({
  courseId,
  launchUrl,
  title,
  description,
  learnerName,
  learnerEmail,
  tenantId,
  showCoach = true,
  onComplete,
  onProgress,
  className,
}: CoursePlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [playerState, setPlayerState] = useState<PlayerState>('loading');
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [loadAttempts, setLoadAttempts] = useState(0);

  // Initialize xAPI bridge
  const { state: bridgeState, statements } = useXAPIBridge({
    courseId,
    courseTitle: title,
    learnerEmail,
    learnerName,
    tenantId,
    autoStart: true,
    onComplete: (passed, score) => {
      setPlayerState('completed');
      onComplete?.(passed, score);
    },
    onDataModelUpdate: (key, value) => {
      // Track progress updates
      if (key === 'cmi.progress_measure' || key.includes('progress')) {
        const progressValue = Number(value);
        if (!Number.isNaN(progressValue)) {
          setProgress(progressValue * 100);
          onProgress?.(progressValue);
        }
      }
    },
    onError: (error) => {
      console.error('Bridge error:', error);
    },
  });

  // Store statements when they're generated
  useEffect(() => {
    if (statements.length > 0) {
      const latestStatement = statements[statements.length - 1];
      storeStatement(latestStatement, {
        organizationId: tenantId,
      }).catch(console.error);
    }
  }, [statements, tenantId]);

  // Update progress from bridge state
  useEffect(() => {
    if (bridgeState.progress > 0) {
      setProgress(bridgeState.progress * 100);
    }
  }, [bridgeState.progress]);

  // Handle iframe load
  const handleIframeLoad = useCallback(() => {
    setPlayerState('playing');
    setLoadAttempts(0);
  }, []);

  // Handle iframe error
  const handleIframeError = useCallback(() => {
    if (loadAttempts < 2) {
      setLoadAttempts((prev) => prev + 1);
      // Retry after a short delay
      setTimeout(() => {
        if (iframeRef.current) {
          iframeRef.current.src = launchUrl;
        }
      }, 1000);
    } else {
      setPlayerState('error');
      setErrorMessage('Unable to load course content. The file may be missing or corrupted.');
    }
  }, [launchUrl, loadAttempts]);

  // Check if URL is valid before attempting to load
  useEffect(() => {
    if (!launchUrl) {
      setPlayerState('error');
      setErrorMessage('No content URL provided for this course.');
      return;
    }

    // Verify URL is accessible
    fetch(launchUrl, { method: 'HEAD' })
      .then((res) => {
        if (!res.ok) {
          setPlayerState('error');
          setErrorMessage('Course content not found. Please contact support.');
        }
      })
      .catch(() => {
        // URL check failed, but iframe might still work (CORS)
        // Let the iframe try to load
      });
  }, [launchUrl]);

  // Handle retry
  const handleRetry = () => {
    setPlayerState('loading');
    setErrorMessage(null);
    setLoadAttempts(0);
    if (iframeRef.current) {
      iframeRef.current.src = launchUrl;
    }
  };

  // Report issue handler
  const handleReportIssue = () => {
    // Open support modal or redirect to support page
    window.open(
      `mailto:support@lxd360.com?subject=Course Loading Issue&body=Course: ${title}%0D%0ACourse ID: ${courseId}%0D%0AError: ${errorMessage || 'Unknown'}`,
      '_blank',
    );
  };

  return (
    <div className={cn('relative flex flex-col h-[calc(100vh-64px)] bg-black', className)}>
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-card/80 backdrop-blur-sm border-b border-border/50">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-muted-foreground hover:text-foreground"
          >
            <Link href="/ignite/learn">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Exit
            </Link>
          </Button>
          <div className="h-4 w-px bg-border" />
          <h1 className="text-sm font-medium text-foreground truncate max-w-[300px]">{title}</h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Progress indicator */}
          {playerState === 'playing' && progress > 0 && (
            <div className="flex items-center gap-2">
              <Progress value={progress} className="w-24 h-2" />
              <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
            </div>
          )}

          {/* Mute toggle */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setIsMuted(!isMuted)}
            className="h-8 w-8"
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Volume2 className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="sr-only">{isMuted ? 'Unmute' : 'Mute'}</span>
          </Button>

          {/* Fullscreen */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => iframeRef.current?.requestFullscreen()}
            className="h-8 w-8"
          >
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
            <span className="sr-only">Fullscreen</span>
          </Button>
        </div>
      </div>

      {/* Main content area */}
      <div className="relative flex-1">
        <AnimatePresence mode="wait">
          {/* Loading state */}
          {playerState === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-black z-10"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="h-16 w-16 rounded-full border-4 border-lxd-primary/20" />
                  <motion.div
                    className="absolute inset-0 h-16 w-16 rounded-full border-4 border-t-lxd-primary border-r-transparent border-b-transparent border-l-transparent"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                  <Play className="absolute inset-0 m-auto h-6 w-6 text-lxd-primary" />
                </div>
                <div className="text-center">
                  <p className="text-white font-medium">Loading Course</p>
                  <p className="text-white/60 text-sm mt-1">{title}</p>
                </div>
                {loadAttempts > 0 && (
                  <p className="text-white/40 text-xs">Retry attempt {loadAttempts}...</p>
                )}
              </div>
            </motion.div>
          )}

          {/* Error state */}
          {playerState === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 flex items-center justify-center bg-black z-10"
            >
              <div className="flex flex-col items-center gap-6 max-w-md text-center px-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 border border-destructive/30">
                  <AlertTriangle className="h-10 w-10 text-destructive" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Content Not Found</h2>
                  <p className="mt-2 text-white/60">
                    {errorMessage ||
                      "We couldn't load the course content. This might be a temporary issue."}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button type="button" variant="outline" onClick={handleRetry}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                  <Button type="button" variant="ghost" onClick={handleReportIssue}>
                    Report Issue
                  </Button>
                </div>
                <Button variant="link" asChild className="text-white/40 hover:text-white/60">
                  <Link href="/ignite/learn">Return to Learning Dashboard</Link>
                </Button>
              </div>
            </motion.div>
          )}

          {/* Completed state */}
          {playerState === 'completed' && (
            <motion.div
              key="completed"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 flex items-center justify-center bg-black/90 z-10"
            >
              <div className="flex flex-col items-center gap-6 max-w-md text-center px-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                  className="flex h-24 w-24 items-center justify-center rounded-full bg-lxd-success/20 border border-lxd-success/40"
                >
                  <svg
                    className="h-12 w-12 text-lxd-success"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    role="img"
                    aria-label="Checkmark"
                  >
                    <title>Course completed successfully</title>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Course Completed!</h2>
                  <p className="mt-2 text-white/60">
                    {bridgeState.passed
                      ? `Congratulations! You passed with a score of ${bridgeState.score ?? 0}%.`
                      : 'Great job completing the course!'}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button asChild className="bg-lxd-primary hover:bg-lxd-primary/90">
                    <Link href="/ignite/learn">Continue Learning</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href={`/ignite/learn/course/${courseId}`}>Review Course</Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Course iframe - always rendered but may be hidden */}
        <iframe
          ref={iframeRef}
          src={launchUrl}
          title={title}
          className={cn(
            'w-full h-full border-0',
            playerState === 'playing' ? 'opacity-100' : 'opacity-0',
          )}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
          allow="autoplay; fullscreen"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
        />

        {/* Ignite Coach overlay */}
        {showCoach && playerState === 'playing' && (
          <IgniteCoach
            courseTitle={title}
            courseDescription={description}
            learnerName={learnerName}
          />
        )}
      </div>
    </div>
  );
}

export default CoursePlayer;
