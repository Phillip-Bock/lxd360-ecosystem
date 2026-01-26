// =============================================================================
// USE CONTENT WRAPPER HOOK
// =============================================================================
// React hook for managing content format wrappers in the player.
// Handles detection, initialization, and lifecycle management.
// =============================================================================

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { detectContentFormatFromStorage, detectContentFormatFromUrl } from './content-detector';
import type {
  ContentFormat,
  ContentManifest,
  ContentWrapper,
  Scorm12DataModel,
  Scorm2004DataModel,
  WrapperConfig,
  WrapperProgress,
  WrapperResult,
} from './types';
import { createWrapper, isHtml5Wrapper, isNativeWrapper, isPdfWrapper } from './wrappers';

/**
 * Content wrapper state.
 */
export interface ContentWrapperState {
  /** Content format */
  format: ContentFormat | null;
  /** Content manifest */
  manifest: ContentManifest | null;
  /** Whether wrapper is initialized */
  isInitialized: boolean;
  /** Whether wrapper is terminated */
  isTerminated: boolean;
  /** Current progress */
  progress: WrapperProgress | null;
  /** Final result */
  result: WrapperResult | null;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: string | null;
}

/**
 * Content wrapper configuration for the hook.
 */
export interface UseContentWrapperConfig {
  /** Content URL or base URL for package */
  contentUrl: string;
  /** Whether content is a single file (PDF, HTML) or a package */
  isSingleFile?: boolean;
  /** Tenant ID */
  tenantId: string;
  /** Enrollment ID */
  enrollmentId: string;
  /** Learner ID */
  learnerId: string;
  /** Course ID */
  courseId: string;
  /** LRS endpoint (for xAPI/cmi5) */
  lrsEndpoint?: string;
  /** LRS auth (for xAPI) */
  lrsAuth?: {
    type: 'basic' | 'oauth';
    username?: string;
    password?: string;
    token?: string;
  };
  /** cmi5 fetch URL */
  cmi5FetchUrl?: string;
  /** cmi5 auth token */
  cmi5AuthToken?: string;
  /** AICC URL */
  aiccUrl?: string;
  /** AICC session ID */
  aiccSessionId?: string;
  /** Actor/learner info (for xAPI/cmi5) */
  actor?: {
    name: string;
    mbox?: string;
    account?: {
      homePage: string;
      name: string;
    };
  };
  /** Initial data for SCORM resume */
  initialScormData?: Record<string, unknown>;
  /** Callback when progress updates */
  onProgress?: (progress: WrapperProgress) => void;
  /** Callback when content completes */
  onComplete?: (result: WrapperResult) => void;
  /** Callback to commit/persist data */
  onCommit?: (data: {
    format: ContentFormat;
    cmiData?: Record<string, unknown>;
    statements?: unknown[];
    stateData?: Record<string, unknown>;
  }) => Promise<void>;
}

/**
 * Content wrapper hook return type.
 */
export interface UseContentWrapperReturn {
  /** Current state */
  state: ContentWrapperState;
  /** The wrapper instance */
  wrapper: ContentWrapper | null;
  /** Initialize wrapper with iframe window */
  initializeWrapper: (iframeWindow: Window) => Promise<void>;
  /** Terminate wrapper */
  terminateWrapper: () => Promise<void>;
  /** Force commit */
  commitWrapper: () => Promise<void>;
  /** Update progress (for HTML5/PDF/Native) */
  updateProgress: (percent: number) => void;
  /** Set page (for PDF) */
  setPage: (page: number, totalPages?: number) => void;
  /** Mark complete (for HTML5/Native) */
  markComplete: () => void;
  /** Detect content format */
  detectFormat: () => Promise<ContentManifest | null>;
}

/**
 * Hook for managing content format wrappers.
 */
export function useContentWrapper(config: UseContentWrapperConfig): UseContentWrapperReturn {
  const [state, setState] = useState<ContentWrapperState>({
    format: null,
    manifest: null,
    isInitialized: false,
    isTerminated: false,
    progress: null,
    result: null,
    isLoading: false,
    error: null,
  });

  const wrapperRef = useRef<ContentWrapper | null>(null);
  const configRef = useRef(config);

  // Keep config ref updated
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  /**
   * Detect content format from URL.
   */
  const detectFormat = useCallback(async (): Promise<ContentManifest | null> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      let manifest: ContentManifest;

      if (config.isSingleFile) {
        // Single file detection (PDF, HTML)
        manifest = detectContentFormatFromUrl(config.contentUrl);
      } else {
        // Package detection
        const result = await detectContentFormatFromStorage(config.contentUrl);
        if (!result.success || !result.manifest) {
          throw new Error(result.error ?? 'Failed to detect content format');
        }
        manifest = result.manifest;
      }

      setState((prev) => ({
        ...prev,
        format: manifest.format,
        manifest,
        isLoading: false,
      }));

      return manifest;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Detection failed';
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return null;
    }
  }, [config.contentUrl, config.isSingleFile]);

  /**
   * Create wrapper configuration based on format.
   */
  const createWrapperConfig = useCallback(
    (format: ContentFormat, manifest: ContentManifest): WrapperConfig => {
      const baseConfig = {
        tenantId: configRef.current.tenantId,
        enrollmentId: configRef.current.enrollmentId,
        learnerId: configRef.current.learnerId,
        courseId: configRef.current.courseId,
        onProgress: (progress: WrapperProgress) => {
          setState((prev) => ({ ...prev, progress }));
          configRef.current.onProgress?.(progress);
        },
        onComplete: (result: WrapperResult) => {
          setState((prev) => ({ ...prev, result }));
          configRef.current.onComplete?.(result);
        },
        onError: (error: { code: string; message: string; diagnostic?: string }) => {
          setState((prev) => ({ ...prev, error: `${error.code}: ${error.message}` }));
        },
        onCommit: configRef.current.onCommit,
      };

      switch (format) {
        case 'scorm_12':
          return {
            ...baseConfig,
            format: 'scorm_12',
            initialData: configRef.current.initialScormData as Scorm12DataModel | undefined,
          };

        case 'scorm_2004':
          return {
            ...baseConfig,
            format: 'scorm_2004',
            edition: manifest.scormVersion?.includes('4th')
              ? '4th'
              : manifest.scormVersion?.includes('2nd')
                ? '2nd'
                : '3rd',
            initialData: configRef.current.initialScormData as Scorm2004DataModel | undefined,
          };

        case 'xapi':
          if (!configRef.current.lrsEndpoint || !configRef.current.lrsAuth) {
            throw new Error('LRS endpoint and auth required for xAPI');
          }
          if (!configRef.current.actor) {
            throw new Error('Actor required for xAPI');
          }
          return {
            ...baseConfig,
            format: 'xapi',
            lrsEndpoint: configRef.current.lrsEndpoint,
            lrsAuth: configRef.current.lrsAuth,
            activityId: manifest.activityId ?? configRef.current.courseId,
            actor: {
              objectType: 'Agent',
              name: configRef.current.actor.name,
              mbox: configRef.current.actor.mbox,
              account: configRef.current.actor.account,
            },
          };

        case 'cmi5':
          if (!configRef.current.cmi5FetchUrl || !configRef.current.cmi5AuthToken) {
            throw new Error('cmi5 fetch URL and auth token required');
          }
          if (!configRef.current.lrsEndpoint || !configRef.current.actor) {
            throw new Error('LRS endpoint and actor required for cmi5');
          }
          return {
            ...baseConfig,
            format: 'cmi5',
            fetchUrl: configRef.current.cmi5FetchUrl,
            registrationId: configRef.current.enrollmentId,
            activityId: manifest.activityId ?? configRef.current.courseId,
            actor: {
              objectType: 'Agent',
              name: configRef.current.actor.name,
              mbox: configRef.current.actor.mbox,
              account: configRef.current.actor.account,
            },
            lrsEndpoint: configRef.current.lrsEndpoint,
            authToken: configRef.current.cmi5AuthToken,
          };

        case 'aicc':
          if (!configRef.current.aiccUrl || !configRef.current.aiccSessionId) {
            throw new Error('AICC URL and session ID required');
          }
          return {
            ...baseConfig,
            format: 'aicc',
            aiccUrl: configRef.current.aiccUrl,
            sessionId: configRef.current.aiccSessionId,
          };

        case 'html5':
          return {
            ...baseConfig,
            format: 'html5',
          };

        case 'pdf':
          return {
            ...baseConfig,
            format: 'pdf',
          };

        case 'native':
          return {
            ...baseConfig,
            format: 'native',
          };

        default: {
          const exhaustiveCheck: never = format;
          throw new Error(`Unsupported format: ${exhaustiveCheck}`);
        }
      }
    },
    [],
  );

  /**
   * Initialize wrapper with iframe window.
   */
  const initializeWrapper = useCallback(
    async (iframeWindow: Window): Promise<void> => {
      if (wrapperRef.current) {
        // Already initialized
        return;
      }

      const { format, manifest } = state;
      if (!format || !manifest) {
        throw new Error('Content format not detected. Call detectFormat() first.');
      }

      try {
        const wrapperConfig = createWrapperConfig(format, manifest);
        const wrapper = createWrapper(format, wrapperConfig);

        await wrapper.initialize(iframeWindow);

        wrapperRef.current = wrapper;
        setState((prev) => ({
          ...prev,
          isInitialized: true,
          progress: wrapper.getProgress(),
        }));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Initialization failed';
        setState((prev) => ({ ...prev, error: errorMessage }));
        throw error;
      }
    },
    [state, createWrapperConfig],
  );

  /**
   * Terminate wrapper.
   */
  const terminateWrapper = useCallback(async (): Promise<void> => {
    if (!wrapperRef.current || state.isTerminated) return;

    try {
      await wrapperRef.current.terminate();
      setState((prev) => ({
        ...prev,
        isTerminated: true,
        result: wrapperRef.current?.getResult() ?? null,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Termination failed';
      setState((prev) => ({ ...prev, error: errorMessage }));
    }
  }, [state.isTerminated]);

  /**
   * Force commit.
   */
  const commitWrapper = useCallback(async (): Promise<void> => {
    if (!wrapperRef.current || !state.isInitialized) return;

    try {
      await wrapperRef.current.commit();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Commit failed';
      setState((prev) => ({ ...prev, error: errorMessage }));
    }
  }, [state.isInitialized]);

  /**
   * Update progress (for HTML5/Native wrappers).
   */
  const updateProgress = useCallback((percent: number): void => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    if (isHtml5Wrapper(wrapper)) {
      wrapper.updateProgress(percent);
    } else if (isNativeWrapper(wrapper)) {
      wrapper.updateProgress(percent);
    }
  }, []);

  /**
   * Set page (for PDF wrapper).
   */
  const setPage = useCallback((page: number, totalPages?: number): void => {
    const wrapper = wrapperRef.current;
    if (!wrapper || !isPdfWrapper(wrapper)) return;

    if (totalPages !== undefined) {
      wrapper.setTotalPages(totalPages);
    }
    wrapper.setCurrentPage(page);
  }, []);

  /**
   * Mark complete (for HTML5/Native wrappers).
   */
  const markComplete = useCallback((): void => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    if (isHtml5Wrapper(wrapper)) {
      wrapper.markComplete();
    } else if (isNativeWrapper(wrapper)) {
      wrapper.markComplete();
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wrapperRef.current && !state.isTerminated) {
        wrapperRef.current.terminate().catch(() => {
          // Ignore errors during cleanup
        });
      }
    };
  }, [state.isTerminated]);

  return {
    state,
    wrapper: wrapperRef.current,
    initializeWrapper,
    terminateWrapper,
    commitWrapper,
    updateProgress,
    setPage,
    markComplete,
    detectFormat,
  };
}
