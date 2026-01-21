'use client';

/**
 * usePublishing - Hook for managing lesson publishing and export operations
 *
 * Wraps the PublishingService to provide React-friendly state management
 * for export jobs, progress tracking, and download handling.
 */

import { useCallback, useState } from 'react';
import type { LessonData } from '@/lib/publishing/generators';
import {
  createDefaultConfig,
  getPublishingService,
  type PublishingCallbacks,
} from '@/lib/publishing/publishing-service';
import type {
  ExportConfig,
  ExportFormat,
  PublishingJob,
  PublishingStatus,
  ValidationResult,
} from '@/types/studio/publishing';

// =============================================================================
// TYPES
// =============================================================================

export interface UsePublishingState {
  /** Current active job (if any) */
  currentJob: PublishingJob | null;
  /** Publishing status */
  status: PublishingStatus | 'idle';
  /** Progress percentage (0-100) */
  progress: number;
  /** Current step description */
  currentStep: string;
  /** Whether publishing is in progress */
  isPublishing: boolean;
  /** Error message if failed */
  error: string | null;
  /** Warnings from the job */
  warnings: string[];
  /** Validation result (if validated) */
  validationResult: ValidationResult | null;
  /** Download URL when complete */
  downloadUrl: string | null;
  /** Package file name */
  fileName: string | null;
}

export interface UsePublishingActions {
  /** Start a new publishing job */
  publish: (config: ExportConfig, lesson: LessonData) => Promise<PublishingJob>;
  /** Validate a lesson for export without publishing */
  validate: (config: ExportConfig, lesson: LessonData) => Promise<ValidationResult>;
  /** Cancel the current job */
  cancel: () => boolean;
  /** Download the generated package */
  download: () => void;
  /** Reset the state */
  reset: () => void;
  /** Create default config for a format */
  createConfig: (format: ExportFormat, lesson: LessonData) => ExportConfig;
  /** Get expected file name */
  getFileName: (config: ExportConfig, lesson: LessonData) => string;
}

export type UsePublishingReturn = UsePublishingState & UsePublishingActions;

// =============================================================================
// INITIAL STATE
// =============================================================================

const initialState: UsePublishingState = {
  currentJob: null,
  status: 'idle',
  progress: 0,
  currentStep: '',
  isPublishing: false,
  error: null,
  warnings: [],
  validationResult: null,
  downloadUrl: null,
  fileName: null,
};

// =============================================================================
// HOOK
// =============================================================================

export function usePublishing(): UsePublishingReturn {
  const [state, setState] = useState<UsePublishingState>(initialState);

  /**
   * Start a new publishing job.
   */
  const publish = useCallback(
    async (config: ExportConfig, lesson: LessonData): Promise<PublishingJob> => {
      const service = getPublishingService();
      const fileName = service.getPackageFileName(config, lesson);

      // Reset state and set publishing
      setState({
        ...initialState,
        status: 'pending',
        isPublishing: true,
        fileName,
      });

      const callbacks: PublishingCallbacks = {
        onProgress: (progress, step) => {
          setState((prev) => ({
            ...prev,
            progress,
            currentStep: step,
          }));
        },
        onStatusChange: (status) => {
          setState((prev) => ({
            ...prev,
            status,
          }));
        },
        onComplete: (_result) => {
          // Result is available, job has outputUrl
        },
        onError: (error) => {
          setState((prev) => ({
            ...prev,
            status: 'failed',
            isPublishing: false,
            error,
          }));
        },
      };

      const job = await service.publish(config, lesson, callbacks);

      // Update state with job
      setState((prev) => ({
        ...prev,
        currentJob: job,
      }));

      // Poll for completion (the service updates the job object)
      const pollInterval = setInterval(() => {
        const currentJob = service.getJob(job.id);
        if (!currentJob) {
          clearInterval(pollInterval);
          return;
        }

        setState((prev) => ({
          ...prev,
          currentJob,
          status: currentJob.status,
          progress: currentJob.progress,
          currentStep: currentJob.currentStep,
          warnings: currentJob.warnings,
        }));

        if (currentJob.status === 'completed') {
          clearInterval(pollInterval);
          setState((prev) => ({
            ...prev,
            isPublishing: false,
            downloadUrl: currentJob.outputUrl || null,
          }));
        } else if (currentJob.status === 'failed' || currentJob.status === 'cancelled') {
          clearInterval(pollInterval);
          setState((prev) => ({
            ...prev,
            isPublishing: false,
            error: currentJob.error || null,
          }));
        }
      }, 100);

      return job;
    },
    [],
  );

  /**
   * Validate a lesson for export without publishing.
   */
  const validate = useCallback(
    async (config: ExportConfig, lesson: LessonData): Promise<ValidationResult> => {
      const service = getPublishingService();

      setState((prev) => ({
        ...prev,
        status: 'validating',
        currentStep: 'Validating lesson...',
      }));

      const result = await service.validate(config, lesson);

      setState((prev) => ({
        ...prev,
        status: result.isValid ? 'idle' : 'failed',
        validationResult: result,
        error: result.isValid
          ? null
          : result.issues
              .filter((i) => i.severity === 'error')
              .map((i) => i.message)
              .join('; '),
      }));

      return result;
    },
    [],
  );

  /**
   * Cancel the current job.
   */
  const cancel = useCallback((): boolean => {
    if (!state.currentJob) return false;

    const service = getPublishingService();
    const cancelled = service.cancelJob(state.currentJob.id);

    if (cancelled) {
      setState((prev) => ({
        ...prev,
        status: 'cancelled',
        isPublishing: false,
        currentStep: 'Cancelled',
      }));
    }

    return cancelled;
  }, [state.currentJob]);

  /**
   * Download the generated package.
   */
  const download = useCallback(() => {
    if (!state.downloadUrl || !state.fileName) return;

    const a = document.createElement('a');
    a.href = state.downloadUrl;
    a.download = state.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [state.downloadUrl, state.fileName]);

  /**
   * Reset the state.
   */
  const reset = useCallback(() => {
    // Revoke any existing blob URL to free memory
    if (state.downloadUrl) {
      URL.revokeObjectURL(state.downloadUrl);
    }
    setState(initialState);
  }, [state.downloadUrl]);

  /**
   * Create default config for a format.
   */
  const createConfig = useCallback((format: ExportFormat, lesson: LessonData): ExportConfig => {
    return createDefaultConfig(format, lesson);
  }, []);

  /**
   * Get expected file name for a package.
   */
  const getFileName = useCallback((config: ExportConfig, lesson: LessonData): string => {
    const service = getPublishingService();
    return service.getPackageFileName(config, lesson);
  }, []);

  return {
    // State
    ...state,
    // Actions
    publish,
    validate,
    cancel,
    download,
    reset,
    createConfig,
    getFileName,
  };
}
