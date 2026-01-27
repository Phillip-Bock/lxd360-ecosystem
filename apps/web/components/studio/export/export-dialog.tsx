'use client';

/**
 * ExportDialog - Main export/publish dialog for lessons
 *
 * Provides a multi-step workflow for exporting lessons to
 * SCORM and xAPI formats with configuration options.
 */

import { ChevronLeft, ChevronRight, Download, FileCheck, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePublishing } from '@/hooks/studio/use-publishing';
import type { LessonData } from '@/lib/publishing/generators';
import { cn } from '@/lib/utils';
import type {
  ExportConfig,
  ExportFormat,
  ScormExportConfig,
  XAPIExportConfig,
} from '@/types/studio/publishing';
import { ExportProgress } from './export-progress';
import { FormatSelector } from './format-selector';
import { ScormConfigForm } from './scorm-config-form';
import { ValidationResults } from './validation-results';
import { XAPIConfigForm } from './xapi-config-form';

// =============================================================================
// TYPES
// =============================================================================

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lesson: LessonData;
}

type ExportStep = 'format' | 'configure' | 'validate' | 'export';

// =============================================================================
// COMPONENT
// =============================================================================

export function ExportDialog({ open, onOpenChange, lesson }: ExportDialogProps) {
  const [step, setStep] = useState<ExportStep>('format');
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('scorm_2004_3rd');
  const [config, setConfig] = useState<ExportConfig | null>(null);

  const {
    status,
    progress,
    currentStep,
    isPublishing,
    error,
    warnings,
    validationResult,
    // downloadUrl - reserved for future use
    fileName,
    publish,
    validate,
    download,
    reset,
    createConfig,
  } = usePublishing();

  // Initialize config when format changes
  useEffect(() => {
    if (selectedFormat) {
      const newConfig = createConfig(selectedFormat, lesson);
      setConfig(newConfig);
    }
  }, [selectedFormat, lesson, createConfig]);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setStep('format');
      reset();
    }
  }, [open, reset]);

  const handleNext = useCallback(async () => {
    if (step === 'format') {
      setStep('configure');
    } else if (step === 'configure') {
      setStep('validate');
      // Auto-validate when entering validate step
      if (config) {
        await validate(config, lesson);
      }
    } else if (step === 'validate') {
      setStep('export');
      // Start export when entering export step
      if (config) {
        await publish(config, lesson);
      }
    }
  }, [step, config, lesson, validate, publish]);

  const handleBack = useCallback(() => {
    if (step === 'configure') {
      setStep('format');
    } else if (step === 'validate') {
      setStep('configure');
    } else if (step === 'export' && !isPublishing) {
      setStep('validate');
      reset();
    }
  }, [step, isPublishing, reset]);

  const handleClose = useCallback(() => {
    if (!isPublishing) {
      onOpenChange(false);
    }
  }, [isPublishing, onOpenChange]);

  const isScormFormat = selectedFormat.startsWith('scorm_');
  const isXapiFormat = selectedFormat === 'xapi';

  const canProceed = () => {
    if (step === 'format') return true;
    if (step === 'configure') return config !== null;
    if (step === 'validate') return validationResult?.isValid ?? false;
    return false;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] bg-(--studio-surface) border-white/10 p-0 gap-0">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Download className="h-5 w-5 text-primary" />
                Export Lesson
              </DialogTitle>
              <DialogDescription className="mt-1">
                Package your lesson for delivery to an LMS
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              disabled={isPublishing}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Step Tabs */}
          <Tabs value={step} className="mt-4">
            <TabsList className="grid grid-cols-4 bg-white/5">
              <TabsTrigger
                value="format"
                disabled={isPublishing}
                onClick={() => !isPublishing && setStep('format')}
                className={cn(
                  'data-[state=active]:bg-primary/20 data-[state=active]:text-primary',
                  step !== 'format' && 'cursor-pointer',
                )}
              >
                1. Format
              </TabsTrigger>
              <TabsTrigger
                value="configure"
                disabled={isPublishing || step === 'format'}
                onClick={() => !isPublishing && step !== 'format' && setStep('configure')}
                className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
              >
                2. Configure
              </TabsTrigger>
              <TabsTrigger
                value="validate"
                disabled={isPublishing || step === 'format' || step === 'configure'}
                onClick={() =>
                  !isPublishing && step !== 'format' && step !== 'configure' && setStep('validate')
                }
                className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
              >
                3. Validate
              </TabsTrigger>
              <TabsTrigger
                value="export"
                disabled={true}
                className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
              >
                4. Export
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </DialogHeader>

        {/* Content */}
        <ScrollArea className="flex-1 max-h-[50vh]">
          <div className="p-6">
            {/* Format Selection */}
            {step === 'format' && (
              <FormatSelector value={selectedFormat} onChange={setSelectedFormat} />
            )}

            {/* Configuration */}
            {step === 'configure' && config && (
              <div>
                {isScormFormat && (
                  <ScormConfigForm
                    config={config as ScormExportConfig}
                    onChange={(c) => setConfig(c)}
                  />
                )}
                {isXapiFormat && (
                  <XAPIConfigForm
                    config={config as XAPIExportConfig}
                    onChange={(c) => setConfig(c)}
                  />
                )}
              </div>
            )}

            {/* Validation */}
            {step === 'validate' && (
              <div className="space-y-4">
                {validationResult ? (
                  <ValidationResults result={validationResult} />
                ) : (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <FileCheck className="h-12 w-12 text-zinc-500 mx-auto mb-4" />
                      <p className="text-zinc-400">Validating lesson...</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Export Progress */}
            {step === 'export' && (
              <ExportProgress
                status={status}
                progress={progress}
                currentStep={currentStep}
                fileName={fileName}
                error={error}
                warnings={warnings}
                onDownload={download}
                onReset={() => {
                  reset();
                  setStep('format');
                }}
              />
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        {step !== 'export' && (
          <div className="flex items-center justify-between p-6 border-t border-white/10">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 'format' || isPublishing}
              className="border-white/10 gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>

            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleClose} className="border-white/10">
                Cancel
              </Button>
              <Button
                onClick={handleNext}
                disabled={!canProceed() || isPublishing}
                className="gap-2"
              >
                {step === 'validate' ? (
                  <>
                    <Download className="h-4 w-4" />
                    Export
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
